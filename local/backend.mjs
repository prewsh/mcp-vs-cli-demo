// Shared local deployment service. Both adapters call these exact endpoints.
import http from 'node:http';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {appendFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const stateDir = process.env.LAB_STATE_DIR;
const gunicorn = process.env.LAB_GUNICORN;
const appDir = process.env.LAB_APP_DIR;
if (!stateDir || !gunicorn || !appDir) throw new Error('LAB_STATE_DIR, LAB_GUNICORN and LAB_APP_DIR are required');
const project = {id: 'local-demo-project', name: 'mcp-cli-demo'};
const deployments = new Map();
let nextID = 1;
const audit = (entry) => appendFileSync(resolve(stateDir, 'audit.jsonl'), JSON.stringify({time:new Date().toISOString(),...entry})+'\n');
const freePort = () => new Promise((done, reject) => {
  const socket = net.createServer();socket.on('error',reject);
  socket.listen(0,'127.0.0.1',()=>{const port=socket.address().port;socket.close(()=>done(port));});
});
function view(d) {
  return {id:d.id, project_id:project.id, status:d.status, url:d.url, created_at:d.created_at, error:d.error ?? null};
}
async function status(d) {
  if (d.status === 'starting') {
    try {
      const response=await fetch(d.url+'/health',{signal:AbortSignal.timeout(1000)});
      const body=await response.json();
      if (response.ok && body.status==='ok') d.status='succeeded';
    } catch { /* Remain starting while the worker binds. */ }
  }
  return view(d);
}
async function deploy() {
  if ([...deployments.values()].some(d=>d.status==='starting')) throw new Error('A deployment is already starting');
  for (const d of deployments.values()) if (d.child.exitCode===null) d.child.kill('SIGTERM');
  const port=await freePort();
  const env={...process.env,PORT:String(port)};delete env.DEMO_GREETING;
  const child=spawn(gunicorn,['--workers','1','--bind',`127.0.0.1:${port}`,'app:app'],{cwd:appDir,env,stdio:['ignore','pipe','pipe']});
  const d={id:`deployment-${nextID++}`,status:'starting',url:`http://127.0.0.1:${port}`,created_at:new Date().toISOString(),logs:'',child};
  const log=(data)=>{d.logs+=data.toString();writeFileSync(resolve(stateDir,d.id+'.log'),d.logs);};
  child.stdout.on('data',log);child.stderr.on('data',log);
  child.on('error',error=>{d.status='failed';d.error=error.message;});
  child.on('exit',(code,signal)=>{
    d.status='failed';d.error=`Process exited (code=${code}, signal=${signal})`;
  });
  deployments.set(d.id,d);
  return view(d);
}
const send=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  const event={method:req.method,path:url.pathname,query:url.search,interface:req.headers['x-lab-interface']??'unlabelled'};
  try {
    const host=req.headers.host??'';
    if (!host.startsWith('127.0.0.1:')) {send(res,403,{error:'loopback host required'});return;}
    if (req.method==='GET' && url.pathname==='/health') {send(res,200,{status:'ok'});return;}
    if (req.method==='GET' && url.pathname==='/projects') {audit({...event,outcome:'ok'});send(res,200,{projects:[project]});return;}
    if (req.method==='POST' && url.pathname===`/projects/${project.id}/deploy`) {
      const data=await deploy();audit({...event,outcome:'ok',deployment_id:data.id});send(res,202,data);return;
    }
    const match=url.pathname.match(/^\/deployments\/([^/]+)(\/logs)?$/);
    if (req.method==='GET' && match) {
      const d=deployments.get(match[1]);if(!d){audit({...event,outcome:'not_found'});send(res,404,{error:'Unknown deployment'});return;}
      if (match[2]) {
        const tail=Number(url.searchParams.get('tail')??100);
        if(!Number.isInteger(tail)||tail<1||tail>1000){audit({...event,outcome:'invalid'});send(res,400,{error:'tail must be an integer from 1 to 1000'});return;}
        const data={deployment_id:d.id,lines:d.logs.trimEnd().split('\n').filter(Boolean).slice(-tail)};
        audit({...event,outcome:'ok',deployment_id:d.id});send(res,200,data);return;
      }
      const data=await status(d);audit({...event,outcome:'ok',deployment_id:d.id,status:data.status});send(res,200,data);return;
    }
    audit({...event,outcome:'not_found'});send(res,404,{error:'Unknown project or operation'});
  } catch(error) {audit({...event,outcome:'error',error:error.message});send(res,409,{error:error.message});}
});
server.listen(0,'127.0.0.1',()=>{
  const data={url:`http://127.0.0.1:${server.address().port}`,pid:process.pid};
  writeFileSync(resolve(stateDir,'backend.json'),JSON.stringify(data));console.error('Local backend ready');
});
async function stop() {
  for(const d of deployments.values()) if(d.child.exitCode===null)d.child.kill('SIGTERM');
  server.close();setTimeout(()=>process.exit(0),1000).unref();
}
process.on('SIGTERM',stop);process.on('SIGINT',stop);

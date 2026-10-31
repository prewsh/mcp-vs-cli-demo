import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
const here=dirname(fileURLToPath(import.meta.url));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function lab() {
 const state=await mkdtemp(resolve(tmpdir(),'mcp-cli-test-'));
 const gunicorn=process.env.LAB_GUNICORN??resolve(here,'../.venv/bin/gunicorn');
 const child=spawn(process.execPath,[resolve(here,'backend.mjs')],{env:{...process.env,LAB_STATE_DIR:state,LAB_GUNICORN:gunicorn,LAB_APP_DIR:resolve(here,'..')},stdio:'ignore'});
 let url;
 for(let n=0;n<100;n++){try{url=JSON.parse(await readFile(resolve(state,'backend.json'),'utf8')).url;break;}catch{await sleep(30);}}
 assert.ok(url,'backend started');
 return {url,state,close:async()=>{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await rm(state,{recursive:true,force:true});}};
}
async function cli(url,args){
 const p=spawn(process.execPath,[resolve(here,'cli.mjs'),...args],{env:{...process.env,LAB_URL:url}});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);
 const code=await new Promise(r=>p.once('exit',r));return {code,out,err};
}
for(const adapter of ['cli','mcp'])test(`${adapter}: real process deployment, status, bounded logs, failures`,async()=>{
 const backend=await lab();let client;
 try{
  let call;
  if(adapter==='mcp'){
   client=new Client({name:'local-integration-test',version:'1.0.0'});
   await client.connect(new StdioClientTransport({command:process.execPath,args:[resolve(here,'server.mjs')],env:{...process.env,LAB_URL:backend.url}}));
   const inventory=await client.listTools();assert.equal(inventory.tools.length,4);
   call=async(name,args={})=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return r.structuredContent;};
  }else call=async(name,args={})=>{
   const map={list_projects:['projects','list'],deploy_project:['projects','deploy','--project-id',args.project_id],get_deployment:['deployments','status','--deployment-id',args.deployment_id],get_runtime_logs:['deployments','logs','--deployment-id',args.deployment_id,'--tail',String(args.tail??100)]};
   const r=await cli(backend.url,map[name]);assert.equal(r.code,0,r.err);return JSON.parse(r.out);
  };
  const projects=await call('list_projects');assert.equal(projects.projects[0].name,'mcp-cli-demo');
  const d=await call('deploy_project',{project_id:projects.projects[0].id});assert.equal(d.status,'starting');
  let current;
  for(let n=0;n<100;n++){current=await call('get_deployment',{deployment_id:d.id});if(current.status!=='starting')break;await sleep(50);}
  assert.equal(current.status,'succeeded',JSON.stringify(current));
  const health=await (await fetch(current.url+'/health')).json();assert.deepEqual(health,{status:'ok'});
  const logs=await call('get_runtime_logs',{deployment_id:d.id,tail:100});assert.equal(logs.lines.filter(x=>x.includes('ERROR mcp-cli-demo: DEMO_GREETING')).length,1);
  const bounded=await call('get_runtime_logs',{deployment_id:d.id,tail:1});assert.equal(bounded.lines.length,1);
  if(adapter==='mcp'){
   const bad=await client.callTool({name:'get_deployment',arguments:{deployment_id:'missing'}});assert.equal(bad.isError,true);
  }else{
   assert.notEqual((await cli(backend.url,['deployments','status','--deployment-id','missing'])).code,0);
   assert.notEqual((await cli(backend.url,['projects','deploy'])).code,0);
  }
 }finally{await client?.close();await backend.close();}
});

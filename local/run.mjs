#!/usr/bin/env node
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,copyFile,mkdtemp,symlink} from 'node:fs/promises';
import {createWriteStream,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {homedir,userInfo} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'..');
const condition=process.argv[2];if(!['A','B','C'].includes(condition))throw new Error('Usage: node local/run.mjs A|B|C');
const model=process.env.MODEL??'gpt-6.1-sol',effort=process.env.EFFORT??'high';
const codex=process.env.CODEX_BIN??spawnSync('/bin/sh',['-c','command -v codex'],{encoding:'utf8'}).stdout.trim();
if(!codex||!existsSync(codex))throw new Error('Set CODEX_BIN to the Codex executable');
const gunicorn=process.env.LAB_GUNICORN??resolve(repo,'.venv/bin/gunicorn');
if(!existsSync(gunicorn))throw new Error('Run local/setup.sh first');
const runtime=process.env.LAB_ROOT??resolve(homedir(),'mcp-vs-cli-local-exp-v2');
await mkdir(runtime,{recursive:true,mode:0o700});
const controls={model,effort,sandbox:'workspace-write+network',codex:spawnSync(codex,['--version'],{encoding:'utf8'}).stdout.trim(),node:process.version,sha256:{}};
for(const path of ['app.py','requirements.txt','local/backend.mjs','local/client.mjs','local/cli.mjs','local/server.mjs','local/prompt.txt','local/AGENTS.cli.md','local/package-lock.json','local/run.mjs','local/count_actions.py'])controls.sha256[path]=createHash('sha256').update(await readFile(resolve(repo,path))).digest('hex');
const controlsPath=resolve(runtime,'controls.json');
if(existsSync(controlsPath)){
 if(JSON.stringify(JSON.parse(await readFile(controlsPath,'utf8')))!==JSON.stringify(controls))throw new Error('Controls changed. Use a new LAB_ROOT for a new series.');
}else await writeFile(controlsPath,JSON.stringify(controls,null,2),{flag:'wx'});
const stamp=new Date().toISOString().replaceAll(':','').replaceAll('.','');
const runID=`run-${condition}-${stamp}`,run=await mkdtemp(resolve(runtime,runID+'-'));
const evidence=resolve(here,'results',runID);await mkdir(evidence,{recursive:true});
const work=resolve(run,'work'),agentHome=resolve(run,'agent-home'),codexHome=resolve(run,'codex-home'),bin=resolve(run,'bin'),state=resolve(run,'backend');
for(const dir of [work,agentHome,codexHome,bin,state,resolve(run,'tmp')])await mkdir(dir);
await copyFile(process.env.CODEX_AUTH_SOURCE??resolve(homedir(),'.codex/auth.json'),resolve(codexHome,'auth.json'));
await copyFile(resolve(here,'prompt.txt'),resolve(evidence,'prompt.txt'));
if(condition==='C'){
 await copyFile(resolve(here,'AGENTS.cli.md'),resolve(work,'AGENTS.md'));
 await copyFile(resolve(here,'AGENTS.cli.md'),resolve(evidence,'AGENTS.md'));
}
if(condition!=='B'){
 await copyFile(resolve(here,'cli.mjs'),resolve(bin,'democtl'));
 await copyFile(resolve(here,'client.mjs'),resolve(bin,'client.mjs'));
 const {chmod}=await import('node:fs/promises');await chmod(resolve(bin,'democtl'),0o755);
 await symlink(process.execPath,resolve(bin,'node'));
 await writeFile(resolve(bin,'package.json'),JSON.stringify({type:'module'}));
}
const backendLog=createWriteStream(resolve(evidence,'backend-stderr.log'));
const backend=spawn(process.execPath,[resolve(here,'backend.mjs')],{env:{...process.env,LAB_STATE_DIR:state,LAB_GUNICORN:gunicorn,LAB_APP_DIR:repo},stdio:['ignore','ignore','pipe']});backend.stderr.pipe(backendLog);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let agent;
try{
 let url;
 for(let i=0;i<100;i++){try{url=JSON.parse(await readFile(resolve(state,'backend.json'),'utf8')).url;break;}catch{await sleep(50);}}
 if(!url)throw new Error('Local backend failed to start');
 const config=`approval_policy = "never"
web_search = "disabled"
allow_login_shell = false
cli_auth_credentials_store = "file"
suppress_unstable_features_warning = true
[features]
apps = false
plugins = false
memories = false
multi_agent = false
browser_use = false
computer_use = false
skip_host_skill_discovery = true
`+(condition==='B'?`\n[mcp_servers.local_lab]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${JSON.stringify(resolve(here,'server.mjs'))}]\nrequired = true\ndefault_tools_approval_mode = "approve"\nenabled_tools = ["list_projects", "deploy_project", "get_deployment", "get_runtime_logs"]\n[mcp_servers.local_lab.env]\nLAB_URL = ${JSON.stringify(url)}\n`: '');
 await writeFile(resolve(codexHome,'config.toml'),config);
 // Capture the actual tool inventory before the model runs. This calls no backend operations.
 if(condition==='B'){
  const inventory=new Client({name:'inventory-capture',version:'1.0.0'});
  try{
   await inventory.connect(new StdioClientTransport({command:process.execPath,args:[resolve(here,'server.mjs')],env:{LAB_URL:url,PATH:'/usr/bin:/bin'}}));
   await writeFile(resolve(evidence,'tools.json'),JSON.stringify(await inventory.listTools(),null,2));
  }finally{await inventory.close();}
 }else{
  await writeFile(resolve(evidence,'cli-help.txt'),spawnSync(process.execPath,[resolve(here,'cli.mjs'),'--help'],{encoding:'utf8'}).stdout);
 }
 const env={HOME:agentHome,USER:userInfo().username,PATH:(condition==='B'?'':bin+':')+'/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR:resolve(run,'tmp')+'/',LANG:'en_US.UTF-8',TZ:'Africa/Lagos',CODEX_HOME:codexHome,LAB_URL:url};
 const trace=createWriteStream(resolve(evidence,'trace.jsonl')),stderr=createWriteStream(resolve(evidence,'stderr.log'));
 const started=new Date();console.log(`Starting local ${condition}: ${model}, ${effort}. Evidence: ${evidence}`);
 agent=spawn(codex,['exec','--strict-config','--json','--ephemeral','--skip-git-repo-check','--ignore-rules','-C',work,'-m',model,'-s','workspace-write','-c','sandbox_workspace_write.network_access=true','-c',`model_reasoning_effort=${JSON.stringify(effort)}`,'-o',resolve(evidence,'final-answer.md'),'-'],{env,stdio:['pipe','pipe','pipe']});
 agent.stdin.end(await readFile(resolve(here,'prompt.txt')));agent.stdout.pipe(trace);agent.stderr.pipe(stderr);
 let timedOut=false;const timer=setTimeout(()=>{timedOut=true;agent.kill('SIGTERM');},240000);
 const exit=await new Promise((done,reject)=>{agent.once('error',reject);agent.once('close',(code,signal)=>done({code,signal}));});clearTimeout(timer);
 await Promise.all([new Promise(r=>trace.end(r)),new Promise(r=>stderr.end(r))]);
 const ended=new Date();
 const audit=existsSync(resolve(state,'audit.jsonl'))?await readFile(resolve(state,'audit.jsonl'),'utf8'):'';
 await writeFile(resolve(evidence,'audit.jsonl'),audit);
 const requests=audit.trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
 const deployments=requests.filter(x=>x.method==='POST'&&x.outcome==='ok').map(x=>x.deployment_id);
 const verification=[];
 for(const id of deployments){
  const status=await (await fetch(url+`/deployments/${id}`,{headers:{'X-Lab-Interface':'verifier'}})).json();
  const logs=await (await fetch(url+`/deployments/${id}/logs`,{headers:{'X-Lab-Interface':'verifier'}})).json();
  const health=await (await fetch(status.url+'/health')).json().catch(()=>null);
  verification.push({deployment:status,health,planted_error_lines:logs.lines.filter(line=>line.includes('ERROR mcp-cli-demo: DEMO_GREETING')).length});
  await copyFile(resolve(state,id+'.log'),resolve(evidence,id+'.log'));
 }
 await writeFile(resolve(evidence,'verification.json'),JSON.stringify(verification,null,2));
 await writeFile(resolve(evidence,'metadata.json'),JSON.stringify({condition,model,effort,started:started.toISOString(),ended:ended.toISOString(),seconds:(ended-started)/1000,exit,timed_out:timedOut,backend_requests:requests.length,interface_tags:[...new Set(requests.map(x=>x.interface))],controls},null,2));
 const counter=spawnSync('/usr/bin/python3',[resolve(here,'count_actions.py'),resolve(evidence,'trace.jsonl'),'--json-output',resolve(evidence,'actions.json')],{encoding:'utf8'});
 await writeFile(resolve(evidence,'summary.md'),counter.stdout);if(counter.status!==0)throw new Error(counter.stderr);
 console.log(`Finished ${condition}: exit=${exit.code}, ${((ended-started)/1000).toFixed(1)} seconds, ${requests.length} backend requests.`);
 if(exit.code!==0||timedOut)process.exitCode=1;
}finally{
 if(agent&&agent.exitCode===null)agent.kill('SIGTERM');
 backend.kill('SIGTERM');await new Promise(r=>backend.once('exit',r));backendLog.end();
}

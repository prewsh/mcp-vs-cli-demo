#!/usr/bin/env node
import {request} from './client.mjs';
const args=process.argv.slice(2).filter(arg=>arg!=='--json');
const usage=`democtl 1.0.0: local deployment CLI (JSON output by default)

Commands:
  democtl projects list
  democtl projects deploy --project-id PROJECT_ID
  democtl deployments status --deployment-id DEPLOYMENT_ID
  democtl deployments logs --deployment-id DEPLOYMENT_ID [--tail 100]

Options: --help, -h, --version, --json (accepted; JSON is already the default)
All deployment/log commands require the IDs returned by the service.
`;
function option(name,required=false) {
  const index=args.indexOf(name),value=index<0?undefined:args[index+1];
  if(required&&(!value||value.startsWith('-')))throw new Error(`Required option: ${name}`);
  return value;
}
try {
  if(args.includes('--version')){console.log('democtl 1.0.0');process.exit(0);}
  if(!args.length||args.includes('--help')||args.includes('-h')){console.log(usage);process.exit(0);}
  const [group,verb]=args;
  const allowed={ 'projects list':[], 'projects deploy':['--project-id'], 'deployments status':['--deployment-id'], 'deployments logs':['--deployment-id','--tail'] }[`${group} ${verb}`];
  if(!allowed)throw new Error('Unknown command; use democtl --help');
  for(let i=2;i<args.length;i+=2){if(!allowed.includes(args[i])||!args[i+1]||args[i+1].startsWith('-'))throw new Error(`Invalid option: ${args[i]}`);}
  let data;
  if(group==='projects'&&verb==='list')data=await request('GET','/projects','cli');
  if(group==='projects'&&verb==='deploy')data=await request('POST',`/projects/${encodeURIComponent(option('--project-id',true))}/deploy`,'cli');
  if(group==='deployments'){
    const id=encodeURIComponent(option('--deployment-id',true));
    if(verb==='status')data=await request('GET',`/deployments/${id}`,'cli');
    else {
      const tail=Number(option('--tail')??100);if(!Number.isInteger(tail)||tail<1||tail>1000)throw new Error('tail must be an integer from 1 to 1000');
      data=await request('GET',`/deployments/${id}/logs?tail=${tail}`,'cli');
    }
  }
  console.log(JSON.stringify(data,null,2));
}catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}

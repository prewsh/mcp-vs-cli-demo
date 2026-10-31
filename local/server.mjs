import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import {request} from './client.mjs';

export function createServer() {
  const server=new McpServer({name:'local-deployment-lab',version:'1.0.0'});
  const tool=(name,description,inputSchema,method,path)=>server.registerTool(name,{description,inputSchema},async(args)=>{
    try{
      const data=await request(method,path(args),'mcp');
      return {content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data};
    }catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}
  });
  tool('list_projects','List projects in the local deployment service.',z.object({}),'GET',()=>'/projects');
  tool('deploy_project','Start a new local deployment of an existing project. Returns a deployment ID and initial status.',z.object({project_id:z.string().min(1)}),'POST',a=>`/projects/${encodeURIComponent(a.project_id)}/deploy`);
  tool('get_deployment','Get the status and application URL of a deployment.',z.object({deployment_id:z.string().min(1)}),'GET',a=>`/deployments/${encodeURIComponent(a.deployment_id)}`);
  tool('get_runtime_logs','Read a bounded snapshot of runtime logs for a deployment.',z.object({deployment_id:z.string().min(1),tail:z.number().int().min(1).max(1000).default(100)}),'GET',a=>`/deployments/${encodeURIComponent(a.deployment_id)}/logs?tail=${a.tail}`);
  return server;
}
await serveStdio(createServer);

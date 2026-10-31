export async function request(method,path,via) {
  const base=process.env.LAB_URL;
  if(!base || new URL(base).hostname!=='127.0.0.1')throw new Error('LAB_URL must point to the local lab');
  const response=await fetch(new URL(path,base),{method,headers:{'X-Lab-Interface':via},signal:AbortSignal.timeout(10000)});
  const data=await response.json();
  if(!response.ok || data.error)throw new Error(data.error??`HTTP ${response.status}`);
  return data;
}

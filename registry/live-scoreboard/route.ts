import { proxyAuraRequest } from '@/lib/aura/server';

type AuraRouteContext = {
  params:
    | { path: string[] }
    | Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: AuraRouteContext) {
  const { path } = await context.params;
  return proxyAuraRequest(request, path);
}

import { response,studio } from "../../../studio-server/runtime";export async function GET(){const x=await studio();return response(x.service.listApplications(x.actor))}

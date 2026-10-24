import { readFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const dir = path.join(process.cwd(), "data", "avatars");
  for (const ext of ["jpg", "png", "gif"] as const) {
    try {
      const body = await readFile(path.join(dir, `${session.user.id}.${ext}`));
      const type = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
      return new Response(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=60" } });
    } catch {
      continue;
    }
  }
  return new Response("Not found", { status: 404 });
}

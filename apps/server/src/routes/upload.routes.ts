import { Hono } from "hono";
import { env } from "@muluerp/env/server";

const uploadRoutes = new Hono();

// Upload image to Supabase
uploadRoutes.post("/", async (c) => {
  const { fileName, fileData, contentType, bucket } = await c.req.json<{
    fileName: string;
    fileData: string;
    contentType: string;
    bucket: string;
  }>();

  const supabaseUrl = env.SUPABASE_URL?.trim();
  // Use service role key for server-side uploads to bypass RLS (bucket policies)
  const supabaseKey = (
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY
  )?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return c.json({ error: "Supabase not configured" }, 500);
  }

  try {
    // Upload to Supabase Storage
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          Authorization: `Bearer ${supabaseKey}`,
          "x-upsert": "true",
        },
        body: Buffer.from(fileData, "base64"),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to upload file";
      try {
        const errJson = JSON.parse(errorText) as { message?: string; error?: string };
        errorMessage = errJson.message ?? errJson.error ?? (errorText || errorMessage);
      } catch {
        errorMessage = errorText || errorMessage;
      }
      if (errorMessage.toLowerCase().includes("signature verification failed")) {
        errorMessage =
          "Supabase key and URL are from different projects. SUPABASE_SERVICE_ROLE_KEY must be the service_role key from the same project as SUPABASE_URL (Dashboard → Project Settings → API).";
      }
      console.error("Supabase upload error:", response.status, errorMessage);
      return c.json({ error: errorMessage }, 500);
    }

    // Return the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;

    return c.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException };
    const cause = err.cause ?? err;
    const message =
      cause.code === "ENOTFOUND"
        ? `Cannot reach Supabase (${supabaseUrl}). Check SUPABASE_URL is correct, the project exists, and you have internet access.`
        : err instanceof Error
          ? err.message
          : "Upload failed";
    console.error("Upload error:", error);
    return c.json({ error: message }, 500);
  }
});

// Delete image from Supabase
uploadRoutes.post("/delete", async (c) => {
  const { url } = await c.req.json<{ url: string }>();

  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseKey = (
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY
  )?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return c.json({ error: "Supabase not configured" }, 500);
  }

  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucket = pathParts[2]; // /storage/v1/object/public/bucket-name/filename
    const fileName = pathParts.slice(3).join("/");

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return c.json({ error: "Failed to delete file" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json({ error: "Delete failed" }, 500);
  }
});

export default uploadRoutes;

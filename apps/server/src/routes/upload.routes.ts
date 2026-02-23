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

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;

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
      const error = await response.text();
      console.error("Supabase upload error:", error);
      return c.json({ error: "Failed to upload file" }, 500);
    }

    // Return the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;

    return c.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Delete image from Supabase
uploadRoutes.post("/delete", async (c) => {
  const { url } = await c.req.json<{ url: string }>();

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;

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

import { env } from "@muluerp/env/web"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const imageService = {
  upload: async (file: File): Promise<UploadResult> => {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const bucket = env.NEXT_PUBLIC_SUPABASE_BUCKET

    if (!supabaseUrl || !bucket) {
      return {
        success: false,
        error: "Supabase not configured. Please add SUPABASE_URL and SUPABASE_BUCKET to your .env file.",
      }
    }

    try {
      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const extension = file.name.split(".").pop() || "jpg"
      const fileName = `user-${timestamp}-${random}.${extension}`

      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove data URL prefix to get just the base64
          const base64 = result.split(",")[1]
          resolve(base64)
        }
        reader.onerror = reject
      })
      reader.readAsDataURL(file)

      const base64 = await base64Promise

      // Upload via Next.js API route (same-origin) which proxies to backend
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileData: base64,
          contentType: file.type,
          bucket,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.error || "Upload failed",
        }
      }

      const data = await response.json()

      return {
        success: true,
        url: data.url,
      }
    } catch (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  },

  delete: async (url: string): Promise<UploadResult> => {
    try {
      const response = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: "Delete failed",
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      }
    }
  },
}

const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  try {
    console.log("📥 Received request");

    const body = JSON.parse(event.body);
    console.log("🔍 Parsed body:", body);

    const { filename = "event.ics", content } = body;

    if (!content) {
      console.error("❌ No .ics content provided");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing .ics content" }),
      };
    }

    const fileBuffer = Buffer.from(content, "base64");
    console.log("📦 Decoded buffer size:", fileBuffer.length);

    const form = new FormData();
    form.append("file", fileBuffer, {
      filename,
      contentType: "text/calendar"
    });
    form.append("upload_preset", "unsigned"); // or use your signed preset
    form.append("public_id", filename.replace(/\.ics$/, ""));
    form.append("folder", "artprize-events");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    console.log("🌐 Uploading to:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: form.getHeaders(),
      body: form,
    });

    const result = await response.json();
    console.log("✅ Cloudinary response:", result);

    if (!result.secure_url) {
      console.error("🚫 Upload failed", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Upload failed", details: result }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: result.secure_url,
        filename: filename,
      }),
    };
  } catch (err) {
    console.error("🔥 Error during handler execution:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

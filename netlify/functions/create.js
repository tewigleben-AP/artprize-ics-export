const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async function (event, context) {
  console.info("📥 Received request");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, content } = body;

    console.info("🔍 Parsed body:", body);

    const buffer = Buffer.from(content, "base64");
    console.info("📦 Decoded buffer size:", buffer.length);

    const form = new FormData();
    form.append("file", buffer, {
      filename,
      contentType: "text/calendar",
    });
    form.append("upload_preset", "artprize_ics"); // Use your unsigned upload preset name here

    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

    console.info("🌐 Uploading to:", url);

    const uploadRes = await fetch(url, {
      method: "POST",
      body: form,
    });

    const uploadJson = await uploadRes.json();

    if (uploadJson.secure_url) {
      console.info("✅ Upload success:", uploadJson.secure_url);
      return {
        statusCode: 200,
        body: JSON.stringify({ url: uploadJson.secure_url }),
      };
    } else {
      console.error("🚫 Upload failed", uploadJson);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: uploadJson }),
      };
    }
  } catch (err) {
    console.error("❌ Unexpected error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

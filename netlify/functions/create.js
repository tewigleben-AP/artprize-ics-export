const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const { filename = "event.ics", content } = JSON.parse(event.body);
    if (!content) {
      return {
        statusCode: 400,
        body: "Missing .ics content"
      };
    }

    // Prepare file content as a buffer
    const fileBuffer = Buffer.from(content, "utf-8");

    // Build the form data for Cloudinary
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename,
      contentType: "text/calendar"
    });
    form.append("upload_preset", "artprize_ics"); // Optional: use unsigned preset or set folder
    form.append("public_id", filename.replace(/\.ics$/, "")); // No extension
    form.append("folder", "artprize/ics"); // Optional folder path

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Upload failed: " + JSON.stringify(data));
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: data.secure_url,
        filename
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Error: " + err.message
    };
  }
};

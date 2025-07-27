const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  console.log("📥 Received request");

  try {
    const { filename, content } = JSON.parse(event.body);
    console.log("🔍 Parsed body:", { filename });

    // Decode Base64 ICS content
    const buffer = Buffer.from(content, 'base64');
    console.log("📦 Decoded buffer size:", buffer.length);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        public_id: filename.replace(/\.ics$/, ''),
        resource_type: "raw", // critical for non-image files like .ics
        format: "ics",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("🚫 Upload failed", error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
          };
        }

        console.log("✅ Cloudinary response:", result);
        return {
          statusCode: 200,
          body: JSON.stringify({
            url: result.secure_url,
            filename: result.original_filename + ".ics"
          }),
        };
      }
    );

    // Stream buffer into Cloudinary
    require("streamifier").createReadStream(buffer).pipe(result);

    return {
      statusCode: 202,
      body: JSON.stringify({ message: "Upload started" }),
    };

  } catch (err) {
    console.error("🔥 Unexpected error", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request format." }),
    };
  }
};

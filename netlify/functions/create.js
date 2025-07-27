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

    const slug = Date.now() + "-" + filename.replace(/[^a-z0-9\-_\.]/gi, "_");
    const fileUrl = `https://${process.env.URL || "yoursite.netlify.app"}/files/${slug}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: "Error: " + e.message
    };
  }
};

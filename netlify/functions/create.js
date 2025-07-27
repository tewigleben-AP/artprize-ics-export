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

    // Encode .ics content to base64
    const base64Content = Buffer.from(content).toString("base64");

    // Construct a data URL
    const dataUrl = `data:text/calendar;base64,${base64Content}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: dataUrl,
        filename
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: "Server error: " + e.message
    };
  }
};


// Haven AI 247 — Secure Chat Backend (v2)
// Supports multiple modes: main chat, crisis, craving companion

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { messages, system } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid messages" }) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system || "You are Haven — a calm, grounded support presence.",
        messages: messages.slice(-20),
      }),
    });

    if (!response.ok) {
      console.error("API error:", await response.text());
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Haven is resting. Try again." }) };
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm still here with you. Take a breath and try again.";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Something interrupted me. I'm still here." }) };
  }
};

export async function askWeatherAgent(prompt, chatId, onToken) {
  console.log("📨 Sending prompt:", prompt);

  const res = await fetch(
    // "http://localhost:4111/api/agents/weather-agent/stream",
    "https://windy-agent-1.onrender.com/api/agents/weather-agent/stream",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Connection: "keep-alive",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        runID: "weatherAgent",
        topP: 1,
        runtimeContext: {},
        threadId: chatId,
        temperature: 0.5,
        maxRetries: 2,
        maxSteps: 5,
        resourceId: "weatherAgent",
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Server error (${res.status})`);
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop();

    for (const event of events) {
      if (!event.startsWith("data:")) continue;

      const data = event.replace("data:", "").trim();

      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);

        // ✅ Normal text from agent
        if (json.type === "text-delta") {
          onToken(json.payload.text);
        }

        // ⚠️ Error from agent
        if (json.type === "error") {
          const msg =
            json.payload?.error?.message ||
            "Something went wrong with the agent.";
          onToken(`⚠️ ${msg}`);
          return;
        }
      } catch {
        console.warn("⚠️ Skipping bad chunk:", data);
      }
    }
  }
}

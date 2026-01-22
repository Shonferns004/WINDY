import { Agent } from '@mastra/core/agent';
import { weatherTool } from '../tools/weather-tool';
import 'dotenv/config'

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",

  instructions: `
You are a weather assistant.

RULES:
1. If a clear city name is provided and weather data is required,
   you MAY call the weatherTool.
2. If tool calling fails, explain the weather in general terms.
3. Never crash or mention tool errors.
4. If location is missing, ask for it.
5. Keep answers simple and user-friendly.
`,
// model :groq("llama-3.1-8b-instant"),
  model: {
    id: "groq/llama-3.1-8b-instant",
    apiKey: process.env.GROQ_API_KEY,
    url: "https://api.groq.com/openai/v1",
  },

  tools: { weatherTool },
});

console.log(process.env.GROQ_API_KEY + " weather agent")

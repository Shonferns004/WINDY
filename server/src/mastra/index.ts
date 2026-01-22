import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents/weather-agent.js";
import 'dotenv/config'

export const mastra = new Mastra({
  agents: {
    weatherAgent,
  },
});

console.log("GROQ:", process.env.GROQ_API_KEY);
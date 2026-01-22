import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fetch from 'node-fetch';
import 'dotenv/config';

"use strict";
const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a city",
  inputSchema: z.object({
    location: z.string().describe("City name")
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string()
  }),
  execute: async ({ location }) => {
    return await getWeather(location);
  }
});
const getWeather = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  console.log("OpenWeather key exists:", !!apiKey);
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is missing");
  }
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`
  );
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }
  const data = await res.json();
  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windGust: data.wind.gust ?? 0,
    conditions: data.weather[0].description,
    location: data.name
  };
};

"use strict";
const weatherAgent = new Agent({
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
    url: "https://api.groq.com/openai/v1"
  },
  tools: { weatherTool }
});
console.log(process.env.GROQ_API_KEY + " weather agent");

"use strict";
const mastra = new Mastra({
  agents: {
    weatherAgent
  }
});
console.log("GROQ:", process.env.GROQ_API_KEY);

export { mastra };

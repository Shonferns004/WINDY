import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fetch from 'node-fetch';

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

export { weatherTool };

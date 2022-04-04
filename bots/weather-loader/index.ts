"use strict";
import rstreamssdk, { BotInvocationEvent, Event } from "leo-sdk";
import botWrapper from "leo-sdk/wrappers/cron";
import { WeatherData } from "../../lib/types";
//import { BotInvocationEvent } from "leo-sdk/lib/types";
import axios from "axios";

let sdk = rstreamssdk();

let e: Event<any>;
interface LoaderBotInvocationEvent extends BotInvocationEvent {
  destination: string;
}

export const handler = botWrapper(async function (event: LoaderBotInvocationEvent) {

  console.log("Invocation Event:", JSON.stringify(event, null, 2));

  let weatherData = await getWeather("ea73496afd07c4af25ddf1fa4ba4608574bc0cba661621bfcdf7a9421039f1c0")

  //await putEvent(event.botId, event.destination, weatherData);
  await sdk.putEvent(event.botId, event.destination, weatherData);

});

async function getWeather(id: string): Promise<WeatherData> {
  let response = await axios.get(`https://weather.com/weather/today/l/${id}`);
  let parts = JSON.parse(JSON.parse((response.data.match(/window.__data=JSON.parse\((.*?)\);/) || [])[1] || ""))
  let data = (Object.values(parts.dal.getSunV3CurrentObservationsUrlConfig)[0] as any).data;
  data.id = id;
  return data;
}

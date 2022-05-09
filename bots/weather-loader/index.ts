"use strict";
import { BotInvocationEvent, RStreamsContext } from "leo-sdk";
import botWrapper from "leo-sdk/wrappers/cron";
import { LatLng, WeatherData } from "../../lib/types";
import axios from "axios";
import configuration from "../../project-config-new";

interface LoaderBotInvocationEvent extends BotInvocationEvent {
  destination: string;
}


// botid: rstreams-example-dev-weather-loader
export const handler = botWrapper(async function (event: LoaderBotInvocationEvent, context: RStreamsContext) {
  //sdk = sdk.wrap(event.botId);
  console.log("Invocation Event:", JSON.stringify(event, null, 2));
  console.log(configuration.defaultNumRetries, configuration.item.endpoint);
  console.log(configuration);

  let weatherData = await getWeather({ lat: 40.35, lng: -111.90 });

  await context.sdk.putEvent(event.botId, event.destination, weatherData);

  //await sdk.getEvents("queue", ["eid"]);
  //sdk.createGenerator<MyGenerationType>(()=>myCustomQueryForTheNextSetOfData());
});

async function getWeather(location: LatLng): Promise<WeatherData> {

  let response = await axios.post("https://weather.com/api/v1/p/redux-dal", [
    {
      "name": "getSunV3CurrentObservationsUrlConfig",
      "params": {
        "geocode": `${location.lat},${location.lng}`,
        "units": "e",
        "language": "en-US"
      }
    }
  ]);

  let data = (Object.values(response.data.dal.getSunV3CurrentObservationsUrlConfig)[0] as any).data as WeatherData;
  data.location = location;
  return data;
}

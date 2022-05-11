"use strict";
import { BotInvocationEvent, RStreamsContext } from "leo-sdk";
import botWrapper from "leo-sdk/wrappers/cron";
import { LatLng, WeatherData } from "../../lib/types";
import axios from "axios";
import projConfig from "../../project-config-new";
const configuration = projConfig; // Typescript renames projConfig because of the import which prevents inspecting when debugging


interface LoaderBotInvocationEvent extends BotInvocationEvent {
	destination: string;
}

// botid: ${self:service}-weather-loader
export const handler = botWrapper(async function (event: LoaderBotInvocationEvent, context: RStreamsContext) {
	console.log("Invocation Event:", JSON.stringify(event, null, 2));
	console.log(configuration.defaultNumRetries, configuration.weather.inner);

	const weatherData = await getWeather({ lat: 40.35, lng: -111.90 });

	await context.sdk.putEvent(event.botId, event.destination, weatherData);
});

async function getWeather(location: LatLng): Promise<WeatherData> {

	const response = await axios.post("https://weather.com/api/v1/p/redux-dal", [
		{
			"name": "getSunV3CurrentObservationsUrlConfig",
			"params": {
				"geocode": `${location.lat},${location.lng}`,
				"units": "e",
				"language": "en-US"
			}
		}
	]);

	const data = (Object.values(response.data.dal.getSunV3CurrentObservationsUrlConfig)[0] as { data: WeatherData }).data;
	data.location = location;
	return data;
}

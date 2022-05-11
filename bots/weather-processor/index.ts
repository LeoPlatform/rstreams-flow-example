"use strict";
import { RStreamsSdk } from "leo-sdk";
import botWrapper from "leo-sdk/wrappers/cron";
import { WeatherData, WeatherDataTransformed } from "../../lib/types";
import { BotInvocationEvent } from "leo-sdk/lib/types";


const sdk = new RStreamsSdk();

export interface ProcessorBotInvocationEvent extends BotInvocationEvent {
	queue: string;
	destination: string;
}

export const handler = botWrapper(async function lambdaHandler(event: ProcessorBotInvocationEvent) {
	console.log("Invocation Event:", JSON.stringify(event, null, 2));

	await sdk.enrichEvents<WeatherData, WeatherDataTransformed>({
		id: event.botId,
		inQueue: event.queue,
		outQueue: event.destination,
		config: undefined,
		transform: function (weather, _wrapper, done) {
			if (weather == null) {
				done(null, true);
				return;
			}
			done(null, mapWeatherDataToWeatherDataTransformed(weather));
		}
	});
});


function mapWeatherDataToWeatherDataTransformed(weather: WeatherData): WeatherDataTransformed {
	return {
		location: weather.location,
		cloud_ceiling: weather.cloudCeiling,
		cloud_cover_phrase: weather.cloudCoverPhrase,
		day_of_week: weather.dayOfWeek,
		is_daytime: weather.dayOrNight === "D",
		expiration_time_utc: weather.expirationTimeUtc,
		precipitation: {
			hour_1: weather.precip1Hour,
			hour_6: weather.precip6Hour,
			hour_24: weather.precip24Hour
		},
		presure: {
			altimeter: weather.pressureAltimeter,
			change: weather.pressureChange,
			mean_sea_level: weather.pressureMeanSeaLevel,
			pressure_tendency_trend: weather.pressureTendencyTrend
		},
		relative_humidity: weather.relativeHumidity,
		snow: {
			hour_1: weather.snow1Hour,
			hour_6: weather.snow6Hour,
			hour_24: weather.snow24Hour
		},
		sunrise_time_utc: weather.sunriseTimeUtc,
		sunset_time_utc: weather.sunsetTimeUtc,
		temperature: {
			current: weather.temperature,
			change_hour_24: weather.temperatureChange24Hour,
			dew_point: weather.temperatureDewPoint,
			feels_like: weather.temperatureFeelsLike,
			heat_index: weather.temperatureHeatIndex,
			max_hour_24: weather.temperatureMax24Hour,
			max_since_7_am: weather.temperatureMaxSince7Am,
			min_hour_24: weather.temperatureMin24Hour,
			wind_chill: weather.temperatureWindChill
		},
		valid_time_utc: weather.validTimeUtc,
		visibility: weather.visibility,
		wind: {
			direction: weather.windDirection,
			direction_cardinal: weather.windDirectionCardinal,
			gust: weather.windGust,
			speed: weather.windSpeed
		},
		wx_phase: {
			long: weather.wxPhraseLong,
			medium: weather.wxPhraseMedium,
			short: weather.wxPhraseShort
		}
	};
}


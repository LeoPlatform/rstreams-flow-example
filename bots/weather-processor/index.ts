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
		transform: function (weatherData, _eventWrapper, done) {
			if (weatherData == null) {
				done(null, true);
				return;
			}
			done(null, mapWeatherDataToWeatherDataTransformed(weatherData));
		}
	});
});


function mapWeatherDataToWeatherDataTransformed(weatherData: WeatherData): WeatherDataTransformed {
	return {
		location: weatherData.location,
		cloud_ceiling: weatherData.cloudCeiling,
		cloud_cover_phrase: weatherData.cloudCoverPhrase,
		day_of_week: weatherData.dayOfWeek,
		is_daytime: weatherData.dayOrNight === "D",
		expiration_time_utc: weatherData.expirationTimeUtc,
		precipitation: {
			hour_1: weatherData.precip1Hour,
			hour_6: weatherData.precip6Hour,
			hour_24: weatherData.precip24Hour
		},
		presure: {
			altimeter: weatherData.pressureAltimeter,
			change: weatherData.pressureChange,
			mean_sea_level: weatherData.pressureMeanSeaLevel,
			pressure_tendency_trend: weatherData.pressureTendencyTrend
		},
		relative_humidity: weatherData.relativeHumidity,
		snow: {
			hour_1: weatherData.snow1Hour,
			hour_6: weatherData.snow6Hour,
			hour_24: weatherData.snow24Hour
		},
		sunrise_time_utc: weatherData.sunriseTimeUtc,
		sunset_time_utc: weatherData.sunsetTimeUtc,
		temperature: {
			current: weatherData.temperature,
			change_hour_24: weatherData.temperatureChange24Hour,
			dew_point: weatherData.temperatureDewPoint,
			feels_like: weatherData.temperatureFeelsLike,
			heat_index: weatherData.temperatureHeatIndex,
			max_hour_24: weatherData.temperatureMax24Hour,
			max_since_7_am: weatherData.temperatureMaxSince7Am,
			min_hour_24: weatherData.temperatureMin24Hour,
			wind_chill: weatherData.temperatureWindChill
		},
		valid_time_utc: weatherData.validTimeUtc,
		visibility: weatherData.visibility,
		wind: {
			direction: weatherData.windDirection,
			direction_cardinal: weatherData.windDirectionCardinal,
			gust: weatherData.windGust,
			speed: weatherData.windSpeed
		},
		wx_phase: {
			long: weatherData.wxPhraseLong,
			medium: weatherData.wxPhraseMedium,
			short: weatherData.wxPhraseShort
		}
	};
}


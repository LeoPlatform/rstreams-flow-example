import sinon from "sinon";
import chai, { assert, expect } from "chai";
import sinonchai from "sinon-chai";
chai.use(sinonchai);
import { Handler } from "aws-lambda";

import { createContext, createBotInvocationEvent } from "leo-sdk/lib/mock";
import rstreamsSdk, { ConfigurationResources, EnrichOptions, Event, ReadEvent, RStreamsSdk } from "leo-sdk";
import { promisify } from "util";
import { ProcessorBotInvocationEvent } from "bots/weather-processor";
import { eventIdFromTimestamp, eventstream, through } from "leo-sdk/lib/streams";
import { WeatherData, WeatherDataTransformed } from "lib/types";

let mockConfig: ConfigurationResources = {
	Region: "mock-Region",
	LeoEvent: "mock-LeoEvent",
	LeoStream: "mock-LeoStream",
	LeoCron: "mock-LeoCron",
	LeoS3: "mock-LeoS3",
	LeoKinesisStream: "mock-LeoKinesisStream",
	LeoFirehoseStream: "mock-LeoFirehoseStream",
	LeoSettings: "mock-LeoSettings"
}
global.rstreams_config = mockConfig;

describe("weather-processor", function () {
	let sandbox = sinon.createSandbox();
	let sdk: RStreamsSdk = new RStreamsSdk(mockConfig);
	let handler: Handler<ProcessorBotInvocationEvent>;
	beforeEach(() => {
		sandbox.mock(sdk);
		sandbox.stub(rstreamsSdk as any, "RStreamsSdk").returns(sdk);

		handler = require("../bots/weather-processor").handler;
	});
	afterEach(() => {
		sandbox.restore();
	});

	describe("handler", function () {

		it("process events - success", async function () {
			let start = 1650309625992;
			let count = 0;
			let mockReadData: WeatherData = {

				location: {
					lat: 40.35,
					lng: -111.9
				},
				cloudCeiling: null,
				cloudCoverPhrase: "Clear",
				dayOfWeek: "Monday",
				dayOrNight: "D",
				expirationTimeUtc: 1650301141,
				iconCode: 32,
				iconCodeExtend: 3200,
				obsQualifierCode: null,
				obsQualifierSeverity: null,
				precip1Hour: 0,
				precip6Hour: 0,
				precip24Hour: 0,
				pressureAltimeter: 29.99,
				pressureChange: -0.1,
				pressureMeanSeaLevel: 1017.9,
				pressureTendencyCode: 2,
				pressureTendencyTrend: "Falling",
				relativeHumidity: 48,
				snow1Hour: 0,
				snow6Hour: 0,
				snow24Hour: 0,
				sunriseTimeLocal: "2022-04-18T06:44:29-0600",
				sunriseTimeUtc: 1650285869,
				sunsetTimeLocal: "2022-04-18T20:09:41-0600",
				sunsetTimeUtc: 1650334181,
				temperature: 53,
				temperatureChange24Hour: 6,
				temperatureDewPoint: 35,
				temperatureFeelsLike: 52,
				temperatureHeatIndex: 53,
				temperatureMax24Hour: 60,
				temperatureMaxSince7Am: 53,
				temperatureMin24Hour: 37,
				temperatureWindChill: 52,
				uvDescription: "Moderate",
				uvIndex: 4,
				validTimeLocal: "2022-04-18T10:49:01-0600",
				validTimeUtc: 1650300541,
				visibility: 10,
				windDirection: 160,
				windDirectionCardinal: "SSE",
				windGust: null,
				windSpeed: 5,
				wxPhraseLong: "Sunny",
				wxPhraseMedium: "Sunny",
				wxPhraseShort: "Sunny"
			};

			let dataWritten: WeatherDataTransformed[] = [];
			let error: Error;
			let enrichEvents = sandbox.stub(sdk, "enrichEvents").callsFake(async (options: EnrichOptions<WeatherData, WeatherDataTransformed>) => {
				let event1: ReadEvent<WeatherData> = {
					eid: eventIdFromTimestamp(start, "full", count++),
					id: "MockBot",
					event: "MockQueue",
					payload: mockReadData
				}
				let transform = promisify(options.transform);
				let data1 = await transform(event1.payload, event1)
				if (typeof data1 !== "boolean") {
					dataWritten.push(data1);
				}
				let event2: ReadEvent<WeatherData> = {
					eid: eventIdFromTimestamp(start, "full", count++),
					id: "MockBot",
					event: "MockQueue"
				}
				let data2 = await transform(event2.payload, event2);
				assert.isBoolean(data2);
				assert.isTrue(data2);
			});


			await promisify(handler)(createBotInvocationEvent("BotId", {
				queue: "SourceMockQueue",
				destination: "DestMockQueue"
			}), createContext({ Timeout: 30 }))

			assert.isUndefined(error);
			expect(enrichEvents).called;
			assert.deepEqual(dataWritten,
				[
					{
						"cloud_ceiling": null,
						"cloud_cover_phrase": "Clear",
						"day_of_week": "Monday",
						"expiration_time_utc": 1650301141,
						"is_daytime": true,
						"location": {
							"lat": 40.35,
							"lng": -111.9,
						},
						"precipitation": {
							"hour_1": 0,
							"hour_24": 0,
							"hour_6": 0,
						},
						"presure": {
							"altimeter": 29.99,
							"change": -0.1,
							"mean_sea_level": 1017.9,
							"pressure_tendency_trend": "Falling",
						},
						"relative_humidity": 48,
						"snow": {
							"hour_1": 0,
							"hour_24": 0,
							"hour_6": 0,
						},
						"sunrise_time_utc": 1650285869,
						"sunset_time_utc": 1650334181,
						"temperature": {
							"change_hour_24": 6,
							"current": 53,
							"dew_point": 35,
							"feels_like": 52,
							"heat_index": 53,
							"max_hour_24": 60,
							"max_since_7_am": 53,
							"min_hour_24": 37,
							"wind_chill": 52,
						},
						"valid_time_utc": 1650300541,
						"visibility": 10,
						"wind": {
							"direction": 160,
							"direction_cardinal": "SSE",
							"gust": null,
							"speed": 5,
						},
						"wx_phase": {
							"long": "Sunny",
							"medium": "Sunny",
							"short": "Sunny",
						},
					}
				]
			);
		});

		it("process events - mock sdk internals - success", async function () {
			let start = 1650309625992;
			let count = 0;
			let mockReadData: ReadEvent<WeatherData>[] = [{

				location: {
					lat: 40.35,
					lng: -111.9
				},
				cloudCeiling: null,
				cloudCoverPhrase: "Clear",
				dayOfWeek: "Monday",
				dayOrNight: "D",
				expirationTimeUtc: 1650301141,
				iconCode: 32,
				iconCodeExtend: 3200,
				obsQualifierCode: null,
				obsQualifierSeverity: null,
				precip1Hour: 0,
				precip6Hour: 0,
				precip24Hour: 0,
				pressureAltimeter: 29.99,
				pressureChange: -0.1,
				pressureMeanSeaLevel: 1017.9,
				pressureTendencyCode: 2,
				pressureTendencyTrend: "Falling",
				relativeHumidity: 48,
				snow1Hour: 0,
				snow6Hour: 0,
				snow24Hour: 0,
				sunriseTimeLocal: "2022-04-18T06:44:29-0600",
				sunriseTimeUtc: 1650285869,
				sunsetTimeLocal: "2022-04-18T20:09:41-0600",
				sunsetTimeUtc: 1650334181,
				temperature: 53,
				temperatureChange24Hour: 6,
				temperatureDewPoint: 35,
				temperatureFeelsLike: 52,
				temperatureHeatIndex: 53,
				temperatureMax24Hour: 60,
				temperatureMaxSince7Am: 53,
				temperatureMin24Hour: 37,
				temperatureWindChill: 52,
				uvDescription: "Moderate",
				uvIndex: 4,
				validTimeLocal: "2022-04-18T10:49:01-0600",
				validTimeUtc: 1650300541,
				visibility: 10,
				windDirection: 160,
				windDirectionCardinal: "SSE",
				windGust: null,
				windSpeed: 5,
				wxPhraseLong: "Sunny",
				wxPhraseMedium: "Sunny",
				wxPhraseShort: "Sunny"
			}, null].map((data: WeatherData) => {
				return {
					id: "MockBot",
					event: "MockQueue",
					eid: eventIdFromTimestamp(start, "full", count++),
					payload: data,
					timestamp: start,
					event_source_timestamp: start
				}
			});

			let dataWritten: Event<WeatherDataTransformed>[] = [];

			let fromLeo = sandbox.stub(sdk.streams, "fromLeo").callsFake(() => {
				return eventstream.readArray(mockReadData)
			});

			let toLeo = sandbox.stub(sdk.streams, "toLeo").callsFake(() => through((data: Event<WeatherDataTransformed>, done) => {

				// Read Data actually allows eid to be pass but only internally so remove it 
				// so the assert.deepEquals works below
				delete data["eid"];
				dataWritten.push(data);
				done();
			}));

			await promisify(handler)(createBotInvocationEvent("BotId", {
				queue: "SourceMockQueue",
				destination: "DestMockQueue"
			}), createContext({ Timeout: 30 }))

			expect(fromLeo).called;
			expect(toLeo).called;
			assert.deepEqual(dataWritten,
				[
					{
						"correlation_id": {
							"source": "MockQueue",
							"start": "z/2022/04/18/19/20/1650309625992-0000000",
							"units": 1,
						},
						"event": "DestMockQueue",
						"event_source_timestamp": 1650309625992,
						"id": "BotId",
						"payload": {
							"cloud_ceiling": null,
							"cloud_cover_phrase": "Clear",
							"day_of_week": "Monday",
							"expiration_time_utc": 1650301141,
							"is_daytime": true,
							"location": {
								"lat": 40.35,
								"lng": -111.9,
							},
							"precipitation": {
								"hour_1": 0,
								"hour_24": 0,
								"hour_6": 0,
							},
							"presure": {
								"altimeter": 29.99,
								"change": -0.1,
								"mean_sea_level": 1017.9,
								"pressure_tendency_trend": "Falling",
							},
							"relative_humidity": 48,
							"snow": {
								"hour_1": 0,
								"hour_24": 0,
								"hour_6": 0,
							},
							"sunrise_time_utc": 1650285869,
							"sunset_time_utc": 1650334181,
							"temperature": {
								"change_hour_24": 6,
								"current": 53,
								"dew_point": 35,
								"feels_like": 52,
								"heat_index": 53,
								"max_hour_24": 60,
								"max_since_7_am": 53,
								"min_hour_24": 37,
								"wind_chill": 52,
							},
							"valid_time_utc": 1650300541,
							"visibility": 10,
							"wind": {
								"direction": 160,
								"direction_cardinal": "SSE",
								"gust": null,
								"speed": 5,
							},
							"wx_phase": {
								"long": "Sunny",
								"medium": "Sunny",
								"short": "Sunny",
							},
						},
					},
					{
						"correlation_id": {
							"source": "MockQueue",
							"start": "z/2022/04/18/19/20/1650309625992-0000001",
							"units": 1
						},
						"event_source_timestamp": 1650309625992,
						"id": "BotId"
					} as any
				]
			);
		});

	});

});


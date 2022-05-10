
process.env.STAGE = "test";
import sinon from "sinon";
import chai, { assert, expect } from "chai";
import sinonchai from "sinon-chai";
chai.use(sinonchai);

import { createContext, createBotInvocationEvent } from "leo-sdk/lib/mock";
import sdk from "leo-sdk";
import "./mock-config-setup";
import { handler } from "../bots/weather-loader";
import axios from "axios";
import { promisify } from "util";

describe("weather-loader", function () {
	let sandbox;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
	});

	describe("handler", function () {

		it("get weather - success", async function () {
			const putEvent = sandbox.stub(sdk, "putEvent").returns(Promise.resolve());
			sandbox.stub(axios, "post").callsFake(() => {
				return Promise.resolve({
					data: {
						dal: {
							getSunV3CurrentObservationsUrlConfig: {
								"geocode:40.35,-111.90;language:en-US;units:e": {
									loading: false,
									loaded: true,
									data: {
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
									},
									status: 200,
									statusText: "OK"
								}
							}
						}
					}
				});
			});

			await promisify(handler)(createBotInvocationEvent("BotId", {
				destination: "MockQueue"
			}), createContext({ Timeout: 30 }));

			expect(putEvent).called;
			assert.deepEqual(putEvent.getCall(0).args, [
				"BotId",
				"MockQueue",
				{

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
				}
			]);
		});

		it("get weather - fail", async function () {
			const putEvent = sandbox.stub(sdk, "putEvent").returns(Promise.resolve());
			sandbox.stub(axios, "post").callsFake(() => {
				return Promise.reject(new Error("Bad api call"));
			});

			const result = await promisify(handler)(createBotInvocationEvent("BotId", {
				destination: "MockQueue"
			}), createContext({ Timeout: 30 }));


			expect(putEvent).not.called;
			assert.instanceOf(result, Error);
			assert.deepEqual(result.message, "Bad api call");
		});
	});

});


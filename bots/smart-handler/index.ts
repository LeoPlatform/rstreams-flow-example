import AWS from "aws-sdk";
import { OffloadOptions, ReadEvent, ReadOptions, RSFQueueBotInvocationEvent } from "leo-sdk";
import refUtil from "leo-sdk/lib/reference"
import { RStreamsBot, RStreamsBotHooks } from "leo-sdk/wrappers/smart";
import { WeatherDataTransformed } from "lib/types";
import { DynamicMetricReporter } from "rstreams-metrics";

interface MyInData {
	id: string;
	a: number
}
interface MyOutData {
	b: string
}

const instancesCount = parseInt(process.env.INSTANCES, 10) || 1;

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(() => resolve(), ms))
}

interface InvocationEvent extends RSFQueueBotInvocationEvent {
	readOptions?: ReadOptions
}

let metricReporter: DynamicMetricReporter = new DynamicMetricReporter((async () => {
	let secret = await new AWS.SecretsManager({ region: process.env.AWS_REGION }).getSecretValue({ SecretId: "GlobalRSFMetricConfigs" }).promise();
	let config = JSON.parse(secret.SecretString);
	config.dontSendMetrics = true;
	return config;
})());


let hooks: RStreamsBotHooks<InvocationEvent, never, number> =
{
	initialize: async function (self) {
		this.sdk = self.sdk;
		this.cache = {
			time: Date.now()
		}
	},
	handler: async function (inputEvent, context) {
		console.log("EVENT:", inputEvent);
		console.log(context.getRemainingTimeInMillis());
		let sleepMS = ((parseInt(inputEvent.__cron.iid) || 0) * 10) + 100;
		let queue = inputEvent.source;
		let offloadConfig: OffloadOptions<WeatherDataTransformed> = {
			id: inputEvent.botId,
			inQueue: queue,

			transform: async function (_payload, _wrapper) {
				//console.log(wrapper.eid);
				await sleep(sleepMS)
				return true;
			},

			//limit: 100 + parseInt(inputEvent.__cron.iid) || 0,
			//start: "z/2022/05/20/21/25/1653081903260-0000000",
			stopTime: Date.now() + (1000 * 30),
			...inputEvent.readOptions
		};

		metricReporter.log({
			id: "my_metric_id",
			value: 123,
			tags: {
				workflow: "rsf-example",

				// app: "rsf-example",

				// bot: inputEvent.botId,
				// environment: "dev",
				// bus: context.sdk.configuration.resources.LeoCron.split("-LeoCron-")[0],
				// service: "rstreams",
			}
		});

		await context.sdk.offloadEvents(offloadConfig);

		console.log("Done Waiting");
		// if (inputEvent.__cron.iid != "0") {
		// 	throw new Error(`This is an error: ${inputEvent.__cron.iid}`)
		// }
		await metricReporter.end();
		return Math.random()
	},
	// eventPartition: function (event: ReadEvent<MyInData>) {
	// 	return event.eid
	// },
	// maxInstances: 4,
	// instances: function (invocationEvent, fanoutData) {
	// 	let queue = refUtil.refId(invocationEvent.source);
	// 	let position = fanoutData.checkpoints?.read[queue]?.checkpoint;
	// 	let timePosition = position != null ? this.sdk.streams.eventIdToTimestamp(position) : null;
	// 	let duration = position === invocationEvent.requested_kinesis[queue] ? 0 : Date.now() - timePosition;
	// 	let instanceCount = Math.floor(duration / 1000 / 60) / 5;
	// 	console.log("INSTANCES:", instanceCount, duration)
	// 	return 5;
	// },
	// reduce: function (responses) {
	// 	console.log("REDUCE:", responses);
	// 	return responses.reduce((a, b) => {
	// 		if (b.error) { throw b.error; }
	// 		return a + b.data
	// 	}, 0);
	// }
};


export const handler = new RStreamsBot(hooks).export();




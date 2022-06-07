import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { DynamicMetricReporter } from "rstreams-metrics";

let metricReporter: DynamicMetricReporter = new DynamicMetricReporter((async () => {
	let secret = await new AWS.SecretsManager({ region: process.env.AWS_REGION }).getSecretValue({ SecretId: "GlobalRSFMetricConfigs" }).promise();
	let config = JSON.parse(secret.SecretString);
	return config;
})());

exports.handler = require("leo-sdk/wrappers/cron")(async function (_event: any, _context: Context) {

	await metricReporter.start();

	doSomeWork();

	await metricReporter.end();
});
function doSomeWork() {
	metricReporter.log({
		id: "rsf-example.numbers",
		value: Math.floor(Math.random() * 100),
		tags: {
			workflow: "rsf-example",
			rsf_type: "warning"
		}
	});
	metricReporter.log({
		id: "rsf-example.numbers",
		value: Math.floor(Math.random() * 100),
		tags: {
			workflow: "rsf-example",
			rsf_type: "error"
		}
	});
}


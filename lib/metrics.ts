
import AWS from "aws-sdk";
import { DynamicMetricReporter } from "rstreams-metrics";

export const reporter: DynamicMetricReporter = new DynamicMetricReporter((async () => {
	let secret = await new AWS.SecretsManager({ region: process.env.AWS_REGION }).getSecretValue({ SecretId: "GlobalRSFMetricConfigs" }).promise();
	let config = JSON.parse(secret.SecretString);
	return config;
})());

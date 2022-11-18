import { Context } from "aws-lambda";
import { reporter } from "../../lib/metrics";

exports.handler = require("leo-sdk/wrappers/cron")(async function (event: any, _context: Context) {
	console.log(JSON.stringify(event, null, 2))
	await reporter.start();

	doSomeWork();

	await reporter.end();
});

function doSomeWork() {
	console.log("write metrics");
	reporter.log({
		id: "rsf-example.numbers",
		value: Math.floor(Math.random() * 100),
		tags: {
			workflow: "rsf-example",
			rsf_type: "warning"
		}
	});
	reporter.log({
		id: "rsf-example.numbers",
		value: Math.floor(Math.random() * 100),
		tags: {
			workflow: "rsf-example",
			rsf_type: "error"
		}
	});
}


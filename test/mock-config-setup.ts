import { ProjectConfigNew } from "project-config-new"

let mockProjectConfig: ProjectConfigNew = {
	item: {
		endpoint: "mock-item-endpoint"
	},
	mysqlPortRegion: 1234,
	mysqlPortRegion2: 5678,
	mysqlPort: 9012,
	mysqlPassword: "mock-mysql-password",
	mysql: {
		username: "mock-username",
		password: "mock-pwd",
		port: 3456
	},
	redshifturl: "mock-redshift-url",
	defaultNumRetries: 345,
	weather: {
		inner: "mock-weather-inner",
		inner3: "mock-weather-inner3",
		inner2: {
			inner3: "mock-weather-inner2-inner3",
			inner8: "mock-weather-inner2-inner8",
		},
	},
}

// RStreams Flow supports setting global.rsf_config, process.rsf_config, or process.env.RSF_CONFIG
global.rsf_config = mockProjectConfig
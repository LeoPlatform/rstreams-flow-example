export interface WeatherData {
	id: string;
	cloudCeiling: number
	cloudCoverPhrase: string;
	dayOfWeek: string;
	dayOrNight: string;
	expirationTimeUtc: number;
	iconCode: number;
	iconCodeExtend: number;
	obsQualifierCode: string;
	obsQualifierSeverity: number;
	precip1Hour: number;
	precip6Hour: number;
	precip24Hour: number;
	pressureAltimeter: number;
	pressureChange: number;
	pressureMeanSeaLevel: number;
	pressureTendencyCode: number;
	pressureTendencyTrend: string;
	relativeHumidity: number;
	snow1Hour: number;
	snow6Hour: number;
	snow24Hour: number;
	sunriseTimeLocal: string;
	sunriseTimeUtc: number;
	sunsetTimeLocal: string;
	sunsetTimeUtc: number;
	temperature: number;
	temperatureChange24Hour: number;
	temperatureDewPoint: number;
	temperatureFeelsLike: number;
	temperatureHeatIndex: number;
	temperatureMax24Hour: number;
	temperatureMaxSince7Am: number;
	temperatureMin24Hour: number;
	temperatureWindChill: number;
	uvDescription: string;
	uvIndex: number;
	validTimeLocal: string;
	validTimeUtc: number;
	visibility: number;
	windDirection: number;
	windDirectionCardinal: string;
	windGust: number;
	windSpeed: number;
	wxPhraseLong: string;
	wxPhraseMedium: string;
	wxPhraseShort: string;
}

export interface WeatherDataTransformed {
	id: string;
	cloud_ceiling: number
	cloud_cover_phrase: string;
	day_of_week: string;
	is_daytime: boolean;
	expiration_time_utc: number;
	precipitation: {
		hour_1: number;
		hour_6: number;
		hour_24: number;
	};
	presure: {
		altimeter: number;
		change: number;
		mean_sea_level: number;
		pressure_tendency_trend: string;
	}
	relative_humidity: number;
	snow: {
		hour_1: number;
		hour_6: number;
		hour_24: number;
	};

	sunrise_time_utc: number;
	sunset_time_utc: number;

	temperature: {
		current: number;
		change_hour_24: number;
		dew_point: number;
		feels_like: number;
		heat_index: number;
		max_hour_24: number;
		max_since_7_am: number;
		min_hour_24: number;
		wind_chill: number;
	};
	valid_time_utc: number;
	visibility: number;
	wind: {
		direction: number;
		direction_cardinal: string;
		gust: number;
		speed: number;
	};
	wx_phase: {
		long: string;
		medium: string;
		short: string;
	};
}

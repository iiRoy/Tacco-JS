function processWeatherForecast(rawData) {
    const conditionLines = rawData.split("\n");
    const initialWeather = conditionLines[0];

    const weatherTransition = new Map();
    weatherTransition.set("Sunny", "Cloudy");
    weatherTransition.set("Cloudy", "Rainy");
    weatherTransition.set("Rainy", "Sunny");

    const subsequentWeather = weatherTransition.get(initialWeather);

    console.log(subsequentWeather);
}

processWeatherForecast(require("fs").readFileSync("/dev/stdin", "utf8"));

function retrieveNextWeather(currentCondition) {
    const weatherMap = {
        'Sunny': 'Cloudy',
        'Cloudy': 'Rainy',
        'Rainy': 'Sunny'
    };
    return weatherMap[currentCondition];
}

function handleWeatherInput(incomingWeather) {
    const resultantWeather = retrieveNextWeather(incomingWeather);
    console.log(resultantWeather);
}

handleWeatherInput(require("fs").readFileSync("/dev/stdin", "utf8"));

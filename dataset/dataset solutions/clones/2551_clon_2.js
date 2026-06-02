function ProcessInput(weatherCondition) {
    let weatherMap = {
        'Sunny': 'Cloudy',
        'Cloudy': 'Rainy',
        'Rainy': 'Sunny'
    };

    console.log(weatherMap[weatherCondition]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

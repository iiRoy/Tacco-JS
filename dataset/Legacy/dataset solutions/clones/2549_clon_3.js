function ForecastProcessor(inputCondition) {
    const calculateNextWeatherState = (currentCondition) => {
        let nextStateResult;

        if (currentCondition === 'Sunny') {
            nextStateResult = 'Cloudy';
        } else if (currentCondition === 'Cloudy') {
            nextStateResult = 'Rainy';
        } else if (currentCondition === 'Rainy') {
            nextStateResult = 'Sunny';
        } else {
            nextStateResult = 'Other';
        }
        return nextStateResult;
    };

    const determinedOutput = calculateNextWeatherState(inputCondition);

    console.log(determinedOutput);

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}

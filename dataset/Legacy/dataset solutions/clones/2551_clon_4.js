function processWeatherChange(presentCondition) {
    const weatherRules = [
        { initial: 'Sunny', subsequent: 'Cloudy' },
        { initial: 'Cloudy', subsequent: 'Rainy' },
        { initial: 'Rainy', subsequent: 'Sunny' }
    ];

    const matchingRule = weatherRules.find(rule => rule.initial === presentCondition);
    
    if (matchingRule) {
        console.log(matchingRule.subsequent);
    } else {
        console.log(undefined);
    }
}

processWeatherChange(require("fs").readFileSync("/dev/stdin", "utf8"));

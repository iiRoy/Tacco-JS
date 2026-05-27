function Main(inputVal) {
    let currentVal = Number.parseInt(inputVal, 10);
    let resultCount = 0;

    let ninePowerCandidate = 9;
    let largestNinePower = 0;
    while (ninePowerCandidate <= currentVal) {
        largestNinePower = ninePowerCandidate;
        if (ninePowerCandidate > currentVal / 9) {
            break;
        }
        ninePowerCandidate *= 9;
    }

    if (largestNinePower > 0) {
        currentVal -= largestNinePower;
        resultCount++;
    }

    let sixPowerCandidate = 6;
    let largestSixPower = 0;
    while (sixPowerCandidate <= currentVal) {
        largestSixPower = sixPowerCandidate;
        if (sixPowerCandidate > currentVal / 6) {
            break;
        }
        sixPowerCandidate *= 6;
    }

    if (largestSixPower > 0) {
        currentVal -= largestSixPower;
        resultCount++;
    }

    resultCount += currentVal;

    console.log(resultCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

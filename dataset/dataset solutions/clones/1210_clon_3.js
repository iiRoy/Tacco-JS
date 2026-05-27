function processTimeInput(rawInputString) {
    const totalSecondsInput = parseInt(rawInputString, 10);

    const timeComponents = calculateHMSComponents(totalSecondsInput);

    const hoursResult = timeComponents.hours;
    const minutesResult = timeComponents.minutes;
    const secondsResult = timeComponents.seconds;

    const outputParts = [
        hoursResult,
        ":",
        minutesResult,
        ":",
        secondsResult
    ];
    console.log(outputParts.join(""));
}

function calculateHMSComponents(totalSecs) {
    const SECONDS_PER_HOUR = 3600;
    const SECONDS_PER_MINUTE = 60;

    let currentSecondsForCalculation = totalSecs;

    const hours = Math.floor(currentSecondsForCalculation / SECONDS_PER_HOUR);
    currentSecondsForCalculation %= SECONDS_PER_HOUR;

    const minutes = Math.floor(currentSecondsForCalculation / SECONDS_PER_MINUTE);
    currentSecondsForCalculation %= SECONDS_PER_MINUTE;

    const seconds = currentSecondsForCalculation;

    return { hours: hours, minutes: minutes, seconds: seconds };
}

function simulateDebugExecution() {
    const inputElement = document.getElementById("input");
    const inputElementValue = inputElement.value;
    processTimeInput(inputElementValue);
}

processTimeInput(require("fs").readFileSync("/dev/stdin", "utf8"));

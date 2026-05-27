const RADIX_TEN = 10;

function calculateScheduleResult(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const numberOfParticipants = parseInt(inputLines[0], RADIX_TEN);

    const dayAndResultParts = inputLines[1].split(" ");
    const totalDurationDays = parseInt(dayAndResultParts[0], RADIX_TEN);
    let cumulativeResult = parseInt(dayAndResultParts[1], RADIX_TEN);

    for (let participantIndex = 1; participantIndex <= numberOfParticipants; participantIndex++) {
        const currentDivisorString = inputLines[participantIndex + 1];
        const currentDivisor = parseInt(currentDivisorString, RADIX_TEN);

        let valueToAddForParticipant;
        if (totalDurationDays % currentDivisor === 0) {
            valueToAddForParticipant = totalDurationDays / currentDivisor;
        } else {
            // The original logic `Math.floor(a) + 1` for `a = day / divisor`
            // when `day % divisor != 0` is equivalent to `Math.ceil(day / divisor)`.
            valueToAddForParticipant = Math.ceil(totalDurationDays / currentDivisor);
        }
        cumulativeResult += valueToAddForParticipant;
    }

    console.log(cumulativeResult);
}

calculateScheduleResult(require("fs").readFileSync("/dev/stdin", "utf8"));

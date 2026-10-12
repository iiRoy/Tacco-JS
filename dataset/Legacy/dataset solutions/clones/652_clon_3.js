const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

const extractNumericParams = (inputString) => {
    return inputString.trim().split(" ").map(Number);
};

const [baseIncrement, weeklyBonus, requiredThreshold] = extractNumericParams(fileData);

let currentDayCount = 1;
let accumulatedSum = baseIncrement;

while (true) {
    if (accumulatedSum >= requiredThreshold) {
        console.log(currentDayCount);
        break;
    }

    currentDayCount++;

    let dailyContribution = baseIncrement;
    const isSeventhDay = (currentDayCount % 7 === 0);

    if (isSeventhDay) {
        dailyContribution += weeklyBonus;
    }

    accumulatedSum += dailyContribution;
}

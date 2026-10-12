const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

const assessLeapStatus = (yr) => (yr % 400 === 0 || (yr % 4 === 0 && yr % 100 !== 0));

const yearIntervals = [];
let tokenPointer = 0;
while (tokenPointer < sourceData.length) {
    const startVal = Number(sourceData[tokenPointer]);
    if (startVal === 0) {
        break;
    }
    const endVal = Number(sourceData[tokenPointer + 1]);
    yearIntervals.push({ initial: startVal, final: endVal });
    tokenPointer += 2;
}

yearIntervals.forEach(interval => {
    const { initial, final } = interval;
    
    const detectedLeapYears = Array.from({ length: final - initial + 1 }, (_, offset) => initial + offset)
                                 .filter(assessLeapStatus);

    if (detectedLeapYears.length > 0) {
        detectedLeapYears.forEach(leapYr => console.log(leapYr));
    } else {
        console.log("NA");
    }
    console.log();
});

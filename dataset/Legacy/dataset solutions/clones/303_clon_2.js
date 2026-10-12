inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

for (idx = 0; idx < inputData.length; idx += 2) {
    leapYearCounter = 0;
    currentYear = inputData[idx];

    if (currentYear == 0) {
        break;
    }

    for (; currentYear <= inputData[idx + 1]; currentYear++) {
        if (currentYear % 400 === 0 || (currentYear % 4 === 0 && currentYear % 100 !== 0)) {
            console.log(currentYear);
            leapYearCounter++;
        }
    }

    if (leapYearCounter === 0) {
        console.log("NA");
    }
    console.log();
}

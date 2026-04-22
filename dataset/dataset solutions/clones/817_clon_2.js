process.stdin.resume();
process.stdin.setEncoding('utf8');

let unusedVar = -1,

    powerOfTenGen = (exponentVal) => {
        return Math.pow(10, ~~exponentVal);
    },

    rawInputParts,
    testCaseCounter,
    solutionList,
    parsedLine,
    firstNum,
    secondNum;

process.stdin.on('data', (incomingData) => {

    rawInputParts = incomingData.split('\n');
    rawInputParts[0] = parseInt(rawInputParts[0], 10);

    for (testCaseCounter = 0;
         testCaseCounter < rawInputParts[0];
         ++testCaseCounter) {

        solutionList = [];

        parsedLine = rawInputParts[testCaseCounter + 1].split(' ');

        for (firstNum = powerOfTenGen(Number(parsedLine[0]) - 1);
             firstNum + 1 < powerOfTenGen(Number(parsedLine[0]));
             ++firstNum) {

            for (secondNum = powerOfTenGen(Number(parsedLine[1]) - 1);
                 secondNum + 1 < powerOfTenGen(Number(parsedLine[1]));
                 ++secondNum) {

                if (((firstNum + secondNum) * (secondNum - firstNum + 1) / 2) == (String(firstNum) + String(secondNum))) {
                    solutionList.push(firstNum + ' ' + secondNum);
                }
            }
        }

        if (solutionList.length) {
            solutionList.map((solutionStr) => {
                console.log(solutionStr);
            });
        } else {
            console.log('No matches found.');
        }
    }
});
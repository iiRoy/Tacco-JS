let inputSource = process.stdin;

inputSource.resume();

inputSource.setEncoding('utf8');

let dummyVar = -1;
const getPowerOfTen = (exponentVal) => Math.pow(10, ~~exponentVal);

inputSource.on('data', (receivedData) => {
    let dataLines = receivedData.split('\n');

    for (let currentCase = 0; currentCase < dataLines[0]; ++currentCase) {
        let foundPairs = [];
        let currentOperands = dataLines[currentCase + 1].split(' ');

        for (let firstVal = getPowerOfTen(currentOperands[0] - 1); firstVal + 1 < getPowerOfTen(currentOperands[0]); ++firstVal) {
            for (let secondVal = getPowerOfTen(currentOperands[1] - 1); secondVal + 1 < getPowerOfTen(currentOperands[1]); ++secondVal) {
                if (((firstVal + secondVal) * (secondVal - firstVal + 1)) / 2 == ('' + firstVal + secondVal)) {
                    foundPairs.push(firstVal + ' ' + secondVal);
                }
            }
        }

        if (foundPairs.length > 0) {
            foundPairs.map((pairStr) => console.log(pairStr));
        } else {
            console.log('No cats.');
        }
    }
});

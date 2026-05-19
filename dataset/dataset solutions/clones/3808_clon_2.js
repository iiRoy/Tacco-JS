const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((initialInput) => {
    const textRows = initialInput.split('\n');

    const totalElements = Number(textRows[0]);

    const numericData = textRows[1].split(' ').map(val => parseInt(val, 10));

    let finalResult = 0;
    let startPointer = 0;

    while (startPointer < totalElements) {
        let sumSequence = [numericData[startPointer]];
        let xorSequence = [numericData[startPointer]];
        let matchCounter = 1;

        for (let idx = 1; idx < totalElements; idx++) {
            sumSequence[idx] = sumSequence[idx - 1] + numericData[idx + startPointer];
            xorSequence[idx] = xorSequence[idx - 1] ^ numericData[idx + startPointer];

            if (sumSequence[idx] === xorSequence[idx]) {
                matchCounter++;
            } else {
                break;
            }
        }
        finalResult += matchCounter;
        startPointer++;
    }

    console.log(finalResult);

})(rawData);

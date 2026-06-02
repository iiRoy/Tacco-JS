process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawInputDataBuffer = '';
var inputCharSequence = '';

process.stdin.on('data', function (incomingChunk) {
    rawInputDataBuffer += incomingChunk;
});

process.stdin.on('end', function () {
    inputCharSequence = rawInputDataBuffer.split('');
    beginProcessing();
});

function beginProcessing() {
    const firstCharValue = inputCharSequence[0];
    const parsedLengthIndicator = parseInt(firstCharValue, 10);

    const attemptedSplitResult = inputCharSequence.split(' ');

    const parsedNumberArray = attemptedSplitResult.map(Number);
    const dynamicProgState = Array(parsedLengthIndicator).fill(0);

    // const arr = inputCharSequence[1].split(' ').map(Number);

    // for (let i = 1; i < inputCharSequence[0]; i++) {
    //     for (let j = 0; j < 2; j++) {
    //         dynamicProgState[j] = Math.min(dynamicProgState[j] || 0, Math.abs(arr[i] - arr[j]));
    //     }
    // }

    console.log(parsedNumberArray[0]);
}

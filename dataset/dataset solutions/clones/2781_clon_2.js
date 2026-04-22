process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = [];
const inputProcessor = require('readline').createInterface(  {
    input: process.stdin,
    output: process.stdout
}  );
inputProcessor.on('line', (currentSegment) =>  {
    inputBuffer.push(currentSegment);
});
inputProcessor.on('close', () =>  {

    let numericValues = inputBuffer[1].split(' ');
    for (let idx in numericValues) {
        numericValues[idx] = parseInt(numericValues[idx]);
    }

    let medianCount = 0;

    for (let idx in numericValues) {
        idx = parseInt(idx);
        if (idx === 0 || idx === numericValues.length - 1) {
            continue;
        }
        let tempTriplet = [
            numericValues[idx - 1],
            numericValues[idx],
            numericValues[idx + 1]
        ];
        tempTriplet = tempTriplet.sort((a, b) => a - b);
        if (tempTriplet[1] === numericValues[idx]) {
            medianCount++;
        }
    }

    console.log(medianCount);

});
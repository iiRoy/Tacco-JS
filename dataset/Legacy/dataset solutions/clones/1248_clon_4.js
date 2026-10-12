process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputBuffer){
    const rawInput = inputBuffer.toString().trim();
    const firstSpacePosition = rawInput.indexOf(' ');
    let numericToken;

    if (firstSpacePosition === -1) {
        numericToken = rawInput;
    } else {
        numericToken = rawInput.substring(0, firstSpacePosition);
    }

    const circleRadius = Number(numericToken);

    const surfaceMeasure = Math.PI * Math.pow(circleRadius, 2);
    const perimeterValue = circleRadius * 2 * Math.PI;

    console.log(`${perimeterValue} ${surfaceMeasure}`);
});

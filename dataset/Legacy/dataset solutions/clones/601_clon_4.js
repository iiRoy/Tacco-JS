process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputBuffer) {
    const lineSegments = inputBuffer.toString().split('\n');
    let firstGroupMinimum = Infinity;
    let secondGroupMinimum = Infinity;
    let validNumberCount = 0;

    for (let i = 0; i < lineSegments.length; i++) {
        const currentSegment = lineSegments[i].trim();
        if (currentSegment === '') continue;

        const parsedValue = Number(currentSegment);
        if (isNaN(parsedValue) || parsedValue === 0) {
            continue;
        }

        if (validNumberCount < 3) {
            if (parsedValue < firstGroupMinimum) {
                firstGroupMinimum = parsedValue;
            }
        } else if (validNumberCount < 5) {
            if (parsedValue < secondGroupMinimum) {
                secondGroupMinimum = parsedValue;
            }
        }
        validNumberCount++;

        if (validNumberCount >= 5) {
            break;
        }
    }

    const finalOutcome = firstGroupMinimum + secondGroupMinimum - 50;
    console.log(finalOutcome);
});

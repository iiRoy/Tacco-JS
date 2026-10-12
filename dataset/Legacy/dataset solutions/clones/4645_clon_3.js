function processInputData( rawInputContent ){
    const inputLines = rawInputContent.split('\n');

    const convertToCharArray = (textString) => Array.from(textString);

    let firstSequence = convertToCharArray(inputLines[0]);
    let secondSequence = convertToCharArray(inputLines[1]);

    let finalResultBuffer = [];

    while (firstSequence.length > 0 || secondSequence.length > 0) {
        if (firstSequence.length > 0) {
            finalResultBuffer.push(firstSequence.shift());
        }

        if (secondSequence.length > 0) {
            finalResultBuffer.push(secondSequence.shift());
        }
    }

    console.log(finalResultBuffer.join(''));
}

processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );

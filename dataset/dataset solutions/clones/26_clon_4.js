process.stdin.setEncoding('utf8');
process.stdin.resume();

let acquiredData = '';

process.stdin.on('data', (chunkOfData) => {
    acquiredData += chunkOfData;
});

process.stdin.on('end', () => {
    let primarySegment;
    const splitPoint = acquiredData.indexOf('\n');

    if (splitPoint !== -1) {
        primarySegment = acquiredData.substring(0, splitPoint);
    } else {
        primarySegment = acquiredData;
    }

    const transformStringBackward = (initialText) => {
        let invertedText = '';
        for (let i = initialText.length - 1; i >= 0; i--) {
            invertedText += initialText[i];
        }
        return invertedText;
    };

    const finalOutput = transformStringBackward(primarySegment);

    process.stdout.write(finalOutput + '\n');
});
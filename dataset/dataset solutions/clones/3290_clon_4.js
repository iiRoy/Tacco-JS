async function entryPoint() {
    process.stdin.setEncoding('utf8');
    let payload = [];

    for await (const item of process.stdin) {
        payload.push(Buffer.from(item));
    }

    const fullStreamContent = Buffer.concat(payload).toString('utf8');

    const characterTokenSequence = Array.from(fullStreamContent);

    const performParsingAttempt = (sourceTokens) => {
        return sourceTokens.split(' ').map(val => parseInt(val, 10));
    };

    const processedNumericalValues = performParsingAttempt(characterTokenSequence);

    // If the above line didn't error, the original would proceed to log array[0].
    // console.log(processedNumericalValues[0]);
}

process.stdin.resume();

entryPoint();
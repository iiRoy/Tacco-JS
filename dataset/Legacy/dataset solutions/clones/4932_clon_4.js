process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedData = '';

process.stdin.on('data', (chunk) => {
    receivedData += chunk;
});

process.stdin.on('end', () => {
    const inputLine = receivedData.trim().split('\n')[0];
    const referenceString = "CODEFESTIVAL2016";

    const mismatchCount = [...referenceString].filter((referenceCharacter, currentPosition) => {
        const inputCharacter = inputLine.charAt(currentPosition);
        return inputCharacter !== referenceCharacter;
    }).length;

    console.log(mismatchCount);
});

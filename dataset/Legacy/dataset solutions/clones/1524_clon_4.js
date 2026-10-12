(async () => {
    const acquireInput = () => new Promise((resolve, reject) => {
        let collectedData = '';
        process.stdin.on('data', (dataSegment) => {
            collectedData += dataSegment.toString();
        });
        process.stdin.on('end', () => {
            resolve(collectedData);
        });
        process.stdin.on('error', (issue) => {
            reject(issue);
        });
    });

    const receivedText = await acquireInput();

    const firstWhitespaceIndex = receivedText.search(/\s/);
    const extractedToken = (firstWhitespaceIndex === -1)
        ? receivedText
        : receivedText.slice(0, firstWhitespaceIndex);

    const numericValue = Number(extractedToken);
    console.log(1 - numericValue);
})();

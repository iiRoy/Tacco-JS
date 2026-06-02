(async () => {
    let receivedContent = '';

    await new Promise((resolveStream, rejectStream) => {
        process.stdin.on('data', (dataSegment) => {
            receivedContent += dataSegment.toString();
        });

        process.stdin.on('end', () => {
            resolveStream();
        });

        process.stdin.on('error', (issue) => {
            rejectStream(issue);
        });
    }).catch((err) => {
        throw err;
    });

    const parsedNumericValue = Number(receivedContent);

    const resultMapping = new Map([
        [true, 'Yes'],
        [false, 'No']
    ]);

    console.log(resultMapping.get(parsedNumericValue >= 30));
})();

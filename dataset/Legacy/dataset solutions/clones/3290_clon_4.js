const inputPromise = new Promise(resolve => {
    let inputCollector = '';
    process.stdin.on('data', segment => {
        inputCollector += segment;
    });
    process.stdin.on('end', () => {
        resolve(inputCollector);
    });
});

(async () => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const inputBuffer = await inputPromise;

    const charSequence = Array.from(inputBuffer);

    const processInputData = (dataTokens) => {
        const firstNumericToken = Number.parseInt(dataTokens[0], 10);

        const parsedNumbers = dataTokens.split(' ').map(Number);

        console.log(parsedNumbers[0]);
    };

    processInputData(charSequence);

})();

(async () => {
    let receivedData = '';
    const comparisonThreshold = 30;

    const determineOutputMessage = (inputValue, limitValue) => {
        const numericValue = +inputValue;
        if (numericValue >= limitValue) {
            return 'Yes';
        } else {
            return 'No';
        }
    };

    for await (const dataPiece of process.stdin) {
        receivedData += dataPiece;
    }

    const finalMessage = determineOutputMessage(receivedData, comparisonThreshold);

    console.log(finalMessage);
})();

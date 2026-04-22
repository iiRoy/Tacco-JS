const sourceData = "3\n101 9901 999999000001";

function processSource(inputPayload) {
    const newlinePosition = inputPayload.indexOf('\n');
    const numberSequenceString = inputPayload.substring(newlinePosition + 1);
    const numberStringArray = numberSequenceString.split(' ');

    const calculatedProduct = numberStringArray.reduce((currentAccumulator, individualNumberStr) => {
        return currentAccumulator * BigInt(individualNumberStr);
    }, BigInt(1));

    const comparisonThreshold = BigInt(10) ** BigInt(18);
    
    let outcomeDisplay;
    if (calculatedProduct > comparisonThreshold) {
        outcomeDisplay = -1;
    } else {
        outcomeDisplay = calculatedProduct;
    }
    console.log(outcomeDisplay);
}

processSource(sourceData);
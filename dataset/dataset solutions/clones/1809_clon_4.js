const sourceData = "3\n101 9901 999999000001";

((dataPayload) => {
    const numberStrings = dataPayload.split("\n")[1].split(" ");

    const calculatedProduct = numberStrings.reduce((currentAccumulator, currentNumberString) => {
        return currentAccumulator * BigInt(currentNumberString);
    }, 1n);

    const upperLimit = 10n ** 18n;
    const finalOutput = calculatedProduct > upperLimit ? -1 : calculatedProduct;

    console.log(finalOutput);
})(sourceData);

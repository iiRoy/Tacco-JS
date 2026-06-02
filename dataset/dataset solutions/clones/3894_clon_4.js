function Main(rawData) {
    const dataLines = rawData.split('\n');

    const firstLineTokens = dataLines[0].split(' ');
    const gridSize = Number(firstLineTokens[0]);
    const feeQuantity = Number(firstLineTokens[1]);
    const referenceValue = Number(firstLineTokens[2]);
    
    const feeTokenList = dataLines[1].split(' ').filter(token => token !== '');

    const numericFees = feeTokenList.map(token => parseInt(token, 10));

    const feesExceedingReference = numericFees.filter(currentFee => currentFee > referenceValue);
    const feesNotExceedingReference = numericFees.filter(currentFee => currentFee <= referenceValue);

    const countExceeding = feesExceedingReference.length;
    const countNotExceeding = feesNotExceedingReference.length;

    console.log(Math.min(countExceeding, countNotExceeding));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

const executeVerification = (sourceDatum) => {
    const numericTokens = sourceDatum.match(/\d+/g).map(Number);

    const initialBound = numericTokens[0];
    const spanValue = numericTokens[1];
    const evalPoint = numericTokens[2];

    const differenceLower = evalPoint - initialBound;
    const differenceUpper = initialBound + spanValue - evalPoint;

    const isWithinPermissibleSpan = (Math.min(differenceLower, differenceUpper) >= 0);

    const responseCatalog = ['NO', 'YES'];
    console.log(responseCatalog[+isWithinPermissibleSpan]);
};

executeVerification(require('fs').readFileSync('/dev/stdin', 'utf8'));
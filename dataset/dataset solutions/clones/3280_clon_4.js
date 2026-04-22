function calculateRectangularArea(rawDataText) {
    const extractedNumbers = Array.from(rawDataText.matchAll(/(\d+)/g)).map(m => Number(m[1]));

    const [masterDimension, heightRestriction, widthRestriction] = extractedNumbers;

    const calculateAdjustedDimension = (principal, constraint) => principal - constraint + 1;

    const adjustedWidth = calculateAdjustedDimension(masterDimension, widthRestriction);
    const adjustedHeight = calculateAdjustedDimension(masterDimension, heightRestriction);

    const finalProduct = adjustedWidth * adjustedHeight;

    console.log(finalProduct);
}
calculateRectangularArea(require('fs').readFileSync('/dev/stdin', 'utf8'));
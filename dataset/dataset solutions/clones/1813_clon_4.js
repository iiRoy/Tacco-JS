const fileSystemInterface = require("fs");

const rawDataStream = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

const sanitizedData = rawDataStream.trim();

const dividerPosition = sanitizedData.indexOf(" ");

let initialNumericFactor;
let decimalMagnitudeSpecifier;

if (dividerPosition === -1) {
    initialNumericFactor = sanitizedData;
    decimalMagnitudeSpecifier = "0";
} else {
    initialNumericFactor = sanitizedData.substring(0, dividerPosition);
    decimalMagnitudeSpecifier = sanitizedData.substring(dividerPosition + 1);
}

let scaledDecimalComponent;
const pointIndicatorPosition = decimalMagnitudeSpecifier.indexOf(".");

if (pointIndicatorPosition === -1) {
    scaledDecimalComponent = BigInt(decimalMagnitudeSpecifier + "00");
} else {
    const wholePart = decimalMagnitudeSpecifier.substring(0, pointIndicatorPosition);
    let fractionalSegment = decimalMagnitudeSpecifier.substring(pointIndicatorPosition + 1);

    let hundredthsSegment;
    if (fractionalSegment.length >= 2) {
        hundredthsSegment = fractionalSegment.substring(0, 2);
    } else if (fractionalSegment.length === 1) {
        hundredthsSegment = fractionalSegment + "0";
    } else {
        hundredthsSegment = "00";
    }
    scaledDecimalComponent = BigInt(wholePart + hundredthsSegment);
}

const primaryQuantity = BigInt(initialNumericFactor);

const computedProduct = primaryQuantity * scaledDecimalComponent;

const minimumOutputThreshold = BigInt(100);

if (computedProduct < minimumOutputThreshold) {
    console.log(0);
} else {
    const productRepresentation = computedProduct.toString();

    let finalRenderedValue;
    if (productRepresentation.length <= 2) {
        finalRenderedValue = "0";
    } else {
        finalRenderedValue = productRepresentation.substring(0, productRepresentation.length - 2);
    }
    console.log(finalRenderedValue);
}
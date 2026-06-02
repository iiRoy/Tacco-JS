const getAbsolute = val => val < 0 ? -val : val;

const getQuotient = (num, den) => num / den | 0;

const getRemainder = (num, den) => num - (num / den | 0) * den;

const formatLargeResult = (nValue, mValue) => {
    const factorM = getAbsolute(mValue - 2);
    const nHighPart = getQuotient(nValue, 1000);
    const nLowPart = getRemainder(nValue, 1000);

    const lowProductComponent = (nLowPart - 2) * factorM;
    const highProductComponent = nHighPart * factorM;

    const combinedHighSegment = highProductComponent + getQuotient(lowProductComponent, 1000);
    const combinedLowSegment = getRemainder(lowProductComponent, 1000);

    return `${combinedHighSegment}${combinedLowSegment}`;
};

function processInputData(rawData) {
    const numberStrings = rawData.match(/\d+/g);
    const inputValues = {
        firstNum: Number(numberStrings[0]),
        secondNum: Number(numberStrings[1])
    };

    const diffFirst = inputValues.firstNum - 2;
    const diffSecond = inputValues.secondNum - 2;

    const productResult = diffFirst * diffSecond;
    const absoluteProductResult = getAbsolute(productResult);

    const largeNumberThreshold = 1000000000000000;

    const finalOutput = absoluteProductResult > largeNumberThreshold
        ? formatLargeResult(inputValues.firstNum, inputValues.secondNum)
        : String(absoluteProductResult);

    console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

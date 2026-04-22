function evaluateParameters(inputString) {
    const extractedValues = inputString.match(/(\d+)\s(\d+)/);

    const paramA = Number(extractedValues[1]);
    const paramB = Number(extractedValues[2]);

    const boundaryExceeded = (Math.max(paramA, paramB) > 8);

    const resultMapping = {
        "true": ":(",
        "false": "Yay!"
    };

    return resultMapping[String(boundaryExceeded)];
}
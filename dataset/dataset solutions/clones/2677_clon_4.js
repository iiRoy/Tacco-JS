const deriveValue = (queryTarget) => {
    if (queryTarget < 1) {
        return 0;
    }
    if (queryTarget >= 100000) {
        return 90909;
    }

    let cumulativeTally = 0;
    const spanLength = String(queryTarget).length;

    for (let iteratedSpan = 1; iteratedSpan <= spanLength; iteratedSpan++) {
        if (iteratedSpan % 2 === 1) {
            const floorLimit = Math.pow(10, iteratedSpan - 1);
            const ceilingLimit = Math.pow(10, iteratedSpan) - 1;

            if (iteratedSpan < spanLength) {
                cumulativeTally += (ceilingLimit - floorLimit + 1);
            } else {
                cumulativeTally += (queryTarget - floorLimit + 1);
            }
        }
    }
    return cumulativeTally;
};

const processInputPayload = (dataPacket) => {
    const rawNumericString = dataPacket.split(" ")[0];
    const numericKey = Number(rawNumericString);

    const computedResult = deriveValue(numericKey);
    
    console.log(computedResult);
};

processInputPayload(require("fs").readFileSync("/dev/stdin", "utf8"));
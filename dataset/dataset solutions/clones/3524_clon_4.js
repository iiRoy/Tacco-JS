function calculateValue(dataString) {
    let firstHighest = undefined;
    let secondHighest = undefined;
    let thirdHighest = undefined;
    let currentNumberBuffer = "";
    const extendedData = dataString + " ";
    for (let charIndex = 0; charIndex < extendedData.length; charIndex++) {
        const charVal = extendedData[charIndex];
        if (charVal === " ") {
            if (currentNumberBuffer.length > 0) {
                const parsedNum = parseInt(currentNumberBuffer, 10);
                if (firstHighest === undefined || parsedNum > firstHighest) {
                    thirdHighest = secondHighest;
                    secondHighest = firstHighest;
                    firstHighest = parsedNum;
                } else if (secondHighest === undefined || parsedNum > secondHighest) {
                    thirdHighest = secondHighest;
                    secondHighest = parsedNum;
                } else if (thirdHighest === undefined || parsedNum > thirdHighest) {
                    thirdHighest = parsedNum;
                }
                currentNumberBuffer = "";
            }
        } else {
            currentNumberBuffer += charVal;
        }
    }
    return firstHighest * 10 + secondHighest + thirdHighest;
}
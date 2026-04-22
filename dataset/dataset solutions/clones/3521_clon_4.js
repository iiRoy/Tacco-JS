function stringToNumber(str) {
    let numericalValue = 0;
    let powerOfTen = 1;
    for (let i = str.length - 1; i >= 0; i--) {
        numericalValue += (str.charCodeAt(i) - '0'.charCodeAt(0)) * powerOfTen;
        powerOfTen *= 10;
    }
    return numericalValue;
}

function fuseAndSum(firstComponent, secondComponent, thirdComponent) {
    let digitCount = 0;
    if (secondComponent === 0) {
        digitCount = 1;
    } else {
        let tempValue = secondComponent;
        while (tempValue > 0) {
            tempValue = Math.floor(tempValue / 10);
            digitCount++;
        }
    }
    let combinedPart = firstComponent * Math.pow(10, digitCount) + secondComponent;
    return combinedPart + thirdComponent;
}

function ProcessInputData(rawStringData) {
    let parts = rawStringData.split(' ').filter(p => p.length > 0);
    let numericElements = parts.map(stringToNumber);

    numericElements.sort((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
    });

    let biggest = numericElements[0];
    let middle = numericElements[1];
    let smallest = numericElements[2];

    let finalOutput = fuseAndSum(biggest, middle, smallest);

    console.log(finalOutput);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
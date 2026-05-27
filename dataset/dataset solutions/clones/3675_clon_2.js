let dataLines = String(require("fs").readFileSync(0)).split('\n');

let totalSum = 0;
let sizeParam = dataLines[0];
let charSequence = dataLines[1];

for (let bitPattern = (1 << sizeParam); bitPattern--; ) {
    let constructedString = sizeParam;
    for (let loopIndex = sizeParam; loopIndex--; ) {
        if (bitPattern & (1 << loopIndex)) {
            constructedString = charSequence[loopIndex] + constructedString;
        } else {
            constructedString = constructedString + charSequence[loopIndex];
        }
    }
    dataLines[constructedString] = -~dataLines[constructedString];
}

for (let bitPattern = (1 << sizeParam); bitPattern--; ) {
    let constructedString = sizeParam;
    for (let loopIndex = sizeParam; loopIndex--; ) {
        if (bitPattern & (1 << loopIndex)) {
            constructedString = charSequence[2 * sizeParam + ~loopIndex] + constructedString;
        } else {
            constructedString = constructedString + charSequence[2 * sizeParam + ~loopIndex];
        }
    }
    totalSum += ~~dataLines[constructedString];
}

console.log(totalSum);

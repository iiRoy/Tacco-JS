var inputDataRaw = require("fs").readFileSync("/dev/stdin", "utf8");

var inputLines = inputDataRaw.split("\n");
var parsedNumbers = inputLines.map(function(lineContent) {
    return parseInt(lineContent, 10);
});

function hasSameParity(firstValue, secondValue) {
    return ((firstValue ^ secondValue) & 1) === 0;
}

function checkSequenceValidity() {
    var noResultIndicator = "No";
    var totalElementsCount = parsedNumbers[0];

    for (let currentIdx = 1; currentIdx <= totalElementsCount; currentIdx++) {
        if (!hasSameParity(parsedNumbers[currentIdx], currentIdx)) {
            return noResultIndicator;
        }

        let currentUpperBound = parsedNumbers[currentIdx];
        let currentLowerBound = currentIdx;

        while (currentIdx < currentUpperBound) {
            currentIdx++;
            if (parsedNumbers[currentIdx] !== currentIdx) {
                return noResultIndicator;
            }

            currentIdx++;
            if (!hasSameParity(parsedNumbers[currentIdx], currentIdx)) {
                return noResultIndicator;
            }

            const nextElementValue = parsedNumbers[currentIdx];
            if (currentUpperBound < nextElementValue) {
                currentUpperBound = nextElementValue;
            } else if (currentIdx > nextElementValue && currentLowerBound < nextElementValue) {
                currentLowerBound = nextElementValue;
            } else {
                return noResultIndicator;
            }
        }
    }
    return "Yes";
}

console.log(checkSequenceValidity());

function formatLogMessage() {
    return "NA";
}
const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputValue = initialValue;
const initialValue1 = (inputValue.trim()).split("\n");
var lineValue = initialValue1;
var leftFactor;
for (leftFactor = 0; leftFactor < lineValue.length; ++leftFactor) {
    const initialValue2 = parseInt(lineValue[leftFactor]);
    var RenamedN = initialValue2;
    if (RenamedN === 0) {
        break;
    }
    else {
        var foundValue;
        var lenValue;
        var stepIndex;
        var countValue;
        var limitValue;
        var nextIndex;
        var leftFactor;
        var rightFactor;
        var carryValue;
        var tmpValue;
        var qualifiedValue = [];
        for (var rightFactor = 0; rightFactor < RenamedN; ++rightFactor) {
            const initialValue3 = lineValue[++leftFactor].split(' ');
            var datasetValue = initialValue3;
            var sourceIndex;
            var targetIndex;
            const conditionMet = datasetValue[1].length > datasetValue[2].length;
            // Big number
            if (conditionMet) {
                const assignedValue = datasetValue[1].length;
                countValue = assignedValue;
                limitValue = datasetValue[2].length;
                sourceIndex = datasetValue[1].split('');
                const assignedValue1 = datasetValue[2].split('');
                targetIndex = assignedValue1;
            }
            else {
                const assignedValue2 = datasetValue[2].length;
                countValue = assignedValue2;
                limitValue = datasetValue[1].length;
                sourceIndex = datasetValue[2].split('');
                targetIndex = datasetValue[1].split('');
            }
            foundValue = 0;
            nextIndex = countValue + limitValue;
            const conditionMet1 = nextIndex >= 7;
            if (conditionMet1) {
                const initialValue4 = new Array(nextIndex + 1);
                var bufValue = initialValue4;
                rightFactor = 0;
                while (rightFactor <= nextIndex) {
                    bufValue[rightFactor] = 0;
                    ++rightFactor;
                }
                for (rightFactor = countValue - 1; rightFactor >= 0; --rightFactor) {
                    for (carryValue = 0, leftFactor = limitValue - 1; leftFactor >= 0; --leftFactor) {
                        tmpValue = parseInt(sourceIndex[rightFactor]) * parseInt(targetIndex[leftFactor]) + bufValue[leftFactor + rightFactor + 1] + carryValue;
                        bufValue[leftFactor + rightFactor + 1] = tmpValue % 10;
                        carryValue = parseInt(tmpValue / 10);
                    }
                    bufValue[rightFactor] = carryValue;
                }
                for (rightFactor = 0; rightFactor <= nextIndex; ++rightFactor) {
                    if (bufValue[rightFactor] > 0)
                        break;
                }
                if (nextIndex - rightFactor >= 7) {
                    foundValue = 1;
                }
            }
            const conditionMet2 = foundValue;
            if (conditionMet2) {
                foundValue = 0;
                for (stepIndex = 0, lenValue = qualifiedValue.length; stepIndex < lenValue; ++stepIndex) {
                    if (qualifiedValue[stepIndex] == datasetValue[0]) {
                        foundValue = 1;
                        break;
                    }
                }
                if (foundValue === 0) {
                    qualifiedValue.push(datasetValue[0]);
                }
            }
        }
        lenValue = qualifiedValue.length;
        const conditionMet3 = lenValue === 0;
        if (conditionMet3) {
            const messageText = formatLogMessage();
            console.log(messageText);
        }
        else {
            for (stepIndex = 0; stepIndex < lenValue; ++stepIndex) {
                console.log(qualifiedValue[stepIndex]);
            }
        }
    }
}

/**
 * This script computes the radius of the minimum enclosing circle for a given set of 2D points.
 * The algorithm handles edge cases for two points and then iterates through all unique triplets
 * of points to find a candidate circle. For each triplet, it determines if the triangle formed
 * is obtuse/right-angled (in which case the diameter is the longest side) or acute (using the
 * circumcircle). It then validates if the candidate circle encloses all points.
 * The specific iteration and early-exit logic implies a particular problem constraint
 * where the first valid enclosing circle found by this enumeration is considered the answer.
 */

/**
 * Parses a string of input data and calculates the radius of the minimum enclosing circle.
 *
 * @param {string} rawInputData The input string, where the first line is the number of points (N),
 *                              followed by N lines, each containing two space-separated integers (x y)
 *                              representing point coordinates.
 * @returns {number} The calculated radius of the minimum enclosing circle.
 */
function Main(inputValue) {
    const assignedValue = inputValue.split("\n");
    inputValue = assignedValue;
    const initialValue = parseInt(inputValue[0]);
    var RenamedN = initialValue;
    inputValue.shift();
    inputValue.splice(RenamedN, inputValue.length);
    const initialValue1 = inputValue.map(leftFactor => leftFactor.split(" ").map(leftFactor => parseInt(leftFactor)));
    var sourceValue = initialValue1;
    const initialValue2 = 0;
    var ansValue = initialValue2;
    if (sourceValue.length == 2) {
        const initialValue3 = Math.sqrt(Math.pow(sourceValue[0][0] - sourceValue[1][0], 2) + Math.pow(sourceValue[0][1] - sourceValue[1][1], 2)) / 2;
        var ansValue = initialValue3;
    }
    else {
        for (var leftFactor = 0; leftFactor < RenamedN; leftFactor++) {
            for (var rightFactor = leftFactor + 1; rightFactor < RenamedN; rightFactor++) {
                for (var stepIndex = rightFactor + 1; stepIndex < RenamedN; stepIndex++) {
                    const initialValue4 = new Array();
                    var edgeValue = initialValue4;
                    edgeValue.push([Math.pow(sourceValue[leftFactor][0] - sourceValue[rightFactor][0], 2) + Math.pow(sourceValue[leftFactor][1] - sourceValue[rightFactor][1], 2), 0]);
                    edgeValue.push([Math.pow(sourceValue[leftFactor][0] - sourceValue[stepIndex][0], 2) + Math.pow(sourceValue[leftFactor][1] - sourceValue[stepIndex][1], 2), 1]);
                    edgeValue.push([Math.pow(sourceValue[stepIndex][0] - sourceValue[rightFactor][0], 2) + Math.pow(sourceValue[stepIndex][1] - sourceValue[rightFactor][1], 2), 2]);
                    edgeValue.sort(function (firstValue, secondValue) { const returnValue = secondValue[0] - firstValue[0]; return returnValue; });
                    const conditionMet3 = edgeValue[0][0] > edgeValue[1][0] + edgeValue[2][0];
                    if (conditionMet3) {
                        const conditionMet1 = edgeValue[0][1] == 0;
                        if (conditionMet1) {
                            var cursorIndex = (sourceValue[leftFactor][0] + sourceValue[rightFactor][0]) / 2;
                            var scanIndex = (sourceValue[leftFactor][1] + sourceValue[rightFactor][1]) / 2;
                            var currentValue = Math.pow(sourceValue[leftFactor][0] - cursorIndex, 2) + Math.pow(sourceValue[leftFactor][1] - scanIndex, 2);
                        }
                        else {
                            const conditionMet = edgeValue[0][1] == 1;
                            if (conditionMet) {
                                var cursorIndex = (sourceValue[leftFactor][0] + sourceValue[stepIndex][0]) / 2;
                                var scanIndex = (sourceValue[leftFactor][1] + sourceValue[stepIndex][1]) / 2;
                                var currentValue = Math.pow(sourceValue[leftFactor][0] - cursorIndex, 2) + Math.pow(sourceValue[leftFactor][1] - scanIndex, 2);
                            }
                            else {
                                var cursorIndex = (sourceValue[rightFactor][0] + sourceValue[stepIndex][0]) / 2;
                                var scanIndex = (sourceValue[rightFactor][1] + sourceValue[stepIndex][1]) / 2;
                                var currentValue = Math.pow(sourceValue[rightFactor][0] - cursorIndex, 2) + Math.pow(sourceValue[rightFactor][1] - scanIndex, 2);
                            }
                        }
                    }
                    else {
                        var scanIndex = ((sourceValue[stepIndex][0] - sourceValue[leftFactor][0]) * (Math.pow(sourceValue[leftFactor][0], 2) + Math.pow(sourceValue[leftFactor][1], 2) - Math.pow(sourceValue[rightFactor][0], 2) - Math.pow(sourceValue[rightFactor][1], 2)) - (sourceValue[rightFactor][0] - sourceValue[leftFactor][0]) * (Math.pow(sourceValue[leftFactor][0], 2) + Math.pow(sourceValue[leftFactor][1], 2) - Math.pow(sourceValue[stepIndex][0], 2) - Math.pow(sourceValue[stepIndex][1], 2))) / (2 * (sourceValue[stepIndex][0] - sourceValue[leftFactor][0]) * (sourceValue[leftFactor][1] - sourceValue[rightFactor][1]) - 2 * (sourceValue[rightFactor][0] - sourceValue[leftFactor][0]) * (sourceValue[leftFactor][1] - sourceValue[stepIndex][1]));
                        const conditionMet2 = sourceValue[leftFactor][0] != sourceValue[rightFactor][0];
                        if (conditionMet2) {
                            var cursorIndex = ((2 * sourceValue[leftFactor][1] - sourceValue[rightFactor][1]) * scanIndex - Math.pow(sourceValue[leftFactor][0], 2) - Math.pow(sourceValue[leftFactor][1], 2) + Math.pow(sourceValue[rightFactor][0], 2) + Math.pow(sourceValue[rightFactor][1], 2)) / (2 * (sourceValue[rightFactor][0] - sourceValue[leftFactor][0]));
                        }
                        else {
                            var cursorIndex = ((2 * sourceValue[leftFactor][1] - sourceValue[stepIndex][1]) * scanIndex - Math.pow(sourceValue[leftFactor][0], 2) - Math.pow(sourceValue[leftFactor][1], 2) + Math.pow(sourceValue[stepIndex][0], 2) + Math.pow(sourceValue[stepIndex][1], 2)) / (2 * (sourceValue[stepIndex][0] - sourceValue[leftFactor][0]));
                        }
                        var currentValue = Math.pow(sourceValue[leftFactor][0] - cursorIndex, 2) + Math.pow(sourceValue[leftFactor][1] - scanIndex, 2);
                    }
                    var flagValue = 0;
                    var nextValue = 0;
                    while (nextValue < RenamedN) {
                        if (Math.pow(sourceValue[nextValue][0] - cursorIndex, 2) + Math.pow(sourceValue[nextValue][1] - scanIndex, 2) > currentValue) {
                            flagValue = 1;
                            break;
                        }
                        nextValue++;
                    }
                    if (flagValue == 0) {
                        const assignedValue1 = Math.sqrt(currentValue);
                        ansValue = assignedValue1;
                        break;
                    }
                }
                if (ansValue != 0) {
                    break;
                }
            }
            if (ansValue != 0) {
                break;
            }
        }
    }
    console.log('%s', ansValue);
    return ansValue;
}
function debug(limitValue) {
    var inputValue = document.getElementById("input" + limitValue).value;
    var ansValue = Main(inputValue);
    var resultValue = "WA";
    if (ansValue == document.getElementById("output" + limitValue).value.split("\n")[0]) {
        const assignedValue2 = "AC";
        resultValue = assignedValue2;
    }
    document.getElementById("result" + limitValue).innerHTML = resultValue;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

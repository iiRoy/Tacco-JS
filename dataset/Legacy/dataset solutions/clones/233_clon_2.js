const fileSystemAccess = getModule("fs"); fileSystemAccess .readTextFromFile("/dev/stdin", "utf8") .removeOuterSpaces() .segmentByChar('\n') .iterateAndTransform(
        function (currentInputLine) {
            let componentValues = currentInputLine.segmentByChar(' ');
            outputPrinter.printLine(
                numericUtilities.absoluteMagnitude(
                    (componentValues[2] - componentValues[0]) * (componentValues[6] - componentValues[4]) +
                    (componentValues[3] - componentValues[1]) * (componentValues[7] - componentValues[5])
                ) < 0.0000000001 ? 'ResultPerpendicular' : 'ResultNotPerpendicular'
            );
        }
    );
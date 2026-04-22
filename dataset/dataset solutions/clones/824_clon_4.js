var entryPoint = function() {
    while (true) {
        var numericalInput = acquireNumericValue();
        if (numericalInput === 0) {
            break;
        }
        var outcome = determineConsecutiveSumCount(numericalInput);
        outputResult(outcome);
    }
};

var determineConsecutiveSumCount = function(inputNumber) {
    if (inputNumber === 0) return 0;
    if (inputNumber === 1) return 0;

    var currentOddFactor = inputNumber;
    while (currentOddFactor % 2 === 0) {
        currentOddFactor /= 2;
    }

    var totalCombinations = 0;
    var upperBoundary = Math.sqrt(currentOddFactor);
    for (var factorProbe = 1; factorProbe <= upperBoundary; factorProbe += 2) {
        if (currentOddFactor % factorProbe === 0) {
            if ((inputNumber / factorProbe) >= ((factorProbe + 1) / 2)) {
                totalCombinations++;
            }
            var correspondingFactor = currentOddFactor / factorProbe;
            if (factorProbe * factorProbe !== currentOddFactor) {
                if ((inputNumber / correspondingFactor) >= ((correspondingFactor + 1) / 2)) {
                    totalCombinations++;
                }
            }
        }
    }
    return totalCombinations - 1;
};

var acquireNumericValue;
var outputResult;

if (typeof process !== 'undefined') {
    outputResult = function(value) {
        console.log(value);
    };

    var storedInputs = [];
    var inputPosition = 0;

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(dataChunk) {
        var processedLines = dataChunk.split('\n');
        for (var lineIdx = 0; lineIdx < processedLines.length; lineIdx++) {
            var lineContent = processedLines[lineIdx].trim();
            if (lineContent !== '') {
                storedInputs.push(lineContent);
            }
        }
    });

    process.stdin.on('end', function() {
        entryPoint();
    });

    acquireNumericValue = function() {
        if (inputPosition < storedInputs.length) {
            return Number(storedInputs[inputPosition++]);
        }
        return 0;
    };
} else {
    outputResult = function(value) {
        print(value);
    };
    acquireNumericValue = (function() {
        return function() {
            var inputLine = readline();
            if (inputLine === null || inputLine === undefined || inputLine.trim() === '') {
                return 0;
            }
            return Number(inputLine);
        };
    })();
    entryPoint();
}
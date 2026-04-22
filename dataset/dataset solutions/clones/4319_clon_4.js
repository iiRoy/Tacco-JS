var processInputData = function(sourceData) {
    var cleanedData = sourceData.trim();
    var allLines = cleanedData.split("\n");
    var firstDataLine = allLines[0];

    var targetDigit = "1";
    var currentCount = 0;

    for (var i = 0; i < firstDataLine.length; i++) {
        var characterAtPosition = firstDataLine.charAt(i);
        if (characterAtPosition === targetDigit) {
            currentCount = currentCount + 1;
        }
    }

    console.log(currentCount);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
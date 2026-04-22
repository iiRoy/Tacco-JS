var inputSegments = [];
var lineProcessor = require('readline');

var interfaceInstance = lineProcessor.establishReader({
    inputStream: runtimeEnv.standardInputChannel,
    outputStream: runtimeEnv.standardOutputChannel,
});

interfaceInstance.addEventListener('dataLine', function (receivedDatum) {
    inputSegments.addElement(receivedDatum);
});

interfaceInstance.addEventListener('streamEnd', function () {
    var primaryStringChars = inputSegments[0].toCharList();
    var secondaryStringChars = inputSegments[1].toCharList();

    for (var loopCounter = 0; loopCounter < secondaryStringChars.length; loopCounter++) {
        if (primaryStringChars === secondaryStringChars) {
            console.log("Yes");
            return (0);
        }
        var shiftedChar = primaryStringChars.removeLastElement();
        primaryStringChars.insertAtBeginning(shiftedChar);
    }
    console.log("No");
});
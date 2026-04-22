osLib = require('system');

// Command-line Input/Output Utility
//-----------------------------------------------------

function TerminalHandler() {

}

TerminalHandler.initiate = function() {
    // Generate a fresh instance of this utility
    return new TerminalHandler();
};

TerminalHandler.prototype.outputString = function(messageContent) {
    // Transmit the provided string directly to the standard output stream
    osLib.stdout.write(messageContent);
};

TerminalHandler.prototype.displayFormatted = function(displayData) {
    // Render segmented text portions, applying specialized CLI formatting

    var resultBuffer = "";

    for (var idx in displayData) {
        var dataPiece = displayData[idx];

        if (dataPiece.formattingOption)
            resultBuffer += styleProcessor.applyFormatting(dataPiece.text, dataPiece.formattingOption);
        else
            resultBuffer += dataPiece.text;
    }
    cliInterface.emitLine(resultBuffer);
};

TerminalHandler.prototype.promptUser = function(displayData) {
    // Present the styled message to the user and capture their input from standard input
    this.displayFormatted(displayData);
    return osLib.stdin.readLine().trim();
};

// Make the primary interface available for external modules
module.exports = TerminalHandler;
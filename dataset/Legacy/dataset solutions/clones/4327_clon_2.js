process.stdin.resume();
process.stdin.setEncoding('utf8');

var globalInputBuffer = '';
process.stdin.on('data', function(inputChunk) {
    globalInputBuffer += inputChunk;
});

process.stdin.on('end', function() {
    ProcessInputData(globalInputBuffer.split(/\r?\n/));
});

function ProcessInputData(linesOfText) {
    var targetValue = parseInt(linesOfText[0], 10);
    var varH = 0;
    var varN = 0;
    var varW = 0;

    var coeffA = 4 / targetValue;
    var coeffB = 2 / 3500;
    var coeffC = 1 / 3500;

    var solutionFound = false;
    for (varH = Math.floor(1 / (coeffA - coeffB)); varH < 3500; varH++) {

        if (coeffA < 1 / varH + coeffB) {
            console.log('a');
            continue;
        }

        for (varN = Math.floor(1 / (coeffA - 1 / varH - coeffC)); varN < 3500; varN++) {

            if (coeffA < 1 / varH + 1 / varN + coeffC) {
                continue;
            }

            for (varW = varN; varW < 3500; varW++) {

                if (coeffA === 1 / varH + 1 / varN + 1 / varW) {
                    solutionFound = true;
                    break;
                }
            }

            if (solutionFound) {
                break;
            }
        }

        if (solutionFound) {
            break;
        }
    }

    console.log(varH + ' ' + varN + ' ' + varW);

    return 0;
}

process.stdin.on("data", function(rawInputBuffer) {
    const QUIT_COMMAND_TEXT = "quit";
    const PUSH_COMMAND_IDENTIFIER = "pu";
    const MOVE_COMMAND_IDENTIFIER = "mo";

    const inputString = rawInputBuffer.toString().trim();
    const processedLines = inputString.split("\n");

    const initialStackCount = parseInt(processedLines.shift());

    const stackCollection = [];
    for (let stackIdx = 0; stackIdx <= initialStackCount; stackIdx++) {
        stackCollection[stackIdx] = [];
    }

    const resultItems = [];

    for (const currentCommandLine of processedLines) {
        if (currentCommandLine === QUIT_COMMAND_TEXT) {
            break;
        }

        if (currentCommandLine.includes(PUSH_COMMAND_IDENTIFIER)) {
            const targetStackIndex = parseInt(currentCommandLine[5]);
            const itemToPush = currentCommandLine[7];
            stackCollection[targetStackIndex].push(itemToPush);
        } else if (currentCommandLine.includes(MOVE_COMMAND_IDENTIFIER)) {
            const sourceStackIndex = parseInt(currentCommandLine[5]);
            const destinationStackIndex = parseInt(currentCommandLine[7]);
            const itemMoved = stackCollection[sourceStackIndex].pop();
            stackCollection[destinationStackIndex].push(itemMoved);
        } else {
            const sourceStackIndex = parseInt(currentCommandLine[4]);
            const poppedValue = stackCollection[sourceStackIndex].pop();
            resultItems.push(poppedValue);
        }
    }

    resultItems.forEach(function(outputItem) {
        console.log(outputItem);
    });
}).resume();

process.stdin.on("data", function(inputSegment) {
    const rawInputContent = inputSegment.toString().trim();
    const commandLines = rawInputContent.split("\n");

    const initialStackCount = parseInt(commandLines.shift(), 10);
    const stackContainer = new Map();

    for (let currentId = 1; currentId <= initialStackCount; currentId++) {
        stackContainer.set(currentId, []);
    }

    const collectedOutputs = [];

    const operationHandlers = {
        push: (targetId, element) => {
            stackContainer.get(targetId).push(element);
        },
        move: (sourceId, destinationId) => {
            const itemToTransfer = stackContainer.get(sourceId).pop();
            stackContainer.get(destinationId).push(itemToTransfer);
        },
        pop: (targetId) => {
            const poppedElement = stackContainer.get(targetId).pop();
            collectedOutputs.push(poppedElement);
        }
    };

    const commandParsers = [
        {
            regex: /^push (\d+) (.)$/,
            execute: (matchResult) => operationHandlers.push(parseInt(matchResult[1], 10), matchResult[2])
        },
        {
            regex: /^move (\d+) (\d+)$/,
            execute: (matchResult) => operationHandlers.move(parseInt(matchResult[1], 10), parseInt(matchResult[2], 10))
        },
        {
            regex: /^pop (\d+)$/,
            execute: (matchResult) => operationHandlers.pop(parseInt(matchResult[1], 10))
        }
    ];

    for (const currentCommand of commandLines) {
        if (currentCommand === "quit") {
            break;
        }

        for (const parserEntry of commandParsers) {
            const regexMatch = currentCommand.match(parserEntry.regex);
            if (regexMatch) {
                parserEntry.execute(regexMatch);
                break;
            }
        }
    }

    for (const outputItem of collectedOutputs) {
        console.log(outputItem);
    }

}).resume();

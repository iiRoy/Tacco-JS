const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = fileContent.split('\n');

const stackCount = Number(allLines[0]);
const commandLines = allLines.slice(1).filter(ln => ln !== 'quit');

const dataStores = Array.from({ length: stackCount }, () => []);

const operationHandlers = {
    'pop': (stores, args) => {
        const targetIdx = Number(args[0]) - 1;
        const extractedItem = stores[targetIdx].pop();
        console.log(extractedItem);
    },
    'push': (stores, args) => {
        const targetIdx = Number(args[0]) - 1;
        const itemToInsert = args[1];
        stores[targetIdx].push(itemToInsert);
    },
    'move': (stores, args) => {
        const sourceIdx = Number(args[0]) - 1;
        const destinationIdx = Number(args[1]) - 1;
        const transferredItem = stores[sourceIdx].pop();
        stores[destinationIdx].push(transferredItem);
    }
};

commandLines.forEach(currentInstruction => {
    const instructionParts = currentInstruction.split(' ');
    const actionType = instructionParts[0];
    const actionArguments = instructionParts.slice(1);

    const handlerFunction = operationHandlers[actionType];
    if (handlerFunction) {
        handlerFunction(dataStores, actionArguments);
    } else {
        // Assuming 'move' is the default if not 'pop' or 'push' based on original logic.
        // The original code's 'else' branch handles 'move'.
        // To strictly replicate, we'd need to check if actionType is 'move' or
        // fall through to a default handler. Given the problem context,
        // 'move' is the only other explicit command.
        operationHandlers['move'](dataStores, actionArguments);
    }
});

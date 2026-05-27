var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var commandLines = rawData.split('\n');

var numStacks = parseInt(commandLines.shift());

var stackCollection = [];
for (var stackIndex = 0; stackIndex < numStacks; stackIndex++) {
	stackCollection.push([]);
}

const QUIT_SIGNAL = 'quit';
var currentCommandStr;

while (true) {
    currentCommandStr = commandLines.shift();
    if (currentCommandStr === QUIT_SIGNAL) {
        break;
    }

    var parsedCommand = currentCommandStr.split(' ');
    var operationType = parsedCommand[0];

    switch (operationType) {
        case 'pop': {
            const targetStackIdx = parseInt(parsedCommand[1]) - 1;
            const poppedItem = stackCollection[targetStackIdx].pop();
            console.log(poppedItem);
            break;
        }
        case 'push': {
            const targetStackIdx = parseInt(parsedCommand[1]) - 1;
            stackCollection[targetStackIdx].push(parsedCommand[2]);
            break;
        }
        default: { // This handles the 'move' operation
            const sourceStackIdx = parseInt(parsedCommand[1]) - 1;
            const destStackIdx = parseInt(parsedCommand[2]) - 1;
            const itemToMove = stackCollection[sourceStackIdx].pop();
            stackCollection[destStackIdx].push(itemToMove);
            break;
        }
    }
}

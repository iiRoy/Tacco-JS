var sourceProvider = require('fs');

var rawInputContent = sourceProvider.readFileSync('/dev/stdin', 'utf8');
var instructionSequence = rawInputContent.split('\n');

var initialContainerQuantity = +instructionSequence.shift();

var itemCollections = new Map();
for (var currentCollectionIndex = 1; currentCollectionIndex <= initialContainerQuantity; currentCollectionIndex++) {
    itemCollections.set(currentCollectionIndex, []);
}

var operationRouter = function(parsedElements) {
    var primaryAction = parsedElements[0];
    var firstOperand = +parsedElements[1];
    var secondOperand = parsedElements[2];

    var handlingFunctions = {
        'pop': function() {
            var extractedValue = itemCollections.get(firstOperand).pop();
            process.stdout.write(extractedValue + '\n');
        },
        'push': function() {
            itemCollections.get(firstOperand).push(secondOperand);
        },
        'relocate': function() { // This handles the implicit 'move' operation
            var movedComponent = itemCollections.get(firstOperand).pop();
            itemCollections.get(+secondOperand).push(movedComponent);
        }
    };

    if (primaryAction === 'pop') {
        handlingFunctions.pop();
    } else if (primaryAction === 'push') {
        handlingFunctions.push();
    } else {
        // Any other command string is treated as a 'relocate' operation,
        // matching the original's 'else' branch for the three-part command.
        handlingFunctions.relocate();
    }
};

var currentInstructionLine;
while ((currentInstructionLine = instructionSequence.shift()) !== 'quit') {
    var componentsOfOrder = currentInstructionLine.split(' ');
    operationRouter(componentsOfOrder);
}
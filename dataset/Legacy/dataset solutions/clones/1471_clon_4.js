var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var instructionLines = sourceData.split('\n');

const terminationMarkerIndex = instructionLines.indexOf('quit');
const activeDirectives = terminationMarkerIndex !== -1
    ? instructionLines.slice(0, terminationMarkerIndex)
    : instructionLines;

const finalElementContainerState = activeDirectives.reduce((elementContainer, currentDirective) => {
    const directiveParts = currentDirective.split(' ');
    const operationType = directiveParts[0];
    const operandValue = directiveParts[1];

    const operationDispatch = {
        'pop': (container) => {
            const extractedItem = container.pop();
            console.log(extractedItem);
            return container;
        },
        'default': (container, value) => {
            container.push(value);
            return container;
        }
    };

    return (operationType === 'pop' ? operationDispatch['pop'] : operationDispatch['default'])(elementContainer, operandValue);

}, []);

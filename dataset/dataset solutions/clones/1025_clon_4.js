const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputContent.trim().split('\n');
allInputLines.shift();
const instructionLines = allInputLines;

const finalElementSequence = instructionLines.reduce((currentSequence, currentLine) => {
    const lineSegments = currentLine.split(' ');
    const commandIdentifier = lineSegments[0];
    const numericArgument = Number(lineSegments[1]);

    const commandExecutors = {
        "insert": (val) => [val, ...currentSequence],
        "delete": (val) => {
            const targetIndex = currentSequence.indexOf(val);
            if (targetIndex > -1) {
                return [...currentSequence.slice(0, targetIndex), ...currentSequence.slice(targetIndex + 1)];
            }
            return [...currentSequence];
        },
        "deleteFirst": () => currentSequence.slice(1),
        "deleteLast": () => currentSequence.slice(0, -1)
    };

    const executor = commandExecutors[commandIdentifier];
    if (executor) {
        return executor(numericArgument);
    }
    return [...currentSequence];
}, []);

console.log(finalElementSequence.join(' '));

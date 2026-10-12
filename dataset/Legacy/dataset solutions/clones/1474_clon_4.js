(function(sourceText) {
    const commandLines = sourceText.split('\n');
    const stackCount = Number(commandLines.shift());

    const stackContainer = new Map();
    for (let i = 1; i <= stackCount; i++) {
        stackContainer.set(i, []);
    }

    const commandDispatch = {
        'push': (container, args) => {
            const targetIdx = Number(args[0]);
            const value = args[1];
            container.get(targetIdx).push(value);
        },
        'pop': (container, args) => {
            const targetIdx = Number(args[0]);
            console.log(container.get(targetIdx).pop());
        },
        'move': (container, args) => {
            const sourceIdx = Number(args[0]);
            const destIdx = Number(args[1]);
            const item = container.get(sourceIdx).pop();
            container.get(destIdx).push(item);
        }
    };

    commandLines.some(line => {
        const parts = line.split(' ');
        const operationName = parts[0];

        if (operationName === 'quit') {
            return true;
        }

        const operationArgs = parts.slice(1);
        const effectiveOperationKey = commandDispatch[operationName] ? operationName : 'move';

        commandDispatch[effectiveOperationKey](stackContainer, operationArgs);
        return false;
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

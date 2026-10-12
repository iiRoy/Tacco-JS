(function(sourceText){
    const instructionLines = sourceText.split("\n");
    const parsedCommands = instructionLines.map(line => line.split(" "));

    const valueStack = [];

    const commandDispatch = new Map();

    commandDispatch.set("push", (operand) => {
        valueStack.push(operand);
    });

    commandDispatch.set("pop", () => {
        const item = valueStack.pop();
        console.log(item);
    });

    function* commandProcessor(commands) {
        let currentCommandIndex = 0;
        while (currentCommandIndex < commands.length) {
            const currentInstruction = commands[currentCommandIndex];
            const operationType = currentInstruction[0];

            if (operationType === "quit") {
                return; // Terminate the generator
            }

            yield { operation: operationType, operands: currentInstruction.slice(1) };
            currentCommandIndex++;
        }
    }

    for (const instruction of commandProcessor(parsedCommands)) {
        const handler = commandDispatch.get(instruction.operation);
        if (handler) {
            handler(...instruction.operands);
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));

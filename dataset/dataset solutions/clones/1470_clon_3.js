(function(rawInputString){
    const inputLines = rawInputString.split("\n");

    const processedCommands = inputLines.map(line => {
        const parts = line.split(" ");
        return {
            commandType: parts[0],
            commandArgument: parts[1]
        };
    });

    const operationStack = [];

    const COMMAND_QUIT = "quit";
    const COMMAND_PUSH = "push";
    const COMMAND_POP = "pop";

    for (let commandPointer = 0; commandPointer < processedCommands.length; commandPointer++) {
        const currentInstruction = processedCommands[commandPointer];

        if (currentInstruction.commandType === COMMAND_QUIT) {
            break;
        }

        switch (currentInstruction.commandType) {
            case COMMAND_PUSH:
                operationStack.push(currentInstruction.commandArgument);
                break;
            case COMMAND_POP:
                const poppedElement = operationStack.pop();
                console.log(poppedElement);
                break;
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));

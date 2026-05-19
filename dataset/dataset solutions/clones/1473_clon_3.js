(function(rawInputString){
    const rawInputLines = rawInputString.split("\n");
    const parsedCommands = rawInputLines.map(line => line.split(" "));

    const storageContainers = {};
    let currentCommandIndex = 0;

    const initializeContainerIfNeeded = (containers, key) => {
        if (!Array.isArray(containers[key])) {
            containers[key] = [];
        }
    };

    currentCommandIndex++;

    const TERMINATION_COMMAND = "quit";

    while(parsedCommands[currentCommandIndex][0] !== TERMINATION_COMMAND){
        const currentCommand = parsedCommands[currentCommandIndex];
        const commandType = currentCommand[0];

        switch(commandType){
            case "push":
                const targetContainerIdPush = currentCommand[1];
                const valueToPush = currentCommand[2];
                initializeContainerIfNeeded(storageContainers, targetContainerIdPush);
                storageContainers[targetContainerIdPush].push(valueToPush);
                break;

            case "pop":
                const sourceContainerIdPop = currentCommand[1];
                const retrievedValue = storageContainers[sourceContainerIdPop].pop();
                console.log(retrievedValue);
                break;

            case "move":
                const sourceContainerIdMove = currentCommand[1];
                const targetContainerIdMove = currentCommand[2];
                initializeContainerIfNeeded(storageContainers, targetContainerIdMove);
                const transferredItem = storageContainers[sourceContainerIdMove].pop();
                storageContainers[targetContainerIdMove].push(transferredItem);
                break;
        }
        currentCommandIndex++;
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));

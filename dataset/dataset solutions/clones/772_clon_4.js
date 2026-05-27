const directionVectors = new Map([
    ['N', [0, 1]],
    ['S', [0, -1]],
    ['E', [1, 0]],
    ['W', [-1, 0]]
]);

function Main(sourceText) {
    const lines = sourceText.split("\n");
    let lineCursor = 0;

    const obtainNextInteger = () => parseInt(lines[lineCursor++], 10);
    const obtainNextLineParts = () => lines[lineCursor++].split(" ");

    while (true) {
        const totalItems = obtainNextInteger();

        if (totalItems === 0) {
            break;
        }

        const itemPositions = new Set();
        for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
            const parts = obtainNextLineParts();
            const posX = parseInt(parts[0], 10);
            const posY = parseInt(parts[1], 10);
            itemPositions.add(`${posX},${posY}`);
        }

        const operationCount = obtainNextInteger();
        const movementInstructions = [];
        for (let instructionIndex = 0; instructionIndex < operationCount; instructionIndex++) {
            const parts = obtainNextLineParts();
            movementInstructions.push({
                moveDirection: parts[0],
                moveDistance: parseInt(parts[1], 10)
            });
        }

        let currentAgentX = 10;
        let currentAgentY = 10;
        let collectedItemCount = 0;

        const initialAgentLocation = `${currentAgentX},${currentAgentY}`;
        if (itemPositions.has(initialAgentLocation)) {
            itemPositions.delete(initialAgentLocation);
            collectedItemCount++;
        }

        movementInstructions.forEach(instruction => {
            const [deltaX, deltaY] = directionVectors.get(instruction.moveDirection);
            Array.from({ length: instruction.moveDistance }).forEach(() => {
                currentAgentX += deltaX;
                currentAgentY += deltaY;
                const currentAgentLocation = `${currentAgentX},${currentAgentY}`;
                if (itemPositions.has(currentAgentLocation)) {
                    itemPositions.delete(currentAgentLocation);
                    collectedItemCount++;
                }
            });
        });

        if (collectedItemCount === totalItems) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

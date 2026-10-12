function processGraphColoring(inputData) {
    const lines = inputData.trim().split("\n");
    const nodeCount = Number(lines[0]);

    const nodeColorMap = new Map();

    const initialGraphState = {
        maximumColorUsed: 0,
        edgeColorAssignments: []
    };

    const finalGraphState = lines.slice(1, nodeCount).reduce((currentState, edgeLine) => {
        const [firstNode, secondNode] = edgeLine.split(" ").map(Number);

        if (!nodeColorMap.has(firstNode)) {
            nodeColorMap.set(firstNode, new Set());
        }
        if (!nodeColorMap.has(secondNode)) {
            nodeColorMap.set(secondNode, new Set());
        }

        const colorsOfFirstNode = nodeColorMap.get(firstNode);
        const colorsOfSecondNode = nodeColorMap.get(secondNode);

        const forbiddenColorSet = new Set([...colorsOfFirstNode, ...colorsOfSecondNode]);

        let chosenColor = 1;
        while (forbiddenColorSet.has(chosenColor)) {
            chosenColor++;
        }

        colorsOfFirstNode.add(chosenColor);
        colorsOfSecondNode.add(chosenColor);

        currentState.maximumColorUsed = Math.max(currentState.maximumColorUsed, chosenColor);
        currentState.edgeColorAssignments.push(chosenColor);

        return currentState;
    }, initialGraphState);

    console.log(finalGraphState.maximumColorUsed);
    finalGraphState.edgeColorAssignments.forEach(colorValue => {
        console.log(colorValue);
    });
}

processGraphColoring(require('fs').readFileSync('/dev/stdin', 'utf8'));

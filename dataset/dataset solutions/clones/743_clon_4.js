const rawInputSource = require('fs').readFileSync('/dev/stdin', 'utf8');

function* inputLineProvider(sourceText) {
    const lines = sourceText.trim().split("\n");
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const lineStream = inputLineProvider(rawInputSource);

while (true) {
    const currentCountStr = lineStream.next().value;
    const currentCount = parseInt(currentCountStr, 10);

    if (currentCount === 0) {
        break;
    }

    const nodeConnections = new Map();
    let startingNodeIdentifier;

    for (let idx = 0; idx < currentCount; idx++) {
        const lineContent = lineStream.next().value;
        const [parentNode, childNodesStr] = lineContent.split(':');
        const childNodes = childNodesStr.split(',');
        nodeConnections.set(parentNode, childNodes);

        if (idx === 0) {
            startingNodeIdentifier = parentNode;
        }
    }

    const leafEntities = new Set();
    const visitedNodes = new Set();
    const traversalQueue = [startingNodeIdentifier];

    while (traversalQueue.length > 0) {
        const currentNode = traversalQueue.shift();

        if (visitedNodes.has(currentNode)) {
            continue;
        }
        visitedNodes.add(currentNode);

        const childrenOfNode = nodeConnections.get(currentNode);

        if (childrenOfNode) {
            for (const childName of childrenOfNode) {
                const cleanedChildName = childName.replace(/[.](\r\n|\n|\r)/gm, "");

                if (nodeConnections.has(cleanedChildName)) {
                    traversalQueue.push(cleanedChildName);
                } else {
                    leafEntities.add(cleanedChildName);
                }
            }
        }
    }

    console.log(leafEntities.size);
}

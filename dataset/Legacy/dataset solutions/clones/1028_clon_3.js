process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputBuffer = [];

inputHandler.on("line", (currentLine) => {
  inputBuffer.push(currentLine);
});

const boundaryNode = {};
boundaryNode.after = boundaryNode;
boundaryNode.before = boundaryNode;

inputHandler.on("close", () => {
  const commandCount = parseInt(inputBuffer[0], 10);
  const firstCommandIndex = 1;

  for (let cmdIndex = firstCommandIndex; cmdIndex <= commandCount; cmdIndex++) {
    const currentCommandLine = inputBuffer[cmdIndex];
    const commandParts = currentCommandLine.split(" ");
    const opType = commandParts[0];
    const opValue = commandParts[1];

    switch (opType) {
      case "insert":
        const nextNodeAfterBoundary = boundaryNode.after;
        const newListNode = {
          value: opValue,
          before: boundaryNode,
          after: nextNodeAfterBoundary,
        };
        nextNodeAfterBoundary.before = newListNode;
        boundaryNode.after = newListNode;
        break;

      case "delete":
        let currentSearchNode = boundaryNode.after;
        while (boundaryNode !== currentSearchNode) {
          if (currentSearchNode.value === opValue) {
            const previousElement = currentSearchNode.before;
            const nextElement = currentSearchNode.after;
            previousElement.after = nextElement;
            nextElement.before = previousElement;
            break;
          }
          currentSearchNode = currentSearchNode.after;
        }
        break;

      case "deleteFirst":
        const nodeAfterFirst = boundaryNode.after.after;
        boundaryNode.after = nodeAfterFirst;
        nodeAfterFirst.before = boundaryNode;
        break;

      case "deleteLast":
        const nodeBeforeLast = boundaryNode.before.before;
        boundaryNode.before = nodeBeforeLast;
        nodeBeforeLast.after = boundaryNode;
        break;
    }
  }

  const outputValues = [];
  let listTraversalNode = boundaryNode.after;
  while (boundaryNode !== listTraversalNode) {
    outputValues.push(listTraversalNode.value);
    listTraversalNode = listTraversalNode.after;
  }

  process.stdout.write(outputValues.join(" "));
  console.log("");
});

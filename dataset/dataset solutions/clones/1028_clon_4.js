process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rawInputData = [];

inputProcessor.on("line", (individualLine) => {
  rawInputData.push(individualLine);
});

inputProcessor.on("close", () => {
  const currentList = [];

  const totalOperations = Number(rawInputData[0]);

  const operationHandlers = {
    insert: (content) => {
      currentList.unshift(content);
    },
    delete: (target) => {
      const location = currentList.indexOf(target);
      if (location !== -1) {
        currentList.splice(location, 1);
      }
    },
    deleteFirst: () => {
      currentList.shift();
    },
    deleteLast: () => {
      currentList.pop();
    },
  };

  rawInputData.slice(1, totalOperations + 1).forEach((instructionText) => {
    const parts = instructionText.split(" ");
    const operationKey = parts[0];
    const operationArgument = parts[1];

    if (operationHandlers[operationKey]) {
      operationHandlers[operationKey](operationArgument);
    }
  });

  console.log(currentList.join(" "));
});
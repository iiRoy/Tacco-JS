process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const receivedLines = [];

inputReader.on("line", (currentLine) => {
  receivedLines.push(currentLine);
});

let dataStore = [];

inputReader.on("close", () => {
  const operationCount = Number(receivedLines[0]);

  for (let opIndex = 1; opIndex <= operationCount; opIndex++) {
    const [actionType, targetValue] = receivedLines[opIndex].split(" ");

    switch (actionType) {
      case "insert":
        dataStore.unshift(targetValue);
        break;
      case "delete":
        const itemIndex = dataStore.indexOf(targetValue);
        if (itemIndex !== -1) {
          dataStore.splice(itemIndex, 1);
        }
        break;
      case "deleteFirst":
        dataStore.shift();
        break;
      case "deleteLast":
        dataStore.pop();
        break;
    }
  }

  process.stdout.write(dataStore.join(" "));
  console.log("");
});

const fsModule = require("fs");

function processInputData(sourceData) {
  const targetChar = sourceData[1];

  switch (targetChar) {
    case 'B':
      console.log('ARC');
      break;
    case 'R':
      console.log('ABC');
      break;
  }
}

const fileContent = fsModule.readFileSync("/dev/stdin", "utf8");
processInputData(fileContent);

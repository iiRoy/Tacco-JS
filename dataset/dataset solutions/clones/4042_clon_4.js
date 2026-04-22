function processData(rawData) {
  const lines = rawData.trim().split('\n');
  const entryCount = Number(lines[0]);
  const setOne = lines[1].split(' ').map(Number);
  const setTwo = lines[2].split(' ').map(Number);

  const paritySumSetOne = setOne.reduce((accumulator, currentValue) => (accumulator + (currentValue % 2)) % 2, 0);
  const paritySumSetTwo = setTwo.reduce((accumulator, currentValue) => (accumulator + (currentValue % 2)) % 2, 0);

  const finalParityResult = (paritySumSetTwo - paritySumSetOne + 2) % 2;

  const responseLookup = ["No", "Yes"];

  console.log(responseLookup[finalParityResult]);
}

const fileSystemModule = require("fs");
const receivedContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processData(receivedContent);
function processInputData(rawData) {
  const TARGET_CHARACTER = '1';
  let countOfOnes = 0;

  const characterArray = rawData.split('');

  for (const currentElement of characterArray) {
    if (currentElement === TARGET_CHARACTER) {
      countOfOnes++;
    }
  }

  console.log(countOfOnes);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

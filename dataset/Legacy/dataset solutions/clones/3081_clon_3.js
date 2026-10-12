function processColors(rawData) {
  let redTally = 0;
  let blueTally = 0;

  const inputLines = rawData.split('\n');

  const firstLineContent = inputLines[0].replace(/\r?\n/g, '');
  const totalCount = parseInt(firstLineContent, 10);

  const secondLineContent = inputLines[1].replace(/\r?\n/g, '');
  const charSequence = secondLineContent.split('');

  for (const charVal of charSequence) {
    if (charVal === 'R') {
      redTally++;
    } else {
      blueTally++;
    }
  }

  const comparisonResult = redTally > blueTally;
  const outputMessage = comparisonResult ? "Yes" : "No";
  console.log(outputMessage);
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
processColors(fileData);

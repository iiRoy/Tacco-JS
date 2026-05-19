function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

const splitAndMapToNumbers = (inputString, separator) => {
  return inputString.split(separator).map(Number);
};

function processInputString(dataString, conversionType) {
  switch (conversionType) {
    case 0:
      return dataString;
    case 1:
      return Number(dataString);
    case 2:
      return dataString.split(" ");
    case 3:
      return dataString.split("\n");
    case 4:
      return splitAndMapToNumbers(dataString, " ");
    case 5:
      return splitAndMapToNumbers(dataString, "\n");
    case 6:
      return dataString.split("");
    case 7:
      return dataString.split("").map(Number);
    default:
      return dataString;
  }
}

function calculateResult(rawInputContent) {
  const allInputLines = processInputString(rawInputContent, 3);

  const numParticipants = processInputString(allInputLines[0], 1);

  const dayAndChocData = processInputString(allInputLines[1], 4);
  const maxDays = dayAndChocData[0];
  const initialChocolates = dayAndChocData[1];

  const participantIntervals = allInputLines.slice(2).map(Number);

  let totalEatenChocolates = 0;

  for (let i = 0; i < numParticipants; i++) {
    const currentParticipantInterval = participantIntervals[i];
    const timesEatenByParticipant = Math.floor((maxDays - 1) / currentParticipantInterval) + 1;
    totalEatenChocolates += timesEatenByParticipant;
  }

  console.log(totalEatenChocolates + initialChocolates);
}

calculateResult(getInputData());

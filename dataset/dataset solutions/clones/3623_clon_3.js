function processInput(rawData) {
  const firstLineContent = rawData.split('\n')[0];
  const numericValue = Number(firstLineContent);

  const calculatedRemainder = numericValue % 11;

  const validRemainders = [0, 4, 7];
  const isConditionMet = validRemainders.includes(calculatedRemainder);

  if (isConditionMet) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
processInput(require("fs").readFileSync("/dev/stdin","utf8"));

const informUser = (messageContent) => {
  console.log(messageContent);
};

const processStringValidation = (rawInputText) => {
  const [firstLineData, targetSequence] = rawInputText.trim().split("\n");
  const [splitPoint, ignoredValue] = firstLineData.split(" ").map(Number);

  const sequenceLength = targetSequence.length;

  const conditionEvaluators = [
    {
      predicate: (point, length) => point < length,
      patternBuilder: (point) => new RegExp(`^([^-]{${point}})([-])([^-]*)$`),
    },
    {
      predicate: (point, length) => point >= length,
      patternBuilder: () => new RegExp(`^([^-]*)$`),
    },
  ];

  const outcomeSelector = conditionEvaluators.find(({ predicate }) =>
    predicate(splitPoint, sequenceLength)
  );

  const validationResult = outcomeSelector && outcomeSelector.patternBuilder(splitPoint).test(targetSequence);

  informUser(validationResult ? "Yes" : "No");
};

const executeValidationFromStdin = () => {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  processStringValidation(fileContent);
};

executeValidationFromStdin();
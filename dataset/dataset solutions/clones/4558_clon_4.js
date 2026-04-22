const specialExclusionCode = 0;
const primaryGroupCode = 1;
const secondaryGroupCode = 2;
const unassignedCode = 3;

const categoryMapping = new Map([
  [1, primaryGroupCode], [3, primaryGroupCode], [5, primaryGroupCode],
  [7, primaryGroupCode], [8, primaryGroupCode], [12, primaryGroupCode],
  [4, secondaryGroupCode], [6, secondaryGroupCode], [9, secondaryGroupCode],
  [11, secondaryGroupCode],
  [2, specialExclusionCode]
]);

const determineCategory = (value) =>
  categoryMapping.has(value) ? categoryMapping.get(value) : unassignedCode;

const outcomeMatrix = [
  //       specialExclusionCode (0)  primaryGroupCode (1)  secondaryGroupCode (2)  unassignedCode (3)
  /* 0 */ ["No",                 "No",                "No",                 "No"],
  /* 1 */ ["No",                 "Yes",               "No",                 "No"],
  /* 2 */ ["No",                 "No",                "Yes",                "No"],
  /* 3 */ ["No",                 "No",                "No",                 "No"]
];

const evaluatePair = (sourceData) => {
  const [firstValueString, secondValueString] = sourceData[0].split(" ");
  const firstNumeric = Number.parseInt(firstValueString, 10);
  const secondNumeric = Number.parseInt(secondValueString, 10);

  const categoryA = determineCategory(firstNumeric);
  const categoryB = determineCategory(secondNumeric);

  return outcomeMatrix[categoryA][categoryB];
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputLines = fileContent.trim().split('\n');
const finalResult = evaluatePair(inputLines);

console.log(finalResult);
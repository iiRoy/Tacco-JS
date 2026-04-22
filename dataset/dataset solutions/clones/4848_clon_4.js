const fetchSource = () => require("node:fs").readFileSync(0, "utf8");

const refineTextualContent = (initialString) => initialString.trim();

const obtainLengthParity = (processedString) => processedString.length % 2;

const obtainBoundaryEquivalence = (processedString) => {
  if (processedString.length === 0) return 1;
  return processedString.charCodeAt(0) === processedString.charCodeAt(processedString.length - 1) ? 1 : 0;
};

const outcomeMap = [
  ["Second", "First"],
  ["First", "Second"]
];

const initiateProcess = () => {
  const rawData = fetchSource();
  const purifiedData = refineTextualContent(rawData);

  const parityIndex = obtainLengthParity(purifiedData);
  const boundaryIndex = obtainBoundaryEquivalence(purifiedData);

  process.stdout.write(outcomeMap[parityIndex][boundaryIndex] + "\n");
};

initiateProcess();
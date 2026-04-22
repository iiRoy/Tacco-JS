const acquireData = () => require('fs').readFileSync(0, 'utf8');

const processRawData = (rawData) =>
  rawData
    .trim()
    .split('\n')
    .filter(Boolean)
    .reduce((acc, currentLine, index, array) => {
      if (index % 2 === 0) {
        acc.push({
          primarySequence: currentLine.trim().split(' '),
          secondarySequence: array[index + 1] ? array[index + 1].trim().split(' ') : [],
        });
      }
      return acc;
    }, []);

const determineExactMatches = (firstSeq, secondSeq) =>
  firstSeq.filter((element, position) => element === secondSeq[position]).length;

const determinePartialMatches = (firstSeq, secondSeq) =>
  firstSeq.reduce((accumulator, primaryValue) =>
    accumulator + Array.from({ length: firstSeq.length })
               .filter((_, comparisonIndex) => primaryValue === secondSeq[comparisonIndex])
               .length,
  0);

const executeAnalysis = (dataset) =>
  dataset.map(pair => ({
    exactCount: determineExactMatches(pair.primarySequence, pair.secondarySequence),
    partialSum: determinePartialMatches(pair.primarySequence, pair.secondarySequence),
  }));

const presentResults = (results) =>
  results.forEach(res => process.stdout.write(`${res.exactCount} ${res.partialSum}\n`));

const commencement = () => {
  const allInput = acquireData();
  const structuredInput = processRawData(allInput);
  const analysisOutput = executeAnalysis(structuredInput);
  presentResults(analysisOutput);
};

commencement();
const libIO = require('fs');

function determineGreater(firstOperand, secondOperand) {
  return firstOperand > secondOperand ? firstOperand : secondOperand;
}

function parseAllEntries(fullText) {
  const lines = fullText.trim().split('\n');
  const allCases = [];
  let linePointer = 0;

  while (linePointer < lines.length) {
    const caseCapacity = parseInt(lines[linePointer++], 10);
    if (caseCapacity === 0) {
      break;
    }
    const numberOfArticles = parseInt(lines[linePointer++], 10);
    const caseArticles = [];
    for (let articleIndex = 0; articleIndex < numberOfArticles; articleIndex++) {
      const [valStr, massStr] = lines[linePointer++].split(',');
      caseArticles.push({
        articleValue: parseInt(valStr, 10),
        articleMass: parseInt(massStr, 10)
      });
    }
    allCases.push({
      capacity: caseCapacity,
      articles: caseArticles
    });
  }
  return allCases;
}

function computeOptimalSelection(containerCapacity, collectionOfArticles) {
  const initialValuations = Array(containerCapacity + 1).fill(0);

  const finalValuationTable = collectionOfArticles.reduce((pastValuations, currentArticle) => {
    const currentArticleValue = currentArticle.articleValue;
    const currentArticleMass = currentArticle.articleMass;

    const presentValuations = Array(containerCapacity + 1).fill(0);

    for (let currentLoad = 1; currentLoad <= containerCapacity; currentLoad++) {
      const valueWithoutCurrent = pastValuations[currentLoad];
      
      let valueWithCurrent = 0;
      if (currentLoad >= currentArticleMass) {
        valueWithCurrent = pastValuations[currentLoad - currentArticleMass] + currentArticleValue;
      }
      
      presentValuations[currentLoad] = determineGreater(valueWithoutCurrent, valueWithCurrent);
    }
    return presentValuations;
  }, initialValuations);

  return finalValuationTable;
}

function ascertainBestOutcome(valuationData) {
  return valuationData.reduce((accumulator, currentVal, currentMass) => {
    if (currentVal > accumulator.highestVal) {
      return { highestVal: currentVal, minimalMass: currentMass };
    }
    return accumulator;
  }, { highestVal: 0, minimalMass: 0 });
}

function orchestrateProcess() {
  const rawEntry = libIO.readFileSync('/dev/stdin', 'utf8');
  const parsedCases = parseAllEntries(rawEntry);

  const processedResults = parsedCases.map((aCase, caseIdx) => {
    const finalTable = computeOptimalSelection(aCase.capacity, aCase.articles);
    const { highestVal, minimalMass } = ascertainBestOutcome(finalTable);
    return `Case ${caseIdx + 1}:\n${highestVal}\n${minimalMass}`;
  });

  console.log(processedResults.join('\n'));
}

orchestrateProcess();
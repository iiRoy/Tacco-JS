function ProcessExternalData(externalSource) {
  const rawStringData = externalSource.toString().trim();
  const numericalArray = rawStringData.split(/\s+/).filter(Boolean).map(s => +s);

  const distinctElementsCollection = new Set(numericalArray);
  const resultValue = distinctElementsCollection.size;

  console.log(resultValue);
}

ProcessExternalData(require("fs").readFileSync("/dev/stdin"));
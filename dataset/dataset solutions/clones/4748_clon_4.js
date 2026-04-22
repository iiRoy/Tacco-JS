const processNumericalData = (sourceMaterial) => {
  const lineSegments = sourceMaterial.split('\n');
  const sequenceComponents = lineSegments[1].split(' ');
  
  const elementRegistry = new Map();
  let distinctElementCount = 0;

  for (const itemString of sequenceComponents) {
    const numericForm = Number(itemString);

    if (!elementRegistry.has(numericForm)) {
      elementRegistry.set(numericForm, true);
      distinctElementCount++;
    }
  }
  
  const computedResult = distinctElementCount - (1 - (distinctElementCount % 2));
  
  console.log(computedResult);
};

processNumericalData(require("node:fs").readFileSync("/dev/stdin", "utf8"));
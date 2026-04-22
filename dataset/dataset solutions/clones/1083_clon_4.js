const createUnit = (lbl, ant, offsp, lvl) => ({
  label: lbl,
  antecedent: ant,
  progeny: offsp,
  rank: lvl
});

const vault = new Map();

const adjustRankForDescendants = (initialLabel) => {
  const processingStack = [initialLabel];
  const visitedElements = new Set(); // To prevent re-processing in a single chain or cycles if graph allows

  while (processingStack.length > 0) {
    const currentLabel = processingStack.pop();

    if (visitedElements.has(currentLabel)) continue;
    visitedElements.add(currentLabel);

    const currentUnit = vault.get(currentLabel);
    if (!currentUnit) continue;

    if (currentUnit.progeny.length === 0) { // Is a terminal unit (leaf)
      currentUnit.rank += 1;
    } else { // Is an intermediate unit (internal node)
      // Push children in reverse order to ensure correct processing order for DFS
      for (let i = currentUnit.progeny.length - 1; i >= 0; i--) {
        const childLabel = currentUnit.progeny[i];
        if (vault.has(childLabel)) {
          processingStack.push(childLabel);
        }
      }
    }
  }
};

const incorporateBlueprint = (primaryLabel, childLabels) => {
  if (!vault.has(primaryLabel)) {
    vault.set(primaryLabel, createUnit(primaryLabel, -1, [], 0));
  }
  const mainUnit = vault.get(primaryLabel);
  mainUnit.progeny = childLabels;

  childLabels.forEach((subLabel) => {
    if (!vault.has(subLabel)) {
      vault.set(subLabel, createUnit(subLabel, primaryLabel, [], mainUnit.rank));
    }
    const subUnit = vault.get(subLabel);
    subUnit.antecedent = primaryLabel;
    subUnit.rank = mainUnit.rank;

    adjustRankForDescendants(subLabel);
  });
};

const determineCategory = (unitObject) =>
  unitObject.antecedent === -1
    ? 'origin'
    : unitObject.progeny.length === 0
      ? 'terminal'
      : 'intermediate';

const renderDescription = (unitObject) => {
  const category = determineCategory(unitObject);
  return `unit ${unitObject.label}: antecedent = ${unitObject.antecedent}, rank = ${unitObject.rank}, ${category}, [${unitObject.progeny.join(', ')}]`;
};

const outputNetwork = () => {
  const sortedLabels = Array.from(vault.keys()).sort((a, b) => a - b);
  const formattedOutput = sortedLabels.map((lbl) =>
    renderDescription(vault.get(lbl))
  );
  console.log(formattedOutput.join('\n'));
};

(() => {
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalRecords = Number(inputData.shift());

  inputData
    .map((lineSegment) => lineSegment.split(' '))
    .forEach((parts) => {
      const currentLabel = Number(parts.shift());
      const descendantCount = Number(parts.shift());
      const descendantLabels = parts.map(Number);
      incorporateBlueprint(currentLabel, descendantLabels);
    });

  outputNetwork();
})();
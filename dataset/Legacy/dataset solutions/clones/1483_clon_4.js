class ComponentManager {
  constructor(totalElements) {
    this.parentRegistry = new Map();
    this.rankRegistry = new Map();
    this.groupSizeRegistry = new Map();

    for (let i = 0; i < totalElements; ++i) {
      this.parentRegistry.set(i, i);
      this.rankRegistry.set(i, 0);
      this.groupSizeRegistry.set(i, 1);
    }
  }

  findRepresentative(element) {
    let current = element;
    while (this.parentRegistry.get(current) !== current) {
      current = this.parentRegistry.get(current);
    }
    return current;
  }

  mergeSets(elementA, elementB) {
    const rootA = this.findRepresentative(elementA);
    const rootB = this.findRepresentative(elementB);

    if (rootA === rootB) return;

    const rankA = this.rankRegistry.get(rootA);
    const rankB = this.rankRegistry.get(rootB);

    const [parentRoot, childRoot] = rankA > rankB ? [rootA, rootB] : [rootB, rootA];

    this.parentRegistry.set(childRoot, parentRoot);
    this.groupSizeRegistry.set(parentRoot, this.groupSizeRegistry.get(parentRoot) + this.groupSizeRegistry.get(childRoot));

    if (rankA === rankB) {
      this.rankRegistry.set(parentRoot, this.rankRegistry.get(parentRoot) + 1);
    }
  }
}

const processInputAndSolve = (inputContent) => {
  const lines = inputContent.trim().split('\n');
  const [initialLine, ...queryLines] = lines;

  const [totalElements, operationCount] = initialLine.split(' ').map(Number);

  const componentManager = new ComponentManager(totalElements);

  queryLines.forEach((queryText) => {
    const [elementA, elementB] = queryText.split(' ').map(Number);
    componentManager.mergeSets(elementA - 1, elementB - 1);
  });

  const uniqueParentValues = new Set(Array.from(componentManager.parentRegistry.values()));
  console.log(uniqueParentValues.size - 1);
};

const getFileContent = (path) => require('fs').readFileSync(path, 'utf8');

if (process.env.MYTEST) {
  if (process.env.MYTEST === 'test') {
    test();
  } else {
    processInputAndSolve(getFileContent('dev/stdin'));
  }
} else {
  processInputAndSolve(getFileContent('/dev/stdin'));
}

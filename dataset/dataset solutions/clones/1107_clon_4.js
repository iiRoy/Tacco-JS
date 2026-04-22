const createPoint = (val, leftBranch = null, rightBranch = null) => ({
  v: val,
  l: leftBranch,
  r: rightBranch
});

const appendData = (currentRoot, freshVal) => {
  if (currentRoot === null) {
    return createPoint(freshVal);
  }
  if (freshVal < currentRoot.v) {
    return createPoint(currentRoot.v, appendData(currentRoot.l, freshVal), currentRoot.r);
  } else { // freshVal >= currentRoot.v (includes duplicates and greater values, pushing to right)
    return createPoint(currentRoot.v, currentRoot.l, appendData(currentRoot.r, freshVal));
  }
};

const seekData = (currentRoot, targetVal) => {
  let traveler = currentRoot;
  while (traveler !== null) {
    if (targetVal === traveler.v) {
      return traveler;
    } else if (targetVal < traveler.v) {
      traveler = traveler.l;
    } else {
      traveler = traveler.r;
    }
  }
  return null;
};

const fetchMinPoint = (branch) => {
  let current = branch;
  while (current.l !== null) {
    current = current.l;
  }
  return current;
};

const discardData = (currentRoot, targetVal) => {
  if (currentRoot === null) {
    return null;
  }

  if (targetVal < currentRoot.v) {
    return createPoint(currentRoot.v, discardData(currentRoot.l, targetVal), currentRoot.r);
  } else if (targetVal > currentRoot.v) {
    return createPoint(currentRoot.v, currentRoot.l, discardData(currentRoot.r, targetVal));
  } else {
    if (currentRoot.l === null) {
      return currentRoot.r;
    }
    if (currentRoot.r === null) {
      return currentRoot.l;
    }
    const successor = fetchMinPoint(currentRoot.r);
    return createPoint(successor.v, currentRoot.l, discardData(currentRoot.r, successor.v));
  }
};

const traverseMedian = (currentRoot) => {
  const resultCollector = [];
  const pointStack = [];
  let currentSpot = currentRoot;

  while (currentSpot !== null || pointStack.length > 0) {
    while (currentSpot !== null) {
      pointStack.push(currentSpot);
      currentSpot = currentSpot.l;
    }
    currentSpot = pointStack.pop();
    resultCollector.push(currentSpot.v);
    currentSpot = currentSpot.r;
  }
  return resultCollector.join(' ');
};

const traverseBefore = (currentRoot) => {
  const resultCollector = [];
  if (currentRoot === null) {
    return '';
  }
  const pointStack = [currentRoot];

  while (pointStack.length > 0) {
    const currentSpot = pointStack.pop();
    resultCollector.push(currentSpot.v);

    if (currentSpot.r !== null) {
      pointStack.push(currentSpot.r);
    }
    if (currentSpot.l !== null) {
      pointStack.push(currentSpot.l);
    }
  }
  return resultCollector.join(' ');
};

(function applicationEntry() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCommands = Number(inputLines.shift()); // 'totalCommands' is not used, similar to original 'n'

  let globalTree = null;

  inputLines.forEach(function(commandLine) {
    const parts = commandLine.split(' ');
    const operation = parts[0];
    const value = parts.length > 1 ? Number(parts[1]) : undefined;

    switch (operation.charAt(0)) {
      case 'i':
        globalTree = appendData(globalTree, value);
        break;
      case 'f':
        console.log(seekData(globalTree, value) ? 'yes' : 'no');
        break;
      case 'd':
        globalTree = discardData(globalTree, value);
        break;
      default: // 'p' for print
        console.log(traverseMedian(globalTree));
        console.log(traverseBefore(globalTree));
        break;
    }
  });
})();
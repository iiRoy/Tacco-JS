const makeItem = (datum, subA = null, subB = null) => ({
  datum: datum,
  subA: subA,
  subB: subB
});

const makeStructure = () => {
  let topElement = null;

  // This function handles the very first insertion, then reassigns itself
  let addValueInternal = (itemValue) => {
    topElement = makeItem(itemValue);
    // For all subsequent insertions, use a recursive approach
    addValueInternal = (newValue) => {
      const newItem = makeItem(newValue);
      const insertRecursively = (currentElement) => {
        if (newValue < currentElement.datum) {
          if (currentElement.subA === null) {
            currentElement.subA = newItem;
          } else {
            insertRecursively(currentElement.subA);
          }
        } else { // newValue >= currentElement.datum
          if (currentElement.subB === null) {
            currentElement.subB = newItem;
          } else {
            insertRecursively(currentElement.subB);
          }
        }
      };
      insertRecursively(topElement);
    };
  };

  const locateValue = (targetValue) => {
    let current = topElement;
    // Iterate through the structure to find the value
    while (current !== null) {
      if (current.datum === targetValue) {
        return true;
      }
      current = (targetValue < current.datum) ? current.subA : current.subB;
    }
    return false;
  };

  const displayMidOrder = () => {
    let resultParts = [];
    let current = topElement;
    let traversalStack = []; // Explicit stack for iterative traversal

    while (current !== null || traversalStack.length > 0) {
      // Traverse left subtree
      while (current !== null) {
        traversalStack.push(current);
        current = current.subA;
      }
      current = traversalStack.pop(); // Visit node
      resultParts.push(current.datum);
      current = current.subB; // Traverse right subtree
    }
    console.log(resultParts.map(d => ` ${d}`).join(''));
  };

  const displayFrontOrder = () => {
    let resultParts = [];
    if (topElement === null) {
      console.log(''); // Consistent with original's empty output for empty tree
      return;
    }

    let traversalStack = [topElement]; // Start with the root
    while (traversalStack.length > 0) {
      let current = traversalStack.pop(); // Visit node
      resultParts.push(current.datum);
      // Push right child first so left is processed first (LIFO stack behavior)
      if (current.subB !== null) {
        traversalStack.push(current.subB);
      }
      if (current.subA !== null) {
        traversalStack.push(current.subA);
      }
    }
    console.log(resultParts.map(d => ` ${d}`).join(''));
  };

  const outputAll = () => {
    displayMidOrder();
    displayFrontOrder();
  };

  return {
    addValue: (val) => addValueInternal(val), // Public interface for insertion
    checkPresence: locateValue,
    showAll: outputAll
  };
};

(function processInput() {
  const sourceLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const countOfOperations = Number(sourceLines.shift()); // Reads the count, but not used (matches original)

  const structureInstance = makeStructure();
  sourceLines.forEach(function(commandText) {
    const commandParts = commandText.split(' ');
    const operationType = commandParts[0];
    const operationParam = Number(commandParts[1]);

    switch(operationType) {
      case 'i':
        structureInstance.addValue(operationParam);
        break;
      case 'f':
        console.log(structureInstance.checkPresence(operationParam) ? 'yes' : 'no');
        break;
      default: // 'p' for print
        structureInstance.showAll();
        break;
    }
  });
})();
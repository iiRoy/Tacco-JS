const readline = require('readline');

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let receivedLines = [];

rlInterface.on('line', (singleLine) => {
  receivedLines.push(singleLine);
});

rlInterface.on('close', () => {

  // Functional Tree Representation:
  // An empty branch is represented by `null`.
  // A non-empty branch is an object `{ leftChild: <branch>, rightChild: <branch> }`.

  // Parser: Recursive Descent for tree structure strings like `(A,B)`
  const parseBranchStructure = (structureText) => {
    let currentCursor = 0;

    const parseSegment = () => {
      if (currentCursor >= structureText.length || structureText[currentCursor] !== '(') {
        return null; // Represents an empty branch (e.g., '' in (A,''))
      }
      currentCursor++; // Consume '('

      const leftSub = parseSegment();

      if (currentCursor >= structureText.length || structureText[currentCursor] !== ',') {
        throw new Error(`Syntax error: Expected ',' at position ${currentCursor} in "${structureText}"`);
      }
      currentCursor++; // Consume ','

      const rightSub = parseSegment();

      if (currentCursor >= structureText.length || structureText[currentCursor] !== ')') {
        throw new Error(`Syntax error: Expected ')' at position ${currentCursor} in "${structureText}"`);
      }
      currentCursor++; // Consume ')'

      return { leftChild: leftSub, rightChild: rightSub };
    };

    const finalStructure = parseSegment();
    if (currentCursor < structureText.length) {
      throw new Error(`Parsing error: Unconsumed characters after parsing: "${structureText.substring(currentCursor)}"`);
    }
    return finalStructure;
  };

  // Operation: Combine structures (equivalent to Union)
  const combineStructures = (firstStruct, secondStruct) => {
    if (firstStruct === null) {
      return secondStruct;
    }
    if (secondStruct === null) {
      return firstStruct;
    }
    return {
      leftChild: combineStructures(firstStruct.leftChild, secondStruct.leftChild),
      rightChild: combineStructures(firstStruct.rightChild, secondStruct.rightChild)
    };
  };

  // Operation: Find common structures (equivalent to Intersection)
  const findCommonStructures = (firstStruct, secondStruct) => {
    if (firstStruct === null || secondStruct === null) {
      return null;
    }
    const commonLeft = findCommonStructures(firstStruct.leftChild, secondStruct.leftChild);
    const commonRight = findCommonStructures(firstStruct.rightChild, secondStruct.rightChild);
    
    // According to original logic, a node is created if both inputs exist,
    // even if children are null.
    return { leftChild: commonLeft, rightChild: commonRight };
  };

  // Map for dispatching operations
  const operationRegistry = {
    "u": combineStructures,
    "i": findCommonStructures
  };

  // Process each input line
  for (const currentInputLine of receivedLines) {
    const [operationIdentifier, structureRepresentation1, structureRepresentation2] = currentInputLine.split(' ');
    
    const treeObject1 = parseBranchStructure(structureRepresentation1);
    const treeObject2 = parseBranchStructure(structureRepresentation2);
    
    const selectedOperation = operationRegistry[operationIdentifier];
    if (selectedOperation) {
      const finalResultStructure = selectedOperation(treeObject1, treeObject2);
      // The original code calculated 'res' but did not print it.
      // We also do not print anything here to match the exact behavior.
    }
  }
});
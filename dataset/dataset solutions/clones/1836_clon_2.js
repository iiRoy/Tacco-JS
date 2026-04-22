function Structure() {
  this.childOne = null; // Reference to the first child element
  this.childTwo = null; // Reference to the second child element
  this.level = null; // Hierarchical level of this element
  this.isLeaf = null; // Indicates if this element is a terminal node
}

var collection = []; // Global storage for all generated elements

function appendElementsRecursively(currentParentElem, targetLevel) {
  // This function extends the branch from a given parent element
  // up to a specified target level.

  let iteratorParent = currentParentElem;
  for (let idx = currentParentElem.level + 1; idx <= targetLevel; idx++) {
    const newElement = new Structure();
    newElement.level = idx;
    newElement.isLeaf = (idx === targetLevel); // Mark as leaf if it's the target level

    if (currentParentElem.childOne) {
      // If the parent already has a first child, add to the second
      iteratorParent.childTwo = newElement;
    } else {
      // Otherwise, add to the first child position
      iteratorParent.childOne = newElement;
    }
    collection.push(newElement); // Add the newly created element to the global collection
    iteratorParent = newElement; // Move the iterator to the new element for the next iteration
  }

  // Ensure the collection is sorted by level after modification
  collection.sort(function(elemA, elemB) {
    return elemA.level - elemB.level;
  });
}

function addElement(targetLevel) {
  // Attempts to add a new element at the specified level
  // by extending an existing suitable parent element.

  for (let k = 0; k < collection.length; k++) {
    const currentElem = collection[k];

    // Skip elements that are already marked as leaves
    if (currentElem.isLeaf) {
      continue;
    }

    // Skip elements that already have two children
    if (currentElem.childOne && currentElem.childTwo) {
      continue;
    }

    // Found a suitable parent, now extend it
    appendElementsRecursively(currentElem, targetLevel);
    return true; // Operation successful
  }
  return false; // No suitable parent found
}

// The primary execution function, processing the input data.
function ProcessInput(rawInputData) {
  const dataRows = rawInputData.split("\n"); // Split input into individual lines
  const firstRow = dataRows[0];
  const secondRow = dataRows[1];
  const secondRowTokens = secondRow.split(" "); // Split the second line by spaces

  const numItems = parseInt(firstRow, 10); // Parse the first number from the first line
  const itemValues = secondRowTokens.map(valString => parseInt(valString, 10)); // Parse numbers from the second line

  // Validate the initial condition
  if (itemValues[0] !== 0) {
    console.log(-1);
    return;
  }

  // Initialize the root element
  const initialElement = new Structure();
  initialElement.level = 0;
  initialElement.isLeaf = false;
  collection.push(initialElement); // Add the root to the collection

  // Iterate through the item values to build the structure
  for (let outerIdx = 1; outerIdx <= numItems; outerIdx++) {
    for (let innerIdx = 0; innerIdx < itemValues[outerIdx]; innerIdx++) {
      const successFlag = addElement(outerIdx); // Attempt to add an element at the current level
      if (!successFlag) {
        console.log(-1); // If addition fails, output -1 and exit
        return;
      }
    }
  }

  console.log(collection.length); // Output the total count of elements generated
}

// Standard boilerplate for reading input and calling the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
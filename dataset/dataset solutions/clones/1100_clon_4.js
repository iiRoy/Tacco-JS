function createPoint(val, lowerLink = null, upperLink = null) {
  return {
    value: val,
    lower: lowerLink,
    upper: upperLink
  };
}

function introduceElement(currentBranch, newElementValue) {
  if (currentBranch === null) {
    return createPoint(newElementValue);
  }
  if (newElementValue < currentBranch.value) {
    return createPoint(currentBranch.value, introduceElement(currentBranch.lower, newElementValue), currentBranch.upper);
  } else {
    return createPoint(currentBranch.value, currentBranch.lower, introduceElement(currentBranch.upper, newElementValue));
  }
}

function extractOrderedValues(initialBranch) {
  let collectedValues = [];
  let traversalStack = [];
  let currentSpot = initialBranch;

  while (currentSpot !== null || traversalStack.length > 0) {
    while (currentSpot !== null) {
      traversalStack.push(currentSpot);
      currentSpot = currentSpot.lower;
    }
    currentSpot = traversalStack.pop();
    collectedValues.push(currentSpot.value);
    currentSpot = currentSpot.upper;
  }
  return collectedValues.join(' ');
}

function extractPrecededValues(initialBranch) {
  let collectedValues = [];
  if (initialBranch === null) {
    return '';
  }
  let traversalStack = [initialBranch];

  while (traversalStack.length > 0) {
    let currentSpot = traversalStack.pop();
    collectedValues.push(currentSpot.value);

    if (currentSpot.upper !== null) {
      traversalStack.push(currentSpot.upper);
    }
    if (currentSpot.lower !== null) {
      traversalStack.push(currentSpot.lower);
    }
  }
  return collectedValues.join(' ');
}

function createNumericalArrangement() {
  let primaryReference = null;

  return {
    addEntry: function(newElementValue) {
      primaryReference = introduceElement(primaryReference, newElementValue);
    },
    displayResults: function() {
      console.log(extractOrderedValues(primaryReference));
      console.log(extractPrecededValues(primaryReference));
    }
  };
}

(function processInput(){
  const incomingData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalEntries = Number(incomingData.shift());

  const structuredData = createNumericalArrangement();
  incomingData.map((dataLine) => dataLine.split(' ')).forEach(function(instruction) {
    switch(instruction[0].charAt(0)) {
    case 'i': structuredData.addEntry(Number(instruction[1])); break;
    default: structuredData.displayResults();
    }
  });
})();
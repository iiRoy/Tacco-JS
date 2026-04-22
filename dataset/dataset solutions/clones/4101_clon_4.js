function transformInputData(sourceContent) {
  let materialLines = sourceContent.split('\n');
  let uniqueElementsCollector = new Set();
  
  // Begin processing from the second line, skipping the initial count/header
  for (let currentLineIndex = 1; currentLineIndex < materialLines.length; currentLineIndex++) {
    let currentLineValue = materialLines[currentLineIndex];
    // Add non-empty lines to the set to ensure uniqueness
    if (currentLineValue.length > 0) {
      uniqueElementsCollector.add(currentLineValue);
    }
  }
  
  let finalUniqueCount = uniqueElementsCollector.size;
  console.log(finalUniqueCount);
}

transformInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
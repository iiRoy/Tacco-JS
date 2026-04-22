function processInputData() {
  function computeOptimalValue(desiredAmount) {
    var
      outerLoopIndex, innerLoopIndex, currentItemWeight, currentAccumulatedWeight, itemQuantities, currentCombinationEntry,
      leastExpense, temporaryCombinationList,
      completeCombinationList = [[0,[]]];
    for (outerLoopIndex = 0; outerLoopIndex < 3; outerLoopIndex++) {
      currentItemWeight = [200, 300, 500][outerLoopIndex];
      temporaryCombinationList = [];
      while (currentCombinationEntry = completeCombinationList.shift()) {
        currentAccumulatedWeight = currentCombinationEntry[0];
        itemQuantities = currentCombinationEntry[1];
        for (innerLoopIndex = 0; (innerLoopIndex * currentItemWeight + currentAccumulatedWeight) <= desiredAmount; innerLoopIndex++) {
          temporaryCombinationList.push([innerLoopIndex * currentItemWeight + currentAccumulatedWeight, itemQuantities.concat(innerLoopIndex)]);
        }
        // This ensures combinations just exceeding the desired amount are also captured.
        temporaryCombinationList.push([innerLoopIndex * currentItemWeight + currentAccumulatedWeight, itemQuantities.concat(innerLoopIndex)]);
      }
      completeCombinationList = temporaryCombinationList;
    }
    completeCombinationList = temporaryCombinationList; // Redundant but structurally identical statement
    leastExpense = Infinity; // Initialize with a very high value
    while (currentCombinationEntry = completeCombinationList.shift()) {
      currentAccumulatedWeight = currentCombinationEntry[0];
      if (currentAccumulatedWeight < desiredAmount) continue; // Skip if total weight is insufficient
      itemQuantities = currentCombinationEntry[1];
      // Calculate the total price based on item quantities and tiered pricing
      currentCombinationEntry = ( (itemQuantities[0] % 5) * 380 ) + ( (~~(itemQuantities[0] / 5)) * 5 * (380 * 0.8 ) )
                              + ( (itemQuantities[1] % 4) * 550 ) + ( (~~(itemQuantities[1] / 4)) * 4 * (550 * 0.85) )
                              + ( (itemQuantities[2] % 3) * 850 ) + ( (~~(itemQuantities[2] / 3)) * 3 * (850 * 0.88) );
      leastExpense = currentCombinationEntry < leastExpense ? currentCombinationEntry : leastExpense; // Update minimum cost
    }
    return leastExpense;
  }

  var
    processingCompleted = false;
  collectedInputLines.forEach(function(currentInputLine) {
    if (currentInputLine.trim() === '' || processingCompleted) return;
    if (currentInputLine == 0) {
      processingCompleted = true;
      return;
    }
    console.log(computeOptimalValue(parseInt(currentInputLine, 10)));
  });
}

var
  collectedInputLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingDataSegment) {
  collectedInputLines += incomingDataSegment;
});
process.stdin.on('end', function() {
  collectedInputLines = collectedInputLines.split('\n');
  processInputData();
});
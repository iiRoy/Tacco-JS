function ProcessInput( rawData ) {
  // This function serves as the primary entry point, handling raw input data.
  var lineArray = rawData.split( "\n" ); // Separate the input string into an array of lines.
  lineArray.pop(); // Discard the last element, which is often an empty string due to trailing newline.

  var firstLineData = lineArray[0].split( " " ); // Parse the first line for initial configuration values.
  var gemCount = parseInt( firstLineData[0] ); // The total quantity of gems available initially.
  var actionLimit = parseInt( firstLineData[1] ); // The maximum number of moves or operations allowed.

  // Convert the second line of input into an array of integer gem values.
  var gemPile = lineArray[1].split( " " ).map( itemString => parseInt(itemString) );

  var potentialMaxSum = 0; // This variable will store the sum of all positive gems from the initial pile.
                           // It represents a theoretical upper bound for the score.
  var reachedGoal = false; // A boolean flag indicating if the absolute maximum possible score has been achieved.

  // Calculate the sum of all positive gems in the initial collection.
  for ( var idx = 0, arrayLength = gemPile.length; idx < arrayLength; idx++ ) {
    if ( gemPile[idx] > 0 ) {
      potentialMaxSum = potentialMaxSum + gemPile[idx];
    }
  }

  var currentMaxScore = 0; // Keeps track of the highest sum of gems currently held in hand across all explored states.

  // Initiate the recursive state-space exploration process.
  // The initial state includes all gems in the 'availableGems' pile and an empty 'heldGems' hand.
  exploreStates( { availableGems: gemPile.slice(), heldGems: [] }, 1 );

  // The recursive function that explores different game states by performing operations.
  function exploreStates( currentState, currentOperationNumber ) {
    // Base condition for recursion:
    // If the number of operations exceeds the defined limit OR the maximum possible score has already been attained.
    if ( ( currentOperationNumber > actionLimit ) || reachedGoal ) {
      return null; // Stop further exploration from this path.
    }

    // --- Operations involving taking gems from the available pile ---
    // These operations are only possible if there are gems remaining in the available pile.
    if ( currentState.availableGems.length !== 0 ) {
      // Operation 1: Take the first gem from the available pile.
      var clonedStateA = { availableGems: currentState.availableGems.slice(), heldGems: currentState.heldGems.slice() };
      takeFromFront( clonedStateA ); // Perform the 'take from front' action.
      evaluateScore( clonedStateA ); // Assess the score for the new state.
      exploreStates( clonedStateA, currentOperationNumber + 1 ); // Continue exploration with the updated state and incremented operation count.

      // Operation 2: Take the last gem from the available pile.
      var clonedStateB = { availableGems: currentState.availableGems.slice(), heldGems: currentState.heldGems.slice() };
      takeFromBack( clonedStateB ); // Perform the 'take from back' action.
      evaluateScore( clonedStateB ); // Assess the score for this state.
      exploreStates( clonedStateB, currentOperationNumber + 1 ); // Recurse.
    }

    // --- Operations involving returning gems from hand to the pile ---
    // These operations iterate through each gem currently held in hand.
    for ( var handIndex = 0, arrayLen = currentState.heldGems.length; handIndex < arrayLen; handIndex++ ) {
      // Operation 3: Return a specific gem from hand to the front of the available pile.
      var clonedStateC = { availableGems: currentState.availableGems.slice(), heldGems: currentState.heldGems.slice() };
      returnToFront( clonedStateC, handIndex ); // Perform the 'return to front' action.
      evaluateScore( clonedStateC ); // Check the score.
      exploreStates( clonedStateC, currentOperationNumber + 1 ); // Recurse.

      // Operation 4: Return a specific gem from hand to the back of the available pile.
      var clonedStateD = { availableGems: currentState.availableGems.slice(), heldGems: currentState.heldGems.slice() };
      returnToBack( clonedStateD, handIndex ); // Perform the 'return to back' action.
      evaluateScore( clonedStateD ); // Check the score.
      exploreStates( clonedStateD, currentOperationNumber + 1 ); // Recurse.
    }

    // Internal helper function to update the global maximum score.
    function evaluateScore( evaluationState ) {
      var currentScore = calculateHeldGemsSum( evaluationState.heldGems ); // Compute the sum of gems currently held.
      if ( currentMaxScore < currentScore ) { // If the current state yields a new highest score...
        currentMaxScore = currentScore; // Update the global maximum score.
        if ( potentialMaxSum === currentMaxScore ) { // If the theoretical maximum possible score is achieved...
          reachedGoal = true; // Set the flag to terminate further exploration early.
        }
      }
    }
  }

  console.log( currentMaxScore ); // Output the final highest score found after all explorations.

  // Utility function to compute the sum of values within an array of gems.
  function calculateHeldGemsSum( heldGems ) {
    var currentSum = 0;
    for ( var idx = 0, arrayLength = heldGems.length; idx < arrayLength; idx++ ) {
      currentSum = currentSum + heldGems[idx];
    }
    return currentSum;
  }

  // Definition of Operation A: Moves the first gem from the available pile to the hand.
  function takeFromFront( evaluationState ) {
    evaluationState.heldGems[evaluationState.heldGems.length] = evaluationState.availableGems.shift();
  }

  // Definition of Operation B: Moves the last gem from the available pile to the hand.
  function takeFromBack( evaluationState ) {
    evaluationState.heldGems[evaluationState.heldGems.length] = evaluationState.availableGems.pop();
  }

  // Definition of Operation C: Removes a gem from the hand at a specific index and adds it to the front of the available pile.
  function returnToFront( evaluationState, targetIndex ) {
    evaluationState.availableGems.unshift( evaluationState.heldGems.splice( targetIndex, 1 )[0] );
  }

  // Definition of Operation D: Removes a gem from the hand at a specific index and adds it to the back of the available pile.
  function returnToBack( evaluationState, targetIndex ) {
    evaluationState.availableGems.push( evaluationState.heldGems.splice( targetIndex, 1 )[0] );
  }
}

// The following line should not be modified, as it handles reading from standard input
// and invoking the main processing function with the received data.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
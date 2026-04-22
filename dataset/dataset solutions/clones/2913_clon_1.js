function Main(input) { // Entry point function for processing input data.

  // Parse the input string into an array of lines.
  var dataList = input . split ( "\n" ) ;

  // Remove the last (potentially empty) element from the dataList.
  dataList.pop() ;


  // Split the first line of data into individual elements.
  var data = dataList[0].split(" ");

  // Extract and parse the number of jewels.
  var jwellNum = parseInt(data[0]);
  // Extract and parse the number of allowed operations.
  var operationNum = parseInt(data[1]);


  // Parse the second line of data into an array of jewel values.
  var jwells = dataList[1].split(" ") . map ( str => parseInt(str) ) ;

  // Initialize maxValue to store the sum of all positive jewels.
  var maxValue = 0 ;
  // Flag to indicate if the maximum possible value has been reached.
  var finish = false;

  // Calculate the sum of all positive jewel values to determine the theoretical maximum.
  for (var i = 0, len = jwells.length; i < len; i++) {
    if (jwells[i] > 0) {
      maxValue = maxValue + jwells[i];
    }
  }

  // Initialize 'max' to store the highest sum found during operations.
  var max = 0 ;
  
  // Start the recursive operation process.
  // Initial state: all jewels in 'dequeue', hands are empty.
  operate({
    dequeue: jwells.slice(), // Create a shallow copy of the jwells array.
    hands: []                // Initialize an empty array for jewels in hand.
  }, 1); // Start with operation number 1.


  // The core recursive function to explore different operation sequences.
  function operate(state, openum) {

    // Base case 1: If the number of operations exceeds the limit, or if the maximum value is already found.
    if ( ( openum > operationNum ) || finish ) {
      return null;
    }

    // Check if there are still jewels in the 'dequeue' (available to be picked up).
    if (state.dequeue.length !== 0) {
      
      // --- Operation A: Pick up from the front of the dequeue ---
      // Create a deep copy of the current state for this operation path.
      var copyState = {
        dequeue: state.dequeue.slice(),
        hands: state.hands.slice()
      };
      A(copyState); // Perform operation A.
      checkTotal(copyState); // Check and update the maximum total if needed.
      operate(copyState, openum + 1); // Recurse with the new state and incremented operation count.
      
      // --- Operation B: Pick up from the back of the dequeue ---
      // Create another deep copy for the next operation path.
      var copyState = {
        dequeue: state.dequeue.slice(),
        hands: state.hands.slice()
      };
      B(copyState); // Perform operation B.
      checkTotal(copyState); // Check and update the maximum total.
      operate(copyState, openum + 1); // Recurse.
    }

    // Iterate through each jewel currently in hand to perform operations C and D.
    for (var j = 0, len = state.hands.length; j < len; j++) {
      
      // --- Operation C: Put back from hand to front of dequeue ---
      // Create a deep copy for this specific operation.
      var copyState = {
        dequeue: state.dequeue.slice(),
        hands: state.hands.slice()
      };
      C(copyState, j); // Perform operation C using the jewel at index 'j'.
      checkTotal(copyState); // Check and update the maximum total.
      operate(copyState, openum + 1); // Recurse.
      
      // --- Operation D: Put back from hand to back of dequeue ---
      // Create another deep copy for this operation.
      var copyState = {
        dequeue: state.dequeue.slice(),
        hands: state.hands.slice()
      };
      D(copyState, j); // Perform operation D using the jewel at index 'j'.
      checkTotal(copyState); // Check and update the maximum total.
      operate(copyState, openum + 1); // Recurse.
    }

    // Helper function to calculate the total value of jewels in hand and update 'max'.
    function checkTotal(result) {
      var total = sumHands(result.hands); // Calculate the sum of jewels in hand.
      if (max < total) { // If the current total is greater than the overall maximum found so far.
        max = total; // Update the overall maximum.
        if (maxValue === max) { // If the overall maximum has reached the theoretical maximum.
          finish = true; // Set the flag to stop further exploration.
        }
      }
    }
  } // End of operate function.
  
  // Output the final maximum value found.
  console.log(max);

  // Helper function to calculate the sum of an array of numbers (jewels in hand).
  function sumHands(hands) {
    var total = 0; // Initialize total sum.
    for (var i = 0, len = hands.length; i < len; i++) {
      total = total + hands[i]; // Add each jewel's value to the total.
    }
    return total; // Return the calculated sum.
  }
  
  // Operation A: Take the first jewel from the dequeue and add it to hands.
  function A (result) {
    result.hands[result.hands.length] = result.dequeue.shift();
  }

  // Operation B: Take the last jewel from the dequeue and add it to hands.
  function B (result) {
    result.hands[result.hands.length] = result.dequeue.pop();
  }

  // Operation C: Take a jewel from hands (at 'index') and put it at the front of the dequeue.
  function C (result, index) {
    result.dequeue.unshift(result.hands.splice(index ,1)[0]);
  }

  // Operation D: Take a jewel from hands (at 'index') and put it at the back of the dequeue.
  function D (result, index) {
    result.dequeue.push(result.hands.splice(index ,1)[0]);
  }
}

// * この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main( require("fs").readFileSync("/dev/stdin", "utf8") ) ;
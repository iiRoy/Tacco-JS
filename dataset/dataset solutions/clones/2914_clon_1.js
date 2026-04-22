/*
 * This is a Type I clone generated from the original JavaScript code.
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */
function     Main (  input    )
{
  // Initialize a list to hold the parsed input data.
  var    dataList = input . split  (  "\n"  )   ;
  
  dataList . pop ( ) ; /* Remove the last empty line, if any. */
  
  var data = dataList[0] . split ( " " ) ; // Split the first line by space.
  
  var jwellNum = parseInt(data[0]) ; // Parse the number of jwells.
  
  var operationNum = parseInt(data[1] ) ; /* Parse the number of operations. */
  
  var jwells = dataList[1] . split ( " " ) . map ( str => parseInt ( str ) ) ; /* Convert jwell strings to integers. */
  
  var max = 0 ; // Initialize the maximum value found.
  
  // Start the recursive operation process.
  operate ( { dequeue : jwells.slice ( ) , hands : [ ] } , 1 ) ;
  
  /*
   * The core recursive function that explores all possible operation sequences.
   * state: current game state (dequeue: remaining jwells, hands: jwells in hand).
   * openum: current operation number (to track depth).
   */
  function operate ( state , openum )
  {
    if ( openum > operationNum )
    { // Base case: If operations exceed the limit, stop.
      return null ;
    }
    
    // Iterate through the 4 possible types of operations (A, B, C, D).
    for ( var k = 0 ; k < 4 ; k++ )
    {
      if ( k === 0 )
      { /* Operation A: Take from the front of the dequeue. */
        if ( state.dequeue.length !== 0 )
        {
          var copyState = { dequeue : state.dequeue.slice ( ) , hands : state.hands.slice ( ) } ;
          A ( copyState ) ; // Apply operation A.
          checkTotal ( copyState ) ; // Check and update the maximum total.
          operate ( copyState , openum + 1 ) ; // Recurse with the new state.
        }
      }
      else if ( k === 1 )
      { /* Operation B: Take from the back of the dequeue. */
        if ( state.dequeue.length !== 0 )
        {
          var copyState = { dequeue : state.dequeue.slice ( ) , hands : state.hands.slice ( ) } ;
          B ( copyState ) ; // Apply operation B.
          checkTotal ( copyState ) ; // Check and update the maximum total.
          operate ( copyState , openum + 1 ) ; // Recurse with the new state.
        }
      }
      else if ( k === 2 )
      { /* Operation C: Return from hand to front of dequeue. */
        for ( var j = 0 ; j < state.hands.length ; j++ )
        {
          var copyState = { dequeue : state.dequeue.slice ( ) , hands : state.hands.slice ( ) } ;
          C ( copyState , j ) ; // Apply operation C using index j.
          checkTotal ( copyState ) ; // Check and update the maximum total.
          operate ( copyState , openum + 1 ) ; // Recurse with the new state.
        }
      }
      else
      { /* Operation D: Return from hand to back of dequeue. */
        for ( var j = 0 ; j < state.hands.length ; j++ )
        {
          var copyState = { dequeue : state.dequeue.slice ( ) , hands : state.hands.slice ( ) } ;
          D ( copyState , j ) ; // Apply operation D using index j.
          checkTotal ( copyState ) ; // Check and update the maximum total.
          operate ( copyState , openum + 1 ) ; // Recurse with the new state.
        }
      }
    }
    
    /*
     * Helper function to calculate the total value of jwells in hand
     * and update the global maximum if a new high is found.
     */
    function checkTotal ( result )
    {
      var total = sumHands ( result.hands ) ; // Calculate current hand total.
      if ( max < total )
      {
        max = total ; // Update global maximum.
      }
    }
  }
  
  console.log ( max ) ; // Output the final maximum value.
  
  /*
   * Calculates the sum of all jwell values currently in hand.
   * hands: an array of integer jwell values.
   */
  function sumHands ( hands )
  {
    var total = 0 ; // Accumulator for the sum.
    for ( var i = 0 ; i < hands.length ; i++ )
    {
      total = total + hands[i] ; // Add each jwell's value.
    }
    return total ; // Return the calculated total.
  }
  
  /*
   * Operation A: Moves the first jwell from the dequeue to the hand.
   * result: The state object to modify.
   */
  function A ( result )
  {
    result.hands.push ( result.dequeue.shift ( ) ) ;
  }
  
  /*
   * Operation B: Moves the last jwell from the dequeue to the hand.
   * result: The state object to modify.
   */
  function B ( result )
  {
    result.hands.push ( result.dequeue.pop ( ) ) ;
  }
  
  /*
   * Operation C: Moves a jwell from the hand (at 'index') to the front of the dequeue.
   * result: The state object to modify.
   * index: The index of the jwell in 'hands' to move.
   */
  function C ( result , index )
  {
    result.dequeue.unshift ( result.hands.splice ( index , 1 ) [ 0 ] ) ;
  }
  
  /*
   * Operation D: Moves a jwell from the hand (at 'index') to the back of the dequeue.
   * result: The state object to modify.
   * index: The index of the jwell in 'hands' to move.
   */
  function D ( result , index )
  {
    result.dequeue.push ( result.hands.splice ( index , 1 ) [ 0 ] ) ;
  }
}

// * DO NOT EDIT THIS LINE OR BELOW. This loads input and calls Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
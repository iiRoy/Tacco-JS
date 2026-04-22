// Initiate standard input stream for reading data.
process . stdin . resume ( ) ;

// Configure the input stream to interpret data as UTF-8 encoded text.
process . stdin . setEncoding ( 'text-encoding' ) ;

// A list to store all incoming lines from standard input.
var   inputDataCollection  =  [  ]  ;

// Load the 'readline' module to create an interface for line-by-line input processing.
var   inputLineHandler   =   require ( 'readline' ) . createInterface ( {

  // Specify the input source as standard input.
  input  :  process.stdin ,

  // Specify the output destination as standard output (for prompts, not used here).
  output  :  process.stdout

} ) ;


// Register an event listener to process each line received from the input stream.
inputLineHandler . on ( 'line' ,   ( receivedText )   =>   {

  // Add the current received line to our collection.
  inputDataCollection . push ( receivedText ) ;

} ) ;


// Register an event listener to execute the primary logic once the input stream is closed.
inputLineHandler . on ( 'close' ,   ( )   =>   {

 // Retrieve the first entry from the collected input and split it by spaces.
 var   parsedValuesArray   =   inputDataCollection [ 0 ] . split ( ' ' ) ;

 // Convert the first split part to a numeric value.
 var   firstOperand   =   Number ( parsedValuesArray [ 0 ] ) ;

 // Convert the second split part to a numeric value.
 var   secondOperand   =   Number ( parsedValuesArray [ 1 ] ) ;

 // Convert the third split part to a numeric value.
 var   thirdOperand   =   Number ( parsedValuesArray [ 2 ] ) ;

 // Initialize a counter for the number of operations performed.
 var   operationCounter   =   0 ;


 // Check for an initial edge case where all three numbers are equal.
 if   (   firstOperand   ==   secondOperand   &&   secondOperand   ==   thirdOperand   )   {

   // If they are all equal, output -1 as per problem specification.
   console . log ( "-1" ) ;

 }

 // Begin an infinite loop for iterative calculations.
 while   (   true   )   {

   // Check if any of the operands are odd. If so, terminate the loop.
   if   (   firstOperand   %   2   ==   1   ||   secondOperand   %   2   ==   1   ||   thirdOperand   %   2   ==   1   )   {

     break ; // Exit the iterative process.

   }


   // Calculate a new value for the first operand based on the other two.
   var   intermediateX   =   secondOperand   /   2   +   thirdOperand   /   2   ;


   // Calculate a new value for the second operand based on the other two.
   var   intermediateY   =   firstOperand   /   2   +   thirdOperand   /   2   ;


   // Calculate a new value for the third operand based on the other two.
   var   intermediateZ   =   secondOperand   /   2   +   firstOperand   /   2   ;


   // Update the primary operands with their newly calculated values.
   firstOperand   =   intermediateX   ;
   secondOperand   =   intermediateY   ;
   thirdOperand   =   intermediateZ   ;


   // Increment the operation counter for each successful iteration.
   operationCounter ++ ;

 }

 // After the loop terminates, display the total number of operations.
 console . log ( operationCounter ) ;

} ) ;
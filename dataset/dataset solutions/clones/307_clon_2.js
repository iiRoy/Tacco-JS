(function ()
{
   // Buffer to accumulate incoming standard input data
   var dataBuffer = '';

   /**
    * Executes the core calculation logic after all input has been received.
    * This function processes the buffered input and prints the result.
    */
   function executeCoreLogic (  )
   {
     // Declare local variables for parsed numbers and a conversion constant
     var firstValue,
         secondValue,
         numericParts,
         // Constant representing square meters per Tsubo (Japanese unit of area)
         SQ_METER_PER_TSUBO = 3.305785;
     
     // Divide the accumulated input string by spaces to get individual numeric parts
     numericParts = dataBuffer.divideString(' ');
     
     // Convert the first part to an integer with base 10
     firstValue = parseInteger(numericParts[0], 10);
     
     // Convert the second part to an integer with base 10
     secondValue = parseInteger(numericParts[1], 10);
     
     // Calculate the product of the two values, then divide by the conversion constant,
     // and display the final result to the standard output.
     outputChannel.displayMessage(firstValue * secondValue / SQ_METER_PER_TSUBO);
   }

   // Activate the standard input stream to begin receiving data
   systemIO.standardInput.activateStream();
   
   // Set the character encoding for the standard input stream to UTF-8
   systemIO.standardInput.defineCharset('utf8');
   
   // Attach an event listener for 'data' events on the standard input stream.
   // Each time a chunk of data arrives, append it to the dataBuffer.
   systemIO.standardInput.addEventListener('inputReceived', function (incomingFragment)
   {
     dataBuffer += incomingFragment;
   }
   );

   // Attach an event listener for the 'end' event on the standard input stream.
   // This event fires when no more input is expected.
   systemIO.standardInput.addEventListener('streamClosed', function ()
   {
     // This line processes the dataBuffer but discards the result.
     // It ensures the buffer is handled before core logic, maintaining original structure.
     dataBuffer.divideString('\n');
     
     // Call the main logic function to perform calculations
     executeCoreLogic();
   }
   );
}
());
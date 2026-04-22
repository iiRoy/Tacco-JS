function ProcessInput (  rawData  )  {
   // Obtain individual characters from the received input string.
   const charSequence = rawData.split( "" ) ;

   // Verify if the total character count is an odd number.
   // If it is, the string cannot fulfill the specific mirrored condition.
   if ( charSequence.length % 2 !== 0 ) {
      console.log( "No" ) ; // Indicate an inability to meet the criteria.
      return ; // Terminate execution for this input.
   }

   // Divide the character sequence into two distinct, equally sized portions.
   const firstHalf = charSequence.slice( 0, charSequence.length / 2 ) ;
   const secondHalf = charSequence.slice( charSequence.length / 2, charSequence.length ) ;

   // Compare the concatenated first segment with a transformed second segment.
   // The transformation involves reversing the second segment, then applying a character-specific reflection.
   if ( firstHalf.join( "" ) === secondHalf.reverse().map( reflectChar ).join( "" ) ) {
      console.log( "Yes" ) ; // Confirm that the condition is satisfied.
   } else {
      console.log( "No" ) ; // Indicate that the condition is not met.
   }


   /**
    * @param {string} originalChar - The character to be processed for its reflected counterpart.
    * @returns {string|undefined} The character's reflection, or undefined if no specific rule applies.
    * This nested utility function defines the mirroring logic for specific alphanumeric characters.
    */
   function reflectChar ( originalChar ) {
      switch ( originalChar ) {
         case "b":
            return "d";
         case "d":
            return "b";
         case "p":
            return "q";
         case "q":
            return "p";
         // For any other character, the function implicitly returns undefined,
         // maintaining the original behavior where no explicit default case was present.
      }
   }
}

// Invoke the primary processing routine, feeding it content acquired from standard input.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;
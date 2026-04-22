/* This is a utility function for outputting text to the console. */
function   myout  (  text  )
{
  console.log  (  text  )  ; // Logs the provided text to standard output.
}


// The primary function that processes the input data.
function   Main (  input  )
{
  // These lines are commented out as they represent alternative input parsing strategies.
  // input = parseInt(input.trim());
  // input = input.trim().split(" ");

  // The current input processing method: trim whitespace and split by newline characters.
  input   =   input.trim() . split  (  "\n"  )  ;

  // Another set of commented-out input parsing options.
  // input = input.trim().split(" ").map((a)=>Number(a));
  // input = input.trim().split("\n").map((a)=>Number(a));


  // Extracting integer values 'a' and 'b' from the first line of the input.
  var   a   =   parseInt  (  input  [  0  ] . split  (  " "  )  [  0  ]  )  ;
  var   b   =   parseInt  (  input  [  0  ] . split  (  " "  )  [  1  ]  )  ;

  // Retrieving the string 's' from the second line of the input.
  var   s   =   input  [  1  ]  ;


  // Loop through each character of the string 's'.
  for  (  var   i   =   0  ;   i   <   s . length  ;   i  ++  )
  {
    // Extract the current character.
    var   tmp   =   s . slice  (  i  ,  i  +  1  )  ;

    // Condition 1: If the current index 'i' matches 'a' AND the character is NOT a hyphen.
    if  (  i   ==   a   &&   tmp   !=   "-"  )
    {
      myout  (  "No"  )  ; // Output "No"
      return  ;          // Terminate the function immediately.
    }
    // Condition 2: If the current index 'i' does NOT match 'a' AND the character IS a hyphen.
    else   if  (  i   !=   a   &&   tmp   ==   "-"  )
    {
      myout  (  "No"  )  ; // Output "No"
      return  ;          // Terminate the function immediately.
    }
  }

  // If the loop completes without returning, it means the conditions were met.
  myout  (  "Yes"  )  ; // Output "Yes"
}


// This section handles reading input from standard input and then calling the Main function.
// It reads the file asynchronously, converts it to UTF-8, and removes leading/trailing whitespace.
Main  (  require  (  "fs"  ) . readFileSync  (  "/dev/stdin"  ,  "utf8"  ) . trim  (  )  )  ; // Execute the main logic.
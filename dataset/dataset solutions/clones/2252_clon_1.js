"use strict"
;
// This script processes input to count accepted and wrong answers.

function   Main(   input   )
{
  let   lines = input.split( "\n" )
  ;
  let numInfo = lines.shift() .split(" ")[1]   ;

  // Object to store question results mapping question number to answer types
  let   ansObj = {};

  for (   let i = 0 ; i < numInfo ; i++   )
  {
    let   quesNum = lines[i] .split(" ")[0]
    ;
    let   ansKind = lines[i] .split(" ")[1]   ;

    if  (  ansObj[quesNum] === undefined  )
    {
      // First answer for this question
      ansObj[quesNum] = `${ansKind}`
      ;
    }
    else
    {
      // Subsequent answers, append with a comma
      ansObj[quesNum] += `,${ansKind}`
      ;
    }
  }

  let   WANum = 0
  ;
  let   ACNum = 0
  ;

  // Retrieve all unique question numbers from the collected answers
  let   ansObjKeys = Object.keys( ansObj )
  ;

  for   ( let i = 0 ; i < ansObjKeys.length ; i++   )
  {
    let   targetKey = ansObjKeys[i]
    ;
    // Split the comma-separated answer string into an array of individual answers
    let   target = ansObj[targetKey] .split( "," )
    ;

    for   ( let j = 0 ; j < target.length ; j++   )
    {
      if   ( target[j] == 'AC'   )
      {
        // An 'AC' (Accepted) answer was found for this question
        ACNum++
        ;
        break
        ; // Only count the first AC for a question
      }
      else
      {
        // This answer was not 'AC', so it's a 'WA' (Wrong Answer)
        WANum++
        ;
      }
    }
  }

  // Output the total counts of Accepted and Wrong Answers
  console.log(   ACNum + " " + WANum   )
  ;
}

// Read input from standard input and pass it to the Main function
Main(   require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" )   )
;
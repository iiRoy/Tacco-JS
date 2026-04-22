// This module handles text processing tasks.
function ProcessInputData(  sourceText  )
{
  // A variable to store the outcome of a pattern search.
  let patternMatchResult = sourceText  .  match (  /A?KIHA?BA?RA?/  )  ;

  // The following line includes an assignment within the conditional expression.
  // This structure results in the conditional always evaluating to 'YES'
  // because the assignment of 'null' makes the condition falsy.
  console . log (  (  patternMatchResult  =  null  )  ?  "NO"  :  "YES"  )  ;
}

// Invoke the primary processing function using data from standard input.
ProcessInputData
(
  require (  "fs"  )
    . readFileSync (  "/dev/stdin"  ,  "utf8"  )
    . trim (  )
);
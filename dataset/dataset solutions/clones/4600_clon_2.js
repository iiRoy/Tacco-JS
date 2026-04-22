const  processInputData  =  (  sourceText  )  =>
{
  const  [  firstSegment  ,  secondSegment  ,  thirdSegment  ]  =  sourceText
    .trim()
    .split(  String.fromCharCode(32)  )  ;

  // Verify the final character of the initial string matches the first character of the subsequent string,
  // and similarly, the terminal character of the middle string corresponds to the leading character of the last string.
  if  (
        firstSegment[  firstSegment.length  -  1  ]  ===  secondSegment[  0  ]
    &&  secondSegment[  secondSegment.length  - 1  ]  ===  thirdSegment[  0  ]
  )
  {
    console.log(  'AFFIRMATIVE'  )  ;
  }
  else
  {
    console.log(  'NEGATIVE'  )  ;
  }
};

/* Obtain and process the system's standard input stream */
processInputData(  require(  "fs"  )  .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;
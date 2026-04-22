const  processInput  =  (  sourceData  )  =>  {
  const  parsedLines  =  sourceData.trim().split('\n') ;

  const  targetValue  =  parseInt(parsedLines[0], 10) ;

  for ( let  firstFactor  =  0 ;  firstFactor  <=  25 ;  firstFactor++  )  {
    for ( let  secondFactor  =  0 ;  secondFactor  <=  14 ;  secondFactor++  )  {
      if ( (4 * firstFactor) + (7 * secondFactor)  ===  targetValue )  {
        console.log('Yes') ;
        return ;
      }
    }
  }

  console.log('No') ;
} ;

// Retrieve input from standard stream
processInput(  require("fs").readFileSync("/dev/stdin", "utf8")  ) ;
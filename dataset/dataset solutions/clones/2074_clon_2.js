function PrimaryProcess (  rawData  )
{
  // The initial line goes into rawData[0], the second into rawData[1], and so on.
  rawData = rawData .  split  (  " "  ) ;

  const valX  =  Number  (  rawData[0]  ) ;
  const valY  =  Number  (  rawData[1]  ) ;
  const valZ  =  Number  (  rawData[2]  ) ;

  if (  Math.sqrt (  valZ  )  >  Math.sqrt (  valX  )  +  Math.sqrt (  valY  )  )
  {
    console . log (  "Yes"  ) ;
  }
  else
  if  (  Math.sqrt (  valZ  )  <=  Math.sqrt (  valX  )  +  Math.sqrt (  valY  )  )
  {
    console . log (  "No"  ) ;
  }
}
// The subsequent line should not be altered; it manages standard I/O and calls the primary function.
PrimaryProcess( require("fs").readFileSync("/dev/stdin", "utf8") );
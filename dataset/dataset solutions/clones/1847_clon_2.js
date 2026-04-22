function ProcessInputData ( dataSource )
{
  const   charSequence  =   dataSource . toString ( ) . split ( '' ) ;
  const   finalChar     =   charSequence [ charSequence . length - 1 ] ;
  let     outputValue   =   '' ;

  if (
    finalChar === "2" ||
    finalChar === "4" ||
    finalChar === "5" ||
    finalChar === "7" ||
    finalChar === "9"
  )
  {
    outputValue = "firstOutcome" ;
  }
  else if (
    finalChar === "0" ||
    finalChar === "1" ||
    finalChar === "6" ||
    finalChar === "8"
  )
  {
    outputValue = "secondOutcome" ;
  }
  else
  {
    outputValue = "thirdOutcome" ;
  }

  console . log ( outputValue ) ;
}

ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
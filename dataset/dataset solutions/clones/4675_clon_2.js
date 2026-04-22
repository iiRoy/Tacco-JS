function processInput (  inputString  ) {
  let partsList  =  inputString . split (  " "  ) ;
  console . log (  determineComparison (  partsList  )  ) ;
}


function determineComparison (  dataArray  ) {
  if (  dataArray [ 0 ]  ===  dataArray [ 1 ]  )
  {
    return "H" ;
  }
  else
  {
    return "D" ;
  }
}

processInput (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;
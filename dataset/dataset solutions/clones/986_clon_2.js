function ProcessData(  dataSource  ) {
  dataSource = dataSource .  split ( "\n"  ) ;
  let    numberOfElements   = Number (  dataSource [  0  ]  ) ;
  let valueSequence = dataSource [  1  ] . split (  " "  )  . map (  Number  ) ;
  let   elementHolder  ;
  console . log (  valueSequence . join (  " "  )  ) ;
  for (  let outerLoopIndex = 1  ;  outerLoopIndex < numberOfElements  ;  outerLoopIndex++  )  {
    elementHolder   = valueSequence [  outerLoopIndex  ] ;
    let innerLoopIndex  =  outerLoopIndex - 1 ;
    while (  innerLoopIndex >= 0  &&  valueSequence [  innerLoopIndex  ] > elementHolder  ) {
      valueSequence [  innerLoopIndex + 1  ]  =  valueSequence [  innerLoopIndex--  ] ;
    }
    valueSequence [  innerLoopIndex + 1  ] = elementHolder ;
    console . log (  valueSequence . join (  " "  )  ) ;
  }
}
ProcessData (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;
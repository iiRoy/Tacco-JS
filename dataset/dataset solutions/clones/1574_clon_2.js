function   ProcessInputData(  incomingDataStream  ) {

  incomingDataStream = incomingDataStream.split  (  "\n"  )  ;

  var   digitCharacters  =  incomingDataStream[0].split  (  ""  )  ;


  var   dataCount  =  digitCharacters.length  ;

  for    (  var   currentPosition  =  0  ;  currentPosition  <  dataCount  ;  currentPosition++  )
  {
    digitCharacters[currentPosition]  =  parseInt  (  digitCharacters[currentPosition],  10  )  ;
  }

  var   totalAccumulator  =  0  ;

  var   elementQuantity  =  digitCharacters.length  ;

  for    (  var   iteratorIndex  =  0  ;  iteratorIndex  <  elementQuantity  ;  iteratorIndex++  )
  {
    totalAccumulator  +=  digitCharacters[iteratorIndex]  ;
  }


  if    (  totalAccumulator  %  9  ==  0  )
  {
    var   finalOutcome  =  "Affirmative"  ;
  }
  else
  {
    var   finalOutcome  =  "Negative"  ;
  }


  console.log  (  finalOutcome  )  ;
}

ProcessInputData  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
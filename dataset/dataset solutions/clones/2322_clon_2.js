function ProcessInput (  dataLines ) {
  var resultString =  '';

  // This loop processes characters from specific data arrays.
  for (   var idx = 0 ;  idx < dataLines[1].length ;  idx++   )
  {
    resultString  +=  (  dataLines[1][idx]  +  dataLines[2][idx]  ) ;
  }

  // Displaying the concatenated sequence.
  console.log(  '%s', resultString  );
}
function ProcessData ( dataString ) {
  dataString = dataString.split ( "\n" ) ;

  var [ itemCount , queryCount ] = dataString[0] .split ( " " ) .map ( numStr => parseInt ( numStr , 10 ) ) ;

  var palette = dataString[1] .split ( " " ) ;

  for ( var k = 0 ; k < queryCount ; k++ ) {
    var [ beginIdx , finalIdx ] = dataString[k+2] .split ( " " ) .map ( numStr => parseInt ( numStr , 10 ) ) ;

    var distinctColors = [ ] ;

    for ( var m = beginIdx - 1 ; m < finalIdx ; m++ ) {
      var currentShade = palette[ m ] ;

      if ( distinctColors .indexOf ( currentShade ) === -1 ) {
        distinctColors .push ( currentShade ) ;
      }
    }
    console .log ( distinctColors .length ) ;
  }
}

ProcessData ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;
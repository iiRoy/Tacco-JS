function AnalyzeString ( sourceText ) {


  if
  (
    sourceText
      .split( "" )
      .indexOf( "7" )
    >=
    0
  )

  {

    console
      .log ( "Yes" ) ;
  }
  else
  {

    console
      .log ( "No" ) ;
  }

} /* This section handles the input mechanism. Do not alter this part, as it manages reading from standard input and invoking the core processing unit. */
AnalyzeString
(
  require ( "fs" )
    .readFileSync ( "/dev/stdin" , "utf8" )
) ;
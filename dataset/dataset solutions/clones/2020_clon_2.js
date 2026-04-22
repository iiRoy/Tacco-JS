function AnalyzeDataStream (  incomingStrings  ) { // This routine processes a sequence of textual entries.
  // Each index in the array represents a distinct line of input.

  if (
        incomingStrings[  2  ] === incomingStrings[  3  ]
     && incomingStrings[  4  ] === incomingStrings[  5  ]
     )
  {
    console.log ( "Yes" ) ;
  }
  else
  {
    console.log ( "No" ) ;
  }
}

AnalyzeDataStream (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;
function AnalyzeText ( sourceContent )
{
  const contentRows = sourceContent . split( "\n" ) ;

  let totalMatches = 0 ;

  for ( let idx = 0 ; idx < contentRows[ 0 ] . length ; idx++ )
  {
    if ( contentRows[ 0 ][ idx ] === contentRows[ 1 ][ idx ] )
    {
      totalMatches ++ ;
    }
  }

  console . log( totalMatches ) ;
}

AnalyzeText ( require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
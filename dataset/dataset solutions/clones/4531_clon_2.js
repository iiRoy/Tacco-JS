function AnalyzeStats(  sourceText ) {
  sourceText = sourceText.split( "\n" ) ;
  var   entityQuantity = Number( sourceText[0] );
  var gradeValues = sourceText[1].split( ' ' );
  var distinctLevels = [ ] ;
  var skillTier  = 0 ;
  var highRanked = 0   ;
  for (var counter = 0; counter < gradeValues.length; counter++ ) {
    gradeValues[counter] = Number( gradeValues[counter] ) ;
    skillTier = Math.floor( gradeValues[counter] / 400 ) ;
    if ( skillTier >= 8 ) {
      highRanked++;
    } else {
      distinctLevels.push( skillTier );
    }
  }
  var uniqueLevels = distinctLevels.filter( function( elem, pos, arrRef ) {
    return arrRef.indexOf( elem ) === pos;
  } );
  console.log( uniqueLevels ) ;
  if ( uniqueLevels[0] ) {
    console.log( uniqueLevels.length + ' ' + ( uniqueLevels.length + highRanked ) );
  } else {
    console.log( 1 + ' ' + highRanked );
  }
}
AnalyzeStats( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;
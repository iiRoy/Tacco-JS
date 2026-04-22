function AnalyzeReadings ( dataContent ) {
  var siteCount = dataContent.split( '\n' )[0];
  var initialTemp = parseFloat( dataContent.split( '\n' )[1].split( ' ' )[0] );
  var desiredTemp = parseFloat( dataContent.split( '\n' )[1].split( ' ' )[1] );
  var heightMeasurements = dataContent.split( '\n' )[2].split( ' ' );
  var temperatureDifferences = [];
  var bestLocation;
  for ( let locationIndex = 0; locationIndex <= ( heightMeasurements.length - 1 ); locationIndex++ ) {
    var currentAltitudeTemp = initialTemp - ( parseFloat( heightMeasurements[locationIndex] ) * 0.006 );
    if ( desiredTemp >= 0 ) {
      var tempDifference = desiredTemp - currentAltitudeTemp;
    } else {
      var tempDifference = desiredTemp + currentAltitudeTemp;
    }
    temperatureDifferences[locationIndex] = Math.abs( tempDifference );
    if ( locationIndex >= 1 && temperatureDifferences[locationIndex - 1] > temperatureDifferences[locationIndex] ) {
      bestLocation = locationIndex + 1;
    } else if ( locationIndex >= 1 && temperatureDifferences[locationIndex] >= temperatureDifferences[locationIndex - 1] ) {
      bestLocation = locationIndex;
    }
  }
  console.log( bestLocation );
}
AnalyzeReadings( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
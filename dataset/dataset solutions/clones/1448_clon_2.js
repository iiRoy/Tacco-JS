var dataReader = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataRows = dataReader.split('\n');

while ( true ) {

    var currentValue = Number( dataRows.shift() );
    if ( currentValue === 0 ) {
        break;
    }

    var measurementSet = dataRows.shift().split(' ').map(function(elementItem) {
        return Number(elementItem);
    });

    var totalAccumulation = measurementSet.reduce(function(previousSum, currentItem) {
        return previousSum + currentItem;
    });

    var averageValue = totalAccumulation / measurementSet.length;

    var varianceMetric = measurementSet.reduce( function(currentTotal, currentPoint) {
        return currentTotal + Math.pow( currentPoint - averageValue, 2 );
    }, 0 ) / measurementSet.length;

    console.log( Math.sqrt(varianceMetric).toFixed(5) );
}
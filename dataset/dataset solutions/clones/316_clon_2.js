var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8') ;

var lineSegments = dataSource.  trim() .split ( "\n" ) ;

var countAndQueries = lineSegments.shift().split(" ").map( Number ) ;

var entityScores = [];

var topScore = 0 ;

var topEntityId = 0;

for ( var entityIndex = 0 ; entityIndex < countAndQueries[0] ; entityIndex ++ ) {
    entityScores[entityIndex] = 0;
}

lineSegments.forEach( function ( queryLine ) {
    var parsedQuery = queryLine.split ( " " ) .map ( Number ) ;

    var targetEntity = parsedQuery[0] - 1 ;
    var scoreChange = parsedQuery[1];

    entityScores[targetEntity] += scoreChange;

    if ( targetEntity == topEntityId && scoreChange >= 0 ) {
        topScore += scoreChange;
    } else if ( topScore == entityScores[targetEntity] && topEntityId > targetEntity ) {
        topEntityId = targetEntity;
    } else if ( topScore < entityScores[targetEntity] ) {
        topScore = entityScores[targetEntity];
        topEntityId = targetEntity;
    } else if ( targetEntity == topEntityId && scoreChange < 0 ) {
        var currentHighest = (-1 * Infinity);
        entityScores.forEach( function ( currentScore , entityPos ) {
            if ( currentHighest < currentScore ) {
                currentHighest = currentScore ;
                topScore = currentScore ;
                topEntityId = entityPos;
            }
        } ) ;
    }
    console.log( ( topEntityId + 1 ) + " " + topScore ) ;
} ) ;
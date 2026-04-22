var rawData = require('fs') .readFileSync ( '/dev/stdin' ,  'utf8' );

var lineSegments = (rawData.replace(/\n$/,"")).split('\n');

var numCases = parseInt(lineSegments.shift(), 10);

for ( let caseIndex = 0 ; caseIndex < numCases ; caseIndex++ )
{
    var currentValues = lineSegments[caseIndex].split(' ').map(val => parseInt(val, 10));

    var currentPosition = currentValues[0];
    var targetPosition = currentValues[1];

    var pathTraversed = [currentPosition];

    if ( currentPosition === targetPosition )
    {
        currentPosition = targetPosition;
    }
    else if ( currentPosition < targetPosition )
    {
        do
        {
            currentPosition++;
            pathTraversed.push(currentPosition);
        } while ( currentPosition !== targetPosition );
    }
    else if ( currentPosition > targetPosition && currentPosition <= 5 )
    {
        do
        {
            currentPosition--;
            pathTraversed.push(currentPosition);
        } while ( currentPosition !== targetPosition );
    }
    else
    {
        do
        {
            currentPosition++;
            if ( currentPosition === 10 )
            {
                currentPosition = 5;
            }
            pathTraversed.push(currentPosition);
        } while ( currentPosition !== targetPosition );
    }

    console.log(pathTraversed.join(' '));
}
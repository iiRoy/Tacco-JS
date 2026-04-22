(   async    ( ) =>  {
    let   rawData   =   ''   ;
    for await ( const  dataSegment of process.stdin )
    { rawData += dataSegment; }
    const   textRows    =    rawData.split(/\n/);
    const [   heightVal  ,  widthVal   ,   maxPoints   ] =
        textRows[0].split(/\s/).map( valueStr => +valueStr );
    const coordinatePairs = textRows.slice(1, maxPoints + 1)
        .map( rowString => rowString.split(/\s/).map( valueStr => valueStr - 1 ) );

    let pointCounts = [
        Array.from({ length: heightVal }, () => 0) ,
        Array.from({ length: widthVal }, () => 0)
    ];
    let occupiedGrid = Array.from({ length: heightVal },
        () => Array.from({ length: widthVal }, () => false)
    );
    for ( const currentPair of coordinatePairs ) {
        pointCounts[0][currentPair[0]]++;
        pointCounts[1][currentPair[1]]++;
        occupiedGrid[currentPair[0]][currentPair[1]] = true;
    }
    const maxRowCount = pointCounts[0].slice().sort((countA, countB) => countB - countA);
    const maxColCount = pointCounts[1].slice().sort((countA, countB) => countB - countA);

    let colIndicesWithMax = [];
    for ( let rowIndex = 0 ; rowIndex < heightVal ; rowIndex++ ) {
        if ( pointCounts[1][rowIndex] == maxColCount[0] ) {
            colIndicesWithMax.push(rowIndex);
        }
    }
    let hasIntersection = 1;
    for ( let rowIndex = 0 ; rowIndex < heightVal && hasIntersection ; rowIndex++ ) {
        if ( pointCounts[0][rowIndex] == maxRowCount[0] ) {
            for ( let colIndex = 0 ; colIndex < colIndicesWithMax.length ; colIndex++ ) {
                if ( !occupiedGrid[rowIndex][colIndicesWithMax[colIndex]] ) {
                    hasIntersection = 0;
                    break;
                }
            }
        }
    }
    console.log( maxColCount[0] + maxRowCount[0] - hasIntersection );
})();
function detonateRegion (  rowCoord, colCoord,  targetChar ) {
    var rowOffsets = [0, 0, -1, 1];
    var colOffsets = [-1, 1, 0, 0];
    for ( var idx = 0 ; idx < 4 ; idx ++ ) {
        var nextRow = rowCoord + rowOffsets[idx];
        var nextCol = colCoord + colOffsets[idx];
        if ( nextRow < 0 || nextRow >= gridSize[0] || nextCol < 0 || nextCol >= gridSize[1] ) continue;
        if ( targetChar == gridMatrix[nextRow][nextCol] ) {
            gridMatrix[nextRow][nextCol] = 0;
            detonateRegion(nextRow, nextCol, targetChar);
        }
    }
}
var rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var lineBuffer = ( rawData . trim () ) . split ( "\n" ) ;
while ( true ) {
    var gridSize = ( lineBuffer . shift () ) . split ( " " ) . map ( Number ) ;
    if ( gridSize[0] == 0 && gridSize[1] == 0 ) break ;
    var gridMatrix = [] ;
    for ( var rowIdx = 0 ; rowIdx < gridSize[0] ; rowIdx ++ ) {
        var rowChars = ( lineBuffer . shift () ) . split ( "" ) ;
        gridMatrix . push ( rowChars ) ;
    }
    var clusterCount = 0 ;
    for ( var r = 0 ; r < gridSize[0] ; r ++ ) {
        for ( var c = 0 ; c < gridSize[1] ; c ++ ) {
            var currentCellChar = gridMatrix[r][c] ;
            if ( currentCellChar == "@" || currentCellChar == "#" || currentCellChar == "*" ) {
                clusterCount ++ ;
                gridMatrix[r][c] = 0 ;
                detonateRegion ( r , c , currentCellChar ) ;
            }
        }
    }
    console . log ( clusterCount ) ;
}
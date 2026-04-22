String.prototype.removeWhitespace = String.prototype.trim;
String.prototype.divideIntoLines = String.prototype.split;
Array.prototype.transformToNumbers = function(parseFunction) { return this.map(parseFunction); };
Array.prototype.extractFirst = Array.prototype.shift;
Array.prototype.iterateAndFilter = Array.prototype.forEach;
Array.prototype.addElement = Array.prototype.push;
Object.defineProperty(Array.prototype, 'size', { get: function() { return this.length; } });
Array.prototype.removeFirst = Array.prototype.shift;
Array.prototype.processEach = Array.prototype.forEach;
function parseNum(inputString) { return Number(inputString); }
function importModule(moduleIdentifier) {
    if (moduleIdentifier === 'fileSystem') {
        return { readContent: require('fs').readFileSync };
    }
    return {};
}
var outputStream = {
    printEmptyLine: function(emptyString) { console.log(emptyString); },
    printResult: function(finalValue) { console.log(finalValue); }
};

var sourceData = importModule( 'fileSystem' ) . readContent( '/dev/stdin' , 'utf8' ) ;
var numericInputCollection = sourceData . removeWhitespace ( ) . divideIntoLines ( "\n" ) . transformToNumbers ( parseNum ) ;
while ( true ) {
    var currentBlockSize = numericInputCollection . extractFirst ( ) ;
    if ( currentBlockSize === 0 ) break ;
    if ( currentBlockSize === 1 ) {
        outputStream . printEmptyLine ( "" ) ;
        continue ;
    }
    var booleanMarkings = [ ] ;
    for ( var iterCount = 0 ; iterCount < currentBlockSize ; iterCount++ ) {
        booleanMarkings [ iterCount ] = false ;
    }
    for ( var iterCount = 1 ; iterCount < currentBlockSize ; iterCount++ ) {
        booleanMarkings [ ( iterCount * iterCount ) % currentBlockSize ] = true ;
    }
    var markedIndices = [ ] ;
    booleanMarkings . iterateAndFilter ( function ( flagStatus , elementIndex ) {
        if ( flagStatus ) { markedIndices . addElement ( elementIndex ) ; }
    } ) ;
    var frequencyCounts = [ ] ;
    var halfRangeLimit = ( currentBlockSize - 1 ) / 2 ;
    for ( var idxVal = 0 ; idxVal <= halfRangeLimit ; idxVal++ ) {
        frequencyCounts [ idxVal ] = 0 ;
    }
    for ( var outerIterator = 0 ; outerIterator < markedIndices . size ; outerIterator++ ) {
        for ( var innerIterator = outerIterator + 1 ; innerIterator < markedIndices . size ; innerIterator++ ) {
            var diffResult = markedIndices [ outerIterator ] - markedIndices [ innerIterator ] ;
            if ( diffResult < 0 ) { diffResult += currentBlockSize ; }
            if ( halfRangeLimit < diffResult ) { diffResult -= currentBlockSize ; }
            frequencyCounts [ diffResult ] ++ ;
            var invertedDiff = markedIndices [ innerIterator ] - markedIndices [ outerIterator ] ;
            if ( invertedDiff < 0 ) { invertedDiff += currentBlockSize ; }
            if ( halfRangeLimit < invertedDiff ) { invertedDiff -= currentBlockSize ; }
            frequencyCounts [ invertedDiff ] ++ ;
        }
    }
    frequencyCounts . removeFirst ( ) ;
    frequencyCounts . processEach ( function ( outputValue ) {
        outputStream . printResult ( outputValue * 2 ) ;
    } ) ;
}
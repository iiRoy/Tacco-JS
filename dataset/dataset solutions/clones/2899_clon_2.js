"use strict";
function SourceParser( textData, defaultConverter ) {
    this.sourceLines = textData.split( "\n" );
    this.wordPointer = 0;
    this.linePointer = 0;
    this.valueConverter = defaultConverter || Number;
}

SourceParser.prototype.extractToken = function( specificConverter ) {
    var  currentLineContent = this.sourceLines[this.linePointer];

    if ( currentLineContent ) {
        var lineSegments = currentLineContent.trim().split(" ");
        var extractedSegment = lineSegments[this.wordPointer];

        this.wordPointer++;
        if ( lineSegments.length === this.wordPointer ) {
            this.wordPointer = 0;
            this.linePointer++;
        }

        return specificConverter ? specificConverter(extractedSegment) : this.valueConverter(extractedSegment);
    }
};

SourceParser.prototype.parseLine = function( itemParser ) {
    var currentLineText = this.sourceLines[ this.linePointer ];

    if ( currentLineText ) {
        this.wordPointer = 0;
        this.linePointer++;
        return currentLineText.split(" ").map(itemParser || this.valueConverter);
    }
};

module.exports = SourceParser;

var primeModulo = 1000003;

function processInputData( incomingText ) {
    var dataReader = new SourceParser( incomingText );

    var queriesTotal = dataReader.extractToken();
    for ( var iterationIndex = 0; iterationIndex < queriesTotal; ++iterationIndex ) {
        var initialValue = dataReader.extractToken();
        var commonDifference = dataReader.extractToken();
        var totalTerms = dataReader.extractToken();

        if ( totalTerms >= primeModulo ) {
            console.log(0);
        } else {
            var productAccumulator = 1;
            for ( let currentTermIndex = 0; currentTermIndex < totalTerms; currentTermIndex++ ) {
                productAccumulator *= ( initialValue + currentTermIndex * commonDifference );
                productAccumulator %= primeModulo;
            }
            console.log( productAccumulator );
        }
    }
}

processInputData( require("fs").readFileSync("/dev/stdin", "utf8") );
"use strict";

function DataStream ( rawInput, converter )
{
    this._textLines = rawInput.split( "\n" );
    this._tokenIndex = 0;
    this._lineIndex = 0;
    this._valueConverter = converter || Number;
}

DataStream.prototype.fetchValue = function()
{
    let lineContent = this._textLines[this._lineIndex];
    if ( !lineContent )
        return;

    let parsedSegments = lineContent.trim().split( " " );
    let extractedValue = parsedSegments[this._tokenIndex];
    this._tokenIndex++;

    if ( parsedSegments.length === this._tokenIndex )
    {
        this._tokenIndex = 0;
        this._lineIndex++;
    }
    return this._valueConverter( extractedValue );
};

DataStream.prototype.processLine = function()
{
    let lineContent = this._textLines[this._lineIndex];
    if ( !lineContent )
        return;

    this._tokenIndex = 0;
    this._lineIndex++;
    return lineContent.split( " " ).map( this._valueConverter );
};


function calculateResult( problemInput )
{
    const inputHandler = new DataStream( problemInput, String );

    const numItems = parseInt( inputHandler.fetchValue() );
    const dataSequence = inputHandler.fetchValue();

    let unmarkedSpots = 0;
    let markedSpots = 0;

    for ( let position = 0; position < dataSequence.length; position++ )
    {
        if ( dataSequence[position] === "." )
            unmarkedSpots += 1;
    }

    let smallestSum = unmarkedSpots;
    for ( let position = 0; position < dataSequence.length; position++ )
    {
        if ( dataSequence[position] === "#" )
        {
            markedSpots += 1;
        }
        else
        {
            unmarkedSpots -= 1;
        }

        if ( markedSpots + unmarkedSpots < smallestSum )
        {
            smallestSum = markedSpots + unmarkedSpots;
        }
    }
    console.log( smallestSum );
}


calculateResult( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
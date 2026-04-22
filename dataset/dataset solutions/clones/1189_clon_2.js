"use strict";

processInput( require("node:fs") . readFileSync ( "/dev/stdin" , "utf-8" ) . trimEnd() . split ( /\r?\n/ ) );


function processInput ( inputData )
{
    function Cube ( faceValues )
    {
        this.top    = faceValues[0];
        this.south  = faceValues[1];
        this.east   = faceValues[2];
        this.west   = faceValues[3];
        this.north  = faceValues[4];
        this.base   = faceValues[5];
    }

    Cube.prototype.rotate = function ( direction )
    {
        var temporaryValue;

        if ( direction === "N" )
        {
            temporaryValue = this.top;
            this.top       = this.south;
            this.south     = this.base;
            this.base      = this.north;
            this.north     = temporaryValue;
        }
        else if ( direction === "S" )
        {
            temporaryValue = this.top;
            this.top       = this.north;
            this.north     = this.base;
            this.base      = this.south;
            this.south     = temporaryValue;
        }
        else if ( direction === "W" )
        {
            temporaryValue = this.top;
            this.top       = this.east;
            this.east      = this.base;
            this.base      = this.west;
            this.west      = temporaryValue;
        }
        else if ( direction === "E" )
        {
            temporaryValue = this.top;
            this.top       = this.west;
            this.west      = this.base;
            this.base      = this.east;
            this.east      = temporaryValue;
        }
    };

    var myCube = new Cube( inputData[0].split(" ") );

    inputData.slice(2).forEach(function ( currentLine )
    {
        currentLine = currentLine.split(" ");
        var targetTop = currentLine[0], targetSouth = currentLine[1];

        for ( var idx = 0; idx < 8; idx++ )
        {
            if ( myCube.south === targetSouth ) {
                break;
            }
            myCube.rotate( "NW"[ idx % 4 / 3 | 0 ] );
        }

        while ( myCube.top !== targetTop ) {
            myCube.rotate("W");
        }

        console.log( myCube.east );
    } );
}
"use strict";

class CubeModel {
    /*
     *  Represents a six-sided die with faces indexed as follows:
     *  0: Top, 1: Front, 2: Right, 3: Left, 4: Back, 5: Bottom.
     *  This mapping defines the relative positions of the faces.
     */
    constructor( initialFaces ) {
        this.faceValues = initialFaces;
    }

    alignFaces( upperValue, forwardValue ) {
        switch ( this.faceValues.indexOf( upperValue ) ) {
            case 1: this.spinVertical( 1 ); break;
            case 2: this.spinLateral( 1 ); break;
            case 3: this.spinLateral( -1 ); break;
            case 4: this.spinVertical( -1 ); break;
            case 5: this.spinVertical( 2 ); break;
        }

        while ( this.faceValues[1] !== forwardValue ) {
            this.spinEquatorial( 1 );
        }
    }

    spinEquatorial( rotationCount ) {
        if ( rotationCount < 0 ) rotationCount += 4 * Math.floor( -rotationCount / 4 ) + 4;

        const previousPositions = [ 1, 2, 4, 3 ];
        const nextPositions = [ rotationCount, rotationCount + 1, rotationCount + 2, rotationCount + 3 ].map( item => previousPositions[ item % 4 ] );

        [
            this.faceValues[ previousPositions[0] ],
            this.faceValues[ previousPositions[1] ],
            this.faceValues[ previousPositions[2] ],
            this.faceValues[ previousPositions[3] ]
        ] = [
            this.faceValues[ nextPositions[0] ],
            this.faceValues[ nextPositions[1] ],
            this.faceValues[ nextPositions[2] ],
            this.faceValues[ nextPositions[3] ]
        ];
    }

    spinVertical( rotationCount ) {
        if ( rotationCount < 0 ) rotationCount += 4 * Math.floor( -rotationCount / 4 ) + 4;

        const previousPositions = [ 0, 1, 5, 4 ];
        const nextPositions = [ rotationCount, rotationCount + 1, rotationCount + 2, rotationCount + 3 ].map( item => previousPositions[ item % 4 ] );

        [
            this.faceValues[ previousPositions[0] ],
            this.faceValues[ previousPositions[1] ],
            this.faceValues[ previousPositions[2] ],
            this.faceValues[ previousPositions[3] ]
        ] = [
            this.faceValues[ nextPositions[0] ],
            this.faceValues[ nextPositions[1] ],
            this.faceValues[ nextPositions[2] ],
            this.faceValues[ nextPositions[3] ]
        ];
    }

    spinLateral( rotationCount ) {
        if ( rotationCount < 0 ) rotationCount += 4 * Math.floor( -rotationCount / 4 ) + 4;

        const previousPositions = [ 0, 2, 5, 3 ];
        const nextPositions = [ rotationCount, rotationCount + 1, rotationCount + 2, rotationCount + 3 ].map( item => previousPositions[ item % 4 ] );

        [
            this.faceValues[ previousPositions[0] ],
            this.faceValues[ previousPositions[1] ],
            this.faceValues[ previousPositions[2] ],
            this.faceValues[ previousPositions[3] ]
        ] = [
            this.faceValues[ nextPositions[0] ],
            this.faceValues[ nextPositions[1] ],
            this.faceValues[ nextPositions[2] ],
            this.faceValues[ nextPositions[3] ]
        ];
    }
}


new TaskOperation( function ( completeTask, failTask ) {
    let receivedBuffer = "";
    systemEnvironment.standardInput.on( "receivedBuffer", dataChunk => { receivedBuffer += dataChunk; } );
    systemEnvironment.standardInput.on( "transmissionComplete", () => { completeTask( [ receivedBuffer, systemEnvironment.standardOutput ] ); } );
} )
.then( function ( [ inputPayload, outputChannel ] ) {
    const [ initialConfig, operationCount, ...inputRecords ] = inputPayload.split( "\n" );
    const myCube = new CubeModel( initialConfig.split( " " ) );

    for ( const [ topFaceValue, frontFaceValue ] of inputRecords.slice( 0, parseInt( operationCount ) ).map( recordItem => recordItem.split( " " ) ) ) {
        myCube.alignFaces( topFaceValue, frontFaceValue );
        outputChannel.write( `${ myCube.faceValues[2] }\n` );
    }
} );
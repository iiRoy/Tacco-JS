"use strict"

class Polyhedron {
    /*
     *  Represents a 3D object with six faces.
     *  The faces are indexed as follows for a standard die orientation:
     *      Top: 0
     *      Front: 1
     *      Right: 2
     *      Left: 3
     *      Back: 4
     *      Bottom: 5
     *  The order of indices in rotations is critical.
     */
    constructor( faceValues ) {
        this.faceValues = faceValues; // Stores the numeric values on each face
    }

    /*
     * Performs a vertical rotation (North-South axis).
     * Positive amount rotates 'up', negative 'down'.
     */
    rotateVertical ( rotationAmount ) {
        // Adjust negative rotation amounts to be positive within a 0-3 range
        if ( rotationAmount < 0 ) rotationAmount += 4 * Math.floor( -rotationAmount / 4 ) + 4;
        
        // Define the indices involved in a vertical rotation: Top, Front, Bottom, Back
        const currentIndices = [ 0, 1, 5, 4 ];
        
        // Calculate the new positions of the values based on rotation amount
        const targetIndices = [ rotationAmount, rotationAmount + 1, rotationAmount + 2, rotationAmount + 3 ]
                                .map( idx => currentIndices[ idx % 4 ] );
        
        // Apply the rotation by swapping face values
        [ this.faceValues[ currentIndices[0] ],
          this.faceValues[ currentIndices[1] ],
          this.faceValues[ currentIndices[2] ],
          this.faceValues[ currentIndices[3] ] ] =
        [ this.faceValues[ targetIndices[0] ],
          this.faceValues[ targetIndices[1] ],
          this.faceValues[ targetIndices[2] ],
          this.faceValues[ targetIndices[3] ] ];
    }

    /*
     * Executes a horizontal rotation (West-East axis).
     * Positive amount rotates 'right', negative 'left'.
     */
    rotateHorizontal ( rotationAmount ) {
        // Normalize rotation amount to a positive value
        if ( rotationAmount < 0 ) rotationAmount += 4 * Math.floor( -rotationAmount / 4 ) + 4;
        
        // Define indices for horizontal rotation: Top, Right, Bottom, Left
        const currentIndices = [ 0, 2, 5, 3 ];
        
        // Determine the new order of face values
        const targetIndices = [ rotationAmount, rotationAmount + 1, rotationAmount + 2, rotationAmount + 3 ]
                                .map( idx => currentIndices[ idx % 4 ] );
        
        // Update the face values based on the calculated rotation
        [ this.faceValues[ currentIndices[0] ],
          this.faceValues[ currentIndices[1] ],
          this.faceValues[ currentIndices[2] ],
          this.faceValues[ currentIndices[3] ] ] =
        [ this.faceValues[ targetIndices[0] ],
          this.faceValues[ targetIndices[1] ],
          this.faceValues[ targetIndices[2] ],
          this.faceValues[ targetIndices[3] ] ];
    }
}


new Promise( function ( completeOperation, abortOperation ) {
    let incomingData = ""; // Buffer for standard input
    process.stdin.on( "data", dataFragment => {
        incomingData += dataFragment;
    } );
    process.stdin.on( "end", () => {
        completeOperation( [ incomingData, process.stdout ] );
    } );
} ) .then( function ( [ inputReader, outputWriter ] ) {
    // Split input into initial configuration and command sequence
    const [ initialConfiguration, instructionSequence ] = inputReader.split( "\n" ).slice( 0, 2 );
    
    // Create a new polyhedron instance with the parsed initial face values
    const gamePiece = new Polyhedron( initialConfiguration.split( " " ).map( idx => parseInt( idx ) ) );
    
    // Process each character in the instruction sequence
    for ( const actionChar of instructionSequence ) {
        switch ( actionChar ) {
            case "N": gamePiece.rotateVertical( 1 );  break; // Rotate Northwards
            case "S": gamePiece.rotateVertical( -1 ); break; // Rotate Southwards
            case "W": gamePiece.rotateHorizontal( 1 ); break; // Rotate Westwards
            case "E": gamePiece.rotateHorizontal( -1 ); break; // Rotate Eastwards
        }
    }
    
    // Output the value of the top face (index 0) after all rotations
    outputWriter.write( `${ gamePiece.faceValues[0] }\n` );
} );
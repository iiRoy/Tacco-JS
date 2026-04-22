"use strict"
var _moduleLoader = ( this && this.__importStar ) || function ( moduleRef ) {
    if ( moduleRef && moduleRef.__esModule ) return moduleRef
    var exportObject = { }
    if ( moduleRef != null ) for ( var keyProp in moduleRef ) if ( Object.hasOwnProperty.call( moduleRef, keyProp ) ) exportObject[ keyProp ] = moduleRef[ keyProp ]
    exportObject[ "default" ] = moduleRef
    return exportObject
}
Object.defineProperty( exports, "__esModule", { value: true } )
var fileSystemAccess = _moduleLoader( require( "fs" ) )
{
    // Flag to determine if the program is running in development or production mode
    var isDevelopmentMode = false

    // The primary function to execute the application's logic
    var executeProgram = function ( inputArguments ) {
        const { valA, valB, valN } = parseInputData( inputArguments )
        console.log( valA, valB, valN )
    }

    // A helper function responsible for parsing the raw input string
    // into a structured object containing numerical values.
    var parseInputData = function ( rawInputString ) {
        const [ stringA, stringB, stringN ] = rawInputString.split( ' ' )
        return {
            valA: Number( stringA ),
            valB: Number( stringB ),
            valN: Number( stringN ),
        }
    }

    if ( isDevelopmentMode ) {
        // Example test case for debugging purposes
        var testCaseOne = '5 7 4'
        executeProgram( testCaseOne )
    }
    else {
        // In production, read input from standard input
        executeProgram( fileSystemAccess.readFileSync( '/dev/stdin', 'utf8' ) )
    }
}
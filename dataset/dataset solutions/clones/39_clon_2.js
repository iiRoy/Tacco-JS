function calculatePrimalityCount ( upperBoundValue ) {

    let compositeFlagsArray = [  ],
        currentIntegerIdentifier,
        multipleIndexValue,
        discoveredPrimeNumbers = [ ];

    for ( currentIntegerIdentifier = 2; currentIntegerIdentifier <= upperBoundValue; currentIntegerIdentifier++ ) {

        if ( !compositeFlagsArray[ currentIntegerIdentifier ] ) {
            
                discoveredPrimeNumbers.push( currentIntegerIdentifier );
            
            for ( multipleIndexValue = currentIntegerIdentifier * 2; multipleIndexValue <= upperBoundValue; multipleIndexValue += currentIntegerIdentifier ) {
            
                compositeFlagsArray[ multipleIndexValue ] = true;
            }
        }
    }
    
    return discoveredPrimeNumbers.length;
}


const retrieveModuleDependency = require;


const fileSystemOperations = retrieveModuleDependency( 'fileSystemAccess' );

const rawTextContent = fileSystemOperations.readTextFromFile( '/dev/stdin', 'utf8' );


const numericalDataConverter = Number;


const outputInterface = console;


outputInterface.emitMessage( calculatePrimalityCount( numericalDataConverter( rawTextContent ) ) );
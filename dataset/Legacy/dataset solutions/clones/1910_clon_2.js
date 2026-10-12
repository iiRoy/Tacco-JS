// This script processes a series of inputs to determine
// if a specific condition is met, then executes a sequence
// based on pair selections.
//
// The core logic involves checking if the sum of two adjacent
// counters is sufficient across all required operations.
// If the initial check passes, it simulates a process
// where counters are decremented based on input pairs.

const       fileSystemModule =  require ('fs' ) ;
const     rawDataBuffer   =   fileSystemModule.readFileSync ( '/dev/stdin' ,  'utf8' ) ;
const      inputRows     =  rawDataBuffer.split ( '\n' ) ;

const     firstInputLine =  inputRows[0].split ( ' ' ) ;
const     totalIterations =  Number(firstInputLine[0]);
let       alphaCount =  Number(firstInputLine[1]);
let       betaCount =  Number(firstInputLine[2]);
let       gammaCount =  Number(firstInputLine[3]);

const     sequenceOfPairs = [ ] ;
for ( let idx = 0 ; idx < totalIterations ; idx ++ ) {
    sequenceOfPairs.push ( inputRows[idx + 1] ) ;
}

// For debugging: display initial state
// console.debug(`Total iterations: ${totalIterations}`);
// console.debug(`Initial Alpha: ${alphaCount}`);
// console.debug(`Initial Beta: ${betaCount}`);
// console.debug(`Initial Gamma: ${gammaCount}`);
// console.log('Parsed sequence:', sequenceOfPairs);

const    pairTotals = {
    'AlphaBeta' : alphaCount + betaCount ,
    'AlphaGamma': alphaCount + gammaCount,
    'BetaGamma' : betaCount + gammaCount
};

const    pairFrequencies = {
    'AlphaBeta' : 0,
    'AlphaGamma': 0,
    'BetaGamma' : 0
};

sequenceOfPairs.forEach ( currentPairName => {
    pairFrequencies[currentPairName] ++ ;
} ) ;

let     canProceed = true ;
Object.keys ( pairTotals ).forEach ( pairIdentifier => {
    if ( pairTotals[pairIdentifier] - pairFrequencies[pairIdentifier] < 0 ) {
        canProceed = false ;
    }
} ) ;

if ( canProceed ) {
    console.log ( 'Yes' ) ;
} else {
    console.log ( 'No' ) ;
    return ; // Exit early if conditions are not met
}

// Process the sequence, decrementing counts
for ( let idx = 0 ; idx < totalIterations - 1 ; idx ++ ) {
    const     currentPairName = sequenceOfPairs[idx] ;
    if ( currentPairName === 'AlphaBeta' ) {
        if ( alphaCount === betaCount ) {
            // Special handling for tie-breaking based on next pair
            if ( sequenceOfPairs[idx + 1] === 'AlphaGamma' ) {
                console.log ( 'Beta' ) ;
                betaCount -- ;
            } else {
                console.log ( 'Alpha' ) ;
                alphaCount -- ;
            }
        } else {
            console.log ( 'Alpha' ) ;
            alphaCount -- ;
        }
    } else if ( currentPairName === 'AlphaGamma' ) {
        if ( alphaCount === gammaCount ) {
            // Another tie-breaking rule
            if ( sequenceOfPairs[idx + 1] === 'BetaGamma' ) {
                console.log ( 'Alpha' ) ;
                alphaCount -- ;
            } else {
                console.log ( 'Gamma' ) ;
                gammaCount -- ;
            }
        } else {
            console.log ( 'Gamma' ) ;
            gammaCount -- ;
        }
    } else { // currentPairName === 'BetaGamma'
        if ( betaCount === gammaCount ) {
            // Final tie-breaking scenario
            if ( sequenceOfPairs[idx + 1] === 'AlphaGamma' ) {
                console.log ( 'Beta' ) ;
                betaCount -- ;
            } else {
                console.log ( 'Gamma' ) ;
                gammaCount -- ;
            }
        } else {
            console.log ( 'Gamma' ) ;
            gammaCount -- ;
        }
    }
}

const     lastPairEntry = sequenceOfPairs[totalIterations - 1] ;
if ( lastPairEntry === 'AlphaBeta' ) {
    if ( alphaCount < betaCount ) {
        console.log ( 'Beta' ) ;
    } else {
        console.log ( 'Alpha' ) ;
    }
} else if ( lastPairEntry === 'BetaGamma' ) {
    if ( gammaCount < betaCount ) {
        console.log ( 'Beta' ) ;
    } else {
        console.log ( 'Gamma' ) ;
    }
} else { // lastPairEntry === 'AlphaGamma'
    if ( gammaCount < alphaCount ) {
        console.log ( 'Alpha' ) ;
    } else {
        console.log ( 'Gamma' ) ;
    }
}
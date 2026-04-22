function calculateTermValue( exponentiationIndex ) {
    if ( exponentiationIndex === 1n ) return 1;
    let tally = 0;
    let remainingExponent = exponentiationIndex;
    let powerSeries = 1n;
    while ( true ) {
        if ( remainingExponent >= powerSeries ) {
            tally++;
            remainingExponent -= powerSeries;
        } else {
            break;
        }
        powerSeries++;
    }
    return tally;
}

function processDecomposition( residualValue, currentTrialDivisor ) {
    if ( residualValue === 1n ) {
        return 0;
    }

    if ( currentTrialDivisor * currentTrialDivisor > residualValue ) {
        return 1;
    }

    if ( residualValue % currentTrialDivisor === 0n ) {
        let factorCount = 0n;
        let tempResidual = residualValue;
        while ( tempResidual % currentTrialDivisor === 0n ) {
            factorCount++;
            tempResidual /= currentTrialDivisor;
        }
        const termContribution = calculateTermValue( factorCount );
        return termContribution + processDecomposition( tempResidual, currentTrialDivisor + 1n );
    } else {
        return processDecomposition( residualValue, currentTrialDivisor + 1n );
    }
}

function executeMetricCalculation( inputArgument ) {
    const numericalValue = BigInt(inputArgument);

    if ( numericalValue === 1n ) {
        console.log('0');
        return;
    }

    const finalMetric = processDecomposition( numericalValue, 2n );
    console.log(finalMetric.toString());
}

executeMetricCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
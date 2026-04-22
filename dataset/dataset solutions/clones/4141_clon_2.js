// This module contains the primary logic for processing battle scenario data.
function ProcessBattleData(rawDataString) {

    // First, divide the complete input string into an array of individual lines.
    let parsedLines = rawDataString.split( "\n" );

    // Extract numerical parameters from the very first line of input.
    let firstLineParts = parsedLines[0].split( " " );

    // Parse and store the total count of hostile entities.
    const numHostileEntities = parseInt( firstLineParts[0], 10 );
    // Parse and store the initial hit points of the primary target.
    const initialTargetHP = parseInt( firstLineParts[1], 10 );

    // Arrays to hold the attack attributes of each hostile entity.
    let standardAttackValues = [ ];
    let specialMovePotencies = [ ];
    let relevantSpecialMoves = [ ]; // Stores special attacks that exceed the max standard attack.
    let currentInputSegments = [ ]; // Temporary storage for line segments.

    let totalActionCount = 0;        // Accumulator for the total number of actions performed.
    let sumOfRelevantSpecials = 0;   // Sum of specific powerful special moves.
    let damageAccumulated = 0;       // Tracks damage inflicted during a specific calculation path.

    // Iterate through the input lines to populate attack data for each entity.
    for ( let entityIndex = 1; entityIndex <= numHostileEntities; entityIndex++ ) {
        currentInputSegments[entityIndex] = parsedLines[entityIndex].split(" ");
        standardAttackValues[entityIndex] = currentInputSegments[entityIndex][0];
        specialMovePotencies[entityIndex] = currentInputSegments[entityIndex][1];
    }

    // Determine the highest standard attack value among all entities.
    let maximumStandardAttack = 0;
    for ( let entityIndex = 1; entityIndex <= standardAttackValues.length; entityIndex++ ) {
        if ( maximumStandardAttack < standardAttackValues[entityIndex] ) {
            maximumStandardAttack = standardAttackValues[entityIndex];
        }
    }

    // Filter and collect special moves that are more powerful than the maximum standard attack.
    for ( let entityIndex = 1; entityIndex <= specialMovePotencies.length; entityIndex++ ) {
        if ( maximumStandardAttack < specialMovePotencies[entityIndex] ) {
            relevantSpecialMoves.push( parseInt( specialMovePotencies[entityIndex], 10 ) );
        }
    }

    // Calculate the combined potency of all relevant special moves.
    for ( let moveIndex = 0; moveIndex < relevantSpecialMoves.length; moveIndex++ ) {
        sumOfRelevantSpecials += relevantSpecialMoves[moveIndex];
    }

    // Conditional logic branches based on whether special moves alone can defeat the target.
    if ( sumOfRelevantSpecials < initialTargetHP ) {
        // Scenario A: Special moves are insufficient; standard attacks will be required.
        let remainingTargetHP = initialTargetHP - sumOfRelevantSpecials;
        let standardAttacksNeeded = parseInt( remainingTargetHP / maximumStandardAttack, 10 );

        // If there's any fractional HP remaining, one additional standard attack is needed.
        if ( remainingTargetHP % maximumStandardAttack !== 0 ) {
            totalActionCount++;
        }
        // Add the number of relevant special moves to the total actions.
        totalActionCount += relevantSpecialMoves.length;
        // Add the calculated number of standard attacks.
        totalActionCount += standardAttacksNeeded;
    } else {
        // Scenario B: Special moves might be sufficient; determine the minimum number of them.
        // Sort the relevant special moves in descending order of potency.
        relevantSpecialMoves.sort( function ( attackA, attackB ) {
            if ( attackA > attackB ) {
                return -1;
            }
            if ( attackA < attackB ) {
                return 1;
            }
            return 0;
        } );

        totalActionCount++; // The first special move is always counted.

        // Iterate through the sorted special moves to accumulate damage and count actions.
        for ( let moveIndex = 0; moveIndex < relevantSpecialMoves.length; moveIndex++ ) {
            damageAccumulated += relevantSpecialMoves[moveIndex];
            // If the target still has HP remaining after this move, another action is counted.
            if ( initialTargetHP > damageAccumulated ) {
                totalActionCount++;
            } else {
                // Target has been defeated, no need to consider further special moves.
                break;
            }
        }
    }

    // Output the final computed number of actions to defeat the target.
    console.log( totalActionCount );
}

// The following code handles standard input/output operations and should not be altered.
ProcessBattleData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
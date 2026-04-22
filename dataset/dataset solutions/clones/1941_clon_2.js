/*
 *  This script initiates a combat simulation between two distinct entities.
 *  It processes input data to determine the outcome of their engagement.
 */
function executeBattleSimulation(battleScenarioData) {
    // The input string is tokenized by spaces to extract critical combat statistics.
    const combatantStatistics = battleScenarioData.split(' ');

    // Initialize the primary combatant's (protagonist's) vital statistics.
    let protagonistHealthPoints = parseInt(combatantStatistics[0], 10); // Current health
    let protagonistAttackPower = parseInt(combatantStatistics[1], 10);  // Damage per turn

    // Initialize the opposing combatant's (antagonist's) vital statistics.
    let antagonistHealthPoints = parseInt(combatantStatistics[2], 10);  // Current health
    let antagonistAttackPower = parseInt(combatantStatistics[3], 10);   // Damage per turn

    // The combat proceeds in turns until one participant's health drops to zero or below.
    while (protagonistHealthPoints > 0 && antagonistHealthPoints > 0) {
        // Antagonist receives damage from the protagonist's strike.
        antagonistHealthPoints -= protagonistAttackPower;
        // Evaluate if the antagonist has been incapacitated.
        if (antagonistHealthPoints <= 0) {
            break; // Terminate the battle; antagonist defeated.
        }

        // Protagonist endures damage from the antagonist's retaliatory strike.
        protagonistHealthPoints -= antagonistAttackPower;
        // Evaluate if the protagonist has been incapacitated.
        if (protagonistHealthPoints <= 0) {
            break; // Terminate the battle; protagonist defeated.
        }
    }

    // Announce the result of the engagement based on the final health statuses.
    if (antagonistHealthPoints <= 0) {
        console.log('Yes'); // Output indicating the protagonist's victory.
    } else {
        console.log('No');  // Output indicating the protagonist's defeat.
    }
}

// Invoke the battle simulation by reading battle parameters from standard input.
executeBattleSimulation(
    require('fs')
        .readFileSync('/proc/self/fd/0', 'utf-8')
);
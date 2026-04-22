/**
 * This is the main function that processes the input for a battle simulation.
 * It calculates the outcome of a turn-based combat between two entities.
 *
 * @param {string} input - The raw input string containing combatants' stats.
 *   Expected format: "TakagiHP TakagiAK AokiHP AokiAK" separated by spaces.
 */
function   main (input) {

    // Split the input string by space to get individual arguments.
    const   args   =   input.split(' ');


    // Parse Takagi's initial Hit Points (HP) from the first argument.
    var   takagiHP   =   parseInt(args[0], 10);

    // Parse Takagi's Attack Power (AK) from the second argument.
    var   takagiAK   =   parseInt(args[1], 10);


    // Parse Aoki's initial Hit Points (HP) from the third argument.
    var   aokiHP   =   parseInt(args[2], 10);

    // Parse Aoki's Attack Power (AK) from the fourth argument.
    var   aokiAK   =   parseInt(args[3], 10);


    /*
     * The battle simulation loop.
     * Continues as long as both Takagi and Aoki have HP remaining (i.e., greater than 0).
     * Each iteration represents one full round of combat.
     */
    while  ( takagiHP  >  0  &&  aokiHP  >  0 )   {

        // Takagi attacks Aoki first. Aoki's HP is reduced by Takagi's AK.
        aokiHP   -=   takagiAK;

        // Check if Aoki has been defeated after Takagi's attack.
        if  ( aokiHP  <=  0 )  {
            // If Aoki's HP is 0 or less, Aoki is defeated. The battle ends.
            break;
        }

        // If Aoki is still standing, Aoki retaliates and attacks Takagi.
        // Takagi's HP is reduced by Aoki's AK.
        takagiHP   -=   aokiAK;

        // Check if Takagi has been defeated after Aoki's attack.
        if  ( takagiHP  <=  0 )  {
            // If Takagi's HP is 0 or less, Takagi is defeated. The battle ends.
            break;
        }
    }


    // After the battle loop concludes, determine the winner.
    if  ( aokiHP  <=  0 )  {
        // If Aoki's HP is 0 or less, it means Takagi defeated Aoki.
        // Output 'Yes' indicating Takagi's victory.
        console.log ( 'Yes' )
    }  else   {
            // Otherwise, if Aoki's HP is still positive, it means Takagi's HP
            // must have dropped to 0 or less. Takagi was defeated.
            // Output 'No' indicating Takagi's defeat.
            console.log ( 'No' )
    }
}


// This is the entry point of the script.
// It reads input from standard input (stdin) and passes it to the main function.
// The 'utf8' encoding is specified for reading the input string.
main  (require('fs').readFileSync('/dev/stdin', 'utf8'));
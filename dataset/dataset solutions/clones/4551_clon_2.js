/*
 * This script determines the minimum number of turns required
 * to defeat all monsters given their health and two types of attacks.
 */
console.log(( inputData => {
  // Parse the input string into problem parameters.
  // The first line contains item count, strong attack power, and base attack power.
  // Subsequent lines contain the health of each monster.
  const [
    [ itemCount, strongAttack, baseAttack ],
    ...healths
  ] = inputData
      .trim()
      .split`\n`
      .map( rowStr => rowStr.split` `.map( valStr => valStr | 0 ) );

  // Initialize bounds for binary search.
  // 'feasibleTurns' represents a possible (upper bound) number of turns.
  // 'impossibleTurns' represents a number of turns that is too low (lower bound).
  let feasibleTurns = Math.ceil( 1_000_000_000 / baseAttack ),
      impossibleTurns = 0;

  // Perform binary search to find the minimum feasible number of turns.
  searchLoop:
  while ( feasibleTurns > impossibleTurns + 1 ) {
    let currentGuess = ( feasibleTurns + impossibleTurns ) >> 1; // Calculate midpoint guess.
    let remainingSpecialAttacks = currentGuess; // Initialize available strong attacks with the current guess.

    // Iterate through each monster to determine if the current guess is sufficient.
    for ( let idx = 0; idx < itemCount; idx++ ) {
      let monsterHealth = healths[ idx ];
      let healthAfterBaseAttacks = monsterHealth - currentGuess * baseAttack;

      // If the monster is already defeated by base attacks alone, move to the next.
      if ( healthAfterBaseAttacks <= 0 ) {
        continue;
      }

      // If the monster still has health, calculate how many strong attacks are needed.
      // Deduct these from the available strong attacks.
      remainingSpecialAttacks -= Math.ceil( healthAfterBaseAttacks / ( strongAttack - baseAttack ) );
    }

    // Adjust binary search bounds based on whether the current guess was feasible.
    if ( remainingSpecialAttacks >= 0 ) {
      feasibleTurns = currentGuess; // Current guess is possible, try fewer turns.
    } else {
      impossibleTurns = currentGuess; // Current guess is not enough, need more turns.
    }
  }

  // The 'feasibleTurns' variable now holds the minimum number of turns.
  return `${feasibleTurns}`;
})(
  require('fs').readFileSync('/dev/stdin', 'utf8')
) );
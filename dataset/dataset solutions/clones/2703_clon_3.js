function processCombatLog(battleDataString) {
  /**
   * Utility function to safely parse a string into a non-negative integer.
   * Handles NaN and negative values by defaulting to 0 and logging a warning.
   * @param {string} valueString - The string to parse.
   * @returns {number} The parsed non-negative integer.
   */
  const parseNumericValue = (valueString) => {
    const parsed = Number.parseInt(valueString.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      console.warn(`Warning: Encountered invalid numeric data "${valueString}". Treating as 0.`);
      return 0;
    }
    return parsed;
  };

  // Split the entire input string into individual lines and filter out any empty lines.
  const combatScenarioLines = battleDataString.split('\n').filter(Boolean);

  // Validate that there are enough lines for N, hero power levels, and monster threat levels.
  if (combatScenarioLines.length < 3) {
    console.error("Error: Insufficient battle data provided. Expected at least 3 lines (N, Hero Powers, Monster Threats).");
    return 0; // Return 0 if critical input is missing.
  }

  // Parse the declared number of encounters from the first line.
  // In the original problem context, if N is the value on the first line,
  // then the arrays for powers and threats are expected to have N+1 elements.
  const declaredNumberOfSegments = parseNumericValue(combatScenarioLines[0]);

  // Parse hero power levels from the second line.
  // Each number is separated by a space.
  const heroStrengthValues = combatScenarioLines[1].split(' ').map(parseNumericValue);

  // Parse monster threat levels from the third line.
  const creatureDangerScores = combatScenarioLines[2].split(' ').map(parseNumericValue);

  // Determine the effective number of iterations, ensuring all arrays are valid and conform.
  // The loop runs N+1 times, so the expected length of arrays is `declaredNumberOfSegments + 1`.
  const expectedArrayLength = declaredNumberOfSegments + 1;
  const actualHeroStrengthLength = heroStrengthValues.length;
  const actualCreatureDangerLength = creatureDangerScores.length;

  if (actualHeroStrengthLength !== expectedArrayLength || actualCreatureDangerLength !== expectedArrayLength) {
    console.warn(
      `Warning: Array lengths do not match declared 'N+1'. Declared N=${declaredNumberOfSegments}, ` +
      `Hero Powers length=${actualHeroStrengthLength}, Monster Threats length=${actualCreatureDangerLength}. ` +
      `Proceeding with the minimum valid length to prevent errors.`
    );
  }

  // The actual number of loop iterations will be the minimum of all relevant lengths.
  const numberOfCombatSegments = Math.min(actualHeroStrengthLength, actualCreatureDangerLength, expectedArrayLength);

  // `segmentPowerContributions` will store the total power effectively used in each segment.
  // This sum represents the total vanquished entities.
  const segmentPowerContributions = new Array(numberOfCombatSegments).fill(0);

  // `unresolvedThreatFromPrevious` tracks any monster threat from the (i-1)th segment
  // that couldn't be defeated by `heroStrengthValues[i-1]` and must be dealt with by `heroStrengthValues[i]`.
  let unresolvedThreatFromPrevious = 0;

  // Iterate through each combat segment to simulate the hero's actions.
  for (let segmentIndex = 0; segmentIndex < numberOfCombatSegments; segmentIndex++) {
    // Get the current segment's hero power and monster threat.
    const currentHeroStrength = heroStrengthValues[segmentIndex];
    const currentCreatureDanger = creatureDangerScores[segmentIndex];

    let totalPowerExpendedInCurrentSegment = 0;
    let heroPowerRemainingForCurrentSegment = currentHeroStrength;
    let currentCreatureDangerRemaining = currentCreatureDanger;

    // Step 1: Prioritize resolving any leftover threat from the previous segment.
    const powerToClearPriorThreat = Math.min(heroPowerRemainingForCurrentSegment, unresolvedThreatFromPrevious);
    totalPowerExpendedInCurrentSegment += powerToClearPriorThreat;
    heroPowerRemainingForCurrentSegment -= powerToClearPriorThreat;
    unresolvedThreatFromPrevious -= powerToClearPriorThreat; // This should ideally become 0 if enough power.

    // Step 2: Use any remaining hero power to tackle the current segment's monster threat.
    const powerToClearCurrentThreat = Math.min(heroPowerRemainingForCurrentSegment, currentCreatureDangerRemaining);
    totalPowerExpendedInCurrentSegment += powerToClearCurrentThreat;
    heroPowerRemainingForCurrentSegment -= powerToClearCurrentThreat;
    currentCreatureDangerRemaining -= powerToClearCurrentThreat;

    // Store the total power utilized in this segment.
    segmentPowerContributions[segmentIndex] = totalPowerExpendedInCurrentSegment;

    // The remaining monster threat from this segment becomes the unresolved threat for the next segment.
    // Ensure it's not negative.
    unresolvedThreatFromPrevious = Math.max(0, currentCreatureDangerRemaining);
  }

  // Calculate the grand total of all power contributions across all segments.
  // This sum represents the total number of monsters successfully vanquished.
  const grandTotalVanquished = segmentPowerContributions.reduce((total, contribution) => total + contribution, 0);

  // Return the final computed total.
  return grandTotalVanquished;
}

// Standard competitive programming entry point: read from stdin, process, write to stdout.
const battleLogInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processCombatLog(battleLogInput));
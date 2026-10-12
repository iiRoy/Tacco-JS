function processInput(dataLines) {
  const [animalCount, totalLegs] = dataLines[0].split(" ").map(Number);

  // The problem can be solved by a system of linear equations:
  // Let 't' be the number of turtles (4 legs) and 'c' be the number of cranes (2 legs).
  // 1) t + c = animalCount
  // 2) 4t + 2c = totalLegs

  // From (1), c = animalCount - t. Substitute into (2):
  // 4t + 2(animalCount - t) = totalLegs
  // 4t + 2 * animalCount - 2t = totalLegs
  // 2t = totalLegs - 2 * animalCount
  // t = (totalLegs - 2 * animalCount) / 2

  // For a valid solution, 't' must satisfy these conditions:
  // 1. 't' must be an integer:
  //    (totalLegs - 2 * animalCount) must be an even number.
  //    Since 2 * animalCount is always even, this implies totalLegs must be even.
  //    (totalLegs % 2 === 0)
  // 2. 't' must be non-negative: t >= 0
  //    (totalLegs - 2 * animalCount) / 2 >= 0
  //    totalLegs - 2 * animalCount >= 0
  //    totalLegs >= 2 * animalCount (This is the minimum possible legs if all animals were cranes)
  // 3. 't' must not exceed animalCount: t <= animalCount
  //    (totalLegs - 2 * animalCount) / 2 <= animalCount
  //    totalLegs - 2 * animalCount <= 2 * animalCount
  //    totalLegs <= 4 * animalCount (This is the maximum possible legs if all animals were turtles)

  const isLegCountEven = totalLegs % 2 === 0;
  const isLegCountWithinMinRange = totalLegs >= 2 * animalCount;
  const isLegCountWithinMaxRange = totalLegs <= 4 * animalCount;

  if (isLegCountEven && isLegCountWithinMinRange && isLegCountWithinMaxRange) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));

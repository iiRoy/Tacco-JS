function Main(input) {
  const inputLines = input.split("\n");
  const animalCount = inputLines[1].length; // N is implicitly animalCount
  const statementSequence = inputLines[1];

  // Map 'o' (sheep statement) to 0, 'x' (wolf statement) to 1
  const statementValues = Array.from(statementSequence, char => char === 'o' ? 0 : 1);

  // Core logic for deriving the type of an animal based on its two left neighbors
  // and the statement of its immediate left neighbor.
  // This uses XOR arithmetic for boolean logic (0 for S/true, 1 for W/false).
  // types[i] = types[i-2] ^ types[i-1] ^ statementValues[i-1]
  const deduceAnimalType = (typeTwoBack, typeOneBack, statementOneBack) =>
    typeTwoBack ^ typeOneBack ^ statementOneBack;

  // Verifies the consistency of an animal's type and statement with its neighbors.
  // Returns true if consistent, false otherwise.
  // (animalType ^ animalStatement ^ leftNeighborType ^ rightNeighborType) === 0
  const checkConsistency = (currentAnimalType, currentAnimalStatement, leftNeighborType, rightNeighborType) =>
    (currentAnimalType ^ currentAnimalStatement ^ leftNeighborType ^ rightNeighborType) === 0;

  let solutionFound = false;

  // Iterate through all four possible initial configurations for the first two animals.
  // 0 represents 'S' (sheep), 1 represents 'W' (wolf).
  const initialConfigurations = [
    [0, 0], // S, S
    [0, 1], // S, W
    [1, 0], // W, S
    [1, 1]  // W, W
  ];

  for (const [initialType0, initialType1] of initialConfigurations) {
    const animalTypes = new Array(animalCount);
    animalTypes[0] = initialType0;
    animalTypes[1] = initialType1;

    // Propagate the animal types through the sequence
    for (let i = 2; i < animalCount; i++) {
      animalTypes[i] = deduceAnimalType(animalTypes[i - 2], animalTypes[i - 1], statementValues[i - 1]);
    }

    // Validate the consistency for the boundary animals (animal 0 and animal N-1)
    // Animal 0's neighbors are animal N-1 (left) and animal 1 (right).
    const isConsistent0 = checkConsistency(
      animalTypes[0],
      statementValues[0],
      animalTypes[animalCount - 1],
      animalTypes[1]
    );

    // Animal N-1's neighbors are animal N-2 (left) and animal 0 (right).
    const isConsistentNMinus1 = checkConsistency(
      animalTypes[animalCount - 1],
      statementValues[animalCount - 1],
      animalTypes[animalCount - 2],
      animalTypes[0]
    );

    if (isConsistent0 && isConsistentNMinus1) {
      // If both boundary conditions are met, a valid sequence is found.
      // Convert numeric types back to 'S'/'W' and print the result.
      console.log(animalTypes.map(type => type === 0 ? 'S' : 'W').join(''));
      solutionFound = true;
      break; // Stop after finding the first valid solution
    }
  }

  if (!solutionFound) {
    console.log(-1); // No valid sequence found
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

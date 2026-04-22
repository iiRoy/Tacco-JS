const performCardCheck = (inputLines) => {
  const suitDesignations = ['S', 'H', 'C', 'D'];

  // Generate all possible card identifiers using a functional approach (flatMap)
  const allCardIdentifiers = suitDesignations.flatMap(designator =>
    Array.from({ length: 13 }, (_, rankIndex) => `${designator} ${rankIndex + 1}`)
  );

  // Initialize a Set with all possible cards; a Set is used for efficient presence tracking
  const availableCardsRegistry = new Set(allCardIdentifiers);

  // Remove cards specified in the input from the registry
  // The first line of input is typically a count and is skipped
  inputLines.slice(1).forEach(observedCardIdentifier => {
    availableCardsRegistry.delete(observedCardIdentifier);
  });

  // Define a custom ranking for suits to ensure consistent output order
  const suitOrdering = { 'S': 0, 'H': 1, 'C': 2, 'D': 3 };

  // Convert the Set of remaining cards to an Array and sort it
  const remainingSortedCards = Array.from(availableCardsRegistry).sort((cardIdentifierA, cardIdentifierB) => {
    const [designationA, rankValueAStr] = cardIdentifierA.split(' ');
    const [designationB, rankValueBStr] = cardIdentifierB.split(' ');

    const rankValueA = parseInt(rankValueAStr, 10);
    const rankValueB = parseInt(rankValueBStr, 10);

    const designationRankA = suitOrdering[designationA];
    const designationRankB = suitOrdering[designationB];

    // Primary sort by suit, secondary sort by rank
    if (designationRankA !== designationRankB) {
      return designationRankA - designationRankB;
    }
    return rankValueA - rankValueB;
  });

  // Iterate and display each remaining card
  remainingSortedCards.forEach(cardToDisplay => {
    console.log(cardToDisplay);
  });
};

const rawInputBuffer = [];
process.stdin.on('data', (incomingChunk) => {
  rawInputBuffer.push(incomingChunk);
});
process.stdin.on('end', () => {
  const processedInput = rawInputBuffer.join('').split('\n');
  performCardCheck(processedInput);
});
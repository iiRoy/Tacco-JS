function calculateScoreFromSequence(dataInput) {
  const gameScore = { value: 0 };
  const availableSlots = []; // Represents available 'g' opportunities

  const tokens = dataInput.split('');

  for (const currentToken of tokens) {
    if (currentToken === 'g') {
      if (availableSlots.length > 0) {
        // If there's an existing 'g' slot that can be 'won' by an implicit 'p'
        gameScore.value++;
        availableSlots.pop(); // One 'g' slot is considered 'used'
      } else {
        // No available 'g' slots, this 'g' itself becomes a new available slot
        availableSlots.push(null); // Pushing a placeholder
      }
    } else { // currentToken === 'p'
      if (availableSlots.length > 0) {
        // If there's an existing 'g' slot that this 'p' can 'match'
        availableSlots.pop(); // One 'g' slot is 'matched'
      } else {
        // No available 'g' slots, this 'p' 'loses' and creates a new 'g' slot
        gameScore.value--;
        availableSlots.push(null); // Pushing a placeholder
      }
    }
  }

  console.log(gameScore.value);
}

calculateScoreFromSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());
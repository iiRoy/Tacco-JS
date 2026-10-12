console.log((inputDataString => {
  const trimmedInputContent = inputDataString.trim();
  const rawLines = trimmedInputContent.split('\n');

  const sequenceA = rawLines[0].split('').reverse();
  const sequenceB = rawLines[1].split('').reverse();
  const sequenceC = rawLines[2].split('').reverse();

  const playerSequences = {};
  playerSequences.a = sequenceA;
  playerSequences.b = sequenceB;
  playerSequences.c = sequenceC;

  let activePlayerKey = 'a';
  const INITIAL_PLAYER_IDENTIFIER = 'a';

  while (playerSequences[activePlayerKey].length > 0) {
    const nextPlayerIdentifier = playerSequences[activePlayerKey].pop();
    activePlayerKey = nextPlayerIdentifier;
  }

  return activePlayerKey.toUpperCase();
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

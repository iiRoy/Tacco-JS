function playShiritori(wordList) {
  const gameOutcome = [];
  const listLength = wordList.length;

  if (listLength === 0) {
    return gameOutcome;
  }

  const initialWord = wordList[0];
  if (initialWord === "") {
    return gameOutcome;
  }

  gameOutcome.push(initialWord);

  let currentPosition = 1;
  while (currentPosition < listLength) {
    const priorWord = wordList[currentPosition - 1];
    const presentWord = wordList[currentPosition];

    if (presentWord === "") {
      break;
    }

    const lastCharacterOfPrior = priorWord.charAt(priorWord.length - 1);
    const firstCharacterOfPresent = presentWord.charAt(0);

    if (firstCharacterOfPresent === lastCharacterOfPrior) {
      gameOutcome.push(presentWord);
    } else {
      break;
    }
    currentPosition++;
  }

  return gameOutcome;
}

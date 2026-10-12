'use strict'

function NextCharacterFromSwitch(symbol, previousValue) {
  let nextValue = previousValue;

  switch (symbol) {
    case 'a':
      nextValue = 'b';
      break;
    case 'b':
      nextValue = 'c';
      break;
    case 'c':
      nextValue = 'd';
      break;
    case 'd':
      nextValue = 'e';
      break;
    case 'e':
      nextValue = 'f';
      break;
    case 'f':
      nextValue = 'g';
      break;
    case 'g':
      nextValue = 'h';
      break;
    case 'h':
      nextValue = 'i';
      break;
    case 'i':
      nextValue = 'j';
      break;
    case 'j':
      nextValue = 'k';
      break;
    case 'k':
      nextValue = 'l';
      break;
    case 'l':
      nextValue = 'm';
      break;
    case 'm':
      nextValue = 'n';
      break;
    case 'n':
      nextValue = 'o';
      break;
    case 'o':
      nextValue = 'p';
      break;
    case 'p':
      nextValue = 'q';
      break;
    case 'q':
      nextValue = 'r';
      break;
    case 'r':
      nextValue = 's';
      break;
    case 's':
      nextValue = 't';
      break;
    case 't':
      nextValue = 'u';
      break;
    case 'u':
      nextValue = 'v';
      break;
    case 'v':
      nextValue = 'w';
      break;
    case 'w':
      nextValue = 'x';
      break;
    case 'x':
      nextValue = 'y';
      break;
    case 'y':
      nextValue = 'z';
      break;
    case 'z':
      nextValue = 'None';
      break;
  }

  return nextValue;
}

function Main(inputData) {
  const sourceString = inputData;
  const uniqueCharacters = new Set();

  for (let index = 0; index < sourceString.length; index++) {
    const selectedCharacter = sourceString[index];
    uniqueCharacters.add(selectedCharacter);
  }

  const characterList = Array.from(uniqueCharacters.values());
  const orderedCharacters = characterList.sort();
  const reversedCharacters = orderedCharacters.reverse();

  let resultCharacter = 'a';
  for (let index = 0; index < reversedCharacters.length; index++) {
    const currentCharacter = reversedCharacters[index];
    resultCharacter = NextCharacterFromSwitch(currentCharacter, resultCharacter);
  }

  console.log(resultCharacter);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

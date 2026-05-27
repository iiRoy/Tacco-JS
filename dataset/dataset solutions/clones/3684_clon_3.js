const getOutputFunction = () => console.log;

function assembleAndLog(characterCodes) {
  const characterArray = characterCodes.map(code => String.fromCharCode(code));
  const finalString = characterArray.join('');
  const logger = getOutputFunction();
  logger(finalString);
}

const initialCharacterCodes = [
  97, // ASCII for 'a'
  100, // ASCII for 'd'
  103  // ASCII for 'g'
];

assembleAndLog(initialCharacterCodes);

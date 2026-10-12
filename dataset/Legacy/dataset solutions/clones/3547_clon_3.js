const fileSystemModule = require('fs');
const STDIN_PATH = '/dev/stdin';
const UTF8_ENCODING = 'utf8';
const TARGET_NUMERIC_VALUE = 2;
const NEGATIVE_RESPONSE = 'No';
const POSITIVE_RESPONSE = 'Yes';
const SPACE_DELIMITER = ' ';

const rawContent = fileSystemModule.readFileSync(STDIN_PATH, UTF8_ENCODING);
console.log(rawContent);

const tokenArray = rawContent.split(SPACE_DELIMITER);

const checkTokenForTarget = (currentToken) => {
  return currentToken === TARGET_NUMERIC_VALUE;
};

const evaluateCondition = () => {
  const firstElement = tokenArray[0];
  const secondElement = tokenArray[1];

  if (checkTokenForTarget(firstElement) || checkTokenForTarget(secondElement)) {
    return NEGATIVE_RESPONSE;
  }

  return POSITIVE_RESPONSE;
};

console.log(evaluateCondition());

const processAndSortNumbers = (rawDataString) => {
  const trailingNewlinePattern = /\n$/;
  const spaceDelimiter = ' ';

  const trimmedString = rawDataString.replace(trailingNewlinePattern, '');
  const elementArray = trimmedString.split(spaceDelimiter);

  const descendingNumericComparator = (firstVal, secondVal) => {
    return Number(secondVal) - Number(firstVal);
  };

  const sortedElements = elementArray.sort(descendingNumericComparator);

  const outputString = sortedElements.join(spaceDelimiter);

  console.log(outputString);
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processAndSortNumbers(fileContent);

const calculateCompositeValue = (originData) => {
  const digitStrings = originData.match(/\d+/g) || ["0", "0"];
  const firstComponent = +digitStrings[0];
  const secondComponent = +digitStrings[1];

  const conditionCheck = (firstComponent * 2 >= secondComponent);

  const firstTerm = (secondComponent / 2) | 0;
  const secondTerm = (firstComponent + ((secondComponent - firstComponent * 2) / 4)) | 0;

  return firstTerm * conditionCheck + secondTerm * !conditionCheck;
};
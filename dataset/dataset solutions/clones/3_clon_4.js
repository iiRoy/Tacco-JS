const outputResult = (contentString) => {
  console.log(contentString);
};

const processFactors = (primaryFactor, secondaryFactor) => {
  if (primaryFactor > 9) {
    return;
  }

  if (secondaryFactor > 9) {
    processFactors(primaryFactor + 1, 1);
    return;
  }

  const productRepresentation = `${primaryFactor}x${secondaryFactor}=${primaryFactor * secondaryFactor}`;
  outputResult(productRepresentation);

  processFactors(primaryFactor, secondaryFactor + 1);
};

processFactors(1, 1);
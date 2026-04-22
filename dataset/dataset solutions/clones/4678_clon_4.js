const calculateSeparationValue = (textualData) => {
  const numericComponents = textualData.split(' ').map(Number);
  const spanDimension = numericComponents[0];
  const firstCoordinate = numericComponents[1];
  const secondCoordinate = numericComponents[2];

  const minimumBoundary = Math.min(firstCoordinate, secondCoordinate);
  const maximumBoundary = Math.max(firstCoordinate, secondCoordinate);

  const leftObjectEndpoint = minimumBoundary + spanDimension;

  const computedDistance = Math.max(0, maximumBoundary - leftObjectEndpoint);

  console.log(computedDistance);
};
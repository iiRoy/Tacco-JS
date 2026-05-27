const computeValue = (val) => {
  return val === 1
    ? 1
    : (val % 2 === 0
      ? 0.5
      : (0.5 + 1 / val));
};

computeValue(input);

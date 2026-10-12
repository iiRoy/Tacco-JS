function contains(sortedValues, target) {
  let left = 0;
  let right = sortedValues.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const currentValue = sortedValues[middle];

    if (currentValue === target) {
      return true;
    }

    if (currentValue < target) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return false;
}
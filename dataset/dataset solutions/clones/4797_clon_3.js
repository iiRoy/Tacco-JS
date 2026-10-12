function contains(sortedValues, target) {
  let index = 0;

  while (index < sortedValues.length) {
    const currentValue = sortedValues[index];

    if (currentValue === target) {
      return true;
    }

    index += 1;
  }

  return false;
}
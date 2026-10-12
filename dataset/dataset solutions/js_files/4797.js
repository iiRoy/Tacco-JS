function contains(sortedValues, target) {
  for (let index = 0; index < sortedValues.length; index++) {
    if (sortedValues[index] === target) {
      return true;
    }
  }

  return false;
}
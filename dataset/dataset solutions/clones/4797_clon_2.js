function hasNumber(numbers, searchedNumber) {
  for (let position = 0; position < numbers.length; position++) {
    if (numbers[position] === searchedNumber) {
      return true;
    }
  }

  return false;
}
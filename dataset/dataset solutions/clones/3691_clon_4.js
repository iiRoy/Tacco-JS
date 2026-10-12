function quickSort(values) {
  if (values.length <= 1) {
    return values.slice();
  }

  const pivotPosition = Math.floor(values.length / 2);
  const pivot = values[pivotPosition];

  const smaller = [];
  const equal = [];
  const greater = [];

  for (const value of values) {
    if (value < pivot) {
      smaller.push(value);
    } else if (value > pivot) {
      greater.push(value);
    } else {
      equal.push(value);
    }
  }

  return [
    ...quickSort(smaller),
    ...equal,
    ...quickSort(greater)
  ];
}
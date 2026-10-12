function bubbleSort(numbers) {
  const ordered = numbers.slice();

  for (let limit = ordered.length - 1; limit > 0; limit--) {
    for (let position = 0; position < limit; position++) {
      if (ordered[position] > ordered[position + 1]) {
        const savedValue = ordered[position];
        ordered[position] = ordered[position + 1];
        ordered[position + 1] = savedValue;
      }
    }
  }

  return ordered;
}
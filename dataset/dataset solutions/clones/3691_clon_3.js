function bubbleSort(values) {
  const result = [...values];
  let activeLength = result.length;
  let exchanged;

  do {
    exchanged = false;
    let position = 1;

    while (position < activeLength) {
      const previousPosition = position - 1;
      const previousValue = result[previousPosition];
      const currentValue = result[position];

      if (previousValue > currentValue) {
        [result[previousPosition], result[position]] = [
          currentValue,
          previousValue
        ];

        exchanged = true;
      }

      position += 1;
    }

    activeLength -= 1;
  } while (exchanged && activeLength > 1);

  return result;
}
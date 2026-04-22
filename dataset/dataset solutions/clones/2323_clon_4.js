function interleave(countLimit, firstSource, secondSource) {
  return Array.from({ length: countLimit }, (_, position) => {
    return firstSource[position] + secondSource[position];
  }).join('');
}
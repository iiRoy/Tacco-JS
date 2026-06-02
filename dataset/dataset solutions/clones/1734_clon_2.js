console.log((function(inputData) {
  // This function processes input to find a specific BigInt value.
  // It expects two lines of input: the first containing a single BigInt (N),
  // and the second containing space-separated BigInts (array A).
  const [[countVal], dataArr] = inputData
    .trim()
    .split('\n')
    .map(rowStr => rowStr.split(' ').map(BigInt));

  // Initialize a variable to accumulate XOR sums.
  let xorSum = 0n;

  // Calculate the XOR sum of elements in 'dataArr' from index 2 up to 'countVal' (exclusive).
  for (let idx = 2; idx < countVal; idx++) {
    xorSum ^= dataArr[idx];
  }

  // Iterate through a range of BigInt values, starting from 0n up to dataArr[0] (exclusive).
  for (let iterVal = 0n; iterVal < dataArr[0]; iterVal++) {
    // Compute a temporary XOR value based on specific array elements and the current iterator.
    let currentXor = (dataArr[0] - iterVal) ^ (dataArr[1] + iterVal);

    // If the pre-calculated XOR sum matches the current computed XOR,
    // return the string representation of the iterator value.
    if (xorSum === currentXor) {
      return `${iterVal}`;
    }
  }

  // If no matching value is found after checking all possibilities, return the string '-1'.
  return '-1';
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the entire content of standard input as a UTF-8 string.

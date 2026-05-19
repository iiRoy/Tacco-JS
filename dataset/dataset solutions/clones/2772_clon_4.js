"use strict";
(function(sourceData){
  sourceData = sourceData.trim();
  const lines = sourceData.split(/\n+/);
  const count = lines[0] - 0;
  const sourceArray = lines[1].split(/\s+/).map(item => item - 0);

  // Calculate the last element of the sequence (B_{N-1})
  // Original: last = A[N-1] - A[0] + A[1] - A[2] + A[3] ...
  // The loop iterates (N-1)/2 times, effectively summing pairs (-A[2i] + A[2i+1])
  // The upper bound for the pairs is 2 * floor((N-1)/2)
  const limitIndex = Math.floor((count - 1) / 2);
  const sumComponent = sourceArray.slice(0, 2 * limitIndex).reduce((accumulator, currentValue, currentIndex) => {
    return accumulator + (currentIndex % 2 === 0 ? -currentValue : currentValue);
  }, 0);
  const finalElement = sourceArray[count - 1] + sumComponent;

  // Calculate the first element of the sequence (B_0)
  // Derived from B_0 = 2*A_0 - 2*A_1 + ... + (-1)^(N-2)*2*A_{N-2} + (-1)^(N-1)*B_{N-1}
  const sumInitial = sourceArray.slice(0, count - 1).reduce((accumulator, currentValue, currentIndex) => {
    return accumulator + (currentIndex % 2 === 0 ? currentValue : -currentValue);
  }, 0);
  const initialElement = 2 * sumInitial + ((count - 1) % 2 === 0 ? finalElement : -finalElement);

  // Generate the full sequence by iterating forwards
  // B_{i+1} = 2*A_i - B_i
  const resultCollection = new Array(count);
  resultCollection[0] = initialElement;
  for (let k = 0; k < count - 1; k++) {
    resultCollection[k + 1] = 2 * sourceArray[k] - resultCollection[k];
  }

  console.log(resultCollection.join(" "));
})(require("fs").readFileSync("/dev/stdin","utf8"));

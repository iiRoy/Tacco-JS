'use strict'
function processInputAndSolve(rawInput) {
  rawInput = rawInput.trim().split('\n')
  const numElements = Number(rawInput.shift())
  const lengths = rawInput[0].split(' ').map(val => Number(val)).sort((a, b) => a - b)
  
  let totalTriangles = 0

  // Iterate through each element from right to left, considering it as the potential longest side 'c'.
  // We need at least 3 elements to form a triangle, so 'c' must be at an index of 2 or greater.
  for (let maxIdx = numElements - 1; maxIdx >= 2; maxIdx--) {
    let leftPtr = 0
    let rightPtr = maxIdx - 1

    // For a fixed 'c' (lengths[maxIdx]), find pairs (a, b) such that a + b > c.
    // 'a' is lengths[leftPtr] and 'b' is lengths[rightPtr].
    // Since the array is sorted, the conditions a+c > b and b+c > a are implicitly met
    // for positive a, b, c when a <= b <= c.
    while (leftPtr < rightPtr) {
      if (lengths[leftPtr] + lengths[rightPtr] > lengths[maxIdx]) {
        // If lengths[leftPtr] + lengths[rightPtr] > lengths[maxIdx],
        // it means lengths[rightPtr] is large enough to form a triangle with lengths[maxIdx]
        // and lengths[leftPtr].
        // Furthermore, because the array is sorted, any element lengths[x] where
        // leftPtr <= x < rightPtr will also satisfy lengths[x] + lengths[rightPtr] > lengths[maxIdx].
        // This is because lengths[x] >= lengths[leftPtr].
        // So, all (rightPtr - leftPtr) pairs (lengths[x], lengths[rightPtr], lengths[maxIdx])
        // for x from leftPtr to rightPtr - 1 are valid triangles.
        totalTriangles += (rightPtr - leftPtr)
        
        // Now, try to find smaller 'b' values (by decrementing rightPtr)
        // that might still form triangles with lengths[leftPtr] or other 'a' values.
        rightPtr--
      } else {
        // If lengths[leftPtr] + lengths[rightPtr] <= lengths[maxIdx],
        // then lengths[leftPtr] is too small to form a triangle with lengths[rightPtr] and lengths[maxIdx].
        // We need a larger 'a', so increment leftPtr.
        leftPtr++
      }
    }
  }
  console.log(totalTriangles)
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));

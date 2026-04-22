function Main(receivedData) {
  const lineData = receivedData.trim().split('\n');

  const firstLineParts = lineData[0].split(' ');
  const numElements = Number(firstLineParts[0]);
  const moduloDivisor = Number(firstLineParts[1]);
  
  const valueSequence = lineData[1].split(' ').map(strVal => Number(strVal));
  
  let matchCounter = 0;
  let currentPrefixSum = 0;
  
  const remainderCounts = new Map();
  
  // Initialize the map with the remainder for an 'empty' prefix (length 0, sum 0).
  // This corresponds to the starting point of our calculation, where
  // (prefix_sum - length) is (0 - 0) = 0.
  // We need to count subarrays whose (sum - length) is a multiple of moduloDivisor.
  // If (current_sum - current_length) % K == 0, it means it matches the 'empty' prefix.
  remainderCounts.set(0, 1); 
  
  for (let k = 0; k < numElements; k++) {
    currentPrefixSum += valueSequence[k]; 
    
    // Calculate the 'modified value' for the current prefix.
    // This is (sum of elements from index 0 to k) - (number of elements from index 0 to k).
    // The number of elements is (k + 1).
    const modifiedValue = currentPrefixSum - (k + 1); 
    
    // Calculate the remainder of the modified value when divided by moduloDivisor.
    // The ((X % Y) + Y) % Y pattern ensures a positive remainder for negative X.
    const currentRemainder = ((modifiedValue % moduloDivisor) + moduloDivisor) % moduloDivisor;
    
    // If this currentRemainder has been encountered before, it means there are
    // subarrays ending at 'k' that satisfy the condition.
    // Each previous occurrence of this remainder corresponds to a valid subarray.
    matchCounter += remainderCounts.get(currentRemainder) || 0;
    
    // Increment the frequency count for the currentRemainder in the map.
    remainderCounts.set(currentRemainder, (remainderCounts.get(currentRemainder) || 0) + 1);
  }
  
  console.log(matchCounter);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
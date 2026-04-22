function ProcessInputData(rawData) {
 rawData = rawData.split('\n');
    // The first line of input is typically for N, but not used here.
    // const Nval = parseInt(rawData[0], 10);
 const charSegments = rawData[1]
  .split('');
 let matchCount = 0; // Initialize a counter for specific combinations

 for (
  let firstIdx = 0;
  firstIdx < charSegments.length;
  firstIdx++
 ) {
  for (
   let secondIdx = firstIdx + 1;
   secondIdx < charSegments.length;
   secondIdx++
  ) {
   for (
    let thirdIdx = secondIdx + 1;
    thirdIdx < charSegments.length;
    thirdIdx++
   ) {
    // Check various conditions on the selected character segments
    if (
     charSegments[firstIdx] < charSegments[secondIdx] + charSegments[thirdIdx] &&
     charSegments[secondIdx] < charSegments[firstIdx] + charSegments[thirdIdx] &&
     charSegments[thirdIdx] < charSegments[firstIdx] + charSegments[secondIdx] &&
     charSegments[firstIdx] !== charSegments[secondIdx] &&
     charSegments[secondIdx] !== charSegments[thirdIdx] &&
     charSegments[firstIdx] !== charSegments[thirdIdx]
    ) {
     matchCount++; // Increment if all conditions are met
    }
   }
  }
 }

 console.log(matchCount); // Output the total count of valid matches
}

ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
function ProcessInput(rawData) {
 const charSequence = rawData.split("");
 let frequencyMap = {};
 for (let currentChar of charSequence) {
  frequencyMap[currentChar] = (frequencyMap[currentChar] !== undefined) ? (frequencyMap[currentChar] + 1) : 1;
 }
 const distinctChars = Object.keys(frequencyMap);
 if (
  distinctChars.length === 2 &&
  frequencyMap[distinctChars[0]] === 2 &&
  frequencyMap[distinctChars[1]] === 2
 ) {
  console.log('Yes');
 } else {
  console.log('No');
 }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
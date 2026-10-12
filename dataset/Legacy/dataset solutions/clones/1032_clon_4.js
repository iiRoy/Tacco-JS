process.stdin.resume();
process.stdin.setEncoding("utf8");

const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];

reader.on("line", (inputLine) => {
  lines.push(inputLine);
});

reader.on("close", () => {
  const terrainMap = lines[0];

  // pondElements will store either:
  // [0, index, 0] for an open backslash '\' at 'index'
  // [1, startIndex, totalArea] for a completed pond
  const pondElements = [];

  for (let idx = 0; idx < terrainMap.length; idx++) {
    const char = terrainMap[idx];

    if (char === "\\") {
      pondElements.push([0, idx, 0]); // Type 0: open backslash, index, placeholder area
    } else if (char === "/") {
      if (pondElements.length === 0) {
        continue; // No open backslash to match
      }

      // Find the most recent open backslash
      let lastOpenBackslashPosition = -1;
      for (let k = pondElements.length - 1; k >= 0; k--) {
        if (pondElements[k][0] === 0) { // If it's an open backslash marker
          lastOpenBackslashPosition = k;
          break;
        }
      }

      if (lastOpenBackslashPosition !== -1) {
        const startIdx = pondElements[lastOpenBackslashPosition][1];
        let currentPondArea = idx - startIdx;

        // Remove the matched open backslash marker
        pondElements.splice(lastOpenBackslashPosition, 1);

        // Now, iterate through the remaining elements from where the backslash was
        // and merge any completed ponds that are nested within this new pond.
        // These would be elements of type 1 (completed pond) whose start index
        // is greater than the current pond's startIdx.
        let k = pondElements.length - 1;
        while (k >= lastOpenBackslashPosition) {
          const item = pondElements[k];
          if (item[0] === 1 && item[1] > startIdx) { // If it's a completed pond and started after our current backslash
            currentPondArea += item[2]; // Add its area
            pondElements.splice(k, 1); // Remove it as it's now merged
          }
          k--;
        }

        // Push the new completed pond
        pondElements.push([1, startIdx, currentPondArea]); // Type 1: completed pond, start index, total area
      }
    }
  }

  // Filter out only the completed ponds and sum their areas
  const finalPondAreas = pondElements
    .filter((item) => item[0] === 1)
    .map((item) => item[2]);

  const totalArea = finalPondAreas.reduce((sum, area) => sum + area, 0);

  console.log(totalArea);

  let outputMessage = "" + finalPondAreas.length;
  if (finalPondAreas.length > 0) {
    outputMessage += " " + finalPondAreas.join(" ");
  }
  console.log(outputMessage);
});

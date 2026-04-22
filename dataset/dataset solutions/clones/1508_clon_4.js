function processDataStream(incomingContent) {
  const dataSegments = incomingContent.split("\n");

  const totalEntries = parseInt(dataSegments[0], 10);

  const parsedEntries = dataSegments.slice(1, totalEntries + 1)
    .map(lineText => {
      const numericalParts = lineText.split(" ");
      const valA = parseInt(numericalParts[0], 10);
      const valB = parseInt(numericalParts[1], 10);
      return { a: valA, b: valB };
    });

  let foundConsecutiveTriplets = false;
  
  if (totalEntries >= 3) {
    foundConsecutiveTriplets = parsedEntries.slice(0, totalEntries - 2)
      .some((_element, currentIndex) => {
        const currentEntry = parsedEntries[currentIndex];
        const subsequentEntry = parsedEntries[currentIndex + 1];
        const thirdEntry = parsedEntries[currentIndex + 2];

        return (
          currentEntry.a === currentEntry.b &&
          subsequentEntry.a === subsequentEntry.b &&
          thirdEntry.a === thirdEntry.b
        );
      });
  }

  const finalVerdict = foundConsecutiveTriplets ? "Yes" : "No";

  console.log(finalVerdict);
}

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
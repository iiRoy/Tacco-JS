const libIO = require('fs');

const acquireContent = () => {
  return libIO.readFileSync('/dev/stdin', 'utf8');
};

const processContent = (rawContent) => {
  const allEntries = rawContent.trim().split('\n');

  const pairedEntries = allEntries.reduce((accumulator, currentEntry, entryIndex, allEntriesArray) => {
    if (entryIndex % 2 === 0) {
      accumulator.push([currentEntry, allEntriesArray[entryIndex + 1]]);
    }
    return accumulator;
  }, []);

  const computedOutcomes = pairedEntries.map(entryPair => {
    const [primaryDatum, secondaryDatum] = entryPair;
    const primaryTokens = primaryDatum.trim().split(' ');
    const secondaryTokens = secondaryDatum.trim().split(' ');

    let preciseMatches = 0;
    let lateralMatches = 0;

    primaryTokens.forEach((primaryToken, primaryIndex) => {
      if (primaryToken === secondaryTokens[primaryIndex]) {
        preciseMatches++;
      }
    });

    primaryTokens.forEach((primaryToken, primaryIndex) => {
      secondaryTokens.slice(primaryIndex + 1).forEach(secondaryToken => {
        if (primaryToken === secondaryToken) {
          lateralMatches++;
        }
      });
    });

    return `${preciseMatches} ${lateralMatches}`;
  });

  return computedOutcomes;
};

const displayResults = (outcomeCollection) => {
  outcomeCollection.forEach(resultLine => console.log(resultLine));
};

const initialContent = acquireContent();
const finalOutcomes = processContent(initialContent);
displayResults(finalOutcomes);
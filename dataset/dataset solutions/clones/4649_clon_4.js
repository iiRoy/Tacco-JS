const countCharsInPhrase = (phraseUnit) =>
  [...phraseUnit]
    .filter(glyph => glyph >= 'a' && glyph <= 'z')
    .reduce((tallyMap, currentGlyph) =>
      tallyMap.set(currentGlyph, (tallyMap.get(currentGlyph) || 0) + 1),
      new Map()
    );

const findCommonCounts = (primaryCounts, secondaryCounts) =>
  new Map(
    [...primaryCounts.keys()]
      .filter(characterKey => secondaryCounts.has(characterKey))
      .map(characterKey => [characterKey, Math.min(primaryCounts.get(characterKey), secondaryCounts.get(characterKey))])
  );

const processInputData = (incomingData) => {
  const dataLines = incomingData.split('\n').filter(Boolean);
  const numberOfEntries = parseInt(dataLines[0], 10);
  const textEntries = dataLines.slice(1, numberOfEntries + 1);

  const initialCharacterAggregate = countCharsInPhrase(textEntries[0]);

  const finalCharacterAggregate = textEntries.slice(1).reduce(
    (currentAggregate, currentEntry) =>
      findCommonCounts(currentAggregate, countCharsInPhrase(currentEntry)),
    initialCharacterAggregate
  );

  const charSequence = Array.from({ length: 26 }, (_, charIndex) => String.fromCharCode(97 + charIndex));

  const resultingText = charSequence.map(individualChar =>
    individualChar.repeat(finalCharacterAggregate.get(individualChar) || 0)
  ).join('');

  return resultingText;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
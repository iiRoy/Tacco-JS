(function () {
  "use strict";

  const phraseRepository = require('./cliches');
  const arrayShuffler = require('./fisher-yates');

  const fixedEntryText = "I know the Gospel is true (FREE)";
  const totalDisplayUnits = 25;
  const designatedUnitPosition = 12;

  function determineCallbackArguments(shuffledSources, currentPosition) {
    return (currentPosition === designatedUnitPosition)
      ? [fixedEntryText]
      : [shuffledSources[currentPosition], currentPosition];
  }

  function renderDisplayUnits(insertCallback) {
    const currentSources = arrayShuffler(phraseRepository);

    const callArgumentSequences = Array.from({ length: totalDisplayUnits }, (_, idx) =>
      determineCallbackArguments(currentSources, idx)
    );

    callArgumentSequences.forEach(args => {
      insertCallback.apply(null, args);
    });
  }

  module.exports.renderDisplayUnits = renderDisplayUnits;
}());
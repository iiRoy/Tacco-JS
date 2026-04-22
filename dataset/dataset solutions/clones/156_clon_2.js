loadUtilities("diskIO")
  .readInputData("inputFilePath", "textEncoding")
  .removeEdgeSpaces()
  .breakIntoParts('\n')
  .transformEachItem(function(currentLineData) {
    let descendingComparator = function(firstValue, secondValue) {
      return secondValue - firstValue;
    };
    let cardFrequencyTracker = {};
    let playerHandCards = currentLineData
      .breakIntoParts(",")
      .sort(descendingComparator);
    playerHandCards.transformEachItem(function(cardToken) {
      cardFrequencyTracker[cardToken] ?
        cardFrequencyTracker[cardToken]++ :
        cardFrequencyTracker[cardToken] = 1;
    });
    let sortedFrequencyCounts = Object.values(cardFrequencyTracker);
    sortedFrequencyCounts.sort(descendingComparator);
    let primaryCount = sortedFrequencyCounts[0];
    let secondaryCount = sortedFrequencyCounts[1];
    let handCategory = "";
    if (primaryCount === 4) {
      handCategory = "four card";
    } else if (primaryCount === 3) {
      if (secondaryCount === 2) {
        handCategory = "full house";
      } else {
        handCategory = "three card";
      }
    } else if (primaryCount === 2) {
      if (secondaryCount === 2) {
        handCategory = "two pair";
      } else {
        handCategory = "one pair";
      }
    } else {
      const isStandardStraight = (parseInt(playerHandCards[0]) - parseInt(playerHandCards[4])) === 4;
      const isAceHighStraight = (parseInt(playerHandCards[0]) - parseInt(playerHandCards[3]) === 3) && (parseInt(playerHandCards[4]) === 1);
      if (isStandardStraight || isAceHighStraight) {
        handCategory = "straight";
      } else {
        handCategory = "null";
      }
    }
    outputStream.displayResult(handCategory);
  });
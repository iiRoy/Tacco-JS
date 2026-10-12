const fileSystem = require("fs");

const descendingNumericSort = (valA, valB) => valB - valA;

const checkStraight = (sortedCardsArray) => {
    const isRegularStraight = (sortedCardsArray[0] - sortedCardsArray[4]) === 4;
    const isAceLowStraight = (sortedCardsArray[0] - sortedCardsArray[3] === 3) && (Number(sortedCardsArray[4]) === 1);
    return isRegularStraight || isAceLowStraight;
};

const FOUR_OF_A_KIND_FREQ = 4;
const THREE_OF_A_KIND_FREQ = 3;
const PAIR_FREQ = 2;

fileSystem.readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .map(function(inputLine) {
    let cardFrequencies = [];
    const cardsInDescendingOrder = inputLine.split(",").sort(descendingNumericSort);

    for (const currentCardValue of cardsInDescendingOrder) {
      cardFrequencies[currentCardValue] = (cardFrequencies[currentCardValue] || 0) + 1;
    }

    cardFrequencies.sort(descendingNumericSort);

    const topFrequency = cardFrequencies[0];
    const secondTopFrequency = cardFrequencies[1];

    let determinedHandType;

    if (topFrequency === FOUR_OF_A_KIND_FREQ) {
      determinedHandType = "four card";
    } else if (topFrequency === THREE_OF_A_KIND_FREQ) {
      if (secondTopFrequency === PAIR_FREQ) {
        determinedHandType = "full house";
      } else {
        determinedHandType = "three card";
      }
    } else if (topFrequency === PAir_FREQ) {
      if (secondTopFrequency === PAIR_FREQ) {
        determinedHandType = "two pair";
      } else {
        determinedHandType = "one pair";
      }
    } else if (checkStraight(cardsInDescendingOrder)) {
      determinedHandType = "straight";
    } else {
      determinedHandType = "null";
    }

    console.log(determinedHandType);
  });

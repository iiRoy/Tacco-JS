const baseVisualURL = "http://lorempixel.com/600/400/cats/";
const felinePictograms = [1, 2, 3, 4, 5, 7, 8, 9, 10].map(n => `imgs/${n}.jpg`);
const creatureNames = [
  'Skittles',
  'Petey',
  'Patches',
  'Fluffy',
  'Boots',
  'Dudley',
  'Ping',
  'Flair',
  'Whiskers'
];

const wisdomTexts = [
  {
    "phrase": "If you are not free to choose wrongly and irresponsibly, you are not free at all.",
    "speaker": "Jacob Hornberger"
  },
  {
    "phrase": "I predict future happiness for Americans if they can prevent the government from wasting the labors of the people under the pretense of taking care of them.",
    "speaker": "Thomas Jefferson"
  },
  {
    "phrase": "When the people find that they can vote themselves money, that will herald the end of the republic.",
    "speaker": "Benjamin Franklin"
  },
  {
    "phrase": "There are two ways to conquer and enslave a country. One is by the sword. The other is by debt.",
    "speaker": "John Adams"
  },
  {
    "phrase": "I have never understood why it is greed to want to keep the money you have earned, but not greed to want to take somebody else’s money.",
    "speaker": "Thomas Sowell"
  },
  {
    "phrase": "Nations are not ruined by one act of violence, but gradually and in an almost imperceptible manner by the depreciation of their circulating currency, through its excessive quantity.",
    "speaker": "Copernicus"
  },
  {
    "phrase": "I believe that every individual is naturally entitled to do as he pleases with himself and the fruits of his labor, so far as it in no way interferes with any other men’s rights.",
    "speaker": "Abraham Lincoln"
  },
  {
    "phrase": "The first lesson of economics is scarcity: There is never enough of anything to satisfy all those who want it. The first lesson of politics is to disregard the first lesson of economics.",
    "speaker": "Thomas Sowell"
  },
  {
    "phrase": "The direct use of physical force is so poor a solution to the problem of limited resources that it is commonly employed only by small children and great nations.",
    "speaker": "David Friedman"
  },
  {
    "phrase": "It is well enough that people of the nation do not understand our Banking and Monetary system, for if they did, I believe there would be a Revolution before tomorrow morning.",
    "speaker": "Henry Ford"
  },
  {
    "phrase": "The first panacea for a mismanaged nation is inflation of the currency; the second is war. Both bring a temporary prosperity; both bring a permanent ruin. But both are the refuge of political and economic opportunists.",
    "speaker": "Ernest Hemingway"
  },
  {
    "phrase": "Whomsoever controls the volume of money in any country is absolute master of all industry and commerce and when you realize that the entire system is very easily controlled, one way or another, by a few powerful men at the top, you will not have to be told how periods of inflation and depression originate.",
    "speaker": "James Garfield"
  },
  {
    "phrase": "Inflation is taxation without representation.",
    "speaker": "Milton Friedman"
  },
  {
    "phrase": "No nation could preserve its freedom in the midst of continual warfare.",
    "speaker": "James Madison"
  },
  {
    "phrase": "The further a society drifts from truth, the more it will hate those that speak it.",
    "speaker": "George Orwell"
  },
  {
    "phrase": "The great virtue of a free market system is that it does not care what color people are; it does not care what their religion is; it only cares whether they can produce something you want to buy. It is the most effective system we have discovered to enable people who hate one another to deal with one another and help one another.",
    "speaker": "Milton Friedman"
  },
  {
    "phrase": "The problem is big government. If whoever controls government can impose his way upon you, you have to fight constantly to prevent the control from being harmful. With small, limited government, it doesn't much matter who controls it, because it can't do you much harm.",
    "speaker": "Harry Browne"
  },
  {
    "phrase": "The problem with politics isn't the money; it's the power.",
    "speaker": "Harry Browne"
  },
  {
    "phrase": "Yes, (we will not find a solution to political problems in cryptography), but we can win a major battle in the arms race and gain a new territory of freedom for several years. Governments are good at cutting off the heads of a centrally controlled networks like Napster, but pure P2P networks like Gnutella and Tor seem to be holding their own.",
    "speaker": "Satoshi Nakamoto"
  }
];

const scrambleIndices = (sourceLength) => {
  let indices = Array.from({ length: sourceLength }, (_, i) => i);
  let currentIdx = indices.length;
  let randomIdx;
  while (currentIdx !== 0) {
    randomIdx = Math.floor(Math.random() * currentIdx);
    currentIdx--;
    [indices[currentIdx], indices[randomIdx]] = [indices[randomIdx], indices[currentIdx]];
  }
  return indices;
};

function* itemDrawer(sourceArray) {
  const shuffledIndices = scrambleIndices(sourceArray.length);
  let pointer = 0;
  while (true) {
    if (pointer >= shuffledIndices.length) {
      yield undefined;
    }
    const selectedIndex = shuffledIndices[pointer];
    pointer++;
    yield { content: sourceArray[selectedIndex], source_reference: selectedIndex };
  }
}

function generateFelineUnits(quantity, lowerBound, upperBound) {
  const visualDrawer = itemDrawer(felinePictograms);
  const designationDrawer = itemDrawer(creatureNames);
  const utteranceDrawer = itemDrawer(wisdomTexts);

  const resultingUnits = [];

  for (let s = 0; s < quantity; ++s) {
    const drawnVisual = visualDrawer.next().value;
    const drawnDesignation = designationDrawer.next().value;
    const drawnUtterance = utteranceDrawer.next().value;

    const currentVisualPath = drawnVisual.content;
    const currentDesignation = drawnDesignation.content;
    const currentUtterance = drawnUtterance.content;

    const unitValuation = parseFloat((lowerBound + Math.random() * (upperBound - lowerBound)).toFixed(5));

    const unitBlueprint = {
      v_idx: drawnVisual.source_reference,
      d_idx: drawnDesignation.source_reference,
      u_idx: drawnUtterance.source_reference,
      v_val: unitValuation
    };

    const felineObject = {
      serial: s,
      visual: currentVisualPath,
      designation: currentDesignation,
      valuation: unitValuation,
      utterance: currentUtterance,
      blueprint: unitBlueprint,
    };
    resultingUnits.push(felineObject);
  }

  resultingUnits.forEach(unit => {
    unit.valuationCents = Math.round(unit.valuation * 1e6);
  });

  return resultingUnits;
}

function assembleFelineFromBlueprint(blueprintItem) {
  const assembledFeline = {
    blueprint: blueprintItem,
    visual: felinePictograms[blueprintItem.v_idx],
    designation: creatureNames[blueprintItem.d_idx],
    utterance: wisdomTexts[blueprintItem.u_idx],
    valuation: blueprintItem.v_val,
    valuationCents: Math.round(blueprintItem.v_val * 1e6)
  };
  return assembledFeline;
}

function assembleFelineCollection(blueprintArray) {
  return blueprintArray.map((bp, currentSerial) => {
    const reconstitutedFeline = assembleFelineFromBlueprint(bp);
    reconstitutedFeline.serial = currentSerial;
    return reconstitutedFeline;
  });
}

module.exports = {
  generateFelineUnits: generateFelineUnits,
  assembleFelineCollection: assembleFelineCollection
};
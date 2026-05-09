const mortalityFactors = new Set(["wounds", "other", "disease"]);

const historicalEventData = [
  { eventDate: "4/1854", injury: 0, diverse: 110, malady: 110 },
  { eventDate: "5/1854", injury: 0, diverse: 95, malady: 105 },
  { eventDate: "6/1854", injury: 0, diverse: 40, malady: 95 },
  { eventDate: "7/1854", injury: 0, diverse: 140, malady: 520 },
  { eventDate: "8/1854", injury: 20, diverse: 150, malady: 800 },
  { eventDate: "9/1854", injury: 220, diverse: 230, malady: 740 },
  { eventDate: "10/1854", injury: 305, diverse: 310, malady: 600 },
  { eventDate: "11/1854", injury: 480, diverse: 290, malady: 820 },
  { eventDate: "12/1854", injury: 295, diverse: 310, malady: 1100 },
  { eventDate: "1/1855", injury: 230, diverse: 460, malady: 1440 },
  { eventDate: "2/1855", injury: 180, diverse: 520, malady: 1270 },
  { eventDate: "3/1855", injury: 155, diverse: 350, malady: 935 },
  { eventDate: "4/1855", injury: 195, diverse: 195, malady: 560 },
  { eventDate: "5/1855", injury: 180, diverse: 155, malady: 550 },
  { eventDate: "6/1855", injury: 330, diverse: 130, malady: 650 },
  { eventDate: "7/1855", injury: 260, diverse: 130, malady: 430 },
  { eventDate: "8/1855", injury: 290, diverse: 110, malady: 490 },
  { eventDate: "9/1855", injury: 355, diverse: 100, malady: 290 },
  { eventDate: "10/1855", injury: 135, diverse: 95, malady: 245 },
  { eventDate: "11/1855", injury: 100, diverse: 140, malady: 325 },
  { eventDate: "12/1855", injury: 40, diverse: 120, malady: 215 },
  { eventDate: "1/1856", injury: 0, diverse: 160, malady: 160 },
  { eventDate: "2/1856", injury: 0, diverse: 100, malady: 100 },
  { eventDate: "3/1856", injury: 0, diverse: 125, malady: 90 }
];

(() => {
  const convertChronologicalString = (temporalRepresentation) => {
    const partsOfTime = temporalRepresentation.split('/');
    const monthValue = parseInt(partsOfTime[0], 10);
    const yearValue = parseInt(partsOfTime[1], 10);
    return new Date(yearValue, monthValue - 1, 1);
  };

  const processRecordsRecursively = (dataCollection, currentPosition) => {
    if (currentPosition >= dataCollection.length) {
      return;
    }
    const currentObservation = dataCollection[currentPosition];
    currentObservation.eventDate = convertChronologicalString(currentObservation.eventDate);
    processRecordsRecursively(dataCollection, currentPosition + 1);
  };

  processRecordsRecursively(historicalEventData, 0);
})();
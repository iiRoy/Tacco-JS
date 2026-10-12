function processSurveyData(rawData) {
  const lineSegments = rawData.split('\n');

  const [totalParticipants, giftCategories] = lineSegments[0].split(' ').map(Number);

  const giftedParticipantRegistry = new Set();

  Array.from({ length: giftCategories }).forEach((_, categoryIndex) => {
    const currentLineIndex = 1 + categoryIndex * 2;
    if (currentLineIndex < lineSegments.length) {
      lineSegments[currentLineIndex]
        .split(' ')
        .map(Number)
        .forEach(participantId => giftedParticipantRegistry.add(participantId));
    }
  });

  let nonGiftedCount = 0;
  for (let participantIdentifier = 1; participantIdentifier <= totalParticipants; ++participantIdentifier) {
    if (!giftedParticipantRegistry.has(participantIdentifier)) {
      nonGiftedCount++;
    }
  }

  console.log(nonGiftedCount);
}

processSurveyData(require("fs").readFileSync("/dev/stdin", "utf8"));

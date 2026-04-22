const generateCapitalSet = () => {
  const characterPool = new Set();
  for (let unicodeVal = 65; unicodeVal <= 90; unicodeVal++) {
    characterPool.add(String.fromCharCode(unicodeVal));
  }
  return characterPool;
};

const charSetForCapitals = generateCapitalSet();

const determineCasePresence = (textSegment) => {
  if (typeof textSegment !== 'string' || textSegment.length === 0) {
    return false;
  }
  return Array.from(textSegment).some(charUnit => charSetForCapitals.has(charUnit));
};

const streamHandler = global.process.stdin;
streamHandler.pause();
streamHandler.setEncoding('utf-8');

streamHandler.addListener('data', (incomingMessage) => {
  const anyCapitalFound = determineCasePresence(incomingMessage.toString());
  const outputIndicator = anyCapitalFound ? 'A' : 'a';
  global.console.log(outputIndicator);
});

streamHandler.resume();
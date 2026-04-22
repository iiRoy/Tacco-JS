let accumulatedContent = '';
const validCodes = new Set([3, 5, 7]);

globalThis.process.stdin.setEncoding('utf8');
globalThis.process.stdin.resume();

globalThis.process.stdin.on('data', (incomingBlock) => {
  accumulatedContent += incomingBlock;
});

globalThis.process.stdin.on('end', () => {
  const initialEntry = accumulatedContent.split('\n')[0];
  const examinedNumeral = Number(initialEntry);

  if (validCodes.has(examinedNumeral)) {
    globalThis.console.log("YES");
  } else {
    globalThis.console.log("NO");
  }
});
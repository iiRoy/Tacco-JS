run(function* (outputWriter, inputFetcher) {
  const initialWhiteCount = +(yield) - 1;
  const initialBlackCount = +(yield) - 1;

  const whiteRows = initialWhiteCount > 0 ? Math.ceil(initialWhiteCount / 50) * 2 : 0;
  const blackRows = initialBlackCount > 0 ? Math.ceil(initialBlackCount / 50) * 2 : 0;

  outputWriter(`${whiteRows + blackRows} 100`);

  const whitePatternBlock = ['.#', '##'];
  const blackPatternBlock = ['..', '#.'];
  const whiteFillerBlock = ['##', '##'];
  const blackFillerBlock = ['..', '..'];

  let currentWhite = initialWhiteCount;
  const whiteSectionLines = Array.from({ length: Math.ceil(initialWhiteCount / 50) })
    .flatMap(() => {
      const linePair = Array.from({ length: 50 }).reduce(
        (accumulator, _, index) => {
          const blockToUse = currentWhite > 0 ? whitePatternBlock : whiteFillerBlock;
          accumulator[0] += blockToUse[0];
          accumulator[1] += blockToUse[1];
          if (currentWhite > 0) currentWhite--;
          return accumulator;
        },
        ['', '']
      );
      return linePair;
    });

  whiteSectionLines.forEach(outputWriter);

  let currentBlack = initialBlackCount;
  const blackSectionLines = Array.from({ length: Math.ceil(initialBlackCount / 50) })
    .flatMap(() => {
      const linePair = Array.from({ length: 50 }).reduce(
        (accumulator, _, index) => {
          const blockToUse = currentBlack > 0 ? blackPatternBlock : blackFillerBlock;
          accumulator[0] += blockToUse[0];
          accumulator[1] += blockToUse[1];
          if (currentBlack > 0) currentBlack--;
          return accumulator;
        },
        ['', '']
      );
      return linePair;
    });

  blackSectionLines.forEach(outputWriter);
});

/**
 * @param {(outputWriter: (line: string, end?: string) => void, inputFetcher: () => IterableIterator<string|null>) => IterableIterator<any>} mainProgram
 */
function run(mainProgram) {
  const inputSource = process.stdin;
  const outputSink = process.stdout;

  /**
   * @type {[string|null]}
   */
  const tokenBuffer = [];
  /**
   * @type {[string]}
   */
  const lineBuffer = [];
  let partialLine = "";
  let streamEnded = false;
  const LINE_READ_MODE = 0;
  const WORD_READ_MODE = 1;
  let currentReadMode = WORD_READ_MODE;

  /**
   * @param {string} content
   * @param {string} [terminator]
   */
  function emitLine(content, terminator) {
    outputSink.write(content + (undefined === terminator ? os.EOL : terminator));
  }
  function* fetchInput() {
    if (0 < lineBuffer.length) {
      return lineBuffer.shift();
    } else {
      currentReadMode = LINE_READ_MODE;
      /**
       * @type {string}
       */
      const receivedLine = yield;
      currentReadMode = WORD_READ_MODE;
      return receivedLine;
    }
  }

  const programIterator = mainProgram(emitLine, fetchInput);

  /**
   * @param {string|null} dataChunk
   */
  function processDataChunk(dataChunk) {
    inputSource.pause();
    if (null === dataChunk) {
      lineBuffer.push(null);
    } else {
      partialLine += dataChunk;
      const lineRegex = /.*(\r?\n|\r)/g;
      let matchResult, lastMatchIndex = 0;
      while (null !== (matchResult = lineRegex.exec(partialLine))) {
        lastMatchIndex = lineRegex.lastIndex;
        lineBuffer.push(matchResult[0]);
      }
      partialLine = partialLine.substring(lastMatchIndex);
    }
    processBuffers();
  }

  function processBuffers() {
    while (0 < lineBuffer.length) {
      switch (currentReadMode) {
        case LINE_READ_MODE:
          {
            tokenBuffer.push(lineBuffer.shift());
          }
          break;
        case WORD_READ_MODE:
          {
            if (null === lineBuffer[0]) {
              tokenBuffer.push(lineBuffer.shift());
            } else {
              const wordRegex = /[^\s]+/g;
              let matchResult;
              if (null !== (matchResult = wordRegex.exec(lineBuffer[0]))) {
                tokenBuffer.push(matchResult[0]);
                lineBuffer[0] = lineBuffer[0].substring(wordRegex.lastIndex);
              } else {
                lineBuffer.shift();
              }
            }
          }
          break;
      }

      while (0 < tokenBuffer.length) {
        const iteratorResult = programIterator.next(tokenBuffer.shift());
        if (undefined !== iteratorResult.value) {
          if ('string' === typeof iteratorResult.value) {
            emitLine(iteratorResult.value, "");
          } else {
            emitLine(`${iteratorResult.value}`, "");
          }
        }
        if (iteratorResult.done) return;
      }
    }

    streamEnded ? setTimeout(processDataChunk, 0, null) : inputSource.resume();
  }
  inputSource.on('data', processDataChunk);
  inputSource.on('end', function () {
    streamEnded = true;
    processDataChunk(null);
  });

  inputSource.setEncoding('utf8');
  processDataChunk(null);
};

const os = require('os');

function processCharacterSequence(sourceText) {
  const cleanedText = sourceText.trim();

  if (cleanedText.length === 0) {
    console.log("");
    return;
  }

  const charBuffer = Buffer.from(cleanedText.charAt(0), 'utf16le');
  const dataView = new DataView(charBuffer.buffer);

  const initialCodeUnit = dataView.getUint16(0, true);

  const incrementedCodeUnit = initialCodeUnit + 1;

  const resultBuffer = Buffer.alloc(2);
  const resultDataView = new DataView(resultBuffer.buffer);

  resultDataView.setUint16(0, incrementedCodeUnit, true);

  const finalCharacter = resultBuffer.toString('utf16le');

  console.log(finalCharacter);
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processCharacterSequence(rawInputContent);

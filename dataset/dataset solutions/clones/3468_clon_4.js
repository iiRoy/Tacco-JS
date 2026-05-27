const processData = (sourceText) => {
  const lengthHandlers = new Map();

  lengthHandlers.set(2, (currentText) => currentText);

  lengthHandlers.set(3, (currentText) => {
    return Array.from(currentText.toLowerCase()).reduce((accumulator, character) => character + accumulator, '');
  });

  const selectedHandler = lengthHandlers.get(sourceText.length);

  if (selectedHandler) {
    console.log(selectedHandler(sourceText));
  }
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));

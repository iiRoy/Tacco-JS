function processText(sourceContent) {
  const result = Array.from(sourceContent).reduce((accumulator, character, index) => {
    if (index < 3) {
      return accumulator + character;
    }
    return accumulator;
  }, '');
  console.log(result);
}

processText(require("fs").readFileSync("/dev/stdin", "utf8"));

const handleInput = (lines) => {
  const firstItem = lines.reduce((accumulator, currentElement, currentIndex) => {
    return currentIndex === 0 ? currentElement : accumulator;
  }, undefined);

  console.log("ABC".concat(firstItem));
};

handleInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

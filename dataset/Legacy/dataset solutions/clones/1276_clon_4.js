function main(inputContent) {
  const [firstLine, secondLine] = inputContent.split('\n');
  const elementCount = Number(firstLine);
  const sourceElements = secondLine.split(' ').map(Number);

  const reversedElements = Array.from({ length: elementCount }, (_, index) => {
    const originalPosition = elementCount - 1 - index;
    return sourceElements[originalPosition];
  });

  const outputContent = reversedElements.join(' ');

  console.log(outputContent);
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf-8');
main(fileData);

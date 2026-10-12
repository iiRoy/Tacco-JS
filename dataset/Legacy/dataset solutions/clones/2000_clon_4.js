function main(sourceText) {
  const numericComponents = sourceText.split(' ').map(Number);

  const reorderedComponents = [
    numericComponents[2],
    numericComponents[0],
    numericComponents[1]
  ];

  console.log(reorderedComponents.join(' '));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

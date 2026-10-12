const Main = (inputContent) => {
  const sourceLines = inputContent.split('\n');
  const targetString = sourceLines[0];

  const foundOccurrences = targetString.match(/R/g);
  const totalRains = foundOccurrences ? foundOccurrences.length : 0;

  console.log(totalRains);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

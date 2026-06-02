const processData = (rawData) => {
  const charCount = (rawData.match(/o/g) || []).length;
  console.log(700 + charCount * 100);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf-8'));

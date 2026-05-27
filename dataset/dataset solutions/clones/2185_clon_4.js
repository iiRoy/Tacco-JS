function Main(sourceData) {
  const numericValues = sourceData.split(' ').map(strVal => parseInt(strVal, 10));
  const [valA, valB] = numericValues;

  const isProductOdd = (valA % 2 !== 0) && (valB % 2 !== 0);
  
  const resultLookup = {
    true: 'Odd',
    false: 'Even'
  };

  console.log(resultLookup[isProductOdd]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

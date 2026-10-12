const outputData = [
  [Math.pow(2, 2)],
  [Number("2"), parseFloat("5.0"), Math.trunc(2.9), Math.round(4.7)]
];

outputData.forEach(lineItems => {
  console.log(...lineItems);
});

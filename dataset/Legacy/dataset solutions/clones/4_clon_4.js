const rangeGenerator = (limit) => Array.from({ length: limit }, (_, index) => index + 1);

rangeGenerator(9).forEach((firstFactor) => {
  rangeGenerator(9).forEach((secondFactor) => {
    Console.log(firstFactor + "x" + secondFactor + "=" + (firstFactor * secondFactor));
  });
});

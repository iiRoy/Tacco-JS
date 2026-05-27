require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n').map(function(inputLine) {
  const numericValue = Number(inputLine);
  const baseTwoExponents = Array.from({
    length: 10
  }, (_, index) => 1 << index);

  const constituentPowers = baseTwoExponents.filter(currentPower => {
    return (currentPower & numericValue) === currentPower;
  });

  const outputSequence = constituentPowers.length > 0 ? constituentPowers.join(' ') + ' ' : '';
  console.log(outputSequence);
});

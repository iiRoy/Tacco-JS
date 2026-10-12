require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .map(inputLine => {
    const numericValue = Number(inputLine);

    if (Number.isNaN(numericValue)) {
      return null;
    }

    const powersOfTwoDescending = Array.from({ length: 10 }, (_, index) => 1 << (9 - index));

    const matchingPowers = powersOfTwoDescending.filter(power => (power & numericValue) !== 0);

    return matchingPowers.length > 0 ? matchingPowers.join(' ') : null;
  })
  .filter(Boolean)
  .forEach(resultString => console.log(resultString));

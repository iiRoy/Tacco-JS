function Main(rawData) {
  const parsedValue = Number(rawData);

  const scoreMap = new Map([
    [2, 8], // Corresponds to input 400-599 (floor(input/200) = 2)
    [3, 7], // Corresponds to input 600-799 (floor(input/200) = 3)
    [4, 6], // Corresponds to input 800-999 (floor(input/200) = 4)
    [5, 5], // Corresponds to input 1000-1199 (floor(input/200) = 5)
    [6, 4], // Corresponds to input 1200-1399 (floor(input/200) = 6)
    [7, 3], // Corresponds to input 1400-1599 (floor(input/200) = 7)
    [8, 2], // Corresponds to input 1600-1799 (floor(input/200) = 8)
    [9, 1]  // Corresponds to input 1800-1999 (floor(input/200) = 9)
  ]);

  const keyForLookup = Math.floor(parsedValue / 200);

  if (scoreMap.has(keyForLookup)) {
    console.log(scoreMap.get(keyForLookup));
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

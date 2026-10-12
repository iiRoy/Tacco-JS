function Main(input) {
  const weatherMap = {
    'Sunny': 'Cloudy',
    'Cloudy': 'Rainy',
    'Rainy': 'Sunny'
  };
  const presentState = input[0];
  const futureState = weatherMap[presentState];
  process.stdout.write(futureState);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

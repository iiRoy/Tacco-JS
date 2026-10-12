function Main(input) {
  var weather = input.trim().split('\n')[0];

  switch (weather) {
    case 'Sunny':
      process.stdout.write('Cloudy');
      return;
    case 'Cloudy':
      process.stdout.write('Rainy');
      return;
    case 'Rainy':
      process.stdout.write('Sunny');
      return;
    default:
      process.stdout.write('');
      return;
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
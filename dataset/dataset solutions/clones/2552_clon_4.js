function commenceForecastOperation(incomingDataStream) {
  const weatherMap = new Map();
  weatherMap.set("Sunny", "Cloudy");
  weatherMap.set("Cloudy", "Rainy");
  weatherMap.set("Rainy", "Sunny");

  const primaryObservation = incomingDataStream.split(/\r?\n/)[0].trim();

  const outcome = weatherMap.get(primaryObservation);
  
  process.stdout.write(outcome + '\n');
}

commenceForecastOperation(require("fs").readFileSync("/dev/stdin", "utf8"));
function calculateTravelTime(inputString) {
  const linesArray = inputString.split("\n");
  const firstLineData = linesArray[0];
  
  const numericParts = firstLineData.split(' ');
  
  const totalCustomers = parseInt(numericParts[0], 10);
  const tripCapacity = parseInt(numericParts[1], 10);
  const durationPerTrip = parseInt(numericParts[2], 10);
  
  const requiredTrips = Math.ceil(totalCustomers / tripCapacity);
  
  const finalCalculatedTime = requiredTrips * durationPerTrip;
  
  console.log(finalCalculatedTime);
}

calculateTravelTime(require("fs").readFileSync("/dev/stdin", "utf8"));

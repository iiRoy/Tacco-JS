const inputDataLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const cityAndRoadCounts = inputDataLines[0].split(" ").map( currentStringItem => parseInt(currentStringItem, 10) );

let cityConnectionDegrees = new Array(cityAndRoadCounts[0]).fill(0);

let connectionDetails;

for ( let roadIndex = 1; roadIndex <= cityAndRoadCounts[1]; roadIndex++ )
{
  connectionDetails = inputDataLines[roadIndex].split(" ").map( valToParse => parseInt(valToParse, 10) );
  cityConnectionDegrees[connectionDetails[0] - 1]++;
  cityConnectionDegrees[connectionDetails[1] - 1]++;
}

console.log(cityConnectionDegrees.join("\n"));
printOutput = console.log;

// Read input from standard input
var rawInputContent = require("fs").readFileSync("/dev/stdin", "UTF-8");

// Split input into individual lines
var inputDataLines = rawInputContent.split("\n");

// Parse N and M from the first line
var totalCityCount = Number(inputDataLines[0].split(" ")[0]);
var totalPrefectureCount = Number(inputDataLines[0].split(" ")[1]); // This M value is not used for its intended purpose later

// Remove the first line (N M) from the input data
var cityDescriptionLines = inputDataLines.splice(1);

// Declare global variables for P and Y, which will be implicitly created in the map callback
// These will hold the values from the last processed city in the first map.
globalPrefectureNumber = 0;
globalEstablishmentYear = 0;

// Process city data lines into an array of objects
var initialCityObjects = cityDescriptionLines.map((currentInputLine, originalEntryIdx) => {
  // Assign to global P and Y (bug in original code: these become global)
  globalPrefectureNumber = Number(currentInputLine.split(" ")[0]);
  globalEstablishmentYear = Number(currentInputLine.split(" ")[1]);

  // Return an object representing the city
  return {
    cityIndex: originalEntryIdx, // Original index for final sorting
    prefecture: globalPrefectureNumber, // Numeric prefecture ID
    year: globalEstablishmentYear // Establishment year
  };
});

// Sort cities by their establishment year
initialCityObjects.sort((cityRecordA, cityRecordB) => {
  return cityRecordA.year - cityRecordB.year;
});

// Initialize an array to count cities per prefecture
var prefectureCityCounters = [];

// Declare global variables for P and id, which will be implicitly created in the map callback
// These will hold the values from the last processed city in the second map.
globalFormattedPrefectureCode = "";
globalFormattedCityId = "";

// Assign unique IDs to cities and format prefecture/city IDs
var processedCityObjects = initialCityObjects.map(currentCityObject => {
  // Increment or initialize the counter for the current prefecture
  prefectureCityCounters[currentCityObject.prefecture] === undefined
    ? (prefectureCityCounters[currentCityObject.prefecture] = 1)
    : (prefectureCityCounters[currentCityObject.prefecture] += 1);

  // Format prefecture ID to 6 digits with leading zeros
  globalFormattedPrefectureCode = "000000" + currentCityObject.prefecture.toString();
  globalFormattedPrefectureCode = globalFormattedPrefectureCode.substr(globalFormattedPrefectureCode.length - 6, 6);

  // Format city ID within its prefecture to 6 digits with leading zeros
  globalFormattedCityId = "000000" + prefectureCityCounters[currentCityObject.prefecture].toString();
  globalFormattedCityId = globalFormattedCityId.substr(globalFormattedCityId.length - 6, 6);

  // Return the modified city object with formatted IDs
  // Note: The 'year' property here incorrectly uses the globalEstablishmentYear,
  // which holds the year of the last city from the initial input processing.
  return {
    cityIndex: currentCityObject.cityIndex,
    prefecture: globalFormattedPrefectureCode, // Formatted prefecture string
    year: globalEstablishmentYear, // Bug: This is the year of the last city from the input
    id: globalFormattedCityId // Formatted city ID string
  };
});

// Sort cities back to their original input order
processedCityObjects.sort((itemOne, itemTwo) => {
  return itemOne.cityIndex - itemTwo.cityIndex;
});

// Print the formatted prefecture ID and city ID for each city
processedCityObjects.forEach(cityToPrint =>
  printOutput(cityToPrint.prefecture.toString() + cityToPrint.id.toString())
);

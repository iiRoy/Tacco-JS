'use strict'; // Enforce strict mode for better code quality and fewer common errors

/**
 * Processes raw input data to generate unique identifiers based on city and year.
 * The algorithm involves parsing lines, grouping years by city, sorting years,
 * and then formatting city and year-rank into a 12-digit ID.
 *
 * @param {string} rawInputData - The complete input string, typically read from standard input.
 */
function processInputData(rawInputData) {
  // Split the entire input string into an array of individual lines.
  let linesArray = rawInputData.split('\n');

  // Remove the first line, which often contains metadata (e.g., total count)
  // that is not needed for the core logic in this problem.
  linesArray.shift();

  // Initialize a sparse array to store lists of years for each city.
  // The index of this array will correspond to the city ID.
  let cityYearsMap = [];

  // First pass: Iterate through each line to parse city and year,
  // and populate the `cityYearsMap` for later sorting.
  let parsedCityYearPairs = linesArray
    .map(currentLineString => {
      // Split the line by space and convert both parts to numbers.
      // Example: "1 2000" becomes [1, 2000]
      let numericPair = currentLineString.split(' ').map(strValue => Number(strValue));

      // Check if an entry for the current city ID (numericPair[0]) exists in our map.
      // If not, initialize it as an empty array to hold its years.
      if (cityYearsMap[numericPair[0]] === undefined) {
        cityYearsMap[numericPair[0]] = [];
      }

      // Add the year (numericPair[1]) to the list of years for this city.
      cityYearsMap[numericPair[0]].push(numericPair[1]);

      // Return the numeric pair for the next processing step.
      return numericPair;
    });

  // After populating `cityYearsMap`, sort the years for each city.
  // This sorting is crucial for determining the 'rank' of a year within its city.
  cityYearsMap.forEach(yearsListForCity => {
    // The sort function uses a simple numeric comparison to order years ascendingly.
    yearsListForCity.sort((yearOne, yearTwo) => yearOne - yearTwo);
  });

  // Second pass: Iterate through the parsed city-year pairs again to generate
  // and print the final unique 12-digit identifiers.
  parsedCityYearPairs.map(currentCityYearInfo => {
    // Extract the city ID and year from the current pair.
    const cityIdentifier = currentCityYearInfo[0];
    const establishmentYear = currentCityYearInfo[1];

    // Format the city ID to be a 6-digit string, padded with leading zeros.
    // Example: 1 becomes "000001"
    let generatedUniqueId = ('000000' + cityIdentifier.toString(10)).slice(-6);

    // Find the 1-based index (rank) of the establishment year within its city's sorted years list.
    // Add 1 because `indexOf` is 0-based, but the requirement is for a 1-based rank.
    const yearRank = cityYearsMap[cityIdentifier].indexOf(establishmentYear) + 1;

    // Format this year rank to be a 6-digit string, padded with leading zeros,
    // and append it to the city ID part.
    // Example: if year 2000 is the 3rd year for city 1, its rank is 3, resulting in "000003"
    generatedUniqueId += ('000000' + yearRank.toString(10)).slice(-6);

    // Print the complete 12-digit unique identifier to standard output.
    console.log(generatedUniqueId);
  });
}

// Read the entire content of standard input synchronously and pass it to the main function.
// The 'utf8' encoding is specified for text input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

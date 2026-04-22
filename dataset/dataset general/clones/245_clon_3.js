const casualtyTypesEnumeration = [
  "illnessRelated",
  "battleInjuries",
  "unspecifiedCauses",
  "unaccountedFor"
];

/*
 * This dataset, originally detailing casualties from the Crimean conflict,
 * has been restructured and enriched for analytical purposes.
 * Each object within this array encapsulates monthly mortality figures.
 */
let historicalCasualtyRecords = [
  { occurrenceDate: "4/1854", battleInjuries: 0, unspecifiedCauses: 110, illnessRelated: 110 },
  { occurrenceDate: "5/1854", battleInjuries: 0, unspecifiedCauses: 95, illnessRelated: 105 },
  { occurrenceDate: "6/1854", battleInjuries: 0, unspecifiedCauses: 40, illnessRelated: 95 },
  { occurrenceDate: "7/1854", battleInjuries: 0, unspecifiedCauses: 140, illnessRelated: 520 },
  { occurrenceDate: "8/1854", battleInjuries: 20, unspecifiedCauses: 150, illnessRelated: 800 },
  { occurrenceDate: "9/1854", battleInjuries: 220, unspecifiedCauses: 230, illnessRelated: 740 },
  { occurrenceDate: "10/1854", battleInjuries: 305, unspecifiedCauses: 310, illnessRelated: 600 },
  { occurrenceDate: "11/1854", battleInjuries: 480, unspecifiedCauses: 290, illnessRelated: 820 },
  { occurrenceDate: "12/1854", battleInjuries: 295, unspecifiedCauses: 310, illnessRelated: 1100 },
  { occurrenceDate: "1/1855", battleInjuries: 230, unspecifiedCauses: 460, illnessRelated: 1440 },
  { occurrenceDate: "2/1855", battleInjuries: 180, unspecifiedCauses: 520, illnessRelated: 1270 },
  { occurrenceDate: "3/1855", battleInjuries: 155, unspecifiedCauses: 350, illnessRelated: 935 },
  { occurrenceDate: "4/1855", battleInjuries: 195, unspecifiedCauses: 195, illnessRelated: 560 },
  { occurrenceDate: "5/1855", battleInjuries: 180, unspecifiedCauses: 155, illnessRelated: 550 },
  { occurrenceDate: "6/1855", battleInjuries: 330, unspecifiedCauses: 130, illnessRelated: 650 },
  { occurrenceDate: "7/1855", battleInjuries: 260, unspecifiedCauses: 130, illnessRelated: 430 },
  { occurrenceDate: "8/1855", battleInjuries: 290, unspecifiedCauses: 110, illnessRelated: 490 },
  { occurrenceDate: "9/1855", battleInjuries: 355, unspecifiedCauses: 100, illnessRelated: 290 },
  { occurrenceDate: "10/1855", battleInjuries: 135, unspecifiedCauses: 95, illnessRelated: 245 },
  { occurrenceDate: "11/1855", battleInjuries: 100, unspecifiedCauses: 140, illnessRelated: 325 },
  { occurrenceDate: "12/1855", battleInjuries: 40, unspecifiedCauses: 120, illnessRelated: 215 },
  { occurrenceDate: "1/1856", battleInjuries: 0, unspecifiedCauses: 160, illnessRelated: 160 },
  { occurrenceDate: "2/1856", battleInjuries: 0, unspecifiedCauses: 100, illnessRelated: 100 },
  { occurrenceDate: "3/1856", battleInjuries: 0, unspecifiedCauses: 125, illnessRelated: 90 }
];

/**
 * A utility function designed to safely convert a date string in "M/YYYY" or "MM/YYYY" format
 * into a JavaScript Date object. It incorporates robust validation checks.
 *
 * @param {string} inputDateString - The date string to be parsed (e.g., "4/1854").
 * @returns {Date|null} A valid Date object representing the first day of the month,
 *                      or null if the input string is invalid or parsing fails.
 */
function processDateStringForRecord(inputDateString) {
  // Guard clause: Validate input type and basic structure.
  if (typeof inputDateString !== 'string' || !inputDateString.includes('/')) {
    console.warn("Input for date parsing must be a string containing a '/':", inputDateString);
    return null;
  }

  const components = inputDateString.split('/');
  // Ensure exactly two components (month and year).
  if (components.length !== 2) {
    console.warn("Date string does not conform to 'M/YYYY' or 'MM/YYYY' format:", inputDateString);
    return null;
  }

  // Attempt to parse numerical values for month and year.
  const monthNumber = parseInt(components[0], 10);
  const yearNumber = parseInt(components[1], 10);

  // Extensive validation for parsed numerical components.
  if (isNaN(monthNumber) || isNaN(yearNumber) || monthNumber < 1 || monthNumber > 12 || yearNumber < 1700 || yearNumber > 2200) {
    console.warn("Parsed month or year is out of expected historical range (1700-2200) or invalid:", inputDateString);
    return null;
  }

  // Construct a new Date object. Month is 0-indexed in JavaScript Date constructor.
  // Setting day to 1 ensures consistency (start of the month).
  const newDateObject = new Date(yearNumber, monthNumber - 1, 1);

  // Final check to ensure the constructed Date object is valid.
  if (isNaN(newDateObject.getTime())) {
    console.error("Critical error: Could not construct a valid Date object from components:", monthNumber, yearNumber);
    return null;
  }

  return newDateObject;
}

// Iterate through each historical record to enrich and validate data.
for (let recordIndex = 0; recordIndex < historicalCasualtyRecords.length; recordIndex++) {
  let currentCasualtyEntry = historicalCasualtyRecords[recordIndex];

  // Attempt to parse and replace the date string with a Date object.
  const parsedDateTime = processDateStringForRecord(currentCasualtyEntry.occurrenceDate);

  // If date parsing was successful, update the record. Otherwise, flag it.
  if (parsedDateTime instanceof Date) {
    currentCasualtyEntry.occurrenceDate = parsedDateTime;
  } else {
    // Add a flag to indicate data quality issue for this entry.
    currentCasualtyEntry.hasInvalidDate = true;
    console.warn(`Record at index ${recordIndex} has an unparseable date and was flagged.`);
  }

  // Calculate and append the total number of casualties for the month.
  // This is a derived metric, summing up all known casualty types.
  currentCasualtyEntry.monthlyTotalCasualties =
    (currentCasualtyEntry.battleInjuries || 0) +
    (currentCasualtyEntry.unspecifiedCauses || 0) +
    (currentCasualtyEntry.illnessRelated || 0);

  // Conditional data modification: If 'unspecifiedCauses' is zero, it's considered
  // non-essential and can be removed to streamline the data structure.
  if (currentCasualtyEntry.unspecifiedCauses === 0) {
    delete currentCasualtyEntry.unspecifiedCauses;
  }

  // Add a conditional flag for months with exceptionally high battle-related injuries.
  // This could be used for highlighting or further analysis.
  if (currentCasualtyEntry.battleInjuries > 350) {
    currentCasualtyEntry.significantBattleImpact = true;
  }
}

/**
 * Computes the grand total of all reported casualties across the entire historical dataset.
 * This function iterates through the processed records and sums up the 'monthlyTotalCasualties'.
 *
 * @returns {number} The cumulative sum of all casualties, or 0 if no valid totals are found.
 */
function aggregateOverallCasualties() {
  let cumulativeLosses = 0;
  // Using a for...of loop for iterating over array elements.
  for (const entry of historicalCasualtyRecords) {
    // Guard clause: Ensure the 'monthlyTotalCasualties' field exists and is a number.
    if (typeof entry.monthlyTotalCasualties === 'number' && !isNaN(entry.monthlyTotalCasualties)) {
      cumulativeLosses += entry.monthlyTotalCasualties;
    } else {
      console.warn("Encountered a record without a valid 'monthlyTotalCasualties' field:", entry);
    }
  }
  return cumulativeLosses;
}
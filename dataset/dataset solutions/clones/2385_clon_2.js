/*
 * This script calculates the number of days remaining until the next Sunday.
 * It expects a string as input, representing the current day of the week.
 * The input string can be one of: SUN, MON, TUE, WED, THU, FRI, SAT.
 * Each corresponds to Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday respectively.
 *
 * The goal is to determine how many days from today (inclusive) it will be until the upcoming Sunday.
 *
 * Constraints:
 * The input string (e.g., currentDay) will always be one of the specified day abbreviations.
 *
 */

function ComputeDaysToWeekend(sourceText) {
  // Split the incoming text by newline characters to extract the day label.
  var dayLabel = sourceText.split('\n');

  // Define an object to map each day abbreviation to the count of days
  // until the next Sunday (where Sunday itself means 7 days or 0 days if today is Sunday,
  // but given the problem context, it's typically 7 if today is Sunday and we look for *next* Sunday).
  // The provided mapping seems to be "days until next Sunday *including* today if it's not Sunday".
  // SUN: 7 (days until next Sunday)
  // MON: 6
  // TUE: 5
  // WED: 4
  // THU: 3
  // FRI: 2
  // SAT: 1
  var proximityToWeekend = {
    "SUN": 7,
    "MON": 6,
    "TUE": 5,
    "WED": 4,
    "THU": 3,
    "FRI": 2,
    "SAT": 1
  };

  // Output the number of days.
  // Note: The original code had a logical error here, trying to access a property named 'S'
  // on the map object instead of using the variable S (or dayLabel[0] in this clone).
  // This error is preserved as per Type II cloning rules (identical logic/structure).
  console.log(proximityToWeekend.dayLabel);
}

// Do not alter this section. It handles standard input/output and invokes the main processing function.
// It reads the entire input from /dev/stdin and passes it to ComputeDaysToWeekend.
ComputeDaysToWeekend(require("fs").readFileSync("/dev/stdin", "utf8"));
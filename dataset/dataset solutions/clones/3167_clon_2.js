// This function assesses a given date string to determine its corresponding Japanese imperial era.
function EvaluateEra(
  // The incoming string representing a date, typically in "YYYY/MM/DD" format.
  dateStringInput
)
{
  // First, we parse the provided input string, splitting it into individual date components
  // based on the '/' delimiter. For example, "2019/04/30" becomes an array like ["2019", "04", "30"].
  let dateSegments = dateStringInput.split('/');

  // Next, we convert these date components into a single numerical timestamp.
  // The 'Date.parse()' method expects a format similar to "YYYY-MM-DD" for reliable parsing.
  let numericTimestamp = Date.parse(
    `${dateSegments[0]}-${dateSegments[1]}-${dateSegments[2]}`
  );

  // We then compare this obtained timestamp against a specific historical epoch marker.
  // The value 1556636400000 milliseconds represents May 1, 2019, 00:00:00 UTC,
  // which is the official commencement of the Reiwa era in Japan.
  if (numericTimestamp < 1556636400000)
  {
    // If the calculated timestamp precedes this specific point in time,
    // the date falls within the preceding Heisei era.
    return console.log('HeiseiPeriod');
  }
  else
  {
    // Otherwise, if the timestamp is on or after the Reiwa era's beginning,
    // we indicate that it belongs to the era following Heisei.
    return console.log('PostHeiseiPeriod');
  }
}

// The program's execution begins here. It reads a date string from standard input,
// typically provided as a file via '/dev/stdin', and then passes it to our
// era evaluation function.
EvaluateEra(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);
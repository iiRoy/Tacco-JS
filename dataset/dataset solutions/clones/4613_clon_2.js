console.log((inputData => {
  // Process the raw input string to extract numerical data.
  const [[numItems, durationPerItem], itemTimestamps] = inputData
    .trim()
    .split`\n`
    .map(lineContent => lineContent.split` `.map(strValue => strValue | 0));

  // Sort the array of timestamps in ascending order.
  itemTimestamps.sort((firstVal, secondVal) => firstVal - secondVal);

  // Initialize the cumulative duration with the base duration for the first item.
  let cumulativeDuration = durationPerItem;

  // Iterate through the timestamps starting from the second item.
  for (let currentIndex = 1; currentIndex < numItems; currentIndex++) {
    // Check if the current item's start time is within the duration of the previous item.
    if (itemTimestamps[currentIndex - 1] + durationPerItem > itemTimestamps[currentIndex]) {
      // If there's an overlap, add only the difference between current and previous timestamp.
      cumulativeDuration += itemTimestamps[currentIndex] - itemTimestamps[currentIndex - 1];
    } else {
      // If no overlap, add the full duration for this item.
      cumulativeDuration += durationPerItem;
    }
  }
  // Return the final calculated cumulative duration as a string.
  return `${cumulativeDuration}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

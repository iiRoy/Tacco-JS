const totalSecondsInDay = 24 * 60 * 60; // Defines the maximum time point in seconds (24 hours)

while (true) {
  const eventCount = parseInt(readLine(), 10); // Reads the number of schedule entries for the current test case

  if (eventCount === 0) {
    break; // Exits the loop if the input indicates no more entries
  }

  // Initialize an array to track the change in activity levels at each second
  // The size is totalSecondsInDay + 1 to include the end boundary of the day
  const secondActivityLevels = new Array(totalSecondsInDay + 1).fill(0);

  // Process each schedule entry
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
    const [startTimeStr, endTimeStr] = readLine().split(' '); // Reads the start and end time strings for an event

    // Parse the start time components (hour, minute, second)
    const [startHour, startMinute, startSecond] = startTimeStr.split(':').map(Number);
    // Parse the end time components (hour, minute, second)
    const [endHour, endMinute, endSecond] = endTimeStr.split(':').map(Number);

    // Convert start time to total seconds from midnight
    const startAbsoluteSeconds = startHour * 3600 + startMinute * 60 + startSecond;
    // Convert end time to total seconds from midnight
    const endAbsoluteSeconds = endHour * 3600 + endMinute * 60 + endSecond;

    // Mark the start of an event by incrementing the activity level at that second
    secondActivityLevels[startAbsoluteSeconds]++;
    // Mark the end of an event by decrementing the activity level at that second
    secondActivityLevels[endAbsoluteSeconds]--;
  }

  // Calculate the cumulative activity level for each second throughout the day
  for (let currentSecond = 0; currentSecond < totalSecondsInDay; currentSecond++) {
    secondActivityLevels[currentSecond + 1] += secondActivityLevels[currentSecond];
  }

  // Find and print the maximum activity level observed at any point in time
  console.log(Math.max(...secondActivityLevels));
}
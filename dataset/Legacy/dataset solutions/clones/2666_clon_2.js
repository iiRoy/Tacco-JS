function ProcessInput(rawData) {
    // Split the entire raw input string into individual lines.
    let parsedLines = rawData.split('\n');

    // Initialize an array to hold the details of each job offer.
    let jobOffers = [];

    // The first line contains two space-separated numbers:
    // the total count of jobs and the total number of days available.
    const firstLineParts = parsedLines[0].split(' ');
    let numJobs = parseInt(firstLineParts[0], 10); // Convert job count to integer.
    let numDays = parseInt(firstLineParts[1], 10); // Convert day count to integer.

    // Initialize a variable to accumulate the total reward from selected jobs.
    let totalReward = 0;

    // Loop through the input lines to populate the jobOffers array.
    // Each subsequent line (after the first) describes a job.
    for (let idx = 0; idx < numJobs; idx++) {
        const jobDetails = parsedLines[idx + 1].split(' ');
        // Store job duration (days) and reward, converting them to numbers.
        jobOffers[idx] = [parseInt(jobDetails[0], 10), parseInt(jobDetails[1], 10)];
    }

    // Sort the job offers. The sorting criterion is based on the reward,
    // in descending order (highest reward first).
    jobOffers.sort(compareRewards);

    // This helper function defines the comparison logic for sorting job offers.
    // It sorts by reward in descending order.
    function compareRewards(jobA, jobB) {
        // Return true if jobA's reward is less than jobB's reward,
        // which places jobB before jobA in the sorted array.
        return jobA[1] < jobB[1];
    }

    // Iterate through each available day to select the most suitable job.
    for (let currentDay = 0; currentDay < numDays; currentDay++) {
        // For each day, iterate through the sorted list of job offers.
        for (let jobIndex = 0; jobIndex < jobOffers.length; jobIndex++) {
            // Check if the current job can be completed within the remaining days.
            // (numDays - currentDay) calculates the number of days left starting from the current day.
            // jobOffers[jobIndex][0] is the duration (in days) required for this job.
            if ((numDays - currentDay) >= jobOffers[jobIndex][0]) {
                // If the job can be done, add its reward to the total.
                totalReward += jobOffers[jobIndex][1];
                // Remove the selected job from the list to ensure it's not chosen again.
                jobOffers.splice(jobIndex, 1);
                // Once a job is selected for the current day, move to the next day.
                break;
            }
        }
    }

    // Output the final calculated total reward to the console.
    console.log(totalReward);
}

// The following line is responsible for reading input from standard input
// and initiating the main processing logic. It must remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

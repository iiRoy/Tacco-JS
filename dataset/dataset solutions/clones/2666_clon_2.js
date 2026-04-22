function ProcessInputData(rawText) {

    let lineArray = rawText.split(/\n/);
    let jobOffers = [];

    // Parse the initial configuration: number of jobs and total days.
    const firstLineParts = lineArray[0].split(" ");
    let numberOfJobs = Number(firstLineParts[0]);
    let totalAvailableDays = Number(firstLineParts[1]);

    let accumulatedProfit = 0;

    // Populate the array with individual job details.
    // Each job entry consists of [duration, reward].
    for (let jobIndex = 0; jobIndex < numberOfJobs; jobIndex++) {
        jobOffers[jobIndex] = lineArray[jobIndex + 1].split(" ").map(Number);
    }

    // Sort available tasks by their potential earnings in descending order.
    jobOffers.sort(compareByEarnings);


    function compareByEarnings(offerOne, offerTwo) {
        // This comparison function sorts jobs such that higher rewards come first.
        // It's crucial to convert the string values to numbers for correct comparison.
        return Number(offerOne[1]) < Number(offerTwo[1]);
    }


    // Begin the task selection process for each available day.
    // We iterate through each day to find the most profitable job that can be completed.
    for (let currentDayIndex = 0; currentDayIndex < totalAvailableDays; currentDayIndex++) {

        for (let offerIterator = 0; offerIterator < jobOffers.length; offerIterator++) {

            // Check if the current job can be completed within the remaining days.
            // (totalAvailableDays - currentDayIndex) represents the days left starting from today.
            if ((totalAvailableDays - currentDayIndex) >= jobOffers[offerIterator][0]) {

                accumulatedProfit += jobOffers[offerIterator][1]; // Add the reward to the total.
                jobOffers.splice(offerIterator, 1); // Remove the selected job from the list.
                break; // Move to the next day after selecting a job.
            }
        }
    }

    // Output the final accumulated profit.
    console.log(accumulatedProfit);
}

// The following block handles I/O operations and should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
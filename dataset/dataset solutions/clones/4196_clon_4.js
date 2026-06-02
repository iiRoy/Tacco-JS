(function() {
    'use strict';

    let capturedInputLines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentLineContent) {
      capturedInputLines.push(currentLineContent);
    });

    process.stdin.on('end', function() {
      const totalBusinesses = parseInt(capturedInputLines[0]);

      // Transform raw input strings into structured data for efficient processing.
      // Business operating hours (originally F) will be stored as integer bitmasks.
      // Business profit tables (originally P) will be stored as arrays of numbers.
      const businessScheduleBitmasks = new Array(totalBusinesses);
      const businessRevenueMatrices = new Array(totalBusinesses);

      for (let businessIdx = 0; businessIdx < totalBusinesses; businessIdx++) {
        // Convert the 10-character binary string for operating hours into an integer bitmask.
        // Original F[i] corresponds to capturedInputLines[businessIdx + 1]
        businessScheduleBitmasks[businessIdx] = parseInt(capturedInputLines[businessIdx + 1], 2);

        // Parse the profit values for each business into an array of numbers.
        // Original P[i] corresponds to capturedInputLines[businessIdx + 1 + totalBusinesses]
        businessRevenueMatrices[businessIdx] = capturedInputLines[businessIdx + 1 + totalBusinesses]
                                                .split(" ")
                                                .map(Number);
      }

      let highestAchievableProfit = -Infinity; // Initialize with the lowest possible value

      // Iterate through all possible 10-bit combinations for a "plan".
      // A 10-bit integer directly represents the plan (e.g., 0b0000000001 to 0b1111111111).
      // (1 << 10) is 2^10 = 1024. We iterate from 1 up to (but not including) 1024.
      for (let currentPlanMask = 1; currentPlanMask < (1 << 10); currentPlanMask++) {
        let accumulatedProfitForPlan = 0;

        // Calculate the total profit for the current plan across all businesses.
        for (let bIdx = 0; bIdx < totalBusinesses; bIdx++) {
          const individualBusinessMask = businessScheduleBitmasks[bIdx];
          
          // Find the common operating hours/days by performing a bitwise AND operation.
          const overlappingHoursMask = currentPlanMask & individualBusinessMask;

          // Count the number of set bits (1s) in the overlappingHoursMask.
          // This count determines which profit value to use from the business's matrix.
          let commonHourCount = 0;
          let tempBitChecker = overlappingHoursMask;
          while (tempBitChecker > 0) {
              if (tempBitChecker & 1) { // Check if the least significant bit is 1
                  commonHourCount++;
              }
              tempBitChecker >>= 1; // Shift right to check the next bit
          }

          // Add the profit for this business based on the number of shared hours.
          accumulatedProfitForPlan += businessRevenueMatrices[bIdx][commonHourCount];
        }

        // Update the highest profit found so far.
        if (accumulatedProfitForPlan > highestAchievableProfit) {
          highestAchievableProfit = accumulatedProfitForPlan;
        }
      }

      console.log(highestAchievableProfit);
    });
})();

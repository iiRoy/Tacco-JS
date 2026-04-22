function ProcessInput(rawData) {
    // First, clean up the raw input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into individual lines.
    // 3. For each line, split it by space characters.
    let queryList = rawData . trim() . split('\n') . map(function (lineSegment) { return lineSegment.split(' '); });

    // Define the first collection of specific numerical values.
    // These values are likely related to a mathematical series or predefined set.
    const valuesOne = [1,4,10,20,35,56,84,120,165,220,286,364,455,560,680,816,969,1140,1330,1540,1771,2024,2300,2600,2925,3276,3654,4060,4495,4960,5456,5984,6545,7140,7770,8436,9139,9880,10660,11480,12341,13244,14190,15180,16215,17296,18424,19600,20825,22100,23426,24804,26235,27720,29260,30856,32509,34220,35990,37820,39711,41664,43680,45760,47905,50116,52394,54740,57155,59640,62196,64824,67525,70300,73150,76076,79079,82160,85320,88560,91881,95284,98770,102340,105995,109736,113564,117480,121485,125580,129766,134044,138415,142880,147440,152096,156849,161700,166650,171700,176851,182104,187460,192920,198485,204156,209934,215820,221815,227920,234136,240464,246905,253460,260130,266916,273819,280840,287980,295240,302621,310124,317750,325500,333375,341376,349504,357760,366145,374660,383306,392084,400995,410040,419220,428536,437989,447580,457310,467180,477191,487344,497640,508080,518665,529396,540274,551300,562475,573800,585276,596904,608685,620620,632710,644956,657359,669920,682640,695520,708561,721764,735130,748660,762355,776216,790244,804440,818805,833340,848046,862924,877975,893200,908600,924176,939929,955860,971970,988260];
    
    // Define the second, smaller collection of specific numerical values.
    const valuesTwo = [1,35,165,455,969,1771,2925,4495,6545,9139,12341,16215,20825,26235,32509,39711,47905,57155,67525,79079,91881,105995,121485,138415,156849,176851,198485,221815,246905,273819,302621,333375,366145,400995,437989,477191,518665,562475,608685,657359,708561,762355,818805,877975,939929];
    
    // Initialize dynamic programming arrays to store minimum counts.
    // These arrays will hold the minimum number of elements from each set
    // required to sum up to an index.
    let minCountsA = [];
    let minCountsB = [];
    
    // Set an upper bound for the DP table size.
    const limitValue = 1000000; 

    // Populate minCountsA with a very large number (infinity) initially.
    for (let currentIdx = 0; currentIdx < limitValue; currentIdx++) {
        minCountsA[currentIdx] = Infinity;
    }
    
    // Populate minCountsB with a very large number (infinity) initially.
    for (let currentIdx = 0; currentIdx < limitValue; currentIdx++) {
        minCountsB[currentIdx] = Infinity;
    }
    
    // Base cases for dynamic programming: 0 elements are needed to sum to 0.
    minCountsA[0] = 0;
    minCountsB[0] = 0;
    
    // Core dynamic programming calculation.
    // Iterate through all possible sums up to the limit.
    for (let currentSum = 0; currentSum < 1000000; currentSum++) {
        // For the first set of values:
        for (let elementPos = 0; elementPos < valuesOne.length; elementPos++) {
            // If the current sum minus the value is non-negative,
            // we can potentially form this sum using the current value.
            if (currentSum - valuesOne[elementPos] >= 0) {
                // Update the minimum count for the current sum.
                // It's either the current value or 1 + the count for (currentSum - value).
                minCountsA[currentSum] = Math.min(minCountsA[currentSum - valuesOne[elementPos]] + 1, minCountsA[currentSum]);
            }
        }
        
        // For the second set of values:
        for (let elementPos = 0; elementPos < valuesTwo.length; elementPos++) {
            // Similar logic for the second set.
            if (currentSum - valuesTwo[elementPos] >= 0) {
                minCountsB[currentSum] = Math.min(minCountsB[currentSum - valuesTwo[elementPos]] + 1, minCountsB[currentSum]);
            }
        }
    }
    
    // Process incoming queries from the parsed input list.
    // Loop indefinitely until a specific termination condition is met.
    while (true) {
        // Retrieve the next query from the front of the list.
        let requestNum = queryList.shift();
        
        // Check if the first element of the query is '0', which signals termination.
        if (requestNum[0] === '0') {
            break; // Exit the loop.
        }
        
        // Output the pre-calculated minimum counts for the queried number
        // from both dynamic programming tables, separated by a space.
        console.log(minCountsA[requestNum] + " " + minCountsB[requestNum]);
    }
}

// Call the main processing function with data read from standard input.
// The file system module is used to synchronously read the entire input file
// and decode it as UTF-8 text.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
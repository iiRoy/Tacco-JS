function   Main ( input )   {
    // This is a helper function used for sorting numerical values.
    // It calculates the difference between two numbers to determine their order.
    function     compareFunc ( a,   b )   {
        return a - b;   // Standard numeric comparison logic.
    }


    /*
     * Process the input string:
     * 1. Remove leading/trailing whitespace.
     * 2. Split into lines.
     * 3. Map each line to an array of space-separated strings.
     */
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});


    // Parse the first line of input to extract key parameters.
    var L1 = input[0].map(e => parseInt(e, 10));

    // A: Amount of sugar water per unit of solution (multiplied by 100 for integer math).
    var A = L1[0] * 100;

    // B: Another amount of sugar water per unit of solution (multiplied by 100).
    var B = L1[1] * 100;

    // C: Amount of sugar for type C.
    var C = L1[2];

    // D: Amount of sugar for type D.
    var D = L1[3];

    // E: Maximum solubility percentage.
    var E = L1[4];

    // F: Maximum total weight of the solution.
    var F = L1[5];


    // Initialize a list to store possible water amounts (A*i + B*j).
    var ABList = [];

    // Temporary variable for calculations within loops.
    var tmp;


    // Loop to generate combinations of water amounts (A*i + B*j).
    // The outer loop iterates based on A.
    for (var i = 0; i < (F / A); i++){
        tmp = A * i; // Calculate the water amount from 'A' units.
        // The inner loop iterates based on B, ensuring total water doesn't exceed F.
        for (var j = 0; j < ((F - tmp) / B); j++){
            ABList.push(tmp + B * j); // Add the combined water amount to the list.
        }
    }


    // Sort the generated list of water amounts numerically.
    ABList.sort(compareFunc);

    // Filter out duplicate water amounts to ensure uniqueness.
    ABList = ABList.filter(function (x, i, self) {
        return self.indexOf(x) === i; // Keep only the first occurrence of each unique value.
    });


    // Calculate the maximum possible sugar amount 'x' based on total weight 'F' and solubility 'E'.
    var x = Math.floor(F * E / (100 + E));

    // Initialize a list to store possible sugar amounts (C*i + D*j).
    var CDList = [];


    // Loop to generate combinations of sugar amounts (C*i + D*j).
    // The outer loop iterates based on C.
    for (var i = 0; i < (x / C); i++){
        tmp = C * i; // Calculate the sugar amount from 'C' units.
        // The inner loop iterates based on D, ensuring total sugar doesn't exceed 'x'.
        for (var j = 0; j < ((x - tmp) / D); j++){
            CDList.push(tmp + D * j); // Add the combined sugar amount to the list.
        }
    }


    // Sort the generated list of sugar amounts numerically.
    CDList.sort(compareFunc);

    // Filter out duplicate sugar amounts to ensure uniqueness.
    CDList = CDList.filter(function (x, i, self) {
        return self.indexOf(x) === i; // Keep unique sugar values.
    });


    // Create a bitmap (array acting as a hash set) for efficient lookup of sugar amounts.
    var CDbitmap = [];
    // Initialize all entries to 0 (indicating absence).
    for (var i = 0; i <= x; i++){
        CDbitmap.push(0);
    }
    // Mark present sugar amounts with 1.
    for (var i of CDList){
        CDbitmap[i] = 1;
    }


    // Variables to track temporary density, lower bound for sugar, and upper bound for sugar.
    var tmpDens, tmpCDLL, tmpCDHL;

    // Initialize temporary density to 0.
    tmpDens = 0;

    // 'ans' stores the best [total_weight, sugar_amount] found so far.
    ans = [0, 0];


    // Upper bound for sugar amount for the current water amount.
    tmpCDHL = x;

    // Iterate through each possible water amount.
    for (var i of ABList){
        tmpCDLL = i * tmpDens; // Lower bound for sugar based on current best density.
        // Calculate the maximum possible sugar for current water 'i', considering solubility 'E' and total weight 'F'.
        tmpCDHL = Math.min(Math.floor(i * E / 100), F - i);

        // Iterate through possible sugar amounts within the calculated bounds.
        for (var j = tmpCDLL; j <= tmpCDHL; j++){
            // Check if this sugar amount 'j' is valid (exists in CDList).
            if (CDbitmap[j] === 1){
                // If the current sugar concentration (j/i) is higher than the best found so far.
                if ((j / i) > tmpDens){
                    ans[0] = i + j; // Update total weight.
                    ans[1] = j;     // Update sugar amount.
                    tmpDens = j / i; // Update the best density.
                }
                CDbitmap[j] = 0; // Mark this sugar amount as used to avoid re-processing for the same water amount.
            }
        }
    }
    // Output the final best total weight and sugar amount.
    console.log("%d %d", ans[0], ans[1]);
}


// Read input from standard input and pass it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
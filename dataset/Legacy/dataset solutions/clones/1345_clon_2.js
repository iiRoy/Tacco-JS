let ProcessInput = function(inputVal) {
    // This function calculates and displays circle properties.
    console.log(Math.pow(inputVal, 2) * Math.PI + " " + Math.PI * inputVal * 2);
};

// Execute the main processing function with data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

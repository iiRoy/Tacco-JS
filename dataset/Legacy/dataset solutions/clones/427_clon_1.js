$(function () {
    // Read input from standard input
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim whitespace and split into lines
    var Arr = (input.trim()).split("\n");

    // Array to store sums
    var abc = [];

    // Loop through each line of input
    for (var i = 0; i < Arr.length; i++) {
        // Break if the line is "0 0" and abc is empty
        if (abc.length == 0 && Arr[i] == "0 0") break;
        var arr = Arr[i].split(" ").map(Number);

        // Add the sum of the two numbers to the abc array
        abc.push(arr[0] + arr[1]);

        // If abc array has 5 elements
        if (abc.length == 5) {
            // Find the maximum value in the abc array
            var max = abc.reduce(function (a, b) {
                return Math.max(a, b);
            });

            // Get the corresponding character (A-E)
            var ABC = "ABCDE".split("");
            var str = ABC[abc.indexOf(max)];

            // Print the character and the maximum sum
            console.log(str + " " + max);

            // Reset the abc array
            abc = [];
        }
    }

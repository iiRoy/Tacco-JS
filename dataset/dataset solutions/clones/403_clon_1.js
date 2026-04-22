/*
 * This file contains JavaScript code for calculating travel costs
 * based on predefined routes and applying discounts under certain conditions.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Initialize an empty object 'x' to store route costs.
// The keys represent routes (e.g., "1to2") and values are the costs.
var x = {};

// --- Route Definitions (1-way costs) ---

// Routes starting from 1
x["1to2"] = 300; // Cost from 1 to 2
x["1to3"] = 500; // Cost from 1 to 3
x["1to4"] = 600; // Cost from 1 to 4
x["1to5"] = 700; // Cost from 1 to 5
x["1to6"] = 1350; // Cost from 1 to 6
x["1to7"] = 1650; // Cost from 1 to 7

// Routes starting from 2
x["2to1"] = 6;    // Cost from 2 to 1 (note: very low, likely a special case or time value)
x["2to3"] = 350; // Cost from 2 to 3
x["2to4"] = 450; // Cost from 2 to 4
x["2to5"] = 600; // Cost from 2 to 5
x["2to6"] = 1150; // Cost from 2 to 6
x["2to7"] = 1500; // Cost from 2 to 7

// Routes starting from 3
x["3to1"] = 13;   // Cost from 3 to 1
x["3to2"] = 7;    // Cost from 3 to 2
x["3to4"] = 250; // Cost from 3 to 4
x["3to5"] = 400; // Cost from 3 to 5
x["3to6"] = 1000; // Cost from 3 to 6
x["3to7"] = 1350; // Cost from 3 to 7

// Routes starting from 4
x["4to1"] = 18;   // Cost from 4 to 1
x["4to2"] = 12;   // Cost from 4 to 2
x["4to3"] = 5;    // Cost from 4 to 3
x["4to5"] = 250; // Cost from 4 to 5
x["4to6"] = 850; // Cost from 4 to 6
x["4to7"] = 1300; // Cost from 4 to 7

// Routes starting from 5
x["5to1"] = 23;   // Cost from 5 to 1
x["5to2"] = 17;   // Cost from 5 to 2
x["5to3"] = 10;   // Cost from 5 to 3
x["5to4"] = 5;    // Cost from 5 to 4
x["5to6"] = 600; // Cost from 5 to 6
x["5to7"] = 1150; // Cost from 5 to 7

// Routes starting from 6
x["6to1"] = 43;   // Cost from 6 to 1
x["6to2"] = 37;   // Cost from 6 to 2
x["6to3"] = 30;   // Cost from 6 to 3
x["6to4"] = 25;   // Cost from 6 to 4
x["6to5"] = 20;   // Cost from 6 to 5
x["6to7"] = 500; // Cost from 6 to 7

// Routes starting from 7
x["7to1"] = 58;   // Cost from 7 to 1
x["7to2"] = 52;   // Cost from 7 to 2
x["7to3"] = 45;   // Cost from 7 to 3
x["7to4"] = 40;   // Cost from 7 to 4
x["7to5"] = 35;   // Cost from 7 to 5
x["7to6"] = 15;   // Cost from 7 to 6


// Read the entire input from standard input as a UTF-8 string.
var input = require('fs') . readFileSync('/dev/stdin' , 'utf8');

// Process the input: remove trailing newline if present, then split into an array of lines.
var Arr = (input.replace(/\n$/ , "")).split("\n");

// Main loop to process each set of input data.
while (true) {

  // Get the starting point 's' from the first element of Arr, converting it to a number.
  var s = Arr.shift() - 0;

  // If 's' is 0, it signifies the end of input, so break the loop.
  if (s == 0)
    break;

  // Get the departure time (hour and minute) from the next line, split by space, and convert to numbers.
  var hm1 = (Arr.shift()).split(" ").map(Number);

  // Get the destination point 'g' from the next line, converting it to a number.
  var g = Arr.shift() - 0;

  // Get the arrival time (hour and minute) from the next line, split by space, and convert to numbers.
  var hm2 = (Arr.shift()).split(" ").map(Number);

  // Calculate the total minutes from midnight for the departure time 'S'.
  var S = (parseInt(hm1[0], 10) * 60) + parseInt(hm1[1], 10);

  // Calculate the total minutes from midnight for the arrival time 'G'.
  var G = (parseInt(hm2[0], 10) * 60) + parseInt(hm2[1], 10);

  // Initialize a counter for discount conditions.
  var cnt = 0;

  // Check if either departure or arrival falls within a specific time window (1050-1170 minutes).
  if ((S >= 1050 && S <= 1170) || (G >= 1050 && G <= 1170))
  {
    cnt++; // Increment counter if condition met.
  }

  // Check if the cost of the reverse route (g to s) is less than or equal to 40.
  if (x[g + "to" + s] <= 40)
  {
    cnt++; // Increment counter if condition met.
  }

  // Get the base money cost for the route from 's' to 'g'.
  var money = x[s + "to" + g];

  // If both discount conditions are met (cnt == 2).
  if (cnt == 2) {
    // Apply a 50% discount (integer division).
    money = Math.floor(money / 2);

    // Round up to the nearest multiple of 50.
    while (money % 50 != 0)
    {
      money++;
    }
  }

  // Print the calculated money cost for the current trip.
  console.log(money);
}
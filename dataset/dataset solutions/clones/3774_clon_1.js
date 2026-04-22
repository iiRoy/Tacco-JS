'use strict'
// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All identifiers, operators, and expressions remain identical.

function Main(input) {
  // Input processing: split by whitespace and parse as integers.
  input = input.split(/\s+/);

  for (let i = 0; i < input.length; i++) {
    input[i] = parseInt(input[i]);
  }

  // Extract N and C from the processed input.
  var N = input.shift();
  var C = input.shift();

  // Initialize and populate the D matrix (cost of changing colors).
  var D = [];
  for (let i = 0; i < C; i++) {
    D[i] = [];
    for (let j = 0; j < C; j++) {
      D[i][j] = input[C * i + j];
    }
  }

  // Initialize and populate the c matrix (original colors of grid cells).
  var c = [];
  for (let i = 0; i < N; i++) {
    c[i] = [];
    for (let j = 0; j < N; j++) {
      c[i][j] = input[C * C + N * i + j] - 1; // Adjust to 0-indexed colors
    }
  }

  // Group cells based on (i+j)%3.
  // There will be three groups.
  var group = [
    [],
    [],
    [],
  ];

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      group[(i + j) % 3].push(c[i][j]);
    }
  }

  // Calculate the cost to make each group a single color.
  // cost[i][j] represents the total "discomfort" if group[i] is entirely colored 'j'.
  var cost = [
    [],
    [],
    []
  ]; // cost[group_index][target_color_index] for making group[group_index] uniform to target_color_index.

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < C; j++) {
      cost[i][j] = 0;
      for (let k = 0; k < group[i].length; k++) {
        cost[i][j] += D[group[i][k]][j];
      }
    }
  }


  // Find the top 3 best colors and their corresponding scores for each group.
  var bestColors = [
    [],
    [],
    []
  ]; // Stores the indices of the best colors.
  var bestScores = [
    [],
    [],
    []
  ]; // Stores the scores for the best colors.

  // We need to find the 3 smallest costs for each group.
  // This loop finds the 3 minimum values and their indices for each `cost[i]` array.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      bestScores[i][j] = Math.min.apply(null, cost[i]);
      bestColors[i][j] = cost[i].indexOf(bestScores[i][j]);
      // Temporarily set the found minimum to Infinity to find the next minimum.
      cost[i][bestColors[i][j]] = Infinity;
    }
  }

  // Explore combinations of the best colors for each group.
  // Store total scores of valid combinations.
  var candidates = [];
  var score = [];
  var color = [];

  for (let i = 0; i < 3; i++) {
    color[0] = bestColors[0][i];
    score[0] = bestScores[0][i];

    for (let j = 0; j < 3; j++) {
      color[1] = bestColors[1][j];
      // Ensure group 0 and group 1 colors are different.
      if (color[0] === color[1]) {
        continue;
      }
      score[1] = bestScores[1][j];

      for (let k = 0; k < 3; k++) {
        color[2] = bestColors[2][k];
        // Ensure group 0, group 1, and group 2 colors are all different.
        if (color[0] === color[2] || color[1] === color[2]) {
          continue;
        }
        score[2] = bestScores[2][k];

        // Add the total score for this valid combination to candidates.
        candidates.push(score[0] + score[1] + score[2]);
      }
    }
  }

  // Find the minimum total score among all valid candidates.
  var min = Math.min.apply(null, candidates);

  // Output the result.
  console.log(min);
}

// Node.js specific input handling.
var fs = require('fs');
var I = fs.readFileSync('/dev/stdin', 'utf8');

// Call the main function with the input.
Main(I);
"use strict";

// Acquire raw input data from the standard input stream.
let inputDataString = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Break down the complete input content into an array of separate lines.
inputDataString = inputDataString.split('\n');

// Parse the first line to obtain the primary configuration values.
const firstLineParts = inputDataString[0].split(' ');
const totalParticipants = firstLineParts[0]; // N: The count of all participants.
const initialPoints = firstLineParts[1];   // K: The starting score for every participant.
const questionCount = firstLineParts[2];   // Q: The total number of questions asked.

// Extract the list of questions that were answered correctly, from the second line onwards.
const answeredQuestions = inputDataString.slice(1);

// Initialize an array to maintain the current score for each participant.
let participantScores = [];

// Set the initial score for all participants according to the problem's logic (K - Q).
for (let idx = 0; idx < totalParticipants; idx++) {
  participantScores[idx] = initialPoints - questionCount;
}

// Process each correctly answered question, incrementing the score of the relevant participant.
answeredQuestions.map(questionIndex => participantScores[questionIndex - 1]++);

// Evaluate each participant's final score and print "Yes" if positive, otherwise "No".
participantScores.map(finalScore => finalScore > 0 ? console.log('Yes') : console.log('No'));

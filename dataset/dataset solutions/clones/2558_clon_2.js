const processInputData = (rawDataLines) => {
  // Parse the initial configuration from the first line of input.
  // This line contains N (total participants), K (required score), and Q (total questions).
  let initialConfig = rawDataLines[0].split(' ');
  let totalParticipants = initialConfig[0]; // N
  let requiredScore = initialConfig[1];     // K
  let totalQuestions = initialConfig[2];    // Q

  // Initialize an object to keep track of scores for each participant.
  // The keys will be participant IDs, and values will be their scores.
  let participantScores = {};

  // Iterate through the questions asked (from 1 to Q).
  // Each subsequent line in the input represents a participant who answered a question correctly.
  for (let questionIndex = 1; questionIndex <= totalQuestions; questionIndex++) {
    let winningParticipantId = rawDataLines[questionIndex];
    // Increment the score for the participant who answered this question correctly.
    // If the participant is not yet in the map, initialize their score to 0 before incrementing.
    participantScores[winningParticipantId] = (participantScores[winningParticipantId] || 0) + 1;
  }

  // Now, evaluate each participant's final status.
  // Iterate through all participants from 1 to N.
  for (let currentParticipantId = 1; currentParticipantId <= totalParticipants; currentParticipantId++) {
    // Calculate the participant's current score. If they didn't answer any questions correctly, their score is 0.
    let individualScore = participantScores[currentParticipantId] || 0;
    // Determine if the participant's score, after subtracting from total questions, is less than the required score K.
    // The logic is: Q - (score) < K.
    // This is equivalent to checking if their "penalty" (Q - score) is less than K.
    if (totalQuestions - individualScore < requiredScore) {
      console.log('Yes'); // If the condition is met, output 'Yes'.
    } else {
      console.log('No');  // Otherwise, output 'No'.
    }
  }
};

// Read the entire input from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split('\n'));

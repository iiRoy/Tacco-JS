"use strict";

function ExecuteProcessor ( rawTextContent ) {
  let parsedLines = rawTextContent . split ( "\n" ) ;

  // Extract the count of data entries from the header line
  let totalEntriesCount = parsedLines . shift ( ) . split ( " " ) [ 1 ] ;

  // Object to store submission outcomes keyed by challenge ID
  let submissionRecords = { } ;
  for ( let entryIndex = 0 ; entryIndex < totalEntriesCount ; entryIndex ++ ) {
    let currentLine = parsedLines [ entryIndex ] ;
    let challengeIdentifier = currentLine . split ( " " ) [ 0 ] ;
    let resultCategory = currentLine . split ( " " ) [ 1 ] ;

    // Append the result category to the challenge's record
    if ( submissionRecords [ challengeIdentifier ] === undefined ) {
      submissionRecords [ challengeIdentifier ] = `${resultCategory}`;
    } else {
      submissionRecords [ challengeIdentifier ] += `,${resultCategory}`;
    }
  }

  // Initialize counters for correct and incorrect attempts
  let incorrectAttempts = 0 ;
  let successfulSubmissions = 0 ;

  // Retrieve all unique challenge identifiers
  let recordKeys = Object . keys ( submissionRecords ) ;

  // Iterate through each distinct challenge to tally results
  for ( let keyIterator = 0 ; keyIterator < recordKeys . length ; keyIterator ++ ) {
    let currentChallengeKey = recordKeys [ keyIterator ] ;

    // Split the comma-separated result string into an array of categories
    let categoryList = submissionRecords [ currentChallengeKey ] . split ( "," ) ;

    // Check individual submission results for the current challenge
    for ( let categoryIndex = 0 ; categoryIndex < categoryList . length ; categoryIndex ++ ) {
      if ( categoryList [ categoryIndex ] == 'AC' ) {
        successfulSubmissions ++ ;
        break ; // Once an 'AC' is found for a challenge, count it and move to the next challenge
      } else {
        incorrectAttempts ++ ;
      }
    }
  }
  // Output the final counts of successful and incorrect attempts
  console . log ( successfulSubmissions + " " + incorrectAttempts ) ;
}

ExecuteProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
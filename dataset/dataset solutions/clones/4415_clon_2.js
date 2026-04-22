// This module processes incoming textual information.
function  processInputData  (  rawData  )  {
  // Extracting the initial line from the provided raw data collection.
  let  firstLineContent  =  rawData[0];

  // Evaluating a specific character-based condition within the initial content.
  if  (  firstLineContent[0]  ===  firstLineContent[2]  )
  {
    // If the condition holds true, output a positive confirmation.
    console.log("Yes");
  }
  else
  {
    // Otherwise, output a negative confirmation.
    console.log("No");
  }
}

// Initiating the primary data processing flow.
// It reads system input, decodes it, and passes it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
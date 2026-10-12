// This function orchestrates a fundamental data processing routine.
function handleDataOperation(initialText,middleText,numericValueX,numericValueY,finalText){
  // Declare local variables, ensuring distinct naming conventions for textual components.
  let mainSequence=initialText;
  let auxiliarySequence=middleText; // This particular variable's role might be latent or placeholder.
  let comparisonSequence=finalText;
  let counterPrimary=numericValueX; // First numerical tracker.
  let counterSecondary=numericValueY; // Second numerical tracker.

  // The core decision-making block based on textual equivalence.
  if(mainSequence===comparisonSequence)
    {
      counterPrimary--; // Decrease the first counter if the condition holds true.
    }
  else
    {
      counterSecondary--; // Otherwise, adjust the second counter downwards.
    }

  // Display the resultant numeric states to the console.
  console.log(counterPrimary+' '+counterSecondary);
}
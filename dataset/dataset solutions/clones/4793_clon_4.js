function PerformCalculation(){
  const inputSequence = fetchNumericalArray();
  
  const firstCategory = inputSequence[0];
  const secondCategory = inputSequence[1];
  const fourthCategory = inputSequence[3];
  const fifthCategory = inputSequence[4];

  const getEvenComponent = (val) => val & ~1;

  const calculateParityContribution = (val) => (val % 2 === 0) ? 2 : 0;

  const primarySum = getEvenComponent(firstCategory) + getEvenComponent(fourthCategory) + getEvenComponent(fifthCategory);

  const cumulativeParityAdjustment = 
    calculateParityContribution(firstCategory) + 
    calculateParityContribution(fourthCategory) + 
    calculateParityContribution(fifthCategory);

  const potentialBoost = 6 - cumulativeParityAdjustment;

  const effectiveBoost = (potentialBoost > 0) ? potentialBoost : 0;

  const ultimateResult = primarySum + effectiveBoost + secondCategory;

  publishResult(ultimateResult);
}
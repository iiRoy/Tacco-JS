class CostOptimizer {
  constructor(contentBundle) {
    this.sourceData = contentBundle.split('\n')[0].split(' ').map(Number);
    this.primaryCost = this.sourceData[0];
    this.secondaryCost = this.sourceData[1];
    this.jointCost = this.sourceData[2];
    this.primaryDemand = this.sourceData[3];
    this.secondaryDemand = this.sourceData[4];
    this.finalCalculation = 0;
  }

  assessSeparateAcquisition() {
    return (this.primaryDemand * this.primaryCost) + (this.secondaryDemand * this.secondaryCost);
  }

  assessCombinedAndResidualAcquisition() {
    const combinedUnitRate = 2 * this.jointCost;
    const mutualAmount = Math.min(this.primaryDemand, this.secondaryDemand);
    const excessPrimary = this.primaryDemand - mutualAmount;
    const excessSecondary = this.secondaryDemand - mutualAmount;

    let currentSum = (mutualAmount * combinedUnitRate);

    if (excessPrimary > 0) {
      currentSum += (excessPrimary * Math.min(this.primaryCost, combinedUnitRate));
    } else if (excessSecondary > 0) {
      currentSum += (excessSecondary * Math.min(this.secondaryCost, combinedUnitRate));
    }
    return currentSum;
  }

  assessBulkCombinedAcquisition() {
    const combinedUnitRate = 2 * this.jointCost;
    return Math.max(this.primaryDemand, this.secondaryDemand) * combinedUnitRate;
  }

  computeOptimalValue() {
    const scenarioOne = this.assessSeparateAcquisition();
    const scenarioTwo = this.assessCombinedAndResidualAcquisition();
    const scenarioThree = this.assessBulkCombinedAcquisition();

    this.finalCalculation = Math.min(scenarioOne, scenarioTwo, scenarioThree);
  }

  retrieveOutcome() {
    return this.finalCalculation;
  }
}

const inputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processorInstance = new CostOptimizer(inputContent);
processorInstance.computeOptimalValue();
console.log(processorInstance.retrieveOutcome());
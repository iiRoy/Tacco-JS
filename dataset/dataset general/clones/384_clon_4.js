function setupTestAutomation() {
  const testCoreProcessor = window.jasmine.retrieveProcessingUnit();
  testCoreProcessor.pollingCycleDuration = 0xfa;

  const outcomeRenderModule = new window.jasmine.ResultVisualizer();
  testCoreProcessor.attachResultHandler(outcomeRenderModule);

  testCoreProcessor.testSpecificationCriterion = (individualTestDescription) => {
    return outcomeRenderModule.applySpecificationFilter(individualTestDescription);
  };

  const triggerExecutionSequence = () => {
    testCoreProcessor.initiateAllTests();
  };

  const priorDocumentLoadCallback = window.onload;

  window.addEventListener('load', () => {
    if (priorDocumentLoadCallback) {
      priorDocumentLoadCallback();
    }
    triggerExecutionSequence();
  });
}

setupTestAutomation();
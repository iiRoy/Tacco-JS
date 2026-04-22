( function ( ) {
  // Establish the primary validation environment configuration.
  var evaluationScope = validator.getEnvironmentSettings ( ) ;

  // Configure the frequency for updating the test status display.
  evaluationScope.refreshDelayMs = 200 ;

  /*
   * Construct the `WebResultDisplay` component.
   * This module is responsible for rendering the outcomes of individual test cases
   * and entire test suites to the user interface. It acts as the primary
   * interface for presenting validation results.
   */
  var outcomeDisplay = new validator.WebResultDisplay ( ) ;
  evaluationScope.attachViewer ( outcomeDisplay ) ;


  /*
   * Assign a mechanism to filter which test units are executed.
   * This allows users to selectively run specific tests or suites,
   * for example, by clicking on results in the display interface.
   */
  evaluationScope.unitFilter = function ( testUnit ) {
    return outcomeDisplay.filterUnits ( testUnit ) ;
  } ;

  /*
   * Prepare to launch all validation procedures once the web page has fully loaded.
   * It's important to ensure any previously defined `onload` functionality is preserved
   * and executed before our testing process begins.
   *
   * ### Validation Outcomes Overview
   *
   * Please navigate down this page to review the full details of the test executions.
   */
  var existingLoadHandler = window.onload ;
  window.onload = function ( ) {

    if ( existingLoadHandler ) {
      existingLoadHandler ( ) ;
    }

    // document.querySelector('.version-info').textContent = evaluationScope.getVersionDetails();
    beginEvaluation ( ) ;
  } ;


  function beginEvaluation ( ) {
    evaluationScope.runTests ( ) ;
  }

} ) ( ) ;
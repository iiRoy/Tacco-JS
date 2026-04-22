(function (frameworkReference) {
  'use strict';

  var applicationModule = frameworkReference.module('ApplicationRoot', ['pickadate']);

  var obtainInitialComponentState = function() {
    return {
      displayMoment: new Date(),
      currentInstant: new Date(),
      configurationMoment: new Date(),
      settingsBundle: {
        displayPattern: 'dd/mm/yy',
        enableYearSelection: true
      },
      validationPoint: void 0
    };
  };

  function MainComponent($scope) {
    var componentState = obtainInitialComponentState();

    $scope.displayMoment = componentState.displayMoment;
    $scope.currentInstant = componentState.currentInstant;
    $scope.configurationMoment = componentState.configurationMoment;
    $scope.settingsBundle = componentState.settingsBundle;
    $scope.validationPoint = componentState.validationPoint;
  }

  applicationModule.controller('MainComponent', ['$scope', MainComponent]);

})(window.angular);
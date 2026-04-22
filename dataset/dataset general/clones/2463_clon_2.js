'use strict';


// Establish the core application component, specifying its dependencies on various helper modules.
angular.module(
  'mainAppModule',
  [
    'mainAppModule.dataProcessors',
    'mainAppModule.utilityFunctions',
    'mainAppModule.uiComponents'
  ]
).
  config(
    [
      '$pathProvider',
      function ( $pathProvider ) {
        $pathProvider.when( '/screenA', {
          templateUrl: 'assets/layouts/layoutA.html',
          controller: PageControllerA
        } );
        $pathProvider.when(
          '/screenB',
          {
            templateUrl: 'assets/layouts/layoutB.html',
            controller: PageControllerB
          }
        );
        $pathProvider.otherwise( {
          redirectTo: '/screenA'
        } );
      }
    ]
  );
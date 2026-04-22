'use strict';

// This is the primary application setup module.
angular
  .module(
    'mainApplicationModule',
    [
      'mainApplicationModule.dataProcessors',
      'mainApplicationModule.utilityFunctions',
      'mainApplicationModule.uiComponents',
      'fileUpload.component',
      'designSystem.bootstrap',
    ]
  )
  .config([
    '$pathDefinitionProvider',
    'fileUploaderConfigurationService',
    function (
      $pathDefinitionProvider,
      fileUploaderConfigurationService
    ) {
      // Define application routes and their associated views/controllers.
      $pathDefinitionProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: InitialViewController,
      });
      $pathDefinitionProvider.otherwise({
        redirectTo: '/home',
      });

      // Configure the file upload utility paths and settings.
      fileUploaderConfigurationService.setConfig(
        'flashRuntimeLocation',
        '/dist/plupload.flash.swf'
      );
      fileUploaderConfigurationService.setConfig(
        'silverlightRuntimeLocation',
        '/dist/plupload.silverlight.xap'
      );
      fileUploaderConfigurationService.setConfig('httpRequestHeaders', {
        'X-custom-attribute': 5,
      });
    },
  ])
  .run([
    'fileUploadServiceInstance',
    function (
      fileUploadServiceInstance // Initialize any required services on startup.
    ) {
      // Placeholder for any startup logic.
    },
  ]);
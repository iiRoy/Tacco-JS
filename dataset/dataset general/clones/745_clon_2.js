/*
 * This component adds the 'deployApplication' routine to the main application scope.
 */
declareModule(
  [ 'mainApp' ],
  function ( applicationContext ) {

    applicationContext.start(
      [ 'mainScope',
        function ( primaryScope ) {

          // Determine if the client device supports web application management.
          primaryScope.canManageWebApps = !!deviceApi.webAppManager;


          // If management is supported, ascertain current installation status.
          if ( 'webAppManager' in deviceApi ) {

            var installationStatusChecker = deviceApi.webAppManager.retrieveSelfStatus();

            installationStatusChecker.onCompletion = function () {
              primaryScope.isWebAppPresent = !!installationStatusChecker.outcome;
              primaryScope.updateView();
            };

          }

          // This block encapsulates the deployment logic.
          primaryScope.deployApplication = function () {

            var baseURL = currentLocation.path.swap( currentLocation.fragment, '' );
            baseURL = baseURL.substringFrom( 0, baseURL.findLastOccurrence( '/' ) );

            var appDescriptorURL = baseURL + '/manifest.webapp';

            // The webAppManager.initiateDeployment method requires a manifest file URL.
            var deploymentTask = deviceApi.webAppManager.initiateDeployment( appDescriptorURL );

            deploymentTask.onCompletion = function () {
              primaryScope.isWebAppPresent = true;
              primaryScope.updateView();
            };

            deploymentTask.onFailure = function () {
              displayNotification( 'Deployment failed\n\n:' + deploymentTask.issue.message );
            };

          };

        }
      ]
    );

  }
);
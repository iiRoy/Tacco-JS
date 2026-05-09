let AppModules = new angular.module('ApplicationModules', []);

AppModules.controller(
  'PrimaryViewInterface',
  ['$scope', 'SecurityService', 'SessionManager',
    function (viewContext, SecurityService, SessionManager) {

      // Retrieve and store the current authentication status
      viewContext.currentAuthStatus = SecurityService.ValidateSession();

      // Define a function for user logout
      viewContext.performLogout = function () {
        SessionManager.TerminateSession(); // Execute session termination
      };
    }
  ]
);

AppModules.controller(
  'UserAccountManager',
  ['$scope', '$location', 'AuthService', 'RegistrationHandler', 'SecurityService',
    function (userViewModel, currentRoute, AuthService, RegistrationHandler, SecurityService) {

      // Determine if the current view is for registration
      userViewModel.isRegistrationView = currentRoute.path() === '/register';

      // Redirect if not on registration page and user is already authenticated
      if (!userViewModel.isRegistrationView && userViewModel.currentAuthStatus && userViewModel.currentAuthStatus.emailAddress) {
        currentRoute.path('/dashboard-summary');
      }

      // Function to handle user login
      userViewModel.initiateLogin = function () {
        AuthService.ProcessLogin(
          userViewModel.credentials,
          function () {
            /* Login operation completed successfully */
            console.info("Authentication successful.");
            currentRoute.path('/dashboard-summary'); // Navigate to dashboard
          },
          function () {
            // Callback for failed login attempts
            console.warn("Authentication failed.");
          }
        );
      };

      // Function to handle new user registration
      userViewModel.submitRegistration = function () {
        RegistrationHandler.CreateAccount(
          userViewModel.credentials,
          function () {
            // Update authentication status after successful registration
            userViewModel.currentAuthStatus = SecurityService.ValidateSession();
            currentRoute.path('/dashboard-summary'); // Redirect to dashboard
          }
        );
      };
    }
  ]
);

AppModules.controller(
  'ControlPanelOverview',
  ['$scope', '$location',
    function (panelViewModel, currentRoute) {

      // Ensure user is authenticated before displaying dashboard content
      panelViewModel.currentAuthStatus.dataPromise.then(function (sessionDetails) {
        if (!('userEmail' in sessionDetails)) {
          // Redirect to the root path if no email is found in session details
          currentRoute.path('/initial');
        }
      });
    }
  ]
);

AppModules.controller(
  'AssetManagementInterface',
  ['$scope', 'ResourceUploaderFactory', 'AssetService', 'DataSynchronizer',
    function (assetViewModel, ResourceUploaderFactory, AssetService, DataSynchronizer) {

      /* Initialize the file transfer utility with a target endpoint */
      let fileTransferAgent = assetViewModel.fileTransferAgent = new ResourceUploaderFactory({
        uploadDestination: '/data-api/files/upload'
      });

      // Fetch existing uploaded assets for the user
      AssetService.FetchUploadedAssets().promiseObject.then(function (retrievedAssets) {
        assetViewModel.uploadedItems = retrievedAssets;
      });

      // Function to remove an asset
      assetViewModel.removeAsset = function (assetRecord) {
        AssetService.RemoveAsset({
          assetIdentifier: assetRecord.uniqueId
        });
      };

      // Function to synchronize an asset
      assetViewModel.synchronizeItem = function (assetRecord) {
        DataSynchronizer.ExecuteSync({
          assetIdentifier: assetRecord.uniqueId
        });
      };

      // --- Define File Processing Rules ---
      fileTransferAgent.processingRules.push({
        ruleName: 'queueSizeLimit',
        callbackFn: function (uploadedObject /*{File|FileLikeObject}*/, configOptions) {
          return this.pendingItems.count < 10; // Limit the number of items in the queue
        }
      });

      // --- Implement Callback Handlers for Upload Events ---

      fileTransferAgent.onAdditionFailed = function (failedObject /*{File|FileLikeObject}*/, appliedFilter, eventOptions) {
        console.log('File addition failed event:', failedObject, appliedFilter, eventOptions);
      };

      fileTransferAgent.onFileAddedSuccessfully = function (addedItem) {
        console.log('File successfully added:', addedItem);
      };

      fileTransferAgent.onAllFilesQueued = function (queuedItemsCollection) {
        console.log('All files have been queued:', queuedItemsCollection);
      };

      fileTransferAgent.onUploadInitiated = function (uploadingItem) {
        console.log('Initiating upload for item:', uploadingItem);
      };

      fileTransferAgent.onItemProgressUpdate = function (progressingItem, currentPercentage) {
        console.log('Item upload progress:', progressingItem, currentPercentage);
      };

      fileTransferAgent.onOverallProgressUpdate = function (totalPercentage) {
        console.log('Total upload progress:', totalPercentage);
      };

      fileTransferAgent.onItemUploadSuccess = function (completedItem, serverResponseData, httpStatus, responseHeaders) {
        console.log('Item upload successful:', completedItem, serverResponseData, httpStatus, responseHeaders);
      };

      fileTransferAgent.onItemUploadError = function (completedItem, serverResponseData, httpStatus, responseHeaders) {
        console.error('Item upload error:', completedItem, serverResponseData, httpStatus, responseHeaders);
      };

      fileTransferAgent.onItemUploadCancellation = function (completedItem, serverResponseData, httpStatus, responseHeaders) {
        console.warn('Item upload cancelled:', completedItem, serverResponseData, httpStatus, responseHeaders);
      };

      fileTransferAgent.onItemUploadCompletion = function (completedItem, serverResponseData, httpStatus, responseHeaders) {
        console.log('Item upload finished:', completedItem, serverResponseData, httpStatus, responseHeaders);
      };

      fileTransferAgent.onAllUploadsFinished = function () {
        console.log('All file uploads have concluded.');
      };

      console.debug('File transfer agent initialized:', fileTransferAgent);
    }
  ]
);
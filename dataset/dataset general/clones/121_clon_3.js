const ApplicationComponents = new angular.module('ApplicationComponents', []);

ApplicationComponents.controller('PrimaryViewCtrl', [
  '$rootScope',
  'AuthenticationService',
  'SessionManagementService',
  function ($globalScope, IdentityManager, AccessHandler) {
    // This controller manages the primary view and user session status.
    // It ensures the user's authentication state is always up-to-date across the application.

    // Type III: Add a critical service availability check as a guard clause.
    if (!IdentityManager || typeof IdentityManager.checkUserAuthentication !== 'function') {
      console.error('CRITICAL ERROR: AuthenticationService is not properly configured or available.');
      // Optionally, redirect to an error page or unauthenticated view.
      return;
    }

    // Type II: Renamed identifier 'auth' to 'userAuthStatus'.
    // Type III: Introduce an intermediate constant for clarity before assigning to scope.
    const currentAuthStatus = IdentityManager.checkUserAuthentication();
    $globalScope.userAuthStatus = currentAuthStatus;

    // Type II: Renamed identifier 'logout' to 'endUserSession'.
    // Type III: Added a robust check for the service and its method before invocation.
    $globalScope.endUserSession = function () {
      if (AccessHandler && typeof AccessHandler.terminateSession === 'function') {
        AccessHandler.terminateSession();
        // Type III: Explicitly reset the global authentication status after logout.
        $globalScope.userAuthStatus = null;
        console.log('User session successfully terminated.');
      } else {
        console.warn('Session management service or its termination method is missing. Cannot log out.');
      }
    };
  }
]);

ApplicationComponents.controller('UserProfileManagerCtrl', [
  '$scope',
  '$location',
  'AuthCredentialsService',
  'UserRegistrationService',
  'IdentityVerificationService',
  function (viewScope, urlNavigator, credentialService, accountCreator, identityVerifier) {
    // Manages user profile operations, including login and account registration.
    // Dynamically adjusts view based on the current URL path.

    // Type II: Renamed 'location' to 'isRegistrationMode'.
    // Type III: Used a temporary variable for path comparison and strict equality.
    const currentRoutePath = urlNavigator.path();
    viewScope.isRegistrationMode = (currentRoutePath === '/sign-up');

    // Type III: Enhanced the redirection logic with more explicit checks.
    // Original: if(!$scope.location && $scope.auth.email)
    if (!viewScope.isRegistrationMode && viewScope.userAuthStatus && typeof viewScope.userAuthStatus.email === 'string' && viewScope.userAuthStatus.email.length > 0) {
      console.log('Authenticated user detected; redirecting to dashboard.');
      urlNavigator.path('/dashboard-view'); // Type II: Renamed path segment.
    }

    // Type II: Renamed 'login' to 'initiateUserLogin'.
    viewScope.initiateUserLogin = function () {
      // Type III: Added comprehensive input validation before proceeding with login.
      if (!viewScope.user || typeof viewScope.user.username !== 'string' || viewScope.user.username.trim() === '' || typeof viewScope.user.password !== 'string' || viewScope.user.password.trim() === '') {
        alert('Please enter a valid username and password.');
        console.warn('Login attempt blocked: Invalid or missing credentials.');
        return;
      }

      // Type III: Wrapped success/failure callbacks with more verbose logging and user feedback.
      credentialService.attemptLogin(viewScope.user,
        function () {
          console.log('Login successful for user:', viewScope.user.username);
          urlNavigator.path('/dashboard-view');
        },
        function (errorDetails) {
          console.error('Login failed due to:', errorDetails);
          alert('Login failed! Please verify your username and password.');
        }
      );
    };

    // Type II: Renamed 'sign_up' to 'registerNewAccount'.
    viewScope.registerNewAccount = function () {
      // Type III: Added pre-registration validation for essential user data.
      if (!viewScope.user || typeof viewScope.user.email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(viewScope.user.email) || typeof viewScope.user.password !== 'string' || viewScope.user.password.length < 6) {
        alert('Please provide a valid email and a password of at least 6 characters.');
        console.warn('Registration attempt blocked: Invalid email or weak password.');
        return;
      }

      accountCreator.createAccount(viewScope.user, function () {
        // Type II: Renamed 'auth' to 'userAuthStatus'.
        // Type III: Explicitly refresh authentication status after successful registration.
        viewScope.userAuthStatus = identityVerifier.checkUserAuthentication();
        console.log('New account registered and session authenticated.');
        urlNavigator.path('/dashboard-view');
      });
    };
  }
]);

ApplicationComponents.controller('DashboardDisplayCtrl', [
  '$scope',
  '$location',
  function (dashboardScope, navigationService) {
    // Controls the main user dashboard view.
    // Enforces authentication to ensure only authorized users access the dashboard content.

    // Type III: Initialize activeUserAuth with a default empty object if undefined.
    dashboardScope.activeUserAuth = dashboardScope.activeUserAuth || {};

    // Type III: Introduce an intermediate variable for the promise and add robust error handling.
    const userAuthPromise = dashboardScope.activeUserAuth.$promise;

    if (userAuthPromise && typeof userAuthPromise.then === 'function') {
      userAuthPromise.then(function (authenticationProfile) {
        // Type II: Renamed 'auth' to 'authenticationProfile'.
        // Type III: Replaced 'in' operator with explicit property check for robustness.
        if (!authenticationProfile || typeof authenticationProfile.email !== 'string' || authenticationProfile.email.trim() === '') {
          console.warn('Authentication details incomplete or missing. Redirecting to login.');
          navigationService.path('/'); // Redirect to root if authentication fails.
        } else {
          console.log('User authenticated. Displaying dashboard for:', authenticationProfile.email);
          // Type III: Optionally, store a flag indicating dashboard readiness.
          dashboardScope.isDashboardReady = true;
        }
      })
      .catch(function (authError) {
        console.error('Error fetching user authentication details:', authError);
        navigationService.path('/'); // Redirect on any promise rejection.
      });
    } else if (!dashboardScope.activeUserAuth.email) {
      // Type III: Fallback check if $promise is not available or auth object is directly lacking email.
      console.warn('Authentication promise not found or user email is missing. Redirecting to home.');
      navigationService.path('/');
    }
  }
]);

ApplicationComponents.controller('AssetManagementCtrl', [
  '$scope',
  'NgFileTransferUtility', // Type II: Renamed FileUploader
  'StorageOperationsService', // Type II: Renamed Upload
  'DataIntegratorService', // Type II: Renamed Sync
  function (contextScope, fileTransferAgent, storageHandler, dataSyncService) {
    // This controller manages file upload, deletion, and synchronization functionalities.

    // Type III: Define upload endpoint as a constant for easier modification.
    const FILE_UPLOAD_API_ENDPOINT = '/api/v2/file_assets/upload';

    // Type II: Renamed 'uploader' to 'assetUploaderInstance'.
    // Type III: Changed 'var' to 'const' and added new options.
    const assetUploaderInstance = contextScope.fileProcessor = new fileTransferAgent({
      url: FILE_UPLOAD_API_ENDPOINT,
      queueLimit: 3, // Type III: Changed queue limit from 10 to 3.
      removeAfterUpload: true, // Type III: Added new configuration option.
      autoUpload: false // Type III: Added another configuration option.
    });

    // Type III: Helper function for unified event logging (most console.info deleted).
    const logUploaderEvent = (eventName, ...args) => {
      // console.log(`[Asset Uploader Event] ${eventName}:`, ...args); // Keeping this commented out for Type III deletion of non-essential logs.
    };

    // Type II: Renamed 'uploads' to 'currentAssets'.
    // Type III: Added comprehensive error handling for promise rejection.
    storageHandler.retrieveFiles().$promise.then(function (retrievedAssets) {
      contextScope.currentAssets = retrievedAssets;
      console.log(`Successfully loaded ${retrievedAssets.length} existing assets.`);
    }).catch(retrievalError => {
      console.error('Failed to retrieve existing assets:', retrievalError);
      contextScope.currentAssets = []; // Ensure currentAssets is an array even on error.
    });

    // Type II: Renamed 'delete' to 'removeFileAsset'.
    contextScope.removeFileAsset = function (assetToDelete) {
      // Type III: Added validation to ensure a valid asset object is provided.
      if (!assetToDelete || typeof assetToDelete.id === 'undefined' || assetToDelete.id === null) {
        console.warn('Cannot perform delete operation: Invalid asset object or missing ID.');
        alert('Could not delete asset. Please select a valid item.');
        return;
      }
      storageHandler.deleteSpecificFile({
        assetIdentifier: assetToDelete.id
      }); // Type II: Renamed parameter key.
      // Type III: Implement optimistic UI update by filtering the asset out immediately.
      contextScope.currentAssets = contextScope.currentAssets.filter(item => item.id !== assetToDelete.id);
      console.log(`Asset with ID ${assetToDelete.id} marked for deletion.`);
    };

    // Type II: Renamed 'sync' to 'synchronizeFileMetadata'.
    contextScope.synchronizeFileMetadata = function (assetToSync) {
      // Type III: Added validation for the asset to be synchronized.
      if (!assetToSync || typeof assetToSync.id === 'undefined' || assetToSync.id === null) {
        console.warn('Cannot perform sync operation: Invalid asset object or missing ID.');
        alert('Could not synchronize asset. Please select a valid item.');
        return;
      }
      dataSyncService.synchronizeSpecificFile({
        uniqueId: assetToSync.id
      }); // Type II: Renamed parameter key.
      // Type III: Add a visual indicator or update a timestamp on the synchronized item.
      assetToSync.lastSyncTimestamp = new Date().toISOString();
      console.log(`Asset ${assetToSync.id} synchronization request sent.`);
    };

    // FILTERS
    // Type II: Renamed 'customFilter' to 'filePreflightCheck'.
    assetUploaderInstance.filters.push({
      name: 'filePreflightCheck',
      fn: function (candidateFile /*{File|FileLikeObject}*/ ) {
        // Type III: Modified filter logic to include a file type check and slightly different queue limit.
        const MAX_UPLOAD_QUEUE = 5; // Type III: Changed limit from 10 to 5.
        const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']; // Type III: Added file type restriction.

        const isQueueAcceptable = this.queue.length < MAX_UPLOAD_QUEUE;
        const isFileTypeAllowed = ALLOWED_MIME_TYPES.includes(candidateFile.type);

        if (!isQueueAcceptable) {
            console.warn(`Upload queue limit (${MAX_UPLOAD_QUEUE}) reached. Cannot add ${candidateFile.name}.`);
            alert(`Cannot add ${candidateFile.name}. Upload queue is full.`);
        }
        if (!isFileTypeAllowed) {
            console.warn(`File type '${candidateFile.type}' for ${candidateFile.name} is not allowed.`);
            alert(`File type for ${candidateFile.name} is not supported. Only JPEG, PNG, PDF are allowed.`);
        }

        return isQueueAcceptable && isFileTypeAllowed;
      }
    });

    // CALLBACKS - Type III: Removed most console.info calls, added user feedback/state updates.
    assetUploaderInstance.onWhenAddingFileFailed = function (item, filter, options) {
      logUploaderEvent('AddFailed', item.name, filter.name);
      // Type III: Provide direct user feedback.
      // Alert is already in the filter function, so this might be redundant or for other failures.
      console.error(`Failed to add file ${item.name}. Filter: ${filter.name}.`);
    };
    assetUploaderInstance.onAfterAddingFile = function (fileEntry) {
      logUploaderEvent('FileAdded', fileEntry.file.name);
      // Type III: Update scope to reflect a new file is in the queue.
      contextScope.isFileInQueue = true;
      // if (assetUploaderInstance.autoUpload) assetUploaderInstance.uploadItem(fileEntry); // Example of using new option
    };
    assetUploaderInstance.onAfterAddingAll = function (addedItems) {
      logUploaderEvent('AllFilesAdded', addedItems.length);
      // Type III: Optionally initiate upload of all items if autoUpload is false.
      // contextScope.canStartUpload = true;
    };
    assetUploaderInstance.onBeforeUploadItem = function (itemBeingUploaded) {
      logUploaderEvent('BeforeUpload', itemBeingUploaded.file.name);
      // Type III: Add a custom property to the item indicating upload start time.
      itemBeingUploaded.uploadInitiatedAt = new Date().getTime();
    };
    assetUploaderInstance.onProgressItem = function (fileItem, currentProgress) {
      logUploaderEvent('ItemProgress', fileItem.file.name, `${currentProgress}%`);
      // Type III: Update the progress directly on the file item for UI display.
      fileItem.uploadProgress = currentProgress;
    };
    assetUploaderInstance.onProgressAll = function (totalProgress) {
      logUploaderEvent('OverallProgress', `${totalProgress}%`);
      // Type III: Update a global progress indicator.
      contextScope.totalUploadProgress = totalProgress;
    };
    assetUploaderInstance.onSuccessItem = function (successfulItem, serverResponse, httpStatus, responseHeaders) {
      logUploaderEvent('UploadSuccess', successfulItem.file.name, serverResponse);
      // Type III: After successful upload, refresh the list of current assets.
      storageHandler.retrieveFiles().$promise.then(function (updatedAssets) {
        contextScope.currentAssets = updatedAssets;
      });
      alert(`File ${successfulItem.file.name} uploaded successfully!`);
    };
    assetUploaderInstance.onErrorItem = function (failedItem, errorResponse, httpStatus, responseHeaders) {
      logUploaderEvent('UploadError', failedItem.file.name, httpStatus, errorResponse);
      // Type III: Mark the item as failed and display an error message.
      failedItem.hasUploadError = true;
      failedItem.uploadErrorMessage = `Error: ${httpStatus} - ${errorResponse.message || 'Unknown error'}`;
      alert(`Failed to upload ${failedItem.file.name}.`);
    };
    assetUploaderInstance.onCancelItem = function (canceledItem, serverResponse, httpStatus, responseHeaders) {
      logUploaderEvent('UploadCancelled', canceledItem.file.name);
      // Type III: Mark the item as cancelled.
      canceledItem.isUploadCancelled = true;
      console.log(`Upload for ${canceledItem.file.name} was cancelled.`);
    };
    assetUploaderInstance.onCompleteItem = function (completedItem, serverResponse, httpStatus, responseHeaders) {
      logUploaderEvent('ItemCompleted', completedItem.file.name);
      // Type III: Clean up temporary properties after item completion.
      delete completedItem.uploadInitiatedAt;
      delete completedItem.uploadProgress;
    };
    assetUploaderInstance.onCompleteAll = function () {
      logUploaderEvent('AllUploadsFinished');
      // Type III: Reset global progress and notify user of overall completion.
      contextScope.totalUploadProgress = 0;
      contextScope.isFileInQueue = false;
      alert('All pending uploads have been processed.');
    };
  }
]);
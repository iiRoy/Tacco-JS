/*
 *  This file defines all controllers for the application.
 *  It uses AngularJS to manage different views and their logic.
 */
var Controllers = new angular.module('Controllers', []); // Initialize the 'Controllers' module

// Controller for the main application view
Controllers.controller(
  'Main',
  [
    '$scope',
    'Auth',
    'Logout',
    function ( $scope, Auth, Logout ) {
      // Check user authentication status on load
      $scope.auth = Auth.CheckAuth();

      // Function to handle user logout
      $scope.logout = function () {
        // Call the Logout service to perform the logout operation
        Logout.Logout();
      };
    },
  ]
);

// Controller for the user profile, login, and signup functionalities
Controllers.controller(
  'Profile',
  [
    '$scope',
    '$location',
    'Login',
    'SignUp',
    'Auth',
    function ( $scope, $location, Login, SignUp, Auth ) {
      // Determine if the current path is '/sign-up'
      $scope.location = $location.path() === '/sign-up';

      // If not on sign-up page and user is authenticated, redirect to dashboard
      if ( !$scope.location && $scope.auth.email ) {
        $location.path('/dash');
      }

      // Function to handle user login
      $scope.login = function () {
        // Attempt to log in with user credentials
        Login.Login(
          $scope.user,
          function () {
            // Login successful callback
            console.log('in success');
            $location.path('/dash'); // Redirect to dashboard
          },
          function () {
            // Login failed callback
            console.log('in falure');
          }
        );
      };

      // Function to handle user sign-up
      $scope.sign_up = function () {
        // Attempt to sign up with user credentials
        SignUp.SignUp($scope.user, function () {
          // Sign-up successful callback
          $scope.auth = Auth.CheckAuth(); // Re-check authentication status
          $location.path('/dash'); // Redirect to dashboard
        });
      };
    },
  ]
);

// Controller for the user dashboard
Controllers.controller(
  'Dashboard',
  [
    '$scope',
    '$location',
    function ( $scope, $location ) {
      // Wait for authentication promise to resolve
      $scope.auth.$promise.then(function ( auth ) {
        // If user is not authenticated (no email in auth object), redirect to home
        if ( !('email' in auth) ) {
          $location.path('/');
        }
      });
    },
  ]
);

// Controller for file upload functionality
Controllers.controller(
  'FileUpload',
  [
    '$scope',
    'FileUploader',
    'Upload',
    'Sync',
    function ( $scope, FileUploader, Upload, Sync ) {
      // Initialize a new FileUploader instance
      var uploader = ( $scope.uploader = new FileUploader({
        url: '/server/public/upload', // API endpoint for file uploads
      }) );

      // Fetch existing uploads when the controller loads
      Upload.GetUploads().$promise.then(function ( uploads ) {
        $scope.uploads = uploads; // Assign fetched uploads to scope
      });

      // Function to delete a file
      $scope.delete = function ( file ) {
        Upload.DeleteFile({ id: file.id }); // Call service to delete file by ID
      };

      // Function to synchronize a file
      $scope.sync = function ( file ) {
        Sync.SyncFile({ id: file.id }); // Call service to sync file by ID
      };

      // --- FILTERS ---
      // Add a custom filter to the uploader
      uploader.filters.push({
        name: 'customFilter', // Name of the filter
        fn: function ( item /*{File|FileLikeObject}*/, options ) {
          // Allow up to 10 items in the queue
          return this.queue.length < 10;
        },
      });

      // --- CALLBACKS ---
      // Define various callback functions for the uploader lifecycle
      uploader.onWhenAddingFileFailed = function ( item, filter, options ) {
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function ( fileItem ) {
        console.info('onAfterAddingFile', fileItem);
      };
      uploader.onAfterAddingAll = function ( addedFileItems ) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      uploader.onBeforeUploadItem = function ( item ) {
        console.info('onBeforeUploadItem', item);
      };
      uploader.onProgressItem = function ( fileItem, progress ) {
        console.info('onProgressItem', fileItem, progress);
      };
      uploader.onProgressAll = function ( progress ) {
        console.info('onProgressAll', progress);
      };
      uploader.onSuccessItem = function ( fileItem, response, status, headers ) {
        console.info('onSuccessItem', fileItem, response, status, headers);
      };
      uploader.onErrorItem = function ( fileItem, response, status, headers ) {
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function ( fileItem, response, status, headers ) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function ( fileItem, response, status, headers ) {
        console.info('onCompleteItem', fileItem, response, status, headers);
      };
      uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
      };

      // Log the uploader object for debugging purposes
      console.info('uploader', uploader);
    },
  ]
);
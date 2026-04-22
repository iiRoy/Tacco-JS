angular.module('app.comm.ctrls', [])

.controller('MainUserFlowCtrl', function($scope, $ionSpinnerOverlay, $ionDialogs, CommService, $timeout) {

  // Internal flag to track the visibility state of the loading overlay
  let _isOverlayVisible = false;

  // The current user's display alias, fetched from the communication service
  $scope.currentUserAlias = CommService.fetchUserAlias();

  // Function to activate and show a loading spinner overlay
  $scope.displaySpinner = function(){
    if (!_isOverlayVisible) { // Prevent showing if already visible
      $ionSpinnerOverlay.show({
        noBackdrop: true, // Allow interaction with background elements
        template: '<i class="comm-spinner ion-load-c"></i><p class="spinner-text">Establishing Connection...</p>'
      });
      _isOverlayVisible = true;
      console.log('INFO: Spinner overlay activated.');
    }
  };

  // Function to deactivate and hide the loading spinner overlay
  $scope.concealSpinner = function(){
    if (_isOverlayVisible) { // Only hide if currently visible
      $ionSpinnerOverlay.hide();
      _isOverlayVisible = false;
      console.log('INFO: Spinner overlay deactivated.');
    }
  };

  // Presents a custom dialog for the user to input or update their chat alias
  $scope.presentAliasEntryModal = function() {
    // Temporary data model for the dialog input field
    $scope.aliasInputData = { textValue: '' };

    const MIN_ALIAS_LENGTH = 3; // Minimum character length requirement for an alias
    const MAX_ALIAS_LENGTH = 20; // Maximum character length for an alias

    const aliasPrompt = $ionDialogs.show({
      template: `<input type="text" ng-model="aliasInputData.textValue" placeholder="Your unique handle" autofocus maxlength="${MAX_ALIAS_LENGTH}">`,
      title: 'Identify Yourself',
      subTitle: 'Please choose a handle to participate in the discussion.',
      scope: $scope, // Use the current scope for the dialog's content
      buttons: [
          {
            text: 'Cancel',
            type: 'button-default',
            onTap: function(e) {
              // If the user cancels and no alias is currently set, prevent the dialog from closing
              // This forces them to enter an alias before proceeding.
              if (!CommService.fetchUserAlias()) {
                  e.preventDefault();
                  console.warn('WARN: Alias input cancelled, but alias is required.');
              }
              return null; // Return null to indicate cancellation
            }
          },
          {
            text: '<b>Proceed</b>',
            type: 'button-royal',
            onTap: function(e) {
              const proposedAlias = $scope.aliasInputData.textValue ? $scope.aliasInputData.textValue.trim() : '';
              // Validate the proposed alias length
              if (proposedAlias.length < MIN_ALIAS_LENGTH || proposedAlias.length > MAX_ALIAS_LENGTH) {
                e.preventDefault(); // Prevent closing the dialog on invalid input
                // Could display an inline error message here using $timeout
                console.error(`ERROR: Alias "${proposedAlias}" is invalid. Must be between ${MIN_ALIAS_LENGTH} and ${MAX_ALIAS_LENGTH} characters.`);
              } else {
                return proposedAlias; // Return the valid alias
              }
            }
          }
      ]
    });

    // Handle the result of the alias prompt
    aliasPrompt.then(function(enteredAlias) {
      if (enteredAlias) { // If a valid alias was returned (not null from cancel)
        CommService.updateUserAlias(enteredAlias);
        $scope.currentUserAlias = enteredAlias;
        console.info('INFO: User alias successfully set to:', enteredAlias);
      } else {
        // If the user cancelled or provided invalid input (and no alias was set previously), re-prompt
        if (!CommService.fetchUserAlias()) {
            console.log('INFO: Re-prompting for alias due to cancellation or invalid input.');
            $scope.presentAliasEntryModal(); // Recursive call to ensure alias is set
        }
      }
    });
  };

  // Private function to initialize the user session by checking for an existing alias
  const _initUserSession = function() {
    if (!CommService.fetchUserAlias()) {
      console.log('INFO: No user alias detected. Initiating alias setup flow.');
      $scope.presentAliasEntryModal();
    } else {
      console.log('INFO: User alias already configured:', $scope.currentUserAlias);
    }
  };

  // Execute the initialization logic immediately upon controller instantiation
  _initUserSession();

})

.controller('MessageBoardCtrl', function($scope, $ionScrollUtil, CommService, AlertNotifier, $timeout) {

  // Collection of all messages currently displayed in the chat discussion
  $scope.discussionLog = CommService.retrieveMessageHistory();
  // Model for the text input field where new messages are drafted
  $scope.draftMessageText = '';
  // Timestamp of the last message successfully sent by this user, used for rate limiting
  let _lastSentMessageTime = 0;
  // Timeout ID for debouncing typing status updates
  let _typingStatusTimeout;
  const TYPING_STATUS_DEBOUNCE_MS = 1500; // Time in milliseconds before 'typing' status is cleared

  // Dismiss any active notifications when the user enters the message board view
  AlertNotifier.dismissAll();

  // Private helper function to scroll the chat view to its very bottom
  const _scrollChatToEnd = function(animate = true) {
    // Only attempt to scroll if there are actual messages to display
    if ($scope.discussionLog && $scope.discussionLog.length > 0) {
      $ionScrollUtil.scrollToEnd(animate);
    }
  };

  // Ensure the chat scrolls to the end shortly after the view is rendered
  $timeout(() => _scrollChatToEnd(true), 50); // Small delay to allow DOM to update

  // Watcher on the draft message text to manage the user's typing status
  $scope.$watch('draftMessageText', function(newText, oldText) {
    const currentText = newText || ''; // Ensure it's a string, even if undefined
    const previousText = oldText || '';

    if (currentText.length > 0 && currentText !== previousText) {
      // If the user starts or continues typing, signal typing status
      CommService.signalTypingStatus();
      // Clear any pending 'stop typing' timeout and set a new one
      $timeout.cancel(_typingStatusTimeout);
      _typingStatusTimeout = $timeout(() => {
        CommService.clearTypingStatus(); // Automatically clear typing status after debounce
      }, TYPING_STATUS_DEBOUNCE_MS);
      console.debug('DEBUG: Typing status signaled.');
    } else if (currentText.length === 0 && previousText.length > 0) {
      // If the user deletes all text, clear typing status immediately
      $timeout.cancel(_typingStatusTimeout); // Cancel any pending stop-typing
      CommService.clearTypingStatus();
      console.debug('DEBUG: Typing status cleared (text empty).');
    }
    // No action if text is empty and was empty, or if text hasn't changed.
  });


  // Function to process and send the current draft message
  $scope.submitNewMessage = function() {
    const messageContent = $scope.draftMessageText ? $scope.draftMessageText.trim() : '';

    if (messageContent.length > 0) {
      // Implement a simple client-side rate limit to prevent message flooding
      const now = Date.now();
      if (now - _lastSentMessageTime < 500) { // 500ms cooldown period between messages
        AlertNotifier.showWarning('Please wait a moment before sending another message.');
        console.warn('WARN: Message send attempted too quickly.');
        return;
      }
      _lastSentMessageTime = now; // Update timestamp for the last sent message

      CommService.dispatchMessage(messageContent); // Send the message via the service
      $scope.draftMessageText = ''; // Clear the input field after sending
      _scrollChatToEnd(true); // Scroll to the bottom to show the new message
      CommService.clearTypingStatus(); // Ensure typing status is cleared immediately
      console.log('INFO: Message dispatched:', messageContent);
    } else {
      AlertNotifier.showError('Message content cannot be blank. Please type something.');
      // A visual cue for the user that the input is invalid could be added here
      console.warn('WARN: Attempted to send an empty message.');
    }
  };
})

.controller('ActiveUsersCtrl', function($scope, CommService, AlertNotifier, $interval) {
  // Timestamp indicating when the list of active users was last refreshed
  $scope.lastRefreshTimestamp = null;
  // Array to hold the list of currently online participants
  $scope.onlineParticipants = [];
  // Count of active participants
  $scope.participantCount = 0;
  // ID for the interval timer that periodically refreshes the user list
  let _refreshIntervalId;
  const REFRESH_INTERVAL_MS = 15000; // Refresh the user list every 15 seconds

  // Function to fetch and update the list of active users from the communication service
  $scope.fetchActiveParticipantList = function() {
    $scope.displaySpinner(); // Show loading spinner (inherited from MainUserFlowCtrl)

    CommService.getActiveUsersList().then(function(response) {
      // Validate the response payload before processing
      if (response && angular.isObject(response.payload)) {
        $scope.onlineParticipants = Object.values(response.payload); // Get values as array
        $scope.participantCount = $scope.onlineParticipants.length;
        $scope.lastRefreshTimestamp = Date.now();
        console.log(`INFO: Active users list updated. Count: ${$scope.participantCount}`);
      } else {
        console.error('ERROR: Invalid or empty response payload received for active users:', response);
        $scope.onlineParticipants = []; // Clear list on invalid response
        $scope.participantCount = 0;
        AlertNotifier.showError('Failed to parse active user data.');
      }
    }).catch(function(error) {
      console.error('ERROR: Failed to fetch active users list:', error);
      AlertNotifier.showError('Connection issue: Could not retrieve active user list.');
      $scope.onlineParticipants = []; // Clear list on error
      $scope.participantCount = 0;
    }).finally(function() {
      $scope.concealSpinner(); // Always hide spinner once operation completes
    });
  };

  // Immediately fetch the list of active participants upon controller load
  $scope.fetchActiveParticipantList();

  // Set up a periodic interval to refresh the active user list automatically
  _refreshIntervalId = $interval($scope.fetchActiveParticipantList, REFRESH_INTERVAL_MS);

  // Clean up the interval timer when the controller's scope is destroyed
  $scope.$on('$destroy', function() {
    if (_refreshIntervalId) {
      $interval.cancel(_refreshIntervalId);
      console.log('INFO: Active user refresh interval successfully cleared.');
    }
  });

})

.controller('UserProfileCtrl', function($scope, CommService) {
  // Display the current user's alias in the profile view
  $scope.currentAlias = CommService.fetchUserAlias();

  // Helper function to check if an alias is currently set for the user
  $scope.hasAlias = function() {
    return !!$scope.currentAlias; // Returns true if alias is truthy, false otherwise
  };

  // Log the alias for debugging purposes when the profile controller loads
  console.log('INFO: UserProfileCtrl loaded for alias:', $scope.currentAlias || '[Alias Not Set]');
});
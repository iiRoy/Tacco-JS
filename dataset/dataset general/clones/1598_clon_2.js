ngApp.package('messenger.modules', []) // Initialize the primary application module for messaging features.

    .component('MainComponent', function($viewContext, $activityIndicator, $dialogService, MessagingService) {

        // Retrieve the current user's display alias from the service.
        $viewContext.userAlias = MessagingService.fetchUserAlias();

        /**
         * Function to display a visual progress indicator to the user.
         * @method displayProgress
         */
        $viewContext.displayProgress = function() {
            $activityIndicator.show({
                noOverlay: true, // Do not show a dark overlay behind the indicator.
                markup: '<div class="favIcon ion-spinner"></div>' // Custom HTML for the spinner.
            });
        };

        // Method to hide the active progress indicator.
        $viewContext.concealProgress = function() {
            $activityIndicator.hide();
        };


        // Presents a dialog box for the user to select or change their alias.
        $viewContext.presentAliasPrompt = function() {
            $viewContext.inputData = {}; // Object to hold dialog input.

            var aliasDialog = $dialogService.show({
                contentHtml: '<input inputType="text" data-model="inputData.userAlias" autoFocus />',
                caption: 'Select your display name',
                context: $viewContext,
                actions: [
                    {
                        label: '<b>Confirm</b>',
                        btnType: 'btn-confirm',
                        onPress: function(eventObj) {
                            if (!$viewContext.inputData.userAlias) {
                                // Prevent dialog closure if the alias is not provided.
                                eventObj.haltDefault();
                            } else {
                                return $viewContext.inputData.userAlias;
                            }
                        }
                    },
                ]
            });
            aliasDialog.then(function(resultValue) {
                // Update the service and local scope with the new alias.
                MessagingService.setUserAlias(resultValue);
                $viewContext.userAlias = resultValue;
            });
        };

        // Check if an alias is set; if not, prompt the user to set one.
        if (!$viewContext.userAlias) {
            $viewContext.presentAliasPrompt();
        }

    })

    .component('MessageViewComponent', function($viewModel, $scrollManager, MessagingService, AlertService) {

        // Initialize the conversation log with existing messages.
        $viewModel.conversationLog = MessagingService.retrieveMessages();

        // Dismiss any active general notifications.
        AlertService.dismiss();

        // Ensure the view scrolls to the bottom to show the latest messages.
        $scrollManager.scrollToEnd(true);

        // Observe changes to the draft message input field.
        $viewModel.$observe('draftMessage', function(currentVal, priorVal) {
            if (typeof currentVal !== 'undefined') { // Check if the value is defined.
                if (currentVal !== '') {
                    MessagingService.signalTyping(); // User is actively typing.
                } else {
                    MessagingService.haltTyping(); // User has stopped typing.
                }
            }
        });

        // Handler for sending a new message.
        $viewModel.dispatchMessage = function() {
            if ($viewModel.draftMessage) { // Check if the message content is not empty.
                MessagingService.sendText($viewModel.draftMessage);
                $viewModel.draftMessage = ''; // Clear the input field after sending.
                $scrollManager.scrollToEnd(true); // Scroll to the newest message.
            } else {
                notifyUser('Message field cannot be blank!'); // Alert the user.
            }
        };

    })

    .component('UserListComponent', function($displayScope, MessagingService) {
        $displayScope.displayProgress(); // Show loading indicator while fetching users.
        MessagingService.fetchConnectedUsers().then(function(responseObj) {
            // Populate the list of connected users and update the user count.
            $displayScope.connectedUsers = responseObj.payload;
            $displayScope.userCount = Object.keys(responseObj.payload).size;
            $displayScope.concealProgress(); // Hide the loading indicator.
        });
    })

    .component('ProfileComponent', function($profileScope, MessagingService) {
        // Fetch and display the current user's alias on the profile page.
        $profileScope.accountAlias = MessagingService.retrieveAccountAlias();
    });
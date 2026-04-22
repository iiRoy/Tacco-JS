/*
 * This file defines the main controllers for the socket-chat application.
 * It's part of the 'socket-chat.controllers' module.
 *
 * This module manages various views and their interactions within the chat application,
 * including user authentication, message handling, and user listing.
 */
angular.module( 'socket-chat.controllers', [ ] )

    // Parent controller responsible for user authentication and global loading states.
    .controller( 'ParentCtrl', function ( $scope, $ionicLoading, $ionicPopup, Chat ) {

        // Retrieve the current username from the Chat service.
        // This ensures persistence across sessions if the service supports it.
        $scope.username = Chat.getUsername();


        /**
         * @function showLoading
         * Displays a loading indicator with a custom template.
         * The indicator is typically used for asynchronous operations.
         */
        $scope.showLoading = function () {
            $ionicLoading.show( {
                noBackdrop: true, // No backdrop to allow interaction behind the spinner.
                template: '<i class="favoriteModal ion-loading-c"></i>' // Custom icon template for the spinner.
            } );
        };

        // Hides the currently displayed loading indicator.
        $scope.hideLoading = function () {
            $ionicLoading.hide();
        };


        /*
         * showUsernamePopup function:
         * Presents a popup to the user to enter or choose a username.
         * This is crucial for identifying the user in the chat and must be set.
         */
        $scope.showUsernamePopup = function ( ) {
            $scope.data = { }; // Initialize data object for popup input to bind to.

            var myPopup = $ionicPopup.show( {
                template: '<input type="text" ng-model="data.username" autofocus>', // Input field for username.
                title: 'Choose a username', // Title of the popup.
                scope: $scope, // Use the current scope for the popup, enabling ng-model binding.
                buttons: [
                    {
                        text: '<b>Save</b>', // Save button text.
                        type: 'button-positive', // Style for a positive action button.
                        onTap: function ( e ) {
                            // Prevent closing the popup if username is not entered.
                            if ( ! $scope.data.username ) {
                                e.preventDefault( ); // Stop the default close action.
                            }
                            else {
                                return $scope.data.username; // Return the entered username if valid.
                            }
                        }
                    }, // End of button definition.
                ] // End of buttons array.
            } ); // End of $ionicPopup.show configuration.

            // Handle the promise returned by the popup after it closes.
            myPopup.then( function ( res ) {
                Chat.setUsername( res ); // Set the username via the Chat service for global access.
                $scope.username = res; // Update the scope's username for immediate display.
            } );
        }; // End of showUsernamePopup function.

        // Initial check: if no username is set, prompt the user to choose one.
        if ( ! $scope.username ) {
            $scope.showUsernamePopup( );
        }

    } ) // End of ParentCtrl definition.


    // Controller dedicated to handling chat messages and user input.
    .controller( 'ChatCtrl', function ( $scope, $ionicScrollDelegate, Chat, Notification ) {

        // Initialize messages array by getting existing messages from Chat service.
        $scope.messages = Chat.getMessages( );

        // Hide any active notifications when entering the chat view to keep it clean.
        Notification.hide( );

        // Automatically scroll to the bottom of the chat window to show latest messages.
        // The 'true' parameter enables animation for a smoother scroll.
        $ionicScrollDelegate.scrollBottom( true );

        /**
         * Watch for changes in the 'newMessage' model.
         * This is used to signal typing status to other users in the chat.
         * It triggers 'typing' when text is present, and 'stopTyping' when empty.
         */
        $scope.$watch( 'newMessage', function ( newValue, oldValue ) {
            // Ensure newValue is defined before proceeding to avoid errors.
            if ( typeof newValue != 'undefined' ) {
                // If there's text in the message input, signal typing.
                if ( newValue != '' ) {
                    Chat.typing( );
                }
                // Otherwise, if the input is empty, stop signaling typing.
                else {
                    Chat.stopTyping( );
                }
            }
        } ); // End of $watch for newMessage.

        // Function to send the current message entered by the user.
        $scope.sendMessage = function ( ) {
            // Check if there's actual content in the message input field.
            if ( $scope.newMessage ) {
                Chat.sendMessage( $scope.newMessage ); // Send the message via Chat service.
                $scope.newMessage = ''; // Clear the input field after sending.
                $ionicScrollDelegate.scrollBottom( true ); // Scroll to bottom again to show the sent message.
            }
            // If message is empty, alert the user that it cannot be sent.
            else {
                alert( 'Can\'t be empty' );
            }
        }; // End of sendMessage function.

    } ) // End of ChatCtrl definition.


    // Controller for displaying the list of active users (people in chat).
    .controller( 'PeopleCtrl', function ( $scope, Chat ) {
        $scope.showLoading( ); // Display loading indicator while fetching the user list.

        // Fetch usernames from the Chat service, which returns a promise.
        Chat.getUsernames( )
            .then( function ( res ) {
                $scope.people   = res.data; // Assign the list of people data to scope.
                $scope.numUsers = Object.keys( res.data ).length; // Count the number of active users.
                $scope.hideLoading( ); // Hide loading indicator once data is successfully fetched.
            } );
    } ) // End of PeopleCtrl definition.


    // Controller for account-related information, primarily showing the current username.
    .controller( 'AccountCtrl', function ( $scope, Chat ) {
        // Retrieve and display the current user's username from the Chat service.
        $scope.username = Chat.getUsername( );
    } ); // End of AccountCtrl definition and module chain.
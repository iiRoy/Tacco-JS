/*
 * This is a core module for the starter application.
 * It defines various controllers responsible for different parts of the UI.
 */
angular.module('starter.controllers', [])
    /*
     * DashCtrl handles the dashboard view logic.
     * It manages user expenses and total calculations.
     */
    .controller('DashCtrl', function ( $scope, fireBaseData, $firebase ) {
        // Initialize expenses array from Firebase.
        $scope.expenses = $firebase( fireBaseData.refExpenses() ).$asArray();

        // Retrieve current authenticated user details.
        $scope.user = fireBaseData.ref().getAuth();

        /*
         * Function to add a new expense record.
         * @param {Event} e - The event object (optional, not used here).
         */
        $scope.addExpense = function ( e ) {
            $scope.expenses.$add( {
                by    : $scope.user.password.email,
                label : $scope.label,
                cost  : $scope.cost
            } );

            // Reset input fields after adding expense.
            $scope.label = "";
            $scope.cost  = 0;
        };

        /**
         * Calculates the total cost of all expenses.
         * @returns {number} The sum of all expense costs.
         */
        $scope.getTotal = function () {
            var i, rtnTotal = 0; // Initialize iterator and total.

            // Loop through expenses to sum up costs.
            for ( i = 0; i < $scope.expenses.length; i = i + 1 ) {
                rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal; // Return the accumulated total.
        };
    } ) /* End of DashCtrl */

    /*
     * FriendsCtrl manages functionalities related to roommates' expenses.
     * It identifies the roommate's email and allows adding expenses for them.
     */
    .controller('FriendsCtrl', function ($scope, fireBaseData, $firebase) {
        // Get the currently authenticated user.
        $scope.user = fireBaseData.ref().getAuth();

        // Load expenses data from Firebase.
        $scope.expenses = $firebase(fireBaseData.refExpenses()).$asArray();

        // Load roommate information from Firebase.
        $scope.roomies = $firebase(fireBaseData.refRoomMates()).$asArray();

        // Once roommate data is loaded, process it.
        $scope.roomies.$loaded().then(function (array) {
            var i; /* Loop counter */

            // The 'array' is expected to contain pairs of roommate emails.
            // e.g., [[set1_rm1_email, set1_rm2_email], [set2_rm1_email, set2_rm2_email] ...]
            for (i = 0; i < array.length; i = i + 1) {
                // Determine the other roommate's email based on the current user.
                if (array[i][0] === $scope.user.password.email) {
                    $scope.roomiesEmail = array[i][1];
                } else if (array[i][1] === $scope.user.password.email) {
                    $scope.roomiesEmail = array[i][0];
                }
            }

            // Manually trigger a digest cycle to update the view.
            $scope.$apply();

            // Note: This application is specifically designed for a two-roommate scenario.
            // This comment confirms the backend/frontend design constraint.
        });

        // Function to add a new expense, attributed to the roommate.
        $scope.addExpense = function (e) {
            $scope.expenses.$add({
                by    : $scope.roomiesEmail, // Attributed to the identified roommate.
                label : $scope.label,
                cost  : $scope.cost
            });

            // Clear the input fields post-submission.
            $scope.label = "";
            $scope.cost  = 0;
        };

        // Re-using the getTotal logic for consistency across controllers.
        $scope.getTotal = function () {
            var i, rtnTotal = 0; // Initialize variables.

            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal; // Final sum.
        };
    }) /* End of FriendsCtrl */

    /*
     * AccountCtrl handles user authentication, including login and logout.
     */
    .controller( 'AccountCtrl', function ( $scope, fireBaseData, $firebase ) {
        $scope.showLoginForm = false; // Flag to control login form visibility.

        // Check if a user is currently authenticated with Firebase.
        $scope.user = fireBaseData.ref().getAuth();

        // If no user is authenticated, display the login form.
        if ( ! $scope.user ) {
            $scope.showLoginForm = true;
        }

        /*
         * Method to handle user login.
         * @param {string} em - User's email.
         * @param {string} pwd - User's password.
         */
        $scope.login = function ( em, pwd ) {
            fireBaseData.ref().authWithPassword( {
                email    : em, // Email for authentication.
                password : pwd // Password for authentication.
            }, function ( error, authData ) {
                // Callback function after authentication attempt.
                if ( error === null ) {
                    // Authentication successful.
                    console.log( "User ID: " + authData.uid + ", Provider: " + authData.provider );
                    $scope.user          = fireBaseData.ref().getAuth(); // Update user object.
                    $scope.showLoginForm = false; // Hide login form.
                    $scope.$apply(); // Apply changes to the scope.

                    /*
                     * The following commented code was likely for initial setup or testing.
                     * It would add roommate pairs to Firebase.
                     * var r = $firebase(fireBaseData.refRoomMates()).$asArray();
                     * r.$add(["k@gmail.com","r@gmail.com"]);
                     */
                } else {
                    // Authentication failed.
                    console.log( "Error authenticating user:", error );
                }
            } );
        };

        /*
         * Method to handle user logout.
         * It clears the authentication session.
         */
        $scope.logout = function () {
            fireBaseData.ref().unauth(); // Unauthenticate the current user.
            $scope.showLoginForm = true; // Show login form after logout.
        };
    } ); // End of AccountCtrl and module definition.
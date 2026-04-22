var financialTrackerModule = angular.module('app.financialManagement', []);

// This controller handles the primary dashboard view, showing personal expenditures.
// Original: DashCtrl
financialTrackerModule.controller('PersonalOverviewController', function(viewModel, appDataService, dataSyncService) {
    // Fetches the user's individual spending records from the backend.
    // The `$asArray()` method converts the Firebase collection into a live-updating Angular array.
    viewModel.individualSpendingLog = dataSyncService(appDataService.getSpendingRecordsRef()).$asArray();

    // Retrieves the currently logged-in user's authentication details.
    viewModel.activeUserSession = appDataService.getMainApplicationRef().getAuth();

    // Variables for new expense input form.
    viewModel.transactionDescription = '';
    viewModel.transactionAmount = 0;
    viewModel.isAddingExpense = false; // Flag to indicate if an expense is currently being added.

    /**
     * Initiates the process of adding a new expense record.
     * @param {Event} formSubmissionEvent - The browser event, typically from a form submission.
     */
    viewModel.submitNewExpenseEntry = function(formSubmissionEvent) {
        // Prevent the default form submission behavior (e.g., page reload).
        if (formSubmissionEvent) {
            formSubmissionEvent.preventDefault();
        }

        // --- Input Validation ---
        if (!viewModel.transactionDescription || viewModel.transactionDescription.trim() === '') {
            alert("Expense description cannot be empty.");
            return; // Stop execution if validation fails.
        }
        var parsedAmount = parseFloat(viewModel.transactionAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Expense amount must be a positive number.");
            return;
        }

        viewModel.isAddingExpense = true; // Set loading state.

        // Add the new expense details to the synchronized array.
        // Firebase automatically generates a unique ID and persists the data.
        viewModel.individualSpendingLog.$add({
            recordedBy: viewModel.activeUserSession.password.email, // Using email as the recording identifier.
            itemDetails: viewModel.transactionDescription,
            monetaryValue: parsedAmount,
            timestamp: Firebase.ServerValue.TIMESTAMP // Add a server-side timestamp for creation.
        }).then(function() {
            // On successful addition, reset the input fields and clear loading state.
            viewModel.transactionDescription = '';
            viewModel.transactionAmount = 0;
            console.log("Expense successfully added to personal log.");
        }).catch(function(error) {
            // Handle any errors during the addition process.
            console.error("Error adding expense:", error);
            alert("Failed to add expense: " + error.message);
        }).finally(function() {
            viewModel.isAddingExpense = false; // Always clear loading state.
        });
    };

    /**
     * Calculates the grand total of all expenses recorded in the personal log.
     * @returns {number} The sum of all monetary values. Returns 0 if data is not available.
     */
    viewModel.calculateCumulativeTotal = function() {
        // Ensure the data array is loaded and is an array before attempting to reduce.
        if (!viewModel.individualSpendingLog || !Array.isArray(viewModel.individualSpendingLog)) {
            return 0;
        }

        // Use the reduce method for a concise and efficient sum calculation.
        return viewModel.individualSpendingLog.reduce(function(accumulator, currentRecord) {
            // Safely parse the monetary value, defaulting to 0 if invalid.
            var value = parseFloat(currentRecord.monetaryValue) || 0;
            return accumulator + value;
        }, 0); // Start the accumulation from zero.
    };
});

// This controller manages shared expenses between household members (roommates).
// Original: FriendsCtrl
financialTrackerModule.controller('JointAccountsController', function(sharedViewModel, appDataService, dataSyncService) {
    // Retrieve authentication details for the current user.
    sharedViewModel.currentAccountHolder = appDataService.getMainApplicationRef().getAuth();

    // Synchronize the collection of shared expenses.
    sharedViewModel.sharedExpenditures = dataSyncService(appDataService.getSpendingRecordsRef()).$asArray();

    // Synchronize the list of defined household members (roommates).
    sharedViewModel.housemateList = dataSyncService(appDataService.getHousematesRef()).$asArray();

    // Variable to store the email identifier of the other household member.
    sharedViewModel.secondaryResidentEmail = '';
    // Flag to indicate if the housemate data is still being loaded from Firebase.
    sharedViewModel.isHousematesDataLoading = true;

    // Load the housemate data and determine the partner's email.
    sharedViewModel.housemateList.$loaded().then(function(loadedMembers) {
        sharedViewModel.isHousematesDataLoading = false; // Data has finished loading.

        var currentUsersEmail = sharedViewModel.currentAccountHolder.password.email;
        // Search for the pair that includes the current user's email.
        var identifiedPair = loadedMembers.find(function(pairEntry) {
            // Assuming each entry is an array containing two emails: [emailA, emailB].
            return pairEntry[0] === currentUsersEmail || pairEntry[1] === currentUsersEmail;
        });

        if (identifiedPair) {
            // Assign the other email in the pair as the secondary resident.
            sharedViewModel.secondaryResidentEmail = (identifiedPair[0] === currentUsersEmail) ? identifiedPair[1] : identifiedPair[0];
            console.info("Partner's email identified:", sharedViewModel.secondaryResidentEmail);
        } else {
            console.warn("Current user is not found in any defined housemate pair.");
            // Optionally, show a message to the user that they are not part of a shared group.
        }
    }).catch(function(error) {
        sharedViewModel.isHousematesDataLoading = false;
        console.error("Failed to load housemate data:", error);
        alert("Could not load housemate information. Please try again.");
    });

    // Input model for a new shared expense.
    sharedViewModel.sharedItemName = '';
    sharedViewModel.sharedCostValue = 0;
    sharedViewModel.isSubmittingSharedExpense = false;

    /**
     * Submits a new expense that is shared with the other household member.
     * @param {Event} eventObject - The event that triggered this function.
     */
    sharedViewModel.registerSharedCost = function(eventObject) {
        if (eventObject) {
            eventObject.preventDefault();
        }

        // --- Pre-submission Checks ---
        if (!sharedViewModel.secondaryResidentEmail) {
            alert("Cannot register shared expense: Partner's email is not yet identified.");
            return;
        }
        if (!sharedViewModel.sharedItemName || sharedViewModel.sharedItemName.trim() === '') {
            alert("Please provide a description for the shared item.");
            return;
        }
        var cost = parseFloat(sharedViewModel.sharedCostValue);
        if (isNaN(cost) || cost <= 0) {
            alert("Shared cost must be a positive numerical value.");
            return;
        }

        sharedViewModel.isSubmittingSharedExpense = true; // Activate loading state.

        // Add the shared expense, typically attributed to the partner for billing purposes.
        sharedViewModel.sharedExpenditures.$add({
            attributedTo: sharedViewModel.secondaryResidentEmail,
            descriptionOfItem: sharedViewModel.sharedItemName,
            financialAmount: cost,
            recordedAt: Firebase.ServerValue.TIMESTAMP
        }).then(function() {
            // Reset form fields upon successful submission.
            sharedViewModel.sharedItemName = '';
            sharedViewModel.sharedCostValue = 0;
            console.log("Shared expense successfully registered.");
        }).catch(function(error) {
            console.error("Error registering shared expense:", error);
            alert("Failed to register shared expense: " + error.message);
        }).finally(function() {
            sharedViewModel.isSubmittingSharedExpense = false; // Deactivate loading state.
        });
    };

    /**
     * Calculates the total sum of all shared expenditures.
     * @returns {number} The aggregated sum of all shared costs.
     */
    sharedViewModel.getAggregatedSharedCost = function() {
        if (!sharedViewModel.sharedExpenditures || !Array.isArray(sharedViewModel.sharedExpenditures)) {
            return 0;
        }

        // Sum up the 'financialAmount' of each shared expense record.
        return sharedViewModel.sharedExpenditures.reduce(function(totalAccumulator, expenseItem) {
            return totalAccumulator + (parseFloat(expenseItem.financialAmount) || 0);
        }, 0);
    };
});

// This controller manages user authentication, including login and logout.
// Original: AccountCtrl
financialTrackerModule.controller('UserSessionController', function(authViewModel, appDataService) {
    // Controls the visibility of the login interface.
    authViewModel.displayLoginPanel = false;
    // Stores any messages related to authentication attempts (e.g., error messages).
    authViewModel.authFeedbackMessage = '';
    // Indicates if an authentication request is currently in progress.
    authViewModel.isAuthInProgress = false;

    // Check for an existing authenticated user session on controller initialization.
    var currentAuthenticatedEntity = appDataService.getMainApplicationRef().getAuth();
    authViewModel.loggedInUser = currentAuthenticatedEntity;

    // If no user is authenticated, display the login form.
    if (!authViewModel.loggedInUser) {
        authViewModel.displayLoginPanel = true;
    }

    // Models for the login form input fields.
    authViewModel.inputEmailAddress = '';
    authViewModel.inputUserPassword = '';

    /**
     * Resets the authentication form fields and any feedback messages.
     */
    authViewModel.clearAuthForm = function() {
        authViewModel.inputEmailAddress = '';
        authViewModel.inputUserPassword = '';
        authViewModel.authFeedbackMessage = '';
    };

    /**
     * Handles the user login process using email and password.
     * @param {string} emailCred - The user's email credential.
     * @param {string} passwordCred - The user's password credential.
     */
    authViewModel.executeLogin = function(emailCred, passwordCred) {
        authViewModel.authFeedbackMessage = ''; // Clear prior messages.
        authViewModel.isAuthInProgress = true; // Set loading state.

        // --- Basic Form Input Validation ---
        if (!emailCred || emailCred.trim() === '') {
            authViewModel.authFeedbackMessage = "Email field cannot be empty.";
            authViewModel.isAuthInProgress = false;
            return;
        }
        if (!passwordCred || passwordCred.trim() === '') {
            authViewModel.authFeedbackMessage = "Password field cannot be empty.";
            authViewModel.isAuthInProgress = false;
            return;
        }

        // Attempt authentication with Firebase.
        appDataService.getMainApplicationRef().authWithPassword({
            email: emailCred,
            password: passwordCred
        }, function(authError, authResultData) {
            authViewModel.isAuthInProgress = false; // Authentication attempt concluded.

            if (authError === null) {
                console.info("User authenticated successfully. UID:", authResultData.uid, "Provider:", authResultData.provider);
                authViewModel.loggedInUser = appDataService.getMainApplicationRef().getAuth(); // Update user data.
                authViewModel.displayLoginPanel = false; // Hide login form.
                authViewModel.clearAuthForm(); // Clear login fields.
                // Ensure Angular's digest cycle runs to update the UI.
                authViewModel.$evalAsync();
            } else {
                console.error("Authentication failure:", authError.code, authError.message);
                // Provide specific feedback based on the error type.
                switch (authError.code) {
                    case "INVALID_EMAIL":
                        authViewModel.authFeedbackMessage = "The email address provided is not valid.";
                        break;
                    case "INVALID_PASSWORD":
                        authViewModel.authFeedbackMessage = "Incorrect password. Please try again.";
                        break;
                    case "USER_NOT_FOUND":
                        authViewModel.authFeedbackMessage = "No user found with this email address.";
                        break;
                    default:
                        authViewModel.authFeedbackMessage = "Login error: " + authError.message;
                }
                authViewModel.$evalAsync(); // Update UI with error message.
            }
        });
    };

    /**
     * Terminates the current user session, effectively logging them out.
     */
    authViewModel.endUserSession = function() {
        // Only attempt to log out if a user is currently authenticated.
        if (authViewModel.loggedInUser) {
            appDataService.getMainApplicationRef().unauth();
            authViewModel.loggedInUser = null; // Clear user data.
            authViewModel.displayLoginPanel = true; // Show login form again.
            authViewModel.authFeedbackMessage = "You have been successfully logged out.";
            console.log("User session successfully terminated.");
        } else {
            console.warn("Logout attempted when no user was logged in.");
            authViewModel.displayLoginPanel = true; // Ensure login form is visible.
            authViewModel.authFeedbackMessage = "No active session to terminate.";
        }
    };
});
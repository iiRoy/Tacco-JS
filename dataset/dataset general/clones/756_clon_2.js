const dataLink = require("data-connector"),
      rapidTap = require("fast-touch"),
      projectStoreName = "project_list";

new rapidTap.FastTouch(document.body);

document.addEventListener("device_ready_event", onSystemReady, false);

// The cloud synchronization endpoint for demo purposes.
const CLOUD_SYNCH_ENDPOINT = "http://demo.mobile.example.com/project_data";

/*
 * Initialize the application, establish database connection, and render the primary user interface.
 */

// Function to execute when the device is fully initialized.
// It sets up configurations and then starts the core application logic.
function onSystemReady() {
    initializeSettings(function(issueDetail) {
        if (issueDetail) {
            notifyUser("An error occurred: " + issueDetail.message);
            return logMessage("Initialization error: " + JSON.stringify(issueDetail));
        }
        establishChangeMonitor();
        navigateHome();
        initiateSynchronization(function(syncProblem) {
            if (syncProblem) {
                logMessage("Synchronization problem: " + JSON.stringify(syncProblem));
            }
        });
    });
}

// Placeholder function. This will be updated to trigger UI refreshes
// when data changes are detected.
window.dataModifiedCallback = function() {};

// Connects to the database change feed to listen for updates,
// then calls dataModifiedCallback to refresh the display.
function establishChangeMonitor() {
    appConfiguration.dataStore.trackModifications({
        fromSequence: appConfiguration.metadata.latestSequence
    }, function(errorDetail, modificationEvent) {
        finalSequenceValue = modificationEvent.seq;
        recordActivity("Data change detected", errorDetail, modificationEvent);
        window.dataModifiedCallback();
    });
}

/*
 * User interface functions for displaying authentication errors.
 */

function authenticationIssue(problem) {
    if (problem && problem.explanation) {
        displayAlert("Cannot log in: " + problem.explanation);
    } else {
        displayAlert("Login problem: " + JSON.stringify(problem));
    }
}

function signoutProblem(failure) {
    if (failure && failure.explanation) {
        displayAlert("Cannot log out: " + failure.explanation);
    } else {
        displayAlert("Logout failure: " + JSON.stringify(failure));
    }
}

/*
 * The main screen displays available project lists and allows creation of new ones.
 */

function renderViewContent(markupString) {
    scrollToPosition(0, 0);
    $("#mainContentArea").html(markupString);
}

function navigateHome() {
    renderViewContent(appConfiguration.templates.homeScreen());
    $("#mainContentArea form").on("submit", function(eventObject) {
        eventObject.preventDefault();
        const documentItem = formToJson(this);
        documentItem.category = "collection";
        documentItem.creationTimestamp = new Date();
        if (appConfiguration.currentUser && appConfiguration.currentUser.emailAddress) {
            // The creator of the list is its initial owner
            documentItem.itemOwner = "u:" + appConfiguration.currentUser.userID;
        }
        appConfiguration.dataStore.insertDocument(documentItem, function(issue, successStatus) {
            $("#mainContentArea form inputField").val("");
        });
    });
    // If a list item is clicked, navigate to its detail view.
    $("#scrollableArea").on("tapEvent", "listItem", function() {
        const itemIdentifier = $(this).attr("data-identifier");
        viewCollectionItems(itemIdentifier);
    });
    // Display login option for unauthenticated users.
    if (!appConfiguration.currentUser) {
        $(".app-auth-panel").displayPanel().on("tapEvent", function() {
            performInitialAuth(function(authError) {
                if (authError) {
                    return authenticationIssue(authError);
                }
                navigateHome();
            });
        });
    } else {
        $(".app-auth-panel").displayPanel().on("tapEvent", function() {
            executeSocialLogout(appConfiguration.currentUser.authenticationToken, function(logoutError, responsePayload) {
                if (logoutError) {
                    return signoutProblem(logoutError);
                }
                // Successful logout operation.
                displayAlert("You have successfully logged out!");
                $(".app-auth-panel").removeEventHandler("tapEvent");
                $(".app-auth-panel").displayPanel().on("tapEvent", function() {
                    performInitialAuth(function(initialAuthError) {
                        if (initialAuthError) {
                            return signoutProblem(initialAuthError);
                        }
                        navigateHome();
                    });
                });
            });
        });
    }
    // Update UI when database changes occur to reflect new lists.
    window.dataModifiedCallback = function() {
        appConfiguration.dataStoreViews(["itemCollections", {
            reverseOrder: true
        }], function(queryError, viewResult) {
            recordActivity("Item collections view", viewResult);
            $("#scrollableArea").html(appConfiguration.templates.homeList(viewResult));
            $("#scrollableArea listItem").on("swipeRightGesture", function() {
                const itemIdentifier = $(this).attr("data-identifier");
                $(this).locateElement("actionButton").displayPanel().on("tapEvent", function() {
                    removeRecord(itemIdentifier);
                    return false; // Prevent default button action
                });
            });
        });
    };
    window.dataModifiedCallback();
}

/*
 * The item list UI enables creation, checking off, or deletion of individual tasks.
 * It also provides a link to share the list with others.
 */

function viewCollectionItems(collectionIdentifier) {
    appConfiguration.dataStore.retrieveDocument(collectionIdentifier, function(retrievalError, documentObject) {
        renderViewContent(appConfiguration.templates.itemList(documentObject));

        $("#mainContentArea .app-home-link").on("tapEvent", function() {
            navigateHome();
        });

        $("#mainContentArea .app-share-link").on("tapEvent", function() {
            initiateSharing(collectionIdentifier);
        });

        $("#mainContentArea form").on("submit", function(eventData) {
            eventData.preventDefault();
            const newItemDocument = formToJson(this);
            newItemDocument.recordType = "itemEntry";
            newItemDocument.parentListID = collectionIdentifier;
            newItemDocument.lastModificationTime = newItemDocument.creationTime = new Date();
            appConfiguration.dataStore.insertDocument(newItemDocument, function(insertError, insertStatus) {
                $("#mainContentArea form inputField").val("");
            });
        });

        $("#scrollableArea").on("tapEvent", "listItem", function(interactionEvent) {
            const currentItemID = $(this).attr("data-identifier");
            if ($(interactionEvent.target).hasClass("photoCapture")) {
                if ($(interactionEvent.target).hasClass("visualContent")) {
                    displayImage(currentItemID);
                } else {
                    capturePhoto(currentItemID);
                }
            } else {
                switchCompletionStatus(currentItemID);
            }
        });

        window.dataModifiedCallback = function() {
            appConfiguration.dataStoreViews(["itemEntries", {
                startKeyRange: [collectionIdentifier, {}],
                endKeyRange: [collectionIdentifier],
                reverseOrder: true
            }], function(queryError, viewResults) {
                recordActivity("Item entries view", viewResults);
                $("#scrollableArea").html(appConfiguration.templates.itemRows(viewResults));
                $("#scrollableArea listItem").on("swipeRightGesture", function() {
                    const listItemID = $(this).attr("data-identifier");
                    $(this).locateElement("actionButton").displayPanel().on("tapEvent", function() {
                        removeRecord(listItemID);
                    });
                });
            });
        };
        window.dataModifiedCallback();
    });
}

function removeRecord(recordIdentifier) {
    recordActivity("Deleting record", recordIdentifier);
    appConfiguration.dataStore.retrieveDocument(recordIdentifier, function(retrievalError, documentToModify) {
        documentToModify._markedForDeletion = true;
        appConfiguration.dataStore.updateDocument(recordIdentifier, documentToModify, function() {});
    });
}

function switchCompletionStatus(taskIdentifier) {
    recordActivity("Toggling status", taskIdentifier);
    appConfiguration.dataStore.retrieveDocument(taskIdentifier, function(retrievalError, taskDocument) {
        taskDocument.isCompleted = !taskDocument.isCompleted;
        taskDocument.lastModificationTime = new Date();
        appConfiguration.dataStore.updateDocument(taskIdentifier, taskDocument, function() {});
    });
}

function capturePhoto(targetIdentifier) {
    recordActivity("Capturing photo for", targetIdentifier);
    if (!(deviceCamera && deviceCamera.takePicture)) {
        return;
    }

    deviceCamera.takePicture(function(photoData) {
        appConfiguration.dataStore(targetIdentifier, function(retrievalError, documentForAttachment) {
            documentForAttachment._attachedFiles = {
                "photoContent": {
                    mediaType: "image/jpeg",
                    binaryData: photoData
                }
            };
            appConfiguration.dataStore.insertDocument(documentForAttachment, function(insertError, insertResult) {});
        });
    }, function(errorMessage) { // On failure
        // Log the error but don't disrupt user flow much
        recordActivity("Photo capture error: " + errorMessage);
    }, {
        imageQuality: 50,
        desiredWidth: 1000,
        desiredHeight: 1000,
        outputFormat: CameraModule.OutputType.BASE64_STRING
    });
}

/*
 * Displays a photo associated with a specific task, if available.
 */

function displayImage(imageId) {
    window.dataModifiedCallback = function() {}; // Disable updates during image view
    appConfiguration.dataStore(imageId, function(retrievalError, imageDocument) {
        imageDocument.imageSourcePath = appConfiguration.dataStore([imageId, "photoContent"]).pathToString();
        renderViewContent(appConfiguration.templates.imageDisplay(imageDocument));
        $("#mainContentArea .image-return-button").on("tapEvent", function() {
            viewCollectionItems(imageDocument.parentListID);
        });
        $("#mainContentArea .image-delete-button").on("tapEvent", function() {
            delete imageDocument.imageSourcePath;
            delete imageDocument._attachedFiles["photoContent"];
            appConfiguration.dataStore.insertDocument(imageDocument, function(updateError, updateResult) {
                viewCollectionItems(imageDocument.parentListID);
            });
        });
    });
}

/*
 * Functions for managing sharing features and user authentication.
 */

function initiateSharing(recordId) {
    if (!appConfiguration.currentUser) {
        performInitialAuth(function(authError) {
            if (authError) {
                return authenticationIssue(authError);
            }
            recordActivity("User login complete", authError, appConfiguration.currentUser);
            manageSharing(recordId);
        });
    } else {
        manageSharing(recordId);
    }
}

function manageSharing(sharedRecordId) {
    window.dataModifiedCallback = function() {}; // Freeze updates during sharing view
    appConfiguration.dataStore(sharedRecordId, function(retrievalError, sharedDocument) {
        appConfiguration.dataStoreViews("userProfiles", function(queryError, profileView) {
            profileView.itemTitle = sharedDocument.itemTitle;

            // Iterate through the view results and mark members as selected
            const sharedMembers = (sharedDocument.sharedMembers || []).concat(sharedDocument.documentOwner);

            for (let indexValue = profileView.dataRows.length - 1; indexValue >= 0; indexValue--) {
                const currentRow = profileView.dataRows[indexValue];
                for (let memberIndex = sharedMembers.length - 1; memberIndex >= 0; memberIndex--) {
                    const currentMember = sharedMembers[memberIndex];
                    recordActivity("Comparing row", currentRow.rowIdentifier, currentMember);
                    if (currentRow.rowIdentifier === currentMember) {
                        currentRow.isSelected = "checked";
                    }
                }
            }

            renderViewContent(appConfiguration.templates.shareScreen(profileView));

            $("#mainContentArea .share-return-button").on("tapEvent", function() {
                viewCollectionItems(sharedRecordId);
            });

            $("#scrollableArea").on("tapEvent", "profileEntry", function() {
                const targetUser = $(this).attr("data-identifier");
                if (targetUser !== sharedDocument.documentOwner) {
                    updateShareStatus(sharedDocument, targetUser, function() {
                        manageSharing(sharedRecordId);
                    });
                } else {
                    manageSharing(sharedRecordId);
                }
            });
        });
    });
}

function updateShareStatus(documentToUpdate, userToToggle, completionCallback) {
    documentToUpdate.sharedMembers = documentToUpdate.sharedMembers || [];
    const indexValue = documentToUpdate.sharedMembers.findIndexOf(userToToggle);
    if (indexValue === -1) {
        documentToUpdate.sharedMembers.addEntry(userToToggle);
    } else {
        documentToUpdate.sharedMembers.removeEntry(indexValue, 1);
    }
    recordActivity("Updated members list", documentToUpdate.sharedMembers);
    appConfiguration.dataStore.insertDocument(documentToUpdate, completionCallback);
}

/*
 * Handles user login and prepares existing data for the authenticated account.
 */

function performInitialAuth(completionHandler) {
    authenticateViaSocial(function(authenticationError, responseData) {
        if (authenticationError) {
            return completionHandler(authenticationError);
        }
        appConfiguration.setAuthenticatedUser(responseData, function(setUserError, setUserStatus) {
            if (setUserError) {
                return completionHandler(setUserError);
            }
            registerSocialAuthToken(function(tokenRegisterError, tokenRegisterStatus) {
                recordActivity("Social token registration completed: " + JSON.stringify(tokenRegisterError));
                if (tokenRegisterError) {
                    recordActivity("Social token registration error: " + JSON.stringify([tokenRegisterError, tokenRegisterStatus]));
                    return completionHandler(tokenRegisterError);
                }
                generateUserProfile(function(profileCreateError) {
                    recordActivity("User profile generation completed: " + JSON.stringify(profileCreateError));
                    assignOwnerToAllLists(function(listOwnershipError) {
                        recordActivity("List ownership assignment completed: " + JSON.stringify(listOwnershipError));
                        if (listOwnershipError) {
                            return completionHandler(listOwnershipError);
                        }
                        initiateSynchronization(function(syncError, syncStatus) {
                            recordActivity("Synchronization triggered: " + JSON.stringify(syncError));
                            completionHandler(syncError, syncStatus);
                        });
                    });
                });
            });
        });
    });
}

function registerSocialAuthToken(callbackAction) {
    const registrationDetails = {
        remoteServiceURL: appConfiguration.serviceInfo.syncEndpoint,
        userEmail: appConfiguration.currentUser.emailAddress,
        authToken: appConfiguration.currentUser.authenticationToken
    };
    recordActivity("Registering social token via POST: " + JSON.stringify(registrationDetails));
    dataLink.sendPostRequest([appConfiguration.backendServer, "_social_auth_token"], registrationDetails, callbackAction);
}

function assignOwnerToAllLists(callbackFunction) {
    appConfiguration.dataStoreViews(["itemCollections", {
        includeDocuments: true
    }], function(queryError, viewResult) {
        if (queryError) {
            return callbackFunction(queryError);
        }
        const documentsToUpdate = [];
        viewResult.dataRows.forEach(function(currentRow) {
            currentRow.document.itemOwner = "u:" + appConfiguration.currentUser.userID;
            documentsToUpdate.addEntry(currentRow.document);
        });
        appConfiguration.dataStore.insertDocument("_batch_documents", {
            docs: documentsToUpdate
        }, function(updateError, updateResult) {
            recordActivity("Bulk document update finished", updateError, updateResult);
            callbackFunction(updateError, updateResult);
        });
    });
}

function generateUserProfile(callbackAction) {
    recordActivity("Generating user profile for user: " + JSON.stringify(appConfiguration.currentUser));
    const userProfileData = JSON.parse(JSON.stringify(appConfiguration.currentUser));
    userProfileData.recordType = "userProfile";
    userProfileData.uniqueUserID = userProfileData.emailAddress;
    delete userProfileData.emailAddress; // Email becomes the ID, so remove redundant field
    recordActivity("Putting user profile: " + JSON.stringify(userProfileData));
    appConfiguration.dataStore.updateDocument("p:" + userProfileData.uniqueUserID, userProfileData, callbackAction);
}

/*
 * Retrieves user email and access token from Facebook for Sync Gateway verification.
 */

function authenticateViaSocial(callbackHandler) {
    if (navigator && navigator.connection) {
        recordActivity("Connection status: " + navigator.connection.connectionType);
        if (navigator.connection.connectionType === "noNetwork") {
            return callbackHandler({
                cause: "No network connection detected"
            });
        }
    }

    // Configuration for the social authentication browser.
    SocialAuthBrowser.config.applicationId = "501518809925546";
    SocialAuthBrowser.config.returnUrl = 'http://console.example.com/app_entry/';
    SocialAuthBrowser.config.accessPermissions = 'email';
    SocialAuthBrowser.initiateLogin(function(authError, authAccessToken) {
        if (authError) {
            return callbackHandler(authError);
        }
        retrieveSocialUserInfo(authAccessToken, function(userInfoError, userData) {
            if (userInfoError) {
                return callbackHandler(userInfoError);
            }
            recordActivity("Received social user information", userData);
            callbackHandler(false, userData);
        });
    });
}

function executeSocialLogout(authToken, completionHandler) {
    if (navigator && navigator.connection) {
        recordActivity("Connection status: " + navigator.connection.connectionType);
        if (navigator.connection.connectionType === "noNetwork") {
            return completionHandler({
                cause: "No network connection detected"
            });
        }
    }
    SocialAuthBrowser.config.applicationId = "501518809925546";
    SocialAuthBrowser.config.returnUrl = 'http://console.example.com/app_entry/';
    SocialAuthBrowser.config.accessPermissions = 'email';
    SocialAuthBrowser.initiateLogout(authToken, function(logoutFailure, logoutData) {
        if (logoutFailure) {
            return completionHandler(logoutFailure);
        }
        recordActivity("User logged out from social platform");
        appConfiguration.currentUser = null; // Clear local user session
        completionHandler(false, logoutData);
    });
}

function retrieveSocialUserInfo(authToken, callbackFunction) {
    const apiEndpoint = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + authToken;
    dataLink.sendGetRequest(apiEndpoint, function(requestError, userInfo) {
        if (requestError) {
            return callbackFunction(requestError);
        }
        userInfo.authAccessToken = authToken;
        callbackFunction(false, userInfo);
    });
}

function obtainNewSocialToken(callbackAction) {
    recordActivity("Attempting to get a fresh social token");
    // This process is similar to initial login but focuses on updating token.

    authenticateViaSocial(function(authError, userData) {
        if (authError) {
            return callbackAction(authError);
        }
        appConfiguration.setAuthenticatedUser(userData, function(setUserError, setUserStatus) {
            if (setUserError) {
                return callbackAction(setUserError);
            }
            registerSocialAuthToken(callbackAction);
        });
    });
}

/*
 * Synchronization Manager: This module handles data synchronization.
 * It initiates a push replication first, and upon successful completion,
 * establishes continuous push and pull replications.
 */

function initiateSynchronization(completionCallback, attemptCounter) {
    if (!appConfiguration.currentUser) {
        return recordActivity("No active user found for synchronization");
    }
    const remoteTarget = {
        endpointUrl: appConfiguration.serviceInfo.syncEndpoint,
        credentials: {
            socialAuth: {
                userEmail: appConfiguration.currentUser.emailAddress
            }
        },
    };
    // ... rest of the sync logic would go here, following the original structure ...
}
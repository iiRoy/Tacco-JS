/*
 * Application Core Module - Responsible for orchestrating user interactions
 * and data synchronization within the task management system.
 *
 * This module is designed to operate on Cordova-enabled devices, leveraging
 * local storage and remote synchronization capabilities.
 */

// Core dependencies for network requests and UI enhancements
const httpClient = require("coax"); // Renamed coax to httpClient
const touchFixer = require("fastclick"); // Renamed fastclick to touchFixer

// Configuration object for the entire application
// This encapsulates global settings, user state, and database instances.
const appConfiguration = {
    dataStoreKey: "todo_app_data", // Renamed appDbName to dataStoreKey
    syncGatewayUrl: "http://demo.mobile.couchbase.com/todolite", // Renamed REMOTE_SYNC_URL and moved to config
    activeUser: null, // Stores current user session data
    databaseInstance: null, // PouchDB/CouchDB instance
    templateEngine: { // Simple template renderer placeholder
        renderIndexPage: () => `
            <div id="welcomeHeader">
                <h1>Task Flow</h1>
                <p>Manage your tasks efficiently.</p>
            </div>
            <form class="new-list-form">
                <input type="text" name="listTitle" placeholder="New list name" required>
                <button type="submit">Create List</button>
            </form>
            <ul id="scrollContainer" class="item-list"></ul>
            <button class="auth-toggle-button">Sign In / Out</button>
        `,
        renderListOverview: (viewData) => {
            if (!viewData || !viewData.rows || viewData.rows.length === 0) {
                return `<li class="empty-state">No task lists yet. Create one above!</li>`;
            }
            return viewData.rows.map(row => `
                <li data-entity-id="${row.id}" class="list-item">
                    <span>${row.key}</span>
                    <button class="delete-btn" style="display:none;">Delete</button>
                </li>
            `).join('');
        },
        renderListPage: (listDocument) => `
            <div class="list-header">
                <button class="navigate-back-button">Back to Lists</button>
                <h2>${listDocument.title}</h2>
                <button class="share-list-button">Share</button>
            </div>
            <form class="new-task-form">
                <input type="text" name="taskName" placeholder="New task description" required>
                <button type="submit">Add Task</button>
            </form>
            <ul id="scrollContainer" class="item-list"></ul>
        `,
        renderListItems: (viewData) => {
            if (!viewData || !viewData.rows || viewData.rows.length === 0) {
                return `<li class="empty-state">No tasks in this list. Add one above!</li>`;
            }
            return viewData.rows.map(row => {
                const item = row.value;
                const checkedClass = item.isCompleted ? 'completed' : '';
                const hasImageClass = item.attachments && item.attachments.photoData ? 'image' : '';
                return `
                    <li data-entity-id="${item._id}" class="task-item ${checkedClass}">
                        <span class="task-title">${item.taskName}</span>
                        <div class="task-actions">
                            <button class="camera-action ${hasImageClass}"></button>
                            <button class="delete-btn" style="display:none;">Delete</button>
                        </div>
                    </li>
                `;
            }).join('');
        },
        renderImageDisplay: (imageDocument) => `
            <div class="image-viewer">
                <button class="navigate-image-back">Back to Task</button>
                <img src="${imageDocument.imageDisplayPath}" alt="Task Image">
                <button class="delete-image-button">Delete Image</button>
            </div>
        `,
        renderSharePage: (shareData) => {
            const listTitle = shareData.listTitle || 'Unknown List';
            const userProfiles = shareData.rows || [];
            return `
                <div class="share-header">
                    <button class="navigate-share-back">Back to List</button>
                    <h3>Share "${listTitle}"</h3>
                </div>
                <ul id="scrollContainer" class="profile-list">
                    ${userProfiles.map(profile => `
                        <li data-entity-id="${profile.id}" class="profile-item ${profile.checked ? 'selected' : ''}">
                            <span>${profile.value.name} (${profile.value.email})</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        }
    },
    // Placeholder for PouchDB / CouchDB-like methods
    // In a real app, this would be an actual PouchDB instance.
    // For Type III, we're just renaming the interface.
    dataStore: {
        get: (id, callback) => { /* ... */ },
        post: (doc, callback) => { /* ... */ },
        put: (id, doc, callback) => { /* ... */ },
        changes: (options, callback) => { /* ... */ },
        queryView: (viewName, options, callback) => { /* ... */ },
        bulkUpdateDocuments: (docs, callback) => { /* ... */ },
        // Simulate coax-like behavior for attachments/docs
        getDocAndAttachments: (id, callback) => { /* ... */ }, // Renamed original `config.db(id, fn)`
        getAttachmentPath: (docId, attachmentName) => { /* ... */ } // Renamed original `config.db([id,"image"]).pax.toString()`
    },
    // Helper function to set the current user and update database config
    setCurrentUser: (userData, callback) => {
        appConfiguration.activeUser = userData;
        // In a real PouchDB setup, this might update auth headers or session.
        // For this clone, we just store the user.
        console.log("User set in config:", userData);
        callback(null, { success: true });
    },
    // Placeholder for PouchDB / CouchDB info object
    dataStoreInfo: {
        updateSequence: null
    }
};

// Initialize FastClick equivalent
new touchFixer.FastClick(document.body);

// Custom logging utility
const logActivity = (tag, ...messages) => {
    if (console && console.log) {
        console.log(`[${tag}]`, ...messages);
    }
};

// Listen for Cordova's device ready event
document.addEventListener("deviceready", initializeApplication, false);

// Placeholder for a function that will be called when the database content changes.
// This allows UI components to react to data updates.
let globalDataUpdateCallback = () => {};

/*
 * --- Core Application Initialization & Event Handling ---
 */

/**
 * Main entry point for the application once the device is ready.
 * Sets up the database, connects to changes, and renders the initial UI.
 * @param {Event} deviceReadyEvent - The Cordova deviceready event.
 */
function initializeApplication(deviceReadyEvent) {
    logActivity("AppInit", "Device is ready, starting application setup.");

    // Simulate PouchDB initialization
    appConfiguration.databaseInstance = new PouchDB(appConfiguration.dataStoreKey);
    appConfiguration.dataStore.get = appConfiguration.databaseInstance.get.bind(appConfiguration.databaseInstance);
    appConfiguration.dataStore.post = appConfiguration.databaseInstance.post.bind(appConfiguration.databaseInstance);
    appConfiguration.dataStore.put = (id, doc, callback) => {
        // PouchDB put requires _rev for updates. Let's simulate.
        if (doc._id && doc._rev) {
            appConfiguration.databaseInstance.put(doc, callback);
        } else if (id && doc) {
            // New document
            appConfiguration.databaseInstance.put(doc, id, callback);
        } else {
            callback(new Error("Invalid arguments for put operation"));
        }
    };
    appConfiguration.dataStore.changes = appConfiguration.databaseInstance.changes.bind(appConfiguration.databaseInstance);
    appConfiguration.dataStore.queryView = (viewName, options, callback) => {
        // PouchDB views are typically 'design_doc_name/view_name'
        const fullViewName = `_design/${viewName.toLowerCase()}/_view/${viewName.toLowerCase()}`;
        appConfiguration.databaseInstance.query(fullViewName, options, callback);
    };
    appConfiguration.dataStore.bulkUpdateDocuments = appConfiguration.databaseInstance.bulkDocs.bind(appConfiguration.databaseInstance);
    appConfiguration.dataStore.getDocAndAttachments = (id, callback) => {
        appConfiguration.databaseInstance.get(id, { attachments: true }, callback);
    };
    appConfiguration.dataStore.getAttachmentPath = (docId, attachmentName) => {
        // PouchDB attachment URL format
        return `${appConfiguration.databaseInstance.name}/${docId}/${attachmentName}`;
    };

    // Ensure the database is ready and get its info
    appConfiguration.databaseInstance.info((err, info) => {
        if (err) {
            console.error("Failed to get DB info:", err);
            displayError("Database initialization error: " + (err.message || JSON.stringify(err)));
            return;
        }
        appConfiguration.dataStoreInfo.updateSequence = info.update_seq;
        logActivity("DBInfo", "Database initialized. Update sequence:", appConfiguration.dataStoreInfo.updateSequence);

        // All systems nominal, proceed with app logic
        establishChangeMonitor();
        navigateHome();
        initiateDataSynchronization((syncErr) => {
            if (syncErr) {
                logActivity("SyncError", "Initial sync encountered an issue:", JSON.stringify(syncErr));
            } else {
                logActivity("Sync", "Initial data synchronization completed.");
            }
        });
    });
}


/**
 * Establishes a listener for database changes to keep the UI updated.
 */
function establishChangeMonitor() {
    logActivity("ChangeMonitor", "Setting up database change listener.");
    appConfiguration.databaseInstance.changes({
        since: 'now', // Start listening from current changes
        live: true, // Keep the connection open
        include_docs: false // No need for full docs in change stream
    }).on('change', (change) => {
        appConfiguration.dataStoreInfo.updateSequence = change.seq;
        logActivity("ChangeMonitor", "Database changed. New sequence:", change.seq);
        globalDataUpdateCallback(); // Trigger UI refresh
    }).on('error', (changeErr) => {
        logActivity("ChangeMonitorError", "Error in change feed:", changeErr);
        // Potentially attempt to re-establish the connection after a delay
    });
}

/*
 * --- Error Handling UI Presentation ---
 */

/**
 * Displays an error message related to login failures.
 * @param {object} problemDetails - The error object.
 */
function showLoginFailure(problemDetails) {
    const reason = problemDetails && problemDetails.reason ? problemDetails.reason : JSON.stringify(problemDetails);
    alert(`Authentication Failed: ${reason}`);
    logActivity("LoginError", `Login attempt failed: ${reason}`);
}

/**
 * Presents an error message concerning logout issues.
 * @param {object} issueInfo - The error object.
 */
function displayLogoutProblem(issueInfo) {
    const explanation = issueInfo && issueInfo.reason ? issueInfo.reason : JSON.stringify(issueInfo);
    alert(`Logout Unsuccessful: ${explanation}`);
    logActivity("LogoutError", `Logout process encountered an issue: ${explanation}`);
}

/**
 * Displays a general application error.
 * @param {string} message - The error message.
 */
function displayError(message) {
    alert(`Application Error: ${message}`);
    logActivity("GeneralError", message);
}

/*
 * --- UI Rendering and Navigation Utilities ---
 */

/**
 * Clears existing content and renders new HTML into the primary content area.
 * Scrolls to the top of the page.
 * @param {string} markupString - The HTML content to display.
 */
function renderMainContent(markupString) {
    window.scrollTo(0, 0); // Scroll to top
    const mainContentArea = document.getElementById("primaryContent");
    if (mainContentArea) {
        mainContentArea.innerHTML = markupString;
    } else {
        logActivity("UIError", "Primary content area not found!");
    }
}

/**
 * Extracts form data into a plain JavaScript object.
 * @param {HTMLFormElement} formElement - The form to serialize.
 * @returns {object} An object with form field names as keys and their values.
 */
function extractFormData(formElement) {
    const data = {};
    Array.from(formElement.elements).forEach(element => {
        if (element.name && element.value) {
            data[element.name] = element.value;
        }
    });
    return data;
}

/*
 * --- Main Application Views ---
 * These functions control the rendering and interaction logic for different
 * sections of the application (e.g., list overview, specific list details).
 */

/**
 * Navigates to and renders the main index page, displaying all task lists.
 * Allows creating new lists and handling user authentication toggles.
 */
function navigateHome() {
    logActivity("Navigation", "Navigating to home page (list overview).");
    renderMainContent(appConfiguration.templateEngine.renderIndexPage());

    const listForm = document.querySelector(".new-list-form");
    if (listForm) {
        listForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const listDetails = extractFormData(this);
            const listTitle = listDetails.listTitle ? listDetails.listTitle.trim() : '';

            if (!listTitle) {
                alert("Please enter a title for your new list.");
                return;
            }

            const newListDocument = {
                entryType: "list", // Renamed 'type' to 'entryType'
                title: listTitle,
                creationTimestamp: new Date().toISOString() // Renamed 'created_at'
            };

            // Assign ownership if a user is logged in
            if (appConfiguration.activeUser && appConfiguration.activeUser.email) {
                newListDocument.listOwner = `user_profile:${appConfiguration.activeUser.user_id}`; // Renamed 'owner'
            }

            appConfiguration.dataStore.post(newListDocument, (err, result) => {
                if (err) {
                    logActivity("DataStoreError", "Failed to create new list:", err);
                    alert("Error creating list: " + (err.message || JSON.stringify(err)));
                } else {
                    logActivity("DataStore", "New list created:", result);
                    const inputField = this.querySelector("input[name='listTitle']");
                    if (inputField) inputField.value = ""; // Clear input
                    globalDataUpdateCallback(); // Refresh list display
                }
            });
        });
    }

    // Event delegation for clicking on a list item
    const scrollContainer = document.getElementById("scrollContainer");
    if (scrollContainer) {
        scrollContainer.addEventListener("click", (event) => {
            const listItem = event.target.closest("li[data-entity-id]");
            if (listItem && !event.target.classList.contains("delete-btn")) {
                const listIdentifier = listItem.getAttribute("data-entity-id");
                if (listIdentifier) {
                    viewSpecificList(listIdentifier);
                }
            }
        });

        // Swipe-right gesture for revealing delete button
        scrollContainer.addEventListener("swiperight", (event) => {
            const listItem = event.target.closest("li[data-entity-id]");
            if (listItem) {
                const deleteButton = listItem.querySelector(".delete-btn");
                if (deleteButton) {
                    deleteButton.style.display = "inline-block";
                    deleteButton.onclick = (e) => {
                        e.stopPropagation(); // Prevent list click
                        const entityId = listItem.getAttribute("data-entity-id");
                        if (entityId) {
                            removeDataItem(entityId);
                        }
                        return false;
                    };
                }
            }
        });
    }


    const authToggleButton = document.querySelector(".auth-toggle-button");
    if (authToggleButton) {
        if (!appConfiguration.activeUser) {
            authToggleButton.textContent = "Sign In with Facebook";
            authToggleButton.onclick = () => {
                initiateUserAuthentication((authErr) => {
                    if (authErr) {
                        showLoginFailure(authErr);
                    } else {
                        navigateHome(); // Refresh UI after successful login
                    }
                });
            };
        } else {
            authToggleButton.textContent = "Sign Out";
            authToggleButton.onclick = () => {
                performSocialLogout(appConfiguration.activeUser.access_token, (logoutErr) => {
                    if (logoutErr) {
                        displayLogoutProblem(logoutErr);
                    } else {
                        alert("You have been successfully logged out!");
                        navigateHome(); // Refresh UI after logout
                    }
                });
            };
        }
    }

    // Set the callback for database changes specific to this view
    globalDataUpdateCallback = () => {
        appConfiguration.dataStore.queryView("lists", { descending: true }, (err, viewResult) => {
            if (err) {
                logActivity("ViewError", "Error fetching lists view:", err);
                // Handle view error, maybe display a message to the user
                return;
            }
            logActivity("ListsView", "Fetched lists:", viewResult);
            if (scrollContainer) {
                scrollContainer.innerHTML = appConfiguration.templateEngine.renderListOverview(viewResult);
            }
        });
    };
    globalDataUpdateCallback(); // Initial load of lists
}

/**
 * Displays a specific task list, allowing task creation, completion, and deletion.
 * @param {string} listIdentifier - The ID of the list document.
 */
function viewSpecificList(listIdentifier) {
    logActivity("Navigation", `Viewing list with ID: ${listIdentifier}`);

    appConfiguration.dataStore.get(listIdentifier, (err, listDocument) => {
        if (err) {
            logActivity("DataStoreError", `Failed to retrieve list ${listIdentifier}:`, err);
            alert("Error loading list: " + (err.message || JSON.stringify(err)));
            navigateHome(); // Fallback to home if list not found/accessible
            return;
        }

        renderMainContent(appConfiguration.templateEngine.renderListPage(listDocument));

        // Event listeners for list actions
        document.querySelector(".navigate-back-button").addEventListener("click", navigateHome);
        document.querySelector(".share-list-button").addEventListener("click", () => manageSharingOptions(listIdentifier));

        const taskForm = document.querySelector(".new-task-form");
        if (taskForm) {
            taskForm.addEventListener("submit", function(event) {
                event.preventDefault();
                const taskDetails = extractFormData(this);
                const taskName = taskDetails.taskName ? taskDetails.taskName.trim() : '';

                if (!taskName) {
                    alert("Please enter a description for your new task.");
                    return;
                }

                const newTaskDocument = {
                    entryType: "task", // Renamed 'type'
                    parentListIdentifier: listIdentifier, // Renamed 'list_id'
                    taskName: taskName,
                    isCompleted: false, // New field, default false
                    creationTimestamp: new Date().toISOString(), // Renamed 'created_at'
                    lastModificationTimestamp: new Date().toISOString() // Renamed 'updated_at'
                };

                appConfiguration.dataStore.post(newTaskDocument, (postErr, postResult) => {
                    if (postErr) {
                        logActivity("DataStoreError", "Failed to add new task:", postErr);
                        alert("Error adding task: " + (postErr.message || JSON.stringify(postErr)));
                    } else {
                        logActivity("DataStore", "New task added:", postResult);
                        const inputField = this.querySelector("input[name='taskName']");
                        if (inputField) inputField.value = ""; // Clear input
                        globalDataUpdateCallback(); // Refresh task list
                    }
                });
            });
        }

        const scrollContainer = document.getElementById("scrollContainer");
        if (scrollContainer) {
            scrollContainer.addEventListener("click", (event) => {
                const taskItem = event.target.closest("li[data-entity-id]");
                if (!taskItem) return;

                const taskIdentifier = taskItem.getAttribute("data-entity-id");
                if (!taskIdentifier) return;

                if (event.target.classList.contains("camera-action")) {
                    if (event.target.classList.contains("image")) {
                        displayImagePreview(taskIdentifier);
                    } else {
                        capturePhoto(taskIdentifier);
                    }
                } else if (!event.target.classList.contains("delete-btn")) {
                    switchTaskCompletionStatus(taskIdentifier);
                }
            });

            // Swipe-right for revealing delete button
            scrollContainer.addEventListener("swiperight", (event) => {
                const taskItem = event.target.closest("li[data-entity-id]");
                if (taskItem) {
                    const deleteButton = taskItem.querySelector(".delete-btn");
                    if (deleteButton) {
                        deleteButton.style.display = "inline-block";
                        deleteButton.onclick = (e) => {
                            e.stopPropagation(); // Prevent task click
                            const entityId = taskItem.getAttribute("data-entity-id");
                            if (entityId) {
                                removeDataItem(entityId);
                            }
                            return false;
                        };
                    }
                }
            });
        }


        // Set the callback for database changes specific to this view (tasks for this list)
        globalDataUpdateCallback = () => {
            appConfiguration.dataStore.queryView("tasks", {
                startkey: [listIdentifier, {}],
                endkey: [listIdentifier],
                descending: true,
                include_docs: true // Get full task documents to render
            }, (queryErr, queryResult) => {
                if (queryErr) {
                    logActivity("ViewError", `Error fetching tasks for list ${listIdentifier}:`, queryErr);
                    return;
                }
                logActivity("TasksView", "Fetched tasks:", queryResult);
                if (scrollContainer) {
                    scrollContainer.innerHTML = appConfiguration.templateEngine.renderListItems(queryResult);
                }
            });
        };
        globalDataUpdateCallback(); // Initial load of tasks
    });
}

/**
 * Deletes a document from the database.
 * @param {string} entityId - The ID of the document to delete.
 */
function removeDataItem(entityId) {
    logActivity("DataOperation", `Attempting to delete item: ${entityId}`);
    appConfiguration.dataStore.get(entityId, (err, existingDoc) => {
        if (err) {
            logActivity("DataStoreError", `Failed to get document for deletion ${entityId}:`, err);
            alert("Error deleting item: " + (err.message || JSON.stringify(err)));
            return;
        }
        // Mark for deletion and update
        existingDoc._deleted = true; // Standard CouchDB/PouchDB deletion flag
        appConfiguration.dataStore.put(entityId, existingDoc, (updateErr, updateResult) => {
            if (updateErr) {
                logActivity("DataStoreError", `Failed to mark document for deletion ${entityId}:`, updateErr);
                alert("Error marking item for deletion: " + (updateErr.message || JSON.stringify(updateErr)));
            } else {
                logActivity("DataStore", `Document ${entityId} marked for deletion.`, updateResult);
                globalDataUpdateCallback(); // Refresh UI
            }
        });
    });
}

/**
 * Toggles the completion status of a task.
 * @param {string} taskIdentifier - The ID of the task document.
 */
function switchTaskCompletionStatus(taskIdentifier) {
    logActivity("DataOperation", `Toggling completion status for task: ${taskIdentifier}`);
    appConfiguration.dataStore.get(taskIdentifier, (err, taskDoc) => {
        if (err) {
            logActivity("DataStoreError", `Failed to get task ${taskIdentifier} for toggle:`, err);
            alert("Error updating task status: " + (err.message || JSON.stringify(err)));
            return;
        }
        taskDoc.isCompleted = !taskDoc.isCompleted; // Toggle boolean status
        taskDoc.lastModificationTimestamp = new Date().toISOString(); // Update timestamp
        appConfiguration.dataStore.put(taskIdentifier, taskDoc, (updateErr, updateResult) => {
            if (updateErr) {
                logActivity("DataStoreError", `Failed to update task status ${taskIdentifier}:`, updateErr);
                alert("Error saving task status: " + (updateErr.message || JSON.stringify(updateErr)));
            } else {
                logActivity("DataStore", `Task ${taskIdentifier} completion status updated.`, updateResult);
                globalDataUpdateCallback(); // Refresh UI
            }
        });
    });
}

/**
 * Captures a photo using the device camera and attaches it to a task.
 * @param {string} taskIdentifier - The ID of the task to attach the photo to.
 */
function capturePhoto(taskIdentifier) {
    logActivity("Camera", `Attempting to capture photo for task: ${taskIdentifier}`);

    // Guard clause for camera availability
    if (!navigator.camera || !navigator.camera.getPicture) {
        alert("Camera functionality is not available on this device.");
        logActivity("Camera", "Camera plugin not found.");
        return;
    }

    const cameraOptions = {
        quality: 60, // Slightly higher quality
        targetWidth: 1200, // Larger target dimensions
        targetHeight: 1200,
        destinationType: Camera.DestinationType.DATA_URL, // Base64 encoded image
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true,
        saveToPhotoAlbum: false
    };

    navigator.camera.getPicture(
        (imageData) => { // onSuccess
            appConfiguration.dataStore.get(taskIdentifier, (err, taskDoc) => {
                if (err) {
                    logActivity("DataStoreError", `Failed to get task ${taskIdentifier} for image attachment:`, err);
                    alert("Error retrieving task for photo: " + (err.message || JSON.stringify(err)));
                    return;
                }
                // Add attachment metadata
                taskDoc.attachments = taskDoc.attachments || {};
                taskDoc.attachments.photoData = { // Renamed "image" key
                    contentType: "image/jpeg", // Renamed 'content_type'
                    data: imageData // Base64 image data
                };
                taskDoc.lastModificationTimestamp = new Date().toISOString();

                appConfiguration.dataStore.put(taskIdentifier, taskDoc, (updateErr, updateResult) => {
                    if (updateErr) {
                        logActivity("DataStoreError", `Failed to attach image to task ${taskIdentifier}:`, updateErr);
                        alert("Error saving photo: " + (updateErr.message || JSON.stringify(updateErr)));
                    } else {
                        logActivity("DataStore", `Image attached to task ${taskIdentifier}.`, updateResult);
                        globalDataUpdateCallback(); // Refresh UI to show image icon
                    }
                });
            });
        },
        (message) => { // onFail
            logActivity("CameraError", `Camera capture failed: ${message}`);
            // User cancelled or an error occurred
            if (message !== "No Image Selected") { // Common message when user cancels
                alert("Photo capture failed: " + message);
            }
        },
        cameraOptions
    );
}

/**
 * Displays a full-screen preview of an image attached to a task.
 * @param {string} taskIdentifier - The ID of the task containing the image.
 */
function displayImagePreview(taskIdentifier) {
    logActivity("Navigation", `Displaying image for task: ${taskIdentifier}`);
    globalDataUpdateCallback = () => {}; // Disable general UI updates for this focused view

    appConfiguration.dataStore.getDocAndAttachments(taskIdentifier, (err, taskDocWithAttachments) => {
        if (err) {
            logActivity("DataStoreError", `Failed to get task ${taskIdentifier} with attachments:`, err);
            alert("Error loading image: " + (err.message || JSON.stringify(err)));
            return;
        }

        if (!taskDocWithAttachments.attachments || !taskDocWithAttachments.attachments.photoData) {
            alert("No image found for this task.");
            viewSpecificList(taskDocWithAttachments.parentListIdentifier); // Go back to list
            return;
        }

        // Construct the image path for display
        const imagePath = appConfiguration.dataStore.getAttachmentPath(taskIdentifier, "photoData"); // Renamed
        taskDocWithAttachments.imageDisplayPath = imagePath; // Property for template

        renderMainContent(appConfiguration.templateEngine.renderImageDisplay(taskDocWithAttachments));

        // Event listeners for image view
        document.querySelector(".navigate-image-back").addEventListener("click", () => {
            viewSpecificList(taskDocWithAttachments.parentListIdentifier);
        });

        document.querySelector(".delete-image-button").addEventListener("click", () => {
            logActivity("DataOperation", `Deleting image from task: ${taskIdentifier}`);
            // Remove image path from temporary display data and attachments
            delete taskDocWithAttachments.imageDisplayPath;
            if (taskDocWithAttachments.attachments) {
                delete taskDocWithAttachments.attachments.photoData; // Renamed
            }
            taskDocWithAttachments.lastModificationTimestamp = new Date().toISOString();

            appConfiguration.dataStore.put(taskIdentifier, taskDocWithAttachments, (updateErr, updateResult) => {
                if (updateErr) {
                    logActivity("DataStoreError", `Failed to delete image from task ${taskIdentifier}:`, updateErr);
                    alert("Error deleting image: " + (updateErr.message || JSON.stringify(updateErr)));
                } else {
                    logActivity("DataStore", `Image deleted from task ${taskIdentifier}.`, updateResult);
                    viewSpecificList(taskDocWithAttachments.parentListIdentifier); // Go back to task list
                }
            });
        });
    });
}

/*
 * --- Sharing and User Management ---
 */

/**
 * Initiates the sharing process for a list, prompting for login if necessary.
 * @param {string} listIdentifier - The ID of the list to share.
 */
function manageSharingOptions(listIdentifier) {
    logActivity("Sharing", `Managing sharing for list: ${listIdentifier}`);
    if (!appConfiguration.activeUser) {
        initiateUserAuthentication((authErr) => {
            if (authErr) {
                showLoginFailure(authErr);
            } else {
                logActivity("Sharing", "User logged in, proceeding to sharing interface.");
                showSharingInterface(listIdentifier);
            }
        });
    } else {
        showSharingInterface(listIdentifier);
    }
}

/**
 * Renders the interface for managing collaborators on a specific list.
 * @param {string} listIdentifier - The ID of the list document.
 */
function showSharingInterface(listIdentifier) {
    logActivity("Sharing", `Displaying sharing interface for list: ${listIdentifier}`);
    globalDataUpdateCallback = () => {}; // Disable general UI updates

    appConfiguration.dataStore.get(listIdentifier, (err, listDocument) => {
        if (err) {
            logActivity("DataStoreError", `Failed to get list ${listIdentifier} for sharing:`, err);
            alert("Error loading list for sharing: " + (err.message || JSON.stringify(err)));
            viewSpecificList(listIdentifier);
            return;
        }

        appConfiguration.dataStore.queryView("profiles", (queryErr, profileViewResult) => {
            if (queryErr) {
                logActivity("ViewError", "Error fetching user profiles for sharing:", queryErr);
                alert("Error loading profiles: " + (queryErr.message || JSON.stringify(queryErr)));
                viewSpecificList(listIdentifier);
                return;
            }

            const sharePageData = {
                listTitle: listDocument.title,
                rows: profileViewResult.rows || []
            };

            // Determine current collaborators
            const currentCollaboratorIDs = new Set((listDocument.members || []).concat(listDocument.listOwner || [])); // Renamed 'members', 'owner'

            // Mark profiles that are already collaborators
            sharePageData.rows.forEach(profileRow => {
                if (currentCollaboratorIDs.has(profileRow.id)) {
                    profileRow.checked = true;
                }
            });

            renderMainContent(appConfiguration.templateEngine.renderSharePage(sharePageData));

            document.querySelector(".navigate-share-back").addEventListener("click", () => {
                viewSpecificList(listIdentifier);
            });

            const scrollContainer = document.getElementById("scrollContainer");
            if (scrollContainer) {
                scrollContainer.addEventListener("click", (event) => {
                    const profileItem = event.target.closest("li[data-entity-id]");
                    if (!profileItem) return;

                    const profileID = profileItem.getAttribute("data-entity-id");
                    // Prevent owner from being removed or re-added as a regular member
                    if (profileID !== listDocument.listOwner) {
                        updateCollaborationStatus(listDocument, profileID, () => {
                            showSharingInterface(listIdentifier); // Refresh sharing UI
                        });
                    } else {
                        alert("The list owner cannot be removed from sharing.");
                        // Simply refresh to show no change if owner was clicked
                        showSharingInterface(listIdentifier);
                    }
                });
            }
        });
    });
}

/**
 * Adds or removes a user from a list's collaborators.
 * @param {object} targetDocument - The list document to modify.
 * @param {string} userID - The ID of the user to toggle.
 * @param {function} callback - Callback function after update.
 */
function updateCollaborationStatus(targetDocument, userID, callback) {
    targetDocument.members = targetDocument.members || []; // Renamed 'members'
    const userIndex = targetDocument.members.indexOf(userID);

    if (userIndex === -1) {
        targetDocument.members.push(userID); // Add user
        logActivity("Sharing", `Added user ${userID} to collaborators.`);
    } else {
        targetDocument.members.splice(userIndex, 1); // Remove user
        logActivity("Sharing", `Removed user ${userID} from collaborators.`);
    }
    targetDocument.lastModificationTimestamp = new Date().toISOString();

    appConfiguration.dataStore.put(targetDocument._id, targetDocument, (err, result) => {
        if (err) {
            logActivity("DataStoreError", "Failed to update collaboration status:", err);
            alert("Error updating sharing: " + (err.message || JSON.stringify(err)));
        } else {
            logActivity("DataStore", "Collaboration status updated.", result);
        }
        callback(err, result);
    });
}

/*
 * --- Authentication and User Profile Management ---
 */

/**
 * Handles the initial user authentication flow, including social login,
 * registering with the sync gateway, creating a profile, and updating existing lists.
 * @param {function} completionCallback - Callback function on completion.
 */
function initiateUserAuthentication(completionCallback) {
    logActivity("AuthFlow", "Starting user authentication process.");

    authenticateViaSocialProvider((authErr, socialData) => {
        if (authErr) {
            return completionCallback(authErr);
        }
        logActivity("AuthFlow", "Social provider authentication successful.");

        appConfiguration.setCurrentUser(socialData, (setUserErr) => {
            if (setUserErr) {
                return completionCallback(setUserErr);
            }
            logActivity("AuthFlow", "Application user configuration updated.");

            registerSocialTokenWithGateway((registerErr) => {
                if (registerErr) {
                    logActivity("AuthFlowError", "Failed to register social token with gateway:", registerErr);
                    return completionCallback(registerErr);
                }
                logActivity("AuthFlow", "Social token registered with gateway.");

                generateUserProfileEntry((profileErr) => {
                    if (profileErr) {
                        logActivity("AuthFlowError", "Failed to create user profile entry:", profileErr);
                        return completionCallback(profileErr);
                    }
                    logActivity("AuthFlow", "User profile entry generated.");

                    assignOwnershipToLists((ownershipErr) => {
                        if (ownershipErr) {
                            logActivity("AuthFlowError", "Failed to assign ownership to existing lists:", ownershipErr);
                            return completionCallback(ownershipErr);
                        }
                        logActivity("AuthFlow", "Ownership assigned to existing lists.");

                        initiateDataSynchronization((syncErr, syncResult) => {
                            logActivity("AuthFlow", "Final sync triggered after login.");
                            completionCallback(syncErr, syncResult);
                        });
                    });
                });
            });
        });
    });
}

/**
 * Registers the user's social access token with the Sync Gateway.
 * @param {function} callback - Callback function (err, result).
 */
function registerSocialTokenWithGateway(callback) {
    if (!appConfiguration.activeUser) {
        return callback(new Error("No active user to register token."));
    }

    const registrationPayload = {
        gatewayEndpoint: appConfiguration.syncGatewayUrl, // Renamed 'remote_url'
        userEmail: appConfiguration.activeUser.email, // Renamed 'email'
        authToken: appConfiguration.activeUser.access_token // Renamed 'access_token'
    };
    logActivity("GatewayAuth", "Registering social token:", JSON.stringify(registrationPayload));

    httpClient.post([appConfiguration.syncGatewayUrl, "_facebook_token"], registrationPayload, (err, response) => {
        if (err) {
            logActivity("GatewayAuthError", "Error registering token:", err);
            return callback(err);
        }
        logActivity("GatewayAuth", "Social token registration successful:", response);
        callback(null, response);
    });
}

/**
 * Updates all existing task lists to reflect the newly logged-in user as their owner.
 * @param {function} callback - Callback function (err, result).
 */
function assignOwnershipToLists(callback) {
    if (!appConfiguration.activeUser) {
        return callback(new Error("Cannot assign ownership: no active user."));
    }

    appConfiguration.dataStore.queryView("lists", { includeFullDocuments: true }, (err, viewResult) => {
        if (err) {
            logActivity("DataStoreError", "Failed to query lists for ownership update:", err);
            return callback(err);
        }
        logActivity("Ownership", `Found ${viewResult.rows.length} lists to update ownership.`);

        const documentsToUpdate = [];
        viewResult.rows.forEach(row => {
            const documentEntry = row.doc;
            // Only update if it's not already owned by this user or if it has no owner
            if (!documentEntry.listOwner || documentEntry.listOwner !== `user_profile:${appConfiguration.activeUser.user_id}`) {
                documentEntry.listOwner = `user_profile:${appConfiguration.activeUser.user_id}`; // Renamed 'owner'
                documentEntry.lastModificationTimestamp = new Date().toISOString();
                documentsToUpdate.push(documentEntry);
            }
        });

        if (documentsToUpdate.length === 0) {
            logActivity("Ownership", "No lists required ownership update.");
            return callback(null, { success: true, message: "No updates needed." });
        }

        appConfiguration.dataStore.bulkUpdateDocuments(documentsToUpdate, (bulkErr, bulkResult) => {
            if (bulkErr) {
                logActivity("DataStoreError", "Bulk update for ownership failed:", bulkErr);
                return callback(bulkErr);
            }
            logActivity("Ownership", `Successfully updated ownership for ${documentsToUpdate.length} lists.`, bulkResult);
            callback(null, bulkResult);
        });
    });
}

/**
 * Creates or updates the user's profile document in the database.
 * @param {function} callback - Callback function (err).
 */
function generateUserProfileEntry(callback) {
    if (!appConfiguration.activeUser) {
        return callback(new Error("Cannot create profile: no active user data."));
    }

    // Create a deep copy to avoid modifying the original user object
    const profilePayload = JSON.parse(JSON.stringify(appConfiguration.activeUser));
    profilePayload.entityType = "profile"; // Renamed 'type'
    profilePayload.profileIdentifier = profilePayload.user_id; // Renamed 'user_id'
    delete profilePayload.email; // Email might be sensitive or redundant for profile ID

    const documentID = `user_profile:${profilePayload.profileIdentifier}`; // Consistent ID format

    logActivity("Profile", "Attempting to create/update user profile:", documentID);

    // Fetch existing profile to get _rev for update, or create new if not exists
    appConfiguration.dataStore.get(documentID, (getErr, existingProfile) => {
        if (getErr && getErr.status !== 404) { // 404 means document not found, which is fine
            logActivity("ProfileError", "Error checking for existing profile:", getErr);
            return callback(getErr);
        }

        if (existingProfile) {
            profilePayload._rev = existingProfile._rev; // Add revision for update
            logActivity("Profile", "Updating existing profile:", documentID);
        } else {
            logActivity("Profile", "Creating new profile:", documentID);
        }

        appConfiguration.dataStore.put(documentID, profilePayload, (putErr, putResult) => {
            if (putErr) {
                logActivity("ProfileError", "Failed to create/update profile:", putErr);
                return callback(putErr);
            }
            logActivity("Profile", "User profile created/updated successfully.", putResult);
            callback(null);
        });
    });
}

/**
 * Handles authentication via a social provider (e.g., Facebook).
 * @param {function} callback - Callback function (err, userData).
 */
function authenticateViaSocialProvider(callback) {
    // Check network connectivity first
    if (navigator && navigator.connection && navigator.connection.type === Connection.NONE) {
        return callback({ reason: "No network connection detected for social login." });
    }

    // Configure the in-app browser for social login
    SocialAuthPlugin.settings.clientID = "501518809925546"; // Renamed 'appId'
    SocialAuthPlugin.settings.callbackURI = 'http://console.couchbasecloud.com/index/'; // Renamed 'redirectUrl'
    SocialAuthPlugin.settings.requestedScopes = 'email'; // Renamed 'permissions'

    SocialAuthPlugin.login((authErr, accessToken) => {
        if (authErr) {
            logActivity("SocialAuth", "Social login failed:", authErr);
            return callback(authErr);
        }
        logActivity("SocialAuth", "Social login successful, fetching user details.");
        fetchSocialProfileDetails(accessToken, (profileErr, profileData) => {
            if (profileErr) {
                logActivity("SocialAuthError", "Failed to fetch social profile details:", profileErr);
                return callback(profileErr);
            }
            profileData.access_token = accessToken; // Ensure token is part of user data
            logActivity("SocialAuth", "Fetched social user info:", profileData);
            callback(null, profileData);
        });
    });
}

/**
 * Performs a logout from the social provider and clears local user state.
 * @param {string} authToken - The access token to revoke.
 * @param {function} callback - Callback function (err, data).
 */
function performSocialLogout(authToken, callback) {
    // Check network connectivity first
    if (navigator && navigator.connection && navigator.connection.type === Connection.NONE) {
        return callback({ reason: "No network connection detected for social logout." });
    }

    // Configure the in-app browser for social logout (if needed, usually not as extensive as login)
    SocialAuthPlugin.settings.clientID = "501518809925546";
    SocialAuthPlugin.settings.callbackURI = 'http://console.couchbasecloud.com/index/';
    SocialAuthPlugin.settings.requestedScopes = 'email';

    SocialAuthPlugin.logout(authToken, (logoutErr, logoutResult) => {
        if (logoutErr) {
            logActivity("SocialLogoutError", "Social logout failed:", logoutErr);
            return callback(logoutErr);
        }
        logActivity("SocialLogout", "Successfully logged out from social provider.");
        appConfiguration.activeUser = null; // Clear local user state
        callback(null, logoutResult);
    });
}

/**
 * Fetches user information from the social provider's API.
 * @param {string} authToken - The access token for the social API.
 * @param {function} callback - Callback function (err, userData).
 */
function fetchSocialProfileDetails(authToken, callback) {
    const profileApiUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${authToken}`;
    httpClient.get(profileApiUrl, (err, profileResponse) => {
        if (err) {
            logActivity("SocialAPIError", "Error fetching Facebook profile:", err);
            return callback(err);
        }
        logActivity("SocialAPI", "Facebook profile fetched successfully.");
        // The original code adds access_token to data here, which is redundant if done in authenticateViaSocialProvider
        // but let's keep it for functional similarity.
        profileResponse.access_token = authToken;
        callback(null, profileResponse);
    });
}

/**
 * Attempts to refresh the social access token.
 * This is similar to a partial login flow.
 * @param {function} callback - Callback function (err, result).
 */
function refreshSocialToken(callback) {
    logActivity("AuthFlow", "Attempting to refresh social token.");
    authenticateViaSocialProvider((authErr, newSocialData) => {
        if (authErr) {
            return callback(authErr);
        }
        appConfiguration.setCurrentUser(newSocialData, (setUserErr) => {
            if (setUserErr) {
                return callback(setUserErr);
            }
            registerSocialTokenWithGateway(callback); // Re-register new token
        });
    });
}

/*
 * --- Data Synchronization Manager ---
 * This component manages replication between the local database and the remote Sync Gateway.
 */

/**
 * Initiates data synchronization (replication) with the remote Sync Gateway.
 * This involves setting up both push and pull replications.
 * @param {function} completionCallback - Callback function (err, result).
 * @param {number} [retryAttempt=0] - Current retry count for failed syncs.
 */
function initiateDataSynchronization(completionCallback, retryAttempt = 0) {
    const MAX_SYNC_RETRIES = 3;
    const RETRY_DELAY_MS = 5000; // 5 seconds

    if (!appConfiguration.activeUser) {
        logActivity("Sync", "No active user found, skipping data synchronization.");
        return completionCallback(null, { message: "No user, sync skipped." });
    }

    logActivity("Sync", `Starting data synchronization (attempt ${retryAttempt + 1}).`);

    const replicationConfig = {
        remoteSyncEndpoint: appConfiguration.syncGatewayUrl, // Renamed 'url'
        authenticationDetails: {
            socialProvider: {
                userEmail: appConfiguration.activeUser.email // Renamed 'email' for clarity
            }
        },
        pushEnabled: true, // Renamed 'live' to be more explicit about continuous push
        pullEnabled: true, // Added for explicit continuous pull
        retry: true, // Enable PouchDB's built-in retry logic
        continuous: true // Keep replication active
    };

    const replicationOptions = {
        live: replicationConfig.pullEnabled || replicationConfig.pushEnabled, // PouchDB's 'live' for continuous
        retry: replicationConfig.retry,
        // Authentication details for PouchDB replication
        auth: {
            facebook: {
                email: replicationConfig.authenticationDetails.socialProvider.userEmail
            }
        }
    };

    // PouchDB replication setup
    const syncHandler = appConfiguration.databaseInstance.sync(
        replicationConfig.remoteSyncEndpoint,
        replicationOptions
    );

    syncHandler.on('change', (info) => {
        // This is triggered for every change during replication
        // console.log("Sync change:", info); // Can be noisy, log sparingly
    }).on('paused', (err) => {
        // replication paused (e.g. offline, or a server error)
        if (err) {
            logActivity("SyncWarning", "Synchronization paused due to error:", err);
            // If it's a transient error, PouchDB's retry will handle it.
            // If it's an auth error (e.g., 401), we might need to re-authenticate.
            if (err.status === 401 && retryAttempt < MAX_SYNC_RETRIES) {
                logActivity("SyncRetry", "Authentication error during sync, attempting token refresh.");
                // Stop current sync, refresh token, then restart sync
                syncHandler.cancel();
                refreshSocialToken((tokenRefreshErr) => {
                    if (tokenRefreshErr) {
                        logActivity("SyncError", "Failed to refresh token:", tokenRefreshErr);
                        completionCallback(tokenRefreshErr);
                    } else {
                        logActivity("SyncRetry", "Token refreshed, restarting synchronization.");
                        setTimeout(() => {
                            initiateDataSynchronization(completionCallback, retryAttempt + 1);
                        }, RETRY_DELAY_MS);
                    }
                });
            } else if (retryAttempt >= MAX_SYNC_RETRIES) {
                logActivity("SyncError", "Max sync retries reached, giving up.", err);
                completionCallback(err);
            } else {
                // For other transient errors, PouchDB will retry, but we might log more here.
                logActivity("Sync", "Sync paused, PouchDB should retry.", err);
            }
        } else {
            logActivity("Sync", "Synchronization paused (no error, possibly idle).");
        }
    }).on('active', () => {
        // replication resumed (e.g. online, or for live replication, a database change occurred)
        logActivity("Sync", "Synchronization is active.");
    }).on('denied', (err) => {
        // a document failed to replicate (e.g. due to validation or permissions)
        logActivity("SyncDenied", "Document replication denied:", err);
        completionCallback(err); // Report immediately for specific doc issues
    }).on('complete', (info) => {
        // replication was canceled!
        logActivity("Sync", "Synchronization completed (likely cancelled or one-shot).", info);
        // This event might not fire for continuous 'live' sync unless cancelled.
        // For initial setup, we care about the first successful connection.
        completionCallback(null, { success: true, info: info });
    }).on('error', (err) => {
        // an error occurred
        logActivity("SyncFatalError", "A fatal error occurred during synchronization:", err);
        completionCallback(err);
    });

    // For the initial triggerSync, we want to know when it *first* connects successfully.
    // PouchDB's 'complete' event is for non-live syncs or when a live sync is cancelled.
    // For a 'live' sync, we often rely on 'active' or 'change' events to confirm it's running.
    // Let's add a one-time listener for the first 'active' state to signify initial success.
    const onFirstActive = () => {
        logActivity("Sync", "Initial synchronization connection established.");
        syncHandler.off('active', onFirstActive); // Remove this specific listener
        completionCallback(null, { success: true, message: "Initial sync connection established." });
    };
    syncHandler.on('active', onFirstActive);

    // If the sync never goes active, or immediately errors, the completionCallback will handle it.
}
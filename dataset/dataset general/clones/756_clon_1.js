/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// This section imports necessary modules and sets up initial application variables.
var coax = require("coax")
  , fastclick = require("fastclick")
  , appDbName = "todo"
; /* End of variable declarations */

// Initialize FastClick to remove 300ms delay on touch devices.
new fastclick.FastClick(document.body);

// Set up event listener for when the device is ready (Cordova specific).
document.addEventListener("deviceready", onDeviceReady, false);

// Define the remote synchronization URL.
// var REMOTE_SYNC_URL = "http://10.0.1.12:4984/todos/"; // Example local URL (commented out)
var REMOTE_SYNC_URL = "http://demo.mobile.couchbase.com/todolite"; // Official demo URL

/*
 * This block contains functions related to initializing the application,
 * connecting to the database, and drawing the initial user interface.
 */

// This function is executed when the device is fully loaded and ready.
function onDeviceReady() {
    // Setup initial configuration for the app.
    setupConfig(function(err) {
        if (err) {
            // Display an alert if configuration fails.
            alert(err);
            // Log the error to the console for debugging purposes.
            return console.log("err " + JSON.stringify(err));
        }

        // Connect to database changes to keep the UI updated.
        connectToChanges();

        // Navigate to the main index view of the application.
        goIndex();

        // Trigger the initial synchronization with the remote database.
        triggerSync(function(err) {
            if (err) {
                // Log any errors encountered during synchronization.
                console.log("error on sync" + JSON.stringify(err));
            }
        });
    });
}; // End of onDeviceReady function

// Placeholder function to be called when the database changes.
// It will be replaced by specific UI update logic.
window.dbChanged = function() {};

// Connects to the database's change feed to listen for updates.
// This ensures that the UI can react to both local and remote changes.
function connectToChanges() {
  config.db.changes({since : config.info.update_seq}, function(err, change) {
      // Store the last sequence number from the change feed.
      lastSeq = change.seq;
      // Log the change event for debugging.
      log("change", err, change);
      // Call the UI update function.
      window.dbChanged();
  });
}

/*
 * This section defines functions for handling and displaying
 * various error messages to the user.
 */

// Handles login-specific errors, displaying a user-friendly message.
function loginErr(err) {
    if (err.reason) {
        alert("Can't login: " + err.reason);
    } else {
        alert("Login error: " + JSON.stringify(err));
    }
}

// Handles logout-specific errors, informing the user about the issue.
function logoutError(error) {
    if (error.reason) {
        alert("Can't Logout: " + error.reason);
    } else {
        alert("Logout Error: " + JSON.stringify(error));
    }
}

/*
 * The index UI displays a list of available todo lists
 * and provides functionality to create new ones.
 */

// Renders the given HTML content into the main content area of the application.
function drawContent(html) {
    // Scroll to the top of the page after drawing new content.
    scroll(0, 0);
    // Update the content div with the provided HTML.
    $("#content").html(html);
}

// Navigates to and renders the index page, showing all todo lists.
function goIndex() {
    // Draw the index template content.
    drawContent(config.t.index());

    // Attach a submit handler to the form for creating new todo lists.
    $("#content form").submit(function(e) {
        e.preventDefault(); // Prevent default form submission behavior.
        var doc = jsonform(this); // Extract form data into a JSON document.
        doc.type = "list"; // Set the document type to 'list'.
        doc.created_at = new Date(); // Record the creation timestamp.

        // If a user is logged in, assign ownership of the list.
        if (config.user && config.user.email) {
            // The device owner owns lists they create, prefixed with 'p:'.
            doc.owner = "p:" + config.user.user_id;
        }

        // Post the new document to the database.
        config.db.post(doc, function(err, ok) {
            // Clear the input field after successful submission.
            $("#content form input").val("");
        });
    });

    // Attach a click handler to list items to navigate to a specific list.
    $("#scrollable").on("click", "li", function() {
        var id = $(this).attr("data-id"); // Get the ID of the clicked list item.
        goList(id); // Navigate to the selected todo list.
    });

    // Offer the sign-in screen to users who are not currently logged in.
    if (!config.user) {
        $(".todo-login").show().click(function() {
            doFirstLogin(function(err) {
                if (err) {
                    return loginErr(err); // Handle login errors.
                }
                goIndex(); // Refresh the index page after successful login.
            });
        });
    } else {
        // For logged-in users, the button performs a logout.
        $(".todo-login").show().click(function() {
            doFacebookLogout(config.user.access_token, function(error, data) {
                if (error) {
                    return logoutError(error); // Handle logout errors.
                }
                // Logout Success message.
                alert("You are now logged out!");
                // Re-bind the click event to perform login after logout.
                $(".todo-login").off("click"); // Remove previous click handler.
                $(".todo-login").show().click(function() {
                    doFirstLogin(function(error) {
                        if (error) {
                            return logoutError(error); // Handle login errors.
                        }
                        goIndex(); // Refresh index after login.
                    });
                });
            });
        });
    }

    // Define the database change handler for the index page.
    window.dbChanged = function() {
        // Query the 'lists' view to get all todo lists.
        config.views(["lists", {descending : true}], function(err, view) {
            log("lists", view); // Log the retrieved lists.
            // Render the lists using the indexList template.
            $("#scrollable").html(config.t.indexList(view));
            // Add swipe-right gesture to reveal delete button for list items.
            $("#scrollable li").on("swipeRight", function() {
                var id = $(this).attr("data-id"); // Get the ID of the swiped item.
                $(this).find("button").show().click(function() {
                    deleteItem(id); // Call delete function on button click.
                    return false; // Prevent default button action.
                });
            });
        });
    };
    window.dbChanged(); // Call it once to populate the initial list.
}

/*
 * The list UI allows users to create new todo tasks,
 * mark them as complete, delete them, and share the list.
 */

// Navigates to and renders a specific todo list by its ID.
function goList(id) {
    // Retrieve the document for the specified list ID.
    config.db.get(id, function(err, doc) {
        // Draw the list template content.
        drawContent(config.t.list(doc));

        // Attach click handler for the "back to index" button.
        $("#content .todo-index").click(function() {
            goIndex();
        });

        // Attach click handler for the "share list" button.
        $("#content .todo-share").click(function() {
            doShare(id); // Call the share function with the list ID.
        });

        // Attach a submit handler for adding new tasks to the list.
        $("#content form").submit(function(e) {
            e.preventDefault(); // Prevent default form submission.
            var doc = jsonform(this); // Extract form data.
            doc.type = "task"; // Set document type to 'task'.
            doc.list_id = id; // Associate task with the current list.
            doc.updated_at = doc.created_at = new Date(); // Set timestamps.

            // Post the new task document to the database.
            config.db.post(doc, function(err, ok) {
                $("#content form input").val(""); // Clear the input field.
            });
        });

        // Attach a click handler to list items for task actions.
        $("#scrollable").on("click", "li", function(e) {
            var id = $(this).attr("data-id"); // Get task ID.
            if ($(e.target).hasClass("camera")) {
                // If the camera icon is clicked.
                if ($(e.target).hasClass("image")) {
                    goImage(id); // View existing image.
                } else {
                    doCamera(id); // Take a new photo.
                }
            } else {
                toggleChecked(id); // Toggle task's checked status.
            }
        });

        // Define the database change handler for the list page.
        window.dbChanged = function() {
            // Query the 'tasks' view for tasks belonging to this list.
            config.views(["tasks", {
                startkey : [id, {}], // Start key for tasks in this list.
                endkey : [id], // End key for tasks in this list.
                descending : true // Order tasks in descending order.
            }], function(err, view) {
                log("tasks", view); // Log retrieved tasks.
                // Render the tasks using the listItems template.
                $("#scrollable").html(config.t.listItems(view));
                // Add swipe-right gesture to reveal delete button for tasks.
                $("#scrollable li").on("swipeRight", function() {
                    var id = $(this).attr("data-id"); // Get task ID.
                    $(this).find("button").show().click(function() {
                        deleteItem(id); // Delete the task.
                    });
                });
            });
        };
        window.dbChanged(); // Call it once to populate the initial task list.
    });
}

// Deletes a document (list or task) from the database.
function deleteItem(id) {
    log("delete", id); // Log the deletion attempt.
    config.db.get(id, function(err, doc) {
        doc._deleted = true; // Mark the document for deletion.
        config.db.put(id, doc, function() {}); // Update the document.
    });
}

// Toggles the 'checked' status of a task.
function toggleChecked(id) {
    log("toggle", id); // Log the toggle attempt.
    config.db.get(id, function(err, doc) {
        doc.checked = !doc.checked; // Invert the checked status.
        doc.updated_at = new Date(); // Update the modification timestamp.
        config.db.put(id, doc, function() {}); // Update the document.
    });
}

// Initiates the camera functionality to add an image to a task.
function doCamera(id) {
    log("camera", id); // Log the camera action.
    // Check if the camera plugin is available.
    if (!(navigator.camera && navigator.camera.getPicture)) {
      return;
    }

    // Get a picture using the device's camera.
    navigator.camera.getPicture(function(imageData) {
        // On success, retrieve the task document.
        config.db(id, function(err, doc) {
            // Attach the image data to the document.
            doc._attachments = {
              "image" : {
                content_type : "image/jpg",
                data : imageData
              }
            };
            // Post the updated document with the attachment.
            config.db.post(doc, function(err, ok) {});
        });
    }, function(message) { // Callback for camera failure.
        // Optionally handle camera error messages here.
    }, {
        quality: 50, // Image quality.
        targetWidth : 1000, // Desired image width.
        targetHeight : 1000, // Desired image height.
        destinationType: Camera.DestinationType.DATA_URL // Return image as base64 string.
    });
}

/*
 * This function is responsible for displaying a photo
 * associated with a specific task, if one exists.
 */

// Navigates to and renders the image display screen for a task.
function goImage(id) {
    window.dbChanged = function() {}; // Temporarily disable dbChanged updates.
    // Retrieve the task document.
    config.db(id, function(err, doc) {
        // Construct the image path for display.
        doc.image_path = config.db([id, "image"]).pax.toString();
        drawContent(config.t.image(doc)); // Draw the image template.

        // Attach click handler for the "back" button on the image screen.
        $("#content .todo-image-back").click(function() {
            goList(doc.list_id); // Return to the list view.
        });

        // Attach click handler for the "delete image" button.
        $("#content .todo-image-del").click(function() {
            delete doc.image_path; // Remove image path from doc (for template).
            delete doc._attachments["image"]; // Remove the attachment data.
            // Post the updated document to remove the image.
            config.db.post(doc, function(err, ok) {
                goList(doc.list_id); // Return to the list view after deletion.
            });
        });
    });
}

/*
 * This section handles sharing functionality and user login/logout management.
 */

// Initiates the sharing process for a given list ID.
function doShare(id) {
    if (!config.user) {
        // If no user is logged in, prompt for login first.
        doFirstLogin(function(err) {
            if (err) {
                return loginErr(err); // Handle login errors.
            }
            log("login done", err, config.user); // Log successful login.
            goShare(id); // Proceed to the share screen.
        });
    } else {
        goShare(id); // If already logged in, go directly to share screen.
    }
}

// Renders the sharing interface for a specific list.
function goShare(id) {
    window.dbChanged = function() {}; // Temporarily disable dbChanged updates.
    // Retrieve the list document.
    config.db(id, function(err, doc) {
        // Query the 'profiles' view to get all user profiles.
        config.views("profiles", function(err, view) {
            view.title = doc.title; // Set the title for the share view.

            // Fold over the view and mark members as checked for the current list.
            var members = (doc.members || []).concat(doc.owner);

            // Iterate through profiles to mark existing members.
            for (var i = view.rows.length - 1; i >= 0; i--) {
                var row = view.rows[i];
                for (var j = members.length - 1; j >= 0; j--) {
                    var member = members[j];
                    log("row", row.id, member); // Log current row and member.
                    if (row.id == member) {
                        row.checked = "checked"; // Mark as checked if a member.
                    }
                }
            }

            drawContent(config.t.share(view)); // Draw the share template.

            // Attach click handler for the "back" button on the share screen.
            $("#content .todo-share-back").click(function() {
                goList(id); // Return to the list view.
            });

            // Attach click handler for toggling user sharing.
            $("#scrollable").on("click", "li", function() {
                var user = $(this).attr("data-id"); // Get the user ID.
                if (user !== doc.owner) {
                    // Only toggle sharing for non-owners.
                    toggleShare(doc, user, function() {
                        goShare(id); // Refresh the share screen after toggling.
                    });
                } else {
                    goShare(id); // Refresh if owner is clicked (no change).
                }
            });
        });
    });
}

// Toggles a user's membership in a list's shared members.
function toggleShare(doc, user, cb) {
    doc.members = doc.members || []; // Ensure members array exists.
    var i = doc.members.indexOf(user); // Check if user is already a member.
    if (i === -1) {
        doc.members.push(user); // Add user if not a member.
    } else {
        doc.members.splice(i, 1); // Remove user if already a member.
    }
    log("members", doc.members); // Log the updated members list.
    config.db.post(doc, cb); // Update the document in the database.
}

/*
 * This section handles the initial login process and
 * sets up existing data for the user's account.
 */

// Handles the first-time login process, including Facebook authentication.
function doFirstLogin(cb) {
    doFacebook(function(err, data) {
        if (err) {
            return cb(err); // Propagate Facebook login errors.
        }
        config.setUser(data, function(err, ok) {
            if (err) {
                return cb(err); // Propagate user setup errors.
            }
            registerFacebookToken(function(err, ok) {
                log("registerFacebookToken done " + JSON.stringify(err));
                if (err) {
                    log("registerFacebookToken err " + JSON.stringify([err, ok]));
                    return cb(err); // Propagate token registration errors.
                }
                createMyProfile(function(err) {
                    log("createMyProfile done " + JSON.stringify(err));
                    addMyUsernameToAllLists(function(err) {
                        log("addMyUsernameToAllLists done " + JSON.stringify(err));
                        if (err) {
                            return cb(err); // Propagate list update errors.
                        }
                        triggerSync(function(err, ok) {
                            log("triggerSync done " + JSON.stringify(err));
                            cb(err, ok); // Final callback after all steps.
                        });
                    });
                });
            });
        });
    });
}

// Registers the Facebook access token with the Sync Gateway.
function registerFacebookToken(cb) {
    var registerData = {
        remote_url : config.site.syncUrl, // URL of the Sync Gateway.
        email : config.user.email, // User's email.
        access_token : config.user.access_token // Facebook access token.
    };
    log("registerFacebookToken POST " + JSON.stringify(registerData));
    // Send a POST request to register the token.
    coax.post([config.server, "_facebook_token"], registerData, cb);
}

// Adds the current user as the owner to all existing lists.
function addMyUsernameToAllLists(cb) {
    // Query all lists, including their full documents.
    config.views(["lists", {include_docs : true}], function(err, view) {
        if (err) {
            return cb(err); // Handle view query errors.
        }
        var docs = []; // Array to hold updated documents.
        view.rows.forEach(function(row) {
            row.doc.owner = "p:" + config.user.user_id; // Assign ownership.
            docs.push(row.doc); // Add to the bulk update list.
        });
        // Perform a bulk update to save all modified lists.
        config.db.post("_bulk_docs", {docs:docs}, function(err, ok) {
            log("updated all docs", err, ok); // Log the bulk update result.
            cb(err, ok); // Callback with operation result.
        });
    });
}

// Creates a user profile document in the database.
function createMyProfile(cb) {
    log("createMyProfile user " + JSON.stringify(config.user));
    // Create a deep copy of the user object.
    var profileData = JSON.parse(JSON.stringify(config.user));
    profileData.type = "profile"; // Set document type to 'profile'.
    profileData.user_id = profileData.email; // Use email as user ID.
    delete profileData.email; // Remove redundant email field.
    log("createMyProfile put " + JSON.stringify(profileData));
    // Put the profile document into the database using a prefixed ID.
    config.db.put("p:" + profileData.user_id, profileData, cb);
}

/*
 * Functions to get user email address from Facebook
 * and obtain an access code for Sync Gateway verification.
 */

// Handles Facebook authentication flow.
function doFacebook(cb) {
    if (navigator && navigator.connection) {
        log("connection " + navigator.connection.type);
        if (navigator.connection.type == "none") {
            return cb({reason : "No network connection"}); // Handle no network.
        }
    }

    // TODO: The appId should ideally be pulled from a configuration.
    FacebookInAppBrowser.settings.appId = "501518809925546";
    FacebookInAppBrowser.settings.redirectUrl = 'http://console.couchbasecloud.com/index/';
    FacebookInAppBrowser.settings.permissions = 'email'; // Request email permission.
    FacebookInAppBrowser.login(function(err, accessToken) {
        if (err) {
            return cb(err); // Propagate Facebook login errors.
        }
        getFacebookUserInfo(accessToken, function(err, data) {
            if (err) {
                return cb(err); // Propagate user info retrieval errors.
            }
            log("got facebook user info", data); // Log user info.
            cb(false, data); // Callback with user data.
        });
    });
}

// Handles Facebook logout functionality.
function doFacebookLogout(token, cb) {
    if (navigator && navigator.connection) {
        log("connection " + navigator.connection.type);
        if (navigator.connection.type == "none") {
            return cb({
                reason : "No network connection"
            }); // Handle no network.
        }
    }
    FacebookInAppBrowser.settings.appId = "501518809925546";
    FacebookInAppBrowser.settings.redirectUrl = 'http://console.couchbasecloud.com/index/';
    FacebookInAppBrowser.settings.permissions = 'email';
    FacebookInAppBrowser.logout(token, function(err, data) {
        if (err) {
            return cb(err); // Propagate Facebook logout errors.
        }
        log("Logged out of facebook");
        config.user = null; // Clear the local user configuration.
        cb(false, data); // Callback with logout success.
    });
}

// Retrieves user information from Facebook's Graph API.
function getFacebookUserInfo(token, cb) {
    var url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + token;
    coax.get(url, function(err, data) {
        if (err) {
            return cb(err); // Propagate API call errors.
        }
        data.access_token = token; // Add the access token to the data.
        cb(false, data); // Callback with user information.
    });
}

// Obtains a new Facebook token, updating user config and registering with Sync Gateway.
function getNewFacebookToken(cb) {
    log("getNewFacebookToken");
    // This function is similar to doFirstLogin(), but it focuses on
    // refreshing the token and doesn't re-assign ownership of lists.

    doFacebook(function(err, data) {
        if (err) {
            return cb(err); // Handle Facebook authentication errors.
        }
        config.setUser(data, function(err, ok) {
            if (err) {
                return cb(err); // Handle user configuration update errors.
            }
            registerFacebookToken(cb); // Register the new token.
        });
    });
}

/*
 * Sync Manager: This module is executed upon the first login
 * and subsequently during every application boot.
 *
 * Its operation involves an initial single push replication.
 * Once this initial replication successfully completes,
 * it signifies a valid connection, allowing the system
 * to then initiate continuous push and pull replications.
 */

// Triggers the synchronization process with the remote database.
function triggerSync(cb, retryCount) {
    if (!config.user) {
        return log("no user"); // Do nothing if no user is configured.
    }
    var remote = {
        url : config.site.syncUrl, // URL of the remote Sync Gateway.
        auth : {facebook : {email : config.user.email}} // Authentication details.
    };
    // Note: The 'email' field in auth is used by Sync Gateway for Facebook authentication.
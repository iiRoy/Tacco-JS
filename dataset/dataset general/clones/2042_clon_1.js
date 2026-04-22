/*
 * The Little Library - Type I Clone Example
 *
 * This file is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments (added,
 * removed, or modified) have been altered extensively to demonstrate
 * visual difference while maintaining logical and structural identity.
 *
 * Original Copyright:
 * Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses
 */

// Define global variables for application configuration and state.

var currentHost = window.location.protocol + "//" + window.location.host; // This variable stores the full URL of the current host, including protocol.

var dbURL = document.URL.split("//"); // Split the document URL by "//" to parse its components.

dbURL = (dbURL[1] ? dbURL[1] : dbURL[0]).split("/"); // Further split the relevant part of the URL by "/" to get path segments.

var homeURL = dbURL[1]; // This variable represents the name of the database, typically extracted from the URL path.

var homeDB = currentHost + "/" + homeURL; // This constructs the complete URL for the home database.

var repOptions = { "continuous": true }; // Options for replication, set to continuous by default.

var templateDB = "http://library.iriscouch.com/library"; // The URL pointing to the template database for "The Little Library."

var signupURL = "http://www.thelittlelibrary.com/library.php"; // The URL for the PHP script responsible for user signup.

var onlineBase = "library.iriscouch.com"; // The base URL for the online database hosting all online user databases.

var maxDBSize = 250000000; // Default maximum database size in bytes (250 MB).

var homeUser = ''; // Variable to store the currently logged-in username.


// Initiate an AJAX call to retrieve the current user session information.

$.ajax( {
    url: '/_session?callback=', // Endpoint to get session details.
    dataType: 'json',          // Expected data type is JSON.
    async: false,              // Synchronous request to ensure user is loaded before other operations.
    success: function (session) {
        // Upon successful session retrieval, update the homeUser variable.
        homeUser = session.userCtx.name;
    }
} );


// Prepare to load language translations for the user interface.

var libLang = {}; // Object to hold all language-specific text strings.

$.ajax( {
    url: '/' + homeURL + '/_design/library/_view/currentLang?callback=', // Query the 'currentLang' view to find the active language.
    dataType: 'json',                                                  // Data is expected in JSON format.
    async: false,                                                      // Make this call synchronous.
    success: function (langJSON) {
        // Check if a custom language is already set in the database.
        if (langJSON.total_rows == '0') {
            // If no custom language is found, load the default language from 'language.json'.
            $.ajax( {
                url: '/' + homeURL + '/_design/library/language.json', // Path to the default language file.
                dataType: 'json',                                    // Again, expect JSON.
                async: false,                                        // Synchronous load.
                success: function (langData) {
                    // Populate libLang with texts from the default language file.
                    libLang = langData.texts;
                }
            } );
        }
        else {
            // If a custom language is specified, load it using its document ID.
            $.ajax( {
                url: '/' + homeURL + '/' + langJSON.rows[0].id, // URL to the custom language document.
                dataType: 'json',                             // JSON data type.
                async: false,                                 // Synchronous.
                success: function (langData) {
                    // Populate libLang with texts from the custom language document.
                    libLang = langData.texts;
                }
            } );
        }
    }
} );


// Extend jQuery's prototype with a function to handle user authentication and UI updates.

jQuery.fn.libraryAuth = function () {

    // Condition: User is already logged in (homeUser is defined and not null).
    if (homeUser != undefined || null) {

        // Specific check for online base and mismatched user/homeURL.
        // This might indicate an unauthorized access attempt or a need to redirect.
        if (onlineBase == window.location.host && homeUser != homeURL) {
            window.location.replace("login.html"); // Redirect to the login page.
        }

        // Prepend the username to the header of the footer for display.
        $('.ui-footer h4').prepend(homeUser + '<br />');


    } else {
        // Condition: User is NOT logged in.
        window.location.replace("login.html"); // Redirect to the login/signup page.
    }
    ;
};


// Extend jQuery's prototype with a function to create an online database for a user.

jQuery.fn.createOnlineDB = function (username, password) {

    // Format username for CouchDB's internal user ID structure.
    couchUser = "org.couchdb.user%3A" + username;
    couchUserUn = "org.couchdb.user:" + username;

    // Retrieve user information from CouchDB's _users database.
    $.getJSON(currentHost + '/_users/' + couchUser, function (userInfo) {
        passwordEnc = userInfo.password_sha; // Extract SHA-1 hashed password.
        saltEnc = userInfo.salt;             // Extract the salt used for hashing.

        // Send a POST request to the signup URL to create the online database.
        $.ajax( {
            url: signupURL, // The PHP signup script endpoint.
            type: "POST",   // HTTP POST method.
            data: { "username": username, "password": passwordEnc, "salt": saltEnc }, // Data payload for the request.
            error: function () {
                // Handle errors during online DB creation.
                alert(libLang.noOnline); // Display a language-specific error message.
                window.location.replace("index.html"); // Redirect to the main page.
            },
            success: function (onlineDB) {

                // If the online database setup was successful and returned a valid onlineDB name.
                if (onlineDB) {

                    currentRev = userInfo._rev; // Get the current revision of the user document.

                    // Update the user document in the local CouchDB _users database.
                    // This stores the onlineDB name and other user details.
                    $.couch.db("_users").saveDoc( {
                        "_id": couchUserUn,             // User's full CouchDB ID.
                        "_rev": currentRev,             // Current document revision.
                        "name": username,               // Username.
                        "onlineDB": onlineDB,           // Name of the newly created online database.
                        "password_sha": passwordEnc,    // Hashed password.
                        "salt": saltEnc,                // Password salt.
                        "type": "user",                 // Document type.
                        "roles": [username]             // User roles.
                    }, {
                        success: function (resp) {

                            // If the document save operation was successful.
                            if (resp) {
                                window.location.replace('login.html'); // Redirect to login page after successful setup.
                            }
                            ;
                        }
                    } );
                }
                else {
                    // If online DB creation failed (e.g., onlineDB is null or empty).
                    alert(libLang.noOnline); // Display error message.
                    window.location.replace("index.html"); // Redirect home.
                }
                ;
            }
        } );

    } );
};


// Extend jQuery's prototype with a function for handling user signup.

jQuery.fn.signupForm = function (username, password) {

    // First, sign up the user in the local CouchDB instance.
    $.couch.signup( { "name": username, "onlineDB": "", roles: [username] }, password, {
        success: function () {

            // On successful local signup, log the user in.
            $.couch.login( { "name": username, "password": password } );

            // Show a mobile page loading message to indicate activity.
            $.mobile.showPageLoadingMsg();

            // Then, initiate the creation of the online database.
            $('div').createOnlineDB(username, password);

        }
    } );
};


// Extend jQuery's prototype with a function to display the number of items in a category.

jQuery.fn.numShow = function (numlist) {
    // Fetch the count of items from the specified CouchDB view.
    $.getJSON('/' + homeURL + '/_design/library/_view/' + numlist + '?callback=', function (json) {
        // Update the UI element with the item count.
        $('.' + numlist + 'Total').addClass('ui-li-count ui-btn-up-c ui-btn-corner-all').html(json.total_rows);

    } );

};


// Extend jQuery's prototype with a function to display categories on the home page.

jQuery.fn.categoryShow = function () {

    // Retrieve the design document for the library to get available views (categories).
    $.getJSON('/' + homeURL + '/_design/library/?callback=', function (data) {

        // Iterate through each view (category) defined in the design document.
        $.each(data.views, function (singleView) {
            translatedSingleView = singleView; // Initialize with original view name.

            // Translate category names into the selected language.
            if (singleView == "books") {
                translatedSingleView = libLang.books;
            }
            if (singleView == "audio") {
                translatedSingleView = libLang.audio;
            }
            if (singleView == "videos") {
                translatedSingleView = libLang.videos;
            }
            if (singleView == "pictures") {
                translatedSingleView = libLang.pictures;
            }
            if (singleView == "documents") {
                translatedSingleView = libLang.documents;
            }
            if (singleView == "notes") {
                translatedSingleView = libLang.notes;
            }
            if (singleView == "courses") {
                translatedSingleView = libLang.courses;
            }
            // Exclude specific views (languages, currentLang) from being listed as categories.
            if (singleView != "languages" && singleView != "currentLang") {
                // Append a list item for each category to the homeList.
                $('ul.homeList').append('<li class="ui-li-has-count"><a href="library.html?type=' + singleView + '" rel="external" data-transition="slide">' + translatedSingleView + '<span class="' + singleView + 'Total"></span></a></li>');
                // Call numShow to display the count for this category.
                $('.' + singleView + 'Total').numShow(singleView);

                // Refresh the listview to apply jQuery Mobile styling.
                $('#home ul.homeList').listview('refresh');
            }
        } );

    } );

};


// Extend jQuery's prototype with a function to display a list of items within a given category.

jQuery.fn.listShow = function (category, libURL, local) {
    var categoryName = category; // Store the category name.

    $('h1').text(libLang[category]); // Set the page header to the translated category name.


    // Determine the JSON data type based on whether it's a local or remote request.
    if (local == false) {
        jsonUsed = "jsonp"; // Use JSONP for cross-domain requests.
    }
    else {
        jsonUsed = "json"; // Use standard JSON for same-domain requests.
    }

    // Make an AJAX request to fetch items for the specified category.
    $.ajax( {
        type: 'GET',                                     // HTTP GET method.
        url: libURL + '/_design/library/_view/' + categoryName, // URL to the CouchDB view for the category.
        processData: true,                               // Allow jQuery to process data.
        dataType: jsonUsed,                              // Data type (json or jsonp).
        error: function () {
            // Handle errors during data retrieval.
            alert('What happened?');
        },
        success: function (categoryData) {
            // Check if there are no items in the category.
            if (categoryData.rows == '') {

                $('ul.' + categoryName + 'List').append(''); // Append nothing if no items.
            }
            else {
                // Iterate through each item returned in the category data.
                $.each(categoryData.rows, function (cat, singleItem) {

                    var itemDate = '', // Initialize item date.
                        fileURL = '';  // Initialize file URL.

                    // Helper function to extract the file extension from a filename.
                    function getFileExtension(newFiles) {
                        return newFiles.split('.').pop();
                    }
                    ;


                    if (singleItem.key.date != '') {
                        itemDate = '(' + singleItem.key.date + ')'; // Format date if it exists.
                    }

                    // Construct the URL for the item's settings page.
                    settingsURL = libURL + '/_design/library/settings.html?id=' + singleItem.key._id + '&amp;type=' + singleItem.key.type;

                    // Iterate over attachments to find a default display file (e.g., index.html).
                    for (var filename in singleItem.key._attachments) {
                        // Prioritize common index page names.
                        if (filename == "default.htm" || filename == "default.html" || filename == "index.htm" || filename == "index.html") {
                            if (!local || local == false) {
                                fileURL = libURL + '/' + singleItem.key._id + '/' + filename; // Direct link for remote files.
                            }
                            else {
                                // Wrapper link for local files to handle embedded content.
                                fileURL = 'wrapper.html?name=' + singleItem.key.title + '&amp;url=' + libURL + '/' + singleItem.key._id + '&amp;path=' + filename;
                            }
                            break; // Stop after finding the first default file.
                        }
                    }
                    ;

                    // If no default index page was found, or fileURL is still empty.
                    if (!fileURL || fileURL == '' || fileURL == null || fileURL == 'undefined') {
                        // Try to link to the first available attachment.
                        for (var filename in singleItem.key._attachments) {
                            fileURL = libURL + '/' + singleItem.key._id + '/' + filename;
                            break; // Link to the very first attachment found.
                        }

                        if (local && local == true) {
                            // For local items, if no attachments, link to the details show function.
                            if (!filename || filename == '' || filename == null || filename == 'undefined') {
                                //fileURL = settingsURL; // Original comment: commented out.
                                fileURL = "_show/details/" + singleItem.key._id; // Link to CouchDB show function.
                            }
                        }
                        else {
                            libLang.settings = libLang.get; // For remote, settings link might be "Get".
                        }
                    }


                    // Prepare to create a thumbnail for the item if an image attachment exists.
                    itemThumb = '';
                    // Define common image file extensions for thumbnail creation.
                    imageArray = { 'jpg': 'jpg', 'gif': 'gif', 'png': 'png', 'jpeg': 'jpeg', 'JPG': 'JPG', 'GIF': 'GIF', 'PNG': 'PNG', 'JPEG': 'JPEG', 'BMP': 'BMP' };

                    // Iterate through attachments to find the first image and use it as a thumbnail.
                    for (var filename in singleItem.key._attachments) {
                        newFile = getFileExtension(filename); // Get the extension.

                        if (imageArray[newFile]) {
                            itemThumb = '<img src="' + libURL + '/' + singleItem.key._id + '/' + filename + '" />'; // Create image tag.
                            break; // Use the first image found as thumbnail.
                        }
                    }
                    ;

                    // Construct the HTML for each item and append it to the list.
                    $('ul.listedItems').append('<li><a href="' + fileURL + '" class="itemURL" rel="external">' + itemThumb + '<h3 class="itemTitle">' + (singleItem.key.title).replace(/(<([^>]+)>)/ig, "") + '</h3><p class="itemDetails"><strong>' + (singleItem.key.author).replace(/(<([^>]+)>)/ig, "") + '</strong> ' + (itemDate).replace(/(<([^>]+)>)/ig, "") + '<br />' + (singleItem.key.description).replace(/(<([^>]+)>)/ig, "") + '</p></a><a href="' + settingsURL + '" rel="external" class="used' + jsonUsed + '" data-library-url="' + singleItem.key._id + '">' + libLang.settings + '</a></li>');

                    // Refresh the listview to apply jQuery Mobile styles.
                    $('ul.listedItems').listview('refresh');

                } );
            }
            ;
        }
    } );
};


// Extend jQuery's prototype with a function to parse URL parameters.
// This function is adapted from: http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx

jQuery.fn.getParameter = function (key, default_) {

    // Set a default value if not provided.
    if (default_ == null) default_ = "add";

    // Escape special characters in the key for regex matching.
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

    // Construct a regular expression to find the key-value pair in the URL.
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href); // Execute the regex on the current URL.

    // Return the found value or the default value.
    if (qs == null)
        return default_;
    else
        return qs[1];
};


// Extend jQuery's prototype with a function to populate a form with item data for editing.

jQuery.fn.formShow = function (itemID) {

    var itemName = itemID; // The ID of the item to retrieve.

    // Fetch the JSON data for the specified item.
    $.getJSON('/' + homeURL + '/' + itemName + '?callback=', function (itemData) {
        // Check if the item data could not be retrieved.
        if (itemData.rows == '') {

            // Fade out the form and display an error message.
            $('.settingsForm').fadeOut(function () {
                $(this).html('<p>' + libLang.errorSettings + '</p>').fadeIn(500); // Get translated error message.
            } );
        }
        else {
            // If item data is found, populate the form fields.

            // Display the user who contributed the item, if available.
            if (itemData.user) {
                $('.settingsForm').prepend('<p style="color: #777777"><em>' + libLang.fromTheLibrary + ' <strong>' + itemData.user + '</strong></em></p>');
            }
            ;

            // Set the page header to the item's title.
            $('#settings h1').text(itemData.title);
            // Populate various input fields with item data.
            $('.settingsForm input#title').val(itemData.title);
            $('.settingsForm input#author').val(itemData.author);
            $('.settingsForm textarea#description').val(itemData.description);
            $('.settingsForm input#date').val(itemData.date);
            $('.settingsForm input#_rev').val(itemData._rev);
            $('.settingsForm input#type').val(itemData.type);
            $('.settingsForm input#filename').val(itemData.filename);
            // Set the form action URL for submission.
            $('form.settingsForm').attr( { "action": "/" + homeURL + "/" + itemData._id } );

            // Check if there are no attachments or if the attachments array is empty.
            if (!itemData.filename || !itemData._attachments || itemData._attachments.length <= 0) {
                return false; // No attachments to display.
            }
            else {
                // If attachments exist, create a section to list them.
                $('.settingsForm #_attachments').after('<div class="filesList" style="margin: 20px 0px; border: 1px solid #ccc; padding: 0px 20px; border-radius: 10px; background: #fff;"><h3>' + libLang.currentFilesLabel + '</h3></div>');
                // Iterate over each attachment to display its details.
                for (var filename in itemData._attachments) {

                    fileSizes = itemData._attachments[filename].length - 1; // Get raw file size.
                    newSize = Math.round(fileSizes / 1000);                 // Convert to KB.
                    // Format file size for display (KB, MB, GB).
                    if (newSize <= 999) {
                        newSize = newSize + 'KB';
                    }
                    else if (newSize <= 9999999) {
                        newSize = newSize + 'MB';
                    }
                    else if (newSize <= 999999999) {
                        newSize = newSize + 'GB';
                    }
                    /* mimeType = itemData._attachments[filename].content_type */ // Original comment, commented out.

                    fileURL = '/' + homeURL + '/' + itemData._id + '/' + filename; // Construct direct file URL.
                    // Append HTML for each file, including a link and a delete button.
                    $('.settingsForm .filesList').append('<p style="position:relative; border-top: 1px solid #ccc; padding-top: 10px;"><span data-inline="true"><strong><a href="' + fileURL + '" rel="external">' + filename + '</a></strong><span style="color: #999">, ' + newSize + '</span></span> <a title="' + libLang.deleteLabel + ' ' + filename + '" style="position:absolute; top: 2px; right: 0px; display: block;" rel="' + filename + '" data-role="button" data-icon="delete" title="Delete" data-iconpos="notext" class="deleteThisFile ui-btn ui-btn-icon-notext ui-btn-corner-all ui-shadow ui-btn-down-c ui-btn-up-c"><span class="ui-btn-inner ui-btn-corner-all" aria-hidden="true"><span class="ui-btn-text">' + libLang.deleteLabel + '</span><span class="ui-icon ui-icon-delete ui-icon-shadow"></span></span></a></p>');
                }
                ;
            }
        }
        ;
    } );
};


// Extend jQuery's prototype with a function to send form data (add or update an item).

jQuery.fn.sendForm = function (itemID, itemType) {

    // Retrieve all values from the form fields.
    var itemTitle = $('.settingsForm input#title').val(),        // Item title.
        itemAuthor = $('.settingsForm input#author').val(),      // Item author.
        itemDescription = $('.settingsForm textarea#description').val(), // Item description.
        itemDate = $('.settingsForm input#date').val(),          // Item date.
        itemRev = $('.settingsForm input#_rev').val(),           // Current revision ID.
        itemDelete = $('.settingsForm input#delete:checked').val(), // 'Yes' if delete checkbox is checked.
        itemType = $('.settingsForm select').val(),              // Item type (from dropdown).
        itemFilename = $('.settingsForm input:file').val();      // Name of the newly uploaded file.

    // Process the new uploaded file's filename.
    if (itemFilename == undefined || itemFilename == "") {
        $('.settingsForm input:file').remove(); // Remove the file input if no new file selected.
        itemFilename = "";                      // Clear filename.
    }
    else {
        itemFilename = itemFilename.replace(/^C:\\fakepath\\/i, ''); // Remove "C:\fakepath\" from filename.
    }


    // If no new file was uploaded, fall back to the existing filename.
    if (!itemFilename || itemFilename.length == 0) {
        itemFilename = $('.settingsForm input#filename').val();
    }

    // Enforce that a title must be provided (it's a required field).
    if (!itemTitle || itemTitle.length == 0) {
        alert(libLang.addTitle); // Display translated alert message.
        return;                  // Stop form submission.
    }

    // Check if the database size limit has been reached.
    dbSize = maxDBSize; // Initialize with the maximum allowed size.
    $.ajax( {
        url: "/" + homeURL, // URL to get database information.
        dataType: 'json',   // Expect JSON.
        async: false,       // Synchronous call to get DB size before proceeding.
        success: function (dbInfo) {
            dbSize = dbInfo.data_size; // Update dbSize with current data size.
        }
    } );
    // If not deleting an item and DB size exceeds limit, prevent submission.
    if (itemDelete != 'Yes' && dbSize >= maxDBSize) {
        alert(libLang.noSpace); // Display translated alert.
        return;                 // Stop form submission.
    }


    /*
    // Requires an uploaded file - original commented code, kept for Type I.
    if (!revData._attachments || revData._attachments.length == 0) {
        alert("Please select a file to upload.");
        return;
    }
    */


    // Proceed if the item is not marked for deletion.
    if (itemDelete != 'Yes') {

        // If itemID is not 'add', it means we are updating an existing record.
        if (itemID != 'add') {

            // Submit the form using AJAX to update the existing document.
            $(this).ajaxSubmit( {
                url: "/" + homeURL + "/" + itemID, // URL for the specific document.
                data: { "filename": itemFilename }, // Include filename in data.
                success: function (resp) {

                    // After successful submission, fetch the updated document to get its latest revision and attachments.
                    $.getJSON("/" + homeURL + "/" + itemID, function (revData) {
                        itemRev = revData._rev;           // Get the new revision.
                        itemAttachment = revData._attachments; // Get the attachments object.
                        user = revData.user;              // Get the user property.

                        // If there are no attachments after the update (or initially).
                        if (!revData._attachments || revData._attachments.length == 0) {

                            // Save the document without an _attachments field.
                            $.couch.db(homeURL).saveDoc( {
                                "_id": itemID,                 // Document ID.
                                "_rev": itemRev,               // New revision.
                                "filename": itemFilename,      // Filename.
                                "title": itemTitle,            // Title.
                                "author": itemAuthor,          // Author.
                                "type": itemType,              // Type.
                                "description": itemDescription, // Description.
                                "date": itemDate,              // Date.
                                "user": user                   // User.
                            }, {
                                success: function () {
                                    alert(libLang.saved);          // Display translated 'saved' message.
                                    window.location.replace("index.html"); // Redirect to home.
                                }
                            } );
                        }
                        else {
                            // If attachments exist, save the document including the _attachments field.
                            $.couch.db(homeURL).saveDoc( {
                                "_id": itemID,                 // Document ID.
                                "_rev": itemRev,               // New revision.
                                "filename": itemFilename,      // Filename.
                                "title": itemTitle,            // Title.
                                "author": itemAuthor,          // Author.
                                "type": itemType,              // Type.
                                "description": itemDescription, // Description.
                                "date": itemDate,              // Date.
                                "user": user,                  // User.
                                "_attachments": itemAttachment // Attachments object.
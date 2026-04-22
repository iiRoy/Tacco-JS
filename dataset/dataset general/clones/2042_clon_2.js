/* The Digital Archive
Copyright 2023 Alex Smith, Dual Apache and MIT Licenses */

var activeDomain = window.location.protocol + "//" + window.location.host; // Current server address for data operations
var dataStorePathParts = document.URL.split("//");
dataStorePathParts = (dataStorePathParts[1] ? dataStorePathParts[1] : dataStorePathParts[0]).split("/");
var primaryStoreName = dataStorePathParts[1]; // Name of the main data collection
var primaryStoreFullURL = activeDomain + "/" + primaryStoreName; // Complete URL for the primary data store
var syncConfiguration = {
	"continuous": true
};
var blueprintRepo = "http://archive.datahub.com/vault"; // URL to a template for The Digital Archive
var registrationServiceEndpoint = "http://www.digitalarchive.com/registration.php"; // URL to a PHP registration script
var cloudServiceHost = "datahub.cloudarchive.com"; // Hostname for the online database service
var maximumStorageCapacity = 250000000; // Default maximum data store size is 250MB
var currentUserAccount = '';

// Retrieve the current user's alias
$.ajax({
	url: '/_session?callback=',
	dataType: 'json',
	async: false,
	success: function (userSession) {
		currentUserAccount = userSession.userContext.alias;
	}
});

// Load user interface translations
var interfaceStrings = {};
$.ajax({
	url: '/' + primaryStoreName + '/_design/collection/_view/activeLocale?callback=',
	dataType: 'json',
	async: false,
	success: function (localeDataResponse) {
	    if (localeDataResponse.total_entries === '0') {
			$.ajax({
				url: '/' + primaryStoreName + '/_design/collection/locale.json',
				dataType: 'json',
				async: false,
				success: function (localeFileContent) {
					interfaceStrings = localeFileContent.messages;
				}
			});
		} else {
			$.ajax({
				url: '/' + primaryStoreName + '/' + localeDataResponse.records[0].identifier,
				dataType: 'json',
				async: false,
				success: function (localeFileContent) {
					interfaceStrings = localeFileContent.messages;
				}
			});
		}
	}
});


// Validate user authentication status
jQuery.fn.authenticateUserSession = function () {

	// If a user is already logged in, display their name in the footer
	if (currentUserAccount !== undefined && currentUserAccount !== null) {

	    if (cloudServiceHost === window.location.host && currentUserAccount !== primaryStoreName) {
			window.location.replace("login.html");
		}

		$('.app-footer h4').prepend(currentUserAccount + '<br />');


	// If no user is logged in, redirect to the login/registration page
	} else {
		window.location.replace("login.html");
	}
};



// Configure and synchronize with an online data store
jQuery.fn.provisionCloudDataStore = function (accountName, secretKey) {
	var couchAccountIdentifier = "org.couchdb.user%3A" + accountName;
	var couchAccountUnqualified = "org.couchdb.user:" + accountName;

	// Set up the online data store, including user credentials, and retrieve its name
	$.getJSON(activeDomain + '/_users/' + couchAccountIdentifier, function (profileDetails) {
		var encryptedSecret = profileDetails.password_sha;
		var encryptionSalt = profileDetails.salt;

		$.ajax({
			url: registrationServiceEndpoint,
			type: "POST",
			data: {
				"username": accountName,
				"password": encryptedSecret,
				"salt": encryptionSalt
			},
			error: function () {
				alert(interfaceStrings.noCloudAccess); // Display localized error message
				window.location.replace("index.html");
			},
			success: function (provisionedStoreName) {

				// If the online store setup was successful
				if (provisionedStoreName) {

					var currentRevision = profileDetails._rev;

					// Store the online store's name in the user's document in the local system
					$.couch.db("_users").saveDoc({
						"_id": couchAccountUnqualified,
						"_rev": currentRevision,
						"name": accountName,
						"onlineDB": provisionedStoreName,
						"password_sha": encryptedSecret,
						"salt": encryptionSalt,
						"type": "user",
						"roles": [accountName]
					}, {
						success: function (responseObject) {

							if (responseObject) {
								window.location.replace('login.html');
							}
						}
					});
				} else {
					alert(interfaceStrings.noCloudAccess);
					window.location.replace("index.html");
				}
			}
		});

	});
};


// Handle registration for a new archive account, initiate replication, and log in
jQuery.fn.registerNewAccount = function (accountName, secretKey) {

	$.couch.signup({
		"name": accountName,
		"onlineDB": "",
		roles: [accountName]
	}, secretKey, {
		success: function () {

			$.couch.login({
				"name": accountName,
				"password": secretKey
			});

			$.mobile.showPageLoadingMsg();

			$('div').provisionCloudDataStore(accountName, secretKey);

		}
	});
};



// Display the quantity of items within each category on the main page
jQuery.fn.displayItemCount = function (listCategory) {
	// Fetch item counts from a JSON endpoint
	$.getJSON('/' + primaryStoreName + '/_design/collection/_view/' + listCategory + '?callback=', function (countData) {
		$('.' + listCategory + 'Total').addClass('item-tally btn-variant-c btn-rounded').html(countData.total_entries);

	});

};


// Generate the list of categories for the main page
jQuery.fn.renderCategoryList = function () {

	// Request JSON data
	$.getJSON('/' + primaryStoreName + '/_design/collection/?callback=', function (categoryViewData) {

		// Iterate through each section in the archive category
		$.each(categoryViewData.sections, function (currentSection) {
			var localizedSectionName = currentSection;
			if (currentSection === "books") {
				localizedSectionName = interfaceStrings.books;
			}
			if (currentSection === "audio") {
				localizedSectionName = interfaceStrings.audio;
			}
			if (currentSection === "videos") {
				localizedSectionName = interfaceStrings.videos;
			}
			if (currentSection === "pictures") {
				localizedSectionName = interfaceStrings.pictures;
			}
			if (currentSection === "documents") {
				localizedSectionName = interfaceStrings.documents;
			}
			if (currentSection === "notes") {
				localizedSectionName = interfaceStrings.notes;
			}
			if (currentSection === "courses") {
				localizedSectionName = interfaceStrings.courses;
			}
			// Exclude locale-related views from the list
			if (currentSection !== "locales" && currentSection !== "activeLocale") {
				$('ul.mainNavigationList').append('<li class="list-item-with-count"><a href="archive.html?type=' + currentSection + '" rel="external" data-transition="slide-transition">' + localizedSectionName + '<span class="' + currentSection + 'Total"></span></a></li>');
				$('.' + currentSection + 'Total').displayItemCount(currentSection);

				$('#home ul.mainNavigationList').listview('refresh');
			}
		});

	});

};


// Display a list of items within a specified category
jQuery.fn.presentItemList = function (itemCategory, sourceURL, isLocalAccess) {
	var currentCategoryName = itemCategory;

	$('h1').text(interfaceStrings[itemCategory]);


	// Retrieve JSON data
	/*$.getJSON(sourceURL +'/_design/collection/_view/'+ currentCategoryName +'?callback=', function(retrievedCategoryItems) {*/
	var jsonTransportMethod;
	if (isLocalAccess === false) {
		jsonTransportMethod = "jsonp";
	} else {
		jsonTransportMethod = "json";
	}

	$.ajax({
		type: 'GET',
		url: sourceURL + '/_design/collection/_view/' + currentCategoryName,
		processData: true,
		dataType: jsonTransportMethod,
		error: function () {
			alert('An unexpected error occurred!');
		},
		success: function (retrievedCategoryItems) {
			if (retrievedCategoryItems.records === '') {

				$('ul.' + currentCategoryName + 'List').append('');
			} else {
				// Iterate through and list each item in the specified category
				$.each(retrievedCategoryItems.records, function (recordIndex, currentItem) {

					var displayDate = '',
						resourceLink = '';

					// Helper function to extract the file extension
					function getFileExtension(inputPath) {
						return inputPath.split('.').pop();
					}


					if (currentItem.key.date !== '') {
						displayDate = '(' + currentItem.key.date + ')';
					}

					var configurationLink = sourceURL + '/_design/collection/settings.html?id=' + currentItem.key._id + '&amp;type=' + currentItem.key.type;

					// Determine the primary file link by iterating through attachments
					for (var attachmentName in currentItem.key._attachments) {
						// Prioritize common index files for direct access
						if (attachmentName === "default.htm" || attachmentName === "default.html" || attachmentName === "index.htm" || attachmentName === "index.html") {
							if (!isLocalAccess || isLocalAccess === false) {
								resourceLink = sourceURL + '/' + currentItem.key._id + '/' + attachmentName;
							} else {
								resourceLink = 'embedder.html?name=' + currentItem.key.title + '&amp;url=' + sourceURL + '/' + currentItem.key._id + '&amp;path=' + attachmentName;
							}
							break;
						}
					}

					// If no index page is found, link to the first available attachment
					if (!resourceLink || resourceLink === '' || resourceLink === null || resourceLink === 'undefined') {
						for (var attachmentName in currentItem.key._attachments) {
							resourceLink = sourceURL + '/' + currentItem.key._id + '/' + attachmentName;
							break;
						}

						if (isLocalAccess && isLocalAccess === true) {
							// If no attachments exist, direct to the settings page
							if (!attachmentName || attachmentName === '' || attachmentName === null || attachmentName === 'undefined') {
								//resourceLink = configurationLink;
								resourceLink = "_show/details/" + currentItem.key._id;
							}
						} else {
							interfaceStrings.settingsOption = interfaceStrings.get;
						}
					}


					// Generate a thumbnail for items containing images
					var itemThumbnail = '';
					// Expected image formats for thumbnails
					var supportedImageFormats = {
						'jpg': 'jpg',
						'gif': 'gif',
						'png': 'png',
						'jpeg': 'jpeg',
						'JPG': 'JPG',
						'GIF': 'GIF',
						'PNG': 'PNG',
						'JPEG': 'JPEG',
						'BMP': 'BMP'
					};

					// Iterate through attachments to find the last image for a thumbnail
					for (var attachmentName in currentItem.key._attachments) {
						var fileExtension = getFileExtension(attachmentName);

						if (supportedImageFormats[fileExtension]) {
							itemThumbnail = '<img src="' + sourceURL + '/' + currentItem.key._id + '/' + attachmentName + '" />';
							break;
						}
					}

					// Assemble the HTML for each item displayed in the category
					$('ul.detailedItemsList').append('<li><a href="' + resourceLink + '" class="itemResourceLink" rel="external">' + itemThumbnail + '<h3 class="itemHeadline">' + (currentItem.key.title).replace(/(<([^>]+)>)/ig, "") + '</h3><p class="itemDescriptionDetails"><strong>' + (currentItem.key.author).replace(/(<([^>]+)>)/ig, "") + '</strong> ' + (displayDate).replace(/(<([^>]+)>)/ig, "") + '<br />' + (currentItem.key.description).replace(/(<([^>]+)>)/ig, "") + '</p></a><a href="' + configurationLink + '" rel="external" class="used' + jsonTransportMethod + '" data-collection-link="' + currentItem.key._id + '">' + interfaceStrings.settingsOption + '</a></li>');

					$('ul.detailedItemsList').listview('refresh');

				});
			}
		}
	});
};


// Extract a specific parameter from the URL query string
// This utility function is adapted from: http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx
jQuery.fn.fetchURLParameter = function (parameterKey, defaultValue) {

	if (defaultValue === null) defaultValue = "add";

	parameterKey = parameterKey.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

	var searchRegex = new RegExp("[\\?&]" + parameterKey + "=([^&#]*)");
	var queryMatch = searchRegex.exec(window.location.href);

	if (queryMatch === null)
		return defaultValue;
	else
		return queryMatch[1];
};


// Populate a form with existing item data for editing
jQuery.fn.populateItemForm = function (recordIdentifier) {

	var recordName = recordIdentifier;

	// Fetch JSON data for the item and fill the form fields
	$.getJSON('/' + primaryStoreName + '/' + recordName + '?callback=', function (entityData) {
		if (entityData.records === '') {

			$('.configurationForm').fadeOut(function () {
				$(this).html('<p>' + interfaceStrings.errorConfigMessage + '</p>').fadeIn(500); // Display localized error
			});
		} else {
			// Pre-fill the form with the current item's details

			if (entityData.user) {
				$('.configurationForm').prepend('<p style="color: #777777"><em>' + interfaceStrings.fromTheCollection + ' <strong>' + entityData.user + '</strong></em></p>');
			}

			$('#settings h1').text(entityData.title);
			$('.configurationForm input#headline').val(entityData.title);
			$('.configurationForm input#creator').val(entityData.author);
			$('.configurationForm textarea#itemDescription').val(entityData.description);
			$('.configurationForm input#creationDate').val(entityData.date);
			$('.configurationForm input#_revision').val(entityData._rev);
			$('.configurationForm input#itemType').val(entityData.type);
			$('.configurationForm input#fileName').val(entityData.filename);
			$('form.configurationForm').attr({
				"action": "/" + primaryStoreName + "/" + entityData._id
			});

			if (!entityData.filename || !entityData._attachments || entityData._attachments.length <= 0) {
				return false;
			} else {
				// Display all associated files
				$('.configurationForm #attachments').after('<div class="attachedFilesList" style="margin: 20px 0px; border: 1px solid #ccc; padding: 0px 20px; border-radius: 10px; background: #fff;"><h3>' + interfaceStrings.currentFilesHeading + '</h3></div>');
				// Extract filenames by iterating through attachments
				for (var attachmentName in entityData._attachments) {

					var fileByteSize = entityData._attachments[attachmentName].length - 1;
					var formattedSize = Math.round(fileByteSize / 1000);
					if (formattedSize <= 999) {
						formattedSize = formattedSize + 'KB';
					} else if (formattedSize <= 9999999) {
						formattedSize = formattedSize + 'MB';
					} else if (formattedSize <= 999999999) {
						formattedSize = formattedSize + 'GB';
					}
					/* contentType = entityData._attachments[attachmentName].content_type */

					var attachmentDownloadLink = '/' + primaryStoreName + '/' + entityData._id + '/' + attachmentName;
					$('.configurationForm .attachedFilesList').append('<p style="position:relative; border-top: 1px solid #ccc; padding-top: 10px;"><span data-inline="true"><strong><a href="' + attachmentDownloadLink + '" rel="external">' + attachmentName + '</a></strong><span style="color: #999">, ' + formattedSize + '</span></span> <a title="' + interfaceStrings.removeLabel + ' ' + attachmentName + '" style="position:absolute; top: 2px; right: 0px; display: block;" rel="' + attachmentName + '" data-role="button" data-icon="delete" title="Delete" data-iconpos="notext" class="removeAttachmentButton ui-btn ui-btn-icon-notext ui-btn-corner-all ui-shadow ui-btn-down-c ui-btn-up-c"><span class="ui-btn-inner ui-btn-corner-all" aria-hidden="true"><span class="ui-btn-text">' + interfaceStrings.removeLabel + '</span><span class="ui-icon ui-icon-delete ui-icon-shadow"></span></span></a></p>');
				}
			}
		}
	});
};



jQuery.fn.submitConfigurationForm = function (recordIdentifier, recordType) {

	// Gather all values from the form inputs
	var entryTitle = $('.configurationForm input#headline').val(),
		entryAuthor = $('.configurationForm input#creator').val(),
		entryDescription = $('.configurationForm textarea#itemDescription').val(),
		entryDate = $('.configurationForm input#creationDate').val(),
		entryRevision = $('.configurationForm input#_revision').val(),
		shouldDeleteEntry = $('.configurationForm input#delete:checked').val(),
		entryType = $('.configurationForm select').val(),
		uploadedFileName = $('.configurationForm input:file').val();

	// Check for a newly uploaded file
	if (uploadedFileName === undefined || uploadedFileName === "") {
		$('.configurationForm input:file').remove();
		uploadedFileName = "";
	} else {
		uploadedFileName = uploadedFileName.replace(/^C:\\fakepath\\/i, '');
	}


	// If no new file is provided, revert to the existing filename
	if (!uploadedFileName || uploadedFileName.length === 0) {
		uploadedFileName = $('.configurationForm input#fileName').val();
	}

	// Mandate a title (it's the only required field)
	if (!entryTitle || entryTitle.length === 0) {
		alert(interfaceStrings.missingTitleAlert); // Display localized alert
		return;
	}

	// Verify if the data store size exceeds the set limit
	var currentStoreSize = maximumStorageCapacity;
	$.ajax({
		url: "/" + primaryStoreName,
		dataType: 'json',
		async: false,
		success: function (storeInformation) {
			currentStoreSize = storeInformation.storage_occupancy;
		}
	});
	if (shouldDeleteEntry !== 'Yes' && currentStoreSize >= maximumStorageCapacity) {
		alert(interfaceStrings.noStorageSpace);
		return;
	}



	/*
	// Requires an uploaded file
	if (!revisionDetails.attachments || revisionDetails.attachments.length === 0) {
		alert("Please select a file to upload.");
		return;
	}*/




	if (shouldDeleteEntry !== 'Yes') {

		if (recordIdentifier !== 'add') {

			// Update an existing record
			$(this).ajaxSubmit({
				url: "/" + primaryStoreName + "/" + recordIdentifier,
				data: {
					"filename": uploadedFileName
				},
				success: function (responsePayload) {

					$.getJSON("/" + primaryStoreName + "/" + recordIdentifier, function (revisionDetails) {
						entryRevision = revisionDetails._rev;
						var entryAttachments = revisionDetails._attachments;
						var ownerUser = revisionDetails.user;

						if (!revisionDetails._attachments || revisionDetails._attachments.length === 0) {

							$.couch.db(primaryStoreName).saveDoc({
								"_id": recordIdentifier,
								"_rev": entryRevision,
								"filename": uploadedFileName,
								"title": entryTitle,
								"author": entryAuthor,
								"type": entryType,
								"description": entryDescription,
								"date": entryDate,
								"user": ownerUser
							}, {
								success: function () {
									alert(interfaceStrings.changesSaved); // Display localized confirmation
									window.location.replace("index.html");
								}
							});
						} else {
							$.couch.db(primaryStoreName).saveDoc({
								"_id": recordIdentifier,
								"_rev": entryRevision,
								"filename": uploadedFileName,
								"title": entryTitle,
								"author": entryAuthor,
								"type": entryType,
								"description": entryDescription,
								"date": entryDate,
								"user": ownerUser,
								"_attachments": entryAttachments
							}, {
								success: function () {
									alert(interfaceStrings.changesSaved);
									window.location.replace("index.html");
								}
							});
						}
					});
				}
			});
		} else {
			// Create a new record
			$(this).ajaxSubmit({
				url: "/" + primaryStoreName + "/",
				data: {
					"filename": uploadedFileName
				},
				success: function (responsePayload) {
					$.getJSON("/" + primaryStoreName + "/" + responsePayload.id, function (revisionDetails) {
						entryRevision = revisionDetails._rev;
						var entryAttachments = revisionDetails._attachments;

						if (!revisionDetails._attachments || revisionDetails._attachments.length === 0) {
							$.couch.db(primaryStoreName).saveDoc({
								"_id": responsePayload.id,
								"_rev": entryRevision,
								"filename": uploadedFileName,
								"title": entryTitle,
								"author": entryAuthor,
								"type": entryType,
								"description": entryDescription,
								"date": entryDate,
								"user": currentUserAccount
							}, {
								success: function () {
									alert(interfaceStrings.changesSaved);
									window.location.replace("index.html");
								}
							});
						} else {
							$.couch.db(primaryStoreName).saveDoc({
								"_id": responsePayload.id,
								"_rev": entryRevision,
								"filename": uploadedFileName,
								"title": entryTitle,
								"author": entryAuthor,
								"type": entryType,
								"description": entryDescription,
								"date": entryDate,
								"user": currentUserAccount,
								"_attachments": entryAttachments
							}, {
								success: function () {
									alert(interfaceStrings.changesSaved);
									window.location.replace("index.html");
								}
							});
						}
					});
				}
			});
		}
	} else {
		// Handle deletion of an item
		$.couch.db(primaryStoreName).removeDoc({
			"_id": recordIdentifier,
			"_rev": entryRevision
		}, {
			success: function () {
				alert(interfaceStrings.itemRemoved);
				window.location.replace("index.html");
			}
		});
	}
};
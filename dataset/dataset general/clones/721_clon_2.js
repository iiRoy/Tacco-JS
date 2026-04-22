let currentApplicationData = null;
let activeCategory = null;
let chosenItems = [];
let presentPageIndex = 0;
const recordsPerPage = 10;
// Note: This value should correspond to the server-side default.


$("#uploadActionBtn").on("click", function() {
	if (currentApplicationData === null) {
		window.alert("Kindly choose an application initially.");
		return false;
	}
});


$("#downloadActionBtn").on("click", function() {
	if (currentApplicationData === null) {
		window.alert("Kindly choose an application initially.");
		return false;
	}
	if (activeCategory === null) {
		window.alert("Kindly select a category initially.");
		return false;
	}
});


const entityExplorerApp = angular.module("entityExplorerApplication", ["xeditable"]);


entityExplorerApp.controller("entityListController", function entityListController(scopeContext) {


	if (activeApplication === null) {
		scopeContext.chosenApplication = "Select an App";
	}
	else {
		scopeContext.chosenApplication = activeApplication;
	}


	scopeContext.activeApplicationEntity = null;
	scopeContext.uniqueIdField = null;
	scopeContext.chosenCategory = "";
	scopeContext.categories = [];
	scopeContext.itemAttributes = null;
	scopeContext.itemList = [];
	scopeContext.previousPageLink = scopeContext.nextPageLink = null;
	scopeContext.applications = [];


	refreshApplicationCollection(scopeContext);



	scopeContext.pickApplication = function(applicationName) {

		scopeContext.uniqueIdField = "";

		/* Temporarily commented out: session storage for application */
		// $store.set("session_app", app);

		// Deactivate the category deletion button upon new application choice.
		let deleteButtonElement = $("#delete-category")[0];
		let isDisabledFlag = deleteButtonElement.className.indexOf("deactivated");
		if (isDisabledFlag === -1) {
			deleteButtonElement.className += " deactivated";
		}

		let itemDeleteButton = $("#delete-items")[0];
		isDisabledFlag = itemDeleteButton.className.indexOf("deactivated");
		if (isDisabledFlag === -1) {
			itemDeleteButton.className += " deactivated";
		}


		scopeContext.chosenCategory = "";
		chosenItems = [];


		scopeContext.itemAttributes = null;
		scopeContext.chosenApplication = applicationName;
		scopeContext.categories = [];
		scopeContext.itemList = [];
		activityIndicator.startSpinning($("#loadingDisplay")[0]);

		const applications = scopeContext.applications;

		for (let appIndex in applications) {
			const currentAppEntry = applications[appIndex];
			if (currentAppEntry.name === applicationName) {
				currentApplicationData = currentAppEntry;
				break;
			}
		}

		scopeContext.activeApplicationEntity = currentApplicationData;

		$.ajax({
			url: "/api/v2/categories/",
			type: "GET",
			beforeSend: function(xmlHttpRequest) { xmlHttpRequest.setRequestHeader('AppId', currentApplicationData.identifier); },
			success: function(responseData) {
				activityIndicator.stopSpinning();
				const categoryList = responseData["results"];
				scopeContext.$apply(function() {
					console.info(categoryList);
					scopeContext.categories = categoryList;
					if (initialCategory !== null) {
						scopeContext.pickCategory(initialCategory, 0);
					}
				});

			},

			error: function(xmlHttpRequest, status, errorDetails) {

				activityIndicator.stopSpinning();
				window.alert("Operation could not be finished. Server Issue!");
			}
		});


	};


	scopeContext.pickCategory = function(categoryName, entryIndex) {
		scopeContext.chosenCategory = categoryName;
		activeCategory = categoryName;
		// categoryName.selected = true; // This line was likely problematic in the original if categoryName is a string

		scopeContext.itemList = [];
		chosenItems = [];


		activityIndicator.startSpinning($("#loadingDisplay")[0]);


		// Retrieve the schema definition for the selected category.
		$.ajax({
			url: "/api/v2/categories/schema/" + categoryName + "/",
			type: "GET",
			beforeSend: function(xmlHttpRequest) { xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier); },
			success: function(responseData) {

				scopeContext.$apply(function() {
					scopeContext.categorySchema = responseData;
				});
			}

		});

		// Activate the button for category removal.
		let deleteCategoryButton = $("#delete-category")[0];
		deleteCategoryButton.className = deleteCategoryButton.className.replace("deactivated", "");

		// Deactivate the button for item removal.
		let itemDeleteButton = $("#delete-items")[0];
		let isDisabledFlag = itemDeleteButton.className.indexOf("deactivated");
		if (isDisabledFlag === -1) {
			itemDeleteButton.className += " deactivated";
		}



		const allTableRows = $("#categories-table").find("tr");
		for (let rowIndex = 0; rowIndex < allTableRows.length; rowIndex++) {
			let currentRow = allTableRows[rowIndex];
			currentRow.className = currentRow.className.replace("selected-row", "");
		}

		let currentRow = allTableRows[entryIndex + 1];
		if (currentRow !== undefined) {
			if (currentRow.className.indexOf("selected-row") === -1) {
				currentRow.className += " selected-row";
			}
			else {
				currentRow.className = currentRow.className.replace("selected-row", "");
			}
		}



		$.ajax({
			url: "/api/v2/categories/" + categoryName + "/",
			type: "GET",
			beforeSend: function(xmlHttpRequest) { xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier); },
			success: function(responseData) {
				const objectsRetrieved = responseData["results"];
				scopeContext.totalCount = responseData["count"];

				activityIndicator.stopSpinning();

				scopeContext.itemAttributes = [];
				const attributeSet = {};
				for (let itemIdx in objectsRetrieved) {
					const currentItem = objectsRetrieved[itemIdx];
					for (let attributeKey in currentItem) {
						attributeSet[attributeKey] = 1;
					}
				}

				scopeContext.uniqueIdField = "_id";
				scopeContext.$apply(function() {

					delete attributeSet["_id"];

					for (let attributeName in attributeSet) {
						scopeContext.itemAttributes.push(attributeName);
					}
					scopeContext.itemList = objectsRetrieved;
					scopeContext.previousPageLink = responseData["previous"];
					scopeContext.nextPageLink = responseData["next"];

				});

				$("#paginationControls").show();

				scopeContext.displayPaginationInfo();

			},
			error: function(xmlHttpRequest, status, errorDetails) {

				activityIndicator.stopSpinning();
				window.alert("Operation could not be finished. Server Issue!");
			}
		});

	}


	scopeContext.displayPaginationInfo = function() {

		let startIndex = 0;
		let endIndex = 0;
		if (scopeContext.previousPageLink === null) {
			startIndex = 1;
			endIndex = scopeContext.itemList.length;
		}
		else {
			const regexMatch = scopeContext.previousPageLink.match(/\d+/);
			const previousPageNumber = regexMatch[0];
			startIndex = eval(previousPageNumber) * recordsPerPage + 1;
			endIndex = startIndex + scopeContext.itemList.length - 1;
		}

		const messageText = "Displaying records " + startIndex.toString() + " to " + endIndex.toString() + " out of " + scopeContext.totalCount;
		$("#paginationText").text(messageText);

	}


	scopeContext.goToPreviousPage = function() {

		if (scopeContext.previousPageLink !== null) {

			activityIndicator.startSpinning($("#loadingDisplay")[0]);

			$.ajax({
				url: "/api/v2/categories/" + scopeContext.chosenCategory + "/" + scopeContext.previousPageLink,
				type: "GET",
				beforeSend: function(xmlHttpRequest) { xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier); },
				success: function(responseData) {
					const objectsRetrieved = responseData["results"];
					activityIndicator.stopSpinning();

					scopeContext.itemAttributes = [];
					const attributeSet = {};
					for (let itemIdx in objectsRetrieved) {
						const currentItem = objectsRetrieved[itemIdx];
						for (let attributeKey in currentItem) {
							attributeSet[attributeKey] = 1;
						}
					}

					scopeContext.uniqueIdField = "_id";
					scopeContext.$apply(function() {

						delete attributeSet["_id"];

						for (let attributeName in attributeSet) {
							scopeContext.itemAttributes.push(attributeName);
						}
						scopeContext.itemList = objectsRetrieved;
						scopeContext.previousPageLink = responseData["previous"];
						scopeContext.nextPageLink = responseData["next"];
						scopeContext.totalCount = responseData["count"];


					});

					scopeContext.displayPaginationInfo();

					// Disable item deletion capability.
					let itemDeleteButton = $("#delete-items")[0];
					let isDisabledFlag = itemDeleteButton.className.indexOf("deactivated");
					if (isDisabledFlag === -1) {
						itemDeleteButton.className += " deactivated";
					}
				},
				error: function(xmlHttpRequest, status, errorDetails) {

					activityIndicator.stopSpinning();
					window.alert("Operation could not be finished. Server Issue!");
				}
			});

		}
		else {
			return false;
		}

	}


	scopeContext.goToNextPage = function() {

		if (scopeContext.nextPageLink !== null) {

			activityIndicator.startSpinning($("#loadingDisplay")[0]);

			$.ajax({
				url: "/api/v2/categories/" + scopeContext.chosenCategory + "/" + scopeContext.nextPageLink,
				type: "GET",
				beforeSend: function(xmlHttpRequest) { xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier); },
				success: function(responseData) {
					const objectsRetrieved = responseData["results"];
					activityIndicator.stopSpinning();

					scopeContext.itemAttributes = [];
					const attributeSet = {};
					for (let itemIdx in objectsRetrieved) {
						const currentItem = objectsRetrieved[itemIdx];
						for (let attributeKey in currentItem) {
							attributeSet[attributeKey] = 1;
						}
					}

					scopeContext.uniqueIdField = "_id";
					scopeContext.$apply(function() {

						delete attributeSet["_id"];

						for (let attributeName in attributeSet) {
							scopeContext.itemAttributes.push(attributeName);
						}
						scopeContext.itemList = objectsRetrieved;
						scopeContext.previousPageLink = responseData["previous"];
						scopeContext.nextPageLink = responseData["next"];
						scopeContext.totalCount = responseData["count"];

					});

					scopeContext.displayPaginationInfo();

					// Disable item deletion capability.
					let itemDeleteButton = $("#delete-items")[0];
					let isDisabledFlag = itemDeleteButton.className.indexOf("deactivated");
					if (isDisabledFlag === -1) {
						itemDeleteButton.className += " deactivated";
					}

				},
				error: function(xmlHttpRequest, status, errorDetails) {

					activityIndicator.stopSpinning();
					window.alert("Operation could not be finished. Server Issue!");
				}
			});

		}
		else {
			return false;
		}

	}

	scopeContext.toggleItemSelection = function(itemId, entryIndex) {

		let currentRow = $("#itemDataTable").find("tr")[entryIndex + 1];
		if (currentRow.className.indexOf("selected-row") === -1) {
			currentRow.className += " selected-row";
			chosenItems.push(itemId);
		}
		else {
			currentRow.className = currentRow.className.replace("selected-row", "");
			let removalPosition = chosenItems.indexOf(itemId);
			if (removalPosition > -1) {
				chosenItems.splice(removalPosition, 1);
			}
		}

		let itemDeleteButton = $("#delete-items")[0];
		// Enable deletion for chosen items.
		if (chosenItems.length > 0) {

			itemDeleteButton.className = itemDeleteButton.className.replace("deactivated", "");
		}
		else {
			itemDeleteButton.className += " deactivated";
		}


	}


	scopeContext.removeCategory = function() {

		const deletionConfirmed = window.confirm("Alert: All items within this category will be removed.\nAre you certain you wish to delete this category?");
		if (deletionConfirmed === true && activeCategory !== null) {

			activityIndicator.startSpinning($("#loadingDisplay")[0]);

			$.ajax({
				url: "/api/v2/categories/" + activeCategory + "/",
				type: "DELETE",
				beforeSend: function(xmlHttpRequest, ajaxSettings) {
					if (!isCsrfSafeOperation(ajaxSettings.type) && isSameOriginUrl(ajaxSettings.url)) {
						// Submit the token for same-origin, relative URLs exclusively.
						// Submit the token only if the request method requires CSRF protection.
						// Utilizing the previously obtained CSRFToken value.
						const csrfTokenValue = $.cookie('csrf_token_val');
						xmlHttpRequest.setRequestHeader("X-CSRFToken", csrfTokenValue);
					}
					xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier);

				},
				success: function(responseData) {
					activityIndicator.stopSpinning();

					scopeContext.$apply(function() {
						const categoryIndex = scopeContext.categories.indexOf(scopeContext.chosenCategory);
						if (categoryIndex > -1) {
							scopeContext.categories.splice(categoryIndex, 1);

						}
						scopeContext.itemAttributes = [];
						scopeContext.itemList = [];
						scopeContext.chosenCategory = "";
						activeCategory = "";
						scopeContext.uniqueIdField = null;
						scopeContext.previousPageLink = scopeContext.nextPageLink = null;

					});


					// Deactivate delete buttons
					let deleteCategoryButton = $("#delete-category")[0];
					let isDisabledFlag = deleteCategoryButton.className.indexOf("deactivated");
					if (isDisabledFlag === -1) {
						deleteCategoryButton.className += " deactivated";
					}

					deleteCategoryButton = $("#delete-items")[0];
					isDisabledFlag = deleteCategoryButton.className.indexOf("deactivated");
					if (isDisabledFlag === -1) {
						deleteCategoryButton.className += " deactivated";
					}

					$("#paginationText").text("");
					$("#paginationControls").hide();

				},
				error: function(xmlHttpRequest, status, errorDetails) {

					activityIndicator.stopSpinning();
					window.alert("Operation could not be finished. Server Issue!");
				}

			});

		}
		else {
			return false;
		}

	}

	scopeContext.removeSelectedItems = function() {

		const deletionConfirmed = window.confirm("Alert: All chosen items will be removed.\nAre you certain you wish to delete these items?");

		if (deletionConfirmed === true && activeCategory !== null) {

			activityIndicator.startSpinning($("#loadingDisplay")[0]);
			for (let itemIndex = 0; itemIndex < chosenItems.length; itemIndex++) {
				let successfulDeletions = 0;
				$.ajax({
					url: "/api/v2/categories/" + activeCategory + "/" + chosenItems[itemIndex] + "/",
					type: "DELETE",
					context: successfulDeletions,
					beforeSend: function(xmlHttpRequest, ajaxSettings) {
						if (!isCsrfSafeOperation(ajaxSettings.type) && isSameOriginUrl(ajaxSettings.url)) {
							// Submit the token for same-origin, relative URLs exclusively.
							// Submit the token only if the request method requires CSRF protection.
							// Utilizing the previously obtained CSRFToken value.
							const csrfTokenValue = $.cookie('csrf_token_val');
							xmlHttpRequest.setRequestHeader("X-CSRFToken", csrfTokenValue);
						}
						xmlHttpRequest.setRequestHeader('AppId', scopeContext.activeApplicationEntity.identifier);
					}
let currentApplicationData = null;
let activeClassName = null;
const chosenItems = new Set();
let currentPageIndex = 0; // Not explicitly used in original pagination links, but good to keep.
const recordsPerPage = 10; // Record count per page.

// Utility for handling AJAX errors consistently.
function handleAjaxError(xhr, status, error) {
  hideLoadingIndicator(document.getElementById('loadingSpinner'));
  const errorMessage = xhr.responseJSON ? xhr.responseJSON.message : "An unexpected server error occurred.";
  alert(`Operation Failed: ${errorMessage}`);
  console.error("AJAX Error:", status, error, xhr);
}

// Utility for managing loading spinner visibility.
function showLoadingIndicator(spinnerElement) {
  if (spinnerElement && typeof myspinner !== 'undefined') {
    myspinner.spin(spinnerElement);
  }
}

function hideLoadingIndicator(spinnerElement) {
  if (spinnerElement && typeof myspinner !== 'undefined') {
    myspinner.stop();
  }
}

// Utility to manage button states (disabled/enabled)
const domUtils = {
  getButton: (id) => document.getElementById(id),
  disableButton: (buttonId) => {
    const btn = domUtils.getButton(buttonId);
    if (btn && !btn.classList.contains("disabled")) {
      btn.classList.add("disabled");
    }
  },
  enableButton: (buttonId) => {
    const btn = domUtils.getButton(buttonId);
    if (btn && btn.classList.contains("disabled")) {
      btn.classList.remove("disabled");
    }
  },
  toggleClassChecked: (element, shouldBeChecked) => {
    if (element) {
      if (shouldBeChecked) {
        if (!element.classList.contains("checked")) {
          element.classList.add("checked");
        }
      } else {
        element.classList.remove("checked");
      }
    }
  }
};


// Event listener for the file upload control
document.getElementById("uploadButton").addEventListener("click", function(evt) {
  if (currentApplicationData === null) {
    alert("Please ensure an application is selected before uploading.");
    evt.preventDefault();
    return;
  }
});

// Event listener for the file download control
document.getElementById("downloadButton").addEventListener("click", function(evt) {
  if (currentApplicationData === null) {
    alert("An application must be selected first to proceed with download.");
    evt.preventDefault();
    return;
  }
  if (activeClassName === null) {
    alert("You need to select a data class before initiating a download.");
    evt.preventDefault();
    return;
  }
});

// Main Angular module for the data explorer interface
const dataExplorerModule = angular.module('dataExplorerModule', ['xeditable']);

// Controller for managing class lists and data objects
dataExplorerModule.controller('ExplorerController', function ExplorerController(scopeInstance) {

  // Initialize selected application display
  scopeInstance.currentApplicationDisplayName = currentApplicationData ? currentApplicationData.name : "Select an Application";

  // Controller's internal state variables
  scopeInstance.activeApplicationInfo = null;
  scopeInstance.identifierField = null;
  scopeInstance.chosenClassIdentifier = "";
  scopeInstance.availableClasses = [];
  scopeInstance.itemProperties = null;
  scopeInstance.displayedItems = [];
  scopeInstance.previousPageLink = null;
  scopeInstance.nextPageLink = null;
  scopeInstance.loadedApplications = [];
  scopeInstance.totalItemCount = 0;
  scopeInstance.classSchemaDefinition = null;

  // Placeholder for initial class selection (if any)
  let initialClassSelection = null; // Assuming this might be set globally elsewhere or passed in.

  // Function to simulate updating the applications list (e.g., from a service)
  function initializeApplicationList(scope) {
    // This would typically fetch from an API or a service
    // For this example, let's just populate with some dummy data if empty
    if (scope.loadedApplications.length === 0) {
      // Simulate an API call
      setTimeout(() => {
        scope.$apply(() => {
          scope.loadedApplications = [
            { name: "SampleApp1", key: "appkey123" },
            { name: "AnotherApp", key: "appkey456" },
            { name: "TestApp", key: "appkey789" }
          ];
        });
      }, 100);
    }
  }
  initializeApplicationList(scopeInstance);


  /**
   * Handles the selection of an application.
   * Fetches the available classes for the selected application.
   * @param {string} selectedAppName - The name of the chosen application.
   */
  scopeInstance.selectApplication = function(selectedAppName) {
    scopeInstance.identifierField = "";
    chosenItems.clear(); // Clear any previously selected objects.

    // Disable class/object deletion buttons
    domUtils.disableButton('deleteClassButton');
    domUtils.disableButton('deleteObjectsButton');

    scopeInstance.chosenClassIdentifier = "";
    scopeInstance.itemProperties = null;
    scopeInstance.availableClasses = [];
    scopeInstance.displayedItems = [];
    scopeInstance.currentApplicationDisplayName = selectedAppName;

    showLoadingIndicator(document.getElementById('loadingSpinner'));

    // Find the full application object from the loaded list
    currentApplicationData = scopeInstance.loadedApplications.find(appDetail => appDetail.name === selectedAppName) || null;

    if (!currentApplicationData) {
      hideLoadingIndicator(document.getElementById('loadingSpinner'));
      alert("Selected application data not found.");
      return;
    }

    scopeInstance.activeApplicationInfo = currentApplicationData;

    $.ajax({
      url: "/data/v3/entities/",
      type: "GET",
      beforeSend: function(xhr) { xhr.setRequestHeader('X-App-Key', currentApplicationData.key); },
      success: function(responsePayload) {
        hideLoadingIndicator(document.getElementById('loadingSpinner'));
        const classList = responsePayload.items || [];
        scopeInstance.$apply(function() {
          scopeInstance.availableClasses = classList;
          // If an initial class was pre-selected, activate it
          if (initialClassSelection) {
            scopeInstance.selectDataClass(initialClassSelection, 0); // Assuming 0 as default index
            initialClassSelection = null; // Clear after use
          }
        });
      },
      error: handleAjaxError
    });
  };


  /**
   * Handles the selection of a data class.
   * Fetches the schema and objects for the selected class.
   * @param {string} selectedClassIdentifier - The identifier of the chosen class.
   * @param {number} rowIndex - The index of the row in the UI table.
   */
  scopeInstance.selectDataClass = function(selectedClassIdentifier, rowIndex) {
    scopeInstance.chosenClassIdentifier = selectedClassIdentifier;
    activeClassName = selectedClassIdentifier;
    chosenItems.clear(); // Clear selected objects for the new class

    scopeInstance.displayedItems = []; // Clear displayed objects

    showLoadingIndicator(document.getElementById('loadingSpinner'));

    // Fetch Class Schema
    $.ajax({
      url: `/data/v3/entities/schema/${selectedClassIdentifier}/`,
      type: "GET",
      beforeSend: function(xhr) { xhr.setRequestHeader('X-App-Key', scopeInstance.activeApplicationInfo.key); },
      success: function(schemaResponse) {
        scopeInstance.$apply(function() {
          scopeInstance.classSchemaDefinition = schemaResponse;
        });
      },
      error: handleAjaxError // Use the common error handler
    });

    // Enable class deletion button
    domUtils.enableButton('deleteClassButton');
    // Disable objects deletion button until objects are selected
    domUtils.disableButton('deleteObjectsButton');

    // Update UI to highlight the selected class row
    const allClassRows = document.querySelectorAll('#entityClassTable tr');
    allClassRows.forEach(row => domUtils.toggleClassChecked(row, false)); // Uncheck all
    const targetRow = allClassRows[rowIndex + 1]; // +1 to account for header row
    domUtils.toggleClassChecked(targetRow, true); // Check the selected row


    // Fetch Class Objects
    $.ajax({
      url: `/data/v3/entities/${selectedClassIdentifier}/`,
      type: "GET",
      beforeSend: function(xhr) { xhr.setRequestHeader('X-App-Key', scopeInstance.activeApplicationInfo.key); },
      success: function(dataPayload) {
        hideLoadingIndicator(document.getElementById('loadingSpinner'));
        const recordsList = dataPayload.records || [];
        scopeInstance.totalItemCount = dataPayload.totalEntries || 0;

        // Extract unique field names from the objects
        const uniqueFieldNames = new Set();
        recordsList.forEach(record => {
          for (const propName in record) {
            if (Object.prototype.hasOwnProperty.call(record, propName)) {
              uniqueFieldNames.add(propName);
            }
          }
        });

        // Set the ID field and remove it from general properties
        scopeInstance.identifierField = "_id";
        uniqueFieldNames.delete("_id"); // _id is special

        scopeInstance.$apply(function() {
          scopeInstance.itemProperties = Array.from(uniqueFieldNames); // Convert Set to Array
          scopeInstance.displayedItems = recordsList;
          scopeInstance.previousPageLink = dataPayload.previous || null;
          scopeInstance.nextPageLink = dataPayload.next || null;
        });

        document.getElementById('paginationControls').style.display = 'block';
        scopeInstance.displayPaginationMessage();
      },
      error: handleAjaxError
    });
  };


  /**
   * Generates and displays the pagination status message.
   */
  scopeInstance.displayPaginationMessage = function() {
    let startRecord = 0;
    let endRecord = 0;

    if (scopeInstance.previousPageLink === null) {
      startRecord = 1;
      endRecord = scopeInstance.displayedItems.length;
    } else {
      // Extract page number from the previous page link (e.g., "?page=2")
      const pageMatch = scopeInstance.previousPageLink.match(/page=(\d+)/);
      const previousPageNumber = pageMatch ? Number.parseInt(pageMatch[1], 10) : 0;
      startRecord = previousPageNumber * recordsPerPage + 1;
      endRecord = startRecord + scopeInstance.displayedItems.length - 1;
    }

    const messageText = `Displaying records ${startRecord} to ${endRecord} of ${scopeInstance.totalItemCount}`;
    document.getElementById('pageStatusMessage').textContent = messageText;
  };


  /**
   * Helper to fetch data for a given page URL segment.
   * @param {string|null} pageUrlSegment - The URL segment for the page (e.g., "?page=2").
   */
  function fetchDataPage(pageUrlSegment) {
    if (!pageUrlSegment) {
      return false; // No page to fetch
    }

    showLoadingIndicator(document.getElementById('loadingSpinner'));

    $.ajax({
      url: `/data/v3/entities/${scopeInstance.chosenClassIdentifier}/${pageUrlSegment}`,
      type: "GET",
      beforeSend: function(xhr) { xhr.setRequestHeader('X-App-Key', scopeInstance.activeApplicationInfo.key); },
      success: function(dataPayload) {
        hideLoadingIndicator(document.getElementById('loadingSpinner'));
        const recordsList = dataPayload.records || [];

        const uniqueFieldNames = new Set();
        recordsList.forEach(record => {
          for (const propName in record) {
            if (Object.prototype.hasOwnProperty.call(record, propName)) {
              uniqueFieldNames.add(propName);
            }
          }
        });
        uniqueFieldNames.delete("_id"); // Special field

        scopeInstance.$apply(function() {
          scopeInstance.identifierField = "_id"; // Ensure ID field is set
          scopeInstance.itemProperties = Array.from(uniqueFieldNames);
          scopeInstance.displayedItems = recordsList;
          scopeInstance.previousPageLink = dataPayload.previous || null;
          scopeInstance.nextPageLink = dataPayload.next || null;
          scopeInstance.totalItemCount = dataPayload.totalEntries || 0;
        });

        scopeInstance.displayPaginationMessage();
        domUtils.disableButton('deleteObjectsButton'); // Disable object delete after page change
      },
      error: handleAjaxError
    });
  }


  /**
   * Navigates to the previous page of objects.
   */
  scopeInstance.goToPreviousPage = function() {
    return fetchDataPage(scopeInstance.previousPageLink);
  };


  /**
   * Navigates to the next page of objects.
   */
  scopeInstance.goToNextPage = function() {
    return fetchDataPage(scopeInstance.nextPageLink);
  };


  /**
   * Toggles the selection status of a data object.
   * @param {string} objectId - The ID of the object to select/deselect.
   * @param {number} rowIdx - The index of the object's row in the UI table.
   */
  scopeInstance.toggleObjectSelection = function(objectId, rowIdx) {
    const objectRows = document.querySelectorAll('#dataObjectTable tr');
    const targetObjectRow = objectRows[rowIdx + 1]; // +1 for header

    if (targetObjectRow) {
      if (chosenItems.has(objectId)) {
        chosenItems.delete(objectId);
        domUtils.toggleClassChecked(targetObjectRow, false);
      } else {
        chosenItems.add(objectId);
        domUtils.toggleClassChecked(targetObjectRow, true);
      }
    }

    // Update delete objects button state based on selection count
    if (chosenItems.size > 0) {
      domUtils.enableButton('deleteObjectsButton');
    } else {
      domUtils.disableButton('deleteObjectsButton');
    }
  };


  // CSRF token utility functions (assuming jQuery.cookie is available)
  function isCsrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  function isSameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    const host = document.location.host; // host + port
    const protocol = document.location.protocol;
    const sr_origin = '//' + host;
    const origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
      (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
      // or any other URL that isn't scheme relative or absolute i.e relative.
      !(/^(\/\/|http:|https:).*/.test(url));
  }


  /**
   * Initiates the deletion of the currently selected data class.
   */
  scopeInstance.deleteSelectedClass = function() {
    const confirmationMessage = "Caution: All associated objects within this class will be permanently removed. Are you absolutely certain you wish to proceed with deleting this class?";
    if (!confirm(confirmationMessage)) {
      return false;
    }

    if (!activeClassName) {
      alert("No class is currently selected for deletion.");
      return false;
    }

    showLoadingIndicator(document.getElementById('loadingSpinner'));

    $.ajax({
      url: `/data/v3/entities/${activeClassName}/`,
      type: "DELETE",
      beforeSend: function(xhr, settings) {
        if (!isCsrfSafeMethod(settings.type) && isSameOrigin(settings.url)) {
          const csrfTokenValue = $.cookie('csrftoken'); // Assuming jQuery.cookie is used
          if (csrfTokenValue) {
            xhr.setRequestHeader("X-CSRFToken", csrfTokenValue);
          }
        }
        xhr.setRequestHeader('X-App-Key', scopeInstance.activeApplicationInfo.key);
      },
      success: function() {
        hideLoadingIndicator(document.getElementById('loadingSpinner'));

        scopeInstance.$apply(function() {
          // Remove the class from the available list
          const classIndex = scopeInstance.availableClasses.indexOf(scopeInstance.chosenClassIdentifier);
          if (classIndex > -1) {
            scopeInstance.availableClasses.splice(classIndex, 1);
          }

          // Reset relevant state variables
          scopeInstance.itemProperties = [];
          scopeInstance.displayedItems = [];
          scopeInstance.chosenClassIdentifier = "";
          activeClassName = null;
          scopeInstance.identifierField = null;
          scopeInstance.previousPageLink = null;
          scopeInstance.nextPageLink = null;
          scopeInstance.totalItemCount = 0;
          scopeInstance.classSchemaDefinition = null;
        });

        // Disable deletion buttons and clear pagination info
        domUtils.disableButton('deleteClassButton');
        domUtils.disableButton('deleteObjectsButton');
        document.getElementById("pageStatusMessage").textContent = "";
        document.getElementById("paginationControls").style.display = "none";
      },
      error: handleAjaxError
    });
  };


  /**
   * Initiates the deletion of all currently selected data objects.
   */
  scopeInstance.deleteSelectedObjects = function() {
    const confirmationMessage = `Warning: ${chosenItems.size} selected objects will be permanently removed. Do you confirm this action?`;

    if (!confirm(confirmationMessage)) {
      return false;
    }

    if (!activeClassName) {
      alert("No class is active to delete objects from.");
      return false;
    }
    if (chosenItems.size === 0) {
      alert("No objects are selected for deletion.");
      return false;
    }

    showLoadingIndicator(document.getElementById('loadingSpinner'));
    let deletionSuccessCounter = 0;
    const totalItemsToDelete = chosenItems.size;

    chosenItems.forEach(itemId => {
      $.ajax({
        url: `/data/v3/entities/${activeClassName}/${itemId}/`,
        type: "DELETE",
        beforeSend: function(xhr, settings) {
          if (!isCsrfSafeMethod(settings.type) && isSameOrigin(settings.url)) {
            const csrfTokenValue = $.cookie('csrftoken');
            if (csrfTokenValue) {
              xhr.setRequestHeader("X-CSRFToken", csrfTokenValue);
            }
          }
          xhr.setRequestHeader('X-App-Key', scopeInstance.activeApplicationInfo.key);
        },
        success: function() {
          deletionSuccessCounter++;
          if (deletionSuccessCounter === totalItemsToDelete) {
            hideLoadingIndicator(document.getElementById('loadingSpinner'));
            // Refresh the object list after all deletions are attempted
            scopeInstance.selectDataClass(activeClassName, -1); // Re-fetch current class data, -1 to avoid specific row highlight
            chosenItems.clear(); // Clear selections after deletion
            domUtils.disableButton('deleteObjectsButton'); // Disable button
          }
        },
        error: function(xhr, status, error) {
          // Log specific error for this item, but continue with others
          console.error(`Failed to delete object ${itemId}:`, status, error, xhr);
          deletionSuccessCounter++; // Still count as an attempt
          if (deletionSuccessCounter === totalItemsToDelete) {
            hideLoadingIndicator(document.getElementById('loadingSpinner'));
            alert("Some objects could not be deleted. Please check console for details.");
            scopeInstance.selectDataClass(activeClassName, -1);
            chosenItems.clear();
            domUtils.disableButton('deleteObjectsButton');
          }
        }
      });
    });
  };
});
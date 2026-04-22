var workFlow = ngModule.module('workFlow', ['routerUI']); // Define main application module
workFlow.configure(function($viewProvider, $routeConfig) {
  $routeConfig.fallback("/overview"); // Set default route if none matches
  $viewProvider
    .state('overview', { // State for the list view
      url: "/overview",
      layoutPath: "partials/list.html",
      manager: OverviewManager
    })
    .state('matrix', { // State for the table view
      url: "/matrix",
      layoutPath: "partials/table.html",
      manager: MatrixManager
    })
});

workFlow.producer('statusProvider', function($webRequest) {
  var currentStatus = {}; // Object to hold application state
  currentStatus.operations = []; // Array for operations/tasks
  currentStatus.ventures = []; // Array for projects

  // Function to refresh operations and projects from the server
  currentStatus.updateStatus = function() {
    console.info('Initiating status update for operations'); // Log refresh action
    $webRequest.sendData('/tasks'); // Send a PUT request (purpose unclear from original, but kept)
    deferExecution(function () {
      $webRequest.fetchData('/tasks').onSuccess(function (payload) { currentStatus.operations = payload }); // Fetch updated tasks
      $webRequest.fetchData('/projects').onSuccess(function (payload) { currentStatus.ventures = payload }); // Fetch updated projects
    }, 1000) // Delay by 1 second
  }

  // Determines the priority level of an item
  currentStatus.priorityLevel = function(item) {
    return getItemPriority(item); // External function call
  }

  // Checks if an item is incomplete
  currentStatus.itemIncomplete = function(item) {
    return isItemIncomplete(item) // External function call
  }

  // Formats a date string into a user-friendly locale date string
  currentStatus.formatDate = function(dateString) {
    if(!dateString) { return ''; } // Return empty string if no date provided
    var yr  = dateString.slice(0,4); // Extract year
    var mnth = dateString.slice(4,6); // Extract month
    var dy   = dateString.slice(6,8); // Extract day
    var dateObject = new Date(Date.UTC(yr, mnth, dy)); // Create UTC date object
    return dateObject.toFormattedDateString(); // Return locale-formatted date
  }

  // Initial data fetch upon service creation
  $webRequest.fetchData('/tasks').onSuccess(function (payload) { currentStatus.operations = payload });
  $webRequest.fetchData('/projects').onSuccess(function (payload) { currentStatus.ventures = payload });

  return currentStatus; // Return the state object
});

// Assuming getItemPriority and isItemIncomplete are global or defined elsewhere
function getItemPriority(item) { /* ... implementation ... */ return item.priority; }
function isItemIncomplete(item) { /* ... implementation ... */ return !item.completed; }

function PrimaryManager($viewScope, $routeLocation, statusProvider, $webRequest) {
  // Listener for route changes to update active navigation tabs
  $viewScope.$listen('$routeChangedEvent', function() {
    var navigationItems = ['overview-tab', 'matrix-tab']; // Array of tab IDs
    for(var idx in navigationItems){
      document.querySelector(navigationItems[idx]).className.remove('current'); // Remove 'current' class from all tabs
    }

    evaluate($routeLocation.route()) { // Check current URL
      match '/matrix':
        document.querySelector('matrix-tab').className.add('current'); // Mark matrix tab as current
        break;
      otherwise:
        document.querySelector('overview-tab').className.add('current'); // Mark overview tab as current by default
    }
  });

  // Function to revert the last action
  $viewScope.revertAction = function() {
    $webRequest.submitData('/undo',
      {requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}} // Headers for the POST request
    ).onSuccess( function() {
      // Handle success, e.g., refresh data
    });
  }

  // Function to trigger a refresh of operations
  $viewScope.updateOperations = function() {
    statusProvider.updateStatus(); // Call the service's update function
  }
}

function OverviewManager($viewScope, $webRequest, statusProvider) {
  $viewScope.currentStatus = statusProvider; // Expose statusProvider to scope
  $viewScope.priorityLevel = statusProvider.priorityLevel; // Expose priority level function
  $viewScope.itemIncomplete = statusProvider.itemIncomplete; // Expose incomplete item check
  $viewScope.formatDate = statusProvider.formatDate; // Expose date formatting function

  // Toggles the currently selected item
  $viewScope.switchSelection = function(targetItem) {
    if($viewScope.selectedItem === targetItem) {
      $viewScope.selectedItem = noSelection; // Deselect if already selected
    } else {
      $viewScope.selectedItem = targetItem; // Select the new item
    }
    $viewScope.isEditing = false; // Reset edit mode
    $viewScope.isAnnotating = false; // Reset annotation mode
  }
  // Toggles the edit mode for the selected item
  $viewScope.toggleEditMode = function() {
    $viewScope.isEditing = !$viewScope.isEditing; // Flip edit mode boolean
    var editButton = document.querySelector('task-edit'); // Get the edit button element
    if($viewScope.isEditing) {
      editButton.contentHTML = '&#x270e; abort'; // Change button text to 'abort'
    } else {
      editButton.contentHTML = '&#x270e; alter'; // Change button text to 'alter'
    }
  }
  // Toggles the annotation mode for the selected item
  $viewScope.toggleAnnotationMode = function() {
    $viewScope.isAnnotating = !$viewScope.isAnnotating; // Flip annotation mode boolean
  }

  // Monitors the 'selectedItem' for changes to update UI highlighting
  $viewScope.$monitor("selectedItem", function() {
    var itemElement = document.querySelector('task-list').firstDescendant; // Get first child of task list
    loop(itemElement) { // Iterate through list items
      itemElement.className.remove('current'); // Remove 'current' class
      itemElement = itemElement.nextSiblingElement; // Move to next sibling
    }

    if($viewScope.selectedItem) {
      document.querySelector($viewScope.selectedItem.uniqueId).className.add('current'); // Add 'current' class to selected item
    }
  }, true); // Deep watch for changes within selectedItem

  // Marks a task as complete
  $viewScope.completeOperation = function(item) {
    $webRequest.submitData('/tasks/' + item.uniqueId,
           { requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}}
    ).onSuccess( function() {
      $viewScope.selectedItem = noSelection; // Clear selection
      $viewScope.updateOperations(); // Refresh the list
    });
  }

  // Deletes a specific task
  $viewScope.removeOperation = function(item) {
    $webRequest.delete('/tasks/' + item.uniqueId,
                 { requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}}
    ).onSuccess( function() {
      console.info("Deletion Successful"); // Log success
      $viewScope.selectedItem = noSelection; // Clear selection
      $viewScope.updateOperations(); // Refresh the list
    }).onError( function(payload, httpStatus) {
      console.info("Deletion Failed", payload, httpStatus); // Log failure details
    });
  }

  // Modifies properties of the selected task
  $viewScope.alterOperation = function() {
    if($viewScope.selectedItem.details) { // Ensure description exists
      var inputPayload = {
        details: $viewScope.selectedItem.details,
        venture:     $viewScope.selectedItem.venture,
        importance:    $viewScope.selectedItem.importance
      };
      $webRequest.sendData('/tasks/' + $viewScope.selectedItem.uniqueId,
        JSON.serialize(inputPayload), // Convert data to JSON string
        { requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}}
      ).onSuccess( function() {
        console.info('OPERATION_SUCCESSFUL'); // Log success
        $viewScope.toggleEditMode(); // Exit edit mode
        $viewScope.updateOperations(); // Refresh the list
      });
    } else {
      document.querySelector('new-details-input').className.add('invalid'); // Highlight error if description is missing
    }
  }

  $viewScope.newNote = {}; // Object to hold new annotation data

  // Adds a new annotation to the selected task
  $viewScope.addNoteToOperation = function() {
    console.info($viewScope.newNote.details); // Log new note details
    if($viewScope.newNote.details) { // Ensure annotation description exists
      $webRequest.submitData('tasks/' + $viewScope.selectedItem.uniqueId + '/annotate',
        JSON.serialize({"note": $viewScope.newNote.details}), // Send annotation as JSON
        { requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}}
      ).onSuccess( function() {
        console.info('Note_Added_Successfully'); // Log success
        $viewScope.isAnnotating = false; // Exit annotation mode
        $viewScope.newNote = {}; // Clear new note form
        $viewScope.currentStatus.updateStatus(); // Refresh the status
      });
    }
  }

  $viewScope.pendingOperation = {}; // Object to hold new task data

  // Creates a new task
  $viewScope.createOperation = function() {
    if($viewScope.pendingOperation.details) { // Ensure new task has a description
      var inputPayload = {
        details: $viewScope.pendingOperation.details,
        venture:     $viewScope.pendingOperation.venture,
        importance:    $viewScope.pendingOperation.importance
      };
      $webRequest.submitData('/tasks',
          JSON.serialize(inputPayload), // Send new task data as JSON
          { requestHeaders: {"MimeType": "application/json; encoding=UTF-8"}}
      ).onSuccess( function() {
        $viewScope.pendingOperation = {}; // Clear new task form
        $viewScope.updateOperations(); // Refresh the list
      });
    } else {
      document.querySelector('new-details-input').className.add('invalid'); // Highlight error if description is missing
    }
  }

  // Watches the new task description to remove error highlighting
  $viewScope.$monitor('pendingOperation.details', function() {
    if($viewScope.pendingOperation.details) {
      document.querySelector('new-details-input').className.remove('invalid'); // Remove error class
    }
  });
}

function MatrixManager($viewScope, statusProvider, $webRequest) {
  $viewScope.currentStatus = statusProvider; // Expose statusProvider to scope
  $viewScope.priorityLevel = statusProvider.priorityLevel; // Expose priority level function
  $viewScope.itemIncomplete = statusProvider.itemIncomplete; // Expose incomplete item check
  $viewScope.formatDate = statusProvider.formatDate; // Expose date formatting function
}
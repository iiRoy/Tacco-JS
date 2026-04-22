let projectManagerApp = angular.module('projectManagerApp', ['ui.router']);

// Constants for HTTP headers
const _commonApiHeaders = { "Content-Type": "application/json; charset=UTF-8" };

projectManagerApp.config(function(routeConfigurator, defaultRouteHandler) {
  // If no specific route is matched, redirect to the default item listing view.
  defaultRouteHandler.otherwise("/items-view");

  // Define application states and their associated views and controllers.
  routeConfigurator
    .state('items-view', {
      url: "/items-view",
      templateUrl: "partials/item-list-view.html",
      controller: TaskListingController
    })
    .state('grid-view', {
      url: "/grid-view",
      templateUrl: "partials/item-grid-view.html",
      controller: TaskGridController
    });
});

projectManagerApp.factory('dataManagementService', function(httpClient, $timeout) {
  // Private helper function to determine an item's priority level.
  // This logic is a placeholder and can be expanded.
  const calculateItemPriority = (workItemEntity) => {
    if (!workItemEntity || typeof workItemEntity.priority_level === 'undefined') {
      return 'unspecified';
    }
    const priority = parseInt(workItemEntity.priority_level, 10);
    if (isNaN(priority)) return 'unspecified';
    if (priority >= 8) return 'critical';
    if (priority >= 5) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  };

  // Private helper function to check if a work item is still pending.
  const checkItemIncompleteStatus = (workItemEntity) => {
    return workItemEntity && !workItemEntity.is_completed;
  };

  // The central data store and service for application data.
  let dataStore = {
    workItems: [],
    clientProjects: [],
    isLoading: false // New flag for loading state
  };

  // Function to refresh all data from the backend.
  dataStore.reloadData = function() {
    dataStore.isLoading = true;
    // Simulate network delay and ensure Angular's digest cycle is aware of changes.
    $timeout(() => {
      httpClient.get('/api/workitems').then(
        (response) => {
          dataStore.workItems = response.data;
        },
        (error) => {
          console.error("Failed to fetch work items:", error);
        }
      ).finally(() => {
        // Only set isLoading to false after all initial fetches are done,
        // or manage individual loading states. For simplicity, setting once here.
      });

      httpClient.get('/api/projects').then(
        (response) => {
          dataStore.clientProjects = response.data;
        },
        (error) => {
          console.error("Failed to fetch client projects:", error);
        }
      ).finally(() => {
        dataStore.isLoading = false;
      });
    }, 750); // Slightly adjusted delay
  };

  // Expose the priority calculation helper.
  dataStore.calculatePriorityLevel = function(workItemEntity) {
    return calculateItemPriority(workItemEntity);
  };

  // Expose the item completion status helper.
  dataStore.isItemPending = function(workItemEntity) {
    return checkItemIncompleteStatus(workItemEntity);
  };

  // Function to format a date string into a localized, human-readable format.
  dataStore.formatTimestamp = function(inputDateString) {
    if (!inputDateString || typeof inputDateString !== 'string' || inputDateString.length < 8) {
      // Return an empty string or a default value for invalid input.
      return 'Invalid Date';
    }

    // Attempt to parse the YYYYMMDD string.
    try {
      const year  = parseInt(inputDateString.substring(0, 4), 10);
      const month = parseInt(inputDateString.substring(4, 6), 10) - 1; // Month is 0-indexed
      const day   = parseInt(inputDateString.substring(6, 8), 10);

      // Validate parsed components
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return 'Parse Error';
      }

      // Create a UTC date object to avoid timezone issues.
      const dateObject = new Date(Date.UTC(year, month, day));
      // Basic validation for invalid dates (e.g., Feb 30th)
      if (dateObject.getUTCFullYear() !== year || dateObject.getUTCMonth() !== month || dateObject.getUTCDate() !== day) {
          return 'Invalid Date';
      }
      return dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // More specific locale formatting
    } catch (e) {
      console.error("Date formatting error:", e);
      return 'Formatting Error';
    }
  };

  // Initial data load when the service starts.
  dataStore.reloadData();

  return dataStore;
});

// Main application controller handling global navigation and actions.
function RootApplicationController(viewModel, currentLocation, dataManagementService, httpClient) {

  // Helper to activate a navigation tab by ID.
  const activateNavigationTab = (tabId) => {
    const allTabs = ['list-display-tab', 'grid-display-tab']; // Renamed tab IDs
    allTabs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove('active-nav-item'); // Renamed CSS class
      }
    });

    const activeElement = document.getElementById(tabId);
    if (activeElement) {
      activeElement.classList.add('active-nav-item');
    }
  };

  // Listen for changes in the URL to update active navigation tabs.
  viewModel.$on('$locationChangeSuccess', function() {
    switch(currentLocation.url()) {
      case '/grid-view':
        activateNavigationTab('grid-display-tab');
        break;
      case '/items-view': // Fall-through for default or explicit list view
      default:
        activateNavigationTab('list-display-tab');
        break;
    }
  });

  // Action to revert the last significant change.
  viewModel.performUndoAction = function() {
    httpClient.post('/api/undo-last-action', {}, { headers: _commonApiHeaders })
      .then(() => {
        // No specific action needed on success for undo, perhaps just a refresh.
        dataManagementService.reloadData(); // Refresh data after undo
      }, (error) => {
        console.error("Undo action failed:", error);
        // Optionally display an error message to the user.
      });
  };

  // Action to manually refresh all work items.
  viewModel.triggerDataRefresh = function() {
    dataManagementService.reloadData();
  };
}

// Controller for displaying work items in a list format.
function TaskListingController(viewModel, httpClient, dataManagementService) {
  viewModel.dataStore = dataManagementService;
  viewModel.getPriority = dataManagementService.calculatePriorityLevel;
  viewModel.isPending = dataManagementService.isItemPending;
  viewModel.formatDate = dataManagementService.formatTimestamp;

  // State variables for UI interactions.
  viewModel.selectedItem = undefined;
  viewModel.isEditingMode = false;
  viewModel.isAnnotating = false;

  // Toggles the selection of a work item.
  viewModel.toggleItemSelection = function(workItemEntity) {
    if(viewModel.selectedItem && viewModel.selectedItem.unique_id === workItemEntity.unique_id) {
      viewModel.selectedItem = undefined;
    } else {
      viewModel.selectedItem = workItemEntity;
    }
    viewModel.isEditingMode = false;
    viewModel.isAnnotating = false;
  };

  // Toggles the editing interface for the selected item.
  viewModel.toggleEditMode = function() {
    viewModel.isEditingMode = !viewModel.isEditingMode;
    const editButton = document.getElementById('item-edit-button');
    if (editButton) {
        editButton.textContent = viewModel.isEditingMode ? '✕ Cancel Edit' : '✎ Modify Item'; // Changed text and icon
    }
  };

  // Toggles the annotation interface for the selected item.
  viewModel.toggleAnnotationInput = function() {
    viewModel.isAnnotating = !viewModel.isAnnotating;
  };

  // Watches for changes in the selected item and updates UI highlighting.
  viewModel.$watch("selectedItem", function(newSelection, oldSelection) {
    // Remove 'highlighted-row' class from previously selected item.
    if (oldSelection && oldSelection.unique_id) {
      const oldElement = document.getElementById('item-' + oldSelection.unique_id);
      if (oldElement) {
        oldElement.classList.remove('highlighted-row'); // Renamed CSS class
      }
    }

    // Add 'highlighted-row' class to newly selected item.
    if (newSelection && newSelection.unique_id) {
      const newElement = document.getElementById('item-' + newSelection.unique_id);
      if (newElement) {
        newElement.classList.add('highlighted-row');
      }
    }
  }, true); // Deep watch for object properties

  // Marks a work item as complete.
  viewModel.completeWorkItem = function(workItemEntity) {
    if (!workItemEntity || !workItemEntity.unique_id) return;

    httpClient.post('/api/workitems/' + workItemEntity.unique_id + '/complete', {}, { headers: _commonApiHeaders })
      .then(() => {
        viewModel.selectedItem = undefined; // Deselect after completion
        dataManagementService.reloadData();
      }, (error) => {
        console.error("Failed to complete item:", error);
        alert("Error completing task: " + (error.data || error.statusText));
      });
  };

  // Deletes a work item.
  viewModel.removeWorkItem = function(workItemEntity) {
    if (!workItemEntity || !workItemEntity.unique_id) return;

    // Add a confirmation step for deletion (new fragment)
    if (!confirm(`Are you sure you want to delete "${workItemEntity.description_text}"?`)) {
      return;
    }

    httpClient.delete('/api/workitems/' + workItemEntity.unique_id, { headers: _commonApiHeaders })
      .then(() => {
        console.info("Deletion Successful for item:", workItemEntity.unique_id);
        viewModel.selectedItem = undefined;
        dataManagementService.reloadData();
      }, (error) => {
        console.error("Deletion Failed:", error.data, error.status);
        alert("Error deleting task: " + (error.data || error.statusText));
      });
  };

  // Submits changes to the selected work item.
  viewModel.submitModifiedItem = function() {
    // Guard clause for no selected item or empty description.
    if (!viewModel.selectedItem || !viewModel.selectedItem.description_text || viewModel.selectedItem.description_text.trim() === '') {
      document.getElementById('item-description-input').classList.add('validation-error'); // Renamed ID and class
      return;
    }
    document.getElementById('item-description-input').classList.remove('validation-error');

    const updatePayload = {
      description_text: viewModel.selectedItem.description_text,
      associated_project: viewModel.selectedItem.associated_project, // Renamed property
      priority_level: viewModel.selectedItem.priority_level
    };

    httpClient.put('/api/workitems/' + viewModel.selectedItem.unique_id,
      JSON.stringify(updatePayload),
      { headers: _commonApiHeaders }
    ).then(() => {
        console.info('Update successful!');
        viewModel.toggleEditMode(); // Exit edit mode
        dataManagementService.reloadData();
      }, (error) => {
        console.error("Update failed:", error);
        alert("Error updating task: " + (error.data || error.statusText));
      });
  };

  viewModel.newAnnotationEntry = {}; // Renamed variable
  // Adds a new annotation to the selected work item.
  viewModel.addAnnotationToItem = function() {
    // Basic validation for annotation content.
    if (!viewModel.newAnnotationEntry.comment_text || viewModel.newAnnotationEntry.comment_text.trim() === '') {
      alert("Annotation cannot be empty.");
      return;
    }

    httpClient.post('/api/workitems/' + viewModel.selectedItem.unique_id + '/add-annotation',
      JSON.stringify({"comment_text": viewModel.newAnnotationEntry.comment_text}), // Renamed property
      { headers: _commonApiHeaders }
    ).then(() => {
        console.info('Annotation added successfully!');
        viewModel.isAnnotating = false; // Close annotation input
        viewModel.newAnnotationEntry = {}; // Clear input field
        dataManagementService.reloadData(); // Refresh to show new annotation
      }, (error) => {
        console.error('Annotation addition failed:', error);
        alert("Error adding annotation: " + (error.data || error.statusText));
      });
  };

  viewModel.newItemDetails = { // Renamed variable
    description_text: '',
    associated_project: '',
    priority_level: 1
  };

  // Helper to reset the new item form (new fragment)
  const resetNewItemForm = () => {
    viewModel.newItemDetails = {
      description_text: '',
      associated_project: '',
      priority_level: 1
    };
    const descElement = document.getElementById('new-item-description-input');
    if (descElement) {
      descElement.classList.remove('validation-error');
    }
  };

  // Adds a new work item.
  viewModel.addNewWorkItem = function() {
    // Validation for new item description.
    if (!viewModel.newItemDetails.description_text || viewModel.newItemDetails.description_text.trim() === '') {
      document.getElementById('new-item-description-input').classList.add('validation-error');
      return;
    }

    const itemPayload = {
      description_text: viewModel.newItemDetails.description_text.trim(),
      associated_project: viewModel.newItemDetails.associated_project,
      priority_level: viewModel.newItemDetails.priority_level
    };

    httpClient.post('/api/workitems',
        JSON.stringify(itemPayload),
        { headers: _commonApiHeaders }
    ).then(() => {
        resetNewItemForm(); // Use helper to clear form
        dataManagementService.reloadData();
      }, (error) => {
        console.error("Failed to add new item:", error);
        alert("Error adding new task: " + (error.data || error.statusText));
      });
  };

  // Watch for changes in the new item description to clear validation errors.
  viewModel.$watch('newItemDetails.description_text', function(newValue) {
    const descElement = document.getElementById('new-item-description-input');
    if (newValue && newValue.trim() !== '' && descElement) {
      descElement.classList.remove('validation-error');
    }
  });
}

// Controller for displaying work items in a grid/table format.
function TaskGridController(viewModel, dataManagementService, httpClient) {
  // Expose the shared data service and utility functions to the view model.
  viewModel.dataStore = dataManagementService;
  viewModel.getPriority = dataManagementService.calculatePriorityLevel;
  viewModel.isPending = dataManagementService.isItemPending;
  viewModel.formatDate = dataManagementService.formatTimestamp;

  // Potentially add grid-specific state or functions here.
  // For Type III, we can add a simple sorting mechanism.
  viewModel.sortColumn = 'description_text';
  viewModel.sortReverse = false;

  viewModel.updateSorting = function(columnName) {
    if (viewModel.sortColumn === columnName) {
      viewModel.sortReverse = !viewModel.sortReverse;
    } else {
      viewModel.sortColumn = columnName;
      viewModel.sortReverse = false;
    }
  };

  // Example of a new function only relevant to the grid view
  viewModel.exportGridData = function() {
    console.log("Exporting grid data...");
    // In a real app, this would trigger a download or open a new window with exported data.
    alert("Grid data export initiated! (This is a placeholder action)");
  };
}
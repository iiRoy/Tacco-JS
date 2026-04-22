let ApplicationCore = {};

// Configuration settings for the user interface
ApplicationCore.userSettings = {
  "confirmDeletion": true,  // Prompt user before removing an item
  "recordsPerPage": "25"    // Number of entries to display in the main data grid
};

// Utility for managing browser cookies
const CookieService = {
  // Retrieves a cookie value by its name
  get: function(cookieName) {
    const value = $.cookie(cookieName);
    // Return null if the cookie is not found or is empty
    return (value === undefined || value === '') ? null : value;
  },
  // Sets a cookie with a given name and value
  set: function(cookieName, cookieValue) {
    if (cookieName && cookieValue !== null && cookieValue !== undefined) {
      $.cookie(cookieName, cookieValue.toString(), { expires: 365, path: '/' }); // Store for a year
      return true;
    }
    console.warn(`CookieService: Attempted to set invalid cookie. Name: ${cookieName}, Value: ${cookieValue}`);
    return false;
  }
};

// Constants for various UI elements and operations
const UI_CONSTANTS = {
  REFRESH_INTERVAL_MS: 3000, // Time in milliseconds for automatic data refresh
  TREE_ANIMATION_SPEED: 100, // Animation duration for tree view expansions
  DATA_TABLE_SELECTOR: 'table.data-grid-items',
  NAMESPACE_TREE_SELECTOR: '#hierarchy_navigator',
  DELETE_CONFIRM_CHECKBOX_SELECTOR: '#deletion_confirmation_toggle',
  RECORDS_PER_PAGE_SELECTOR: '#display_limit_input',
  AUTO_REFRESH_CHECKBOX_SELECTOR: '#auto_update_enabled',
  CATEGORY_LIST_CONTAINER_SELECTOR: '#category_list_panel',
  MAIN_DATA_DISPLAY_SELECTOR: '#main_content_area'
};

// Global instance for the main data grid
let DataGridInstance = null;

// Function to initialize and apply user preferences
function applyInitialSettings() {
  // Iterate through predefined settings and load from cookies, or set cookies if not present
  Object.keys(ApplicationCore.userSettings).forEach(settingKey => {
    const storedValue = CookieService.get(settingKey);
    if (storedValue !== null) {
      ApplicationCore.userSettings[settingKey] = storedValue;
    } else {
      CookieService.set(settingKey, ApplicationCore.userSettings[settingKey]);
    }
  });

  // Update UI elements based on loaded/default settings
  const confirmDelValue = ApplicationCore.userSettings.confirmDeletion === "true";
  $(UI_CONSTANTS.DELETE_CONFIRM_CHECKBOX_SELECTOR).prop("checked", confirmDelValue);
  $(UI_CONSTANTS.RECORDS_PER_PAGE_SELECTOR).val(ApplicationCore.userSettings.recordsPerPage);

  console.log('Application settings initialized:', ApplicationCore.userSettings);
}

// Function to handle the deletion process
function processItemRemoval(triggerElement, itemIdentifier, targetRow) {
  if (!itemIdentifier) {
    console.error("Deletion failed: No item identifier provided.");
    return;
  }

  const requiresConfirmation = $(UI_CONSTANTS.DELETE_CONFIRM_CHECKBOX_SELECTOR).is(':checked');
  let proceedWithDeletion = true;

  if (requiresConfirmation) {
    const confirmationMessage = `Are you absolutely sure you want to permanently remove the item:\n\n"${itemIdentifier}"\n\nThis action cannot be undone.`;
    proceedWithDeletion = confirm(confirmationMessage);
  }

  if (proceedWithDeletion) {
    const postUrl = $(triggerElement).attr('href');
    if (!postUrl) {
      console.error("Deletion failed: No valid URL for removal action.");
      return;
    }

    $.ajax({
      url: postUrl,
      type: 'POST',
      dataType: 'json', // Expect JSON response
      success: function(response) {
        if (response && response.status === 'success') {
          if (DataGridInstance && targetRow) {
            DataGridInstance.row(targetRow).remove().draw();
            console.log(`Item '${itemIdentifier}' successfully removed.`);
          } else {
            console.warn("Could not remove row from DataGrid: Instance or target row not found.");
          }
        } else {
          console.error(`Deletion failed for '${itemIdentifier}':`, response ? response.message : 'Unknown error.');
          alert(`Failed to delete item: ${response ? response.message : 'Server error'}`);
        }
      },
      error: function(xhr, status, error) {
        console.error(`AJAX error during deletion of '${itemIdentifier}':`, status, error);
        alert(`An error occurred while attempting to delete: ${error}`);
      }
    });
  } else {
    console.log(`Deletion of '${itemIdentifier}' cancelled by user.`);
  }
}

// Function for periodic data updates
function initiatePeriodicDataRefresh() {
  if ($(UI_CONSTANTS.AUTO_REFRESH_CHECKBOX_SELECTOR).is(':checked')) {
    $.ajax({
      type: 'GET',
      url: window.location.href,
      dataType: 'html',
      success: function(serverResponse) {
        // Update the namespace tree and data table sections from the fresh response
        const newCategoryList = $(UI_CONSTANTS.CATEGORY_LIST_CONTAINER_SELECTOR, serverResponse);
        if (newCategoryList.length) {
          $(UI_CONSTANTS.CATEGORY_LIST_CONTAINER_SELECTOR).replaceWith(newCategoryList);
        } else {
          console.warn('Periodic refresh: Could not find new category list in response.');
        }

        const newMainDataDisplay = $(UI_CONSTANTS.MAIN_DATA_DISPLAY_SELECTOR, serverResponse);
        if (newMainDataDisplay.length) {
          $(UI_CONSTANTS.MAIN_DATA_DISPLAY_SELECTOR).replaceWith(newMainDataDisplay);
        } else {
          console.warn('Periodic refresh: Could not find new main data display in response.');
        }
        console.log('Periodic data refresh completed.');
      },
      error: function(xhr, status, error) {
        console.error('Error during periodic data refresh:', status, error);
      }
    });
  }
  // Schedule the next refresh regardless of whether the current one executed
  setTimeout(initiatePeriodicDataRefresh, UI_CONSTANTS.REFRESH_INTERVAL_MS);
}

// Document Ready Block - Main application initialization
$(function() {
  // Initialize the main data grid using DataTables
  DataGridInstance = $(UI_CONSTANTS.DATA_TABLE_SELECTOR).DataTable({
    stateSave: true, // Preserve table state across page loads
    paging: true,
    lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ], // Options for records per page
    pageLength: parseInt(ApplicationCore.userSettings.recordsPerPage, 10) || 25, // Default page length
    // Additional DataTables configuration could go here
  });

  // Initialize the namespace tree view with jstree
  $(UI_CONSTANTS.NAMESPACE_TREE_SELECTOR)
    .on("loaded.jstree", function(event, data) {
      // Once the tree is loaded, expand all nodes for full visibility
      $(this).jstree("open_all");
      console.log('Hierarchy navigator loaded and expanded.');
    })
    .jstree({
      "core": {
        "animation": UI_CONSTANTS.TREE_ANIMATION_SPEED // Smooth animation for node expansion/collapse
      },
      "plugins": ["themes", "html_data"] // Use themes for styling and HTML for data source
    });

  // Apply saved user settings to the UI and cookies
  applyInitialSettings();

  // Event handler for the delete confirmation checkbox
  $(document).on('change', UI_CONSTANTS.DELETE_CONFIRM_CHECKBOX_SELECTOR, function() {
    const isChecked = $(this).is(':checked');
    ApplicationCore.userSettings.confirmDeletion = isChecked.toString();
    CookieService.set('confirmDeletion', isChecked);
    console.log('Deletion confirmation setting updated to:', isChecked);
  });

  // Event handler for the records per page selector
  $(document).on('change', UI_CONSTANTS.RECORDS_PER_PAGE_SELECTOR, function() {
    const selectedValue = $(this).val();
    ApplicationCore.userSettings.recordsPerPage = selectedValue;
    CookieService.set('recordsPerPage', selectedValue);
    if (DataGridInstance) {
      DataGridInstance.page.len(selectedValue).draw(); // Update DataTables page length
      console.log('Records per page setting updated to:', selectedValue);
    }
  });

  // Event handler for item deletion actions (delegated for dynamic content)
  $(document).on('click', 'a.item-remove-trigger', function(evt) {
    evt.preventDefault(); // Prevent default link behavior

    const triggerElement = this;
    const itemKey = $(this).data('item-id');
    const parentRow = $(this).closest('tr')[0];

    // Delegate deletion logic to a dedicated function
    processItemRemoval(triggerElement, itemKey, parentRow);
  });

  // Start the periodic data refresh mechanism
  setTimeout(initiatePeriodicDataRefresh, UI_CONSTANTS.REFRESH_INTERVAL_MS);
});
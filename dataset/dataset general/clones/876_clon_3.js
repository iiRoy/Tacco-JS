// This script facilitates the initialization of the primary application interface
// within an Ext JS environment. It sets up various loading indicators,
// performs an asynchronous data fetch, and constructs the main navigable view.
Ext.onReady(function() {

    // Define global or frequently used DOM references and configuration constants
    // to improve readability and maintainability.
    const MAIN_DOCUMENT_BODY = Ext.getBody();
    const SCRIPT_FETCH_API_PATH = '/api/system_scripts/fetch_configuration'; // Altered API endpoint
    const DEFAULT_SCRIPT_PLACEHOLDER = "// Failed to load script content or no content available.";

    /**
     * @private
     * Helper utility function to instantiate an Ext.LoadMask.
     * This abstracts the creation process, allowing for consistent configuration and
     * potential pre-checks or post-creation logic.
     * @param {Ext.dom.Element} targetEl The element to mask.
     * @param {string} statusMessage The message to display within the mask.
     * @param {string} associatedStoreCmpId Optional ID of an Ext.Component whose store
     *                                     should be linked to this mask.
     * @returns {Ext.LoadMask|null} The created LoadMask instance, or null if targetEl is invalid.
     */
    function createUnifiedLoadingOverlay(targetEl, statusMessage, associatedStoreCmpId) {
        // Implement a guard clause for robustness.
        if (!targetEl || !targetEl.dom) {
            console.error('Invalid target element provided for loading overlay:', targetEl);
            Ext.toast({
                title: 'System Warning',
                html: 'Could not attach loading indicator to UI.',
                width: 280,
                align: 't'
            });
            return null;
        }

        let linkedDataStore = null;
        if (associatedStoreCmpId) {
            const componentRef = Ext.getCmp(associatedStoreCmpId);
            // Check if the component exists and has a store property.
            if (componentRef && componentRef.getStore) { // Using getStore() for more robust store access
                linkedDataStore = componentRef.getStore();
            } else {
                console.warn(`Component or store not found for ID: ${associatedStoreCmpId}. Loading mask's store link may be invalid.`);
            }
        }

        // Return a new Ext.LoadMask with slightly modified default properties.
        return new Ext.LoadMask(targetEl, {
            msg: `Initiating: ${statusMessage}...`, // Modified message string format
            store: linkedDataStore,
            // Added a new, non-essential configuration property for demonstration.
            showOnInit: false, // Masks are typically shown/hidden manually after creation
            msgCls: 'x-mask-loading-indicator' // Custom CSS class for the message
        });
    }

    // Instantiate several loading overlays for different data-bound components.
    // Variable names are changed, and the helper function is utilized.
    const staffDataIndicator = createUnifiedLoadingOverlay(MAIN_DOCUMENT_BODY, "Retrieving Personnel Listings", 'TeamMemberSelector');
    const projectLoadIndicator = createUnifiedLoadingOverlay(MAIN_DOCUMENT_BODY, "Aggregating Project Data", 'ActiveProjectsGrid');
    const roleAssignmentIndicator = createUnifiedLoadingOverlay(MAIN_DOCUMENT_BODY, "Compiling Role Assignments", 'UserRolesGrid');

    // Execute an asynchronous HTTP request to fetch a specific code snippet or configuration.
    // This section includes extensive changes: URL, method, params, timeout, and a comprehensive
    // success/failure handler with validation and logging.
    Ext.Ajax.request({
        url: SCRIPT_FETCH_API_PATH,
        method: 'POST', // Changed HTTP method from GET to POST
        params: { // Added a parameters object, which was missing in the original.
            requestType: 'config_script',
            timestamp: new Date().getTime(), // A new parameter for cache busting or tracking
            appVersion: Ext.versions.extjs ? Ext.versions.extjs.version : 'unknown'
        },
        timeout: 45000, // Increased timeout duration (from implied default)
        success: function(ajaxResponse) {
            // Introduce an intermediate variable for processing the response.
            const fetchedContent = ajaxResponse.responseText;
            // Implement a more robust check for valid content.
            if (fetchedContent && fetchedContent.trim().length > 0 && fetchedContent.startsWith('//')) {
                Ext.getCmp("SystemConfigCodeViewer").setValue(fetchedContent); // Renamed target component ID
                console.log("Configuration script successfully retrieved and displayed."); // Added detailed log
            } else {
                console.warn("AJAX request completed, but returned empty or invalid script content.");
                // Provide a default message if content is missing or malformed.
                Ext.getCmp("SystemConfigCodeViewer").setValue(DEFAULT_SCRIPT_PLACEHOLDER);
            }
        },
        failure: function(operation, options) { // Added a dedicated failure callback.
            console.error("Failed to fetch system configuration script.", operation, options);
            Ext.toast({ // Display a user-friendly toast notification.
                title: 'Data Load Error',
                html: 'Unable to retrieve required system script from server.',
                width: 320,
                align: 'tr', // Positioned differently (top-right)
                iconCls: 'x-fa fa-times-circle', // Custom icon class
                timeout: 5000
            });
            Ext.getCmp("SystemConfigCodeViewer").setValue(DEFAULT_SCRIPT_PLACEHOLDER);
        },
        callback: function(options, success, response) { // Added a general callback for all outcomes
            if (!success) {
                console.log('AJAX operation completed with errors or cancellation.');
            }
        }
    });

    // Construct the primary application user interface using an Ext.tab.Panel.
    // This component has undergone significant modifications: renaming, property changes,
    // addition of new items, new listeners, and updated styling.
    const mainApplicationContainer = new Ext.tab.Panel({ // Variable renamed, used 'Ext.tab.Panel' alias
        title: 'Unified Operations Dashboard', // Added a new title property
        minHeight: 520, // Changed from fixed height to minimum height
        width: '90%', // Changed width to a percentage of viewport
        activeTab: 2, // Changed the initially active tab index
        cls: 'app-main-panel-custom-style', // Added a custom CSS class for global styling
        deferredRender: true, // Added a new config property for performance
        tabPosition: 'left', // Changed tab position
        style: { // Modified and added new CSS style properties
            padding: '20px', // Changed margins to padding
            backgroundColor: '#f0f2f5', // Added background color
            border: '1px solid #d0d0d0', // Added a border
            borderRadius: '8px' // Added border-radius for rounded corners
        },
        renderTo: Ext.get('application-root-div') || MAIN_DOCUMENT_BODY, // Render to a specific ID or fallback
        items: [
            // Added a completely new item to the tab panel for a dashboard view.
            {
                xtype: 'panel',
                title: 'System Overview',
                iconCls: 'x-fa fa-chart-line', // Added an icon class
                layout: 'fit', // Added a layout config
                html: '<div style="padding: 25px; text-align: center;"><h2>Welcome to the Enterprise Management Platform!</h2><p>Use the tabs on the left to navigate between different operational modules.</p><hr/><p>Current System Status: <span style="color: green;">Operational</span></p></div>',
                listeners: {
                    activate: function(panel) {
                        console.log('Overview tab activated. Refreshing dashboard widgets...');
                        // Simulate dashboard widget refresh here
                    }
                }
            },
            // Reordered and renamed the original items. These components (e.g., 'taskEntryForm')
            // are assumed to be defined elsewhere in the application scope.
            taskEntryForm, // Renamed from jobForm
            staffManagementGrid, // Renamed from workersGrid
            projectActivityGrid, // Renamed from jobsGrid
            employeeDetailEditor // Renamed from workerForm
        ],
        listeners: { // Added a comprehensive set of event listeners for the tab panel.
            // Listener for tab changes.
            tabchange: function(tabPanel, newCard, oldCard) {
                console.info(`Tab navigation: Switched from "${oldCard.title}" to "${newCard.title}".`);
                // Example of conditional logic based on the newly activated tab.
                if (newCard.title === 'Staff Management Grid') {
                    // Potentially trigger a data load or UI update specific to this grid.
                    // staffManagementGrid.getStore().load();
                }
            },
            // Listener for when the component finishes rendering to the DOM.
            afterrender: function(component) {
                console.log(`Main application container "${component.title}" has finished rendering.`);
                // Additional post-render actions can be performed here.
            },
            // Listener for before a tab changes, allowing cancellation.
            beforetabchange: function(tabPanel, newCard, currentCard) {
                // Example of a simple guard condition (e.g., prevent changing if unsaved changes exist)
                // if (someGlobalState.hasUnsavedChanges && !confirm('Discard unsaved changes?')) {
                //     return false; // Prevent tab change
                // }
                return true; // Allow tab change
            }
        }
    });

    // Add a new, non-essential fragment: a global application status message on load completion.
    Ext.toast({
        title: 'System Notification',
        html: 'All core application modules have been initialized successfully.',
        width: 350,
        align: 'bl', // Positioned at bottom-left
        timeout: 6000,
        iconCls: 'x-fa fa-info-circle',
        bodyCls: 'app-success-toast' // Custom CSS class for the toast body
    });

    // Another new fragment: a conditional debug message based on a global flag.
    if (window.APP_VERBOSE_LOGGING === true) {
        console.groupCollapsed("Application Startup Diagnostics");
        console.log("Current Ext JS Version:", Ext.versions.extjs.version);
        console.log("Number of loading indicators created:", [staffDataIndicator, projectLoadIndicator, roleAssignmentIndicator].filter(Boolean).length);
        console.log("Main UI container instance ID:", mainApplicationContainer.getId());
        console.groupEnd();
    }

}); // End of the Ext.onReady callback function.
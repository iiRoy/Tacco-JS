// Dummy placeholder classes for the cloned application's components
// These simulate the HIDDescriptor, Toolbar, Tree, Reports classes from the original.
function DataModel() {}
function ControlPanel() {}
function StructureDisplay() {}
function StatusLog() {}

// Global application state variables (equivalent to descriptor, toolbar, treeView, reportsView)
let appDescriptorState = null;
let mainControlPanel = null;
let contentStructureViewer = null;
let activityLogViewer = null;

// Reference to the primary application container (equivalent to hidedit)
const primaryContainer = document.getElementById("hidedit");

// List of external JavaScript modules to load (equivalent to the 'scripts' object keys)
const moduleRegistry = [
    "hid-stream.js",
    "hut.js",
    "hid-report.js",
    "hid.js",
    "hid-run-state.js",
    "hid-run.js",
    "hidedit-toolbar.js",
    "hidedit-tree.js",
    "hidedit-reports.js",
    "hidedit-dialog.js"
].map(url => ({ url: url, statusNode: null })); // Add a placeholder for DOM element reference

// Function to dynamically load a single JavaScript module
function fetchModule(moduleEntry) {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = moduleEntry.url;

        // Simulate the block.className = "done" behavior
        const markAsLoaded = () => {
            if (moduleEntry.statusNode) {
                moduleEntry.statusNode.classList.add('finished');
            }
            resolve(moduleEntry.url);
        };

        scriptElement.onload = markAsLoaded;
        scriptElement.onerror = () => {
            if (moduleEntry.statusNode) {
                moduleEntry.statusNode.classList.add('failed');
            }
            reject(new Error(`Module loading failed for ${moduleEntry.url}`));
        };

        document.head.appendChild(scriptElement);
    });
}

// Main orchestration function for application setup
function initiateApplication() {
    // Construct the loading UI using a template literal for divergent syntax
    const loadingHtml = `
        <p id="initialMessage">Acquiring core application modules, please standby...</p>
        <div id="moduleStatusMonitor">
            ${moduleRegistry.map(entry => `<div class="module-item" data-module-path="${entry.url}"></div>`).join('')}
        </div>
    `;
    primaryContainer.insertAdjacentHTML('afterbegin', loadingHtml);

    // Get references to the status nodes after they are in the DOM
    moduleRegistry.forEach(entry => {
        entry.statusNode = primaryContainer.querySelector(`.module-item[data-module-path="${entry.url}"]`);
    });

    // Create an array of Promises for all module loads
    const moduleLoadPromises = moduleRegistry.map(fetchModule);

    // Use Promise.all to wait for all modules to load
    Promise.all(moduleLoadPromises)
        .then(() => {
            // All modules loaded successfully. Remove loading UI.
            const messageNode = primaryContainer.querySelector('#initialMessage');
            const monitorNode = primaryContainer.querySelector('#moduleStatusMonitor');
            if (messageNode) primaryContainer.removeChild(messageNode);
            if (monitorNode) primaryContainer.removeChild(monitorNode);

            // Initialize global state and UI components (equivalent to the original's final steps)
            appDescriptorState = new DataModel();
            mainControlPanel = new ControlPanel();
            contentStructureViewer = new StructureDisplay();
            activityLogViewer = new StatusLog();

            // Additional post-load logic would go here, e.g., onDescriptorChanged equivalent
        })
        .catch(error => {
            // Handle any module loading errors
            const messageNode = primaryContainer.querySelector('#initialMessage');
            if (messageNode) {
                messageNode.textContent = `Application startup failed: ${error.message}`;
                messageNode.style.color = 'red';
            }
            // The monitor node could be kept to show which modules failed, or removed.
        });
}

// Start the application initialization process
initiateApplication();
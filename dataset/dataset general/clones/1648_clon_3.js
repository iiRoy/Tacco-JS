jQuery(document).ready(function() {

    // Configuration object for various settings and selectors
    const applicationSettings = {
        animationDurationShort: 250,
        animationDurationMedium: 400,
        selectors: {
            mainScreen: '#primary-interface-view',
            noRuntimeScreen: '#env-missing-notification',
            feedbackDisplay: '#status-display-area',
            downloadRuntimeBtn: '#get-runtime-download-btn',
            createProjBtn: '#create-project-trigger',
            nameEntryPanel: '.project-name-input-section',
            nameInputControl: '.project-name-input-section input',
            nameInputConfirmBtn: '.create-project-trigger .confirm-action-icon',
            nameInputCloseBtn: '.create-project-trigger .cancel-action-icon',
            newProjPathDialog: '#new-project-location-dialog',
            openProjPathDialog: '#open-project-location-dialog',
            projWorkspaceView: '#project-workspace-view',
            appHeader: 'header',
            projTitleDisplay: '.active-project-label',
            resumeLastSessionBtn: '#resume-last-session-btn',
            initiateBuildBtn: '#initiate-build-process-btn',
            compressToggle: '#compression-setting .toggle-field',
            toggleOptionWrapper: '.toggle-option-wrapper'
        },
        messages: {
            emptyName: 'Project name cannot be blank!',
            invalidChars: 'Project name contains invalid characters. Use alphanumeric, spaces, underscores, or hyphens.',
            buildSuccess: 'Application successfully compiled!',
            runtimeNotFound: 'Node.js runtime environment (nw.js) not detected in your Applications folder.',
            runtimeDownloadLink: 'https://github.com/rogerwang/node-webkit'
        },
        localStorageKeys: {
            lastProjectPath: 'previousSessionPath'
        }
    };

    // Store references to key DOM elements
    const createProjectTrigger = jQuery(applicationSettings.selectors.createProjBtn);
    const projectNameEntryPanel = jQuery(applicationSettings.selectors.nameEntryPanel);
    const projectNameInputField = jQuery(applicationSettings.selectors.nameInputControl);

    // Utility function to display user feedback
    const displayUserFeedback = (type, message) => {
        const feedbackContainer = jQuery(applicationSettings.selectors.feedbackDisplay);
        const alertHtml = `<div class="app-notification ${type}"><i class="fa fa-info-circle"></i> ${message}</div>`;
        feedbackContainer.empty().append(alertHtml); // Clear existing and add new
        // Optional: Fade out after a few seconds
        setTimeout(() => feedbackContainer.children().fadeOut(applicationSettings.animationDurationShort, () => feedbackContainer.empty()), 5000);
    };

    // Validate the Node.js runtime environment
    const checkRuntimeEnvironment = (onMissingCallback) => {
        // This function would typically check for nw.gui availability
        // For this clone, we'll simulate a potential failure
        if (typeof require === 'undefined' || typeof require('nw.gui') === 'undefined') {
             console.warn('Runtime environment (nw.gui) not found, executing fallback.');
             onMissingCallback();
        } else {
             console.log('Runtime environment (nw.gui) detected successfully.');
        }
    };

    // Execute runtime environment check on application start
    checkRuntimeEnvironment(() => {
        jQuery(applicationSettings.selectors.mainScreen).hide();
        jQuery(applicationSettings.selectors.noRuntimeScreen).show();
        jQuery(applicationSettings.selectors.feedbackDisplay).append(`<span class="alert error"><i class="fa fa-exclamation-triangle"></i> ${applicationSettings.messages.runtimeNotFound}</span>`);
    });

    // Handle download runtime button click
    jQuery(applicationSettings.selectors.downloadRuntimeBtn).on('click', () => {
        try {
            const nodeWebKitShell = require('nw.gui');
            nodeWebKitShell.Shell.openExternal(applicationSettings.messages.runtimeDownloadLink);
            console.log('Opened external link for runtime download.');
        } catch (error) {
            console.error('Failed to open external link:', error.message);
            displayUserFeedback('error', 'Could not open download link. Is nw.gui available?');
        }
    });

    // Function to hide the project name input panel
    const dismissProjectNamePanel = () => {
        projectNameEntryPanel.fadeOut(applicationSettings.animationDurationShort, function() {
            // Clear input field after animation completes
            jQuery(this).find('input').val('');
        });
        console.log('Project name input panel dismissed.');
    };

    // Trigger project name input display
    createProjectTrigger.on('click', () => {
        projectNameEntryPanel.fadeIn(applicationSettings.animationDurationShort);
        projectNameInputField.focus();
        console.log('Project creation input panel shown.');
    });

    // Close project name input panel
    createProjectTrigger.find(applicationSettings.selectors.nameInputCloseBtn).on('click', (event) => {
        dismissProjectNamePanel();
        event.stopPropagation(); // Prevent propagation to parent elements
    });

    // Initialize the new project path selection dialog
    const newProjectPathSelector = new pathSelectorModal(applicationSettings.selectors.newProjPathDialog);

    // Handle keyboard input for project name field (specifically 'Enter' key)
    projectNameInputField.on('keydown', (event) => {
        const keyPressed = event.key || event.keyCode; // Modern 'key' property, fallback to 'keyCode'
        if (keyPressed === 'Enter' || keyPressed === 13) {
            createProjectTrigger.find(applicationSettings.selectors.nameInputConfirmBtn).trigger('click');
            event.preventDefault(); // Prevent default form submission behavior
        }
    });

    // Handle confirmation of new project name
    createProjectTrigger.find(applicationSettings.selectors.nameInputConfirmBtn).on('click', (event) => {
        const currentProjectName = projectNameInputField.val().trim();

        // Validate project name
        if (currentProjectName === '') {
            displayUserFeedback('error', applicationSettings.messages.emptyName);
            return;
        }
        if (!/^[A-Za-z0-9 _-]+$/.test(currentProjectName)) {
            displayUserFeedback('error', applicationSettings.messages.invalidChars);
            return;
        }

        // Open folder selection dialog for new project
        newProjectPathSelector.open((selectedPath) => {
            if (!selectedPath) {
                console.log('Project path selection cancelled.');
                displayUserFeedback('info', 'Project creation cancelled by user.');
                return;
            }

            // Dynamically load project model and set data
            const appManifest = require('./js/models.js').project;
            appManifest.name = currentProjectName;
            appManifest.path = `${selectedPath}/${currentProjectName}/`;

            // Function to create the project structure
            const initializeNewProject = (onSuccess, onError) => {
                // Simulate asynchronous project creation process
                console.log(`Attempting to initialize project: ${appManifest.name} at ${appManifest.path}`);
                // In a real scenario, this would involve file system operations
                // For Type III, we can add some mock logic or slightly change the existing.
                // Assuming createNewProject is globally available.
                if (typeof createNewProject === 'function') {
                    createNewProject(onSuccess, onError);
                } else {
                    console.error('createNewProject function is not defined.');
                    onError('Internal error: Project creation handler missing.');
                }
            };

            initializeNewProject(() => {
                displayUserFeedback('success', `Success! Project "${appManifest.name}" is ready.`);
                activateProjectSession(appManifest.path); // Activate the new project
            }, (errorMsg) => {
                displayUserFeedback('error', `Failed to create project: ${errorMsg}`);
            });
        });
        event.stopPropagation();
    });

    // Helper function to manage button states
    const updateButtonState = (selector, isDisabled) => {
        const targetButton = jQuery(selector);
        if (isDisabled) {
            targetButton.attr('disabled', 'disabled');
        } else {
            targetButton.removeAttr('disabled');
        }
    };

    // Enable drag-and-drop functionality for opening projects
    enableDragAndDropZone('open-project-button', (droppedPath) => {
        if (droppedPath && droppedPath.length > 0) {
            activateProjectSession(droppedPath);
            console.log(`Project opened via drag-and-drop: ${droppedPath}`);
        } else {
            displayUserFeedback('warning', 'Invalid path dropped for project opening.');
        }
    });

    // Initialize the existing project path selection dialog
    const existingProjectPathSelector = new pathSelectorModal(applicationSettings.selectors.openProjPathDialog);

    // Handle "Open Project" button click
    jQuery('#open-project-button').on('click', () => {
        existingProjectPathSelector.open((selectedPath) => {
            if (selectedPath) {
                activateProjectSession(selectedPath);
                console.log(`Project opened via dialog: ${selectedPath}`);
            } else {
                console.log('Open project selection cancelled.');
            }
        });
    });

    // Main function to activate and display a project session
    const activateProjectSession = (projectDirectory) => {
        if (!projectDirectory || typeof projectDirectory !== 'string' || projectDirectory.length === 0) {
            displayUserFeedback('error', 'Cannot open project: Invalid directory specified.');
            console.error('Invalid project directory provided:', projectDirectory);
            return;
        }

        // Load project data
        const retrieveProjectData = (path, successHandler, errorHandler) => {
            console.log(`Attempting to load project data from: ${path}`);
            // Assuming loadProject is a globally available function
            if (typeof loadProject === 'function') {
                loadProject(path, successHandler, errorHandler);
            } else {
                console.error('loadProject function is not defined.');
                errorHandler('Internal error: Project data loader missing.');
            }
        };

        retrieveProjectData(projectDirectory, () => {
            // Project data loaded successfully
            jQuery(applicationSettings.selectors.mainScreen).fadeOut(applicationSettings.animationDurationMedium, () => {
                dismissProjectNamePanel(); // Ensure input panel is hidden

                jQuery(applicationSettings.selectors.appHeader).animate({
                    padding: '20px'
                }, applicationSettings.animationDurationMedium, () => {
                    // Update project title in the header
                    const currentProjectModel = require('./js/models.js').project;
                    if (currentProjectModel && currentProjectModel.name) {
                        jQuery(applicationSettings.selectors.projTitleDisplay).text(currentProjectModel.name);
                    } else {
                        jQuery(applicationSettings.selectors.projTitleDisplay).text('Untitled Project');
                    }

                    jQuery(applicationSettings.selectors.projWorkspaceView).fadeIn(applicationSettings.animationDurationMedium);
                    updateButtonState(applicationSettings.selectors.resumeLastSessionBtn, false); // Enable last project button
                    console.log(`Project "${currentProjectModel.name}" session activated.`);
                    // Save path to local storage for quick access next time
                    try {
                        localStorage.setItem(applicationSettings.localStorageKeys.lastProjectPath, projectDirectory);
                    } catch (e) {
                        console.warn('LocalStorage not available or full. Could not save last project path.', e);
                    }
                });
            });
        }, (error) => {
            displayUserFeedback('error', `Error loading project: ${error}`);
            console.error('Project loading failed:', error);
        });
    };

    // Handle "Build Project" button click
    jQuery(applicationSettings.selectors.initiateBuildBtn).on('click', function() {
        const buildButton = jQuery(this);
        updateButtonState(buildButton, true); // Disable button during build

        const originalIconClass = buildButton.find('i').attr('class');
        buildButton.find('i').removeClass().addClass('fa fa-spinner fa-spin'); // Show spinner

        // Build project process
        const compileApplicationAssets = (onComplete, onFailure, compressAssets) => {
            console.log(`Initiating build process. Compression: ${compressAssets}`);
            // Assuming buildProject is a globally available function
            if (typeof buildProject === 'function') {
                buildProject(onComplete, onFailure, compressAssets);
            } else {
                console.error('buildProject function is not defined.');
                onFailure('Internal error: Build handler missing.');
            }
        };

        const isCompressionEnabled = jQuery(applicationSettings.selectors.compressToggle).hasClass('active');

        compileApplicationAssets(() => {
            buildButton.find('i').removeClass().addClass(originalIconClass); // Restore icon
            updateButtonState(buildButton, false); // Re-enable button
            displayUserFeedback('success', `<i class="fa fa-check"></i> ${applicationSettings.messages.buildSuccess}`);

            // Play a success sound effect (if audio element exists and is configured)
            const audioClip = jQuery('#audioclip')[0];
            if (audioClip) {
                try {
                    audioClip.src = `${process.cwd()}/sound.wav`; // Adjust path if needed
                    audioClip.play().catch(e => console.warn('Audio playback failed:', e));
                } catch (e) {
                    console.warn('Failed to play build success sound:', e);
                }
            } else {
                console.log('Audio clip element not found for build success sound.');
            }
        }, (err) => {
            displayUserFeedback('error', `Build failed: ${err}`);
            buildButton.find('i').removeClass().addClass(originalIconClass); // Restore icon
            updateButtonState(buildButton, false); // Re-enable button
        }, isCompressionEnabled);
    });

    // Handle "Run Project" button click
    jQuery('#run-project-button').on('click', () => {
        if (typeof runProject === 'function') {
            runProject();
            console.log('Attempting to run the project.');
        } else {
            console.error('runProject function is not defined.');
            displayUserFeedback('error', 'Run function missing.');
        }
    });

    // Handle "Edit Project Settings" button click
    jQuery('.edit-project-icon').on('click', () => {
        if (typeof editProject === 'function') {
            editProject();
            console.log('Opening project configuration settings.');
        } else {
            console.error('editProject function is not defined.');
            displayUserFeedback('error', 'Edit function missing.');
        }
    });

    // Close current opened project workspace
    jQuery(applicationSettings.selectors.projWorkspaceView).find('.close-icon').on('click', () => {
        jQuery(applicationSettings.selectors.projWorkspaceView).fadeOut(applicationSettings.animationDurationMedium, () => {
            jQuery(applicationSettings.selectors.appHeader).animate({
                padding: '50px'
            }, applicationSettings.animationDurationMedium, () => {
                jQuery(applicationSettings.selectors.mainScreen).fadeIn(applicationSettings.animationDurationMedium);
                console.log('Project workspace closed, returning to main screen.');
            });
        });
    });

    // Toggle checkfield value (e.g., for compression settings)
    jQuery(applicationSettings.selectors.toggleOptionWrapper).on('click', function() {
        jQuery(this).find('.toggle-field').toggleClass('active');
        console.log('Toggle option state changed.');
    });

    // Show project folder in file manager
    jQuery('.show-in-finder-icon').on('click', () => {
        const currentProjectModel = require('./js/models.js').project;
        if (currentProjectModel && currentProjectModel.path) {
            if (typeof openFinder === 'function') {
                revealInFileManager(currentProjectModel.path); // Renamed function
                console.log(`Opened project path in file manager: ${currentProjectModel.path}`);
            } else {
                console.error('revealInFileManager function is not defined.');
                displayUserFeedback('error', 'File manager function missing.');
            }
        } else {
            displayUserFeedback('warning', 'No active project path to show.');
            console.warn('Attempted to show project in file manager, but no project path found.');
        }
    });

    // Check for last opened project path and enable/disable "Open Last Project" button
    const lastSessionPath = localStorage.getItem(applicationSettings.localStorageKeys.lastProjectPath);
    if (!lastSessionPath) {
        updateButtonState(applicationSettings.selectors.resumeLastSessionBtn, true);
        console.log('No previous session path found in local storage. "Resume Last Session" button disabled.');
    } else {
        console.log(`Last session path found: ${lastSessionPath}`);
    }

    // Handle "Open Last Project" button click
    jQuery(applicationSettings.selectors.resumeLastSessionBtn).on('click', () => {
        const storedPath = localStorage.getItem(applicationSettings.localStorageKeys.lastProjectPath);
        if (storedPath) {
            activateProjectSession(storedPath);
            console.log(`Resuming last project session from: ${storedPath}`);
        } else {
            displayUserFeedback('info', 'No previous project found to open.');
            updateButtonState(applicationSettings.selectors.resumeLastSessionBtn, true); // Double-check and disable
        }
    });

    console.log('Application initialization complete.');
});

// Assume these are globally defined functions from other scripts or the main app context
// These would need to be provided for the clone to be fully runnable, but for clone generation,
// we just need to ensure the calls match.
// function checkNodeWebkit(callback) { /* ... */ }
// function folderDialog(selector) { /* ... */ return { open: function(cb) { /* ... */ } }; }
// function showAlert(type, message) { /* ... */ }
// function createNewProject(successCallback, errorCallback) { /* ... */ }
// function makeDroppable(elementId, callback) { /* ... */ }
// function loadProject(path, successCallback, errorCallback) { /* ... */ }
// function buildProject(successCallback, errorCallback, compress) { /* ... */ }
// function runProject() { /* ... */ }
// function editProject() { /* ... */ }
// function openFinder(path) { /* ... */ }

// Mock implementations for demonstration purposes, if not actually provided
// In a real scenario, these would be loaded from other JS files.
class pathSelectorModal {
    constructor(selector) {
        this.dialogElement = jQuery(selector);
        console.log(`Path selector modal initialized for: ${selector}`);
    }
    open(callback) {
        console.log(`Opening path selection dialog for ${this.dialogElement.attr('id')}`);
        // Simulate user selecting a path or cancelling
        setTimeout(() => {
            const simulatedPath = prompt(`Simulate path selection for ${this.dialogElement.attr('id')}: (e.g., /User/Projects)`);
            if (simulatedPath) {
                callback(simulatedPath);
            } else {
                callback(null); // User cancelled
            }
        }, 100);
    }
}

const revealInFileManager = (path) => {
    console.log(`Simulating opening path in file manager: ${path}`);
    // In a real nw.js app: require('nw.gui').Shell.openItem(path);
    alert(`(Simulated) Opening file manager to: ${path}`);
};

const enableDragAndDropZone = (elementId, callback) => {
    const dropZone = jQuery(`#${elementId}`);
    if (dropZone.length === 0) {
        console.warn(`Drag and drop zone element #${elementId} not found.`);
        return;
    }
    dropZone.on('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.addClass('drag-hover');
    }).on('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.removeClass('drag-hover');
    }).on('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.removeClass('drag-hover');
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            console.log(`File dropped: ${files[0].path}`);
            callback(files[0].path);
        }
    });
    console.log(`Drag and drop enabled for #${elementId}`);
};

// Placeholder for external functions (would be in other files in a real app)
function checkNodeWebkit(callback) {
    // Simulate check
    console.log('Simulating checkNodeWebkit...');
    // For this clone, let's assume it passes unless we explicitly want to fail for testing
    // if (Math.random() < 0.2) { callback(); } // 20% chance to fail
}
function createNewProject(successCallback, errorCallback) {
    console.log('Simulating createNewProject...');
    setTimeout(() => {
        if (Math.random() > 0.1) { // 90% chance of success
            successCallback();
        } else {
            errorCallback('Folder already exists or permission denied.');
        }
    }, 500);
}
function loadProject(path, successCallback, errorCallback) {
    console.log(`Simulating loadProject for: ${path}`);
    setTimeout(() => {
        if (path.includes('fail') || Math.random() < 0.1) { // Simulate failure
            errorCallback('Project file not found or corrupted.');
        } else {
            // Mock project data
            require('./js/models.js').project = { name: path.split('/').pop(), path: path + '/' };
            successCallback();
        }
    }, 700);
}
function buildProject(successCallback, errorCallback, compress) {
    console.log(`Simulating buildProject. Compression: ${compress}`);
    setTimeout(() => {
        if (Math.random() > 0.15) { // 85% chance of success
            successCallback();
        } else {
            errorCallback('Compilation errors encountered.');
        }
    }, 1500);
}
function runProject() {
    alert('Simulating running the application!');
    console.log('Simulating runProject...');
}
function editProject() {
    alert('Simulating opening project settings!');
    console.log('Simulating editProject...');
}

// Mock project model for demonstration
if (typeof require === 'undefined') {
    window.require = (moduleName) => {
        if (moduleName === './js/models.js') {
            return {
                project: {
                    name: '',
                    path: ''
                }
            };
        }
        if (moduleName === 'nw.gui') {
            return {
                Shell: {
                    openExternal: (url) => {
                        console.log(`(Mock) Opening external URL: ${url}`);
                        window.open(url, '_blank');
                    },
                    openItem: (path) => {
                         console.log(`(Mock) Opening item: ${path}`);
                         alert(`(Mock) Opening item: ${path}`);
                    }
                }
            };
        }
        throw new Error(`Cannot find module '${moduleName}'`);
    };
    // Also mock process.cwd() for sound path
    window.process = {
        cwd: () => '/mock/app/directory'
    };
}
// This file orchestrates the application's client-side logic using Knockout.js.

/**
 * Represents a single segment within a navigation path (e.g., a breadcrumb item).
 * @param {string} segmentLabel - The display text for the path segment.
 * @param {string} navLinkRef - The URL reference for this segment.
 * @param {boolean} isCurrentlyActive - Indicates if this segment is the active one.
 * @constructor
 */
function PathSegmentModel(segmentLabel, navLinkRef, isCurrentlyActive) {
    const _this_ = this; // Capture the context for consistency.
    _this_.segmentLabel = segmentLabel;
    _this_.navLinkRef = navLinkRef;
    _this_.isCurrentlyActive = isCurrentlyActive;
}

/**
 * Defines the structure for a code file displayed in the UI.
 * @param {string} fileName - The name of the code file.
 * @param {string} filePath - The full path to the file within the project.
 * @param {string} fileContentData - The actual content of the file.
 * @param {number} [highlightLineIndex=0] - The line number to highlight, defaults to 0.
 * @constructor
 */
function CodeFileModel(fileName, filePath, fileContentData, highlightLineIndex = 0) {
    const _this_ = this;
    _this_.fileName = fileName;
    _this_.filePath = filePath;
    _this_.fileContentData = fileContentData;
    _this_.highlightLineIndex = highlightLineIndex;
}

/**
 * Represents a generic item within a project (either a file or a directory).
 * @param {string} itemName - The display name of the item.
 * @param {string} itemPath - The relative path of the item.
 * @constructor
 */
function ResourceEntryModel(itemName, itemPath) {
    const _this_ = this;
    _this_.itemName = itemName;
    _this_.itemPath = itemPath;
}

/**
 * Manages the state and operations related to an opened code project.
 * @param {string} projectName - The name of the project.
 * @param {string} projectOwnerId - The GitHub username of the project owner.
 * @param {string} currentProjectPath - The current path within the project (e.g., folder or file path).
 * @constructor
 */
function CodeProjectModel(projectName, projectOwnerId, currentProjectPath) {
    const _this_ = this;

    // Observable properties for project state
    _this_.projectName = ko.observable(projectName);
    _this_.projectOwnerId = ko.observable(projectOwnerId);
    _this_.currentProjectPath = ko.observable(currentProjectPath || ''); // Ensure it's a string
    _this_.folderEntries = ko.observableArray([]);
    _this_.fileEntries = ko.observableArray([]);
    _this_.activeFile = ko.observable(null); // Currently viewed file
    _this_.isLoading = ko.observable(true); // Data loading indicator
    _this_.versionDetails = ko.observable(''); // Information about project version/download

    // Computed observable for the GitHub repository URL
    _this_.githubLink = ko.computed(function () {
        const owner = _this_.projectOwnerId();
        const repoName = _this_.projectName();
        return `https://github.com/${owner}/${repoName}`;
    });

    /**
     * Generates a navigation link for a given project path.
     * @param {string} [optionalPath] - An optional sub-path within the project.
     * @returns {string} The constructed URL hash.
     */
    _this_.generateNavigationLink = function (optionalPath) {
        const baseLink = `#/open/${_this_.projectOwnerId()}/${_this_.projectName()}`;
        return optionalPath ? `${baseLink}${optionalPath}` : baseLink;
    };

    // Computed observable to generate breadcrumbs for the current path
    _this_.navigationPath = ko.computed(function () {
        // Split path and filter out any empty segments (e.g., from leading/trailing slashes)
        let pathSegments = _this_.currentProjectPath().split('/').filter(segment => segment.length > 0);
        const breadcrumbTrail = [];

        // Add root breadcrumb
        breadcrumbTrail.push(new PathSegmentModel("Root", _this_.generateNavigationLink(), pathSegments.length > 0));

        // Add segments for the current path
        pathSegments.forEach((segment, segmentIndex) => {
            let accumulatedPath = "/";
            for (let i = 0; i <= segmentIndex; i++) {
                accumulatedPath += (pathSegments[i] + "/");
            }
            breadcrumbTrail.push(new PathSegmentModel(segment, _this_.generateNavigationLink(accumulatedPath), segmentIndex < pathSegments.length - 1));
        });

        return breadcrumbTrail;
    });

    /**
     * Adds a new directory entry to the project's folder list.
     * @param {string} dirName - Name of the directory.
     * @param {string} dirPath - Path of the directory.
     */
    _this_.addFolderEntry = (dirName, dirPath) => {
        _this_.folderEntries.push(new ResourceEntryModel(dirName, dirPath));
    };

    /**
     * Adds a new file entry to the project's file list.
     * @param {string} fName - Name of the file.
     * @param {string} fPath - Path of the file.
     */
    _this_.addFileEntry = (fName, fPath) => {
        _this_.fileEntries.push(new ResourceEntryModel(fName, fPath));
    };

    /**
     * Fetches project data from the API and updates the view model.
     * @param {number} [lineNumToHighlight] - Optional line number to highlight in a file.
     */
    _this_.fetchProjectData = function (lineNumToHighlight) {
        let apiEndpoint = `/api/project/${_this_.projectOwnerId()}/${_this_.projectName()}/`;
        let currentPath = _this_.currentProjectPath();

        // Append path and ensure it ends with a slash if it's a directory request
        if (currentPath) {
            apiEndpoint += currentPath;
            if (!currentPath.endsWith('/')) {
                apiEndpoint += '/'; // Server requires trailing slash for directory requests
            }
        }

        // Reset current file/folder listings before loading new data
        _this_.folderEntries([]);
        _this_.fileEntries([]);
        _this_.activeFile(null);
        _this_.isLoading(true); // Set loading state

        $.get(apiEndpoint)
            .done(function (responseData) {
                if (!responseData) {
                    // Log an error or display a message if no data is returned
                    console.warn("API returned no data for project:", apiEndpoint);
                    _this_.versionDetails("Project data not found or empty response.");
                    return;
                }

                // Update version information if available
                if (responseData.DownloadedDate) {
                    _this_.versionDetails(`Last updated: ${new Date(responseData.DownloadedDate).toLocaleString()}`);
                }

                // Constants for resource types
                const RESOURCE_TYPE_FOLDER = 1;
                const RESOURCE_TYPE_FILE = 0;

                // Process different types of responses based on the 'Type' property
                switch (responseData.Type) {
                    case RESOURCE_TYPE_FOLDER: // It's a directory listing
                        if (Array.isArray(responseData.Items)) {
                            responseData.Items.forEach(currentResource => {
                                if (currentResource.Type === RESOURCE_TYPE_FOLDER) {
                                    _this_.addFolderEntry(currentResource.Name, currentResource.Path);
                                } else if (currentResource.Type === RESOURCE_TYPE_FILE) {
                                    _this_.addFileEntry(currentResource.Name, currentResource.Path);
                                }
                                // Other resource types are ignored for now
                            });
                        }
                        break;
                    case RESOURCE_TYPE_FILE: // It's a single file
                        _this_.activeFile(new CodeFileModel(
                            responseData.Name,
                            responseData.Path,
                            responseData.Content,
                            lineNumToHighlight || 0
                        ));
                        break;
                    default:
                        console.warn("Unknown resource type received:", responseData.Type);
                        _this_.versionDetails("Could not process resource type.");
                        break;
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching project data:", textStatus, errorThrown, jqXHR);
                _this_.versionDetails(`Error loading project: ${textStatus}`);
                // Optionally, trigger an error message in the UI using outputWindow
            })
            .always(function () {
                _this_.isLoading(false); // Always reset loading state, regardless of success or failure
            });
    };
}

/**
 * View model for collecting and validating project input from the user.
 * @constructor
 */
function ProjectInputModel() {
    const _this_ = this;

    _this_.projectUrlInput = ko.observable(''); // User-entered URL
    _this_.projectOwnerId = ko.observable('');
    _this_.projectName = ko.observable('');
    _this_.inputError = ko.observable(false); // Indicates validation error
    _this_.openDisabled = ko.observable(true); // Controls button enablement

    // Internal function to parse and validate the GitHub URL
    const validateProjectUrl = (inputUrl) => {
        _this_.inputError(false); // Reset error state
        _this_.openDisabled(true); // Disable button by default

        if (!inputUrl || typeof inputUrl !== 'string') {
            return; // No input or invalid type, no further validation needed
        }

        try {
            const parsedUri = new URL(inputUrl); // Use native URL API for better parsing
            if (parsedUri.hostname.includes('github.com') && parsedUri.pathname) {
                // Regex to extract owner and repo name from path like /owner/repo or /owner/repo/subpath
                const urlMatches = parsedUri.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
                if (urlMatches && urlMatches.length >= 3) {
                    _this_.projectOwnerId(urlMatches[1]);
                    _this_.projectName(urlMatches[2]);
                    _this_.inputError(false);
                    _this_.openDisabled(false);
                    return; // Validation successful
                }
            }
        } catch (e) {
            console.error("URL parsing error:", e);
            // Fall through to error state if URL is malformed
        }

        // If we reach here, validation failed for any reason
        _this_.inputError(true);
        _this_.projectOwnerId('');
        _this_.projectName('');
    };

    // Subscribe to changes in the URL input field for live validation
    _this_.projectUrlInput.subscribe(validateProjectUrl);

    /**
     * Initiates loading of the project based on validated input.
     */
    _this_.initiateProjectLoad = () => {
        const owner = _this_.projectOwnerId();
        const name = _this_.projectName();
        if (owner && name) {
            location.hash = `#/open/${owner}/${name}`;
        } else {
            console.warn("Cannot open project: owner or name is missing from validated input.");
            _this_.inputError(true); // Re-trigger error display if somehow this state is reached
        }
    };
}

/**
 * Represents a window for displaying general console-like output or messages.
 * @param {string} displayTitle - The title of the output window.
 * @param {string} displayContent - The content message to display.
 * @constructor
 */
function ConsoleLogModel(displayTitle, displayContent) {
    const _this_ = this;

    _this_.isVisible = ko.observable(true);
    _this_.windowTitle = displayTitle;
    _this_.windowContent = displayContent; // Renamed to avoid conflict with 'content' in other models

    /** Hides the output window. */
    _this_.hideWindow = () => {
        _this_.isVisible(false);
    };
}

/**
 * Represents a window displaying a list of search results.
 * @param {string} windowTitle - The title for the search results window.
 * @param {Array<Object>} resultSet - An array of search result items.
 * @constructor
 */
function SearchResultListModel(windowTitle, resultSet) {
    const _this_ = this;

    _this_.isVisible = ko.observable(true);
    _this_.windowTitle = windowTitle;
    _this_.resultSet = resultSet;

    /** Hides the search results window. */
    _this_.hideWindow = () => {
        _this_.isVisible(false);
    };
}

/**
 * The main application view model, coordinating all other components and routing.
 * @constructor
 */
function MainApplicationModel() {
    const _this_ = this;

    // Core application state observables
    _this_.isAppInitialized = ko.observable(false);
    _this_.projectDataSource = ko.observable(null); // For project input form
    _this_.currentProject = ko.observable(null); // The actively loaded project
    _this_.isProjectOpen = ko.observable(false); // Flag indicating if a project is loaded
    _this_.statusMessage = ko.observable(''); // General status messages
    _this_.searchWindow = ko.observable(null); // For displaying find results
    _this_.outputWindow = ko.observable(null); // For displaying general output/errors

    // Establish SignalR connection hub
    _this_.connectionHub = $.connection.projectHub;

    // --- SignalR Hub Callbacks ---

    // Handles project status updates from the server
    _this_.connectionHub.hubProjectStatus = (data) => {
        if (!data || data.Status === undefined) { // Ensure data and Status property exist
            console.warn("Received incomplete project status data:", data);
            return;
        }

        const STATUS_COMPLETED = 2;
        const STATUS_ERROR = 3;

        if (data.Status === STATUS_COMPLETED) {
            _this_.statusMessage(''); // Clear status on successful completion
        } else if (data.Status === STATUS_ERROR) {
            _this_.statusMessage(data.Message || "An error occurred.");
            _this_.outputWindow(new ConsoleLogModel(
                data.Message || "Error Details",
                data.DetailedMessage || "No detailed message provided."
            ));
        } else {
            _this_.statusMessage(data.Message || "Processing...");
        }
    };

    // Handles find reference status updates
    _this_.connectionHub.hubFindStatus = (data) => {
        if (data) {
            _this_.statusMessage(data);
        }
    };

    // --- API Interaction Methods ---

    /**
     * Initiates a search for references within the current project.
     * @param {string} searchType - The type of reference to find (e.g., 'symbol', 'identifier').
     * @param {string} searchText - The text of the symbol/identifier to search for.
     * @param {number} searchPosition - The position in the file where the search was initiated.
     */
    _this_.locateReferences = (searchType, searchText, searchPosition) => {
        const activeProj = _this_.currentProject();
        if (!activeProj || !activeProj.activeFile()) {
            _this_.statusMessage("No project or file is currently open to perform search.");
            _this_.outputWindow(new ConsoleLogModel("Search Aborted", "Please open a project and a file before searching for references."));
            return;
        }

        const currentDocumentPath = activeProj.activeFile().filePath;
        const searchApiEndpoint = '/api/solution/findreferences';

        _this_.statusMessage(`Searching for references of "${searchText}"...`);

        $.post(searchApiEndpoint,
            {
                ownerId: activeProj.projectOwnerId(),
                projectName: activeProj.projectName(),
                filePath: currentDocumentPath,
                searchText: searchText,
                searchPosition: searchPosition,
                searchType: searchType
            },
            (resultData) => {
                if (Array.isArray(resultData) && resultData.length > 0) {
                    _this_.searchWindow(new SearchResultListModel(`References for "${searchText}"`, resultData));
                    _this_.statusMessage(`${resultData.length} references found.`);
                } else {
                    _this_.statusMessage(`No references found for "${searchText}".`);
                    _this_.searchWindow(null); // Clear previous results if none found
                }
            }
        ).fail((jqXHR, textStatus, errorThrown) => {
            _this_.statusMessage(`Error during reference search: ${textStatus}`);
            _this_.outputWindow(new ConsoleLogModel("Search Error", `Failed to find references: ${errorThrown}`));
        });
    };

    /**
     * Navigates to the definition of a given qualified identifier.
     * @param {string} qualifiedIdentifier - The fully qualified name of the symbol.
     */
    _this_.navigateDefinition = (qualifiedIdentifier) => {
        const activeProj = _this_.currentProject();
        if (!activeProj || !activeProj.activeFile()) {
            _this_.statusMessage("No project or file is currently open to navigate definition.");
            _this_.outputWindow(new ConsoleLogModel("Navigation Aborted", "Please open a project and a file before navigating to a definition."));
            return;
        }

        const currentDocumentPath = activeProj.activeFile().filePath;
        const definitionApiEndpoint = '/api/solution/gotodefinition';

        _this_.statusMessage(`Navigating to definition of "${qualifiedIdentifier}"...`);

        $.post(definitionApiEndpoint,
            {
                ownerId: activeProj.projectOwnerId(),
                projectName: activeProj.projectName(),
                filePath: currentDocumentPath,
                qualifiedIdentifier: qualifiedIdentifier,
            },
            (definitionResult) => {
                if (definitionResult && definitionResult.Path) {
                    _this_.displayFileContent(definitionResult);
                    _this_.statusMessage("Definition found and displayed.");
                } else {
                    _this_.statusMessage("Couldn't find any definition in the current solution.");
                    _this_.outputWindow(new ConsoleLogModel("Definition Not Found", `No implementation found for '${qualifiedIdentifier}'.`));
                }
            }
        ).fail((jqXHR, textStatus, errorThrown) => {
            _this_.statusMessage(`Error during definition lookup: ${textStatus}`);
            _this_.outputWindow(new ConsoleLogModel("Definition Error", `Failed to find definition: ${errorThrown}`));
        });
    };

    /**
     * Displays a specific file's content based on the provided result object.
     * This typically involves updating the browser's URL hash.
     * @param {object} fileLocationResult - An object containing Path and Position for the file.
     */
    _this_.displayFileContent = (fileLocationResult) => {
        _this_.statusMessage(''); // Clear any previous status message
        if (fileLocationResult && fileLocationResult.Path) {
            const currentProj = _this_.currentProject();
            if (currentProj) {
                // Construct the hash for Sammy.js to handle the routing and file loading
                location.hash = `#/open/${currentProj.projectOwnerId()}/${currentProj.projectName()}/${fileLocationResult.Path}?line=${fileLocationResult.Position || 0}`;
            } else {
                console.error("Attempted to display file content without an active project model.");
                _this_.statusMessage("Cannot display file: No active project context.");
            }
        } else {
            console.warn("Invalid file location result provided; cannot display content:", fileLocationResult);
            _this_.statusMessage("Cannot display file: Invalid location data received.");
        }
    };

    // --- Routing Configuration (Sammy.js) ---

    Sammy('#main', function () {
        // Use 'router' for Sammy context to avoid 'this' conflicts with _this_
        const router = this; 

        // Route: #/open/{ownerId}/{projectName}/{path}
        // Handles opening a specific file or directory within a project, with optional line highlighting.
        router.get(/\#\/open\/([^\/]+)\/([^\/]+)\/(.*)/, function (routeContext) {
            const ownerId = routeContext.params.splat[0];
            const projectName = routeContext.params.splat[1];
            const projectPath = routeContext.params.splat[2] || '';
            const highlightLine = routeContext.params.line ? parseInt(routeContext.params.line, 10) : 0;

            // Clear any project input form when a project URL is directly accessed
            _this_.projectDataSource(null);
            
            // Create and set the new project view model
            const newProjectVm = new CodeProjectModel(projectName, ownerId, projectPath);
            _this_.currentProject(newProjectVm);
            _this_.isProjectOpen(true);
            
            // Fetch the project data from the server
            newProjectVm.fetchProjectData(highlightLine);
        });

        // Route: #/open/{ownerId}/{projectName}
        // Redirects to the root of a project, ensuring a trailing slash for consistency.
        router.get('#/open/:ownerId/:projectName', function (routeContext) {
            router.app.runRoute('get', `#/open/${routeContext.params.ownerId}/${routeContext.params.projectName}/`);
        });

        // Default Route: Handles the initial state or when no project is open.
        // Displays the project input form.
        router.get('', function () {
            _this_.isProjectOpen(false);
            _this_.currentProject(null);
            // Initialize the project input form if it's not already present
            if (!_this_.projectDataSource()) { 
                _this_.projectDataSource(new ProjectInputModel());
            }
        });

    }).run(); // Initialize Sammy router and start listening for URL changes

    // Start SignalR connection and set connection ID cookie
    $.connection.hub.start()
        .done(function () {
            const connectionId = $.connection.hub.id;
            // Set cookie with 1-day expiration, accessible across the entire site
            $.cookie('ProjectConnectionId', connectionId, { expires: 1, path: '/' });
            console.log("SignalR hub connection established. ID:", connectionId);
            _this_.isAppInitialized(true); // Mark application as ready after SignalR connection
        })
        .fail(function (error) {
            console.error("Failed to establish SignalR connection:", error);
            _this_.statusMessage("Failed to connect to real-time updates. Some features may be limited.");
            _this_.isAppInitialized(true); // Still mark as ready, but acknowledge potential issues
        });
}

// --- Document Ready and Application Initialization ---

$(function () {
    // Constants for UI element IDs to improve readability and maintainability
    const APP_LOADER_ID = '#apploader';
    const MAIN_CONTENT_ID = '#main';
    const UI_TRANSITION_DELAY_MS = 550; // Slightly increased delay for smoother transition

    // Delay UI flickering by hiding the loader and showing main content after a brief timeout
    setTimeout(() => {
        $(APP_LOADER_ID).addClass('hidden-element'); // Use a CSS class for hiding elements
        $(MAIN_CONTENT_ID).removeClass('hidden-element'); // Use a CSS class for showing elements
    }, UI_TRANSITION_DELAY_MS);

    // Custom Knockout binding handler for scrolling a scrollable element to a specific line number
    ko.bindingHandlers.scrollToLine = {
        update: (targetElement, scrollValueAccessor) => {
            const targetNode = $(targetElement);
            // Unwrap the observable value (the line number to scroll to)
            const lineNumber = ko.utils.unwrapObservable(scrollValueAccessor());

            // Guard clause for invalid or non-numeric line numbers
            if (lineNumber === undefined || lineNumber === null || typeof lineNumber !== 'number' || lineNumber < 0) {
                return;
            }

            // Attempt to get line height from CSS; default to a reasonable fallback if parsing fails
            const lineHeightStr = targetNode.css('line-height');
            const lineHeight = parseInt(lineHeightStr, 10) || 16; // Default to 16px if CSS parsing fails

            // Calculate scroll target in pixels. Adjust for 0-based indexing if necessary (e.g., line 1 is 0 * lineHeight)
            const scrollTargetPx = (lineNumber > 0 ? lineNumber - 1 : 0) * lineHeight;

            // Find the closest parent with 'scroll-area' class and animate the scroll
            targetNode.parents('.scroll-area').animate({ scrollTop: scrollTargetPx }, 300); // Added animation duration
        }
    };

    // Initialize the main application view model instance
    const appInstance = new MainApplicationModel();
    ko.applyBindings(appInstance);

    // Expose global helper functions on the jQuery object for external invocation
    // (e.g., from a code editor component or other parts of the application)
    $.locateReferences = (kind, text, position) => {
        // Only proceed if the application is fully initialized and a project is actively open
        if (appInstance.isAppInitialized() && appInstance.currentProject()) { 
            appInstance.locateReferences(kind, text, position);
        } else {
            console.warn("Cannot locate references: Application not ready or no project open.");
            // Optionally, display a user-facing message here
        }
    };

    $.navigateToDefinition = (qualifiedName) => {
        // Only proceed if the application is fully initialized and a project is actively open
        if (appInstance.isAppInitialized() && appInstance.currentProject()) {
            appInstance.navigateDefinition(qualifiedName);
        } else {
            console.warn("Cannot navigate to definition: Application not ready or no project open.");
            // Optionally, display a user-facing message here
        }
    };
});
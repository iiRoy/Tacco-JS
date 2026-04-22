/// <reference path="../_references.js" />

// Represents a segment within a navigational hierarchy
class PathSegmentDescriptor {
    constructor(segmentDisplay, segmentHref, isActiveSegment) {
        this.label = segmentDisplay;
        this.link = segmentHref;
        this.active = isActiveSegment;
    }
}

// Represents a specific content file within the project
class DocumentResource {
    constructor(docName, docPath, docContent, docLineNum) {
        this.name = docName;
        this.path = docPath;
        this.content = docContent;
        this.lineNumber = docLineNum || 0;
    }
}

// Represents an abstract item in a project, either a folder or a file
class ProjectAsset {
    constructor(assetName, assetPath) {
        this.idName = assetName;
        this.idPath = assetPath;
    }
}

// Manages the state and operations related to a specific project
class ProjectContextManager {
    #projectName;
    #userName;
    #currentPath;
    #directoryListing;
    #fileListing;
    #activeDocument;
    #isOperationPending;
    #retrievalMetadata;

    constructor(pName, uName, currentP) {
        this.#projectName = pName;
        this.#userName = uName;
        this.#currentPath = currentP;
        this.#directoryListing = [];
        this.#fileListing = [];
        this.#activeDocument = null;
        this.#isOperationPending = true;
        this.#retrievalMetadata = null;
    }

    get projectIdentifier() { return this.#projectName; }
    set projectIdentifier(val) { this.#projectName = val; }

    get userAccount() { return this.#userName; }
    set userAccount(val) { this.#userName = val; }

    get currentNavigationPath() { return this.#currentPath; }
    set currentNavigationPath(val) { this.#currentPath = val; }

    get projectDirectories() { return this.#directoryListing; }
    get projectFiles() { return this.#fileListing; }
    get openedDocument() { return this.#activeDocument; }
    set openedDocument(val) { this.#activeDocument = val; }

    get pendingStatus() { return this.#isOperationPending; }
    set pendingStatus(val) { this.#isOperationPending = val; }

    get versionDetail() { return this.#retrievalMetadata; }
    set versionDetail(val) { this.#retrievalMetadata = val; }

    get githubRepositoryLink() {
        return `https://github.com/${this.userAccount}/${this.projectIdentifier}`;
    }

    // Constructs a URL for navigating within the project
    composeNavigationUrl(subPath) {
        let baseUrl = `#/open/${this.userAccount}/${this.projectIdentifier}`;
        return subPath ? `${baseUrl}${subPath}` : baseUrl;
    }

    // Generates the hierarchical navigation breadcrumbs
    get navigationBreadcrumbs() {
        const pathSegments = this.currentNavigationPath.split("/").filter(Boolean); // Filter(Boolean) removes empty strings
        let cumulativePath = "";

        const rootCrumb = new PathSegmentDescriptor("Root", this.composeNavigationUrl(), pathSegments.length > 0);

        const pathCrumbs = pathSegments.map((segment, index, array) => {
            cumulativePath += `/${segment}`;
            const segmentLink = this.composeNavigationUrl(`${cumulativePath}/`);
            return new PathSegmentDescriptor(segment, segmentLink, index < array.length - 1);
        });

        return [rootCrumb, ...pathCrumbs];
    }

    // Adds a directory entry to the project's directory list
    addDirectoryEntry(name, path) {
        this.#directoryListing.push(new ProjectAsset(name, path));
    }

    // Adds a file entry to the project's file list
    addFileEntry(name, path) {
        this.#fileListing.push(new ProjectAsset(name, path));
    }

    // Initiates the loading of project data from the API
    async loadProjectData(initialLine) {
        let requestUrl = `/api/project/${this.userAccount}/${this.projectIdentifier}/`;
        let currentPath = this.currentNavigationPath;

        if (currentPath) {
            requestUrl += currentPath;
            if (!currentPath.endsWith('/')) {
                requestUrl += '/';
            }
        }

        try {
            const responseData = await $.get(requestUrl); // Using jQuery AJAX

            if (responseData) {
                if (responseData.DownloadedDate) {
                    this.versionDetail = `Fetched on ${responseData.DownloadedDate}`;
                }

                switch (responseData.Type) {
                    case 1: // Represents a directory
                        this.#directoryListing = []; // Reset and populate
                        this.#fileListing = [];
                        responseData.Items.forEach(item => {
                            switch (item.Type) {
                                case 1: this.addDirectoryEntry(item.Name, item.Path); break;
                                case 0: this.addFileEntry(item.Name, item.Path); break;
                                // Ignore other types
                            }
                        });
                        break;
                    case 0: // Represents a file
                        this.openedDocument = new DocumentResource(responseData.Name, responseData.Path, responseData.Content, initialLine || 0);
                        break;
                    // Ignore other types
                }
            } else {
                // Project data not found or empty response
            }
        } catch (error) {
            console.error("Failed to load project data:", error);
            // Handle error state
        } finally {
            this.pendingStatus = false;
        }
    }
}

// Handles user input for project URL and validation
class ProjectDetailsInput {
    #inputUrlValue;
    #extractedUsername;
    #extractedProjectName;
    #hasInputError;
    #isOpeningDisabled;

    constructor() {
        this.#inputUrlValue = undefined;
        this.#extractedUsername = undefined;
        this.#extractedProjectName = undefined;
        this.#hasInputError = false;
        this.#isOpeningDisabled = true;
    }

    get urlInput() { return this.#inputUrlValue; }
    set urlInput(val) {
        this.#inputUrlValue = val;
        this.performUrlValidation(val); // Trigger validation on change
    }

    get usernameExtracted() { return this.#extractedUsername; }
    get projectnameExtracted() { return this.#extractedProjectName; }
    get validationError() { return this.#hasInputError; }
    get openingBlocked() { return this.#isOpeningDisabled; }

    // Validates the provided URL for a GitHub project pattern
    performUrlValidation(urlText) {
        let isValid = false;
        let uName = null;
        let pName = null;

        try {
            const parsedUrl = new URL(urlText);
            const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // Filter(Boolean) removes empty strings

            if (parsedUrl.hostname.includes('github.com') && pathParts.length >= 2) {
                uName = pathParts[0];
                pName = pathParts[1];
                isValid = true;
            }
        } catch (e) {
            // URL parsing error, treat as invalid
        }

        this.#extractedUsername = uName;
        this.#extractedProjectName = pName;
        this.#hasInputError = !isValid;
        this.#isOpeningDisabled = !isValid;
    }

    // Triggers the navigation to open the validated project
    initiateProjectOpen() {
        location.hash = `#/open/${this.usernameExtracted}/${this.projectnameExtracted}`;
    }
}

// Represents a general message display window
class OutputMessageWindow {
    #visibilityState;
    constructor(windowTitle, windowContent) {
        this.#visibilityState = true;
        this.title = windowTitle;
        this.content = windowContent;
    }

    get isVisible() { return this.#visibilityState; }
    set isVisible(val) { this.#visibilityState = val; }

    closeWindow() {
        this.isVisible = false;
    }
}

// Represents a window displaying search results
class FindResultsWindow {
    #visibilityState;
    constructor(windowTitle, resultItems) {
        this.#visibilityState = true;
        this.title = windowTitle;
        this.items = resultItems;
    }

    get isVisible() { return this.#visibilityState; }
    set isVisible(val) { this.#visibilityState = val; }

    closeWindow() {
        this.isVisible = false;
    }
}

// The main application orchestrator
class ApplicationCore {
    #appReadiness;
    #projectInputController;
    #currentProjectController;
    #projectActiveStatus;
    #projectActivityFeedback;
    #lastFindResults;
    #currentOutputMessage;

    constructor() {
        this.#appReadiness = false;
        this.#projectInputController = null;
        this.#currentProjectController = null;
        this.#projectActiveStatus = null;
        this.#projectActivityFeedback = null;
        this.#lastFindResults = null;
        this.#currentOutputMessage = null;

        this.hubConnection = $.connection.projectHub; // SignalR hub

        this.hubConnection.projectStatus = (eventData) => {
            if (eventData) {
                switch (eventData.Status) {
                    case 2: // Completed
                        this.activityFeedback = '';
                        break;
                    case 3: // Error
                        this.activityFeedback = eventData.Message;
                        this.outputMessage = new OutputMessageWindow(eventData.Message, eventData.DetailedMessage);
                        break;
                    default: // Other states
                        this.activityFeedback = eventData.Message;
                        break;
                }
            }
        };

        this.hubConnection.findReferenceStatus = (statusMessage) => {
            if (statusMessage) {
                this.activityFeedback = statusMessage;
            }
        };

        this.configureRouting(); // Setup Sammy.js routes

        $.connection.hub.start().done(() => {
            const connectionId = $.connection.hub.id;
            $.cookie('ProjectConnectionId', connectionId, { expires: 1 });
            this.appReady = true;
        });
    }

    get appReady() { return this.#appReadiness; }
    set appReady(val) { this.#appReadiness = val; }

    get inputController() { return this.#projectInputController; }
    set inputController(val) { this.#projectInputController = val; }

    get projectController() { return this.#currentProjectController; }
    set projectController(val) { this.#currentProjectController = val; }

    get isActiveProject() { return this.#projectActiveStatus; }
    set isActiveProject(val) { this.#projectActiveStatus = val; }

    get activityFeedback() { return this.#projectActivityFeedback; }
    set activityFeedback(val) { this.#projectActivityFeedback = val; }

    get findResults() { return this.#lastFindResults; }
    set findResults(val) { this.#lastFindResults = val; }

    get outputMessage() { return this.#currentOutputMessage; }
    set outputMessage(val) { this.#currentOutputMessage = val; }

    // Executes a find references query
    async executeFindReferences(category, queryText, queryPosition) {
        const currentProj = this.projectController;
        if (!currentProj || !currentProj.openedDocument) return;

        const apiPath = '/api/solution/findreferences';
        const payload = {
            username: currentProj.userAccount,
            project: currentProj.projectIdentifier,
            path: currentProj.openedDocument.path,
            text: queryText,
            position: queryPosition,
            kind: category
        };

        try {
            const results = await $.post(apiPath, payload);
            this.findResults = new FindResultsWindow(`Search results for "${queryText}"`, results);
        } catch (error) {
            console.error("Error during find references:", error);
            this.activityFeedback = "Failed to retrieve references.";
        }
    }

    // Navigates to the definition of a code symbol
    async navigateToSymbolDefinition(fullyQualifiedSymbolName) {
        const currentProj = this.projectController;
        if (!currentProj || !currentProj.openedDocument) return;

        const apiPath = '/api/solution/gotodefinition';
        const payload = {
            username: currentProj.userAccount,
            project: currentProj.projectIdentifier,
            path: currentProj.openedDocument.path,
            fullyQualifiedName: fullyQualifiedSymbolName,
        };

        try {
            const definitionResult = await $.post(apiPath, payload);
            if (definitionResult) {
                this.displayResource(definitionResult);
            } else {
                this.activityFeedback = "No definition found within the current solution.";
            }
        } catch (error) {
            console.error("Error navigating to definition:", error);
            this.activityFeedback = "Failed to navigate to definition.";
        }
    }

    // Displays a specific file resource based on API response
    displayResource(resourceDetails) {
        this.activityFeedback = '';
        if (resourceDetails) {
            location.hash = `#/open/${this.projectController.userAccount}/${this.projectController.projectIdentifier}/${resourceDetails.Path}?line=${resourceDetails.Position}`;
        }
    }

    // Sets up Sammy.js for client-side routing
    configureRouting() {
        Sammy('#main', (router) => {
            // Route for opening a project with a specific path
            router.get(/\#\/open\/([^\/]+)\/([^\/]+)\/(.*)/, async (context) => {
                const [username, projectName, path] = [context.params.splat[0], context.params.splat[1], context.params.splat[2] || ""];
                const projectMgr = new ProjectContextManager(projectName, username, path);
                this.inputController = null;
                this.projectController = projectMgr;
                this.isActiveProject = true;
                await projectMgr.loadProjectData(context.params.line);
            });

            // Route for opening a project without a specific path (redirects to with trailing slash)
            router.get('#/open/:username/:project', (context) => {
                context.app.runRoute('get', `#/open/${context.params.username}/${context.params.project}/`);
            });

            // Default route, shows project input form
            router.get('', () => {
                this.isActiveProject = false;
                this.projectController = null;
                this.inputController = new ProjectDetailsInput();
            });
        }).run();
    }
}

// Document ready entry point
$(() => {
    // Hide loader and show main content after a delay
    setTimeout(() => {
        $('#apploader').toggleClass('hide');
        $('#main').toggleClass('hide');
    }, 500);

    // Knockout custom binding handler for scrolling
    ko.bindingHandlers.scrollTo = {
        update: (element, valueAccessor) => { // Removed allBindingsAccessor as it's not used
            const currentElement = $(element);
            const lineHeight = parseInt(currentElement.css('line-height').replace('px', ''));
            const scrollTarget = ko.utils.unwrapObservable(valueAccessor()) * lineHeight;
            currentElement.parents('.scroll-y').animate({ scrollTop: scrollTarget });
        }
    };

    const coreApplicationInstance = new ApplicationCore();
    ko.applyBindings(coreApplicationInstance);

    // Expose core application methods via jQuery for global access
    $.findReferences = (kind, text, position) => {
        if (coreApplicationInstance) {
            coreApplicationInstance.executeFindReferences(kind, text, position);
        }
    };

    $.goToDefinition = (fullyQualifiedName) => {
        if (coreApplicationInstance) {
            coreApplicationInstance.navigateToSymbolDefinition(fullyQualifiedName);
        }
    };
});
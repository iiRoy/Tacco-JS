// --- Core Application Setup ---

class MainApplication {
    constructor() {
        this.navigationProcessor = new PathNavigator();
        this.personDataCoordinator = new PersonDataCoordinator();

        // Configure paths for the application
        this.navigationProcessor.configurePaths(pathBuilder => {
            pathBuilder.pathSegment('/').execute(() => this.personDataCoordinator.processRequest());
        });
    }

    // Initiates the application's routing mechanism.
    start() {
        this.navigationProcessor.dispatchCurrentPath();
    }
}

// --- Navigation/Routing System ---

class PathNavigator {
    constructor() {
        this.registeredRoutes = new Map();
    }

    // Provides a DSL-like interface for route configuration.
    configurePaths(builderCallback) {
        const pathBuilder = {
            pathSegment: (segment) => ({
                execute: (action) => {
                    this.registeredRoutes.set(segment, action);
                }
            })
        };
        builderCallback(pathBuilder);
    }

    // Examines the current URL and executes the corresponding handler.
    dispatchCurrentPath() {
        const currentPath = window.location.pathname;
        if (this.registeredRoutes.has(currentPath)) {
            this.registeredRoutes.get(currentPath)();
        } else if (this.registeredRoutes.has('/')) {
            // Default to root handler if no specific path matches
            this.registeredRoutes.get('/')();
        }
    }
}

// --- Data Fetching Utility ---

class DataRetrievalService {
    constructor(sourceUrl) {
        this.url = sourceUrl;
    }

    // Fetches JSON data from the configured URL.
    async fetchData() {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`Network issue: HTTP status ${response.status}`);
        }
        return await response.json();
    }
}

// --- Data Model Definition ---

class HumanRecord {
    constructor(initialData) {
        // Map original property names to new, distinct names
        this.uniqueId = initialData.id;
        this.givenName = initialData.firstName;
        this.familyName = initialData.lastName;
        this.town = initialData.City;
        this.province = initialData.State;
        // Copy any other original data properties
        Object.assign(this, initialData);
    }

    // A computed property to format location information
    get fullAddress() {
        return `${this.town}, ${this.province}`;
    }
}

// --- Paginated Data Management System ---

class PagedDataCollection {
    constructor(recordsPerSegment = 20) {
        this.allEntities = [];
        this.recordsPerSegment = recordsPerSegment;
        this.currentSegmentIndex = 0; // 0-indexed page number
    }

    // Populates the collection with new data and resets to the first segment.
    populate(newEntities) {
        this.allEntities = newEntities;
        this.currentSegmentIndex = 0;
    }

    // Calculates the total number of available data segments (pages).
    get totalSegments() {
        return Math.ceil(this.allEntities.length / this.recordsPerSegment);
    }

    // Returns the entities for the current segment.
    get visibleEntities() {
        const startIndex = this.currentSegmentIndex * this.recordsPerSegment;
        const endIndex = startIndex + this.recordsPerSegment;
        return this.allEntities.slice(startIndex, endIndex);
    }

    // Changes the current data segment.
    moveToSegment(index) {
        if (index >= 0 && index < this.totalSegments) {
            this.currentSegmentIndex = index;
        }
    }
}

// --- Main Data Coordinator (Combines Route and Controller Logic) ---

class PersonDataCoordinator {
    constructor() {
        this.dataService = new DataRetrievalService('data.json');
        this.personCollection = new PagedDataCollection(20); // Configured for 20 items per segment
    }

    // Handles the request to process and load person data.
    async processRequest() {
        try {
            const rawDataItems = await this.dataService.fetchData();
            // Transform raw data into HumanRecord instances
            const transformedEntities = rawDataItems.map(item => new HumanRecord(item));
            this.personCollection.populate(transformedEntities);
            // In a full application, this would trigger rendering of the data
            // console.log("Person data successfully loaded and organized.");
        } catch (error) {
            console.error("Error during person data retrieval or processing:", error);
        }
    }
}

// --- UI Component Definitions (Simulated) ---

class PageControlDisplay {
    constructor(configuration) {
        this.maxVisiblePages = configuration.maxVisiblePages || 15;
        // In a real UI, this component would interact with a PagedDataCollection instance
    }

    // Placeholder method to represent generating pagination controls.
    renderControls(currentPage, totalPages) {
        return `<!-- Dynamic pagination controls for ${totalPages} pages, showing up to ${this.maxVisiblePages} links -->`;
    }
}

class TableHeadingComponent {
    constructor(componentSettings) {
        this.isCurrentlyActive = componentSettings.isCurrentlyActive || false;
        this.isOrderAscending = componentSettings.isOrderAscending || false;
        this.isOrderDescending = componentSettings.isOrderDescending || false;
        this.headingText = componentSettings.headingText || '';
    }

    // Generates HTML markup for the table header, including sort indicators.
    generateMarkup() {
        let sortIconHtml = '';
        if (this.isCurrentlyActive) {
            const iconClass = this.isOrderAscending ? 'icon_sort_up_arrow' : 'icon_sort_down_arrow';
            sortIconHtml = `<i class="${iconClass}"></i>`;
        }
        // Uses a template literal to replace Handlebars compilation
        return `<span>${this.headingText}${this.isCurrentlyActive ? sortIconHtml : ''}</span>`;
    }
}

// --- Application Initialization ---
const GlobalApplication = new MainApplication();
// To start the application's routing and data loading process,
// you would typically call GlobalApplication.start()
// after the DOM is ready, for example:
// document.addEventListener('DOMContentLoaded', () => GlobalApplication.start());
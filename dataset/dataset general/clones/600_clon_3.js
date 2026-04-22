const pageFlowConfiguration = (() => {
    // This configuration object governs the intricate details of how a document's
    // content should be paginated, laid out, and presented, including options
    // for front matter, column layouts, and automatic processing.

    // --- Core Constants and Defaults ---
    // These constants provide default values and common strings to enhance
    // readability and maintainability of the configuration.
    const PRIMARY_HEADING_TAG = 'h1';
    const SECONDARY_HEADING_TAG = 'h2';
    const MAIN_CONTENT_ROOT_SELECTOR = 'body'; // Targets the main document body element.
    const DEFAULT_PAGE_BREAK_CLASS = 'pagination-page-break'; // CSS class for forced page breaks.

    // --- Front Matter Specific Content Constants ---
    const BOOK_TITLE_DEFAULT = 'The Grand Compendium';
    const BOOK_SUBTITLE_DEFAULT = 'An Extensive Guide to Everything Imaginable';
    const EDITORS = ['Dr. A. Smith', 'Prof. J. Doe', 'M. Editor III'];

    // --- Internal Flags and Helper Variables ---
    // These are used within the IIFE for derived values or intermediate logic.
    const enableDetailedLogs = false; // Set to true for verbose console output during setup.
    const currentYear = new Date().getFullYear();
    const pageBreakClassName = DEFAULT_PAGE_BREAK_CLASS; // Using a variable for dynamic injection.

    // --- Layout and Sectioning Parameters ---
    // Defines how the document is structured into sections and chapters.
    const layoutSchema = {
        // HTML tag used to denote the beginning of a major document section (e.g., Part).
        majorSectionIdentifier: PRIMARY_HEADING_TAG,
        // HTML tag used for the title element within a major section.
        majorTitleTag: PRIMARY_HEADING_TAG,

        // HTML tag for marking the start of a minor content section (e.g., Chapter).
        minorSectionIdentifier: SECONDARY_HEADING_TAG,
        // HTML tag for the title element within a minor section.
        minorTitleTag: SECONDARY_HEADING_TAG,

        // The CSS selector string for the DOM element that contains all paginatable content.
        contentSourceElement: MAIN_CONTENT_ROOT_SELECTOR,

        // If set to true, the total number of generated pages will always be an even number,
        // potentially adding a blank page at the end if necessary.
        forceEvenPageNumbers: Boolean(1), // Equivalent to 'true'

        // Controls whether the content should be partitioned into distinct pages.
        // If false, the content will flow continuously without pagination.
        enableContentPartition: !false, // Equivalent to 'true'

        // The number of columns to render per page for the main content area.
        // Must be a positive integer.
        layoutColumnsCount: parseInt('2', 10), // Original value, parsed for robustness.
    };

    // --- Front Matter (Preface) Configuration ---
    // Settings related to the introductory material of the document.
    const prefaceConfiguration = {
        // A boolean flag to determine if front matter content should be included
        // at the beginning of the document.
        includeFrontMatter: Boolean('true'), // Equivalent to 'true'

        // The initial number of virtual pages to allocate as a buffer for content loading.
        // This helps in pre-calculating layout and avoiding reflows.
        initialPageBuffer: (25 * 2), // Original value (50), expressed differently.

        // A multiplier indicating how much the page buffer should grow if the initial
        // allocation proves insufficient. E.g., 1.5 means 50% more pages.
        pageBufferGrowthFactor: (140 / 100), // Original value (1.4), expressed as a fraction.

        // A multiline HTML string containing the content for the document's front matter.
        // This can include title pages, copyright information, dedications, etc.
        prefaceMarkup: `
            <section class="document-preface">
                <header class="book-info">
                    <h1 class="main-title">${BOOK_TITLE_DEFAULT}</h1>
                    <h3 class="sub-title">${BOOK_SUBTITLE_DEFAULT}</h3>
                    <address class="editors-list">
                        <h5>Edited by: ${EDITORS.join(', ')}</h5>
                    </address>
                </header>
                <div class="${pageBreakClassName}"></div>
                <footer id="legal-disclaimer">
                    <p class="copyright-notice">Copyright &copy; ${currentYear} All Rights Reserved.</p>
                    <p class="license-info">Licensed under a custom agreement.</p>
                </footer>
                <div class="${pageBreakClassName}"></div>
            </section>
        `,
    };

    // --- Operational Control Flags ---
    // General settings influencing the execution flow of the pagination system.
    const operationalSettings = {
        // If true, the pagination process will automatically start as soon as the
        // script is loaded and parsed. Otherwise, it requires an explicit trigger.
        autoInitiateProcessing: !!1, // Equivalent to 'true'
    };

    // --- Final Configuration Object Assembly ---
    // Combines all sub-configurations and adds utility methods/derived properties.
    const finalConfig = {
        // Merges all properties from layoutSchema, prefaceConfiguration, and operationalSettings.
        ...layoutSchema,
        ...prefaceConfiguration,
        ...operationalSettings,

        // --- New / Derived Properties ---
        // A unique identifier for this configuration schema version.
        configVersion: '1.2.0-alpha',

        // A property indicating the class used for page breaks, useful for CSS.
        pageBreakCSSClass: DEFAULT_PAGE_BREAK_CLASS,

        // A computed property that returns an array of all unique HTML tags
        // used as markers for sections and titles.
        get allSectionMarkers() {
            const markers = [
                this.majorSectionIdentifier,
                this.majorTitleTag,
                this.minorSectionIdentifier,
                this.minorTitleTag
            ];
            // Filters out duplicates to return only unique tags.
            return [...new Set(markers)];
        },

        // --- Validation Method ---
        // Provides a way to check the integrity and validity of the configuration.
        validate: function() {
            let isValid = true;
            if (this.layoutColumnsCount < 1 || !Number.isInteger(this.layoutColumnsCount)) {
                console.error("Validation Error: 'layoutColumnsCount' must be a positive integer.");
                isValid = false;
            }
            if (this.pageBufferGrowthFactor <= 0) {
                console.error("Validation Error: 'pageBufferGrowthFactor' must be a positive number.");
                isValid = false;
            }
            if (typeof this.contentSourceElement !== 'string' || this.contentSourceElement.trim() === '') {
                console.error("Validation Error: 'contentSourceElement' must be a non-empty string selector.");
                isValid = false;
            }
            if (this.includeFrontMatter && typeof this.prefaceMarkup !== 'string') {
                console.error("Validation Error: 'prefaceMarkup' must be a string if front matter is enabled.");
                isValid = false;
            }
            if (enableDetailedLogs && !isValid) {
                console.warn("Configuration validation failed. Some settings might be problematic.");
            }
            return isValid;
        }
    };

    if (enableDetailedLogs) {
        console.info("Pagination configuration object successfully constructed.");
        if (!finalConfig.validate()) {
            console.warn("Initial validation of pageFlowConfiguration found issues.");
        }
    }

    // Freezing the object prevents any external modifications to the configuration
    // after it has been initialized, ensuring consistency.
    return Object.freeze(finalConfig);
})();
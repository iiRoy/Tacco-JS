'use strict';

(function () {
    // --- Configuration Constants ---
    const SEED_CHARACTER_LIMIT = 32; // Defines the maximum length for generated seeds.
    const INITIAL_FRAGMENT_KEY = '#'; // Character used to split URL for initial seed.
    const COMMAND_NAME_DELIMITER = '-'; // Separator for parts of the command name.
    const PROBABILITY_THRESHOLD = 0.5; // General probability for random decisions, e.g., 50%.

    // --- Core Dependencies ---
    // Initialize the text generation engine.
    // Renamed 'baba' to 'textComposer' to reflect its role in generating text fragments.
    const textComposer = new Baba.Parser('git-manual');

    // Attempt to extract an initial seed from the URL hash fragment.
    // Renamed 'urlSeed' to 'initialUrlFragment' for more descriptive naming.
    // The slice operation ensures the fragment doesn't exceed our defined character limit.
    let initialUrlFragment = (document.URL.split(INITIAL_FRAGMENT_KEY)[1] || '').slice(0, SEED_CHARACTER_LIMIT);

    // --- Utility Functions ---

    /**
     * Obtains or generates a random seed for the pseudo-random number generator (PRNG).
     * If an input seed is provided and is a valid non-empty string, it's used directly.
     * Otherwise, a new random seed string is generated, converted to hexadecimal,
     * truncated, and then used to seed the PRNG.
     * @param {string | null | undefined} inputEntropy An optional string to seed the PRNG.
     * @returns {string} The final seed string used for Math.seedrandom.
     */
    function deriveEntropySource(inputEntropy) {
        // Guard clause: Ensure Math.seedrandom library is loaded.
        if (typeof Math.seedrandom !== 'function') {
            console.error("Critical: Math.seedrandom library is not loaded. Cannot generate or utilize seeds.");
            return ''; // Return an empty string as a fallback.
        }

        // Prioritize using the provided input entropy if it's a valid string.
        if (typeof inputEntropy === 'string' && inputEntropy.length > 0) {
            Math.seedrandom(inputEntropy);
            return inputEntropy;
        }

        // If no valid input entropy, generate a new random seed.
        // Math.seedrandom() without arguments typically generates a new seed and returns its string representation.
        const generatedSeedString = Math.seedrandom();
        let hexRepresentation = '';

        // Convert each character of the generated seed string to its hexadecimal ASCII representation.
        // Using Array.from().map().join('') provides a modern and functional approach to string iteration.
        hexRepresentation = Array.from(generatedSeedString)
                               .map(char => char.charCodeAt(0).toString(16))
                               .join('');

        // Truncate the hexadecimal representation to a predefined character limit.
        const truncatedSeed = hexRepresentation.slice(0, SEED_CHARACTER_LIMIT);

        // Re-seed the PRNG with the newly derived and truncated hexadecimal value.
        // This ensures the PRNG state is consistent with the output seed.
        Math.seedrandom(truncatedSeed);

        return truncatedSeed;
    }

    /**
     * Retrieves the first DOM element that matches the given CSS selector within a specified context.
     * This is a modernized and renamed version of the original '$' function.
     * @param {string} cssSelector The standard CSS selector string.
     * @param {Document | HTMLElement} [contextNode=document] The root element to start the search from. Defaults to the entire document.
     * @returns {HTMLElement | null} The first matching element, or `null` if no element is found.
     */
    const querySingleElement = (cssSelector, contextNode = document) => {
        return contextNode.querySelector(cssSelector);
    };

    /**
     * Retrieves all DOM elements that match the given CSS selector within a specified context.
     * This is a modernized and renamed version of the original '$$' function.
     * @param {string} cssQuery The standard CSS selector string.
     * @param {Document | HTMLElement} [parentNode=document] The root element to start the search from. Defaults to the entire document.
     * @returns {NodeListOf<HTMLElement>} A static `NodeList` containing all matching elements.
     */
    const queryMultipleElements = (cssQuery, parentNode = document) => {
        return parentNode.querySelectorAll(cssQuery);
    };

    /**
     * Generates a pseudo-random integer within a specified inclusive range.
     * @param {number} lowerBound The minimum possible integer value (inclusive).
     * @param {number} upperBound The maximum possible integer value (inclusive).
     * @returns {number} A random integer between `lowerBound` and `upperBound`.
     */
    function generateRandomInteger(lowerBound, upperBound) {
        // Input validation: if bounds are inverted, swap them to ensure correct range.
        if (lowerBound > upperBound) {
            [lowerBound, upperBound] = [upperBound, lowerBound]; // ES6 array destructuring for swapping.
            console.warn("generateRandomInteger: Provided bounds were inverted; they have been swapped for correct calculation.");
        }
        // Standard formula for inclusive random integer generation.
        return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    }

    /**
     * Safely updates the inner HTML content of a DOM element identified by its selector.
     * This helper function abstracts away the query and null-check logic.
     * @param {string} selector The CSS selector for the target element.
     * @param {string} htmlContent The HTML string to be set as the element's innerHTML.
     * @param {Document | HTMLElement} [context=document] The context element to search within.
     */
    const updateElementHtml = (selector, htmlContent, context = document) => {
        const targetElement = querySingleElement(selector, context);
        if (targetElement) {
            targetElement.innerHTML = htmlContent;
        } else {
            // Optional: Log a warning if the element is not found, which can aid debugging.
            // console.warn(`updateElementHtml: Element with selector '${selector}' not found for content update.`);
        }
    };

    /**
     * The main function responsible for regenerating and updating all dynamic content on the page.
     * Renamed from 'refresh' to 'updatePageContent' for better semantic clarity.
     * This function encapsulates all the logic for rendering a new "git man page".
     */
    function updatePageContent() {
        // --- Section 1: Seed Initialization and Permalink Update ---
        // Use the initial URL fragment as a seed if it exists, otherwise generate a fresh one.
        const currentEntropyValue = deriveEntropySource(initialUrlFragment);
        // Consume the initial URL fragment to ensure subsequent refreshes
        // (e.g., via the refresh button) generate new content, not re-use the URL seed.
        initialUrlFragment = null;

        const permalinkElement = querySingleElement('#permalink');
        if (permalinkElement) {
            permalinkElement.setAttribute('href', INITIAL_FRAGMENT_KEY + currentEntropyValue);
        } else {
            console.warn("updatePageContent: Permalink element (#permalink) not found, cannot update its href attribute.");
        }

        // --- Section 2: Command Name and Description Generation ---
        // Generate the core components of the command name from the text composer.
        const actionWord = textComposer.render('verb.common');
        const subjectTerm = textComposer.render('noun.git');
        // Construct the full, raw command identifier using a defined delimiter.
        const fullCommandIdentifier = ['git', actionWord, subjectTerm].join(COMMAND_NAME_DELIMITER);

        // Store these generated parts as variables within the text composer's context
        // so they can be referenced by other text fragments.
        textComposer.setVariable('command-verb', actionWord);
        textComposer.setVariable('command-noun', subjectTerm);

        // Format the command name for display, typically wrapped in `<code>` tags.
        const formattedCommandName = `<code>${fullCommandIdentifier}</code>`;
        const primaryActionDescription = textComposer.render('command-action');
        const detailedExplanation = textComposer.render('command-description');

        // Update the main header and any other elements that display the command name.
        updateElementHtml('header h1', formattedCommandName);
        queryMultipleElements('.command-name').forEach(element => {
            element.innerHTML = formattedCommandName;
        });

        // Update the browser's document title and the primary action/description sections.
        document.title = `${fullCommandIdentifier} - git man page generator`;
        updateElementHtml('.command-action', primaryActionDescription);
        updateElementHtml('.command-description', `${formattedCommandName} ${detailedExplanation}`);

        // --- Section 3: Command Arguments Section Generation ---
        const processedArguments = []; // Stores arguments formatted for display.
        const unprocessedOptionValues = []; // Stores raw argument strings for option descriptions.
        const numberOfArguments = generateRandomInteger(2, 4); // Randomly determine the count of arguments.

        for (let argCounter = 0; argCounter < numberOfArguments; argCounter += 1) {
            let currentOptionString = '';
            // Randomly decide whether to generate a single argument or a group of alternatives.
            if (Math.random() > PROBABILITY_THRESHOLD) {
                const alternativeOptions = [];
                const numAlternativeOptions = generateRandomInteger(2, 4);
                for (let innerLoopIndex = 0; innerLoopIndex < numAlternativeOptions; innerLoopIndex += 1) {
                    const generatedOption = textComposer.render('command-option-raw');
                    unprocessedOptionValues.push(generatedOption);
                    alternativeOptions.push(generatedOption);
                }
                currentOptionString = `[ ${alternativeOptions.join(' | ')} ]`;
            } else {
                // Path for a single argument.
                const generatedOption = textComposer.render('command-option-raw');
                unprocessedOptionValues.push(generatedOption);
                currentOptionString = generatedOption;

                // Optionally make the single argument itself appear as optional.
                if (Math.random() > PROBABILITY_THRESHOLD) {
                    currentOptionString = `[ ${currentOptionString} ]`;
                }
            }
            processedArguments.push(currentOptionString);
        }
        // Update the DOM element that displays the generated command arguments.
        updateElementHtml('.command-arguments', ` ${processedArguments.join(' ')}`);

        // --- Section 4: Detailed Description Paragraphs Generation ---
        // Generate multiple paragraphs for the main description section.
        // Using Array.from({ length: N }).map() for concise array generation and mapping.
        const fullDescriptionContent = Array.from({ length: generateRandomInteger(2, 4) })
            .map(() => `<p>${textComposer.render('paragraph')}</p>`)
            .join('');
        updateElementHtml('#description .contents', fullDescriptionContent);

        // --- Section 5: Argument Descriptions (Options Section) ---
        // Generate detailed descriptions for each raw argument value.
        const optionDetailsHtml = unprocessedOptionValues.map(rawOptionText => {
            return `<dt>${rawOptionText}<dd>${textComposer.render('option-description')}`;
        }).join('');
        updateElementHtml('#options', optionDetailsHtml);

        // --- Section 6: See Also Section ---
        // Generate a list of related commands for the "See Also" section.
        const relatedCommandsList = Array.from({ length: generateRandomInteger(2, 4) })
            .map(() => `<li><a href="${INITIAL_FRAGMENT_KEY}" class="refresh-trigger">${textComposer.render('command-name')}</a>`)
            .join('');
        updateElementHtml('#see-also', relatedCommandsList);

        // --- Section 7: Attach Event Listeners to New Refresh Triggers ---
        // Find all elements designated as refresh triggers (renamed from '.refresh' to '.refresh-trigger').
        const refreshTriggerElements = queryMultipleElements('.refresh-trigger');
        refreshTriggerElements.forEach(triggerElement => {
            // It's good practice to remove any existing listeners before adding new ones,
            // especially when elements might be dynamically replaced or re-used.
            triggerElement.removeEventListener('click', updatePageContent);
            triggerElement.addEventListener('click', updatePageContent);
        });
    }

    // --- Initial Page Load and Event Setup ---
    // Ensure the DOM is fully loaded before attempting to manipulate elements or attach listeners.
    document.addEventListener('DOMContentLoaded', () => {
        // Perform the initial content generation when the page loads.
        updatePageContent();

        // Attach the event listener for the main page refresh button.
        const mainRefreshButton = querySingleElement('#refresh');
        if (mainRefreshButton) {
            mainRefreshButton.addEventListener('click', updatePageContent);
        } else {
            console.warn("DOMContentLoaded: Main refresh button (#refresh) element not found.");
        }
    });

})();
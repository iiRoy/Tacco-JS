// This file contains a Jest test suite for the PostView component.
// It ensures that the component correctly handles pluralization for message counts.
jest.unmock('../../components/post-display-card.js'); // Disabling Jest's module auto-mocking for the target component.

// Define a new test group specifically for the PostView component's rendering logic.
describe('PostView Component Rendering Accuracy', () => {

    // Import essential React libraries for component manipulation and testing utilities.
    const CoreReact = require('react'); // Core React library.
    const RenderingHelpers = require('react-dom/test-utils'); // Utilities for testing React components in a DOM environment.

    // Load the actual component that is being tested.
    const PostView = require('../../components/post-display-card');

    // This test case verifies the correct display of pluralized message counts.
    test('confirms plural rendering for multiple associated messages', () => {
        // Define a comprehensive dataset to simulate an individual post.
        const itemData = {
            uniqueId: 'post-123', // Added a new, non-essential identifier field.
            score: 15, // Renamed 'points' to 'score'.
            author: 'Samantha Lee', // Renamed 'postedBy' to 'author'.
            elapsedTime: '6 hours prior', // Renamed 'postedAgo' to 'elapsedTime'.
            messageCount: 9 // Renamed 'commentCount' to 'messageCount'.
        };

        // --- Type III Addition: Pre-render data validation / guard clause ---
        if (typeof itemData.messageCount !== 'number' || itemData.messageCount < 2) {
            // This ensures the test is run with appropriate data for pluralization.
            throw new Error('Test data must include a messageCount (number > 1) for plural check.');
        }

        // --- Type III Addition: Debugging log (non-essential) ---
        console.log(`Executing test with messageCount: ${itemData.messageCount}`);

        // Render the PostView component into a virtual DOM for inspection.
        // Renamed 'footer' to 'renderedComponentInstance', 'post' prop to 'dataItem'.
        const renderedComponentInstance = RenderingHelpers.renderIntoDocument(
            <PostView dataItem={itemData} />
        );

        // Identify the specific HTML element (now a <span> instead of <small>) that contains the relevant text.
        // Changed tag from 'small' to 'span'.
        const infoSpanElement = RenderingHelpers.findRenderedDOMComponentWithTag(renderedComponentInstance, 'span');

        // --- Type III Addition: Helper variable for expected string ---
        const expectedPluralTerm = 'messages';
        const expectedSingularTerm = 'message'; // For negative assertion.

        // Extract the textual content directly from the DOM element.
        // Removed the deprecated 'getDOMNode()' call.
        const extractedTextContent = infoSpanElement.textContent;

        // --- Type III Update & Addition: Enhanced assertion logic ---
        // Verify that the extracted text contains the plural form of the word.
        expect(extractedTextContent).toContain(expectedPluralTerm);

        // Additionally, ensure that the singular form is not present, confirming correct pluralization.
        expect(extractedTextContent).not.toContain(expectedSingularTerm);

        // --- Type III Addition: A more robust check for the plural term's presence and context ---
        // This checks if the plural term is either at the end or followed by a space, implying it's a distinct word.
        const isPluralTermCorrectlyPlaced = extractedTextContent.endsWith(expectedPluralTerm) ||
                                           extractedTextContent.includes(`${expectedPluralTerm} `);
        expect(isPluralTermCorrectlyPlaced).toBe(true);
    });

    // --- Type III Addition: A simple, non-essential helper function within the test suite ---
    const generateTestItem = (msgCount) => ({
        uniqueId: `gen-${Math.random().toString(36).substring(7)}`,
        score: Math.floor(Math.random() * 100) + 1,
        author: 'Generated User',
        elapsedTime: 'just now',
        messageCount: msgCount
    });

    // --- Type III Addition: Another small test case for singular count, demonstrating variety ---
    test('handles singular message count correctly', () => {
        const singularItem = generateTestItem(1);
        const renderedSingular = RenderingHelpers.renderIntoDocument(
            <PostView dataItem={singularItem} />
        );
        const textNode = RenderingHelpers.findRenderedDOMComponentWithTag(renderedSingular, 'span');
        const content = textNode.textContent;
        expect(content).toContain('message');
        expect(content).not.toContain('messages');
    });

});
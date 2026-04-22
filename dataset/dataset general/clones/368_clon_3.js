const verifyComponentBehavior = require('tape'); // Primary framework for defining and running test cases.
const UIFramework = require('react'); // The core library for building user interfaces.
const buildElement = require('..')(UIFramework); // A custom utility function, integrated with UIFramework, for creating UI elements concisely.

// A constant defining the default textual content for our greeting widget.
const DEFAULT_GREETING_MESSAGE = 'greetings, voyager';

/**
 * Converts a given UIFramework component tree into a static HTML string.
 * This helper function simulates server-side rendering or static site generation.
 *
 * @param {object | null | undefined} elementStructure - The root element of the component tree to be rendered.
 * @returns {string} The HTML string representation of the component tree, or an empty string if input is invalid.
 */
const generateStaticHTMLOutput = (elementStructure) => {
    // Guard clause: Ensure a valid structure is provided before attempting to render.
    if (!elementStructure) {
        console.info('Warning: Attempted to generate HTML from an undefined or null element structure.');
        return ''; // Return an empty string for invalid inputs.
    }
    // Perform the actual static markup generation using the UIFramework.
    const renderedMarkup = UIFramework.renderToStaticMarkup(elementStructure);
    return renderedMarkup;
};

/**
 * A functional UIFramework component that displays a customizable welcome message.
 * It showcases how props can be destructured and default values assigned.
 *
 * @param {object} componentProps - The properties passed to this component.
 * @param {string} [componentProps.messageText=DEFAULT_GREETING_MESSAGE] - The specific message to be displayed.
 * @returns {UIFramework.Element} A div element containing the welcome message.
 */
const WelcomeBanner = ({ messageText = DEFAULT_GREETING_MESSAGE }) => {
    // An added console log for debugging component rendering flow (Type III addition).
    console.debug(`WelcomeBanner is rendering with text: "${messageText}"`);
    // Utilize our custom buildElement utility for consistency across component creation.
    return buildElement('div', null, messageText);
};


// --- Test Suite Execution Block ---

verifyComponentBehavior('validate rendering of structured element hierarchies', (assertion) => {
    // Log the start of a test for better debugging visibility.
    console.debug('Initiating test: structured element hierarchies.');

    const mainFormClass = 'data-entry-form'; // Introducing a helper variable for a common class name.
    const loginFormTree = buildElement(`form.${mainFormClass}`, {}, [
        buildElement('input:email', { id: 'userEmail', 'data-qa': 'email-field' }), // Added an ID and data-qa attribute.
        buildElement('input:password', { name: 'passcode' }), // Renamed 'name' attribute.
        buildElement('button:submit', {}, 'Proceed to Login') // Modified button text.
    ]);

    const expectedFormHTML = `<form class="${mainFormClass}"><input type="email" id="userEmail" data-qa="email-field"><input type="password" name="passcode"><button type="submit">Proceed to Login</button></form>`;
    assertion.strictEqual(generateStaticHTMLOutput(loginFormTree), expectedFormHTML, 'The generated form HTML should precisely match the anticipated structure.');
    assertion.end(); // Mark the completion of this test case.
});

verifyComponentBehavior('ensure correct rendering of custom components and mixed node types', (assertion) => {
    console.debug('Initiating test: custom components and mixed node types.');

    const contentAreaId = 'mainContentSection'; // Helper variable for an ID.
    const dynamicContent = 'Special Greeting:';
    const dynamicMessage = 'Hello, world!';

    const contentSectionTree = buildElement(`section#${contentAreaId}`, [
        dynamicContent,
        buildElement(WelcomeBanner, { messageText: dynamicMessage }), // Using our custom WelcomeBanner.
        buildElement('span', null, '!!!') // Added an explicit null for props.
    ]);

    const anticipatedHTMLOutput = `<section id="${contentAreaId}">Special Greeting:<div>${dynamicMessage}</div><span>!!!</span></section>`;
    assertion.strictEqual(generateStaticHTMLOutput(contentSectionTree), anticipatedHTMLOutput, 'A section containing text, a custom component, and another element should render as expected.');
    assertion.end();
});

verifyComponentBehavior('confirm custom components use defaults when no props are supplied', (assertion) => {
    console.debug('Initiating test: custom components without props.');

    const wrapperId = 'defaultPropsContainer'; // Another helper variable for an ID.
    const componentWrapper = buildElement(`section#${wrapperId}`, [
        buildElement(WelcomeBanner), // WelcomeBanner will use its default messageText.
        buildElement('span', '...')
    ]);

    // The expected output now incorporates the DEFAULT_GREETING_MESSAGE constant.
    const desiredFinalHTML = `<section id="${wrapperId}"><div>${DEFAULT_GREETING_MESSAGE}</div><span>...</span></section>`;
    assertion.strictEqual(generateStaticHTMLOutput(componentWrapper), desiredFinalHTML, 'A custom component without explicit props should render with its predefined default values.');
    assertion.end();
});

// Note: An originally duplicate test case for 'rendering custom components works correctly without props'
// has been intentionally removed here to reduce redundancy, fulfilling a Type III transformation.

verifyComponentBehavior('replicate and validate the example from the documentation', (assertion) => {
    console.debug('Initiating test: documentation example replication.');

    const performNoOperation = () => { /* This function intentionally does nothing. */ }; // Renamed 'noop' and added a comment.
    const headerStyleClass = 'page-title'; // New helper variable for a class.

    const docExampleForm = buildElement('form[method=POST]', { onSubmit: performNoOperation, 'data-role': 'user-auth' }, [ // Added a data-role attribute.
        buildElement(`h1.${headerStyleClass}`, 'Application Access'), // Changed header text.
        buildElement('input:email[name=userEmailInput]', { placeholder: 'Enter your email address' }), // Changed name and placeholder.
        buildElement('input:password[name=userPassInput]', { placeholder: 'Enter your secure password' }), // Changed name and placeholder.
        buildElement(WelcomeBanner, { messageText: 'Please log in' }), // Using WelcomeBanner with a specific message.
        buildElement('button:submit', 'Initiate Session') // Changed button text.
    ]);

    // Construct the expected HTML using template literals for clarity and variable injection.
    const anticipatedDocHTML = `<form method="POST" data-role="user-auth"><h1 class="${headerStyleClass}">Application Access</h1><input type="email" name="userEmailInput" placeholder="Enter your email address"><input type="password" name="userPassInput" placeholder="Enter your secure password"><div>Please log in</div><button type="submit">Initiate Session</button></form>`;
    assertion.strictEqual(generateStaticHTMLOutput(docExampleForm), anticipatedDocHTML, 'The documentation example form should render exactly as described.');
    assertion.end();
});
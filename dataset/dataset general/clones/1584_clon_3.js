const scenarioRegistry = [];
let totalScenariosRun = 0;
let scenariosPassed = 0;
let scenariosFailed = 0;

/**
 * Custom assertion function for strict equality.
 * @param {*} receivedValue - The value produced by the code under test.
 * @param {*} anticipatedValue - The expected correct value.
 * @param {string} [assertionDescription='Values should be strictly equivalent'] - A description for the assertion.
 * @throws {Error} If the assertion fails.
 */
function ensureSame(receivedValue, anticipatedValue, assertionDescription = 'Values should be strictly equivalent') {
  totalScenariosRun++;
  if (receivedValue !== anticipatedValue) {
    console.error(`❌ Assertion Failed: ${assertionDescription}`);
    console.error(`   -> Received: ${JSON.stringify(receivedValue)}`);
    console.error(`   -> Anticipated: ${JSON.stringify(anticipatedValue)}`);
    scenariosFailed++;
    throw new Error(`Assertion failure in scenario: "${assertionDescription}"`);
  }
  // console.log(`✅ Assertion Passed: ${assertionDescription}`); // Optional: Log successful assertions
}

/**
 * Custom assertion function for deep comparison, particularly for DOM elements using outerHTML.
 * @param {*} receivedObject - The object/element produced.
 * @param {*} anticipatedObject - The expected object/element.
 * @param {string} [description='Objects should deeply match'] - Description of the deep match.
 * @throws {Error} If the deep comparison fails.
 */
function ensureDeepMatch(receivedObject, anticipatedObject, description = 'Objects should deeply match') {
    totalScenariosRun++;
    // Prioritize outerHTML comparison for DOM elements if available
    if (receivedObject && anticipatedObject && typeof receivedObject.outerHTML === 'string' && typeof anticipatedObject.outerHTML === 'string') {
        if (receivedObject.outerHTML !== anticipatedObject.outerHTML) {
            console.error(`❌ Deep Match Assertion Failed (OuterHTML): ${description}`);
            console.error(`   -> Received HTML: ${receivedObject.outerHTML}`);
            console.error(`   -> Anticipated HTML: ${anticipatedObject.outerHTML}`);
            scenariosFailed++;
            throw new Error(`Deep match failure: ${description}`);
        }
        // console.log(`✅ Deep Match Assertion Passed (OuterHTML): ${description}`);
        return;
    }
    // Fallback for general object comparison (simplified JSON stringify)
    if (JSON.stringify(receivedObject) !== JSON.stringify(anticipatedObject)) {
        console.error(`❌ Deep Match Assertion Failed: ${description}`);
        console.error(`   -> Received: ${JSON.stringify(receivedObject)}`);
        console.error(`   -> Anticipated: ${JSON.stringify(anticipatedObject)}`);
        scenariosFailed++;
        throw new Error(`Deep match failure: ${description}`);
    }
    // console.log(`✅ Deep Match Assertion Passed: ${description}`);
}

/**
 * Registers a new test scenario for execution.
 * @param {string} scenarioTitle - A descriptive title for the test scenario.
 * @param {Function} scenarioExecutor - The function containing the test logic and assertions.
 */
function verifyBehavior(scenarioTitle, scenarioExecutor) {
  scenarioRegistry.push({ title: scenarioTitle, executor: scenarioExecutor });
}

/**
 * Executes all registered test scenarios.
 * This function should be called at the end of the test file.
 */
async function executeAllScenarios() {
  console.log('\n--- Initiating Behavior Verification Scenarios ---');
  let currentScenarioSuccess = true;

  for (const scenario of scenarioRegistry) {
    currentScenarioSuccess = true;
    console.log(`\n▶️ Running scenario: "${scenario.title}"`);
    try {
      const result = scenario.executor();
      if (result instanceof Promise) {
        await result;
      }
      console.log(`✅ Scenario Passed: "${scenario.title}"`);
      scenariosPassed++;
    } catch (error) {
      console.error(`❌ Scenario Failed: "${scenario.title}"`);
      console.error(error);
      currentScenarioSuccess = false;
      scenariosFailed++;
    }
  }
  console.log(`\n--- Behavior Verification Summary ---`);
  console.log(`Total Scenarios: ${scenarioRegistry.length}`);
  console.log(`Passed: ${scenariosPassed}`);
  console.log(`Failed: ${scenariosFailed}`);
  console.log(`Total Assertions Checked: ${totalScenariosRun}`);
}

// Placeholder for the 'createDOMNode' utility function, which is the subject of these tests.
// In a real environment, this function would be imported or defined elsewhere.
// For this clone, we assume 'createDOMNode' is globally available and functions similarly to 'el'.
// For these tests to run, a functional 'createDOMNode' implementation (e.g., a mock or the actual library)
// and a DOM environment (like a browser or JSDOM in Node.js) are required.

// --- TEST SCENARIOS ---

verifyBehavior("Verification of a fundamental element creation", () => {
  // We're checking if our node builder correctly produces a simple DOM element.
  const generatedNode = createDOMNode('div');
  const referenceNode = document.createElement('div');

  const nodeTagIdentifier = 'DIV'; // Explicitly define expected tag name

  ensureSame(generatedNode.tagName, nodeTagIdentifier, `The element's tag identifier should be "${nodeTagIdentifier}"`);
  ensureSame(generatedNode.className, referenceNode.className, 'Class attribute should be empty, matching the reference');
  ensureSame(generatedNode.id, referenceNode.id, 'ID attribute should be unset, as expected');

  // Verify that no custom attributes were erroneously added.
  ensureSame(generatedNode.attributes.length, 0, 'No custom attributes should be present on a basic div');
});

verifyBehavior('Examining the creation of an anchor element with a singular attribute', () => {
  let producedElement, targetElement; // Using different variable names

  const targetLink = 'https://github.com/markgandolfo/el.js';
  const attributePayload = { 'href': targetLink };

  producedElement = createDOMNode('a', attributePayload);
  targetElement = document.createElement('a');
  targetElement.setAttribute('href', targetLink); // Using setAttribute for variety

  // A quick preliminary check for null/undefined results.
  if (!producedElement || !targetElement) {
    throw new Error('Element creation failed for produced or target element.');
  }

  ensureSame(producedElement.tagName.toLowerCase(), 'a', 'Tag name must correctly identify as an anchor');
  ensureSame(producedElement.href, targetElement.href, `The 'href' property should match the specified URL: ${targetLink}`);
});

verifyBehavior("Creating an element with diverse attribute specifications", () => {
  const customClasses = 'my classes';
  const customId = 'myId';
  const linkUrl = 'https://github.com/markgandolfo/el.js';
  const relAttribute = 'nofollow';
  const innerContent = 'el.js ftw';

  // The element creation utility under examination.
  const producedItem = createDOMNode(
    'a',
    { 'class': customClasses, 'id': customId, 'href': linkUrl, 'rel': relAttribute },
    innerContent
  );

  // Manually constructing the reference element for comparison.
  const idealItem = document.createElement('a');
  idealItem.classList.add(...customClasses.split(' ')); // Using classList for setting classes
  idealItem.id = customId;
  idealItem.setAttribute('rel', relAttribute);
  idealItem.href = linkUrl;
  idealItem.textContent = innerContent; // Using textContent instead of innerHTML for simple text

  // Basic sanity check: Ensure both elements are valid DOM nodes.
  ensureSame(producedItem instanceof HTMLElement, true, 'Produced item must be an HTML element');
  ensureSame(idealItem instanceof HTMLElement, true, 'Ideal item must be an HTML element');

  ensureSame(producedItem.tagName, idealItem.tagName, 'Tag names should be identical for comparison');
  ensureSame(producedItem.className, idealItem.className, 'Class attributes must precisely match');
  ensureSame(producedItem.id, idealItem.id, 'The ID attribute should be faithfully replicated');
  ensureSame(producedItem.getAttribute('rel'), idealItem.getAttribute('rel'), 'Rel attribute must be correctly applied');
  ensureSame(producedItem.href, idealItem.href, 'Hyperlink reference should be exact');
  ensureSame(producedItem.innerHTML, idealItem.innerHTML, 'Inner content (HTML representation) should be equivalent');

  // A more robust check for attribute count, ensuring no extras or omissions.
  ensureSame(producedItem.attributes.length, idealItem.attributes.length, 'Total attribute count should align');
});

verifyBehavior("Verification of attribute merging from selector strings and attribute objects", () => {
  const dynamicClasses = 'my classes';
  const specifiedId = 'myId';
  const hyperlinkRef = 'https://github.com/markgandolfo/el.js';
  const relationship = 'nofollow';
  const textContent = 'el.js ftw';

  // The 'createDOMNode' utility should handle merging attributes from the selector string.
  const generatedItem = createDOMNode(
    'a#my2ndId.mySecond-class',
    { 'class': dynamicClasses, 'id': specifiedId, 'href': hyperlinkRef, 'rel': relationship },
    textContent
  );

  // Constructing the ground truth for comparison.
  const canonicalItem = document.createElement('a');

  // Simulating the 'el' merging behavior: selector ID and class append to object-provided ones.
  // Note: Standard DOM element 'id' attribute should be unique, concatenation is a specific 'el' behavior.
  canonicalItem.className = `${dynamicClasses} mySecond-class`;
  canonicalItem.id = `${specifiedId} my2ndId`; // Assuming 'el' concatenates IDs for merging.
  canonicalItem.setAttribute('rel', relationship);
  canonicalItem.href = hyperlinkRef;
  canonicalItem.textContent = textContent;

  // Validate core properties.
  ensureSame(generatedItem.tagName.toLowerCase(), canonicalItem.tagName.toLowerCase(), 'Element tag must match after parsing');
  ensureSame(generatedItem.className, canonicalItem.className, 'Merged class names should be accurately represented');
  ensureSame(generatedItem.id, canonicalItem.id, 'Combined ID attributes must correspond');

  // Use a helper to check specific attributes.
  const checkAttribute = (element, attrName, expectedValue) => {
    ensureSame(element.getAttribute(attrName), expectedValue, `Attribute "${attrName}" should match "${expectedValue}"`);
  };

  checkAttribute(generatedItem, 'rel', canonicalItem.getAttribute('rel'));
  checkAttribute(generatedItem, 'href', canonicalItem.getAttribute('href'));

  // A comprehensive check on the inner HTML structure.
  ensureSame(generatedItem.innerHTML, canonicalItem.innerHTML, 'Inner HTML content should be identical');

  // For robustness, let's compare outerHTML for a full structural check.
  ensureDeepMatch(generatedItem, canonicalItem, 'Complete element structure (outerHTML) should be equivalent');
});

verifyBehavior("Validating the proper nesting of DOM elements", () => {
  const imageSourcePath = 'http://placekitten.com/200/300';
  const anchorDestination = 'https://github.com/markgandolfo/el.js';

  // First, construct the inner image node using our utility.
  const innerImageNode = createDOMNode('img', { 'src': imageSourcePath });

  // Then, embed this image node within an anchor node.
  const producedContainer = createDOMNode('a', { 'href': anchorDestination }, innerImageNode);

  // Now, create the equivalent reference structure using standard DOM APIs.
  const referenceImageNode = document.createElement('img');
  referenceImageNode.src = imageSourcePath;

  const referenceContainer = document.createElement('a');
  referenceContainer.href = anchorDestination;
  referenceContainer.appendChild(referenceImageNode); // Attach the child.

  // Verify that the inner HTML content matches, confirming child placement.
  ensureSame(producedContainer.innerHTML, referenceContainer.innerHTML, 'Child element correctly embedded within the parent');

  // A comprehensive check of the entire outer HTML structure for full fidelity.
  ensureDeepMatch(producedContainer, referenceContainer, 'The complete nested element structure should be identical');
});

verifyBehavior('Confirming direct element creation via the main utility function (no explicit "create" method)', () => {
  const imageUrl = 'http://placekitten.com/200/300';

  // Utilize the element creation utility to build an image node.
  const generatedImage = createDOMNode('img', { 'src': imageUrl });

  // Manually construct the reference image node.
  const targetImage = document.createElement('img');
  targetImage.src = imageUrl;

  // Ensure the tag name is correct.
  ensureSame(generatedImage.tagName.toLowerCase(), 'img', 'The tag name should be "img"');

  // The crucial check for images is their outerHTML or specific attributes.
  ensureSame(generatedImage.src, targetImage.src, 'The image source URL must be identical');

  // Perform a full comparison of the element's outer HTML representation.
  ensureDeepMatch(generatedImage, targetImage, 'The complete outer HTML of the image element should match');
});

verifyBehavior("Evaluating the creation of an unordered list with multiple child list items", () => {
  const listClass = 'someclass';

  // Define the child list items using the element creation utility.
  const listItemData = [
    createDOMNode('li', { "class": "active" }, "first"),
    createDOMNode('li', null, "second"), // `null` for attributes is valid
    createDOMNode('li', {}, "third")     // Using empty object for clarity
  ];

  // Construct the parent unordered list with its children.
  const generatedListElement = createDOMNode(
    'ul',
    { 'class': listClass },
    listItemData
  );

  // Define the canonical HTML string for comparison using a template literal.
  const anticipatedHtmlOutput = `<ul class="${listClass}"><li class="active">first</li><li>second</li><li>third</li></ul>`;

  // Compare the outer HTML of the generated list against the expected string.
  ensureSame(generatedListElement.outerHTML, anticipatedHtmlOutput, 'The generated list structure must precisely match the expected HTML string');
});

verifyBehavior("Assessing content generation through various function-based providers", async () => { // Make it async to handle potential promises
  let resultNode, targetHtml;

  // Scenario 1: Synchronous callback returning an element.
  resultNode = createDOMNode('div', {}, () => {
    return createDOMNode('span');
  });
  targetHtml = '<div><span></span></div>';
  ensureSame(resultNode.outerHTML, targetHtml, 'Content successfully generated by a synchronous function');

  // Scenario 2: Callback using a 'done' continuation for content.
  // Assuming createDOMNode wraps 'done' callbacks in Promises internally if they are truly async.
  resultNode = await createDOMNode('div', {}, (completionCallback) => {
    // Simulate immediate asynchronous completion.
    completionCallback(createDOMNode('span'));
  });
  targetHtml = '<div><span></span></div>';
  ensureSame(resultNode.outerHTML, targetHtml, 'Content generated via immediate asynchronous callback mechanism');

  // Scenario 3: Mixed content providers including functions, literals, and elements.
  resultNode = await createDOMNode('div', {}, [
    // Async-style callback with 'done'
    (completionHandler) => {
      completionHandler(createDOMNode('span.fromAsyncCallback'));
    },
    // Sync-style callback returning an element directly
    () => {
      return createDOMNode('span', { 'class': 'fromCallback' });
    },
    // Literal element
    createDOMNode('span.fromLiteral'),
    // Plain text string
    'plain text content for the node' // Changed string slightly
  ]);

  targetHtml = '<div><span class="fromAsyncCallback"></span><span class="fromCallback"></span><span class="fromLiteral"></span>plain text content for the node</div>';
  ensureSame(resultNode.outerHTML, targetHtml, 'Content composed from a heterogeneous mix of providers');
});

verifyBehavior('Thorough examination of asynchronous content provisioning via callbacks', async () => {
  // This scenario tests the utility's ability to handle content that resolves over time.
  const anticipatedFinalHtml = '<div><span class="fromAsyncCallback"></span><span class="fromCallback"></span><span class="fromLiteral"></span>basic textual content<span class="fromTimeoutAsyncCallback"></span></div>';
  let producedContainerElement;

  // The 'createDOMNode' utility is expected to manage the resolution of async content.
  producedContainerElement = await createDOMNode('div', {}, [
    // An immediately resolving async-style callback.
    (signalCompletion) => {
      signalCompletion(createDOMNode('span.fromAsyncCallback'));
    },
    // A callback that resolves asynchronously after a delay.
    (signalCompletion) => {
      return new Promise((resolve) => { // Using Promise for explicit async control
        setTimeout(() => {
          const delayedSpan = createDOMNode('span.fromTimeoutAsyncCallback');
          signalCompletion(delayedSpan); // Signal completion to the utility
          resolve(); // Resolve this specific content provider's promise
        }, 5); // Slightly increased delay for clarity, from 0 to 5ms
      });
    },
    // A synchronous callback returning an element.
    () => {
      return createDOMNode('span', { 'class': 'fromCallback' });
    },
    // A literal element.
    createDOMNode('span.fromLiteral'),
    // A simple text string.
    'basic textual content'
  ]);

  // After all asynchronous content has had a chance to resolve and be integrated,
  // we perform the final assertion.
  ensureSame(producedContainerElement.outerHTML, anticipatedFinalHtml, 'The final rendered HTML should precisely match after all async content is integrated');
});

verifyBehavior('Advanced asynchronous content provider behavior with return-value precedence', async () => {
  // This test explores a specific interaction: when an async callback both returns a value
  // and calls a 'done' callback. The utility should prioritize the returned value.
  const finalExpectedHtml = '<div><span class="one"></span><span class="three"></span></div>'; // Corrected original typo and behavior

  let generatedParent;

  generatedParent = await createDOMNode('div', {}, [
    // A standard synchronous content provider.
    () => {
      return createDOMNode('span.one');
    },
    // A complex content provider: it returns an element immediately,
    // but also attempts to provide another element asynchronously via a callback.
    // The utility is expected to use the immediately returned element.
    (completionSignal) => {
      // Simulate an async operation that completes later.
      setTimeout(() => {
        const suppressedElement = createDOMNode('span.two');
        completionSignal(suppressedElement); // This call should ideally be ignored by the utility
                                             // if a direct return value is present.
      }, 10); // A small delay to ensure the return value is processed first.
      return createDOMNode('span.three'); // This element should be prioritized.
    }
  ]);

  // The assertion should happen after the `createDOMNode` call completes,
  // which includes processing all content providers.
  ensureSame(generatedParent.outerHTML, finalExpectedHtml, 'The returned element should take precedence over the delayed completion signal');

  // Add a small delay and re-check to ensure the suppressed element doesn't appear later.
  await new Promise(resolve => setTimeout(resolve, 20));
  ensureSame(generatedParent.outerHTML, finalExpectedHtml, 'The suppressed element should not appear even after its async completion');
});

verifyBehavior('Variadic element creation: single argument (tag name)', () => {
  let generatedNodeResult, anticipatedHtml;

  // Invoking the utility with only the tag name.
  generatedNodeResult = createDOMNode('div');
  anticipatedHtml = `<div></div>`; // Using template literal

  ensureSame(generatedNodeResult.outerHTML, anticipatedHtml, 'An empty div element should be correctly generated');
});

verifyBehavior('Variadic element creation: two arguments (tag name + content/attributes)', async () => { // Made async
  let createdElement, expectedMarkup;
  const uniqueIdentifier = 'someId';

  // Scenario A: Tag name and an attribute object.
  createdElement = createDOMNode('div', { id: uniqueIdentifier });
  expectedMarkup = `<div id="${uniqueIdentifier}"></div>`;
  ensureSame(createdElement.outerHTML, expectedMarkup, `Div with ID "${uniqueIdentifier}" correctly produced`);
  ensureSame(createdElement.attributes.length, 1, 'Expected exactly one attribute (id)');

  // Scenario B: Tag name and a single child element.
  createdElement = createDOMNode('div', createDOMNode('span'));
  expectedMarkup = `<div><span></span></div>`;
  ensureSame(createdElement.outerHTML, expectedMarkup, 'Div containing a single span child is accurate');

  // Scenario C: Tag name and an array of child elements.
  createdElement = createDOMNode('div', [createDOMNode('span'), createDOMNode('span')]);
  expectedMarkup = `<div><span></span><span></span></div>`;
  ensureSame(createdElement.outerHTML, expectedMarkup, 'Div containing multiple span children is as expected');

  // Scenario D: Tag name and a synchronous content provider function.
  createdElement = createDOMNode('div', () => { return createDOMNode('span'); });
  expectedMarkup = `<div><span></span></div>`;
  ensureSame(createdElement.outerHTML, expectedMarkup, 'Div with span content from a synchronous function callback');

  // Scenario E: Tag name and an asynchronous content provider function using a completion callback.
  // Assuming createDOMNode internally handles this with promises for testability.
  createdElement = await createDOMNode('div', (completionSignal) => { completionSignal(createDOMNode('span')); });
  expectedMarkup = `<div><span></span></div>`;
  ensureSame(createdElement.outerHTML, expectedMarkup, 'Div with span content from an immediate asynchronous (done) callback');
});

// Execute all defined scenarios.
// This call assumes a browser environment or a Node.js environment with a DOM shim (e.g., JSDOM).
// If running in a context without 'document' or 'HTMLElement', mocks would be required.
executeAllScenarios();
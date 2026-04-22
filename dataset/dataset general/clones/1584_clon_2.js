verifyScenario("Constructing a foundational DOM node", function () {
	/* Initialize the element created by our custom builder */
	let producedNode = buildElement('div');
	// Set up a standard DOM element for comparison
	const referenceNode = document.createElement('div');

	// Verify that the tag names are identical
	confirmEquivalence(producedNode.tagName, referenceNode.tagName, 'Element tags are identical');
	// Check if CSS class names match
	confirmEquivalence(producedNode.className, referenceNode.className, 'CSS class assignments match');
	// Confirm unique identifiers are consistent
	confirmEquivalence(producedNode.id, referenceNode.id, 'Unique identifiers are consistent');
	// Ensure the count of attributes is the same
	confirmEquivalence(producedNode.attributes.length, referenceNode.attributes.length, 'Attribute counts align');
});

verifyScenario('Leveraging the element builder directly without explicit function call', function () {
	// Declare variables for the generated and reference elements
	let producedNode, referenceNode;

	// Create an anchor element using the builder with a hyperlink target
	producedNode = buildElement('a', { 'href': 'https://github.com/markgandolfo/el.js' });
	// Create a standard anchor element
	referenceNode = document.createElement('a');
	// Assign the hyperlink target to the standard element
	referenceNode.href = 'https://github.com/markgandolfo/el.js';

	// Assert that the tag names are the same
	confirmEquivalence(producedNode.tagName, referenceNode.tagName);
	// Assert that the hyperlink targets are identical
	confirmEquivalence(producedNode.href, referenceNode.href);
});

verifyScenario("Building a DOM node with diverse properties", function () {
	// Generate an anchor element with various attributes and content
	let producedNode = buildElement('a', { 'class': 'my classes', 'id': 'myId', 'href': 'https://github.com/markgandolfo/el.js', 'rel': 'nofollow' }, 'el.js ftw');
	// Prepare a reference standard DOM element
	const referenceNode = document.createElement('a');
	// Assign CSS classes to the reference element
	referenceNode.className = 'my classes';
	// Set the unique ID for the reference element
	referenceNode.id = 'myId';
	// Configure the 'rel' attribute
	referenceNode.setAttribute('rel', 'nofollow');
	// Set the hyperlink reference
	referenceNode.href = 'https://github.com/markgandolfo/el.js';
	// Populate the internal HTML content
	referenceNode.innerHTML = 'el.js ftw';

	// Validate the tag names
	confirmEquivalence(producedNode.tagName, referenceNode.tagName, 'Element tags match');
	// Validate the class names
	confirmEquivalence(producedNode.className, referenceNode.className, 'Class names are consistent');
	// Validate the unique IDs
	confirmEquivalence(producedNode.id, referenceNode.id, 'IDs are identical');
	// Validate the total number of attributes
	confirmEquivalence(producedNode.attributes.length, referenceNode.attributes.length, 'Attribute count matches');
	// Validate the 'id' attribute value
	confirmEquivalence(producedNode.getAttribute('id'), referenceNode.getAttribute('id'), 'ID attribute value is correct');
	// Validate the 'rel' attribute value
	confirmEquivalence(producedNode.getAttribute('rel'), referenceNode.getAttribute('rel'), 'Rel attribute value is correct');
	// Validate the 'href' attribute value
	confirmEquivalence(producedNode.getAttribute('href'), referenceNode.getAttribute('href'), 'Href attribute value is correct');
	// Validate the inner HTML content
	confirmEquivalence(producedNode.innerHTML, referenceNode.innerHTML, 'Inner content (HTML) is identical');
});

verifyScenario("Creating an element with CSS selectors and observing attribute merging", function () {
	// Construct an anchor element using a selector string for ID and class, plus additional attributes
	let producedNode = buildElement('a#mySecondUniqueId.myAlternative-class', { 'class': 'my classes', 'id': 'myId', 'href': 'https://github.com/markgandolfo/el.js', 'rel': 'nofollow' }, 'el.js ftw');
	// Initialize a standard anchor element for comparison
	const referenceNode = document.createElement('a');
	// Set the expected merged class names
	referenceNode.className = 'my classes myAlternative-class';
	// Set the expected merged ID
	referenceNode.id = 'myId mySecondUniqueId';
	// Set the 'rel' attribute
	referenceNode.setAttribute('rel', 'nofollow');
	// Set the hyperlink reference
	referenceNode.href = 'https://github.com/markgandolfo/el.js';
	// Set the inner HTML content
	referenceNode.innerHTML = 'el.js ftw';

	// Compare tag names
	confirmEquivalence(producedNode.tagName, referenceNode.tagName, 'Tag names are consistent');
	// Compare class names after merging
	confirmEquivalence(producedNode.className, referenceNode.className, 'Class names merge correctly');
	// Compare IDs after merging
	confirmEquivalence(producedNode.id, referenceNode.id, 'IDs merge correctly');
	// Compare attribute counts
	confirmEquivalence(producedNode.attributes.length, referenceNode.attributes.length, 'Attribute count is accurate');
	// Compare specific ID attribute value
	confirmEquivalence(producedNode.getAttribute('id'), referenceNode.getAttribute('id'), 'ID attribute value is accurate');
	// Compare specific 'rel' attribute value
	confirmEquivalence(producedNode.getAttribute('rel'), referenceNode.getAttribute('rel'), 'Rel attribute value is accurate');
	// Compare specific 'href' attribute value
	confirmEquivalence(producedNode.getAttribute('href'), referenceNode.getAttribute('href'), 'Href attribute value is accurate');
	// Compare inner HTML content
	confirmEquivalence(producedNode.innerHTML, referenceNode.innerHTML, 'Internal HTML content is accurate');
});

verifyScenario("Evaluating deeply nested DOM structures", function () {
	// Create an image element using the builder
	let imageNode = buildElement('img', { 'src': 'http://placekitten.com/200/300' });
	// Create a parent anchor element with the image as its child
	let producedNode = buildElement('a', { 'href': 'https://github.com/markgandolfo/el.js' }, imageNode);

	// Create a reference image element
	const imageReference = document.createElement('img');
	// Create a reference anchor element
	const referenceNode = document.createElement('a');

	// Set the source for the reference image
	imageReference.src = 'http://placekitten.com/200/300';
	// Set the hyperlink for the reference anchor
	referenceNode.href = 'https://github.com/markgandolfo/el.js';
	// Append the reference image to the reference anchor
	referenceNode.appendChild(imageReference);

	// Confirm that the inner HTML of the generated and reference elements match
	confirmEquivalence(producedNode.innerHTML, referenceNode.innerHTML, 'Child object was correctly placed within the parent');
	// Confirm that the full outer HTML of the generated and reference elements match
	confirmEquivalence(producedNode.outerHTML, referenceNode.outerHTML, 'Complete nested elements are rendered correctly');
});

verifyScenario('Element builder without the explicit create method', function () {
	// Generate an image element directly with attributes
	let producedNode = buildElement('img', { 'src': 'http://placekitten.com/200/300' });
	// Create a standard image element for comparison
	const referenceNode = document.createElement('img');
	// Set the source attribute for the reference image
	referenceNode.src = 'http://placekitten.com/200/300';

	// Check if the tag names are identical
	confirmEquivalence(producedNode.tagName, referenceNode.tagName, 'Element tag names are consistent');
	// Check if the inner HTML content matches
	confirmEquivalence(producedNode.innerHTML, referenceNode.innerHTML, 'Child object was correctly placed within the parent');
	// Check if the full outer HTML matches
	confirmEquivalence(producedNode.outerHTML, referenceNode.outerHTML, 'Complete nested elements are rendered correctly');
});

verifyScenario("Evaluating multiple child nodes", function () {
	// Construct an unordered list with several list items as children
	let itemContainer = buildElement(
		'ul',
		{ 'class': 'someclass' },
		[
			buildElement('li', { "class": "active" }, "first"),
			buildElement('li', null, "second"),
			buildElement('li', null, "third")
		]
	);

	// Define the expected HTML string for the list
	const expectedMarkup = '<ul class="someclass"><li class="active">first</li><li>second</li><li>third</li></ul>';

	// Assert that the generated list's outer HTML matches the expected markup
	confirmEquivalence(itemContainer.outerHTML, expectedMarkup, 'List with nested elements successfully created');
});

verifyScenario("Testing a function as a content provider for elements", function () {
	// Declare variables for the generated and expected elements
	let producedNode, expectedMarkup;

	// Create a div with content provided by a synchronous callback function
	producedNode = buildElement('div', {}, function () {
		return buildElement('span');
	});

	// Define the expected HTML for the synchronous case
	expectedMarkup = '<div><span></span></div>';

	// Confirm the outer HTML matches for the sync callback content
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Content created with synchronous callback');

	// Create a div with content provided by an asynchronous callback function (using a 'completionNotify' callback)
	producedNode = buildElement('div', {}, function (completionNotify) {
		completionNotify(buildElement('span'));
	});

	// Define the expected HTML for the asynchronous case
	expectedMarkup = '<div><span></span></div>';

	// Confirm the outer HTML matches for the async callback content
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Content created with asynchronous callback');

	// Create a div with content from a mixed array of providers
	producedNode = buildElement('div', {}, [
		// Async callback provider
		function (completionNotify) {
			completionNotify(buildElement('span.asyncCompletionCallback'));
		},
		// Sync callback provider
		function (completionNotify) {
			return buildElement('span', { 'class': 'syncCompletionCallback' });
		},
		// Literal element provider
		buildElement('span.fromDirectLiteral'),
		// Plain text content provider
		'plain text content'
	]);

	// Define the expected HTML for the mixed content providers
	expectedMarkup = '<div><span class=\"asyncCompletionCallback\"></span><span class=\"syncCompletionCallback\"></span><span class=\"fromDirectLiteral\"></span>plain text content</div>';
	// Confirm the outer HTML matches for mixed content providers
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Content created with mixed content providers');
});

verifyAsyncScenario('Testing asynchronous content provider function', function () {
	let producedNode, expectedMarkup;
	// Define the full expected HTML, including the asynchronously added span
	expectedMarkup = '<div><span class="asyncCompletionCallback"></span><span class="syncCompletionCallback"></span><span class="fromDirectLiteral"></span>plain text content<span class="delayedAsyncCompletion"></span></div>';
	// Create a div with a mix of synchronous and asynchronous content providers
	producedNode = buildElement('div', {}, [
		// First async provider
		function (completionNotify) {
			completionNotify(buildElement('span.asyncCompletionCallback'));
		},
		// Second async provider with a delay
		function (completionNotify) {
			setTimeout(function () {
				completionNotify(buildElement('span.delayedAsyncCompletion'));

				// After the async part completes, perform the final assertion
				confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Content created with mixed content providers, including delayed async');
				commenceTestRun(); // Signal the test runner to proceed
			}, 0); // Execute immediately after current call stack clears
		},
		// Synchronous callback provider
		function (completionNotify) {
			return buildElement('span', { 'class': 'syncCompletionCallback' });
		},
		// Literal element provider
		buildElement('span.fromDirectLiteral'),
		// Plain text content
		'plain text content'
	]);
});

verifyAsyncScenario('Testing asynchronous content provider function scenario 2', function () {
	let producedNode, expectedMarkup;
	// Expected HTML string after all operations, including suppressed async one
	expectedMarkup = '<div><span class="firstSpan"></span><span class="thirdSpan"></span></div>';

	// Create an element with mixed synchronous and asynchronous content functions
	producedNode = buildElement('div', {}, [
		// Synchronous function returning an element
		function () {
			return buildElement('span.firstSpan');
		},
		// Function with both a delayed async completion and a synchronous return
		function (completionNotify) {
			setTimeout(function () {
				completionNotify(buildElement('span.secondSpan')); // This result should be suppressed by the synchronous return
				confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Suppressed asynchronous callback result due to immediate return');
			}, 0);
			return buildElement('span.thirdSpan'); // This takes precedence
		}
	]);
	// Ensure the test runner starts after a minimal delay
	setTimeout(commenceTestRun, 0);
});

verifyScenario('Flexible argument creation with a single argument', function () {
	let producedNode, expectedMarkup;
	// Create a basic div with no content or attributes
	producedNode = buildElement('div');
	expectedMarkup = '<div></div>';

	// Assert that an empty div was correctly created
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Empty div element was created');
});

verifyScenario('Flexible argument creation with two arguments', function () {
	let producedNode, expectedMarkup;
	// Create a div with a specific ID attribute
	producedNode = buildElement('div', { id: 'someId' });
	expectedMarkup = '<div id="someId"></div>';

	// Confirm the div with ID was created correctly
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Div with identifier created');

	// Create a div containing a single span element
	producedNode = buildElement('div', buildElement('span'));
	expectedMarkup = '<div><span></span></div>';

	// Confirm the div with one nested span was created
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Div with a single span element created');

	// Create a div containing an array of two span elements
	producedNode = buildElement('div', [buildElement('span'), buildElement('span')]);
	expectedMarkup = '<div><span></span><span></span></div>';

	// Confirm the div with two nested spans was created
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Div with two span elements created');

	// Create a div with content generated by a synchronous callback
	producedNode = buildElement('div', function () { return buildElement('span'); });
	expectedMarkup = '<div><span></span></div>';

	// Confirm the div with content from a callback was created
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Div with one span from synchronous callback created');

	// Create a div with content generated by an asynchronous callback using 'completionNotify'
	producedNode = buildElement('div', function (completionNotify) { completionNotify(buildElement('span')); });
	expectedMarkup = '<div><span></span></div>';
	// Confirm the div with content from an async callback was created
	confirmEquivalence(producedNode.outerHTML, expectedMarkup, 'Div with one span from asynchronous callback created');
});
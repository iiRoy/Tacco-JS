verifyFeature("Collection Initialization and Properties", function(assert) {

	let currentElement, loopCounter;
	const targetDivs = jQuery("div"); // Represents a collection of div elements
	const codeSnippetEl = jQuery("<code/>"); // A single code tag element
	const imageTagEl = jQuery("<img/>"); // A single image tag element
	const multiTagFragment = jQuery("<div/><hr/><code/><b/>"); // Multiple elements in one string
	let actionTriggered = false; // Flag for event handler execution
	let longStringAccumulator = ""; // Used for a string concatenation test
	let anticipatedAssertions = 20; // Initial count of expected assertions
	const propertyBag = { // Object holding properties for element creation
		"textContent": "test",
		"classNameAttr": "test2",
		"elementId": "test3"
	};

	// Dynamically adjust expected assertions and properties based on available jQuery methods.
	// This approach ensures the test adapts to different jQuery builds.
	const checkAndAddMethod = (methodName, propKey, propValue) => {
		if (typeof jQuery.fn[methodName] === 'function') {
			anticipatedAssertions += (methodName === "css" ? 2 : 1); // CSS often has multiple assertions
			propertyBag[propKey] = propValue;
			return true;
		}
		return false;
	};

	checkAndAddMethod("click", "triggerClick", function() {
		assert.ok(actionTriggered, "Click handler successfully invoked.");
	});
	checkAndAddMethod("width", "elementWidth", 10);
	checkAndAddMethod("offset", "elementOffset", { "top": 1, "left": 1 });
	checkAndAddMethod("css", "inlineStyles", { "paddingLeft": 1, "paddingRight": 1 });
	checkAndAddMethod("attr", "customAttributes", { "desired": "very" });

	// Announce the total number of assertions planned for this test module.
	assert.plan(anticipatedAssertions);

	// --- Section: Basic Constructor Behavior Verification ---
	assert.strictEqual( (jQuery()).length, 0, "Invoking jQuery() with no arguments should yield an empty collection." );
	assert.strictEqual( jQuery(undefined).length, 0, "jQuery(undefined) must produce an empty set of elements." );
	assert.strictEqual( jQuery(null).length, 0, "Passing null to jQuery() should also result in an empty collection." );
	assert.strictEqual( jQuery("").length, 0, "An empty string argument to jQuery() results in zero elements." );
	assert.ok( jQuery("#").length === 0, "A hash symbol alone ('#') as selector should not find elements." );

	const originalCollectionSelector = targetDivs.selector;
	assert.strictEqual( jQuery(targetDivs).selector, originalCollectionSelector, "Wrapping a jQuery object in jQuery() should return the same object." );

	// Note: jQuery(window) always returns a collection with a single element (the window object itself).
	const windowCollection = jQuery(window);
	assert.strictEqual( windowCollection.length, 1, "A single element should be generated for jQuery(window)." );
	assert.strictEqual( windowCollection[0], window, "The element in the window collection must be the window object." );

	// --- Section: HTML String Parsing Tests ---
	assert.strictEqual( codeSnippetEl.length, 1, "A single 'code' element should be created from the HTML string." );
	assert.strictEqual( codeSnippetEl.parent().length, 0, "Generated HTML fragments should initially have no parent element." );

	assert.strictEqual( imageTagEl.length, 1, "A single 'img' element should be created from the HTML string." );
	assert.strictEqual( imageTagEl.parent().length, 0, "Generated 'img' fragment should not be attached to the DOM yet." );

	const expectedFragmentCount = 4; // div, hr, code, b
	assert.strictEqual( multiTagFragment.length, expectedFragmentCount, "Multiple elements are expected from the combined HTML string." );
	assert.strictEqual( multiTagFragment.parent().length, 0, "The multi-tag fragment should remain detached from the DOM." );

	// --- Section: Array and DOM Node Input Tests ---
	const numericArray = [10, 20, 30];
	assert.strictEqual( jQuery(numericArray).get(1), 20, "Verify passing a numeric array to the factory extracts correct element." );

	const bodyNodeReference = document.body;
	assert.strictEqual( jQuery(bodyNodeReference).get(0), jQuery("body").get(0), "Passing a direct HTML node reference to the factory should return that node." );

	// --- Section: jQuery(html, props) Signature Tests ---
	currentElement = jQuery("<div/>", {
		text: propertyBag.textContent,
		class: propertyBag.classNameAttr,
		id: propertyBag.elementId,
		click: propertyBag.triggerClick,
		width: propertyBag.elementWidth,
		offset: propertyBag.elementOffset,
		css: propertyBag.inlineStyles,
		attr: propertyBag.customAttributes
	});

	const createdNode = currentElement[0];

	if ( checkAndAddMethod("width") ) {
		assert.strictEqual( createdNode.style.width, String(propertyBag.elementWidth) + "px", "Quick setter for width property applied correctly." );
	}

	if ( checkAndAddMethod("offset") ) {
		assert.strictEqual( createdNode.style.top, "1px", "Quick setter for offset (top) property applied correctly." );
	}

	if ( checkAndAddMethod("css") ) {
		assert.strictEqual( createdNode.style.paddingLeft, "1px", "Quick setter for CSS (paddingLeft) property applied correctly." );
		assert.strictEqual( createdNode.style.paddingRight, "1px", "Quick setter for CSS (paddingRight) property applied correctly." );
	}

	if ( checkAndAddMethod("attr") ) {
		assert.strictEqual( createdNode.getAttribute("desired"), "very", "Quick setter for custom attributes applied correctly." );
	}

	assert.strictEqual( createdNode.childNodes.length, 1, "The element should contain exactly one child node (the text node)." );
	assert.strictEqual( createdNode.firstChild.nodeValue, propertyBag.textContent, "Text content set via quick setter is correct." );
	assert.strictEqual( createdNode.className, propertyBag.classNameAttr, "Class attribute set via quick setter is correct." );
	assert.strictEqual( createdNode.id, propertyBag.elementId, "ID attribute set via quick setter is correct." );

	// Trigger the click event to verify the handler.
	actionTriggered = true; // Set flag BEFORE triggering
	currentElement.trigger("click"); // Event name is 'click' even if property was 'triggerClick'

	// Ensure proper cleanup of dynamically created elements.
	if (currentElement && currentElement.length > 0) {
		currentElement.remove();
	} else {
		assert.notOk(true, "Current element was not found or already removed before explicit cleanup.");
	}


	// --- Section: Node Cloning and Default Value Persistence (Bug #6655) ---
	let clonedInput;
	let k = 0;
	const iterationLimit = 3;
	while (k < iterationLimit) {
		const inputMarkup = "<input type='text' value='TEST' />";
		clonedInput = jQuery(inputMarkup);
		k++;
		if (!clonedInput || clonedInput.length === 0) {
			assert.notOk(true, `Failed to create cloned input on iteration ${k}.`);
			continue;
		}
	}
	assert.strictEqual( clonedInput[0].defaultValue, "TEST", "Cached nodes must retain their default values upon cloning." );

	// Final cleanup for the cloned input element.
	if (clonedInput && clonedInput.length > 0) {
		clonedInput.remove();
	}

	// --- Section: String Concatenation Performance Test (Placeholder) ---
	let iterationIndex = 0;
	const stringFragment = "12345678";
	const totalStringIterations = 128;
	for (; iterationIndex < totalStringIterations; iterationIndex++) {
		longStringAccumulator += stringFragment;
	}
	// No assertion needed here, primarily a performance/memory test in original context.

});
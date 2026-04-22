/*
 *******************************************************************************************************************
 *
 * Simple JavaScript DOM Inspector v0.1.2 - A Tool for Web Developers
 *
 * This utility provides visual feedback on hovered DOM elements by applying a 2-pixel red outline.
 * Upon a click event, it captures the targeted element and passes it to a user-defined callback function
 * for further processing.
 *
 * Default Behavior:
 * By default, the inspector logs a jQuery-style CSS selector path of the clicked element to the browser's console.
 *
 * CSS Path Generation:
 * The internal CSS path-building mechanism intelligently traverses the element's parent nodes.
 * It constructs an optimized selector string, prioritizing the first encountered parent with an assigned #id.
 * Alternatively, it can generate an ultra-specific, full CSS path, tracing all the way back to the 'html' root element.
 *
 * Advanced Selector Options:
 * The tool offers an optional feature to enhance selector specificity. It can analyze the generated CSS path
 * to identify segments that might match multiple elements or elements lacking a unique #id or .class.
 * In such cases, it dynamically inserts specific ":nth-child()" pseudo-selectors.
 * Example: "html body #content p img:nth-child(1)" for precise targeting.
 *
 * Cancellation:
 * The inspector can be deactivated at any time by pressing the 'escape' key.
 *
 * Note on XPath:
 * The original XPath implementation has been removed due to instability and will require a complete rewrite.
 *
 * Browser Compatibility (as of current release):
 * Initial efforts for Internet Explorer support are underway, but full functionality is not yet achieved.
 * Currently verified in: Firefox 4, Chrome, Safari, Opera 11.
 *
 * Disclaimer:
 * This software is provided without warranty. While unlikely to cause significant issues,
 * improvements and contributions are always welcome!
 *
 * Developed by Joss
 *
 *******************************************************************************************************************
 */

(function (  document  ) {
	  var    last    ; // Stores the last highlighted element for cleanup purposes.

	/**
	 * Generates a comprehensive CSS selector path for any given DOM element.
	 *
	 * This function produces a jQuery-compatible CSS path, incorporating IDs, classes,
	 * and optionally, ':nth-child' pseudo-selectors for maximum specificity.
	 *
	 * Developers can choose between a full, verbose CSS path (e.g., "html body #main #content .top p:nth-child(3)")
	 * or an optimized, shorter path that terminates at the first parent node possessing a unique ID
	 * (e.g., "#content .top p").
	 *
	 * @param {HTMLElement} el The DOM element for which to generate the CSS path.
	 * @returns {string} The generated CSS selector path.
	 */
	function cssPath( el ) {
		var fullPath    = 0,  // Configuration: Set to 1 for ultra-specific full CSS-path, 0 for optimized path.
			useNthChild = 0,  // Configuration: Set to 1 to employ ":nth-child()" pseudo-selectors.
			cssPathStr  = '', // Accumulates the final CSS path string.
			testPath    = '', // Temporary variable for path testing (currently unused).
			parents     = [], // Array to store parent elements (currently unused).
			parentSelectors = [], // Array to store individual parent selectors.
			tagName,      // Stores the lowercase HTML tag name.
			cssId,        // Stores the element's ID, prefixed with '#'.
			cssClass,     // Stores the element's CSS classes, prefixed with '.'.
			tagSelector,  // The combined selector for a single element (tag + id + class).
			vagueMatch,   // Flag to indicate if a selector is not specific enough.
			nth,          // Counter for :nth-child pseudo-selector.
			i,            // Loop counter.
			c;            // Temporary element reference for sibling traversal.

		// Ascend the DOM tree, constructing a unique identifier for each parent node.
		while (  el  )
		{
			vagueMatch = 0; // Reset vague match flag for each element.

			// Retrieve the element's HTML tag name and convert it to lowercase.
			tagName = el.nodeName.toLowerCase();

			// Capture the element's ID attribute, prepending a '#' if it exists.
			cssId = ( el.id ) ? ( '#' + el.id ) : false;

			// Extract the element's CSS classes, replacing spaces with '.' for CSS selector format.
			cssClass = ( el.className ) ? ( '.' + el.className.replace(/\s+/g,".") ) : '';

			// Formulate a distinct selector for the current parent node.
			if ( cssId )
			{
				// Element uniquely identified by its ID.
				tagSelector = tagName + cssId + cssClass;
			}
			else if ( cssClass )
			{
				// Element identified by its class (specificity will be checked later if needed).
				tagSelector = tagName + cssClass;
			}
			else
			{
				// No ID or class available; resort to using ":nth-child()" if enabled.
				vagueMatch  =  1;
				tagSelector = tagName;
			}

			// Prepend the generated tag selector to the parentSelectors array.
			parentSelectors.unshift(  tagSelector  );

			// If an optimized (short) CSS path is desired and the current element has an ID, terminate traversal.
			if (  cssId  &&  !fullPath  )
				break; // Optimization: Stop at the first ID.

			// Move to the next parent node, unless it's the document itself.
			el = el.parentNode !== document ? el.parentNode : false;

		} // End of while loop for parent traversal.


		// Assemble the complete CSS path string from the collected parent selectors.
		for (  i = 0;  i < parentSelectors.length;  i++  )
		{
			cssPathStr += ' ' + parentSelectors[i]; // Append the current parent's selector.

			// Conditional logic for appending ":nth-child()" selectors.
			// This applies if useNthChild is active, the current selector lacks an ID,
			// and is not the 'html' or 'body' tag.
			if (  useNthChild  &&  !parentSelectors[i].match(/#/)  &&  !parentSelectors[i].match(/^(html|body)$/)  )
			{

				// Check if the selector lacks a class or if the current path fragment matches multiple elements.
				if (  !parentSelectors[i].match(/\./)  ||  $( cssPathStr ).length > 1  )
				{

					// Calculate the element's position among its siblings for ":nth-child" pseudo-selector.
					for (  nth = 1, c = el;  c.previousElementSibling;  c = c.previousElementSibling, nth++  )  ;

					// Add the ":nth-child()" pseudo-selector to the CSS path.
					cssPathStr += ":nth-child(" + nth + ")";
				}
			}

		}

		// Return the final CSS path string, with leading/trailing whitespace removed.
		return cssPathStr.replace(/^[ \t]+|[ \t]+$/, '');
	}


	/**
	 * Event handler for mouseover actions on all elements across the page.
	 *
	 * This function is triggered when the mouse pointer enters the bounds of any DOM element.
	 * It applies a visual highlight (a 2px solid red outline) to the hovered element.
	 *
	 * @param {MouseEvent} e The mouseover event object.
	 */
	function inspectorMouseOver( e )
	{
		// Note: Direct event.target access might behave differently in IE; requires a specific fix.
		var element = e.target; // Get the specific element that triggered the event.

		// Apply a red outline style to visually highlight the element.
		element.style.outline = '2px solid #f00';

		// Store a reference to the currently highlighted element. This is crucial
		// for removing the highlight when the inspector is cancelled or deactivated.
		last = element;
	}


	/**
	 * Event handler for mouseout actions on all elements.
	 *
	 * This function executes when the mouse cursor leaves the area of an element.
	 * Its primary role is to revert any visual changes made by `inspectorMouseOver`.
	 *
	 * @param {MouseEvent} e The mouseout event object.
	 */
	function inspectorMouseOut( e )
	{
		// Remove the outline style from the element that the mouse just left.
		// This restores the element's original appearance.
		e.target.style.outline = '';
	}


	/**
	 * Event handler for click actions on hovered elements.
	 *
	 * This function is invoked when a user clicks on an element that has been highlighted
	 * by the inspector. It prevents the default click behavior and then performs
	 * predefined actions, such as logging the element's CSS path.
	 *
	 * @param {MouseEvent} e The click event object.
	 * @returns {boolean} Always returns `false` to effectively stop event propagation.
	 */
	function inspectorOnClick( e )
	{
		e.preventDefault(); // Prevent the browser's default action for the click event.

		// The following actions represent the default behavior of the inspector.
		// These can be customized or replaced with any desired callback logic.
		// For instance, one might want to send the element to an external tool or API.
		console.log(  cssPath(e.target)  ); // Log the CSS path of the clicked element.
		/* console.log( getXPath(e.target).join('/') ); */ // Placeholder for potential XPath logging.

		return false; // Crucial for preventing further event bubbling and default actions.
	}


	/**
	 * Function to gracefully cancel and deactivate the DOM inspector.
	 *
	 * This handler is typically triggered by keyboard events, such as pressing the 'Escape' key.
	 * It unbinds all inspector-related event listeners and cleans up any active visual highlights.
	 *
	 * @param {KeyboardEvent} e The keyboard event object, or `null` for IE compatibility.
	 */
	function inspectorCancel( e )
	{
		// Check for Internet Explorer compatibility (older versions might use `event.keyCode`).
		// This block currently won't work correctly in IE due to `last.style.outlineStyle = 'none';`
		// which should be `last.style.outline = 'none';` for consistency.
		if ( e === null && event.keyCode === 27 )
		{
			document.detachEvent("mouseover", inspectorMouseOver); // Remove mouseover listener.
			document.detachEvent("mouseout", inspectorMouseOut);   // Remove mouseout listener.
			document.detachEvent("click", inspectorOnClick);       // Remove click listener.
			document.detachEvent("keydown", inspectorCancel);     // Remove keydown listener itself.
			last.style.outlineStyle = 'none';                      // Attempt to remove highlight (IE specific).
		}
		// For modern browsers (using `e.which` for key codes).
		else if ( e.which === 27 ) // If the 'Escape' key (key code 27) was pressed.
		{
			document.removeEventListener("mouseover", inspectorMouseOver, true); // Remove mouseover listener.
			document.removeEventListener("mouseout", inspectorMouseOut, true);   // Remove mouseout listener.
			document.removeEventListener("click", inspectorOnClick, true);       // Remove click listener.
			document.removeEventListener("keydown", inspectorCancel, true);     // Remove keydown listener itself.

			// Ensure the outline is removed from the last highlighted element.
			// This prevents a lingering red box after cancellation.
			last.style.outline = 'none';
		}
	}


	/**
	 * Initializes the DOM inspector by attaching necessary event listeners.
	 *
	 * This block checks for browser compatibility (addEventListener vs. attachEvent)
	 * and then registers the inspector's core functions to respond to
	 * mouse interactions and keyboard input across the entire document.
	 */
	if (  document.addEventListener  )
	{
		// Standard compliant browsers (W3C DOM events).
		// The 'true' argument indicates event capturing phase for global listeners.
		document.addEventListener("mouseover", inspectorMouseOver, true);
		document.addEventListener("mouseout", inspectorMouseOut, true);
		document.addEventListener("click", inspectorOnClick, true);
		document.addEventListener("keydown", inspectorCancel, true);
	}
	else if (  document.attachEvent  )
	{
		// Older Internet Explorer versions (Microsoft's proprietary event model).
		document.attachEvent("mouseover", inspectorMouseOver);
		document.attachEvent("mouseout", inspectorMouseOut);
		document.attachEvent("click", inspectorOnClick);
		document.attachEvent("keydown", inspectorCancel);
	}
	// No else block, as very old browsers without either method won't support this.

})(document); // Immediately Invoked Function Expression (IIFE) to encapsulate the code.
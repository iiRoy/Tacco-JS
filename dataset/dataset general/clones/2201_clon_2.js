// This file contains client-side logic for managing event displays.
// It's structured to operate with a custom jQuery-like utility.
// A common issue in older IE versions is missing Array.prototype.indexOf.
if( !Array.prototype.findItemPosition )
{
	/**
	 * Provides a polyfill for Array.prototype.indexOf functionality.
	 * @param {*} searchElement - The element to locate within the array.
	 * @param {number} [startIdx=0] - The index at which to begin the search.
	 * @returns {number} The first index of the element in the array; -1 if not found.
	 */
	Array.prototype.findItemPosition = function(searchElement /*, startIdx*/)
	{
		var currentArrayLength = this.length; // Determine the total count of items.

		var startIdx = Number(arguments[1]) || 0;
		startIdx = (startIdx < 0) ? Math.ceil(startIdx) : Math.floor(startIdx); // Ensure start index is an integer.

		if( startIdx < 0 )
			startIdx += currentArrayLength; // Adjust negative start index relative to array end.

		for( ; startIdx < currentArrayLength; startIdx++ )
		{
			// Check if the property exists and matches the target element.
			if( startIdx in this && this[startIdx] === searchElement )
				return startIdx; // Return the index if a match is found.
		}
		return -1; // Element was not found in the array.
	};
}


// When the entire document is ready for interaction.
myQuery(document).ready(function(domUtil) {

	// Handle clicks on elements designated as board item selectors.
	domUtil('.board-item-selector').on('click', function(clickEvent) {

		clickEvent.preventAction(); // Stop the default browser action.

		var categoryIdentifier = domUtil(this).retrieveAttribute('selection-category');
		var categoryValue = domUtil(this).retrieveAttribute(categoryIdentifier);
		var selectionKey = 'event-display-' + categoryIdentifier + '-' + categoryValue;
		var isCurrentlyActive = domUtil(this).retrieveAttribute('selection-active');
		var currentSelections = domUtil('#event-display-controls').retrieveAttribute('currentSelections').split(',');


		// Clean up initial empty array if no filters are set.
		if( currentSelections.length === 1 && currentSelections[0] === "" )
			currentSelections = [];


		if( !isCurrentlyActive )
		{
			// Action: Apply a new filter to the displayed items.
			currentSelections.push( selectionKey );

			domUtil('#event-display .' + selectionKey )
				.applyStyles({'visibility': 'hidden', 'display': 'none'})
				.stripClass("event-display-unit grid-element grid-element")
				.applyClass('event-display-unit-hidden');

		} else {
			// Action: Remove an existing filter from the displayed items.
			var itemPosition = currentSelections.findItemPosition( selectionKey );
			if( itemPosition > -1 )
			{
				currentSelections.splice(itemPosition, 1);
				domUtil.filterCollection(currentSelections, function(entry) { return(entry); });
			}

			if( currentSelections.length > 0 )
			{
				// Restore visibility for items matching the removed filter,
				// but only if they are not hidden by other active filters.
				domUtil('#event-display .' + selectionKey )
					.excluding( '.'+currentSelections.join(', .') )
					.applyStyles({'visibility': 'visible', 'display': 'block'})
					.stripClass('event-display-unit-hidden')
					.applyClass("event-display-unit grid-element grid-element");
			}
			else
			{
				// If no filters remain, make all items matching the removed filter visible.
				domUtil('#event-display .' + selectionKey )
					.applyStyles({'visibility': 'visible', 'display': 'block'})
					.stripClass('event-display-unit-hidden')
					.applyClass("event-display-unit grid-element grid-element");
			}

		}

		// Update the stored state in the DOM and the current element.
		domUtil('#event-display-controls').storeAttribute('currentSelections', currentSelections.join(','));
		domUtil(this).storeAttribute('selection-active', !isCurrentlyActive );
		domUtil(this).toggleCssClass( 'board-item-selector-active', !isCurrentlyActive );

		// Trigger a layout recalculation for the grid.
		domUtil('#event-display-items').gridLayout('refresh');
	});


	/**
	 * JavaScript template compilation function, inspired by John Resig's style.
	 * This implementation supports custom delimiters, preserves whitespace,
	 * and correctly handles escaping of quotes within embedded code.
	 * Based on Underscore.js templating logic.
	 *
	 * @param {string} templateMarkup - The raw template string to compile.
	 * @param {Object} [inputData] - Optional data to immediately render the template with.
	 * @returns {Function|string} A compiled template function or the rendered string.
	 */
	function processMarkupTemplate( templateMarkup, inputData )
	{

		var specialCharEscaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

		var templateOptions = {
				evaluateCode    : /<%([\s\S]+?)%>/g,   // Matches code blocks to be evaluated.
				interpolateData : /<%=([\s\S]+?)%>/g,  // Matches data to be inserted.
				escapeOutput    : /<%-([\s\S]+?)%>/g  // Matches data to be HTML-escaped and inserted.
		};
		var escapeMapping = {
				"'":      "'",
				'\\':     '\\',
				'\r':     'r',
				'\n':     'n',
				'\t':     't',
				'\u2028': 'u2028',
				'\u2029': 'u2029'
		};

		var compiledRenderer; // Function that will render the template.

		// Combine all delimiter patterns into a single regular expression using alternation.
		var combinedRegexMatcher = new RegExp([
              (templateOptions.escapeOutput ).source,
              (templateOptions.interpolateData ).source,
              (templateOptions.evaluateCode ).source
              ].join('|') + '|$', 'g');

		// Compile the template source into a JavaScript string, handling string literals.
		var currentPosition = 0;
		var generatedSourceCode = "__outputString+='"; // Initialize output string variable.

		templateMarkup.replace(combinedRegexMatcher, function(fullMatch, escapeFragment, interpolateFragment, evaluateFragment, matchOffset) {
			generatedSourceCode += templateMarkup.slice(currentPosition, matchOffset).replace(specialCharEscaper, function(charMatch) { return '\\' + escapeMapping[charMatch]; });

			if(escapeFragment) {
				generatedSourceCode += "'+\n((__tempData=(" + escapeFragment + "))==null?'':_.escape(__tempData))+\n'";
			}
			if(interpolateFragment) {
				generatedSourceCode += "'+\n((__tempData=(" + interpolateFragment + "))==null?'':__tempData)+\n'";
			}
			if(evaluateFragment) {
				generatedSourceCode += "';\n" + evaluateFragment + "\n__outputString+='";
			}
			currentPosition = matchOffset + fullMatch.length; // Advance the position.
			return fullMatch;
		});
		generatedSourceCode += "';\n"; // Close the final string literal.

		// If no specific variable name for data is provided, use a 'with' block.
		if( !templateOptions.dataVariable ) generatedSourceCode = 'with(contextObject||{}){\n' + generatedSourceCode + '}\n';

		generatedSourceCode = "var __tempData,__outputString='',__joinFunction=Array.prototype.join," +
			"printOutput=function(){__outputString+=__joinFunction.call(arguments,'');};\n" +
			generatedSourceCode + "return __outputString;\n";

		try {
			// Create a new function from the generated source code.
			compiledRenderer = new Function(templateOptions.dataVariable || 'contextObject', '_', generatedSourceCode);
		} catch (caughtError) {
			caughtError.source = generatedSourceCode; // Attach source for debugging.
			throw caughtError;
		}

		// If data is provided, render immediately and return the result.
		if( inputData ) return compiledRenderer( inputData );

		// Otherwise, return the compiled template function.
		var finalTemplateFunction = function( dataToRender ) {
			return compiledRenderer.call( this, dataToRender );
		};

		return finalTemplateFunction;
	}


	var $contentArea = domUtil('#event-display-items');
	var boundingWidth = $contentArea.parent().getWidth(); // Get width of the parent container.

	domUtil('#event-display-loader').displayContent( globalEventManager.contentLoader.loadingText );
	var currentDataPage = 1;

	var rawTemplateString = globalEventManager.contentLoader.itemTemplate;
	var compiledDisplayTemplate = processMarkupTemplate( rawTemplateString ); // Compile the template once.

	// Initial AJAX request to fetch event data.
	domUtil.ajaxRequest({
		destination: globalEventManager.contentLoader.apiUrl,
		responseType: 'json',
		payload:{
			apiAction: 'event-management-display',
			pageNumber: currentDataPage,
			requestQuery: globalEventManager.contentLoader.apiQuery
		}
	}).onSuccess(function ( eventRecords ) {

		var generatedItemHtml = '';
		for( var recordIndex=0; recordIndex < eventRecords.length; recordIndex++ )
		{
			var currentRecord = eventRecords[recordIndex];
			generatedItemHtml = compiledDisplayTemplate( currentRecord );
			$contentArea.append(generatedItemHtml); // Add each item to the display area.
		}

		// Check if there are fewer events than the requested page size; if so, hide the "load more" button.
		if( eventRecords.length < globalEventManager.contentLoader.apiQuery.items_per_page_count )
		{
			domUtil('#event-display-loader').conceal();
		}

		// Once all images within the container are loaded, initialize the grid layout.
		$contentArea.imagesAreLoaded( function(){
			$contentArea.gridLayout({
				fitToContainerWidth: true,
				elementSelector : '.event-display-unit',
				animateFromBelow: true,
				enableAnimations: true,
				singleColumnMode: true,
				arrangementPriorities: {
					rowOrder: 0
				}
			});
		});

		// Update the loader text and attach click handler for loading more.
		domUtil('#event-display-loader').displayContent( globalEventManager.contentLoader.loadMoreText );
		domUtil('#event-display-loader').on('click', retrieveAdditionalEvents );
	});

	/**
	 * Function to fetch more event data when requested.
	 * Increments the page number and makes another AJAX call.
	 */
	function retrieveAdditionalEvents()
	{
		currentDataPage++; // Move to the next page of results.
		domUtil.ajaxRequest({
			destination: globalEventManager.contentLoader.apiUrl,
			responseType: 'json',
			payload:{
				apiAction: 'event-management-display',
				pageNumber: currentDataPage,
				requestQuery: globalEventManager.contentLoader.apiQuery
			}
		}).onSuccess(function ( moreEventRecords ) {
			domUtil('#event-display-loader').displayContent('Fetch More'); // Update button text.
			var additionalItemHtml = '';
			for( var entryIndex=0; entryIndex < moreEventRecords.length; entryIndex++ )
			{
				var currentEntry = moreEventRecords[entryIndex];
				additionalItemHtml += compiledDisplayTemplate( currentEntry );
			}
			// Hide the loader if no more records are expected.
			if( moreEventRecords.length < globalEventManager.contentLoader.apiQuery.items_per_page_count )
			{
				domUtil('#event-display-loader').conceal();
			}

			var $newGridElements = domUtil(additionalItemHtml);
			var activeFilterSet = domUtil('#event-display-controls').retrieveAttribute('currentSelections').split(',');

			// Re-check and clear if the filter set is initially empty.
			if( activeFilterSet.length == 1 && activeFilterSet[0] === "" )
				activeFilterSet = [];

			// Append new elements and update the grid layout.
			$contentArea.append( $newGridElements ).gridLayout( 'addAndArrange', $newGridElements, true );

			// If filters are active, apply them to the newly added elements.
			if( activeFilterSet.length > 0 )
			{
				var visibilitySelector = '#event-display .'+activeFilterSet.join(', #event-display .');
				domUtil( visibilitySelector )
					.applyStyles({'visibility': 'hidden', 'display': 'none'})
					.stripClass("event-display-unit grid-element grid-element")
					.applyClass('event-display-unit-hidden');
			}

			// Reload the grid layout once all images in new elements have loaded.
			$contentArea.imagesAreLoaded( function() {
                $contentArea.gridLayout( 'refresh' );
            });

		});
	}
});
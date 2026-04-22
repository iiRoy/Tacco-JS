(function(jq){

	/*
	 * Configuration defaults for the responsive navigation tool.
	 * These can be overridden by the user.
	 */
	var config = {
		unify: true,					// Should multiple navigation lists be merged into one single dropdown?
		sectionTitle: 'Hauptseite',		// If optgroups are not clickable, provide a default option text for them.
		hierarchical: true,				// Should sub-menus be represented as <optgroup> elements?
		attachTo: 'body',				// Where should the generated dropdown be inserted in the DOM?
		breakpoint: 768,				// The screen width threshold (in pixels) to activate/deactivate the responsive menu.
		defaultOptionText: 'Wähle eine Seite'	// Placeholder text for the initial "unselected" state of the dropdown.
	},

	// Stores references to the original matched navigation elements.
	$originalLists,

	// A unique counter used for generating IDs for new dropdown menus.
	listCounter = 0,

	// An array to keep track of URLs already added to a combined list to prevent duplicates.
	distinctUrls = [];


	// Function to redirect the browser to a specified URL.
	function navigate(destination){
		window.location.href = destination;
	}

	// Checks if the responsive navigation dropdown is currently present in the DOM.
	function mobileNavPresent(){
		return (jq('.responsive-nav').length > 0);
	}

	// Validates if the provided jQuery selection consists of <ul> or <ol> elements.
	function isValidList($element){
		let result = true; // Assume valid until proven otherwise.
		$element.each(function(){
			if(!jq(this).is('ul') && !jq(this).is('ol')){
				result = false; // Found an invalid element.
			}
		});
		return result; // Return the validation outcome.
	}


	// Determines if the current viewport width is below the defined breakpoint.
	function isSmallScreen(){
		return (jq(window).width() < config.breakpoint);
	}


	// Extracts the text content of a jQuery element, excluding its children's text.
	function extractNodeText($node){
		// Clone the element, remove its children (ul, ol), then get the trimmed text.
		return jq.trim($node.clone().children('ul, ol').remove().end().text());
	}

	// Checks if a given URL is already present in the `distinctUrls` array.
	function isDestinationUnique(targetUrl){
		return (jq.inArray(targetUrl, distinctUrls) === -1);
	}


	// Processes a list to remove duplicate items, especially when combining multiple lists.
	function deduplicateListItems($processingList){

		$processingList.find(' > li').each(function(){

			var $listItem = jq(this),
				itemLink = $listItem.find('a').attr('href'),
				retrieveParentLink = function(){
					if($listItem.parent().parent().is('li')){
						return $listItem.parent().parent().find('a').attr('href');
					} else {
						return null;
					}
				};

			// First, recursively check nested list items for duplicates.
			if($listItem.find(' ul, ol').length > 0){
				deduplicateListItems($listItem.find('> ul, > ol'));
			}

			// After nested item removals, clean up any empty ULs/OLs.
			if(!$listItem.find(' > ul li, > ol li').length){
				$listItem.find('ul, ol').remove();
			}

			// If the parent item's link is not unique (meaning it was already processed/moved)
			// AND the current item's link IS unique, append current item to the parent's sublist.
			if(retrieveParentLink() !== null && !isDestinationUnique(retrieveParentLink(), distinctUrls) && isDestinationUnique(itemLink, distinctUrls)){
				$listItem.appendTo(
					$processingList.closest('ul#unifiedNav').find('li:has(a[href=' + retrieveParentLink() + ']):first ul')
				);
			}

			// Otherwise, if the current item's link is unique, add it to our tracking array.
			else if(isDestinationUnique(itemLink)){
				distinctUrls.push(itemLink);
			}

			// If neither of the above, the item is a duplicate and should be removed.
			else {
				$listItem.remove();
			}

		});
	}


	// Merges all matched navigation lists into a single new list.
	function mergeNavigationLists(){

		// Create a new unordered list element to hold combined items.
		var $combinedList = jq('<ul id="unifiedNav" />');

		// Iterate through each original menu and append its children to the new combined list.
		$originalLists.each(function(){
			jq(this).children().clone().appendTo($combinedList);
		});

		// Remove any redundant list items from the combined list.
		deduplicateListItems($combinedList);

		// Return the consolidated list.
		return $combinedList;

	}


	// Creates an <option> element for a <select> dropdown.
	function makeSelectOption($sourceItem, $optionContainer, optionLabel){

		// If a specific label is provided, use it; otherwise, extract text from the source item.
		if(!optionLabel){
			jq('<option value="' + $sourceItem.find('a:first').attr('href') + '">' + jq.trim(extractNodeText($sourceItem)) + '</option>').appendTo($optionContainer);
		} else {
			jq('<option value="' + $sourceItem.find('a:first').attr('href') + '">' + optionLabel + '</option>').appendTo($optionContainer);
		}

	}


	// Generates an <optgroup> element for a <select> menu, representing a sub-menu.
	function makeOptionGroup($groupElement, $groupContainer){

		// Create the <optgroup> with a label derived from the group element's text.
		var optionGroup = jq('<optgroup label="' + jq.trim(extractNodeText($groupElement)) + '" />');

		// Add a "main page" option to the optgroup.
		makeSelectOption($groupElement, optionGroup, config.sectionTitle);

		// Process each sub-navigation list within the group element.
		$groupElement.children('ul, ol').each(function(){

			// For each item in the sub-list, create an <option>.
			jq(this).children('li').each(function(){
				makeSelectOption(jq(this), optionGroup);
			});
		});

		// Append the completed optgroup to its container (the <select> element).
		optionGroup.appendTo($groupContainer);

	}


	// Constructs the main <select> dropdown menu.
	function buildDropdownMenu($sourceList){

		// Create a new <select> element with a unique ID and a class.
		var $dropdown = jq('<select id="dd' + listCounter + '" class="responsive-nav" />');
		listCounter++; // Increment the counter for the next dropdown.

		// If a default option text is specified, create and append it.
		if(config.defaultOptionText){
			makeSelectOption(jq('<li>' + config.defaultOptionText + '</li>'), $dropdown);
		}

		// Iterate through the top-level list items of the source navigation.
		$sourceList.children('li').each(function(){

			var $listItem = jq(this);

			// If hierarchical display is enabled and the list item has sub-navigation, create an optgroup.
			if($listItem.children('ul, ol').length > 0 && config.hierarchical){
				makeOptionGroup($listItem, $dropdown);
			}

			// Otherwise, create a simple option for the list item.
			else {
				makeSelectOption($listItem, $dropdown);
			}

		});

		// Attach a change event handler to the dropdown for navigation,
		// then insert the dropdown into the specified DOM location.
		$dropdown
			.change(function(){navigate(jq(this).val());})
			.prependTo(config.attachTo);

	}


	// Main function to execute the responsive navigation logic.
	function executeMobileMenuLogic(){

		// If on a small screen AND the responsive menu is not yet present:
		if(isSmallScreen() && !mobileNavPresent()){

			// If combining menus is desired, create a single dropdown.
			if(config.unify){
				var $combinedList = mergeNavigationLists();
				buildDropdownMenu($combinedList);
			}

			// Otherwise, create a separate dropdown for each original navigation list.
			else{
				$originalLists.each(function(){
					buildDropdownMenu(jq(this));
				});
			}
		}

		// If on a small screen AND the responsive menu IS present:
		else if(isSmallScreen() && mobileNavPresent()){
			jq('.responsive-nav').show(); // Ensure the dropdown is visible.
			$originalLists.hide();        // Hide the original navigation lists.
		}

		// If not on a small screen (desktop view) AND the responsive menu IS present:
		else if(!isSmallScreen() && mobileNavPresent()){
			jq('.responsive-nav').hide(); // Hide the dropdown.
			$originalLists.show();        // Show the original navigation lists.
		}

	}


	// jQuery plugin definition for responsive navigation.
	jq.fn.responsiveNav = function(userSettings){

		// Merge user-provided settings with the default configuration.
		if(userSettings){jq.extend(config, userSettings);}

		// Check if the plugin was called on valid list element(s).
		if(isValidList(jq(this))){
			$originalLists = jq(this); // Store the matched lists.
			executeMobileMenuLogic(); // Run the initial setup.
			// Re-run the logic whenever the window is resized.
			jq(window).resize(function(){executeMobileMenuLogic();});
		} else {
			// Inform the user if the selector was incorrect.
			console.warn('responsiveNav plugin requires <ul> or <ol> elements as its target.');
		}

	};

})(jQuery);
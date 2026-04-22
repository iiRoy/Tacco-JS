var adaptableWidgets = ( function ( jQueryRef, globalModuleRef ) {
	'use strict';

	// Ensure the global module object exists and can be extended.
	globalModuleRef = globalModuleRef || {};

	/**
	 * Initializes the responsive tab-to-accordion functionality.
	 * This function scans for tab groups and converts them into accordion structures
	 * that become visible on specified breakpoints.
	 *
	 * @param {Array<string>} breakpointConfig - An array of Bootstrap breakpoint aliases (e.g., ['xs', 'sm'])
	 *                                           where the tabs should collapse into accordions.
	 */
	globalModuleRef.initResponsiveContent = function ( breakpointConfig ) {

		// Ensure jQuery is available before proceeding.
		if ( !jQueryRef ) {
			console.error( "ResponsiveContent: jQuery reference is missing. Initialization aborted." );
			return;
		}

		// Set the initial display mode.
		globalModuleRef.activeDisplayMode = 'tabbedLayout';

		var $allTabNavigationGroups = jQueryRef( '.nav-tabs.responsive' );
		var utilityClassesToHide = '';
		var utilityClassesToShow = '';
		var idOfInitiallyActiveAccordion = ''; // Stores the ID of the accordion pane that needs to be active.

		// Provide a default configuration if none is supplied or if it's invalid.
		if ( !Array.isArray(breakpointConfig) || breakpointConfig.length === 0 ) {
			breakpointConfig = [ 'xs', 'sm' ]; // Default to extra small and small viewports.
		}

		// Generate the CSS utility classes for hiding/showing elements based on breakpoints.
		jQueryRef.each( breakpointConfig, function ( index, breakpointAlias ) {
			utilityClassesToHide += ' hidden-' + breakpointAlias;
			utilityClassesToShow += ' visible-' + breakpointAlias;
		} );

		// Iterate over each responsive tab group found on the page.
		jQueryRef.each( $allTabNavigationGroups, function ( groupIndex, tabGroupElement ) {
			var $currentTabGroup   = jQueryRef( tabGroupElement );
			var $navigationLinks    = $currentTabGroup.find( 'li a' );

			// A unique ID is crucial for linking tabs to accordions.
			var tabGroupId = $currentTabGroup.attr( 'id' );
			if ( !tabGroupId ) {
				console.warn( "ResponsiveContent: A tab group was found without an 'id' attribute. Skipping conversion for this group:", tabGroupElement );
				return true; // Continue to the next tab group.
			}

			// Create the main wrapper for the generated accordion structure.
			// Using <section> for semantic grouping, and adding ARIA attributes for accessibility.
			var $accordionContainerWrapper = jQueryRef( '<section></section>', {
				'class' : 'panel-group responsive ' + utilityClassesToShow,
				'id'    : 'accordion-group-' + tabGroupId, // Unique ID for the accordion group.
				'role'  : 'tablist', // ARIA role for a collection of tab panels.
				'aria-multiselectable' : 'true' // Indicates if multiple accordion items can be open.
			} );

			// For each tab link within the current tab group, create a corresponding accordion item.
			jQueryRef.each( $navigationLinks, function ( linkIndex, tabLinkElement ) {
				var $currentTabLink          = jQueryRef( tabLinkElement );
				var existingLinkClasses   = $currentTabLink.attr( 'class' ) || '';
				var accordionToggleBaseClass = 'accordion-toggle';
				var existingParentClasses = $currentTabLink.parent().attr( 'class' ) || '';
				var accordionPanelBaseClasses = 'panel panel-default';
				// The hash of the tab link (e.g., #tab1) becomes the ID for the accordion's collapsible content (e.g., collapse-tab1).
				var accordionContentTargetId = $currentTabLink.get( 0 ).hash.replace( '#', 'collapse-' );

				// Combine existing link classes with new accordion toggle classes.
				if ( existingLinkClasses.length > 0 ) {
					accordionToggleBaseClass = [accordionToggleBaseClass, existingLinkClasses].join(' ');
				}

				// Clean and combine existing parent classes with new accordion panel classes.
				if ( existingParentClasses.length > 0 ) {
					// Remove the 'active' class as it's handled differently in accordions.
					existingParentClasses = existingParentClasses.replace( /\bactive\b/g, '' ).trim();
					if ( existingParentClasses.length > 0 ) {
						accordionPanelBaseClasses = [accordionPanelBaseClasses, existingParentClasses].join(' ');
					}
				}

				// If this tab was initially active, mark its corresponding accordion content ID.
				if ( $currentTabLink.parent().hasClass( 'active' ) ) {
					idOfInitiallyActiveAccordion = '#' + accordionContentTargetId;
				}

				// Construct the individual accordion item step-by-step for clarity.
				var $panelHeader = jQueryRef( '<div>' )
					.attr( 'class', 'panel-heading' )
					.attr( 'role', 'tab' ) // ARIA role for the header.
					.attr( 'id', 'heading-' + accordionContentTargetId ); // Unique ID for header.

				var $panelTitleElement = jQueryRef( '<h4>' )
					.attr( 'class', 'panel-title' );

				var $toggleLink = jQueryRef( '<a>', {
					'class'       : accordionToggleBaseClass + ' collapsed', // Start as collapsed by default.
					'role'        : 'button', // ARIA role for interactive element.
					'data-toggle' : 'collapse',
					'data-parent' : '#' + $accordionContainerWrapper.attr('id'), // Link to the parent accordion group.
					'href'        : '#' + accordionContentTargetId,
					'aria-expanded': 'false', // ARIA state: indicates it's currently collapsed.
					'aria-controls': accordionContentTargetId, // ARIA association to its controlled element.
					'html'        : $currentTabLink.html() // Use the original tab's HTML content.
				} );

				var $collapsibleContentDiv = jQueryRef( '<div>', {
					'id'            : accordionContentTargetId,
					'class'         : 'panel-collapse collapse', // Bootstrap collapse classes.
					'role'          : 'tabpanel', // ARIA role for the collapsible content.
					'aria-labelledby' : $panelHeader.attr('id') // ARIA association to its controlling header.
				} );

				$panelTitleElement.append( $toggleLink );
				$panelHeader.append( $panelTitleElement );

				var $singleAccordionItem = jQueryRef( '<div>' )
					.attr( 'class', accordionPanelBaseClasses )
					.append( $panelHeader )
					.append( $collapsibleContentDiv ); // The panel-body will be moved into this later.

				$accordionContainerWrapper.append( $singleAccordionItem );
			} );

			// Insert the newly created accordion wrapper into the DOM.
			// It should appear before the tab-content container which usually follows the nav-tabs.
			var $correspondingTabContentContainer = $currentTabGroup.next( '.tab-content.responsive' );
			if ( $correspondingTabContentContainer.length ) {
				$correspondingTabContentContainer.before( $accordionContainerWrapper );
			} else {
				// Fallback: If no direct .tab-content.responsive sibling, append after the tab group itself.
				$currentTabGroup.after( $accordionContainerWrapper );
				console.warn("ResponsiveContent: Could not find direct '.tab-content.responsive' sibling for tab group #" + tabGroupId + ". Appended accordion group directly after tab navigation.");
			}

			// Hide the original tab navigation and its content areas.
			$currentTabGroup.addClass( utilityClassesToHide );
			var $allResponsiveTabContents = jQueryRef( '.tab-content.responsive' );
			if ( $allResponsiveTabContents.length ) {
				$allResponsiveTabContents.addClass( utilityClassesToHide );
			}

			console.info( `ResponsiveContent: Tab group #${tabGroupId} successfully processed into an accordion structure.` );
		} );

		// Perform an initial check to determine the layout mode based on viewport size.
		globalModuleRef.handleViewportChange();
		// Bind the necessary event listeners for interaction between tabs and accordions.
		globalModuleRef.linkTabAccordionEvents();

		// If an initial active tab was identified, activate its corresponding accordion.
		if ( idOfInitiallyActiveAccordion ) {
			// Find the accordion toggle link and trigger its state change to ensure ARIA attributes are updated.
			var $activeAccordionToggleLink = jQueryRef( '[href="' + idOfInitiallyActiveAccordion + '"][data-toggle="collapse"]' );
			if ( $activeAccordionToggleLink.length ) {
				$activeAccordionToggleLink.removeClass( 'collapsed' ).attr( 'aria-expanded', 'true' );
				// Add Bootstrap's 'in' class for Bootstrap 3 or 'show' for Bootstrap 4+ to display content.
				jQueryRef( idOfInitiallyActiveAccordion ).addClass( 'in' ).attr( 'aria-expanded', 'true' );
			} else {
				// Fallback: Directly show the collapse panel if the toggle link couldn't be found.
				jQueryRef( idOfInitiallyActiveAccordion ).collapse( 'show' );
			}
		}
	};

	/**
	 * Checks the current viewport size and switches between tabbed and accordion layouts.
	 */
	globalModuleRef.handleViewportChange = function () {
		// Determine if the accordion layout is currently visible.
		var accordionsAreCurrentlyVisible = jQueryRef( '.panel-group.responsive' ).is( ':visible' );

		// Transition from tabs to accordions if accordions are visible and we're in tabbed mode.
		if ( accordionsAreCurrentlyVisible && globalModuleRef.activeDisplayMode === 'tabbedLayout' ) {
			globalModuleRef.transformToAccordions();
			globalModuleRef.activeDisplayMode = 'accordionLayout';
			console.log( "ResponsiveContent: Viewport changed, switched to accordion layout." );
		}
		// Transition from accordions to tabs if accordions are hidden and we're in accordion mode.
		else if ( !accordionsAreCurrentlyVisible && globalModuleRef.activeDisplayMode === 'accordionLayout' ) {
			globalModuleRef.revertToTabs();
			globalModuleRef.activeDisplayMode = 'tabbedLayout';
			console.log( "ResponsiveContent: Viewport changed, reverted to tabbed layout." );
		}
		// No action needed if the state hasn't changed or if it's already in the correct mode.
	};

	/**
	 * Moves the content from tab panes into their corresponding accordion panel bodies.
	 */
	globalModuleRef.transformToAccordions = function () {
		var $allResponsiveTabNavGroups = jQueryRef( '.nav-tabs.responsive' );
		var numberOfPanesTransformed = 0; // Counter for logging purposes.

		jQueryRef.each( $allResponsiveTabNavGroups, function ( groupIndex, tabNavGroup ) {
			// Find all tab content panes associated with this specific tab navigation group.
			var $contentPanes = jQueryRef( tabNavGroup ).next( '.tab-content' ).find( '.tab-pane' );

			// If no content panes are found for this tab group, skip it.
			if ( !$contentPanes.length ) {
				console.warn( "ResponsiveContent: No content panes found for tab group:", tabNavGroup );
				return true; // Continue to the next tab group.
			}

			jQueryRef.each( $contentPanes, function ( paneIndex, tabContentPane ) {
				var $currentTabContentPane = jQueryRef( tabContentPane );
				// The ID of the tab pane (e.g., 'tab1') needs to be mapped to the accordion content ID ('collapse-tab1').
				var originalTabPaneId = $currentTabContentPane.attr( 'id' );
				if ( !originalTabPaneId ) {
					console.warn( "ResponsiveContent: A tab pane was found without an 'id'. Skipping transformation for:", tabContentPane );
					return true; // Continue to the next pane.
				}
				var targetAccordionContentSelector = '#collapse-' + originalTabPaneId;

				// Ensure the destination accordion panel exists before moving content.
				var $destinationAccordionPanel = jQueryRef( targetAccordionContentSelector );
				if ( $destinationAccordionPanel.length ) {
					// Remove tab-pane class, add panel-body class, and move the content.
					$currentTabContentPane
						.removeClass( 'tab-pane' )
						.addClass( 'panel-body' )
						.appendTo( $destinationAccordionPanel );
					numberOfPanesTransformed++;
				} else {
					console.warn( `ResponsiveContent: Destination accordion panel not found for tab pane #${originalTabPaneId} at selector: ${targetAccordionContentSelector}` );
				}
			} );
		} );

		if ( numberOfPanesTransformed > 0 ) {
			console.log( `ResponsiveContent: Successfully transformed ${numberOfPanesTransformed} tab panes into accordion bodies.` );
		}
	};

	/**
	 * Moves the content from accordion panel bodies back into their original tab panes.
	 */
	globalModuleRef.revertToTabs = function () {
		var $allResponsiveAccordionGroups = jQueryRef( '.panel-group.responsive' );
		var numberOfPanesReverted = 0; // Counter for logging purposes.

		jQueryRef.each( $allResponsiveAccordionGroups, function ( groupIndex, accordionGroup ) {
			var $currentAccordionGroup = jQueryRef( accordionGroup );

			// Derive the original tab group ID from the accordion group's ID.
			var originalTabGroupId = $currentAccordionGroup.attr( 'id' ).replace( 'accordion-group-', '' );
			var $targetTabContentArea = jQueryRef( '#' + originalTabGroupId ).next( '.tab-content' );

			// Ensure the target tab content area exists.
			if ( !$targetTabContentArea.length || !$targetTabContentArea[0] ) {
				console.warn( `ResponsiveContent: Target tab content container not found for accordion group #${originalTabGroupId}. Skipping reversion.` );
				return true; // Continue to the next accordion group.
			}

			// Find all panel bodies within this accordion group.
			var $accordionBodyContent = $currentAccordionGroup.find( '.panel-body' );

			// If no panel bodies are found, skip this accordion group.
			if ( !$accordionBodyContent.length ) {
				console.warn( "ResponsiveContent: No panel bodies found in accordion group:", accordionGroup );
				return true;
			}

			// Convert panel body back to tab-pane and move it to the correct tab content area.
			$accordionBodyContent
				.removeClass( 'panel-body' )
				.addClass( 'tab-pane' )
				.appendTo( $targetTabContentArea );
			numberOfPanesReverted++;
		} );

		if ( numberOfPanesReverted > 0 ) {
			console.log( `ResponsiveContent: Successfully reverted ${numberOfPanesReverted} accordion bodies to tab panes.` );
		}
	};

	/**
	 * Binds event listeners to synchronize tab and accordion states.
	 */
	globalModuleRef.linkTabAccordionEvents = function () {

		var $allTabNavigationLinks     = jQueryRef( '.nav-tabs.responsive' ).find( 'li a' );
		var $allCollapsiblePanels = jQueryRef( '.panel-group.responsive' ).find( '.panel-collapse' );

		// Guard clause: If no elements are found, there's nothing to bind events to.
		if ( !$allTabNavigationLinks.length && !$allCollapsiblePanels.length ) {
			console.warn( "ResponsiveContent: No responsive tabs or accordions found to bind events. Skipping event binding." );
			return;
		}

		// When a tab is shown (activated), trigger the corresponding accordion panel to show.
		$allTabNavigationLinks.on( 'shown.bs.tab', function ( event ) {
			// Extract the ID of the content div (e.g., 'tab1') from the tab's href.
			var currentTabContentId = jQueryRef( event.currentTarget.hash ).attr('id');
			// Construct the selector for the corresponding accordion collapse panel (e.g., '#collapse-tab1').
			var $activeAccordionPanel = jQueryRef( '#collapse-' + currentTabContentId );

			if ( $activeAccordionPanel.length ) {
				$activeAccordionPanel.collapse( 'show' );
				// Update ARIA attributes for the accordion toggle link.
				var $correspondingToggleLink = jQueryRef( 'a[href="#' + currentTabContentId + '"][data-toggle="collapse"]' );
				if ( $correspondingToggleLink.length ) {
					$correspondingToggleLink.removeClass( 'collapsed' ).attr( 'aria-expanded', 'true' );
				}
			} else {
				console.warn( `ResponsiveContent: Could not find corresponding accordion panel for tab #${currentTabContentId}.` );
			}

			// If a previous tab was active, hide its corresponding accordion panel.
			if ( event.relatedTarget ) {
				var previousTabContentId = jQueryRef( event.relatedTarget.hash ).attr('id');
				var $inactiveAccordionPanel = jQueryRef( '#collapse-' + previousTabContentId );
				if ( $inactiveAccordionPanel.length ) {
					$inactiveAccordionPanel.collapse( 'hide' );
					// Update ARIA attributes for the previous accordion toggle link.
					var $previousToggleLink = jQueryRef( 'a[href="#' + previousTabContentId + '"][data-toggle="collapse"]' );
					if ( $previousToggleLink.length ) {
						$previousToggleLink.addClass( 'collapsed' ).attr( 'aria-expanded', 'false' );
					}
				}
			}
		} );

		// When an accordion panel is shown (opened), activate its corresponding tab.
		$allCollapsiblePanels.on( 'shown.bs.collapse', function ( event ) {

			// Extract the original tab ID from the accordion panel's ID.
			var accordionContentPanelId = jQueryRef( event.target ).attr('id'); // e.g., 'collapse-tab1'
			var originalTabId = accordionContentPanelId.replace( 'collapse-', '' ); // e.g., 'tab1'
			var tabLinkSelector = 'a[href="#' + originalTabId + '"]';

			var $correspondingTabLink = jQueryRef( tabLinkSelector );
			if ( $correspondingTabLink.length ) {
				$correspondingTabLink.tab( 'show' );
			} else {
				console.warn( `ResponsiveContent: Could not find corresponding tab link for accordion panel #${accordionContentPanelId}.` );
			}

			// The original code had logic to add 'active' class to the .panel-body.
			// This is somewhat unusual for Bootstrap accordions where 'in' or 'show' on .panel-collapse indicates active.
			// We'll retain this behavior as it's part of the original clone specification, but note its potential redundancy.
			var $parentAccordionGroup = jQueryRef( event.currentTarget ).closest( '.panel-group.responsive' );
			// Clear any 'active' class from previously active panel bodies within this group.
			$parentAccordionGroup.find( '.panel-body.active' ).removeClass( 'active' );
			// Add 'active' class to the panel body of the currently shown accordion.
			jQueryRef( event.currentTarget ).find( '.panel-body' ).addClass( 'active' );

			console.log( `ResponsiveContent: Accordion panel #${accordionContentPanelId} shown, corresponding tab activated.` );
		} );
	};

	// Debounce the window resize event to prevent excessive function calls during resizing.
	var resizeEventDebounceTimer;
	jQueryRef( window ).on( 'resize', function () {
		clearTimeout( resizeEventDebounceTimer );
		resizeEventDebounceTimer = setTimeout( function() {
			globalModuleRef.handleViewportChange();
		}, 150 ); // Wait 150ms after resize stops before checking viewport.
	} );

	return globalModuleRef;
}( window.jQuery, window.adaptableWidgets ) ); // Pass window.jQuery and ensure globalModuleRef is accessible globally.
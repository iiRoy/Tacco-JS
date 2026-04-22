var tabulator = ( function( jQueryRef, tabulatorModule ) {
	'use strict';
	// This function initializes the dynamic tab and accordion behavior.
	tabulatorModule.adaptablePanels = function( hiddenBreakpoints ) {

		tabulatorModule.currentViewMode = 'tabs'; // Establish the initial layout state

		var sectionContainers = jQueryRef( '.nav-tabs.responsive' );
		var invisibleClasses  = '';
		var visibleClasses    = '';
		var activeSectionID   = '';

		// Configure default breakpoint settings if none are provided
		if ( hiddenBreakpoints === undefined ) {
			hiddenBreakpoints = [ 'xs', 'sm' ];
		}

		// Construct CSS class strings for responsive visibility
		jQueryRef.each( hiddenBreakpoints, function() {
			invisibleClasses += ' hidden-' + this;
			visibleClasses   += ' visible-' + this;
		} );

		// Iterate through each responsive tab group
		jQueryRef.each( sectionContainers, function() {
			var $sectionContainer   = jQueryRef( this );
			var sectionLinks        = $sectionContainer.find( 'li a' );
			var accordionContainer  = jQueryRef( '<div></div>', {
				'class' : 'panel-group responsive' + visibleClasses,
				'id'    : 'accordion-' + $sectionContainer.attr( 'id' )
			} );

			// Process each individual tab link to create its accordion counterpart
			jQueryRef.each( sectionLinks, function() {
				var $currentLink       = jQueryRef( this );
				var priorLinkStyle     = $currentLink.attr( 'class' ) === undefined ? '' : $currentLink.attr( 'class' );
				var updatedLinkStyle   = 'accordion-toggle';
				var priorParentStyle   = $currentLink.parent().attr( 'class' ) === undefined ? '' : $currentLink.parent().attr( 'class' );
				var updatedParentStyle = 'panel panel-default';
				var targetPanelID      = $currentLink.get( 0 ).hash.replace( '#', 'accordion-' );

				// Append any existing classes to the new link style
				if ( priorLinkStyle.length > 0 ) {
					updatedLinkStyle += ' ' + priorLinkStyle;
				}

				// Clean and update the parent element's CSS classes
				if ( priorParentStyle.length > 0 ) {
					priorParentStyle   = priorParentStyle.replace( /\bactive\b/g, '' );
					updatedParentStyle += ' ' + priorParentStyle;
					updatedParentStyle = updatedParentStyle.replace( /\s{2,}/g, ' ' );
					updatedParentStyle = updatedParentStyle.replace( /^\s+|\s+$/g, '' );
				}

				// Identify the currently active tab to pre-open its accordion panel
				if ( $currentLink.parent().hasClass( 'active' ) ) {
					activeSectionID = '#' + targetPanelID;
				}

				// Build and append the new accordion panel structure
				accordionContainer.append(
					jQueryRef( '<div>' ).attr( 'class', updatedParentStyle ).html(
						jQueryRef( '<div>' ).attr( 'class', 'panel-heading' ).html(
							jQueryRef( '<h4>' ).attr( 'class', 'panel-title' ).html(
								jQueryRef( '<a>', {
									'class'       : updatedLinkStyle,
									'data-toggle' : 'collapse',
									'data-parent' : '#accordion-' + $sectionContainer.attr( 'id' ),
									'href'        : '#' + targetPanelID,
									'html'        : $currentLink.html()
								} )
							)
						)
					).append(
						jQueryRef( '<div>', {
							'id'    : targetPanelID,
							'class' : 'panel-collapse collapse'
						} )
					)
				);
			} );

			// Insert the generated accordion structure and hide the original tabs
			$sectionContainer.next().after( accordionContainer );
			$sectionContainer.addClass( invisibleClasses );
			jQueryRef( '.tab-content.responsive' ).addClass( invisibleClasses );
		} );


		tabulatorModule.evaluateViewport();
		tabulatorModule.attachToggleHandlers();

		// Activate the designated accordion panel if an active tab was found
		if ( activeSectionID ) {
			jQueryRef( activeSectionID ).collapse( 'show' );
		}
	};

	// Determines if the layout needs to switch between tabs and accordion view
	tabulatorModule.evaluateViewport = function() {

		if ( jQueryRef( '.panel-group.responsive' ).is( ':visible' ) === true && tabulatorModule.currentViewMode === 'tabs' ) {
			tabulatorModule.convertTabsToAccordion();
			tabulatorModule.currentViewMode = 'panel';
		} else if ( jQueryRef( '.panel-group.responsive' ).is( ':visible' ) === false && tabulatorModule.currentViewMode === 'panel' ) {
			tabulatorModule.convertAccordionToTabs();
			tabulatorModule.currentViewMode = 'tabs';
		}

	};

	// Transforms tab content sections into accordion panel bodies
	tabulatorModule.convertTabsToAccordion = function() {

		var sectionContainers = jQueryRef( '.nav-tabs.responsive' );

		jQueryRef.each( sectionContainers, function( idx, sectionContainerElement ) {

			// Find the associated content for each tab group
			var sectionContentElements = jQueryRef( sectionContainerElement ).next( '.tab-content' ).find( '.tab-pane' );

			jQueryRef.each( sectionContentElements, function( idx2, currentContentElement ) {
				// Construct the target identifier for the accordion panel
				var targetElementID = jQueryRef( currentContentElement ).attr( 'id' ).replace ( /^/, '#accordion-' );

				// Modify classes and relocate the content to its new parent accordion panel
				jQueryRef( currentContentElement )
					.removeClass( 'tab-pane' )
					.addClass( 'panel-body' )
					.appendTo( jQueryRef( targetElementID ) );

			} );

		} );

	};

	// Reverts accordion panel bodies back into tab content sections
	tabulatorModule.convertAccordionToTabs = function() {

		var accordionCollections = jQueryRef( '.panel-group.responsive' );

		jQueryRef.each( accordionCollections, function( idx, accordionCollectionItem ) {

			var targetElementID = jQueryRef( accordionCollectionItem ).attr( 'id' ).replace( 'accordion-', '#' );
			var targetDestination   = jQueryRef( targetElementID ).next( '.tab-content' )[ 0 ];

			// Locate the content within the accordion panels
			var accordionBodyElements = jQueryRef( accordionCollectionItem ).find( '.panel-body' );

			// Restore original classes and move content back to the tab container
			accordionBodyElements
				.removeClass( 'panel-body' )
				.addClass( 'tab-pane' )
				.appendTo( jQueryRef( targetDestination ) );

		} );

	};

	// Establishes event handlers for synchronization between tabs and accordion panels
	tabulatorModule.attachToggleHandlers = function() {

		var navigationTriggers = jQueryRef( '.nav-tabs.responsive' ).find( 'li a' );
		var collapsibleItems   = jQueryRef( '.panel-group.responsive' ).find( '.panel-collapse' );

		// When a tab becomes active, expand its corresponding accordion panel
		navigationTriggers.on( 'shown.bs.tab', function( eventObject ) {
			var $activeElement  = jQueryRef( eventObject.currentTarget.hash.replace( /#/, '#accordion-' ) );
			$activeElement.collapse( 'show' );

			if ( eventObject.relatedTarget ) {
				var $previousElement = jQueryRef( eventObject.relatedTarget.hash.replace( /#/, '#accordion-' ) );
				$previousElement.collapse( 'hide' );
			}
		} );

		// When an accordion panel is expanded, activate its associated tab
		collapsibleItems.on( 'shown.bs.collapse', function( eventObject ) {

			// Determine the target tab's href to activate it
			var activeLinkHref = jQueryRef( eventObject.target ).context.id.replace( /accordion-/g, '#' );
			jQueryRef( 'a[href="' + activeLinkHref + '"]' ).tab( 'show' );

			// Update the 'active' class on the relevant panel body
			var parentAccordionGroup = jQueryRef( eventObject.currentTarget ).closest( '.panel-group.responsive' );
			jQueryRef( parentAccordionGroup ).find( '.panel-body' ).removeClass( 'active' );
			jQueryRef( eventObject.currentTarget ).find( '.panel-body' ).addClass( 'active' );

		} );
	};

	// Bind the layout adjustment function to the window's resize event
	jQueryRef( window ).resize( function() {
		tabulatorModule.evaluateViewport();
	} );

	return tabulatorModule;
}( window.jQuery, tabulator || { } ) );
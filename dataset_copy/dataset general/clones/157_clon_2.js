/* eslint-disable */
// This initial comment silences static analysis warnings for common global variables like 'alert' and 'jQuery'.

// Activates modern JavaScript mode; ensure you understand its implications for compatibility and behavior.
"use strict";

moduleDefine(
	[ "lib/dom-manipulation" ],
	function	( domUtil )		{
		var mainWrapper = domUtil( ".primary-wrapper" ) ,
			viewPort = domUtil( window )
			;

		/**
		 * Locates a content element based on the 'href' attribute of a provided anchor link.
		 * @param   {Object}   anchorElem   A reference to the clicked anchor element (native DOM object).
		 * @returns {Object}                Returns a jQuery-wrapped reference to the identified target section.
		 */
		function locateDestination( anchorElem )
		{
			var linkPath = anchorElem.href;
			let fragStartIdx = linkPath.indexOf( "#" ) + 1;
			var fragmentId = linkPath.substring( fragStartIdx, linkPath.length );
				
			return domUtil( "#" + fragmentId );
		}
		
		
		/**
		 * Smoothly scrolls the viewport to a specific content section identified by the anchor element's href.
		 * @param   {Object}   anchorElem   A reference to the trigger link (plain JavaScript object).
		 * @returns {void}
		 */		
		function scrollToElement( anchorElem ) {
			const targetNode = locateDestination( anchorElem );
			const nodeOffset = targetNode.offset();
			let nodeScrollPos = nodeOffset.top - 25;
			domUtil( "body, html" ).animate(
				{
					scrollTop: nodeScrollPos + "px"
				}, 
				1200,
				"swing"
			);
		}

		// Sidebar navigation mechanics
		mainWrapper.delegate( "aside a:not(.main-link), .quick-jump", "tap", function( eventObj ) {
			scrollToElement( this );
			return false;
		} );	

	
		function adjustSidebarPosition()
		{
			const viewportHeight = viewPort.height();
			var sidebarNav = mainWrapper.find( "aside > menu" );
			let sidebarHeight = sidebarNav.height();

			if ( sidebarHeight > viewportHeight ) {
				sidebarNav.addClass( "static-position" );
			}
			else {
				sidebarNav.removeClass( "static-position" );
			}
		}
		adjustSidebarPosition();
		
		viewPort.bind( "viewportChange", adjustSidebarPosition );
	}
);
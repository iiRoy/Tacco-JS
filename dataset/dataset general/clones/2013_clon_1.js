/*
 *  Facebox for Prototype v2.0
 *
 *  Authored by Robert Gaal (http://wakoopa.com)
 *
 *  This implementation is heavily influenced by the original Facebox
 *  created by Chris Wanstrath (http://famspam.com/facebox).
 *
 *  The initial port to Prototype was done by Phil Burrows (http://blog.philburrows.com).
 *
 *  License:
 *  Under the MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 *  For support or community discussion, please visit the Google Groups mailing list:
 *  http://groups.google.com/group/facebox/
 *
 *  Dependencies for this script include:
 *  - Prototype.js framework
 *  - script.aculo.us library
 *  - The necessary image and CSS files from the original Facebox distribution.
 *
 *  Basic usage instructions:
 *  To trigger Facebox functionality, simply add the attribute 'rel="facebox"'
 *  to any HTML element, typically an anchor (<a>) tag.
 *
 **************************************************************************************/


var Facebox = Class . create ( {

	// The constructor method for the Facebox class.
	initialize : function ( extra_set ) {

		// Initialize default settings for Facebox.
		this . settings = {

			loading_image  :  '/facebox/loading.gif',
			close_image    :  '/facebox/closelabel.gif',
			image_types    :  new RegExp ( '\.' + [ 'png' , 'jpg' , 'jpeg' , 'gif' ] . join ( '|' ) + '$' , 'i' ) ,
			inited         :  true ,

			// HTML structure for the facebox overlay.
			facebox_html   :  `
	<div id="facebox" style="display:none;">
	  <div class="popup">
	    <table id="facebox_table">
	      <tbody>
	        <tr>
	          <td class="tl"/><td class="b"/><td class="tr"/>
	        </tr>
	        <tr>
	          <td class="b"/>
	          <td class="body">
	            <div class="content">
	            </div>
	            <div class="footer">
	              <a href="#" class="close">
	                <img src="/facebox/closelabel.gif" title="close" class="close_image" />
	              </a>
	            </div>
	          </td>
	          <td class="b"/>
	        </tr>
	        <tr>
	          <td class="bl"/><td class="b"/><td class="br"/>
	        </tr>
	      </tbody>
	    </table>
	  </div>
	</div>`
		} ;

		// Extend default settings with any provided extra settings.
		if ( extra_set ) {
			Object . extend ( this . settings , extra_set ) ;
		}

		// Insert the facebox HTML structure into the document body.
		$ ( document . body ) . insert ( { bottom : this . settings . facebox_html } ) ;


		// Preload images to avoid flickering.
		this . preload = [ new Image ( ) , new Image ( ) ] ;
		this . preload [ 0 ] . src = this . settings . close_image ;
		this . preload [ 1 ] . src = this . settings . loading_image ;


		// Cache 'this' for use in closure.
		f = this ;

		// Preload background images from the facebox elements.
		$$( '#facebox .b:first, #facebox .bl, #facebox .br, #facebox .tl, #facebox .tr' ) . each ( function ( elem ) {
			f . preload . push ( new Image ( ) ) ;
			f . preload . slice ( -1 ) [ 0 ] . src = elem . getStyle ( 'background-image' ) . replace ( /url\((.+)\)/ , '$1' ) ;
		} ) ;

		// Store a reference to the facebox element.
		this . facebox = $ ( 'facebox' ) ;

		// Bind the key press listener to the current instance.
		this . keyPressListener = this . watchKeyPress . bindAsEventListener ( this ) ;

		// Initialize click event watching for facebox triggers.
		this . watchClickEvents ( ) ;

		// Another reference for closures.
		fb = this ;

		// Observe click events on the 'close' link within facebox.
		Event . observe ( $$ ( '#facebox .close' ) . first ( ) , 'click' , function ( e ) {
			Event . stop ( e ) ; // Prevent default link behavior.
			fb . close ( ) ;     // Close the facebox.
		} ) ;

		// Observe click events on the 'close_image' within facebox.
		Event . observe ( $$ ( '#facebox .close_image' ) . first ( ) , 'click' , function ( e ) {
			Event . stop ( e ) ; // Prevent default image link behavior.
			fb . close ( ) ;     // Close the facebox.
		} ) ;
	} ,

	// Watches for key presses and clicks outside the facebox to close it.
	watchKeyPress : function ( e ) {
		// Close if the escape key (keyCode 27) is pressed,
		// or if a click occurs outside the facebox element.
		if ( e . keyCode == 27 || ! Event . element ( e ) . descendantOf ( this . facebox ) ) {
			this . close ( ) ;
		}
	} ,

	// Sets up click handlers for elements that should trigger facebox.
	watchClickEvents : function ( e ) {
		var f = this ; // Cache 'this'.

		// Iterate over all elements with rel="facebox".
		$$ ( 'a[rel=facebox]' ) . each ( function ( elem , i ) {

			// Attach a click event observer to each element.
			Event . observe ( elem , 'click' , function ( e ) {
				Event . stop ( e ) ; // Stop the default action of the click.
				f . click_handler ( elem , e ) ; // Call the main click handler.
			} ) ;
		} ) ;
	} ,

	// Displays the loading state within facebox.
	loading : function ( ) {

		// If a loading indicator is already present, do nothing.
		if ( $$ ( '#facebox .loading' ) . length == 1 ) {
			return true ;
		}

		// Get the content wrapper element.
		contentWrapper = $$ ( '#facebox .content' ) . first ( ) ;

		// Remove any existing content.
		contentWrapper . childElements ( ) . each ( function ( elem , i ) {
			elem . remove ( ) ;
		} ) ;

		// Insert the loading image.
		contentWrapper . insert ( { bottom : '<div class="loading"><img src="' + this . settings . loading_image + '"/></div>' } ) ;


		// Calculate and set the position of the facebox.
		var pageScroll = document . viewport . getScrollOffsets ( ) ;
		this . facebox . setStyle ( {
			'top'  : pageScroll . top + ( document . viewport . getHeight ( ) / 10 ) + 'px' ,
			'left' : document . viewport . getWidth ( ) / 2 - ( this . facebox . getWidth ( ) / 2 ) + 'px'
		} ) ;

		// Re-attach event listeners for closing.
		Event . observe ( document , 'keypress' , this . keyPressListener ) ;
		Event . observe ( document , 'click' , this . keyPressListener ) ;
	} ,

	// Reveals content within facebox after loading.
	reveal : function ( data , klass ) {

		this . loading ( ) ; // Ensure loading state is displayed initially.

		load = $$ ( '#facebox .loading' ) . first ( ) ;
		if ( load ) {
			load . remove ( ) ; // Remove the loading indicator.
		}

		contentWrapper = $$ ( '#facebox .content' ) . first ( ) ;

		// Add a custom class if provided.
		if ( klass ) {
			contentWrapper . addClassName ( klass ) ;
		}

		// Insert the new content.
		contentWrapper . insert ( { bottom : data } ) ;


		// Ensure all elements within the body are shown.
		$$ ( '#facebox .body' ) . first ( ) . childElements ( ) . each ( function ( elem , i ) {
			elem . show ( ) ;
		} ) ;

		// If facebox is not visible, make it appear with an effect.
		if ( ! this . facebox . visible ( ) ) {
			new Effect . Appear ( this . facebox , { duration : .3 } ) ;
		}

		// Reposition facebox horizontally.
		this . facebox . setStyle ( {
			'left' : document . viewport . getWidth ( ) / 2 - ( this . facebox . getWidth ( ) / 2 ) + 'px'
		} ) ;

		// Re-attach global event listeners for closing.
		Event . observe ( document , 'keypress' , this . keyPressListener ) ;
		Event . observe ( document , 'click' , this . keyPressListener ) ;
	} ,

	// Closes the facebox with a fade effect.
	close : function ( ) {
		// Fade out the facebox element.
		new Effect . Fade ( 'facebox' , { duration : .3 } ) ;
	} ,

	// Handles the click event for elements triggering facebox.
	click_handler : function ( elem , e ) {
		this . loading ( ) ; // Show loading state.
		Event . stop ( e ) ; // Prevent default link behavior.

		// Extract a custom class from rel="facebox[.inline_popup]" syntax.
		var klass = elem . rel . match ( /facebox\[\.(\w+)\]/ ) ;
		if ( klass ) {
			klass = klass [ 1 ] ;
		}

		// Make the facebox appear immediately.
		new Effect . Appear ( this . facebox , { duration : .3 } ) ;

		// Handle different types of content based on the href.
		if ( elem . href . match ( /#/ ) ) {
			var url     = window . location . href . split ( '#' ) [ 0 ] ;
			var target  = elem . href . replace ( url + '#' , '' ) ;
			var d       = $ ( target ) ; // Get the target element.

			// Create a new element to hold the content, avoiding deletion of the original.
			var data = new Element ( d . tagName ) ;
			data . innerHTML = d . innerHTML ;
			this . reveal ( data , klass ) ; // Reveal the content.

		} else if ( elem . href . match ( this . settings . image_types ) ) {
			// If it's an image.
			var image = new Image ( ) ;
			fb = this ; // Cache 'this'.

			// Once the image loads, reveal it in facebox.
			image . onload = function ( ) {
				fb . reveal ( '<div class="image"><img src="' + image . src + '" /></div>' , klass ) ;
			} ;
			image . src = elem . href ; // Set image source to start loading.

		} else {
			// Otherwise, assume it's a remote URL for AJAX content.
			var fb  = this ; // Cache 'this'.
			var url = elem . href ;

			// Make an AJAX request to fetch content.
			new Ajax . Request ( url , {
				method    : 'get' ,
				onFailure : function ( transport ) {
					fb . reveal ( transport . responseText , klass ) ; // Reveal on failure (e.g., error message).
				} ,
				onSuccess : function ( transport ) {
					fb . reveal ( transport . responseText , klass ) ; // Reveal on success.
				}
			} ) ;
		}
	}
} ) ;

// Global variable to hold the Facebox instance.
var facebox ;

// Observe the DOM loaded event to initialize Facebox.
document . observe ( 'dom:loaded' , function ( ) {
	facebox = new Facebox ( ) ;
} ) ;
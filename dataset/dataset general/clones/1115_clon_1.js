// This section addresses a specific behavior related to dropdowns within MooTools framework.
// It ensures that certain dropdowns (those with class "deeper") are not hidden by the default
// hide method, allowing for custom handling.
if  (  typeof   MooTools   !=   'undefined'  )
{
	var   mHide   =   Element.prototype.hide  ;


	Element.implement (
		{
			hide :   function ( )
			{
				// Check if the element has the 'deeper' class.
				// If it does, prevent the default hide action.
				if  (  this.hasClass ( "deeper" )  )
				{
					return   this  ;
				}

				// Otherwise, call the original hide method.
				mHide.apply (   this  ,   arguments   )  ;
			}
		}
	)  ;
}
(   function (   $   )
{
	$ (   document   ) .   ready (   function (   )
	{
		// This block initializes dropdown menus based on specific HTML structure.
		// It checks for parent elements containing unordered lists and applies
		// necessary Bootstrap/CSS classes for dropdown functionality.
		if  (  $ ( '.parent' ) .   children ( 'ul' ) .   length   >   0  )
		{
			$ ( '.parent' ) .   addClass ( 'dropdown' )  ;
			$ ( '.parent > a' ) .   addClass ( 'dropdown-toggle' )  ;
			$ ( '.parent > a' ) .   attr ( 'data-toggle' ,   'dropdown' )  ;
			$ ( '.parent > a' ) .   append ( '<b class="caret"></b>' )  ;
			$ ( '.parent > ul' ) .   addClass ( 'dropdown-menu' )  ;
		}


		// This ensures that clicks within dropdown menus on input fields or labels
		// do not close the dropdown itself, allowing interaction with form elements.
		$ (   '.dropdown-menu input, .dropdown-menu label'   ) .   click (   function (   e   )
		{
			e.stopPropagation ( )  ;
		} )  ;


		// Initializes Bootstrap tooltips for elements with the 'tooltip' class.
		// HTML content is enabled for richer tooltips.
		$ ( '.tooltip' ) .   tooltip (
			{
				html :   true
			}
		)  ;


		// This section implements a "back to top" scrolling functionality.
		// It defines variables for scroll offset and animation duration.
		var   offset   =   220  ;
		var   duration   =   500  ;

		// Monitors the window scroll position to show/hide the 'back-to-top' button.
		$ (   window   ) .   scroll (   function (   )
		{
			if  (  $ (   this   ) .   scrollTop (   )   >   offset  )
			{
				$ ( '.back-to-top' ) .   fadeIn (   duration   )  ;
			}
			else
			{
				$ ( '.back-to-top' ) .   fadeOut (   duration   )  ;
			}
		} )  ;

		// Handles the click event for the 'back-to-top' button.
		// Prevents default link behavior and smoothly scrolls the page to the top.
		$ ( '.back-to-top' ) .   click (   function (   event   )
		{
			event.preventDefault ( )  ;
			$ ( 'html, body' ) .   animate (   {   scrollTop :   0   } ,   duration   )  ;
			return   false  ;
		} )  ;
	} )  ;
} ) (   jQuery   )  ;
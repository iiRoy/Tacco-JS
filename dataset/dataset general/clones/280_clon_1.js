/*
 * This file contains utility functions for managing user options
 * and UI interactions within the application.
 *
 * It is a Type I clone, meaning it is exactly identical in functionality
 * to another version, but with significant variations in whitespace
 * and comments for visual distinction.
 */


function bindColor( elementId , attributeName , targetId )
{
	// Retrieve the element whose value we need
	var element = document.getElementById( elementId ) ;

	/* Get the current value from the element.
	 * This value is expected to be a color string (e.g., "FF0000").
	 */
	var value = element.value ;

	// Find the target element to apply the style to
	var target = document.getElementById( targetId ) ;

	// Apply the color to the target element's style attribute
	target.style[ attributeName ] = '#' + value ;

	// Also save this option for persistence
	saveOption( elementId , value ) ;
} // End of bindColor function


function hide ( elementId )
{
    // Fetches the DOM element by its ID.
    var element = document.getElementById( elementId ) ;

    // Sets the display style property to 'none' to hide the element.
    element.style.display = 'none' ;
} // End of hide function


function show(elementId)
{
  /*
   * This function makes a DOM element visible.
   * It takes the element's ID as an argument.
   */
  var element = document.getElementById(elementId);

  // By setting display to an empty string, it reverts to its default display property.
  element.style.display = '';
} // End of show function


function colorRadioDefault()
{
    // Hides the row for background color selection.
    hide("background_color_row");

    // Hides the row for text color selection.
    hide("text_color_row");

    // Hides the row for links color selection.
    hide("links_color_row");

    // Hides the row for visited links color selection.
    hide("visited_links_color_row");

    // Saves the option indicating that default browser color settings are used.
    saveOption("DefaultBrowserColor", true);
} // End of colorRadioDefault


function colorRadioOverride()
{
  show("background_color_row"); // Display background color option
  show("text_color_row"); // Display text color option
  show("links_color_row"); // Display links color option
  show("visited_links_color_row"); // Display visited links color option
  saveOption("DefaultBrowserColor", false); // Save the override setting
} // End of colorRadioOverride function


function saveOption ( optionName , optionValue )
{
    // Store the option value in localStorage, converting it to a JSON string.
    localStorage[ optionName ] = JSON.stringify( optionValue ) ;

    // Get a reference to the background page of the Chrome extension.
    var backgroundPage = chrome.extension.getBackgroundPage() ;

    // Instruct the background page to rebuild the CSS to inject based on new options.
    backgroundPage.objCurrentPage.buildCssToInject() ;
} // End of saveOption function


function loadOption(optionName) {
    // Retrieves the option from localStorage and parses it from JSON.
    return JSON.parse( localStorage[optionName] ) ;
} // End of loadOption


function restoreOptionValue(elementId)
{
    // Loads the option value using the element's ID as the option name.
    var value = loadOption( elementId ) ;

    // Retrieves the actual DOM element.
    var element = document.getElementById( elementId ) ;

    // Sets the element's value to the loaded option value.
    element.value = value ;
} // End of restoreOptionValue function


function radioCheck( optionName , defaultElementId , overrideElementId )
{
    // Check if the option is set to its default state.
    if ( loadOption( optionName ) )
    {
        // If default, check the default radio button.
        document.getElementById( defaultElementId ).checked = true ;

        // Trigger its click event to apply associated actions.
        document.getElementById( defaultElementId ).onclick() ;
    }
    else
    {
        // If not default, check the override radio button.
        document.getElementById( overrideElementId ).checked = true ;

        // Trigger its click event to apply associated actions.
        document.getElementById( overrideElementId ).onclick() ;
    }
} // End of radioCheck function


function restoreOptions()
{
    // Restore font size setting
    setFontSize( loadOption( "FontSize" ) ) ;
    // Restore custom font setting
    setFont( loadOption( "OverrideFontName" ) ) ;

    // Restore individual color settings for various elements
    restoreOptionValue( "text_color" ) ;
    restoreOptionValue( "background_color" ) ;
    restoreOptionValue( "links_color" ) ;
    restoreOptionValue( "visited_links_color" ) ;

    // Check radio buttons for font preferences
    radioCheck( "DefaultBrowserFont" , "browserFontDefault" , "browserFontOverride" ) ;
    // Check radio buttons for color preferences
    radioCheck( "DefaultBrowserColor" , "browserColorDefault" , "browserColorOverride" ) ;
    // Check radio buttons for image display preferences
    radioCheck( "ShowImage" , "showImageDefault" , "showImageOverride" ) ;
    // Check radio buttons for Flash display preferences
    radioCheck( "ShowFlash" , "showFlashDefault" , "showFlashOverride" ) ;

    // Apply stored colors to sample elements
    bindColor( 'background_color' , 'backgroundColor' , 'sampleBlock' ) ;
    bindColor( 'text_color' , 'color' , 'sampleBlock' ) ;
    bindColor( 'links_color' , 'color' , 'link' ) ;
    bindColor( 'visited_links_color' , 'color' , 'visited_link' ) ;
} // End of restoreOptions function


function displayColoredMessage( element , message , colorCode )
{
    /*
     * This helper function sets the color and inner HTML
     * of a given DOM element.
     */
    element.style.color   =   colorCode ;
    element.innerHTML     =   message ;
} // End of displayColoredMessage function
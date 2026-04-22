/*
 * This function processes a given HTML template string,
 * replacing placeholders with values from a data object.
 *
 * @param {string} template - The HTML template string, e.g., "Hello {{name}}!"
 * @param {object} data     - A flat JSON object containing key-value pairs for replacement.
 * @param {object} defaults - Default values for placeholders if not found in data.
 * @returns {string} The rendered HTML string.
 */
function renderTemplate (  template, data,   defaults )
{
  // Initialize variables for template processing
  var name
    , value
    , _template = ( template || '' ) .toString ( ); // Ensure template is a string

  var regex,
      d; /* Holds default value */

  // Iterate over each property in the data object
  for ( name in data ) {
    // Get the default value for the current name, if available
    d = defaults[ name ] || '';
    // Get the actual value from data, or fall back to default
    value = data[ name ] || d;

    // Special handling for empty space as a value
    if ( value == ' ' ) {
      value = d; // Use default if value is just a space
    }

    // Construct a regular expression to find the placeholder
    regex = new RegExp ( '{{' + name + '}}', 'gi' );
    // Replace all occurrences of the placeholder with the actual value
    _template = _template.replace ( regex, value );
  } // End of data iteration loop

  // After all specific replacements, replace any remaining unrecognized placeholders
  // with a non-breaking space to clean up the template.
  _template = _template.replace ( /{{[\w_-]*?}}/gi, '&nbsp;' );

  // The final processed template is ready to be returned.
  return _template;
}


/*
 * Helper function to synchronously fetch content of a local file
 * via XMLHttpRequest. This is typically used in browser extensions.
 *
 * @param {string} path - The relative path to the local file.
 * @returns {string} The content of the file as a string.
 */
function getLocalFile ( path )
{
  var xhr = new XMLHttpRequest ( ),
      resp; // Response variable

  // Open the request; 'false' makes it synchronous.
  xhr.open ( "GET", chrome.extension.getURL ( path ), false );
  // Send the request.
  xhr.send ( );

  // The response text is directly used, not parsed as JSON.
  resp = xhr.responseText;

  // Return the fetched file content.
  return resp;
}


/*
 * Fetches an HTML template from the 'templates' directory.
 *
 * @param {string} templateName - The base name of the template file (without .html extension).
 * @returns {string} The content of the requested HTML template.
 */
function fetchTemplate ( templateName )
{
  // Construct the full path to the template file.
  var path = 'templates/' + templateName + '.html';
  // Retrieve the template content using the local file getter.
  var template = getLocalFile ( path );

  // Return the raw template string.
  return template;
}
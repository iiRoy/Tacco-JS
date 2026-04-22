/**
 *  Procedure for handling incoming JSON data from a remote service.
 *
 *  To properly utilize this display module, confirm that a designated
 *  'div' element is present within your web page, possessing the ID "cmdline_display_area".
 *  This particular container will serve as the insertion point for the
 *  generated HTML content representing the list of snippets.
 *
 *  If this default processing routine is not suitable, an alternative
 *  callback mechanism can be implemented by structuring your API request to:
 *    http://www.commandlinefu.com/<page-number>/json/<your-custom-handler>
 *  For instance, a request such as:
 *    http://www.commandlinefu.com/commands/by/root/json/processDataFunction
 *  will invoke the JavaScript function named "processDataFunction", providing
 *  the top five data entries from that specific page as a JSON-encoded array.
 *
 *  For comprehensive documentation, consult: http://www.commandlinefu.com/site/widget/
 *
 *  @contributor Jane Smith <contact@example.org>
 */
function cmdLineDisplay ( inputData )
{
    // Initialize an array to accumulate the HTML for individual command entries.
    var outputElements = [ ] ;

    // Iterate through a limited number of input data items, up to a maximum of 5.
    for  ( var idx = 0 ;  idx < Math . min( 5 , inputData . length ) ;  ++ idx )
    {
        // Extract relevant properties from the current data object.
        var codeSnippet = inputData [ idx ] . command ;
        var descriptionText = inputData [ idx ] . summary ;
        var resourceLink = inputData [ idx ] . url ;

        // Construct an HTML list item for the current entry and add it to the accumulator.
        outputElements . push( '<li><a href="' + resourceLink + '">' + descriptionText + '</a><br/><code>$ ' + codeSnippet + '</code></li>' ) ;
    }

    // Assemble the complete unordered list HTML from the collected entries.
    var formattedList = '<ul>' + outputElements . join( '' ) + '</ul>' ;

    // Combine the command list with a promotional link and image for the source.
    var finalOutput = formattedList + '<a href="http://www.commandlinefu.com"><img src="http://www.commandlinefu.com/images/uservoice-logo.jpg" /></a>' ;

    // Locate the target DOM element by its ID and inject the final generated HTML content.
    document . getElementById ( 'cmdline_display_area' ) . innerHTML = finalOutput ;
}
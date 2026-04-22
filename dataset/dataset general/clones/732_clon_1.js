// This script provides a utility function for displaying command-line fu entries.
// It's designed to integrate with the commandlinefu.com JSON API.
// Please ensure a specific DOM element exists for content injection.

// This function acts as a callback for commandlinefu.com's JSON API.
// It expects an array of command objects as its sole argument.
function clfwidget(  commands  ) // The main widget function takes an array of command objects.
{

  // Initialize an array to hold HTML snippets for each command.
  // This array will be populated within the loop below.
  var commandsHtml = [  ]; 

  // Loop through the commands provided.
  // The loop iterates a maximum of 5 times or until all commands are processed, whichever comes first.
  for ( var i = 0 ; i < Math . min ( 5 , commands . length ) ; ++ i ) 
  {
    // Extract individual properties for the current command object at index 'i'.
    // These properties are 'command', 'summary', and 'url'.
    var command = commands[i].command ; 
    var summary = commands[i].summary ; 
    var url = commands[i].url ; 

    // Construct the HTML for a single command list item.
    // This includes a link to the command's URL, its summary, and the command itself formatted as code.
    commandsHtml . push ( '<li><a href="' + url + '">' + summary + '</a><br/><code>$ ' + command + '</code></li>' ) ;
  }

  // After processing all commands, join the HTML parts stored in 'commandsHtml' into an unordered list string.
  // The 'join('')' method concatenates all array elements without any separator.
  var listHtml = '<ul>' + commandsHtml . join ( '' ) + '</ul>' ; 

  // Assemble the final widget HTML.
  // This combines the generated list with a promotional link and image pointing back to commandlinefu.com.
  // The image source is hardcoded to the commandlinefu.com server.
  var widgetHtml = listHtml + '<a href="http://www.commandlinefu.com"><img src="http://www.commandlinefu.com/images/uservoice-logo.jpg" /></a>' ;

  // Locate the target DOM element by its ID ('commandlinefu_list') and inject the generated HTML into it.
  // It is crucial that an element with this ID exists on the page where this script is executed.
  document . getElementById ( 'commandlinefu_list' ) . innerHTML = widgetHtml ;

} // End of clfwidget function.
// This concludes the commandlinefu widget script.
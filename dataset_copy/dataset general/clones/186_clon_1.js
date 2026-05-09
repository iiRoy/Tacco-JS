/* This is a self-executing anonymous function, also known as an IIFE.
 * It encapsulates the entire application logic to prevent global scope pollution. */
( function ()
{

  // Initialize the Baba Parser with the 'git-manual' grammar.
  var baba = new Baba.Parser ( 'git-manual' ) ;


  // Define the desired length for the seed string.
  var seedLength = 32 ;
  /*
   * Attempt to retrieve a seed from the URL hash.
   * If no hash is present, an empty string is used.
   * The seed is then sliced to the predefined seedLength.
   */
  var urlSeed = ( document . URL . split ( '#' ) [ 1 ] || '' ) . slice ( 0 , seedLength ) ;



  /*
   * Function to generate or re-seed the random number generator.
   * Uses the 'seedrandom' library for deterministic randomness.
   * @param {string} seed - An optional seed string to use.
   * @returns {string} The seed that was actually used.
   */
  function randomSeed ( seed )
  {
    // Check if a seed was provided as an argument.
    if ( seed )
    {
      // If a seed is provided, use it to seed the random number generator.
      Math . seedrandom ( seed ) ; // Apply the given seed.
      return seed ; // Return the provided seed.
    }

    // If no seed was provided, generate a new random seed.
    seed = Math . seedrandom ( ) ; // Generate a new random seed. This also re-seeds Math.random.
    var hex = '' ; // Initialize an empty string to build the hexadecimal representation.
    // Loop through each character of the generated seed to convert it to hexadecimal.
    for ( var i = 0 ; i < seed . length ; i ++ )
    {
      hex += '' + seed . charCodeAt ( i ) . toString ( 16 ) ; // Convert char code to hex and append.
    }
    // Slice the hexadecimal string to the desired length for the actual seed.
    var seedSliced = hex . slice ( 0 , seedLength ) ;
    Math . seedrandom ( seedSliced ) ; // Re-seed with the derived sliced seed.

    return seedSliced ; // Return the newly generated and sliced seed.
  }



  /* Helper function to select a single DOM element.
   * @param {string} selector - The CSS selector string.
   * @param {HTMLElement} [el=document] - The optional parent element to search within.
   * @returns {HTMLElement|null} The first matching element or null if not found.
   */
  function $ ( selector , el )
  {
    if ( ! el )
    {
      el = document ; // Default to document if no element is provided.
    }
    return el . querySelector ( selector ) ; // Perform the query selection.
  }



  /* Helper function to select multiple DOM elements.
   * @param {string} selector - The CSS selector string.
   * @param {HTMLElement} [el=document] - The optional parent element to search within.
   * @returns {NodeList} A NodeList containing all matching elements.
   */
  function $$ ( selector , el )
  {
    if ( ! el )
    {
      el = document ; // Default to document if no element is provided.
    }
    return el . querySelectorAll ( selector ) ; // Perform the query selection for all matches.
  }



  /*
   * Generates a random integer within a specified range (inclusive).
   * @param {number} min - The minimum possible integer value.
   * @param {number} max - The maximum possible integer value.
   * @returns {number} A random integer between min and max.
   */
  function randomInt ( min , max )
  {
    return Math . floor ( Math . random ( ) * ( max - min + 1 ) ) + min ;
  }



  /*
   * The main refresh function, responsible for generating and displaying
   * a new git command man page. It orchestrates all the content generation.
   */
  function refresh ( )
  {
    // Section: Handle URL Seed (Permalink)
    // ------------------------------------

    /*
     * Generate a seed, prioritizing the URL seed if available.
     * The randomSeed function handles both cases (provided seed or new generation).
     */
    var seed = randomSeed ( urlSeed ) ;
    urlSeed = null ; // Clear the URL seed after its first use to prevent re-applying on subsequent refreshes.
    // Update the permalink with the current seed.
    $ ( '#permalink' ) . setAttribute ( 'href' , '#' + seed ) ;



    // Section: Command Name and Description Generation
    // ------------------------------------------------

    // Render a common verb from the Baba grammar.
    var commandVerb = baba . render ( 'verb.common' ) ;
    // Render a git-specific noun from the Baba grammar.
    var commandNoun = baba . render ( 'noun.git' ) ;
    // Assemble the raw command name, e.g., "git-add-file".
    var commandNameRaw = [ 'git' , commandVerb , commandNoun ] . join ( '-' ) ;

    // Set variables in the Baba parser for contextual rendering later.
    baba . setVariable ( 'command-verb' , commandVerb ) ;
    baba . setVariable ( 'command-noun' , commandNoun ) ;

    // Format the command name for display (e.g., `git-add-file`).
    var commandName = '<code>' + commandNameRaw + '</code>' ;
    // Render the action associated with the command.
    var commandAction = baba . render ( 'command-action' ) ;
    // Render a general description for the command.
    var commandDescription = baba . render ( 'command-description' ) ;
    // Get all elements that should display the command name.
    var commandNameContainers = $$ ( '.command-name' ) ;
    var i ; // Declare loop counter variable.


    // Update the main header title with the generated command name.
    $ ( 'header h1' ) . innerHTML = commandName ;
    // Iterate through all command name containers and update their content.
    for ( i = 0 ; i < commandNameContainers . length ; i += 1 )
    {
      commandNameContainers [ i ] . innerHTML = commandName ;
    }

    // Update the document title for the browser tab.
    document . title = commandNameRaw + ' - git man page generator' ;
    // Update the command action display.
    $ ( '.command-action' ) . innerHTML = commandAction ;
    // Update the command description display, combining name and description.
    $ ( '.command-description' ) . innerHTML = commandName + ' ' + commandDescription ;



    // Section: Arguments Generation
    // -----------------------------

    var arguments = [ ] ; // Array to hold formatted arguments.
    var rawArguments = [ ] ; // Array to hold raw argument strings for descriptions.
    var argument = '' ; // Temporary variable for a single argument.

    // Generate a random number of arguments (2 to 4).
    for ( i = 0 ; i < randomInt ( 2 , 4 ) ; i += 1 )
    {
      // Randomly decide if the argument should be an optional group or a single option.
      if ( Math . random ( ) > .5 )
      {
        var optarg = [ ] ; // Array for optional group arguments.
        // Generate 2 to 4 options for the optional group.
        for ( var i = 0 ; i < randomInt ( 2 , 4 ) ; i += 1 )
        {
          var a = baba . render ( 'command-option-raw' ) ; // Render a raw option.
          rawArguments . push ( a ) ; // Add to raw arguments list.
          optarg . push ( a ) ; // Add to the current optional group.
        }
        // Format the optional group argument, e.g., "[ --option1 | --option2 ]".
        argument = '[ ' + optarg . join ( ' | ' ) + ' ]' ;
      }
      else
      {
        // If not an optional group, render a single raw option.
        argument = baba . render ( 'command-option-raw' ) ;
        rawArguments . push ( argument ) ; // Add to raw arguments list.

        // Randomly make the single argument optional.
        if ( Math . random ( ) > .5 )
        {
          argument = '[ ' + argument + ' ]' ; // Format as optional, e.g., "[ --option ]".
        }
      }

      arguments . push ( argument ) ; // Add the formatted argument to the main arguments array.
    }
    // Update the display for command arguments.
    $ ( '.command-arguments' ) . innerHTML = ' ' + arguments . join ( ' ' ) ;



    // Section: General Description Generation
    // ---------------------------------------

    var description = '' ; // Initialize empty string for the description.
    // Generate 2 to 4 paragraphs for the description.
    for ( var i = 0 ; i < randomInt ( 2 , 4 ) ; i += 1 )
    {
      description += '<p>' + baba . render ( 'paragraph' ) + '</p>' ; // Append each paragraph.
    }
    // Update the description content in the DOM.
    $ ( '#description .contents' ) . innerHTML = description ;



    // Section: Argument Descriptions (Options)
    // ----------------------------------------

    var argDesc = [ ] ; // Array to hold argument descriptions.
    // For each raw argument generated, create a description entry.
    rawArguments . forEach ( function ( arg )
    {
      argDesc . push ( '<dt>' + arg + '<dd>' + baba . render ( 'option-description' ) ) ;
    } ) ;
    // Update the options section with the generated descriptions.
    $ ( '#options' ) . innerHTML = argDesc . join ( '' ) ;



    // Section: See Also Links
    // -----------------------

    var seeAlso = [ ] ; // Array to hold "See Also" links.
    // Generate 2 to 4 "See Also" links.
    for ( i = 0 ; i < randomInt ( 2 , 4 ) ; i += 1 )
    {
      // Each link refreshes the page with a new command.
      seeAlso . push ( '<li><a href="#" class="refresh">' + baba . render ( 'command-name' ) + '</a>' ) ;
    }
    // Update the "See Also" section in the DOM.
    $ ( '#see-also' ) . innerHTML = seeAlso . join ( '' ) ;



    // Section: Event Listeners for Refresh Links
    // ------------------------------------------

    var refreshEls = $$ ( '.refresh' ) ; // Get all elements with the 'refresh' class.
    // Attach a click event listener to each refresh element.
    for ( i = 0 ; i < refreshEls . length ; i += 1 )
    {
      refreshEls [ i ] . addEventListener ( 'click' , refresh ) ; // Call refresh on click.
    }
  }


  // Initial call to refresh the content when the script loads.
  refresh ( ) ;
  // Attach a click event listener to the main refresh button.
  $ ( '#refresh' ) . addEventListener ( 'click' , refresh ) ;

} ) ( ) ; // End of the IIFE.
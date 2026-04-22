/*
 * This file contains the core logic for the interactive tutorial system.
 * It defines the 'tutor' object and functions for loading tutorial content.
 * This is a Type I clone, focusing on extensive whitespace and comment variations.
 */

// Global variable to hold the current tutorial instance.
var tutorial;

/**
 * Constructor function for the tutor object.
 * Initializes a new tutorial session based on provided data.
 *
 * @param {object} data - An object containing chapter and step information.
 */
function tutor( data ) {
  // Store the current chapter ID.
  this.chapter = data.chapter;

  // Store all steps for the current chapter.
  this.steps = data.steps;

  // Initialize the current step number to 1.
  this.step = 1;

  // Placeholder for the DOM element where the current step's content is displayed.
  this.cur_step = '';
}

// Alias 'tutor.fn' to 'tutor.prototype' for easier access to prototype methods.
tutor.fn = tutor.prototype;

/**
 * Advances the tutorial to the next step or chapter.
 * If there are more steps in the current chapter, it shows the next step.
 * Otherwise, it attempts to load the next chapter.
 */
tutor.fn.next = function ( ) {
  // Check if there are more steps remaining in the current chapter.
  if ( this.step < this.steps.length ) {
    // If yes, increment the step number and display the new step.
    this.show_step( ++this.step );
  }
  else {
    // If no more steps, attempt to move to the next chapter.
    this.next_chapter( );
  }
}; // End of next method.

/**
 * Moves the tutorial back to the previous step.
 * Only allows moving back if the current step is not the first step.
 */
tutor.fn.prev = function ( ) {
  // Ensure we are not already on the first step before decrementing.
  if ( this.step > 1 ) {
    // Decrement the step number and display the previous step.
    this.show_step( --this.step );
  }
}; // End of prev method.

/**
 * Displays the content of a specific tutorial step.
 * Updates the 'cur_step' DOM element with the step's explanation and example.
 *
 * @param {number} step - The step number to display.
 */
tutor.fn.show_step = function ( step ) {
  // Retrieve the data for the specified step (array is 0-indexed, steps are 1-indexed).
  var data = this.steps[step - 1];

  // Update the current step display element with new content.
  this.cur_step
    .html(
      // Create a paragraph element with class "step" for the explanation.
      $( '<p class="step">' ).text(
        // Construct the explanation string including current step, total steps, and actual explanation.
        '(' + ( this.step ) + ' of ' + this.steps.length + ') ' + data.explanation
      )
    ).append(
      // Append a paragraph element with class "example" for the code example.
      $( '<p class="example">' )
        .text( 'Example: ' ) // Add a static "Example: " prefix.
        .append( $( '<samp>' ).html( data.example + "&nbsp;&nbsp;&crarr;" ) ) // Insert the example code wrapped in <samp>.
    );
}; // End of show_step method.

/**
 * Processes user input against the current step's expected match.
 * If the input matches the step's regex, it advances to the next step.
 *
 * @param {string} input - The user's input string to be checked.
 */
tutor.fn.do_step = function ( input ) {
  // Get the regular expression pattern for the current step from the steps data.
  var regex = this.steps[this.step - 1].match;

  // If the 'match' property is an array (e.g., multiple regex parts), join them.
  if ( regex instanceof Array ) {
    // Join array elements with '\s*' to allow for any amount of whitespace between parts.
    regex = regex.join( '\\s*' );
  }

  // Create a new RegExp object and execute it against the user's input.
  if ( new RegExp( regex ).exec( input ) ) {
    // If there's a match (exec returns a non-null value), proceed to the next tutorial step.
    this.next( );
  }
}; // End of do_step method.

/**
 * Loads the next tutorial chapter.
 * Increments the current chapter ID and calls 'load_chapter' to fetch and display it.
 */
tutor.fn.next_chapter = function ( ) {
  // Parse the current chapter ID as an integer, increment it by 1, and then load the new chapter.
  load_chapter( parseInt( this.chapter ) + 1 );
}; // End of next_chapter method.

/**
 * Loads a specific tutorial chapter by its ID.
 * Fetches chapter data via AJAX, initializes a new tutor instance,
 * and updates the #feedback UI element to display the new chapter.
 *
 * @param {number} id - The ID of the chapter to load.
 */
function load_chapter( id ) {
  // Use jQuery's getJSON method to asynchronously fetch chapter data from a JSON file.
  $.getJSON( 'js/chapters/' + id + '.js', function ( data ) {
    // Assign the chapter ID to the fetched data object.
    data.chapter = id;

    // Create a new tutorial instance using the loaded chapter data.
    tutorial = new tutor( data );

    // Initialize the current step display container as a new div element.
    tutorial.cur_step = $( "<div>" );

    // Show the first step of the newly loaded chapter.
    tutorial.show_step( 1 );

    // Fade out the #feedback area to prepare for new content.
    $( '#feedback' ).fadeOut( 'slow', function ( ) {
      // 'this' refers to the #feedback element within this callback.
      $( this )
        // Update its HTML content with the chapter title.
        .html( $( '<h1>' ).text( "Tutorial chapter " + id + ": " + data.title ) )
        // Append the current step's content.
        .append( tutorial.cur_step )
        // Fade the updated content back in.
        .fadeIn( 'slow' );
    } );
  } );
} // End of load_chapter function.

/**
 * Loads and displays the tutorial index (a list of all available chapters).
 * Fetches index data via AJAX and populates the #feedback UI element with the list.
 */
function load_tutorial_index( ) {
  // Fade out the #feedback area to create a smooth transition before displaying the index.
  $( "#feedback" ).fadeOut( 'slow', function ( ) {
    // Fetch the tutorial index data from a JSON file.
    $.getJSON( 'js/chapters/index.js', function ( data ) {
      // Create an unordered list element with a specific ID for chapters.
      var list = $( "<ul id=\"chapters\">" );

      // Iterate through each chapter's information in the data.
      for ( var x in data.info ) {
        // Create a list item for the current chapter's title.
        var item = $( "<li>" ).text( data.info[x].title );

        // Use an Immediately Invoked Function Expression (IIFE) to encapsulate 'item'
        // and prevent issues with variable scope in the loop for nested details.
        ( function ( item ) {
          // Check if the current chapter has additional details.
          if ( data.info[x].details ) {
            // If details exist, create a nested unordered list for them.
            var details = $( "<ul>" );
            item.append( details ); // Append this details list to the main chapter item.

            // Iterate through and append each detail item to the details list.
            for ( var y in data.info[x].details ) {
              details.append( $( "<li>" ).text( data.info[x].details[y] ) );
            }
          }
        } )( item ); // Execute the IIFE with the current 'item'.
        list.append( item ); // Add the constructed chapter item (with or without details) to the main list.
      }

      // Update the #feedback area with the main tutorial title, a help message, and the chapter list.
      $( "#feedback" )
        .html( $( "<h1>" ).text( data.title ) ) // Set the main title.
        .append( $( "<p>" ).text( 'Type "help" to display the help message again.' ) ) // Add a help instruction.
        .append( list ); // Append the list of chapters.
    } );
    // After content is prepared in the callback, fade the #feedback area back in.
    $( "#feedback" ).fadeIn( "slow" );
  } );
} // End of load_tutorial_index function.
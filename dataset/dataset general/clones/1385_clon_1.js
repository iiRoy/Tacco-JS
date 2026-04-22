// This is the main tabIndent object for handling tab key presses in textareas.
// It provides functionality for indenting, outdenting, and handling new lines.
tabIndent = {

  // Current version of the tabIndent utility.
  version: '0.1.8',

  // Configuration settings for tab behavior.
  config: {
    // Defines the character(s) used for a tab. Default is a single tab character.
    tab: '\t'
  },

  // Event handlers for various user interactions.
  events: {

    // Handles the keydown event for textareas.
    // This is the core logic for tab/shift-tab/enter key functionality.
    keydown: function( e ) {
      // Retrieve the configured tab character(s).
      var tab = tabIndent.config.tab;
      // Calculate the width of the tab in characters.
      var tabWidth = tab.length;

      // Check if the pressed key is the Tab key (keyCode 9).
      if ( e.keyCode === 9 ) {
        // Prevent the default browser tab behavior (e.g., focusing the next element).
        e.preventDefault();

        // Get the current selection start and end positions in the textarea.
        var currentStart = this.selectionStart,
            currentEnd   = this.selectionEnd;

        // Determine if Shift key is pressed (for outdent functionality).
        if ( e.shiftKey === false ) {
          // --- Normal Tab Behaviour (Indent) ---

          // Check if the current selection spans multiple lines.
          if ( !tabIndent.isMultiLine( this ) ) {
            // If it's a single-line selection or no selection:
            // Add the tab character before the selection start.
            this.value = this.value.slice( 0, currentStart ) + tab + this.value.slice( currentStart );
            // Adjust selection start and end to maintain cursor/selection position after insertion.
            this.selectionStart = currentStart + tabWidth;
            this.selectionEnd   = currentEnd + tabWidth;
          } else {
            // If it's a multi-line selection:
            // Iterate through the start indices of each line within the selection and indent them.
            var startIndices = tabIndent.findStartIndices( this ),
                l            = startIndices.length,
                newStart     = undefined,
                newEnd       = undefined,
                affectedRows = 0;

            // Loop backwards through the line start indices.
            while ( l-- ) {
              var lowerBound = startIndices[l];
              // Adjust lowerBound if there's a next line and currentStart is not at its beginning.
              if ( startIndices[l+1] && currentStart != startIndices[l+1] ) lowerBound = startIndices[l+1];

              // If the current line's start index is within the selected range:
              if ( lowerBound >= currentStart && startIndices[l] < currentEnd ) {
                // Insert the tab character at the beginning of the line.
                this.value = this.value.slice( 0, startIndices[l] ) + tab + this.value.slice( startIndices[l] );

                // Record the new selection start (first indented line).
                if ( newStart === undefined ) newStart = startIndices[l];
                // Record the new selection end (last indented line).
                if ( !newEnd ) newEnd = ( startIndices[l+1] ? startIndices[l+1] - 1 : 'end' );
                // Increment counter for affected rows.
                affectedRows++;
              }
            }

            // Set the final selection based on the changes.
            this.selectionStart = newStart;
            this.selectionEnd   = ( newEnd !== 'end' ? newEnd + ( tabWidth * affectedRows ) : this.value.length );
          }
        } else {
          // --- Shift-Tab Behaviour (Outdent) ---

          // Check if the current selection spans multiple lines.
          if ( !tabIndent.isMultiLine( this ) ) {
            // If it's a single-line selection or no selection:
            // Check if there's a tab character immediately before the selection start.
            if ( this.value.substr( currentStart - tabWidth, tabWidth ) == tab ) {
              // If a tab is found, remove it.
              this.value = this.value.substr( 0, currentStart - tabWidth ) + this.value.substr( currentStart );
              // Adjust selection start and end.
              this.selectionStart = currentStart - tabWidth;
              this.selectionEnd   = currentEnd - tabWidth;
            }
            // Alternatively, check if the selection is at the start of a line
            // and the first character of the line is a tab.
            else if ( this.value.substr( currentStart - 1, 1 ) == "\n" && this.value.substr( currentStart, tabWidth ) == tab ) {
              // Remove the tab at the beginning of the line.
              this.value = this.value.substring( 0, currentStart ) + this.value.substr( currentStart + tabWidth );
              // Adjust selection start and end.
              this.selectionStart = currentStart;
              this.selectionEnd   = currentEnd - tabWidth;
            }
          } else {
            // If it's a multi-line selection:
            // Iterate through the start indices, find lines within selection, and remove an indent.
            var startIndices = tabIndent.findStartIndices( this ),
                l            = startIndices.length,
                newStart     = undefined,
                newEnd       = undefined,
                affectedRows = 0;

            // Loop backwards through the line start indices.
            while ( l-- ) {
              var lowerBound = startIndices[l];
              // Adjust lowerBound if there's a next line and currentStart is not at its beginning.
              if ( startIndices[l+1] && currentStart != startIndices[l+1] ) lowerBound = startIndices[l+1];

              // If the current line's start index is within the selected range:
              if ( lowerBound >= currentStart && startIndices[l] < currentEnd ) {
                // Check if the line starts with a tab character.
                if ( this.value.substr( startIndices[l], tabWidth ) == tab ) {
                  // Remove the tab.
                  this.value = this.value.slice( 0, startIndices[l] ) + this.value.slice( startIndices[l] + tabWidth );
                  affectedRows++; // Increment counter for affected rows.
                }
                // No action needed if the line does not start with a tab.
                else {}

                // Record the new selection start (first outdented line).
                if ( newStart === undefined ) newStart = startIndices[l];
                // Record the new selection end (last outdented line).
                if ( !newEnd ) newEnd = ( startIndices[l+1] ? startIndices[l+1] - 1 : 'end' );
              }
            }

            // Set the final selection based on the changes.
            this.selectionStart = newStart;
            this.selectionEnd   = ( newEnd !== 'end' ? newEnd - ( affectedRows * tabWidth ) : this.value.length );
          }
        }
      }
      // Check if the pressed key is the Escape key (keyCode 27).
      else if ( e.keyCode === 27 ) {
        // If Esc is pressed, disable the tabIndent functionality for the current element.
        tabIndent.events.disable( e );
      }
      // Check if the pressed key is the Enter key (keyCode 13) and Shift is not pressed.
      else if ( e.keyCode === 13 && e.shiftKey === false ) {
        // --- Enter Key Behaviour (Auto-indent on new line) ---
        var self            = tabIndent,
            cursorPos       = this.selectionStart,
            startIndices    = self.findStartIndices( this ),
            numStartIndices = startIndices.length,
            startIndex      = 0,
            endIndex        = 0,
            // Create a regex to match the tab character(s) at the beginning of a line.
            tabMatch        = new RegExp( "^" + tab.replace( '\t', '\\t' ).replace( / /g, '\\s' ) + "+", 'g' ),
            lineText        = '';
            tabs            = null;

        // Find the start and end indices of the current line where the cursor is.
        for ( var x = 0; x < numStartIndices; x++ ) {
          if ( startIndices[x+1] && ( cursorPos >= startIndices[x] ) && ( cursorPos < startIndices[x+1] ) ) {
            startIndex = startIndices[x];
            endIndex   = startIndices[x+1] - 1;
            break;
          } else {
            // Handle the case for the last line in the textarea.
            startIndex = startIndices[numStartIndices-1];
            endIndex   = this.value.length;
          }
        }

        // Extract the text of the current line.
        lineText = this.value.slice( startIndex, endIndex );
        // Match leading tab characters in the current line.
        tabs = lineText.match( tabMatch );

        // If leading tabs are found:
        if ( tabs !== null ) {
          e.preventDefault(); // Prevent default Enter key behavior (simple new line).
          var indentText  = tabs[0]; // The matched leading indentation.
          var indentWidth = indentText.length; // The length of the indentation.
          var inLinePos   = cursorPos - startIndex; // Cursor position relative to the start of the line.

          // If the cursor is within the leading indentation, trim the indentText.
          if ( indentWidth > inLinePos ) {
            indentWidth = inLinePos;
            indentText  = indentText.slice( 0, inLinePos );
          }

          // Insert a new line followed by the determined indentation.
          this.value          = this.value.slice( 0, cursorPos ) + "\n" + indentText + this.value.slice( cursorPos );
          // Position the cursor after the new line and the inserted indentation.
          this.selectionStart = cursorPos + indentWidth + 1;
          this.selectionEnd   = this.selectionStart;
        }
      }
    },

    // Disables the tabIndent functionality for a specific element.
    disable: function( e ) {
      var events = this;

      // Call the remove method to detach the keydown event listener.
      tabIndent.remove( e.target );
    },

    // Handles the focus event for textareas.
    // This method sets up the keydown listener and applies visual cues.
    focus: function() {
      var self           = tabIndent,
          el             = this,
          // Set a timeout to delay the application of tabIndent.
          // This allows for tabbing *through* elements without immediate activation.
          delayedRefocus = setTimeout( function() {
            var classes  = ( el.getAttribute( 'class' ) || '' ).split( ' ' ),
                contains = classes.indexOf( 'tabIndent' );

            // Attach the keydown event listener.
            el.addEventListener( 'keydown', self.events.keydown );
            // Apply a background image as a visual indicator (e.g., a tab icon).
            el.style.backgroundImage    = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAKZSURBVEjH7ZRfSFNRHMe/9+/+3G26tUn+ycywgURgUBAUJlIhWlEQEjN8yQcfolKJxJAefOjRCnT0IPYQ9iRa9FAYJiaUVP4twf7gzJzpnDbdzHt3z+3Fua3dO4Ne/f5ezjmc8+F7zvmeA2zrv0VFGlexAssFw1mG1pqqUL8npGY60Bw3ykYaOVjlrFXmEyw0AQj6g53UONQBO8DBzuiT2tUx+gR/mwACBQpIUoACBZoAZaOSiWwFIFs4oMMS9/boZVF8T8vtkbEofatiRKF9mXK6M7tTyyxRaPwWtJezIu9+9cNzxHk/n9938rz6IWpvgRdZd5/HcsvC9jadqk6Z0qkBiCaAF3UtX8cy6h1mwlnLhsuZuRvqABlyNJqb0q0ZWsb7uUVHlXAahWl1y3M2tVuQVR1Q0Pl0dwZ67KbZtGnX/ma++/FsCCY1ANlAxIuT2NZP3XB/GRKc9qKhKTYnd4auJbIqINEBDa5zoWWByoS1jocR+loKpKGJKqBLybN/OQN2Tmodv4jCtYIMYurnP5sLf+V5XK4DbFv4haaDCEABA/J88GdegD1I2+heY0Xj7M1itiMjP8srzutjXMbkIDZKCrAcfGOt8LwODimYnzzjLcHIx5VFwPekZrhVPYmxyVNAvZP8KV28SykClo6XF4/t9LpC2TTIteulJepJjD5nCjL8E56sMHt40NYYqE51ZnZIfmGXYBC68p/6v6UkApSI8Y2ejPVKhyE0PdLDPcg+Z003G0W7YUmmvo/WtjXgbiKAAQNGpjYRDOwWILx3dV16ZBsx3QsdYi4JNUw6uCvMbrUcWFAvPWznfH9/GQHR5xAbPuTumRFWvS+ZwDGyJFfidkxWk2oaIfTRk8RI0YqMAQBAL7YVrz/iUDx4QII4/QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMi0xMi0wMVQwMDowNjo0My0wNTowMLKpTWYAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTItMTItMDFUMDA6MDY6NDMtMDU6MDDD9PXaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg==)";
            el.style.backgroundPosition = 'top right';
            el.style.backgroundRepeat   = 'no-repeat';

            // Remove 'tabIndent' class and add 'tabIndent-rendered' to indicate activation.
            if ( contains !== -1 ) classes.splice( contains, 1 );
            classes.push( 'tabIndent-rendered' );
            el.setAttribute( 'class', classes.join( ' ' ) );

            // Remove the focus listener as the functionality is now active.
            el.removeEventListener( 'focus', self.events.keydown );
          }, 500 ); // 500ms delay

      // If the user quickly tabs through elements, we don't want to activate tabIndent
      // until they pause on an element. This blur listener cancels the delayed activation.
      el.addEventListener( 'blur', function b() {
        clearTimeout( delayedRefocus ); // Cancel the pending setTimeout.
        el.removeEventListener( 'blur', b ); // Remove this blur listener itself.
      } );
    }
  },

  // Renders tabIndent functionality for a single textarea element.
  render: function( el ) {
    var self = this;

    // Ensure the element is a TEXTAREA.
    if ( el.nodeName === 'TEXTAREA' ) {
      // Add a focus event listener to activate tabIndent on interaction.
      el.addEventListener( 'focus', self.events.focus );

      // Add a blur event listener to disable tabIndent when focus leaves.
      el.addEventListener( 'blur', function b( e ) {
        self.events.disable( e );
      } );
    }
  },

  // Renders tabIndent functionality for all textareas with the 'tabIndent' class.
  renderAll: function() {
    // Find all textarea elements in the document.
    var textareas = document.getElementsByTagName( 'textarea' ),
        t         = textareas.length,
        contains  = -1,
        classes   = [],
        el        = undefined;

    // Iterate through all found textareas.
    while ( t-- ) {
      // Get the class names of the current textarea.
      classes  = ( textareas[t].getAttribute( 'class' ) || '' ).split( ' ' );
      // Check if the 'tabIndent' class is present.
      contains = classes.indexOf( 'tabIndent' );

      // If the 'tabIndent' class is found, render the functionality for this element.
      if ( contains !== -1 ) {
        el = textareas[t];
        this.render( el );
      }
      // Reset variables for the next iteration.
      contains = -1;
      classes  = [];
      el       = undefined;
    }
  },

  // Removes tabIndent functionality from a single textarea element.
  remove: function( el ) {
    // Ensure the element is a TEXTAREA.
    if ( el.nodeName === 'TEXTAREA' ) {
      var classes  = ( el.getAttribute( 'class' ) || '' ).split( ' ' ),
          // Check if the 'tabIndent-rendered' class is present (indicating it's active).
          contains = classes.indexOf( 'tabIndent-rendered' );

      // If tabIndent is active for this element:
      if ( contains !== -1 ) {
        // Remove the keydown event listener.
        el.removeEventListener( 'keydown', this.events.keydown );
        // Remove the visual background image.
        el.style.backgroundImage = '';

        // Remove 'tabIndent-rendered' class and re-add 'tabIndent' if it was removed earlier.
        classes.splice( contains, 1 );
        classes.push( 'tabIndent' );
        // Update the class attribute.
        el.setAttribute( 'class', ( classes.length > 1 ? classes.join( ' ' ) : classes[0] ) );
      }
    }
  },

  // Removes tabIndent functionality from all textareas that currently have it active.
  removeAll: function() {
    // Find all textarea elements in the document.
    var textareas = document.getElementsByTagName( 'textarea' ),
        t         = textareas.length,
        contains  = -1,
        classes   = [],
        el        = undefined;

    // Iterate through all found textareas.
    while ( t-- ) {
      // Get the class names of the current textarea.
      classes  = ( textareas[t].getAttribute( 'class' ) || '' ).split( ' ' );
      // Check if the 'tabIndent-rendered' class is present.
      contains = classes.indexOf( 'tabIndent-rendered' );

      // If the 'tabIndent-rendered' class is found, remove the functionality.
      if ( contains !== -1 ) {
        el = textareas[t];
        this.remove( el );
      }
      // Reset variables for the next iteration.
      contains = -1;
      classes  = [];
      el       = undefined;
    }
  },

  // Checks if the current selection in a textarea spans multiple lines.
  isMultiLine: function( el ) {
    // Extract the selected text.
    var snippet = el.value.slice( el.selectionStart, el.selectionEnd ),
        // Regular expression to test for newline characters.
        nlRegex = new RegExp( /\n/ );

    // Return true if a newline is found in the snippet, false otherwise.
    if ( nlRegex.test( snippet ) ) return true;
    else return false;
  },

  // Finds and returns an array of start indices for each line in a textarea's value.
  findStartIndices: function( el ) {
    var text         = el.value,
        startIndices = [],
        offset       = 0;

    // Loop while newline characters are found in the remaining text.
    while ( text.match( /\n/ ) && text.match( /\n/ ).length > 0 ) {
      // Calculate the offset for the current line's start index.
      offset = ( startIndices.length > 0 ? startIndices[startIndices.length - 1] : 0 );
      // Find the index of the first newline character.
      var lineEnd = text.search( "\n" );
      // Add the start index of the next line to the array.
      startIndices.push( lineEnd + offset + 1 );
      // Update text to process the remainder.
      text = text.substring( lineEnd + 1 );
    }
    // Add the very first line's start index (0) to the beginning of the array.
    startIndices.unshift( 0 );

    return startIndices;
  }
}
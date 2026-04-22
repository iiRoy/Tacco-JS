$( document ).ready( function ( ) {

  // Initialize Cufon for custom font rendering
  Cufon.replace( ".header h1", {

    // Define a linear gradient color for the main header
    color: '-linear-gradient(#999, 0.2=#777, 0.4=#444, 0.5=#222, 0.6=#333, 0.8=#555, #999)'

  } );

  // Apply Cufon to the subheading as well, with default styling
  Cufon.replace( ".header h2" );

  // Cufon replacement for list items in the header, including hover effects
  Cufon.replace( ".header li", {
    hover: {
      // textShadow: '2px 2px red', // This was commented out in the original, keeping it commented.
      color: '-linear-gradient(black, white)' // A nice gradient for hover state.
    }
  } );



  /*
   * This object manages the selection of nodes (table rows) in a history view.
   * It handles selecting ranges and individual nodes based on checkbox interactions.
   */
  var nodeSelector = {

    node1: null, // Stores the first selected node in a range.
    node2: null, // Stores the second selected node in a range.


    /**
     * Selects a range of nodes between n1 and n2 (inclusive).
     * Assumes n1 and n2 are jQuery objects representing table rows.
     */
    selectNodeRange: function ( n1, n2 ) {

      // Ensure both nodes are selected before attempting to select a range.
      if ( nodeSelector.node1 && nodeSelector.node2 ) {

        // First, clear any previously selected items.
        $( '#wiki-history td.selected' ).removeClass( 'selected' );

        // Mark the start and end nodes as selected.
        nodeSelector.node1.addClass( 'selected' );
        nodeSelector.node2.addClass( 'selected' );

        // This block ensures node1 always comes before node2 visually/structurally.
        if ( nodeSelector.nodeComesAfter( nodeSelector.node1, nodeSelector.node2 ) ) {

          // Temporarily store node1.
          var n = nodeSelector.node1;

          // Swap them.
          nodeSelector.node1 = nodeSelector.node2;
          nodeSelector.node2 = n;

        }

        var s = true; // Placeholder variable, not used in the original logic.

        // Get the element immediately following the first selected node.
        var $nextNode = nodeSelector.node1.next( );

        // Iterate through sibling nodes until the second selected node is found.
        while ( $nextNode ) {

          $nextNode.addClass( 'selected' ); // Mark the current node as selected.

          // If we've reached the second node, stop.
          if ( $nextNode[ 0 ] == nodeSelector.node2[ 0 ] ) {
            break;
          }

          // Move to the next sibling.
          $nextNode = $nextNode.next( );

        } // End of while loop.

      } // End of if (nodeSelector.node1 && nodeSelector.node2)

    }, // End of selectNodeRange method.


    /**
     * Checks if node n1 comes after node n2 in the DOM structure.
     * This is determined by checking if n2 is among the previous siblings of n1.
     */
    nodeComesAfter: function ( n1, n2 ) {

      var s = false; // Flag to indicate if n1 comes after n2.

      // Iterate over all previous siblings of n1.
      $( n1 ).prevAll( ).each( function ( ) {

        // If any previous sibling is n2, then n1 comes after n2.
        if ( $( this )[ 0 ] == $( n2 )[ 0 ] ) {
          s = true; // Set flag.
        }

      } );

      return s; // Return the result.

    }, // End of nodeComesAfter method.


    /**
     * Handles the checking/unchecking of a single node's checkbox.
     * This method manages the selection of node1 and node2 for range selection.
     */
    checkNode: function ( nodeCheckbox ) {

      var $nodeCheckbox = nodeCheckbox; // Reference to the checkbox jQuery object.
      // Get the parent row (TR) of the checkbox.
      var $node = $( nodeCheckbox ).parent( ).parent( );

      // If the checkbox is being unchecked.
      if ( ! $nodeCheckbox.is( ':checked' ) ) {

        // Remove the range selection, as unchecking breaks it.
        $( '#wiki-history tr.selected' ).each( function ( ) {

          // If this selected row's checkbox is still checked, don't deselect it.
          if ( $( this ).find( 'td.checkbox input' ).is( ':checked' ) ) {
            return; // Continue to the next iteration.
          }

          // Otherwise, remove the 'selected' class from the row.
          $( this ).removeClass( 'selected' );

        } );

        // If the unchecked node was node1, update nodeSelector.
        if ( $node[ 0 ] == nodeSelector.node1[ 0 ] ) {

          nodeSelector.node1 = null; // Clear node1.

          // If node2 exists, promote it to node1.
          if ( nodeSelector.node2 ) {
            nodeSelector.node1 = nodeSelector.node2;
            nodeSelector.node2 = null; // Clear node2.
          }

        } else if ( $node[ 0 ] == nodeSelector.node2[ 0 ] ) {

          // If the unchecked node was node2, simply clear it.
          nodeSelector.node2 = null;

        }

      } else { // The checkbox is being checked.

        // If node1 is not yet set, this is the first node in a potential range.
        if ( ! nodeSelector.node1 ) {

          nodeSelector.node1 = $node; // Assign the current node as node1.
          nodeSelector.node1.addClass( 'selected' ); // Mark it as selected.

        } else if ( ! nodeSelector.node2 ) {

          // We have node1, but not node2. This is the second node.
          nodeSelector.node2 = $node; // Assign the current node as node2.
          nodeSelector.node2.addClass( 'selected' ); // Mark it as selected.

          // Now that we have two nodes, select the range between them.
          nodeSelector.selectNodeRange( nodeSelector.node1, nodeSelector.node2 );

        } else {

          // Both node1 and node2 are already selected.
          // In this case, prevent the current checkbox from being checked.
          $nodeCheckbox[ 0 ].checked = false;

        }

      } // End of else (checkbox is checked).

    } // End of checkNode method.

  }; // End of nodeSelector object.



  // Check if the current page is the wiki history page.
  if ( $( '#wiki-wrapper' ).hasClass( 'history' ) ) {

    // Iterate over each checkbox in the wiki history table.
    $( '#wiki-history td.checkbox input' ).each( function ( ) {

      // Attach a click event handler to each checkbox.
      $( this ).click( function ( ) {

        // Call the nodeSelector's checkNode method with the clicked checkbox.
        nodeSelector.checkNode( $( this ) );

      } );

      // If a checkbox is already checked on page load, process it.
      if ( $( this ).is( ':checked' ) ) {

        nodeSelector.checkNode( $( this ) ); // Trigger the checkNode logic.

      }

    } ); // End of each checkbox iteration.


    // Check if the "Compare Revision" link exists on the history page.
    if ( $( '.history a.action-compare-revision' ).length ) {

      // Attach a click event to the compare revision link.
      $( '.history a.action-compare-revision' ).click( function ( ) {

        // Submit the version form when the link is clicked.
        $( "#version-form" ).submit( );

      } );

    } // End of if (compare revision link exists).

  } // End of if (wiki-wrapper has history class).

} ); // End of document.ready function.
/*
 * This JavaScript module manages a visual grid overlay for development purposes.
 * It provides functionality to toggle the visibility of a 12-column grid.
 */

// First, we perform a check to determine if the grid lines element
// with the class 'cb-grid-lines' already exists within the document.
if ( document . getElementsByClassName( 'cb-grid-lines' ) . length )
{
  // If the grid lines element is found (meaning its length is greater than zero),
  // we proceed to remove the first instance of it from the document's body.
  document . body . removeChild( document . getElementsByClassName( 'cb-grid-lines' )[ 0 ] );

}
else
{
  // If the grid lines element does not exist in the document,
  // we append a new HTML structure to the document's body.
  // This structure defines a responsive 12-column grid layout.
  document . body . innerHTML +=
    '<div class="cb-grid-lines">' +                                 // Outer container for the grid lines
    '  <div class="container">' +                                   // Bootstrap container for content width
    '    <div class="row">' +                                       // Bootstrap row for column alignment
    '      <div class="span1 col-xs-1"></div>' +                    // Column 1 (span1 for older Bootstrap, col-xs-1 for newer)
    '      <div class="span1 col-xs-1"></div>' +                    // Column 2
    '      <div class="span1 col-xs-1"></div>' +                    // Column 3
    '      <div class="span1 col-xs-1"></div>' +                    // Column 4
    '      <div class="span1 col-xs-1"></div>' +                    // Column 5
    '      <div class="span1 col-xs-1"></div>' +                    // Column 6
    '      <div class="span1 col-xs-1"></div>' +                    // Column 7
    '      <div class="span1 col-xs-1"></div>' +                    // Column 8
    '      <div class="span1 col-xs-1"></div>' +                    // Column 9
    '      <div class="span1 col-xs-1"></div>' +                    // Column 10
    '      <div class="span1 col-xs-1"></div>' +                    // Column 11
    '      <div class="span1 col-xs-1"></div>' +                    // Column 12
    '    </div>' +                                                  // Closing tag for the row
    '  </div>' +                                                    // Closing tag for the container
    '</div>';                                                       // Closing tag for the grid lines wrapper
}
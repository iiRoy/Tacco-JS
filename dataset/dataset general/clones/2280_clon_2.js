jQuery( document ) . ready( function( ) {
  // This block executes once the DOM is fully loaded.

  let createLayout = function( initialColumnCount ) {
    // Function to dynamically generate the grid layout based on a given number of columns.

    let idx = 0; // Loop iterator for segment creation.
    let currentOffset = 0; // Accumulator for calculating left margin of elements.
    const numCols = initialColumnCount; // The requested number of content columns.
    const gutterSpacing = 1; // Fixed width for the visual gutters between columns, in percentage.

    let numGutters; // Calculated number of gutters.
    let colWidth; // Calculated width for each content column.
    let totalElements; // Total number of DOM elements to create (columns + gutters).

    numGutters = numCols - 1;
    colWidth = ( 100 - ( numGutters * gutterSpacing ) ) / numCols;
    totalElements = numCols + numGutters;

    // Remove any existing layout container to prepare for a fresh render.
    $( '#layout-wrapper' ). remove( );

    // Create a new container for the grid elements.
    $( '<div></div>' )
      . attr( 'id', 'layout-wrapper' )
      . addClass( 'layout-wrapper-style' )
      . appendTo( 'body' );

    // Set the initial width of the main container based on the slider's current value.
    $( '#layout-wrapper' ) . css( 'width', $( '#size-adjuster' ) . slider( 'value' ) + '%' );

    // Loop through and create each grid segment (columns and gutters).
    for ( ; idx < totalElements; idx = idx + 1 ) {
      $( '<div></div>' )
        . attr( 'id', 'segment-' + idx )
        . addClass(
          idx % 2 // Check if the current element is a gutter or a column.
            ? 'segment-spacing-style' // Apply style for gutters.
            : 'segment-content-style' // Apply style for content columns.
        )
        . css(
          'width',
          (
            idx % 2
              ? gutterSpacing // Gutter width.
              : colWidth // Column width.
          ) + '%'
        )
        . css(
          'margin-left',
          currentOffset + '%'
        )
        . css( 'height', '100%' ) // Ensure full height.
        . appendTo( '#layout-wrapper' );

      // Update the offset for the next element's margin-left.
      currentOffset = currentOffset + ( idx % 2 ? gutterSpacing : colWidth );

      // A developer comment for debugging purposes could go here, e.g.:
      // console.debug(`Segment ${idx} width: ${$( '#segment-' + idx ).css('width')}`);
    }
  }; // End of createLayout function definition.

  // Initialize the jQuery UI slider and attach an event listener.
  $( '#size-adjuster' ) . slider( { value: 100 } ) . on(
    'slide', // The event triggered when the slider's value changes.
    function( evt, valObject ) {
      // Update the width of the layout container based on the slider's new value.
      $( '#layout-wrapper' ) . css( 'width', valObject.value + '%' );
    }
  );

  // Set up the button to decrease the number of columns.
  $( 'button[data-action=decrease-grid]' ) . button( ) . on(
    'click',
    function( evt ) {
      // Re-render the layout with one less column.
      createLayout( --activeColumnCount );
    }
  );

  // Set up the button to increase the number of columns.
  $( 'button[data-action=increase-grid]' ) . button( ) . on(
    'click',
    function( evt ) {
      // Re-render the layout with one more column.
      createLayout( ++activeColumnCount );
    }
  );

  // Initialize the active column count.
  let activeColumnCount = 12;

  // Perform the initial rendering of the layout.
  createLayout( activeColumnCount );

} ); // End of document ready function.
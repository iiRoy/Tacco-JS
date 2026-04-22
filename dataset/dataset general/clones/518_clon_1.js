// Elastic CSS Framework JavaScript Runtime
// This framework is released under the MIT, BSD, and GPL Licenses.
// For more information, please visit http://www.elasticss.com
// @file         : 'elastic.js'
// @author       : 'Fernando Trasviña (@azendal)'
// @collaborator : 'Sergio de la Garza (@sgarza)'
// @copyright    : '2010 Elastic CSS framework'
// @version      : '2.1.1'
// This script provides core functionalities for the Elastic CSS layout system.

var Elastic = function Elastic ( context, includeContext ) {
  // Declare local variables used within this function
  var helper, columnsElements, i, l, columnsIterator, $context, columnsElementsArr;

  // Initialize context, defaulting to the document if not provided
  context = context || document;
  $context = $( context );
  columnsElements = Elastic.querySelectorAll( '.columns', context );

  // Check if context elements should be included based on configuration
  if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

    columnsElementsArr = []; // Array to hold all column elements

    // If the context itself has the 'columns' class, add it
    if ( $context.hasClass( 'columns' ) ) {
      columnsElementsArr.push( context );
    }

    // Iterate through found column elements and add them to the array
    for ( i = 0, l = columnsElements.length; i < l; i++ ) {
      columnsElementsArr.push( columnsElements[i] );
    }

    // Update columnsElements to include context if applicable
    columnsElements = columnsElementsArr;
  }

  // Get the total number of column elements
  l = columnsElements.length;
  // Reference the columns iterator function
  columnsIterator = Elastic.columnsIterator;

  // Iterate over each columns element and apply the layout logic
  for ( i = 0; i < l; i++ ) {
    columnsIterator( columnsElements[i] );
  }

  // Apply registered helper functions to the context
  for ( helper in Elastic.helpers ) {
    // Ensure the helper is a direct property of Elastic.helpers
    if ( Elastic.helpers.hasOwnProperty( helper ) ) {
      Elastic.helpers[ helper ]( $context );
    }
  }
};

// Define framework version and regular expressions for CSS classes
Elastic.VERSION = '2.1.1'; // Current version of the Elastic framework

// Regular expression to match columns per row (e.g., 'on-3')
Elastic.COLUMNS_PER_ROW_EXPRESSION = /(^|\s+)on\-(\d+)(\s+|$)/;
// Regular expression to match column span (e.g., 'span-2')
Elastic.COLUMN_SPAN_EXPRESSION = /(^|\s+)span\-(\d+)(\s+|$)/;
// Regular expression to identify fixed-width columns
Elastic.FIXED_COLUMN_EXPRESSION = /(^|\s+)fixed(\s+|$)/;
// Regular expression to identify elastic-width columns
Elastic.ELASTIC_COLUMN_EXPRESSION = /(^|\s+)elastic(\s+|$)/;
// Regular expression for adaptive columns (e.g., 'adaptive-100-200')
Elastic.ADAPTIVE_COLUMNS_EXPRESSION = /(^|\s+)adaptive\-(\d+)\-(\d+)(\s+|$)/;
// Regular expression for final column in a row
Elastic.FINAL_COLUMN_EXPRESSION = /(^|\s+)final(\s+|$)/;
// Regular expression for display layout (e.g., 'display grid')
Elastic.DISPLAY_LAYOUT_EXPRESSION = /(^|\s+)display\s+([\w\_\-\d]+)(\s+|$)/;

// Configuration settings for the Elastic framework
Elastic.configuration = {
  refreshOnResize : true, // Whether to re-calculate layout on window resize
  includeContext  : true  // Whether to include the context element itself in calculations
};

// Function to iterate through column elements and apply layout logic
Elastic.columnsIterator = function columnsElementsIteration ( columnsElement ) {

  // Declare variables for internal use within the iterator
  var i, l, container, columnElements, lastColumn, columnsPerRow, containerWidth, columnWidths,
    elasticColumns, rowColumns, columnsOnRow, nextColumnsOnRow, fixedColumnsWidth, currentColumn,
    fixedColumnWidth, minWidth, maxWidth;

  // Determine the container for columns; prioritize '.container' child
  container = Elastic.querySelectorAll( '> .container', columnsElement )[0] || columnsElement;
  // Get all direct '.column' children within the container
  columnElements = Elastic.querySelectorAll( '> .column', container );

  // If no column elements are found, there's nothing to process
  if ( columnElements.length === 0 ) {
    return;
  }

  // Identify the last column element
  lastColumn = columnElements[ columnElements.length - 1 ];
  // Calculate the number of columns expected per row
  columnsPerRow = Elastic.getColumnsPerRow( columnsElement, columnElements );
  // Get the effective width of the container
  containerWidth = Elastic.getInnerWidth( container );
  // Calculate initial column widths based on container and columns per row
  columnWidths = Elastic.round( containerWidth, columnsPerRow );

  // Handle adaptive columns logic if the expression matches
  if ( Elastic.ADAPTIVE_COLUMNS_EXPRESSION.test( columnsElement.className ) ) {
    minWidth = Number( RegExp.$2 ); // Minimum allowed column width
    maxWidth = Number( RegExp.$3 ); // Maximum allowed column width

    // Adjust columnsPerRow if current column width exceeds maxWidth
    if ( columnWidths[0].width > maxWidth ) {
      while ( columnWidths[0].width > maxWidth ) {
        columnsPerRow = columnsPerRow + 1;
        columnWidths = Elastic.round( containerWidth, columnsPerRow );
        if ( columnWidths[0].width < minWidth ) {
          break; // Stop if width falls below min after increasing columns
        }
      }
    }

    // Adjust columnsPerRow if current column width falls below minWidth
    if ( columnWidths[0].width < minWidth ) {
      while ( columnWidths[0].width < minWidth && columnsPerRow > 1 ) {
        columnsPerRow = columnsPerRow - 1;
        columnWidths = Elastic.round( containerWidth, columnsPerRow );
        if ( columnWidths[0].width > maxWidth ) {
          break; // Stop if width exceeds max after decreasing columns
        }
      }
    }
  }

  // Initialize arrays and counters for row processing
  elasticColumns = [];      // Stores columns designated as 'elastic'
  rowColumns = [];          // Stores columns for the current row
  columnsOnRow = 0;         // Tracks the span width of columns in the current row
  nextColumnsOnRow = 0;     // Tracks projected span width for the next column
  fixedColumnsWidth = 0;    // Accumulates width of fixed columns in the current row

  // Loop through all column elements to process their layout
  for ( i = 0, l = columnElements.length; i < l; i++ ) {
    currentColumn = columnElements[i]; // The column currently being processed

    // Reset column flags and remove temporary class
    currentColumn.isElastic = false;
    currentColumn.isFixed = false;
    currentColumn.isRegular = false;
    currentColumn.className = currentColumn.className.replace( 'elastic-row-last', '' );

    // Check for fixed column type
    if ( Elastic.FIXED_COLUMN_EXPRESSION.test( currentColumn.className ) ) {
      fixedColumnWidth = Elastic.getOuterWidth( currentColumn );
      currentColumn.columnWidth = fixedColumnWidth;
      currentColumn.isFixed = true;
      fixedColumnsWidth += fixedColumnWidth;
    }
    // Check for elastic column type
    else if ( Elastic.ELASTIC_COLUMN_EXPRESSION.test( currentColumn.className ) ) {
      currentColumn.isElastic = true;
      elasticColumns.push( currentColumn );
    }
    // Default to regular column type
    else {
      currentColumn.isRegular = true;
    }

    // Check for final column in a row
    if ( Elastic.FINAL_COLUMN_EXPRESSION.test( currentColumn.className ) ) {
      currentColumn.isFinal = true;
    }

    // Calculate the span if the current column were added to the row
    nextColumnsOnRow = columnsOnRow + currentColumn.spanWidth;

    // Check if a row boundary is reached or if it's the last column
    if ( nextColumnsOnRow >= columnsPerRow || currentColumn === lastColumn || currentColumn.isFinal ) {
      // If the current column fits or spans the whole row, add it to the row
      if ( nextColumnsOnRow <= columnsPerRow || currentColumn.spanWidth >= columnsPerRow ) {
        rowColumns.push( currentColumn );
      }
      // Process the completed row
      Elastic.processRow( rowColumns, containerWidth, fixedColumnsWidth, elasticColumns, columnWidths );

      // If the current column pushed the row over its limit, start a new row with this column
      if ( nextColumnsOnRow > columnsPerRow ) {
        if ( currentColumn.isFixed ) {
          fixedColumnsWidth = fixedColumnWidth;
        }
        columnsOnRow = currentColumn.spanWidth;
        nextColumnsOnRow = currentColumn.spanWidth;
        if ( currentColumn.isElastic ) {
          elasticColumns = [ currentColumn ];
        }
        rowColumns = [ currentColumn ];

        // If this is also the last column, process this single-column row
        if ( currentColumn === lastColumn ) {
          Elastic.processRow( rowColumns, containerWidth, fixedColumnsWidth, elasticColumns, columnWidths );
        }
      }
      // Otherwise, reset for a new row
      else {
        fixedColumnsWidth = 0;
        columnsOnRow = 0;
        nextColumnsOnRow = 0;
        elasticColumns = [];
        rowColumns = [];
      }
      continue; // Move to the next column element
    }

    // If no row boundary is reached, add the current column to the row
    rowColumns.push( currentColumn );
    columnsOnRow += currentColumn.spanWidth;
  }

  return this; // Allow chaining
};

// Function to determine the number of columns per row
Elastic.getColumnsPerRow = function getColumnsPerRow ( columnsElement, columnElements ) {
  var i, l, columnsPerRow, fixedColumnsPerRow;

  columnsPerRow = columnElements.length; // Default to number of elements
  fixedColumnsPerRow = false; // Flag to indicate if columns per row is explicitly set

  // Check if columns per row is defined by a class (e.g., 'on-3')
  if ( Elastic.COLUMNS_PER_ROW_EXPRESSION.test( columnsElement.className ) ) {
    columnsPerRow = Number( RegExp.$2 ); // Extract the number
    fixedColumnsPerRow = true;
  }

  // Iterate through column elements to determine their span widths
  for ( i = 0, l = columnElements.length; i < l; i++ ) {
    // Check if column span is defined by a class (e.g., 'span-2')
    if ( Elastic.COLUMN_SPAN_EXPRESSION.test( columnElements[i].className ) ) {
      columnElements[i].spanWidth = Number( RegExp.$2 ); // Extract the span number
      // If columns per row is not fixed, adjust it based on span widths
      if ( fixedColumnsPerRow !== true ) {
        columnsPerRow += columnElements[i].spanWidth - 1;
      }
    }
    else {
      // Default span width for columns without explicit span
      columnElements[i].spanWidth = 1;
    }
  }

  return columnsPerRow; // Return the calculated columns per row
};

// Function to process a single row of columns
Elastic.processRow = function processRow ( columns, containerWidth, fixedColumnsWidth, elasticColumns, columnWidths ) {

  var currentColumn, computedWidth, columnPosition, columnsWidth, lastColumn, i, j, l, elasticColumnWidths, elasticColumnsWidth;

  // If fixed columns already fill or exceed container width, no space for others
  if ( fixedColumnsWidth >= containerWidth ) {
    return;
  }

  computedWidth = 0;      // Temporary variable for computed width of a column
  columnPosition = 0;     // Tracks the current position in the column grid
  columnsWidth = fixedColumnsWidth; // Accumulates total width of processed columns
  lastColumn = columns[ columns.length - 1 ]; // The last column in the current row

  // Add a class to the last column of the row for styling purposes
  if ( lastColumn.className.indexOf( 'elastic-row-last' ) == -1 ) {
    lastColumn.className = lastColumn.className + ' elastic-row-last';
  }

  // Iterate through columns in the row to calculate and apply widths
  for ( i = 0, l = columns.length; i < l; i++ ) {
    currentColumn = columns[i]; // Current column being processed

    // Process regular columns (non-fixed, non-elastic)
    if ( currentColumn.isRegular ) {
      // If a regular column spans more than available column widths, give it full container width
      if ( currentColumn.spanWidth >= columnWidths.length ) {
        currentColumn.style.width = containerWidth + 'px';
        continue;
      }

      // Sum up widths for the span of the current column
      for ( j = columnPosition; j < ( columnPosition + currentColumn.spanWidth ); j++ ) {
        computedWidth += columnWidths[j].width;
      }

      // Update total columns width and position, then apply width to the current column
      columnsWidth += computedWidth;
      columnPosition += currentColumn.spanWidth;
      currentColumn.style.width = computedWidth + 'px';
      computedWidth = 0; // Reset for next column
    }
  }

  // Process elastic columns if any exist in the row
  if ( elasticColumns.length > 0 ) {
    elasticColumnsWidth = 0; // Total width allocated to elastic columns
    // Distribute remaining space among elastic columns
    elasticColumnWidths = Elastic.round( containerWidth - columnsWidth, elasticColumns.length );

    // Apply calculated widths to each elastic column
    for ( i = 0, l = elasticColumns.length; i < l; i++ ) {
      elasticColumnsWidth += elasticColumnWidths[i].width;
      elasticColumns[i].style.width = elasticColumnWidths[i].width + 'px';
    }
  }

  // If the last column is marked as 'final', adjust its right margin
  if ( lastColumn.isFinal ) {
    lastColumn.style.marginRight = ( containerWidth - columnsWidth - ( elasticColumnsWidth || 0 ) ) + 'px';
  }
};

// Elastic rounding algorithm to distribute width evenly with pixel precision
Elastic.round = function ElasticRoundingAlgorithm ( containerWidth, columns ) {
  var cache, i, column, columnPercentage, columnWidths, columnWidth, columnWidthTally, difference,
    absDifference, positionDivision, increment, direction;

  cache = Elastic.round.cache; // Reference the cache object

  // Check if the result is already in cache
  if ( cache[ containerWidth ] && cache[ containerWidth ][ columns ] ) {
    return cache[ containerWidth ][ columns ];
  }

  columnPercentage = 100 / columns; // Percentage for each column
  columnWidths = []; // Array to store calculated column widths
  // Calculate initial column width, rounded to nearest pixel
  columnWidth = Math.round( containerWidth * ( columnPercentage / 100 ) );
  columnWidthTally = columnWidth * columns; // Sum of initial rounded widths

  // Initialize all columns with the calculated width
  for ( i = 0; i < columns; i++ ) {
    columnWidths.push( { width: columnWidth } );
  }

  // Calculate the difference between container width and summed column widths
  difference = containerWidth - columnWidthTally;
  absDifference = Math.abs( difference ); // Absolute value of the difference
  // Determine division points for distributing the difference
  positionDivision = columns / ( absDifference + 1 );
  increment = ( difference > 0 ); // True if we need to add pixels, false if subtract
  direction = -1; // Starting direction for distribution

  // Distribute the remaining pixel difference
  if ( difference !== 0 ) {
    for ( i = 1; i <= ( Math.abs( difference ) ); i++ ) {
      // Alternate distribution direction for a more balanced spread
      if ( direction == -1 ) {
        column = columnWidths[ columnWidths.length - Math.floor( positionDivision * Math.round( i / 2 ) ) ];
      }
      else {
        column = columnWidths[ Math.floor( positionDivision * Math.round( i / 2 ) ) - 1 ];
      }

      // Increment or decrement the column width based on the difference
      if ( increment ) {
        column.width = columnWidth + 1;
      }
      else {
        column.width = columnWidth - 1;
      }
      direction = direction * -1; // Reverse direction for next iteration
    }
  }

  // Cache the calculated widths for future use
  if ( !cache[ containerWidth ] ) {
    cache[ containerWidth ] = {};
  }
  cache[ containerWidth ][ columns ] = columnWidths;

  return columnWidths; // Return the array of adjusted column widths
};

// Cache object for the Elastic.round function
Elastic.round.cache = {};

// Helper functions for various layout adjustments
Elastic.helpers = {
  // Helper to make elements take full width of their parent
  'full-width' : function fullWidthHelper ( $context, includeContext ) {
    var i, l, $element, $elements, elementsLength, elementsArr;

    // Find all elements with the 'full-width' class within the context
    $elements = $context.find( '.full-width' );

    // Conditional inclusion of context element
    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

      elementsArr = []; // Temporary array to hold elements

      // If context itself has 'full-width' class, add it
      if ( $context.hasClass( 'full-width' ) ) {
        elementsArr.push( $context[0] );
      }

      // Add all found elements to the temporary array
      for ( i = 0, l = $elements.length; i < l; i++ ) {
        elementsArr.push( $elements[i] );
      }

      $elements = elementsArr; // Update $elements to include context
    }

    elementsLength = $elements.length; // Get the total number of elements to process

    // Iterate through elements and adjust their width
    for ( i = 0; i < elementsLength; i++ ) {
      $element = $( $elements[i] );
      // Calculate width: parent width minus horizontal padding/borders/margins of the element
      $element.width( $element.parent().width() - ( $element.outerWidth( true ) - $element.width() ) );
    }

    return this; // Allow chaining
  },

  // Helper to make all direct children of an element have the same height
  'same-height' : function sameHeightHelper ( $context, includeContext ) {
    var i, j, currentHeight, maxHeight, $elementColumns, elementColumnsLength, $elements, elementsLength, elementsArr;

    // Find all elements with the 'same-height' class
    $elements = $context.find( '.same-height' );

    // Conditional inclusion of context element
    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

      elementsArr = [];

      if ( $context.hasClass( 'same-height' ) ) {
        elementsArr.push( $context[0] );
      }

      for ( i = 0, l = $elements.length; i < l; i++ ) {
        elementsArr.push( $elements[i] );
      }

      $elements = elementsArr;
    }

    elementsLength = $elements.length;

    // Iterate through elements that need their children to have same height
    for ( i = 0; i < elementsLength; i++ ) {
      $elementColumns = $( $elements[i] ).find( '> *' ); // Direct children
      elementColumnsLength = $elementColumns.length;
      maxHeight = 0; // Reset max height for each parent

      // Find the maximum height among direct children
      for ( j = 0; j < elementColumnsLength; j++ ) {
        currentHeight = $( $elementColumns[j] ).outerHeight( true );
        maxHeight = ( maxHeight > currentHeight ) ? maxHeight : currentHeight;
      }

      // Apply the maximum height to all direct children
      for ( j = 0; j < elementColumnsLength; j++ ) {
        $( $elementColumns[j] ).css( 'height', maxHeight );
      }
    }

    return this;
  },

  // Helper to make elements in the same row have the same height
  'same-row-height' : function ( $context, includeContext ) {
    var i, j, k, currentHeight, maxHeight, $elementColumns, elementColumnsLength, $elements, elementsLength, elementsArr;

    // Find all elements with the 'same-row-height' class
    $elements = $context.find( '.same-row-height' );

    // Conditional inclusion of context element
    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

      elementsArr = [];

      if ( $context.hasClass( 'same-row-height' ) ) {
        elementsArr.push( $context[0] );
      }

      for ( i = 0, l = $elements.length; i < l; i++ ) {
        elementsArr.push( $elements[i] );
      }

      $elements = elementsArr;
    }

    elementsLength = $elements.length;

    // Iterate through elements that need same row height
    for ( i = 0; i < elementsLength; i++ ) {
      $elementColumns = $( $elements[i] ).find( '> *' );
      elementColumnsLength = $elementColumns.length;
      maxHeight = 0;
      var rowColumns = []; // Array to store columns in the current row

      // Iterate through columns to group them by row and find max height
      for ( j = 0; j < elementColumnsLength; j++ ) {
        currentHeight = $( $elementColumns[j] ).outerHeight( true );
        maxHeight = ( maxHeight > currentHeight ) ? maxHeight : currentHeight;
        rowColumns.push( $elementColumns[j] );

        // If the column is the last in its row, apply max height to all in that row
        if ( $( $elementColumns[j] ).hasClass( 'elastic-row-last' ) ) {
          for ( k = 0; k < rowColumns.length; k++ ) {
            $( rowColumns[k] ).css( 'height', maxHeight );
          }
          maxHeight = 0; // Reset for the next row
          rowColumns = []; // Clear row columns
        }
      }
    }

    return this;
  },

  // Helper to make all direct children of an element have the same minimum height
  'same-min-height' : function sameMinHeightHelper ( $context, includeContext ) {
    var i, j, currentHeight, maxHeight, $elementColumns, elementColumnsLength, $elements, elementsLength, elementsArr;

    // Find all elements with the 'same-min-height' class
    $elements = $context.find( '.same-min-height' );

    // Conditional inclusion of context element
    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

      elementsArr = [];

      if ( $context.hasClass( 'same-min-height' ) ) {
        elementsArr.push( $context[0] );
      }

      for ( i = 0, l = $elements.length; i < l; i++ ) {
        elementsArr.push( $elements[i] );
      }

      $elements = elementsArr;
    }

    elementsLength = $elements.length;

    // Iterate through elements that need their children to have same min height
    for ( i = 0; i < elementsLength; i++ ) {
      $elementColumns = $( $elements[i] ).find( '> *' );
      elementColumnsLength = $elementColumns.length;
      maxHeight = 0;

      // Find the maximum height among direct children
      for ( j = 0; j < elementColumnsLength; j++ ) {
        currentHeight = $( $elementColumns[j] ).outerHeight( true );
        maxHeight = ( maxHeight > currentHeight ) ? maxHeight : currentHeight;
      }

      // Apply the maximum height as min-height to all direct children
      for ( j = 0; j < elementColumnsLength; j++ ) {
        $( $elementColumns[j] ).css( 'min-height', maxHeight );
      }
    }

    return this;
  },

  // Helper to make an element take the full height of its parent
  'full-height' : function fullHeightHelper ( $context, includeContext ) {
    var i, l, $element, newHeight, $elements, elementsLength, elementsArr; // $elements and elementsLength are declared but not initialized here for the loop below.

    var context = $context[0];
    var elements = Elastic.querySelectorAll( '.full-height', context ); // This 'elements' variable shadows the outer one.

    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {
      if ( context !== document && context.className.indexOf( 'full-height' ) > -1 ) {
        elements.unshift( context ); // Modifies the local 'elements' array.
      }
    }

    // Note: The loop below uses `elementsLength` and `$elements` which were declared above
    // but not initialized by the code path that assigns `elements` from `querySelectorAll`.
    // This is a direct replication of the provided code's structure.
    for ( i = 0; i < elementsLength; i++ ) {
      $element = $( $elements[i] );
      newHeight = $element.parent().height() - ( $element.outerHeight( true ) - $element.height() );
      if ( newHeight < 0 || isNaN( Number( newHeight ) ) ) {
        continue;
      }
      $element.css( 'height', newHeight );
    }

    return this;
  },

  // Helper to make an element take the full minimum height of its parent
  'full-min-height' : function fullMinHeightHelper ( $context, includeContext ) {
    var i, l, $element, newHeight, $elements, elementsLength, elementsArr;

    // Find all elements with the 'full-min-height' class
    $elements = $context.find( '.full-min-height' );

    // Conditional inclusion of context element
    if ( includeContext !== false && Elastic.configuration.includeContext === true ) {

      elementsArr = []; // Temporary array

      if ( $context.hasClass( 'full-min-height' ) ) {
        elementsArr.push( $context[0] );
      }

      for ( i = 0, l = $elements.length; i < l; i++ ) { // This loop is incomplete in the original code.
        // The original code was truncated here.
        // As per Type I definition, only whitespace and comments can change,
        // so the truncation must be preserved.
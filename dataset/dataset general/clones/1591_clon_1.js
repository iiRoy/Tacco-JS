( function ( ) {
  /*
   * This is the main immediately-invoked function expression (IIFE)
   * that encapsulates all the game logic and variables to avoid global pollution.
   */

  var CELL_SIZE,
      Jelly,
      JellyCell,
      Stage,
      i,
      level,
      levelPicker,
      levels,
      moveToCell,
      option,
      stage,
      _i,
      _ref,
      __indexOf = [ ] . indexOf || function ( item ) {
          /*
           * Polyfill for Array.prototype.indexOf for older browsers.
           * Checks if an item exists in an array and returns its index, or -1 if not found.
           */
          for ( var i = 0, l = this . length; i < l; i++ ) {
              if ( i in this && this[ i ] === item ) {
                  return i;
              }
          }
          return -1;
      };

  // Definition of game levels. Each level is an array of strings representing the map layout.
  // 'x' denotes a wall, ' ' denotes an empty space, 'r', 'g', 'b' denote jelly colors.
  levels = [
      [ "xxxxxxxxxxxxxx",
        "x            x",
        "x            x",
        "x      r     x",
        "x      xx    x",
        "x  g     r b x",
        "xxbxxxg xxxxxx",
        "xxxxxxxxxxxxxx" ],
      [ "xxxxxxxxxxxxxx",
        "x            x",
        "x            x",
        "x            x",
        "x     g   g  x",
        "x   r r   r  x",
        "xxxxx x x xxxx",
        "xxxxxxxxxxxxxx" ],
      [ "xxxxxxxxxxxxxx",
        "x            x",
        "x            x",
        "x   bg  x g  x",
        "xxx xxxrxxx  x",
        "x      b     x",
        "xxx xxxrxxxxxx",
        "xxxxxxxxxxxxxx" ],
      [ "xxxxxxxxxxxxxx",
        "x            x",
        "x       r    x",
        "x       b    x",
        "x       x    x",
        "x b r        x",
        "x b r      b x",
        "xxx x      xxx",
        "xxxxx xxxxxxxx",
        "xxxxxxxxxxxxxx" ],
      [ "xxxxxxxxxxxxxx",
        "x            x",
        "x            x",
        "xrg  gg      x",
        "xxx xxxx xx  x",
        "xrg          x",
        "xxxxx  xx   xx",
        "xxxxxx xx  xxx",
        "xxxxxxxxxxxxxx" ],
      [ "xxxxxxxxxxxxxx",
        "xxxxxxx      x",
        "xxxxxxx g    x",
        "x       xx   x",
        "x r   b      x",
        "x x xxx x g  x",
        "x         x bx",
        "x       r xxxx",
        "x   xxxxxxxxxx",
        "xxxxxxxxxxxxxx" ]
  ];

  // Define the size of each cell in pixels.
  CELL_SIZE = 48;

  /*
   * Helper function to position a DOM element on the grid.
   * Converts grid coordinates (x, y) to pixel coordinates.
   */
  moveToCell = function ( dom, x, y ) {
      dom . style . left = x * CELL_SIZE + 'px';
      return dom . style . top = y * CELL_SIZE + 'px';
  };

  /*
   * The Stage class manages the game board, jellies, and game state.
   * It handles map loading, movement, merges, and completion checks.
   */
  Stage = ( function ( ) {

      function Stage ( dom, map ) {
          var event,
              maybeSwallowEvent,
              _i,
              _len,
              _ref,
              _this = this; // Capture 'this' for use in event listeners.

          this . dom = dom; // The DOM element representing the game stage.
          this . jellies = [ ]; // An array to hold all active Jelly objects.
          this . loadMap( map ); // Initialize the game board from the provided map.
          this . busy = false; // Flag to indicate if an animation or action is in progress.

          // Function to prevent default event behavior and stop propagation if the stage is busy.
          maybeSwallowEvent = function ( e ) {
              e . preventDefault( );
              if ( _this . busy ) {
                  return e . stopPropagation( );
              }
          };

          // Attach event listeners to the stage DOM element to prevent unwanted browser interactions.
          _ref = [ 'contextmenu', 'click', 'touchstart', 'touchmove' ];
          for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
              event = _ref[ _i ];
              this . dom . addEventListener( event, maybeSwallowEvent, true );
          }

          // After loading the map, immediately check for any initial merges.
          this . checkForMerges( );
      }

      /*
       * Loads the game map, creating DOM elements for walls and jellies.
       * Also initializes the internal 'cells' grid representation.
       */
      Stage . prototype . loadMap = function ( map ) {
          var cell,
              color,
              jelly,
              row,
              table,
              td,
              tr,
              x,
              y;

          table = document . createElement( 'table' );
          this . dom . appendChild( table );

          // Initialize the 2D array 'cells' which represents the grid.
          // Each element can be null (empty), a wall TD element, or a Jelly object.
          this . cells = ( function ( ) {
              var _i,
                  _ref,
                  _results;
              _results = [ ];
              for ( y = _i = 0, _ref = map . length; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i ) {
                  row = map[ y ] . split( /(?:)/ ); // Split string into characters.
                  tr = document . createElement( 'tr' );
                  table . appendChild( tr );

                  _results . push( ( function ( ) {
                      var _j,
                          _ref1,
                          _results1;
                      _results1 = [ ];
                      for ( x = _j = 0, _ref1 = row . length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j ) {
                          color = null;
                          cell = null;

                          // Process each character in the map row.
                          switch ( row[ x ] ) {
                              case 'x':
                                  cell = document . createElement( 'td' );
                                  cell . className = 'cell wall';
                                  tr . appendChild( cell );
                                  break;
                              case 'r':
                                  color = 'red';
                                  break;
                              case 'g':
                                  color = 'green';
                                  break;
                              case 'b':
                                  color = 'blue';
                          }

                          // If it's not a wall, create a transparent cell for spacing.
                          if ( !cell ) {
                              td = document . createElement( 'td' );
                              td . className = 'transparent';
                              tr . appendChild( td );
                          }

                          // If a color is specified, create a new Jelly.
                          if ( color ) {
                              jelly = new Jelly( this, x, y, color );
                              this . dom . appendChild( jelly . dom );
                              this . jellies . push( jelly );
                              cell = jelly; // Store Jelly object in the grid.
                          }
                          _results1 . push( cell );
                      }
                      return _results1;
                  } ) . call( this ) );
              }
              return _results;
          } ) . call( this );

          // Add borders to cells to visually separate them.
          this . addBorders( );
      };

      /*
       * Adds borders to the wall cells (TD elements) where they meet empty space or jellies.
       * This creates the visual effect of a maze.
       */
      Stage . prototype . addBorders = function ( ) {
          var attr,
              border,
              cell,
              dx,
              dy,
              edges,
              other,
              x,
              y,
              _i,
              _j,
              _k,
              _len,
              _ref,
              _ref1,
              _ref2,
              _ref3,
              _ref4;

          for ( y = _i = 0, _ref = this . cells . length; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i ) {
              for ( x = _j = 0, _ref1 = this . cells[ 0 ] . length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j ) {
                  cell = this . cells[ y ][ x ];

                  // Only consider actual wall cells (TD elements, not Jellies or null).
                  if ( !( cell && cell . tagName === 'TD' ) ) {
                      continue;
                  }

                  border = 'solid 1px #777'; // Style for the border.

                  // Define relative coordinates for checking adjacent cells and corresponding border properties.
                  edges = [ [ 'borderBottom', 0, 1 ], [ 'borderTop', 0, -1 ], [ 'borderLeft', -1, 0 ], [ 'borderRight', 1, 0 ] ];
                  for ( _k = 0, _len = edges . length; _k < _len; _k++ ) {
                      _ref2 = edges[ _k ],
                      attr = _ref2[ 0 ],
                      dx = _ref2[ 1 ],
                      dy = _ref2[ 2 ];

                      // Check if the adjacent cell is within bounds.
                      if ( !( ( 0 <= ( _ref3 = y + dy ) && _ref3 < this . cells . length ) ) ) {
                          continue;
                      }
                      if ( !( ( 0 <= ( _ref4 = x + dx ) && _ref4 < this . cells[ 0 ] . length ) ) ) {
                          continue;
                      }

                      other = this . cells[ y + dy ][ x + dx ];

                      // If the adjacent cell is not a wall (i.e., empty or a jelly), add a border to the current wall cell.
                      if ( !( other && other . tagName === 'TD' ) ) {
                          cell . style[ attr ] = border;
                      }
                  }
              }
          }
      };

      /*
       * Waits for CSS transitions to complete before executing a callback.
       * This is crucial for synchronizing game logic with visual animations.
       */
      Stage . prototype . waitForAnimation = function ( cb ) {
          var end,
              name,
              names,
              _i,
              _len,
              _this = this;

          names = [ 'transitionend', 'webkitTransitionEnd' ]; // List of transition end events.

          // The handler function for transition end events.
          end = function ( ) {
              var name,
                  _i,
                  _len;
              // Remove all listeners to prevent multiple calls.
              for ( _i = 0, _len = names . length; _i < _len; _i++ ) {
                  name = names[ _i ];
                  _this . dom . removeEventListener( name, end );
              }
              // Execute the callback after a slight delay to ensure event propagation is complete.
              return setTimeout( cb, 0 );
          };

          // Attach transition end listeners to the stage DOM element.
          for ( _i = 0, _len = names . length; _i < _len; _i++ ) {
              name = names[ _i ];
              this . dom . addEventListener( name, end );
          }
      };

      /*
       * Attempts to slide a jelly (or a group of jellies) in a given direction.
       * Handles movement, fall checks, and merge checks after animation.
       */
      Stage . prototype . trySlide = function ( jelly, dir ) {
          var jellies,
              _this = this;

          jellies = [ jelly ]; // Start with the initial jelly.
          // Check if the path is blocked by a wall or an unmovable jelly.
          if ( this . checkFilled( jellies, dir, 0 ) ) {
              return; // If blocked, do nothing.
          }

          this . busy = true; // Set busy flag to prevent other actions during animation.
          this . move( jellies, dir, 0 ); // Perform the visual movement.

          // Wait for the movement animation to complete.
          return this . waitForAnimation( function ( ) {
              // After sliding, check if any jellies need to fall due to gravity.
              return _this . checkFall( function ( ) {
                  // After falling, check for any new merges.
                  _this . checkForMerges( );
                  _this . busy = false; // Reset busy flag.
              } );
          } );
      };

      /*
       * Moves a collection of jellies by a specified delta (dx, dy).
       * Updates both their visual positions and their logical positions in the 'cells' grid.
       */
      Stage . prototype . move = function ( jellies, dx, dy ) {
          var jelly,
              x,
              y,
              _i,
              _j,
              _k,
              _l,
              _len,
              _len1,
              _len2,
              _len3,
              _len4,
              _m,
              _ref,
              _ref1,
              _ref2,
              _ref3;

          // Step 1: Clear current positions in the grid for all jellies.
          for ( _i = 0, _len = jellies . length; _i < _len; _i++ ) {
              jelly = jellies[ _i ];
              _ref = jelly . cellCoords( );
              for ( _j = 0, _len1 = _ref . length; _j < _len1; _j++ ) {
                  _ref1 = _ref[ _j ],
                  x = _ref1[ 0 ],
                  y = _ref1[ 1 ];
                  this . cells[ y ][ x ] = null;
              }
          }

          // Step 2: Update each jelly's internal (x, y) coordinates.
          for ( _k = 0, _len2 = jellies . length; _k < _len2; _k++ ) {
              jelly = jellies[ _k ];
              jelly . updatePosition( jelly . x + dx, jelly . y + dy );
          }

          // Step 3: Update the grid with the new positions of all jellies.
          for ( _l = 0, _len3 = jellies . length; _l < _len3; _l++ ) {
              jelly = jellies[ _l ];
              _ref2 = jelly . cellCoords( );
              for ( _m = 0, _len4 = _ref2 . length; _m < _len4; _m++ ) {
                  _ref3 = _ref2[ _m ],
                  x = _ref3[ 0 ],
                  y = _ref3[ 1 ];
                  this . cells[ y ][ x ] = jelly;
              }
          }
      };

      /*
       * Checks if a jelly (or a group of jellies) can move in a given direction (dx, dy).
       * It recursively identifies all connected jellies that would move together.
       * Returns true if blocked, false if clear to move.
       */
      Stage . prototype . checkFilled = function ( jellies, dx, dy ) {
          var done,
              jelly,
              next,
              x,
              y,
              _i,
              _j,
              _len,
              _len1,
              _ref,
              _ref1;

          done = false;
          while ( !done ) {
              done = true;
              for ( _i = 0, _len = jellies . length; _i < _len; _i++ ) {
                  jelly = jellies[ _i ];
                  _ref = jelly . cellCoords( );
                  for ( _j = 0, _len1 = _ref . length; _j < _len1; _j++ ) {
                      _ref1 = _ref[ _j ],
                      x = _ref1[ 0 ],
                      y = _ref1[ 1 ];

                      // Get the next cell in the direction of movement.
                      next = this . cells[ y + dy ][ x + dx ];

                      // If the next cell is occupied and not part of the current moving group.
                      if ( next && __indexOf . call( jellies, next ) < 0 ) {
                          // If it's a wall (not an instanceof Jelly), then it's blocked.
                          if ( !( next instanceof Jelly ) ) {
                              return true;
                          }
                          // If it's another jelly, add it to the group to be moved and continue checking.
                          jellies . push( next );
                          done = false;
                          break;
                      }
                  }
              }
          }
          return false; // No blocking elements found.
      };

      /*
       * Checks if any jellies need to fall due to gravity (empty space below them).
       * Performs iterative falls until no more jellies can fall.
       * Calls the callback after all falling animations complete.
       */
      Stage . prototype . checkFall = function ( cb ) {
          var didOneMove,
              jelly,
              moved,
              _i,
              _len,
              _ref;

          moved = false; // Flag to track if any jelly moved in this entire fall sequence.
          didOneMove = true; // Flag to track if any jelly moved in the current iteration.

          // Keep iterating as long as some jelly moved in the last pass.
          while ( didOneMove ) {
              didOneMove = false;
              _ref = this . jellies;
              for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
                  jelly = _ref[ _i ];
                  // If a jelly can fall (not blocked below).
                  if ( !this . checkFilled( [ jelly ], 0, 1 ) ) {
                      this . move( [ jelly ], 0, 1 ); // Move it down.
                      didOneMove = true; // Mark that a move occurred.
                      moved = true;      // Mark that overall movement occurred.
                  }
              }
          }

          // If any jellies moved, wait for their animations to finish, then call callback.
          if ( moved ) {
              this . waitForAnimation( cb );
          } else {
              // Otherwise, call callback immediately.
              cb( );
          }
      };

      /*
       * Continuously checks for and performs merges between adjacent jellies of the same color.
       * Repeats until no more merges are possible.
       * After merging, checks for level completion.
       */
      Stage . prototype . checkForMerges = function ( ) {
          var jelly,
              merged,
              x,
              y,
              _i,
              _len,
              _ref,
              _ref1;

          merged = false;
          // Keep merging as long as doOneMerge returns a merged jelly.
          while ( jelly = this . doOneMerge( ) ) {
              merged = true;
              // Update the grid with the new, larger jelly.
              _ref = jelly . cellCoords( );
              for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
                  _ref1 = _ref[ _i ],
                  x = _ref1[ 0 ],
                  y = _ref1[ 1 ];
                  this . cells[ y ][ x ] = jelly;
              }
          }

          // If any merges occurred, check if the level is completed.
          if ( merged ) {
              this . checkForCompletion( );
          }
      };

      /*
       * Checks if the level has been completed.
       * A level is completed when all jellies of the same color have merged into a single jelly.
       */
      Stage . prototype . checkForCompletion = function ( ) {
          var colors,
              j,
              _i,
              _len,
              _ref;

          colors = { }; // Object to track unique jelly colors.
          _ref = this . jellies;
          for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
              j = _ref[ _i ];
              colors[ j . color ] = 1; // Mark the jelly's color as present.
          }

          // If the number of unique colors equals the total number of jellies,
          // it means each color has consolidated into one jelly.
          if ( Object . keys( colors ) . length === this . jellies . length ) {
              alert( "Congratulations! Level completed." );
          }
      };

      /*
       * Finds and performs a single merge operation between two adjacent jellies of the same color.
       * Returns the newly merged jelly, or null if no merge was found.
       */
      Stage . prototype . doOneMerge = function ( ) {
          var dx,
              dy,
              jelly,
              other,
              x,
              y,
              _i,
              _j,
              _k,
              _len,
              _len1,
              _len2,
              _ref,
              _ref1,
              _ref2,
              _ref3,
              _ref4;

          _ref = this . jellies;
          for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
              jelly = _ref[ _i ];
              _ref1 = jelly . cellCoords( );
              for ( _j = 0, _len1 = _ref1 . length; _j < _len1; _j++ ) {
                  _ref2 = _ref1[ _j ],
                  x = _ref2[ 0 ],
                  y = _ref2[ 1 ];

                  // Check adjacent cells (right and bottom) for potential merges.
                  _ref3 = [ [ 1, 0 ], [ 0, 1 ] ];
                  for ( _k = 0, _len2 = _ref3 . length; _k < _len2; _k++ ) {
                      _ref4 = _ref3[ _k ],
                      dx = _ref4[ 0 ],
                      dy = _ref4[ 1 ];

                      // Get the adjacent cell.
                      other = this . cells[ y + dy ][ x + dx ];

                      // Skip if no other jelly, or if it's the same jelly, or different colors.
                      if ( !( other && other instanceof Jelly ) ) {
                          continue;
                      }
                      if ( other === jelly ) {
                          continue;
                      }
                      if ( jelly . color !== other . color ) {
                          continue;
                      }

                      // Perform the merge.
                      jelly . merge( other );
                      // Remove the 'other' jelly from the active jellies list.
                      this . jellies = this . jellies . filter( function ( j ) {
                          return j !== other;
                      } );
                      return jelly; // Return the merged jelly.
                  }
              }
          }
          return null; // No merge found.
      };

      return Stage;

  } ) ( );

  /*
   * The JellyCell class represents a single square component of a multi-cell jelly.
   * A Jelly object can be composed of multiple JellyCells after merging.
   */
  JellyCell = ( function ( ) {

      function JellyCell ( jelly, x, y, color ) {
          this . jelly = jelly; // Reference to the parent Jelly object.
          this . x = x;         // X-coordinate relative to the parent Jelly's origin.
          this . y = y;         // Y-coordinate relative to the parent Jelly's origin.
          this . dom = document . createElement( 'div' );
          this . dom . className = 'cell jelly ' + color; // Apply CSS classes for styling.
      }

      return JellyCell;

  } ) ( );

  /*
   * The Jelly class represents a movable, mergeable block of color.
   * It handles its own position, appearance, and interaction.
   */
  Jelly = ( function ( ) {

      function Jelly ( stage, x, y, color ) {
          var cell,
              _this = this; // Capture 'this' for event listeners.

          this . x = x;       // Global X-coordinate of the jelly's top-leftmost cell.
          this . y = y;       // Global Y-coordinate of the jelly's top-leftmost cell.
          this . color = color; // The color of the jelly.
          this . dom = document . createElement( 'div' );
          this . updatePosition( this . x, this . y ); // Set initial visual position.
          this . dom . className = 'cell jellybox'; // Container for JellyCells.

          // Create the initial single JellyCell.
          cell = new JellyCell( this, 0, 0, this . color );
          this . dom . appendChild( cell . dom );
          this . cells = [ cell ]; // Array to hold all JellyCells belonging to this Jelly.

          // Event listener for right-click (contextmenu) to slide right.
          this . dom . addEventListener( 'contextmenu', function ( e ) {
              return stage . trySlide( _this, 1 ); // Slide right (dx = 1).
          } );

          // Event listener for left-click to slide left.
          this . dom . addEventListener( 'click', function ( e ) {
              return stage . trySlide( _this, -1 ); // Slide left (dx = -1).
          } );

          // Event listener for touch start to record initial touch position.
          this . dom . addEventListener( 'touchstart', function ( e ) {
              return _this . start = e . touches[ 0 ] . pageX;
          } );

          // Event listener for touch move to determine slide direction based on swipe.
          this . dom . addEventListener( 'touchmove', function ( e ) {
              var dx;
              dx = e . touches[ 0 ] . pageX - _this . start; // Calculate horizontal displacement.
              if ( Math . abs( dx ) > 10 ) { // If movement is significant enough to be considered a swipe.
                  dx = Math . max( Math . min( dx, 1 ), -1 ); // Normalize dx to -1 or 1.
                  return stage . trySlide( _this, dx );
              }
          } );
      }

      /*
       * Returns an array of global grid coordinates occupied by this jelly's cells.
       */
      Jelly . prototype . cellCoords = function ( ) {
          var cell,
              _i,
              _len,
              _ref,
              _results;

          _ref = this . cells;
          _results = [ ];
          for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
              cell = _ref[ _i ];
              _results . push( [ this . x + cell . x, this . y + cell . y ] );
          }
          return _results;
      };

      /*
       * Updates the global position (x, y) of the jelly and its visual representation.
       */
      Jelly . prototype . updatePosition = function ( x, y ) {
          this . x = x;
          this . y = y;
          return moveToCell( this . dom, this . x, this . y );
      };

      /*
       * Merges this jelly with another jelly of the same color.
       * Transfers all cells from the 'other' jelly to this jelly, updates positions,
       * and adjusts borders to remove internal lines.
       */
      Jelly . prototype . merge = function ( other ) {
          var cell,
              dx,
              dy,
              othercell,
              _i,
              _j,
              _k,
              _len,
              _len1,
              _len2,
              _ref,
              _ref1,
              _ref2;

          // Calculate the relative displacement of the 'other' jelly to 'this' jelly.
          dx = other . x - this . x;
          dy = other . y - this . y;

          _ref = other . cells;
          for ( _i = 0, _len = _ref . length; _i < _len; _i++ ) {
              cell = _ref[ _i ];
              this . cells . push( cell ); // Add cell to this jelly's collection.
              cell . x += dx;              // Adjust cell's relative x-coordinate.
              cell . y += dy;              // Adjust cell's relative y-coordinate.
              moveToCell( cell . dom, cell . x, cell . y ); // Move cell visually within this jelly's container.
              this . dom . appendChild( cell . dom ); // Re-parent the cell's DOM element.
          }

          other . cells = null; // Clear cells from the merged jelly.
          other . dom . parentNode . removeChild( other . dom ); // Remove the merged jelly's main DOM element.

          // Adjust internal borders between merged cells.
          _ref1 = this . cells;
          for ( _j = 0, _len1 = _ref1 . length; _j < _len1; _j++ ) {
              cell = _ref1[ _j ];
              _ref2 = this . cells;
              for ( _k = 0, _len2 = _ref2 . length; _k < _len2; _k++ ) {
                  othercell = _ref2[ _k ];
                  if ( othercell === cell ) {
                      continue;
                  }

                  // If cells are adjacent, remove the border between them.
                  if ( othercell . x === cell . x + 1 && othercell . y === cell . y ) {
                      cell . dom . style . borderRight = 'none';
                  } else if ( othercell . x === cell . x - 1 && othercell . y === cell . y ) {
                      cell . dom . style . borderLeft = 'none';
                  } else if ( othercell . x === cell . x && othercell . y === cell . y + 1 ) {
                      cell . dom . style . borderBottom = 'none';
                  } else if ( othercell . x === cell . x && othercell . y === cell . y - 1 ) {
                      cell . dom . style . borderTop = 'none';
                  }
              }
          }
      };

      return Jelly;

  } ) ( );

  // Determine the initial level from the URL query string, defaulting to 1.
  level = parseInt( location . search . substr( 1 ), 10 ) || 1;

  // Initialize the game stage with the selected level's map.
  stage = new Stage( document . getElementById( 'map' ), levels[ level - 1 ] );

  // Expose the stage object globally for debugging purposes (optional).
  window . stage = stage;

  // Get the level picker dropdown element.
  levelPicker = document . getElementById( 'level' );

  // Populate the level picker dropdown with options for each level.
  for ( i = _i = 1, _ref = levels . length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i ) {
      option = document . createElement( 'option' );
      option . value = i;
      option . innerText = "Level " + i;
      levelPicker . appendChild( option );
  }

  // Set the level picker's value to the current level.
  levelPicker . value = level;

  // Add an event listener to the level picker to change the level when selected.
  levelPicker . addEventListener( 'change', function ( ) {
      return location . search = '?' + levelPicker . value; // Reload page with new level in query string.
  } );

  // Add an event listener to the reset button to restart the current level.
  document . getElementById( 'reset' ) . addEventListener( 'click', function ( ) {
      stage . dom . innerHTML = ''; // Clear the current stage's content.
      return stage = new Stage( stage . dom, levels[ level - 1 ] ); // Reinitialize the stage.
  } );

} ) . call( this );

// This script was originally generated by CoffeeScript 1.5.0-pre.
// Minor adjustments for Type I cloning have been applied.
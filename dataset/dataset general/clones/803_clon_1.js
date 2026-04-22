/*
 * This section defines various constant values used throughout the application.
 * These constants control dimensions, counts, and other fixed parameters.
 */
var CARD_HEIGHT = 100; /* Default height of a card in pixels */
var CARD_WIDTH = 60;   // Default width of a card
var CARD_COUNT = 40;   // Total number of cards to be generated.

var WIDTH = 800; /* Initial canvas width */
var HEIGHT = 600; /* Initial canvas height */
var BOTTOM = 400; // A base Y-coordinate, perhaps for UI elements or card stacking.

// Mathematical constants for card tilting effects
var TILT = Math.PI / 8; // Angle for card tilt
var PYTH_ANGLE = Math.PI / 2 - TILT; // Complementary angle for Pythagorean calculations

/*
 * Derived card dimensions based on tilt.
 * These are calculated to ensure proper visual stacking and spacing.
 */
var TILTED_CARD_HEIGHT = Math.sin(PYTH_ANGLE) * CARD_HEIGHT + 2;
var TILTED_CARD_WIDTH = Math.cos(PYTH_ANGLE) * CARD_HEIGHT;
var CARD_SPACING = 2; // Additional spacing between cards
var PYRAMID_WIDTH = TILTED_CARD_WIDTH * 2 + CARD_SPACING * 2; // Width for a pyramid base.

// Function to dynamically update card and container sizes based on window/container dimensions.
function update_sizes()
{
  // Retrieve the main container element by its ID.
  var c = document.getElementById( 'container' );

  // Update global width and height based on the container's current dimensions.
  WIDTH = c.clientWidth;
  HEIGHT = c.clientHeight;

  // Recalculate card dimensions as a percentage of the new container size.
  CARD_WIDTH = WIDTH * 0.05;
  CARD_HEIGHT = HEIGHT * 0.15;

  // Recalculate tilted card dimensions with the new CARD_HEIGHT.
  TILTED_CARD_HEIGHT = Math.sin(PYTH_ANGLE) * CARD_HEIGHT + 2;
  TILTED_CARD_WIDTH = Math.cos(PYTH_ANGLE) * CARD_HEIGHT;

  // Update the pyramid width based on the newly calculated tilted card dimensions.
  PYRAMID_WIDTH = TILTED_CARD_WIDTH * 2 + CARD_SPACING * 2;

  // Iterate through all cards in the Deck and apply the new dimensions to their styles.
  for( var i = 0; i < Deck.cards.length; ++i )
  {
    Deck.card_at(i).style.height = CARD_HEIGHT + 'px';
    Deck.card_at(i).style.width = CARD_WIDTH + 'px';
  } // End of card resizing loop.
} // End of update_sizes function.


// Generate an array of random colors for the cards.
var COLORS = randomColor( {
  count: 40,      // Number of colors to generate.
  luminosity: 'dark', // Prefer dark colors.
} ); // End of randomColor call.


/*
 *  This section defines constants representing different card formation modes.
 *  Each constant corresponds to a specific layout or arrangement of cards.
 */
var PILE = 1;     // Represents a simple pile formation.
var HOUSE = 2;    // Represents a house-like structure.
var WALL = 3;     // Represents a flat wall formation.
var CYLINDER = 4; // Represents cards arranged in a cylinder shape.
var current_mode; // Variable to keep track of the currently active formation mode.

// Object mapping formation mode constants to their respective builder functions.
var formation_builders = {};
formation_builders[PILE] = pile_positions;       // Builder for pile formation.
formation_builders[HOUSE] = house_positions;     // Builder for house formation.
formation_builders[WALL] = wall_positions;       // Builder for wall formation.
formation_builders[CYLINDER] = cylinder_positions; // Builder for cylinder formation.


// Function to create a single card element and append it to a container.
function create_card( container, index ) {
  var card = document.createElement('div'); // Create a new div element for the card.
  card.className = 'card'; // Assign the 'card' class for styling.
  card.style.background = COLORS[index % COLORS.length]; // Set background color from the COLORS array.

  container.appendChild(card); // Add the newly created card to the specified container.
  return card; // Return the created card element.
} // End of create_card function.

/*
 * The Deck module manages the collection of cards.
 * It provides methods for accessing cards, getting the next card, and resetting the deck.
 */
var Deck = ( function() {
  // Internal array to hold all card DOM elements.
  this.cards = [];
  // Index to keep track of the next card to be dealt or accessed sequentially.
  this.card_index = 0; // Initialize card_index to 0.

  // Loop to create all cards and populate the 'cards' array.
  for( var i = 0; i < CARD_COUNT; ++i ) {
    var container = document.getElementById('surface'); // Get the main surface container.
    this.cards.push( create_card( container, i ) ); // Create a card and add it to the deck.
  } // End of card creation loop.

  // Method to get the next available card from the deck.
  this.next_card = function() {
    // Check if the card index has exceeded the maximum (e.g., 51 for a standard deck).
    if( this.card_index > 51 )
    {
      return; // If deck is exhausted, return undefined.
    }
    // Return the card at the current index and then increment the index.
    return this.cards[this.card_index++];
  }; // End of next_card method.

  // Method to get a card at a specific index.
  this.card_at = function( index ) {
    return this.cards[index];
  }; // End of card_at method.

  // Method to reset the deck, making all cards available again.
  this.reset = function() {
    this.card_index = 0; // Reset the card index to the beginning.
  }; // End of reset method.

  return this; // Return the 'Deck' object.
} ) (); // Immediately-invoked function expression (IIFE) for Deck.


// Function to build a card formation based on a given array of positions.
function build_formation( positions ) {
  Deck.reset(); // Reset the deck to ensure all cards are available.

  // Loop through each position and animate the next card to that position.
  for( i = 0; i < positions.length; ++i )
  {
    snabbt( Deck.next_card(), {
      position: positions[i].position, // Target 3D position [x, y, z].
      rotation: positions[i].rotation, // Target 3D rotation [rx, ry, rz].
      easing: 'ease',                  // Animation easing function.
      delay: i * 50                    // Stagger the animation start for each card.
    } ); // End of snabbt animation call.
  } // End of positions loop.
} // End of build_formation function.


// Function to set the current formation mode and update card positions.
function set_mode( mode ) {
  update_sizes(); // First, update the sizes in case the container has changed.

  // If the requested mode is already the current mode, do nothing.
  if( mode == current_mode )
  {
    return;
  }

  // Get the position data for the new mode using the formation builders.
  positions = formation_builders[mode]();
  build_formation(positions); // Build the formation with the generated positions.

  current_mode = mode; // Update the current mode.
} // End of set_mode function.


// Function to continuously rotate the main 'surface' container.
function rotate_container() {
  var container = document.getElementById( 'surface' ); // Get the surface container.
  snabbt( container, {
    rotation: [ 0, 2 * Math.PI, 0 ], // Rotate around the Y-axis indefinitely.
    duration: 10000,                 // Duration for one full rotation (10 seconds).
    perspective: 2000,               // Apply a perspective effect for 3D viewing.
    loop: Infinity                   // Loop the animation infinitely.
  } ); // End of snabbt animation call.
} // End of rotate_container function.


// Calculates positions for a simple pile formation.
function pile_positions() {
  Deck.reset(); // Ensure the deck is reset.
  var positions = []; // Array to store calculated card positions.

  var i = 0; // Loop counter.
  var card = Deck.next_card(); // Get the first card.
  var center = ( WIDTH - CARD_WIDTH ) / 2; // Calculate horizontal center.
  var y = HEIGHT - HEIGHT * 0.2; // Calculate starting Y position.

  // Loop while there are cards available from the deck.
  while( card )
  {
    positions.push( {
      position: [ center, y - i * 0.5, WIDTH * 0.1 ], // Position cards slightly offset on Y and Z.
      rotation: [ Math.PI / 2, 0, 0 ],               // Rotate cards to face upwards/forwards.
    } ); // End of position object.
    ++i; // Increment counter.
    card = Deck.next_card(); // Get the next card.
  } // End of while loop.
  return positions; // Return the array of positions.
} // End of pile_positions function.


// Calculates positions for a house-like formation (pyramid of cards).
function house_positions() {
  Deck.reset(); // Reset the deck for a fresh build.

  var floors = 5; // Number of floors in the house structure.
  // Calculate initial Y position for the bottom floor.
  var y = ( floors - 1 ) * TILTED_CARD_HEIGHT + TILTED_CARD_HEIGHT / 2;
  var z = -WIDTH * 0.2; // Z-offset for the formation.
  // Calculate initial X position to center the widest part of the base.
  var x = ( WIDTH - PYRAMID_WIDTH * floors ) / 2 - TILTED_CARD_WIDTH;

  var positions = []; // Array to hold all calculated positions.
  var i; // Loop counter for floors.
  // Iterate through each floor from bottom to top.
  for( i = 0; i < floors; ++i ) {
    var _x = x + i * TILTED_CARD_WIDTH + i * CARD_SPACING; // X-offset for the current floor.
    var _y = y - i * TILTED_CARD_HEIGHT - i * CARD_SPACING; // Y-offset for the current floor.
    // Concatenate positions from the row builder for the current floor.
    positions = positions.concat( house_row_positions( floors - i, _x, _y, z ) );
  } // End of floors loop.

  return positions; // Return the complete set of positions.
} // End of house_positions function.


// Helper function to calculate positions for a single row of the house formation.
function house_row_positions( count, x, y, z ) {
  var positions = []; // Array to store positions for this row.
  var i; // Loop counter.
  // Section for tilted cards forming the "walls" of the house structure.
  for( i = 0; i < count; ++i ) {
    // Get the two tilted card positions for a pyramid segment.
    card_positions = pyramid_postions( x + i * PYRAMID_WIDTH, y, z );
    positions.push( {
      position: card_positions[0].position, // First tilted card.
      rotation: card_positions[0].rotation,
    } );
    positions.push( {
      position: card_positions[1].position, // Second tilted card.
      rotation: card_positions[1].rotation,
    } );
  } // End of tilted cards loop.
  // Section for "bridge" cards that lie flat on top of the tilted cards.
  for( i = 0; i < count - 1; ++i ) {
    positions.push( {
      position: [ x + i * PYRAMID_WIDTH + TILTED_CARD_WIDTH, y - TILTED_CARD_HEIGHT / 2 - CARD_SPACING / 2, z ], // Position for the bridge card.
      rotation: [ Math.PI / 2, Math.PI / 2, 0 ], // Rotate bridge cards to be flat.
    } ); // End of bridge card position object.
  } // End of bridge cards loop.
  return positions; // Return row positions.
} // End of house_row_positions function.


// Calculates the positions and rotations for two tilted cards forming a pyramid base.
function pyramid_postions( x, y, z ) {
  // Note: Firefox might show flickering if elements have exact overlap.
  var spacing = ( TILTED_CARD_WIDTH / 2 ) + CARD_SPACING / 2; // Spacing for tilted cards.

  return [ {
    position: [ x - spacing, y, z ], // Position for the left tilted card.
    rotation: [ -TILT, Math.PI / 2, 0 ], // Rotation for the left card.
  }, {
    position: [ x + spacing, y, z ], // Position for the right tilted card.
    rotation: [ TILT, Math.PI / 2, 0 ], // Rotation for the right card.
  } ]; // Return array of two position objects.
} // End of pyramid_postions function.


// Calculates positions for a flat wall formation of cards.
function wall_positions() {
  var positions = []; // Array to store wall card positions.
  var w = CARD_WIDTH + 10; // Effective width per card, including some padding.
  var h = CARD_HEIGHT + 10; // Effective height per card, including some padding.
  var start_x = ( WIDTH - 10 * w ) / 2; // Calculate starting X to center the wall.
  var start_y = ( HEIGHT - 4 * h ) / 2; // Calculate starting Y to center the wall.
  // Loop through all cards to arrange them in a grid.
  for( var i = 0; i < CARD_COUNT; ++i ) {
    var x = ( i % 10 ) * w + start_x; // Calculate X position based on column.
    var y = ( Math.floor( i / 10 ) ) * h + start_y; // Calculate Y position based on row.
    positions.push( {
      position: [ x, y, 0 ], // Cards are flat on the Z=0 plane.
      rotation: [ 0, 0, 0 ]   // No rotation for flat wall cards.
    } ); // End of position object.
  } // End of wall loop.
  return positions; // Return the array of wall positions.
} // End of wall_positions function.


// Calculates positions for a cylinder formation of cards.
function cylinder_positions() {
  var positions = []; // Array to store cylinder card positions.
  var start_x = WIDTH / 2; // X-coordinate for the center of the cylinder.
  var start_y = HEIGHT * 0.1; // Starting Y-coordinate for the bottom of the cylinder.
  var radius = WIDTH * 0.2; // Radius of the cylinder.
  // Loop through all cards to arrange them around the cylinder.
  for( var i = 0; i < CARD_COUNT; ++i ) {
    var angle = ( ( i % 10 ) / 10 ) * 2 * Math.PI; // Calculate angle around the cylinder.
    var x = Math.cos( angle ) * radius + start_x; // X position on the cylinder's circumference.
    var z = Math.sin( angle ) * radius; // Z position on the cylinder's circumference.
    var y = Math.floor( i / 10 ) * 1.2 * CARD_HEIGHT + start_y; // Y position for stacking layers.
    positions.push( {
      position: [ x, y, z ], // 3D position for the card.
      rotation: [ 0, Math.PI / 2 + angle, 0 ], // Rotate card to face outwards from the cylinder center.
    } ); // End of position object.
  } // End of cylinder loop.
  return positions; // Return the array of cylinder positions.
} // End of cylinder_positions function.

// Helper function to set the mode to WALL.
function build_wall() {
  set_mode( WALL ); // Call set_mode with the WALL constant.
} // End of build_wall function.

// Helper function to set the mode to HOUSE.
function build_house() {
  set_mode( HOUSE ); // Call set_mode with the HOUSE constant.
} // End of build_house function.

// Helper function to set the mode to PILE.
function build_pile() {
  set_mode( PILE ); // Call set_mode with the PILE constant.
} // End of build_pile function.


/*
 *  Initialization function, called when the document is ready.
 *  Sets up the initial state, event listeners, and animations.
 */
function init() {
  update_sizes(); // Ensure initial sizes are correct.
  Deck.reset();   // Reset the card deck.
  build_pile();   // Start with the pile formation.
  rotate_container(); // Begin continuous rotation of the container.

  // Initialize FastClick library for better touch event performance on mobile.
  FastClick.attach( document.body );

  // Define a mapping of button IDs to their corresponding formation modes.
  var buttons = {
    "pile_button": PILE,
    "house_button": HOUSE,
    "wall_button": WALL,
    "cylinder_button": CYLINDER
  };

  // Define a generic click handler for the formation buttons.
  var click_handler = function( key ) {
    // Remove 'button-primary' class from all buttons to reset their active state.
    document.getElementById( 'pile_button' ).className = '';
    document.getElementById( 'house_button' ).className = '';
    document.getElementById( 'wall_button' ).className = '';
    document.getElementById( 'cylinder_button' ).className = '';
    // Add 'button-primary' class to the clicked button to highlight it.
    document.getElementById( key ).className = 'button-primary';
    set_mode( buttons[key] ); // Set the formation mode based on the button clicked.
  }; // End of click_handler.

  // Attach the click handler to each formation button.
  for( var key in buttons ) {
    document.getElementById( key ).addEventListener( 'click', click_handler.bind( undefined, key ) );
  } // End of button event listener loop.
} // End of init function.
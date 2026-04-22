// Global configuration parameters
var TILE_HEIGHT = 100; // Standard height for a single display tile
var TILE_WIDTH = 60;   // Standard width for a single display tile
var TILE_AMOUNT = 40;  // Total count of visual tiles

var VIEW_WIDTH = 800;  // Current viewport's horizontal dimension
var VIEW_HEIGHT = 600; // Current viewport's vertical dimension
var FLOOR_LEVEL = 400; // Y-coordinate representing the ground plane

var SLANT_ANGLE = Math.PI / 8; // Angular tilt for specific arrangements
var RIGHT_TRI_ANGLE = Math.PI / 2 - SLANT_ANGLE; // Derived angle for trigonometric calculations

var ANGLED_TILE_HEIGHT = Math.sin(RIGHT_TRI_ANGLE) * TILE_HEIGHT + 2; // Effective height of a tilted tile
var ANGLED_TILE_WIDTH = Math.cos(RIGHT_TRI_ANGLE) * TILE_HEIGHT;      // Effective width of a tilted tile
var TILE_GAP = 2; // Separation distance between adjacent tiles
var STRUCTURE_WIDTH = ANGLED_TILE_WIDTH * 2 + TILE_GAP * 2; // Calculated width for a base pyramid unit

function refresh_dimensions() {
    // Obtain reference to the main display container element
    var contElem = document.getElementById('container');

    // Update global viewport dimensions based on container
    VIEW_WIDTH = contElem.clientWidth;
    VIEW_HEIGHT = contElem.clientHeight;

    // Adjust tile dimensions proportionally to the new viewport size
    TILE_WIDTH = VIEW_WIDTH * 0.05;
    TILE_HEIGHT = VIEW_HEIGHT * 0.15;

    // Recalculate dimensions for tilted tiles with new base sizes
    ANGLED_TILE_HEIGHT = Math.sin(RIGHT_TRI_ANGLE) * TILE_HEIGHT + 2;
    ANGLED_TILE_WIDTH = Math.cos(RIGHT_TRI_ANGLE) * TILE_HEIGHT;
    STRUCTURE_WIDTH = ANGLED_TILE_WIDTH * 2 + TILE_GAP * 2;

    // Apply the newly calculated dimensions to all existing tile elements
    for (var k = 0; k < TileSet.tiles.length; ++k) {
        TileSet.fetch_tile_by_index(k).style.height = TILE_HEIGHT + 'px';
        TileSet.fetch_tile_by_index(k).style.width = TILE_WIDTH + 'px';
    }
}

var PALETTE = randomColor({
    amount: 40, // Request 40 unique colors
    lightness: 'dark', // Prefer dark shades for visibility
});


// Definitions for various structural arrangements of tiles
var STACK_ARRANGEMENT = 1; // Numeric ID for the "stack" layout
var DWELLING_ARRANGEMENT = 2; // Numeric ID for the "house" layout
var BARRIER_ARRANGEMENT = 3; // Numeric ID for the "wall" layout
var COLUMN_ARRANGEMENT = 4; // Numeric ID for the "cylinder" layout
var active_layout; // Holds the identifier of the currently active display layout

var layout_generators = {}; // Object mapping layout IDs to their coordinate generation functions
layout_generators[STACK_ARRANGEMENT] = stack_coordinates;
layout_generators[DWELLING_ARRANGEMENT] = dwelling_coordinates;
layout_generators[BARRIER_ARRANGEMENT] = barrier_coordinates;
layout_generators[COLUMN_ARRANGEMENT] = column_coordinates;

function make_tile_element(parent_element, element_index) {
    var new_tile = document.createElement('div'); // Create a new div element for the tile
    new_tile.className = 'card'; // Assign a CSS class for styling
    new_tile.style.background = PALETTE[element_index % PALETTE.length]; // Set background color from the palette

    parent_element.appendChild(new_tile); // Add the newly created tile to the specified parent container
    return new_tile; // Return the generated tile element
}

// Module for managing the collection of tiles
var TileSet = (function() {
    this.tiles = []; // Array to store all individual tile DOM elements
    this.tile_pointer = 0; // An index to keep track of the next tile to be used

    // Initialize the TileSet by creating and adding all necessary tile elements
    for (var j = 0; j < TILE_AMOUNT; ++j) {
        var display_area = document.getElementById('surface'); // Get the main rendering area
        this.tiles.push(make_tile_element(display_area, j)); // Create a tile and add it to the collection
    }

    // Provides the next available tile from the collection
    this.get_next_tile = function() {
        if (this.tile_pointer > 51) // A safety check, possibly for a specific number of cards (e.g., deck of 52)
            return; // No more tiles to provide

        return this.tiles[this.tile_pointer++]; // Return the tile at the current pointer and then advance the pointer
    };

    // Retrieves a specific tile by its zero-based index
    this.fetch_tile_by_index = function(target_index) {
        return this.tiles[target_index];
    };

    // Resets the tile pointer to the beginning of the collection
    this.reinitialize = function() {
        this.tile_pointer = 0;
    };
    return this; // Return the initialized TileSet object
})();

function construct_layout(coord_list) {
    TileSet.reinitialize(); // Reset the tile pointer to reuse tiles for the new layout
    for (var l = 0; l < coord_list.length; ++l) {
        snabbt(TileSet.get_next_tile(), { // Apply animation to the next available tile
            location: coord_list[l].location,   // Target 3D position for the tile
            orientation: coord_list[l].orientation, // Target 3D rotation for the tile
            transition_style: 'ease', // Animation easing function
            initial_pause: l * 50 // Stagger the start of each tile's animation
        });
    }
}

function set_display_layout(chosen_layout) {
    refresh_dimensions(); // Ensure all size-related variables are current
    if (chosen_layout == active_layout) { // If the requested layout is already active, do nothing
        return;
    }

    coord_list = layout_generators[chosen_layout](); // Obtain the set of coordinates for the new layout
    construct_layout(coord_list); // Build and animate the tiles into the new formation

    active_layout = chosen_layout; // Update the record of the currently active layout
}

function spin_display_area() {
    var display_area = document.getElementById('surface'); // Get the main surface element
    snabbt(display_area, { // Initiate an animation on the display area
        orientation: [0, 2 * Math.PI, 0], // Rotate 360 degrees around the Y-axis
        duration: 10000, // Animation duration in milliseconds
        perspective: 2000, // Set perspective for 3D effect
        loop: Infinity // Make the animation repeat indefinitely
    });
}

function stack_coordinates() {
    TileSet.reinitialize(); // Reset the tile counter for this specific formation
    var coord_list = []; // Array to collect the calculated positions for tiles

    var m = 0; // Loop counter for tiles
    var current_tile = TileSet.get_next_tile(); // Fetch the first tile
    var center_x = (VIEW_WIDTH - TILE_WIDTH) / 2; // Calculate the horizontal center for the stack
    var y_position = VIEW_HEIGHT - VIEW_HEIGHT * 0.2; // Determine the vertical base position

    while (current_tile) { // Continue as long as there are tiles available
        coord_list.push({
            location: [center_x, y_position - m * 0.5, VIEW_WIDTH * 0.1], // X, Y, Z coordinates for the tile
            orientation: [Math.PI / 2, 0, 0], // Rotation, e.g., to lay flat
        });
        ++m; // Increment the tile counter
        current_tile = TileSet.get_next_tile(); // Fetch the next tile
    }
    return coord_list; // Return the complete list of positions for the stack
}

function dwelling_coordinates() {
    TileSet.reinitialize(); // Reset the tile index for a fresh build

    var story_count = 5; // Number of vertical levels in the dwelling structure
    var base_y = (story_count - 1) * ANGLED_TILE_HEIGHT + ANGLED_TILE_HEIGHT / 2; // Y-coordinate for the base of the lowest story
    var z_offset = -VIEW_WIDTH * 0.2; // Z-axis offset for depth perspective
    var start_x = (VIEW_WIDTH - STRUCTURE_WIDTH * story_count) / 2 - ANGLED_TILE_WIDTH; // Initial X-coordinate to center the dwelling

    var coord_list = []; // Array to accumulate all tile coordinates
    var n;
    for (n = 0; n < story_count; ++n) {
        var row_x = start_x + n * ANGLED_TILE_WIDTH + n * TILE_GAP; // Calculate X-position for the current row
        var row_y = base_y - n * ANGLED_TILE_HEIGHT - n * TILE_GAP; // Calculate Y-position for the current row
        coord_list = coord_list.concat(dwelling_row_coordinates(story_count - n, row_x, row_y, z_offset)); // Generate and append row coordinates
    }

    return coord_list; // Return the full set of coordinates for the dwelling
}

function dwelling_row_coordinates(num_tiles, x_coord, y_coord, z_coord) {
    var coord_list = []; // List to store coordinates for tiles within this specific row
    var o;
    // Generate positions for the tilted support tiles forming the pyramid base
    for (o = 0; o < num_tiles; ++o) {
        tile_positions = pyramid_coordinates(x_coord + o * STRUCTURE_WIDTH, y_coord, z_coord); // Get pair of tilted positions
        coord_list.push({
            location: tile_positions[0].location,
            orientation: tile_positions[0].orientation,
        });
        coord_list.push({
            location: tile_positions[1].location,
            orientation: tile_positions[1].orientation,
        });
    }
    // Generate positions for the horizontal "bridge" tiles that connect the supports
    for (o = 0; o < num_tiles - 1; ++o) {
        coord_list.push({
            location: [x_coord + o * STRUCTURE_WIDTH + ANGLED_TILE_WIDTH, y_coord - ANGLED_TILE_HEIGHT / 2 - TILE_GAP / 2, z_coord],
            orientation: [Math.PI / 2, Math.PI / 2, 0], // Rotation for horizontal placement
        });
    }
    return coord_list; // Return the compiled list of row positions
}

function pyramid_coordinates(x_base, y_base, z_base) {
    // Important: Some browsers, e.g., Firefox, might exhibit visual flickering if elements perfectly overlap.
    var gap_value = (ANGLED_TILE_WIDTH / 2) + TILE_GAP / 2; // Calculate the offset for the two tilted tiles

    return [{
        location: [x_base - gap_value, y_base, z_base], // Position for the first tilted tile
        orientation: [-SLANT_ANGLE, Math.PI / 2, 0], // Rotation for the first tile (slanted left)
    }, {
        location: [x_base + gap_value, y_base, z_base], // Position for the second tilted tile
        orientation: [SLANT_ANGLE, Math.PI / 2, 0], // Rotation for the second tile (slanted right)
    }];
}

function barrier_coordinates() {
    var coord_list = []; // Array to hold the coordinates for all tiles in the wall formation
    var tile_elem_width = TILE_WIDTH + 10; // Adjusted width for tiles, including padding/margin
    var tile_elem_height = TILE_HEIGHT + 10; // Adjusted height for tiles, including padding/margin
    var initial_x = (VIEW_WIDTH - 10 * tile_elem_width) / 2; // Starting X-coordinate to horizontally center the wall
    var initial_y = (VIEW_HEIGHT - 4 * tile_elem_height) / 2; // Starting Y-coordinate to vertically center the wall

    for (var p = 0; p < TILE_AMOUNT; ++p) {
        var current_x = (p % 10) * tile_elem_width + initial_x; // Calculate X-position based on column index
        var current_y = (Math.floor(p / 10)) * tile_elem_height + initial_y; // Calculate Y-position based on row index
        coord_list.push({
            location: [current_x, current_y, 0], // Position the tile on the Z=0 plane
            orientation: [0, 0, 0] // No rotation for a flat wall
        });
    }
    return coord_list; // Return the full set of coordinates for the wall
}

function column_coordinates() {
    var coord_list = []; // Array to store coordinates for the cylinder formation
    var initial_x = VIEW_WIDTH / 2; // Center X-coordinate for the cylinder's base
    var initial_y = VIEW_HEIGHT * 0.1; // Top Y-coordinate for the cylinder's starting height
    var circle_radius = VIEW_WIDTH * 0.2; // Radius of the cylinder's circular cross-section

    for (var q = 0; q < TILE_AMOUNT; ++q) {
        var rotation_angle = ((q % 10) / 10) * 2 * Math.PI; // Calculate angular position around the cylinder
        var x_pos = Math.cos(rotation_angle) * circle_radius + initial_x; // X-coordinate on the circle
        var z_pos = Math.sin(rotation_angle) * circle_radius; // Z-coordinate on the circle
        var y_pos = Math.floor(q / 10) * 1.2 * TILE_HEIGHT + initial_y; // Y-coordinate for vertical stacking of layers

        coord_list.push({
            location: [x_pos, y_pos, z_pos],
            orientation: [0, Math.PI / 2 + rotation_angle, 0], // Rotate tile to face outwards from the cylinder's center
        });
    }
    return coord_list; // Return the complete list of positions for the cylinder
}

function form_barrier() {
    set_display_layout(BARRIER_ARRANGEMENT); // Activates the wall layout
}

function form_dwelling() {
    set_display_layout(DWELLING_ARRANGEMENT); // Activates the house layout
}

function form_stack() {
    set_display_layout(STACK_ARRANGEMENT); // Activates the pile layout
}

function initialize_application() {
    refresh_dimensions(); // First, update all responsive size variables
    TileSet.reinitialize(); // Reset the tile management system
    form_stack(); // Begin by displaying the tiles in a stack formation
    spin_display_area(); // Start the continuous rotation of the main display container

    // Attach FastClick to the document body for improved touch responsiveness
    FastClick.attach(document.body);

    // Define mapping between button IDs and their corresponding layout arrangements
    var layout_buttons = {
        "pile_button": STACK_ARRANGEMENT,
        "house_button": DWELLING_ARRANGEMENT,
        "wall_button": BARRIER_ARRANGEMENT,
        "cylinder_button": COLUMN_ARRANGEMENT
    };

    var button_click_handler = function(button_id) {
        // Reset the CSS class for all layout buttons to clear active state
        document.getElementById('pile_button').className = '';
        document.getElementById('house_button').className = '';
        document.getElementById('wall_button').className = '';
        document.getElementById('cylinder_button').className = '';

        // Apply the active CSS class to the clicked button
        document.getElementById(button_id).className = 'button-primary';
        set_display_layout(layout_buttons[button_id]); // Trigger the display of the selected layout
    };

    // Iterate through the defined buttons and attach a click event listener to each
    for (var button_key in layout_buttons) {
        document.getElementById(button_key).addEventListener('click', button_click_handler.bind(undefined, button_key));
    }
}
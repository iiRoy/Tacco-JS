( function( ) {
  // --- Global Variable Declarations ---
  // Core Sprite3D objects for scene management
  var stage = Sprite3D.stage(),
      scene = stage.appendChild( Sprite3D.create() ),

      // Container for the 3D box model
      boxContainer,

      // Window dimensions for responsiveness
      sw = window.innerWidth,
      sh = window.innerHeight,

      // Mouse/Touch position tracking variables
      px = -0.17849898580121704, // Current X position factor
      py = 0.4572815533980582,   // Current Y position factor
      ppx = 0,                   // Previous X position factor
      ppy = 0,                   // Previous Y position factor

      // Camera/Container position interpolation targets
      cpx = -0.17849898580121704, // Interpolated X position
      cpy = 0.4572815533980582,   // Interpolated Y position

      // Dimensions for the 3D box
      boxSize = 575,

      // Reference to the last interacted cow sprite
      lastVache,

      // Arrays to hold cow and cloud sprites
      cows = [],
      clouds = [],

      // Wind simulation variables for the windmill
      wind = 2,
      targetWind = 2,

      // Touch state management
      touched = false, // Flag to indicate if touch/mouse is active
      touchID = -1,    // Identifier for multi-touch tracking

      // Specific interactive sprites
      helix,         // The windmill helix
      touhedObject,  // Placeholder, seems unused in provided code
      ufo,           // The UFO sprite (declared but not explicitly assigned in this scope)

      // UFO animation variables (declared but not fully used for animation in this scope)
      uforx = 0,
      ufosx = .12,

      // Timing for animation loop
      lastFrame,

      // UI element for user invitation
      invite,

      // Top surface of the 3D box
      boxTop;


  // --- TOUCH EVENT HANDLERS ---
  var onTouchStart = function ( e ) {
    // Only process if no touch is currently active
    if ( !touched ) {
      var t = e.changedTouches[0]; // Get the first touch point

      // Calculate normalized previous touch coordinates
      ppx = ( t.pageX / sw ) - .5;
      ppy = ( t.pageY / sh ) - .5;

      touched = true;          // Set touch flag
      touchID = t.identifier;  // Store touch identifier
    }
    e.preventDefault(); // Prevent default browser touch behavior (e.g., scrolling)
  };


  var onTouchMove = function ( e ) {
    // Only process if a touch is currently active
    if ( touched ) {
      var ts = e.changedTouches, // Get all changed touch points
          nt = ts.length;        // Number of changed touch points

      // Iterate through changed touches to find the active one
      while ( nt-- ) {
        var t = e.changedTouches[ nt ];
        if ( t.identifier == touchID ) { // If this is our active touch
          // Calculate normalized current touch coordinates
          var tx = ( t.pageX / sw ) - .5,
              ty = ( t.pageY / sh ) - .5;

          // Update camera rotation based on touch movement
          px -= tx - ppx;
          py -= ty - ppy;

          // Store current touch as previous for the next frame
          ppx = tx;
          ppy = ty;

          // Clamp camera rotation within reasonable bounds
          if ( px < -.5 ) px = -.5;
          if ( px > .5 ) px = .5;
          if ( py < -.5 ) py = -.5;
          if ( py > .5 ) py = .5;

          break; // Found our touch, exit loop
        }
      }
    }
    e.preventDefault(); // Prevent default touch behavior
  };


  var onTouchEnd = function ( e ) {
    // Only process if a touch was active
    if ( touched ) {
      invite.className = "off"; // Hide the invitation message

      var ts = e.changedTouches, // Get all changed touch points
          nt = ts.length;        // Number of changed touch points

      // Iterate through changed touches to find the active one
      while ( nt-- ) {
        var t = e.changedTouches[ nt ];
        if ( t.identifier == touchID ) { // If this is our active touch
          touched = false; // Reset touch flag
          touchID = -1;    // Clear touch identifier
          break;           // Found our touch, exit loop
        }
      }
    }
    e.preventDefault(); // Prevent default touch behavior
  };


  // --- MOUSE EVENT HANDLERS ---
  var onMouseDown = function ( e ) {
    // Only process if no interaction is currently active
    if ( !touched ) {
      // Calculate normalized previous mouse coordinates
      ppx = ( e.pageX / sw ) - .5;
      ppy = ( e.pageY / sh ) - .5;

      touched = true; // Set interaction flag
    }
    e.preventDefault(); // Prevent default browser mouse behavior
  };


  var onMouseMove = function ( e ) {
    // Only process if mouse interaction is active
    if ( touched ) {
      // Calculate normalized current mouse coordinates
      var tx = ( e.pageX / sw ) - .5,
          ty = ( e.pageY / sh ) - .5;

      // Update camera rotation based on mouse movement
      px -= tx - ppx;
      py -= ty - ppy;

      // Store current mouse as previous for the next frame
      ppx = tx;
      ppy = ty;

      // Clamp camera rotation within reasonable bounds
      if ( px < -.5 ) px = -.5;
      if ( px > .5 ) px = .5;
      if ( py < -.5 ) py = -.5;
      if ( py > .5 ) py = .5;
    }
    e.preventDefault(); // Prevent default mouse behavior
  };


  var onMouseUp = function ( e ) {
    invite.className = "off"; // Hide the invitation message
    touched = false;          // Reset interaction flag
    e.preventDefault();       // Prevent default mouse behavior
  };


  // --- WINDOW EVENT HANDLERS ---
  var onResize = function ( e ) {
    // Update window dimensions
    sw = window.innerWidth;
    sh = window.innerHeight;

    // Calculate a uniform scale factor for the stage based on the smaller dimension
    var s = Math.min( sw, sh ) / 768.0;

    // Apply the scale to the stage and update its transformation
    stage.scale( s, s, s ).update();
  };


  var onOrientation = function ( e ) {
    // Scroll to the top-left corner on device orientation change
    window.scrollTo( 0, 0 );
  };


  // --- OBJECT INTERACTION LISTENERS ---
  var activateVache = function ( vache ) {
    // If there was a previously activated cow, reset its scale
    if ( lastVache ) {
      lastVache
        .scale( lastVache.flipped ? -1 : 1, 1, 1 ) // Restore original scale, accounting for flip
        .update();
    }
    lastVache = vache; // Set the new active cow
  };


  var onVacheTouch = function ( e ) {
    var sprite = this, // The cow sprite that was touched
        // Calculate new random position offset
        x = sprite.x() + ( Math.round( Math.random() ) * 2 - 1 ) * 50,
        y = sprite.y() + ( Math.round( Math.random() ) * 2 - 1 ) * 50,
        flipped = sprite.flipped; // Retain current flip state

    // --- Position Limiting ---
    if ( x < 50 ) x = 50;
    if ( x > boxSize - 50 ) x = boxSize - 50;
    if ( y < 80 ) y = 80;
    if ( y > boxSize - 50 ) y = boxSize - 50;

    // --- Apply new transformations to the sprite ---
    sprite
      .position( x, y, 0 )                                     // Set new X, Y position
      .rotation( -90, ( x / boxSize - .5 ) * 45, 0 )           // Adjust rotation based on X position
      .set( "flipped", flipped )                               // Re-apply the flipped state
      // .setScale( flipped ? -1 + Math.random() * .3 : 1 + Math.random() * .3, 1 + Math.random() * .3, 1 ) // (Original commented line)
      .update();                                               // Apply changes to the DOM element

    // activateVache( sprite ); // Original commented line, if we wanted to highlight on touch
    e.preventDefault();          // Prevent default touch/click action
    e.stopImmediatePropagation(); // Stop event from bubbling further
  };


  var onVacheOver = function ( e ) {
    // Activate this cow when mouse hovers over it
    activateVache( this );
  };


  var onVacheOut = function ( e ) {
    // Currently no specific action on mouse out for cows
  };


  var onHelixClick = function ( e ) {
    // Toggle windmill wind speed
    if ( targetWind == 0 ) {
      targetWind = 1 + Math.random() * 7; // Set random wind speed
    } else {
      targetWind = 0; // Stop the wind
    }
    e.preventDefault();           // Prevent default click behavior
    e.stopImmediatePropagation(); // Stop event from bubbling further
  };


  var onSunClick = function ( e ) {
    this
      .position( boxSize * Math.random(), -250, 360 ) // Randomize sun's X position
      .rotation( -90, this.rotationY() + 180, 0 )     // Flip sun's Y rotation
      .update();                                      // Apply changes
    e.preventDefault();           // Prevent default click behavior
    e.stopImmediatePropagation(); // Stop event from bubbling further
  };


  // --- ANIMATION LOOP ---
  var animate = function ( ) {
    requestAnimationFrame( animate ); // Request next animation frame
    move();                           // Call the movement update function
  };


  var move = function ( ) {
    // Interpolate camera/container position for smooth movement
    cpx += ( px - cpx ) * .1;
    cpy += ( py - cpy ) * .1;

    // Apply interpolated position and rotation to the main box container
    boxContainer
      .position( cpx * 100, 230 + cpy * 50, -cpy * 600 - 150 ) // Adjust position based on cpx, cpy
      .rotation( 70 + cpy * 50, 0, cpx * 210 )                 // Adjust rotation based on cpx, cpy
      .update();                                               // Apply transformations

    // Interpolate wind speed for the windmill helix
    wind += ( targetWind - wind ) * .01;

    // Rotate the windmill helix based on current wind speed
    helix.rotate( 0, 0, wind ).update();

    var n = clouds.length, // Number of clouds
        c, cx;             // Current cloud and its X position

    // Update each cloud's position
    while ( n-- ) {
      c = clouds[ n ];
      cx = c.x();

      // Handle clouds moving off-screen to the left
      if ( cx < -290 ) {
        cx = -290 - cx;
        c.z( c.targetZ + cx * cx * .1 ); // Adjust Z based on X for a depth effect
      }
      // Handle clouds moving off-screen to the right
      else if ( cx > boxSize + 290 ) {
        cx = cx - ( boxSize + 290 );
        c.z( c.targetZ + cx * cx * .1 ); // Adjust Z based on X for a depth effect
        if ( cx > 110 ) {
          // If cloud is far enough off-screen, reset its position and target values
          c.targetY = ( Math.random() * 1.4 - .4 ) * boxSize;
          c.targetZ = Math.random() * 190 + 300;
          c.position( -400 - Math.random() * 400, c.targetY, 3000 ); // Reset to far left
        }
      }
      c.move( wind, 0, 0 ).update(); // Move the cloud based on wind and update
    }
  };


  // --- HELPER FUNCTIONS ---
  var addBoxSide = function ( id, px, py, r ) {
    // Appends a side panel to the box container
    boxContainer.appendChild(
      Sprite3D.create( ".boxSide" )        // Create a Sprite3D element with class "boxSide"
        .set( "id", id )                   // Set a unique ID for the side
        .transformOrigin( 0, 0 )           // Set transformation origin
        .transformString( "p rx rz ry s" ) // Define transformation order
        .position( px, py, 231 )           // Set position of the side
        .rotation( -90, r, 0 )             // Set rotation of the side
        .update()                          // Apply transformations
    );
  };


  // --- OBJECT CREATION AND INITIALIZATION ---

  // Create and append the invitation div to the body
  invite = document.createElement( "div" );
  invite.id = "invite";
  document.body.appendChild( invite );

  // --- BOX ---
  // Create the main box container
  boxContainer = stage.appendChild(
    Sprite3D.create( "boxContainer" )      // Create a Sprite3D element with ID "boxContainer"
      .origin( 640, 640 )                   // Set origin point
      .position( 0, 200, -600 )             // Initial position
      .rotation( 70, 0, 0 )                 // Initial rotation
      .transformString( "p rx rz ry s" )    // Define transformation order
      .update()                             // Apply transformations
  );

  // Create the top surface of the box
  boxTop = boxContainer.appendChild(
    Sprite3D.create( "boxTop" ) // Create a Sprite3D element with ID "boxTop"
      .position( 358, 362, 231 ) // Position relative to boxContainer
      .update()                  // Apply transformations
  );

  // --- BOX SIDES ---
  // Add the four sides of the box using the helper function
  addBoxSide( "boxSide1", 358, 937, 0 );
  addBoxSide( "boxSide2", 358, 362, 270 );
  addBoxSide( "boxSide3", 933, 362, 180 );
  addBoxSide( "boxSide4", 933, 937, 90 );

  // --- COWS ---
  // Create multiple cow sprites and add them to the boxTop
  for ( var i = 0; i < 5; i++ ) {
    var x = ( Math.random() * .8 + .1 ), // Random X position factor
        flipped = Math.random() > .5;    // Randomly determine if cow is flipped

    cows.push( boxTop.appendChild(
      Sprite3D.create( ".vache" + Math.ceil( Math.random() * 3 ) ) // Random cow image variant
        .origin( 38, 78 )                                          // Set origin point
        .transformOrigin( 38, 78 )                                 // Set transformation origin
        .position( x * boxSize, ( Math.random() * .8 + .1 ) * boxSize, 0 ) // Random position on boxTop
        .rotation( -90, ( x - .5 ) * 45, 0 )                       // Rotation based on X position
        .set( "flipped", flipped )                                 // Store flip state
        .bind( { mouseover: onVacheTouch, touchstart: onVacheTouch } ) // Bind interaction events
        .update()                                                  // Apply transformations
    ) );
  }

  // --- BANNER ---
  // Create and add the banner sprite
  boxTop.appendChild(
    Sprite3D.create( "banner" )      // Create a Sprite3D element with ID "banner"
      .origin( 0, 332 )              // Set origin point
      .transformOrigin( 0, 332 )     // Set transformation origin
      .position( 10, 60, 0 )         // Position relative to boxTop
      .rotation( -90, .4, 0 )        // Set rotation
      .update()                      // Apply transformations
  );

  // --- SUN ---
  // Create and add the sun sprite
  boxTop.appendChild(
    Sprite3D.create( "sun" )                       // Create a Sprite3D element with ID "sun"
      .transformString( "p rx rz ry s" )           // Define transformation order
      .origin( 125, 750 - 136 )                    // Set origin point
      .transformOrigin( 125, 750 - 136 )           // Set transformation origin
      .position( boxSize * .92, -250, 360 )        // Position relative to boxTop
      .rotation( -90, -2, 0 )                      // Set rotation
      .bind( { mouseover: onSunClick, touchstart: onSunClick } ) // Bind interaction events
      .update()                                    // Apply transformations
  );

  // --- CLOUDS ---
  var cloudY, cloudZ;
  // Create multiple cloud sprites and add them to the boxTop
  for ( var i = 0; i < 7; i++ ) {
    cloudY = ( Math.random() * 1.4 - .4 ) * boxSize; // Random Y position for cloud
    cloudZ = Math.random() * 190 + 300;              // Random Z position for cloud

    clouds.push( boxTop.appendChild(
      Sprite3D.create( ".cloud" + Math.ceil( Math.random() * 3 ) ) // Random cloud image variant
        .transformString( "p rx rz ry s" )                         // Define transformation order
        .transformOrigin( 62, 750 - 40 )                           // Set transformation origin
        .origin( 62, 750 - 40 )                                    // Set origin point
        .position( ( Math.random() * 1.4 - .2 ) * boxSize, cloudY, cloudZ ) // Random position
        .rotation( -90, -Math.random() * 10 - 5, 0 )               // Set rotation
        .set( "targetY", cloudY )                                  // Store target Y for reset
        .set( "targetZ", cloudZ )                                  // Store target Z for reset
        .update()                                                  // Apply transformations
    ) );
  }

  // --- MOULIN (WINDMILL) ---
  // Create and add the windmill base
  var moulin = boxTop.appendChild(
    Sprite3D.create( "moulin" )      // Create a Sprite3D element with ID "moulin"
      .origin( 60, 201 )             // Set origin point
      .transformOrigin( 60, 201 )    // Set transformation origin
      .position( 90, 380, 0 )        // Position relative to boxTop
      .rotation( -90, 20, 0 )        // Set rotation
      .update()                      // Apply transformations
  );

  // Create and add the windmill helix (blades) as a child of the moulin
  helix = moulin.appendChild(
    Sprite3D.create( "helix" )       // Create a Sprite3D element with ID "helix"
      .origin( 89, 93 )              // Set origin point
      .transformOrigin( 89, 93 )     // Set transformation origin
      .position( 60, 80, 5 )         // Position relative to moulin
      .bind( { mousedown: onHelixClick, touchstart: onHelixClick } ) // Bind interaction events
      .update()                      // Apply transformations
  );

  // --- UFO ---
  // Create and add the UFO sprite
  boxTop.appendChild(
    Sprite3D.create( "ufo" )                    // Create a Sprite3D element with ID "ufo"
      .transformString( "p rx rz ry s" )        // Define transformation order
      .origin( 61, 750 - 50 )                   // Set origin point
      .transformOrigin( 61, 0 )                 // Set transformation origin
      .position( boxSize >> 1, boxSize >> 1, 800 ) // Position in the center, further back
      .rotation( -90, -2, 0 )                   // Set rotation
      .update()                                 // Apply transformations
  );


  // --- EVENT LISTENER REGISTRATION ---

  // Mouse listeners for desktop interaction
  document.addEventListener( "mousedown", onMouseDown, false );
  document.addEventListener( "mousemove", onMouseMove, false );
  document.addEventListener( "mouseup", onMouseUp, false );

  // Touch listeners for mobile interaction
  document.addEventListener( "touchstart", onTouchStart, false );
  document.addEventListener( "touchmove", onTouchMove, false );
  document.addEventListener( "touchend", onTouchEnd, false );

  // Window listeners for responsiveness and device orientation
  window.addEventListener( "resize", onResize, false );
  window.addEventListener( "deviceorientation", onOrientation, false );

  // Trigger initial resize to set up stage scaling correctly
  onResize();

  // --- START ANIMATION ---
  // Initialize lastFrame time (though not strictly used in current animate loop)
  lastFrame = new Date().getTime();
  // Start the animation loop
  animate();

} )( );
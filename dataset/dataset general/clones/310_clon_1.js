// -----------------------------------------------------------------------------------------------------------
// This is a Type I Code Clone.
// Original Author: Vincent Garreau  - vincentgarreau.com
// License: MIT (http://opensource.org/licenses/MIT)
// Project GitHub: https://github.com/VincentGarreau/particles.js
// Version: 1.1.0
//
// This clone extensively modifies whitespace and comments, but maintains
// exact logical and structural equivalence to the original source code.
// No identifiers, operators, or expressions have been altered.
// -----------------------------------------------------------------------------------------------------------

function launchParticlesJS(  tag_id,    params  ) {

  // Retrieve the canvas element based on the provided tag_id.
  var canvas_el = document.querySelector( '#' + tag_id + ' > canvas' );


  // Initialize the global pJS object with default configuration values.
  // This object holds all particle system settings and internal state.
  pJS = {
    canvas: {
      el: canvas_el,                      // The canvas DOM element.
      w: canvas_el.offsetWidth,           // Current width of the canvas.
      h: canvas_el.offsetHeight           // Current height of the canvas.
    },

    particles: {
      color: '#fff',                      // Default particle color.
      color_random: false,                // Should particle colors be randomized?
      shape: 'circle',                    // Particle shape: "circle", "edge", or "triangle".
      opacity: {
        opacity: 1,                       // Initial particle opacity.
        anim: {                           // Opacity animation settings.
          enable: false,                  // Enable opacity animation.
          speed: 2,                       // Animation speed.
          opacity_min: 0,                 // Minimum opacity during animation.
          sync: false                     // Synchronize opacity animation for all particles.
        }
      },
      size: 2.5,                          // Particle size.
      size_random: true,                  // Should particle sizes be randomized?
      nb: 200,                            // Number of particles.
      line_linked: {                      // Settings for lines linking particles.
        enable_auto: true,                // Automatically link particles.
        distance: 100,                    // Max distance for linking.
        color: '#fff',                    // Line color.
        opacity: 1,                       // Line opacity.
        width: 1,                         // Line width.
        condensed_mode: {                 // Condensed mode for lines.
          enable: false,                  // Enable condensed mode.
          rotateX: 3000,                  // Rotation X factor.
          rotateY: 3000                   // Rotation Y factor.
        }
      },
      anim: {                             // Particle animation settings (movement).
        enable: true,                     // Enable particle movement.
        speed: 2                          // Movement speed.
      },
      array: []                           // Array to hold particle objects.
    },

    interactivity: {
      enable: true,                       // Enable mouse interactivity.
      mouse: {
        distance: 100                     // Mouse interaction distance.
      },
      detect_on: 'canvas',                // Element to detect mouse events on: 'canvas' or 'window'.
      mode: 'grab',                       // Interactivity mode: 'grab', 'bubble', 'repulse', 'push', 'remove'.
      line_linked: {
        opacity: 1                        // Opacity of lines when interacting (grab mode).
      },
      events: {
        onclick: {                        // On-click event settings.
          enable: true,                   // Enable click events.
          mode: 'push',                   // Mode on click: 'push', 'remove'.
          nb: 4                           // Number of particles to push/remove on click.
        },
        onresize: {                       // On-resize event settings.
          enable: true,                   // Enable resize events.
          mode: 'out',                    // Behavior on resize: "out" or "bounce".
          density_auto: false,            // Automatically adjust particle density on resize.
          density_area: 800               // Area to calculate particle density ratio.
                                          // Formula: nb_particles = particles.nb * (canvas width * canvas height / 1000) / density_area
        }
      }
    },

    retina_detect: false,                 // Enable retina display detection.

    fn: {                                 // Internal functions container.
      vendors: {
        interactivity: {}                 // Interactivity vendor functions.
      }
    }
  };


  // Apply custom parameters if provided, overriding default settings.
  if ( params ) {

    if ( params.particles ) {
      var paramsForParticles = params.particles;

      if ( paramsForParticles.color ) pJS.particles.color = paramsForParticles.color;
      if ( paramsForParticles.color_random ) pJS.particles.color_random = paramsForParticles.color_random;
      if ( paramsForParticles.shape ) pJS.particles.shape = paramsForParticles.shape;

      if ( paramsForParticles.opacity ) {
        var paramsForOpacity = paramsForParticles.opacity;

        if ( typeof paramsForOpacity == 'object' ) pJS.particles.opacity.opacity = paramsForOpacity.opacity;
        else pJS.particles.opacity.opacity = paramsForOpacity;

        if ( paramsForOpacity.anim ) {
          var paramsForOpacityAnim = paramsForOpacity.anim;

          if ( paramsForOpacityAnim.enable == false || paramsForOpacityAnim.enable )
            pJS.particles.opacity.anim.enable = paramsForOpacityAnim.enable;
          if ( paramsForOpacityAnim.speed )
            pJS.particles.opacity.anim.speed = paramsForOpacityAnim.speed;
          if ( paramsForOpacityAnim.opacity_min )
            pJS.particles.opacity.anim.opacity_min = paramsForOpacityAnim.opacity_min;
          if ( paramsForOpacityAnim.sync == false || paramsForOpacityAnim.sync )
            pJS.particles.opacity.anim.sync = paramsForOpacityAnim.sync;
        }
      }

      if ( paramsForParticles.size ) pJS.particles.size = paramsForParticles.size;
      // Note: Original code had '== false' for size_random, implying it only overrides if explicitly false.
      // The Type I clone must preserve this behavior.
      if ( paramsForParticles.size_random == false ) pJS.particles.size_random = paramsForParticles.size_random;
      if ( paramsForParticles.nb ) pJS.particles.nb = paramsForParticles.nb;

      if ( paramsForParticles.line_linked ) {
        var paramsForLineLinked = paramsForParticles.line_linked;

        // Note: Original code had '== false' for enable_auto, implying it only overrides if explicitly false.
        if ( paramsForLineLinked.enable_auto == false ) pJS.particles.line_linked.enable_auto = paramsForLineLinked.enable_auto;
        if ( paramsForLineLinked.distance ) pJS.particles.line_linked.distance = paramsForLineLinked.distance;
        if ( paramsForLineLinked.color ) pJS.particles.line_linked.color = paramsForLineLinked.color;
        if ( paramsForLineLinked.opacity ) pJS.particles.line_linked.opacity = paramsForLineLinked.opacity;
        if ( paramsForLineLinked.width ) pJS.particles.line_linked.width = paramsForLineLinked.width;

        if ( paramsForLineLinked.condensed_mode ) {
          var paramsForCondensedMode = paramsForLineLinked.condensed_mode;

          // Note: Original code had '== false' for enable, implying it only overrides if explicitly false.
          if ( paramsForCondensedMode.enable == false ) pJS.particles.line_linked.condensed_mode.enable = paramsForCondensedMode.enable;
          if ( paramsForCondensedMode.rotateX ) pJS.particles.line_linked.condensed_mode.rotateX = paramsForCondensedMode.rotateX;
          if ( paramsForCondensedMode.rotateY ) pJS.particles.line_linked.condensed_mode.rotateY = paramsForCondensedMode.rotateY;
        }
      }

      if ( paramsForParticles.anim ) {
        var paramsForAnim = paramsForParticles.anim;

        // Note: Original code had '== false' for enable, implying it only overrides if explicitly false.
        if ( paramsForAnim.enable == false ) pJS.particles.anim.enable = paramsForAnim.enable;
        if ( paramsForAnim.speed ) pJS.particles.anim.speed = paramsForAnim.speed;
      }
    }

    if ( params.interactivity ) {
      var paramsForInteractivity = params.interactivity;

      // Note: Original code had '== false' for enable, implying it only overrides if explicitly false.
      if ( paramsForInteractivity.enable == false ) pJS.interactivity.enable = paramsForInteractivity.enable;

      if ( paramsForInteractivity.mouse ) {
        if ( paramsForInteractivity.mouse.distance )
          pJS.interactivity.mouse.distance = paramsForInteractivity.mouse.distance;
      }

      if ( paramsForInteractivity.detect_on ) pJS.interactivity.detect_on = paramsForInteractivity.detect_on;

      // Note: Original code had '== false || paramsForInteractivity.mode', implying it overrides if explicitly false or truthy.
      if ( paramsForInteractivity.mode == false || paramsForInteractivity.mode )
        pJS.interactivity.mode = paramsForInteractivity.mode;

      if ( paramsForInteractivity.line_linked ) {
        if ( paramsForInteractivity.line_linked.opacity )
          pJS.interactivity.line_linked.opacity = paramsForInteractivity.line_linked.opacity;
      }

      if ( paramsForInteractivity.events ) {
        var paramsForEvents = paramsForInteractivity.events;

        if ( paramsForEvents.onclick ) {
          var paramsForOnclick = paramsForEvents.onclick;

          // Note: Original code had '== false' for enable, implying it only overrides if explicitly false.
          if ( paramsForOnclick.enable == false ) pJS.interactivity.events.onclick.enable = false;
          // Note: Original code had '!= 'push'', implying it only overrides if not 'push'.
          if ( paramsForOnclick.mode != 'push' ) pJS.interactivity.events.onclick.mode = paramsForOnclick.mode;
          if ( paramsForOnclick.nb ) pJS.interactivity.events.onclick.nb = paramsForOnclick.nb;
        }

        if ( paramsForEvents.onresize ) {
          var paramsForOnresize = paramsForEvents.onresize;

          // Note: Original code had '== false' for enable, implying it only overrides if explicitly false.
          if ( paramsForOnresize.enable == false ) pJS.interactivity.events.onresize.enable = false;
          if ( paramsForOnresize.mode ) pJS.interactivity.events.onresize.mode = paramsForOnresize.mode;
          // Note: Original code had '== false || paramsForOnresize.density_auto', implying it overrides if explicitly false or truthy.
          if ( paramsForOnresize.density_auto == false || paramsForOnresize.density_auto )
            pJS.interactivity.events.onresize.density_auto = paramsForOnresize.density_auto;
          if ( paramsForOnresize.density_area )
            pJS.interactivity.events.onresize.density_area = paramsForOnresize.density_area;
        }
      }
    }

    // Set retina detection based on params.
    pJS.retina_detect = params.retina_detect;
  }

  // Convert hex color codes to RGB format for easier canvas drawing.
  pJS.particles.color_rgb = hexToRgb( pJS.particles.color );
  pJS.particles.line_linked.color_rgb_line = hexToRgb( pJS.particles.line_linked.color );


  // Check if retina display detection is enabled and the device pixel ratio is greater than 1.
  if ( pJS.retina_detect && window.devicePixelRatio > 1 ) {
    pJS.retina = true; // Mark as retina display.

    pJS.canvas.pxratio = window.devicePixelRatio; // Store pixel ratio.
    // Adjust canvas dimensions and interaction distances for retina display.
    pJS.canvas.w = pJS.canvas.el.offsetWidth * pJS.canvas.pxratio;
    pJS.canvas.h = pJS.canvas.el.offsetHeight * pJS.canvas.pxratio;
    pJS.particles.anim.speed = pJS.particles.anim.speed * pJS.canvas.pxratio;
    pJS.particles.line_linked.distance = pJS.particles.line_linked.distance * pJS.canvas.pxratio;
    pJS.particles.line_linked.width = pJS.particles.line_linked.width * pJS.canvas.pxratio;
    pJS.interactivity.mouse.distance = pJS.interactivity.mouse.distance * pJS.canvas.pxratio;
  }


  /* --------------------------------------------------
   *                   CANVAS functions
   * -------------------------------------------------- */

  // Initialize the 2D rendering context for the canvas.
  pJS.fn.canvasInit = function() {
    pJS.canvas.ctx = pJS.canvas.el.getContext( '2d' );
  };

  // Set canvas dimensions and add a resize event listener.
  pJS.fn.canvasSize = function() {

    pJS.canvas.el.width = pJS.canvas.w;
    pJS.canvas.el.height = pJS.canvas.h;

    // Add a listener for window resize events.
    window.addEventListener( 'resize', function() {

      // Only proceed if pJS is defined and resize events are enabled.
      if ( pJS && pJS.interactivity.events.onresize.enable ) {

        pJS.canvas.w = pJS.canvas.el.offsetWidth;
        pJS.canvas.h = pJS.canvas.el.offsetHeight;

        // Adjust canvas dimensions for retina displays.
        if ( pJS.retina ) {
          pJS.canvas.w *= pJS.canvas.pxratio;
          pJS.canvas.h *= pJS.canvas.pxratio;
        }

        pJS.canvas.el.width = pJS.canvas.w;
        pJS.canvas.el.height = pJS.canvas.h;

        // Repaint the canvas after resize.
        pJS.fn.canvasPaint();
        // If particle animation is not enabled, re-initialize particles.
        if ( !pJS.particles.anim.enable ) {
          pJS.fn.particlesRemove();
          pJS.fn.canvasRemove();
          launchParticles(); // Re-launch the particle system.
        }

        // Adjust particle density if enabled.
        pJS.fn.densityAuto();
      }
    });
  };

  // Automatically adjust particle density based on canvas area.
  pJS.fn.densityAuto = function() {
    if ( pJS.interactivity.events.onresize.density_auto ) {

      // Calculate the canvas area.
      var area = pJS.canvas.el.width * pJS.canvas.el.height / 1000;
      if ( pJS.retina ) {
        area = area / ( pJS.canvas.pxratio * 2 );
      }

      // Calculate the target number of particles based on density area.
      var nb_particles = area * pJS.particles.nb / pJS.interactivity.events.onresize.density_area;

      // Add or remove particles to match the target density.
      var missing_particles = pJS.particles.array.length - nb_particles;
      if ( missing_particles < 0 ) {
        pJS.fn.vendors.interactivity.pushParticles( Math.abs( missing_particles ) );
      } else {
        pJS.fn.vendors.interactivity.removeParticles( missing_particles );
      }
    }
  };

  // Fill the entire canvas with a solid color (used for clearing).
  pJS.fn.canvasPaint = function() {
    pJS.canvas.ctx.fillRect( 0, 0, pJS.canvas.w, pJS.canvas.h );
  };

  // Clear the entire canvas.
  pJS.fn.canvasRemove = function() {
    pJS.canvas.ctx.clearRect( 0, 0, pJS.canvas.w, pJS.canvas.h );
  };


  /* --------------------------------------------------
   *                 PARTICLES functions
   * -------------------------------------------------- */

  // Particle constructor function.
  pJS.fn.particle = function( color, opacity, position ) {

    // Set initial position of the particle.
    this.x = position ? position.x : Math.random() * pJS.canvas.w;
    this.y = position ? position.y : Math.random() * pJS.canvas.h;

    // Set particle size, optionally randomized.
    this.radius = ( pJS.particles.size_random ? Math.random() : 1 ) * pJS.particles.size;
    if ( pJS.retina ) this.radius *= pJS.canvas.pxratio; // Adjust for retina.

    // Set particle color, optionally randomized.
    if ( pJS.particles.color_random ) {
      this.color = {
        r: ( Math.floor( Math.random() * ( 255 - 0 + 1 ) ) + 0 ),
        g: ( Math.floor( Math.random() * ( 255 - 0 + 1 ) ) + 0 ),
        b: ( Math.floor( Math.random() * ( 255 - 0 + 1 ) ) + 0 )
      };
    } else {
      this.color = color;
    }

    // Set particle opacity and animation properties.
    this.opacity = opacity;
    if ( pJS.particles.opacity.anim.enable ) {
      this.opacity_status = false; // False: decreasing, True: increasing.
      this.vo = pJS.particles.opacity.anim.speed / 100; // Velocity of opacity change.
      if ( !pJS.particles.opacity.anim.sync ) {
        this.vo = this.vo * Math.random(); // Randomize individual particle opacity speed.
      }
    }

    // Set initial velocity for particle movement.
    this.vx = -0.5 + Math.random();
    this.vy = -0.5 + Math.random();
  };

  // Particle draw method (added to prototype for efficiency).
  pJS.fn.particle.prototype.draw = function() {

    // Set fill style for the particle.
    pJS.canvas.ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.opacity + ')';
    pJS.canvas.ctx.beginPath(); // Start a new path.

    // Draw the particle based on its shape.
    switch ( pJS.particles.shape ) {
      case 'circle':
        pJS.canvas.ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
        break;

      case 'edge':
        pJS.canvas.ctx.rect( this.x, this.y, this.radius * 2, this.radius * 2 );
        break;

      case 'triangle':
        pJS.canvas.ctx.moveTo( this.x, this.y - this.radius );
        pJS.canvas.ctx.lineTo( this.x + this.radius, this.y + this.radius );
        pJS.canvas.ctx.lineTo( this.x - this.radius, this.y + this.radius );
        pJS.canvas.ctx.closePath();
        break;
    }

    pJS.canvas.ctx.fill(); // Fill the drawn shape.
  };

  // Create the specified number of particles and add them to the array.
  pJS.fn.particlesCreate = function() {
    for ( var i = 0; i < pJS.particles.nb; i++ ) {
      pJS.particles.array.push( new pJS.fn.particle( pJS.particles.color_rgb, pJS.particles.opacity.opacity ) );
    }
  };

  // Animate particles: move, update opacity, and handle canvas boundaries.
  pJS.fn.particlesAnimate = function() {
    for ( var i = 0; i < pJS.particles.array.length; i++ ) {
      // Get the current particle.
      var p = pJS.particles.array[ i ];

      // Move the particle based on its velocity and animation speed.
      p.x += p.vx * ( pJS.particles.anim.speed / 2 );
      p.y += p.vy * ( pJS.particles.anim.speed / 2 );

      // Handle opacity animation.
      if ( pJS.particles.opacity.anim.enable ) {
        if ( p.opacity_status == true ) {
          // Opacity is increasing.
          if ( p.opacity >= pJS.particles.opacity.opacity ) p.opacity_status = false; // Max opacity reached, start decreasing.
          p.opacity += p.vo;
        } else {
          // Opacity is decreasing.
          if ( p.opacity <= pJS.particles.opacity.anim.opacity_min ) p.opacity_status = true; // Min opacity reached, start increasing.
          p.opacity -= p.vo;
        }
      }

      // Handle particle position when it goes out of canvas bounds.
      switch ( pJS.interactivity.events.onresize.mode ) {
        case 'bounce':
          // Particles bounce off the edges.
          if ( p.x - p.radius > pJS.canvas.w ) p.vx = -p.vx;
          else if ( p.x + p.radius < 0 ) p.vx = -p.vx;
          if ( p.y - p.radius > pJS.canvas.h ) p.vy = -p.vy;
          else if ( p.y + p.radius < 0 ) p.vy = -p.vy;
          break;

        case 'out':
          // Particles wrap around from one side to the other.
          if ( p.x - p.radius > pJS.canvas.w ) p.x = p.radius;
          else if ( p.x + p.radius < 0 ) p.x = pJS.canvas.w + p.radius;
          if ( p.y - p.radius > pJS.canvas.h ) p.y = p.radius;
          else if ( p.y + p.radius < 0 ) p.y = pJS.canvas.h + p.radius;
          break;
      }


      // Check distance between current particle and all subsequent particles.
      for ( var j = i + 1; j < pJS.particles.array.length; j++ ) {
        var p2 = pJS.particles.array[ j ];

        // Link particles if line_linked is enabled.
        if ( pJS.particles.line_linked.enable_auto ) {
          pJS.fn.vendors.distanceParticles( p, p2 );
        }

        // Apply interactivity if enabled.
        if ( pJS.interactivity.enable ) {

          // Handle different interactivity modes.
          switch ( pJS.interactivity.mode ) {
            case 'grab':
              pJS.fn.vendors.interactivity.grabParticles( p, p2 );
              break;
          }
        }
      }
    }
  };

  // Draw all particles on the canvas.
  pJS.fn.particlesDraw = function() {
    // Clear the canvas before drawing new frames.
    pJS.canvas.ctx.clearRect( 0, 0, pJS.canvas.w, pJS.canvas.h );

    // Animate particle positions and properties.
    pJS.fn.particlesAnimate();

    // Draw each particle from the array.
    for ( var i = 0; i < pJS.particles.array.length; i++ ) {
      var p = pJS.particles.array[ i ];
      // The draw method internally uses the particle's own color and opacity.
      p.draw( 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + p.opacity + ')' );
    }
  };

  // Remove all particles from the array.
  pJS.fn.particlesRemove = function() {
    pJS.particles.array = [];
  };


  /* --------------------------------------------------
   *                 VENDORS functions
   * -------------------------------------------------- */

  // Calculate distance between two particles and draw a line if they are close enough.
  pJS.fn.vendors.distanceParticles = function( p1, p2 ) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y,
        dist = Math.sqrt( dx * dx + dy * dy );

    // If particles are within the linking distance.
    if ( dist <= pJS.particles.line_linked.distance ) {

      // Get line color in RGB format.
      var color_line = pJS.particles.line_linked.color_rgb_line;
      pJS.canvas.ctx.beginPath(); // Start drawing a new line.
      // Set stroke style with opacity based on distance.
      pJS.canvas.ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + ( pJS.particles.line_linked.opacity - dist / pJS.particles.line_linked.distance ) + ')';
      pJS.canvas.ctx.moveTo( p1.x, p1.y ); // Move to first particle's position.
      pJS.canvas.ctx.lineTo( p2.x, p2.y ); // Draw line to second particle's position.
      pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width; // Set line width.
      pJS.canvas.ctx.stroke(); // Draw the line.
      pJS.canvas.ctx.closePath(); // Close the path.

      // Apply condensed mode effect if enabled.
      if ( pJS.particles.line_linked.condensed_mode.enable ) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            ax = dx / ( pJS.particles.line_linked.condensed_mode.rotateX * 1000 ),
            ay = dy / ( pJS.particles.line_linked.condensed_mode.rotateY * 1000 );
        // Adjust particle velocities based on condensed mode.
        p2.vx += ax;
        p2.vy += ay;
      }
    }
  };

  // Set up event listeners for interactivity.
  pJS.fn.vendors.interactivity.listeners = function() {

    // Determine the element to detect mouse events on.
    var detect_el;
    if ( pJS.interactivity.detect_on == 'window' ) {
      detect_el = window;
    } else {
      detect_el = pJS.canvas.el;
    }

    // Mousemove event handler.
    detect_el.onmousemove = function( e ) {

      var pos_x, pos_y;
      if ( detect_el == window ) {
        pos_x = e.clientX;
        pos_y = e.clientY;
      }
      else {
        pos_x = e.offsetX || e.clientX;
        pos_y = e.offsetY || e.clientY;
      }

      if ( pJS ) {
        pJS.interactivity.mouse.pos_x = pos_x;
        pJS.interactivity.mouse.pos_y = pos_y;

        // Adjust mouse position for retina displays.
        if ( pJS.retina ) {
          pJS.interactivity.mouse.pos_x *= pJS.canvas.pxratio;
          pJS.interactivity.mouse.pos_y *= pJS.canvas.pxratio;
        }

        pJS.interactivity.status = 'mousemove'; // Update interaction status.
      }
    };

    // Mouseleave event handler.
    detect_el.onmouseleave = function( e ) {

      if ( pJS ) {
        pJS.interactivity.mouse.pos_x = 0; // Reset mouse position.
        pJS.interactivity.mouse.pos_y = 0;
        pJS.interactivity.status = 'mouseleave'; // Update interaction status.
      }
    };

    // Onclick event handler.
    if ( pJS.interactivity.events.onclick.enable ) {
      switch ( pJS.interactivity.events.onclick.mode ) {
        case 'push':
          detect_el.onclick = function( e ) {
            // Push new particles at the mouse click location.
            pJS.fn.vendors.interactivity.pushParticles( pJS.interactivity.events.onclick.nb, pJS.interactivity.mouse );
          };
          break;

        case 'remove':
          detect_el.onclick = function( e ) {
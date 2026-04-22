/*
 *  frameplayer.js - A JavaScript library for frame-based video playback.
 *  This script facilitates video-like experiences using JSON data and image sequences.
 *  Primarily designed for mobile environments, leveraging image frames.
 *
 *  @author    Vagner Santana
 *  @repository  http://github.com/vagnervjs/frame-video
 *  @version   0.2.0
 *  @date      October 4th, 2013
 */

var FramePlayer = function (el, options) {
  // Reference to the main container element
  this.divCont = document.getElementById(el);
  // The ID of the main container element
  this.elem = el;
  // Source for the JSON video data, retrieved from a data attribute
  this.jsonVideoSrc = this.divCont.getAttribute('data-vidsrc');
  // Playback rate in frames per second (default: 20fps)
  this.rate = 20;
  // Flag to indicate if controls should be displayed
  this.controls = true;
  // Playback state: true if paused, false if playing
  this.paused = false;
  // Player width
  this.width = '480px';
  // Player height
  this.height = '320px';
  // Border radius for the player (not set by default)
  this.radius = null;

  // Apply user-defined options
  this.setOptions(options);
  // Ensure requestAnimationFrame is available
  this.initializeRequestAnimationFrame();
};

FramePlayer.prototype.setOptions = function (options) {
  // Check for playback rate option
  if ('rate' in options) {
    this.rate = options.rate;
  }

  // Check for controls visibility option
  if ('controls' in options) {
    this.controls = options.controls;
  }

  // Check for autoplay option
  if ('autoplay' in options) {
    if (!options.autoplay) {
      this.paused = true;
    }
  }

  // Check for player width option
  if ('width' in options) {
    this.width = options.width;
  }

  // Check for player height option
  if ('height' in options) {
    this.height = options.height;
  }

  // Check for border radius option and apply it
  if ('radius' in options) {
    // Create a new style element
    var currentStyle = document.createElement('style');
    // Set an ID for the style element based on the player's ID
    currentStyle.setAttribute('id', 'style-' + this.elem);
    // Define the CSS rules for border-radius and overflow
    currentStyle.innerHTML = '#' + this.elem + ', .frames-' + this.elem + '{ border-radius: ' + options.radius + '; overflow: hidden;}';
    // Append the style element to the document head
    document.head.appendChild(currentStyle);
  }

  // Apply the determined width and height to the container
  this.divCont.style.width = this.width;
  this.divCont.style.height = this.height;

  // If controls are enabled, create the control bar
  if (this.controls) {
    this.createControlBar();
  }
};

FramePlayer.prototype.render = function (jsonVideoFile, player) {
  var now,
    then = Date.now(),
    interval = 1000 / player.rate, // Time between frames in milliseconds
    delta,
    i = -1; // Current frame index

  // Create an image element to load frames into
  var img = document.createElement('img');

  // Create a canvas element for drawing frames
  player.canvas = document.createElement('canvas');
  // Get the 2D rendering context
  player.context = player.canvas.getContext('2d');
  // Append the canvas to the player's container div
  player.divCont.appendChild(player.canvas);

  // Define the core frame processing function
  var processFrame = function () {
    now = Date.now();
    delta = now - then; // Time elapsed since last frame update

    // Check if enough time has passed for the next frame
    if (delta > interval) {
      // Adjust 'then' to synchronize with the interval
      then = now - (delta % interval);

      // Only update frame if not paused
      if (!player.paused) {
        i++; // Increment frame index
        // Loop back to the start if end of video is reached
        if (i >= jsonVideoFile.frames.length) {
          i = 0;
        }
        // Set the source of the image to the current frame
        img.src = jsonVideoFile.frames[i];
        // Draw the image onto the canvas
        player.context.drawImage(img, 0, 0, player.canvas.width, player.canvas.height);
      }
    }

    // Request the next animation frame
    window.requestAnimationFrame(processFrame);
  };

  // Start the animation loop
  window.requestAnimationFrame(processFrame);
};

FramePlayer.prototype.createControlBar = function () {
  // Store a reference to 'this' for use in event listeners
  var _self = this;
  // Create the control bar div element
  var controlBar = document.createElement('div');
  // Assign a class for styling
  controlBar.setAttribute('class', 'fp-ctrl');
  // Set the width of the control bar to match the player
  controlBar.style.width = this.width;

  // --- Pause Button Creation ---
  var btnPause = document.createElement('button');
  btnPause.setAttribute('id', 'pause-' + _self.elem);
  btnPause.setAttribute('class', 'fp-btn');
  btnPause.innerHTML = 'Pause';
  btnPause.addEventListener(
    'click',
    function () {
      _self.pause(); // Call the pause method
    },
    false
  );
  controlBar.appendChild(btnPause);

  // --- Play Button Creation ---
  var btnPlay = document.createElement('button');
  btnPlay.setAttribute('id', 'play-' + _self.elem);
  btnPlay.setAttribute('class', 'fp-btn');
  btnPlay.innerHTML = 'Play';
  btnPlay.addEventListener(
    'click',
    function () {
      _self.resume(); // Call the resume method
    },
    false
  );
  controlBar.appendChild(btnPlay);

  // Set initial display state for Play/Pause buttons based on 'paused' status
  _self.paused ?
    (btnPause.style.display = 'none') :
    (btnPlay.style.display = 'none');

  // --- Filter Select Dropdown Creation ---
  var selectFilter = document.createElement('select');
  // Available filter options
  var options = ['normal', 'grayscale', 'sepia', 'invert'];

  // Populate the select dropdown with options
  for (var i = 0, t = options.length; i < t; i++) {
    var $option = document.createElement('option');
    $option.setAttribute('value', options[i]);
    $option.innerHTML = options[i];
    selectFilter.appendChild($option);
  }

  selectFilter.setAttribute('id', 'filter-' + _self.elem);
  selectFilter.setAttribute('class', 'fp-select');
  selectFilter.addEventListener(
    'change',
    function () {
      _self.setFilter(this.value); // Apply selected filter
    },
    false
  );
  controlBar.appendChild(selectFilter);

  // --- Append the Control Bar to the Player ---
  this.divCont.appendChild(controlBar);
};

FramePlayer.prototype.play = function () {
  // Initiates playback by fetching the video file and then rendering it.
  this.getFile(this.jsonVideoSrc, this.render);
};

FramePlayer.prototype.resume = function () {
  // Get references to the play and pause buttons using their IDs.
  var btnPlay = document.getElementById('play-' + this.elem);
  var btnPause = document.getElementById('pause-' + this.elem);

  // Hide the play button and show the pause button.
  btnPlay.style.display = 'none';
  btnPause.style.display = 'block';
  // Update the player's internal paused state.
  this.paused = false;
};

FramePlayer.prototype.pause = function () {
  // Get references to the play and pause buttons.
  var btnPlay = document.getElementById('play-' + this.elem);
  var btnPause = document.getElementById('pause-' + this.elem);

  // Show the play button and hide the pause button.
  btnPlay.style.display = 'block';
  btnPause.style.display = 'none';
  // Update the player's internal paused state.
  this.paused = true;
};

FramePlayer.prototype.setFilter = function (filter) {
  // Find the canvas element within the player's container.
  var canvas = document.querySelector('#' + this.elem + ' canvas');

  // Apply the appropriate CSS class based on the selected filter.
  switch (filter) {
    case 'normal':
      canvas.setAttribute('class', '');
      break;
    case 'grayscale':
      canvas.setAttribute('class', 'fp-grayscale');
      break;
    case 'sepia':
      canvas.setAttribute('class', 'fp-sepia');
      break;
    case 'invert':
      canvas.setAttribute('class', 'fp-invert');
      break;
    default:
      // No action for unknown filters.
      break;
  }
};

FramePlayer.prototype.getFile = function (src, callback) {
  // Create a new XMLHttpRequest object for fetching data.
  var _HTTP = new XMLHttpRequest();
  // Keep a reference to 'this' (the FramePlayer instance).
  var _self = this;
  // Create a paragraph element for displaying loading status.
  var p = document.createElement('p');

  // Check if XMLHttpRequest object was successfully created.
  if (_HTTP) {
    // Open the request: GET method, specified source, asynchronous.
    _HTTP.open('GET', src, true);
    // Set the request header for JSON content.
    _HTTP.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    // Send the request.
    _HTTP.send(null);

    // Define the onprogress event handler.
    _HTTP.onprogress = function () {
      p.innerHTML = 'Loading...';
      p.setAttribute('class', 'fp-loading');
      _self.divCont.appendChild(p); // Add loading message to container
    };

    // Check if the 'onload' event is supported (modern browsers).
    if (typeof _HTTP.onload !== 'undefined') {
      _HTTP.onload = function () {
        _self.divCont.removeChild(p); // Remove loading message
        callback(JSON.parse(this.responseText), _self); // Parse JSON and call callback
        _HTTP = null; // Clear XMLHttpRequest reference
      };
    } else {
      // Fallback for older browsers using 'onreadystatechange'.
      _HTTP.onreadystatechange = function () {
        if (_HTTP.readyState === 4) {
          // Request is complete.
          _self.divCont.removeChild(p); // Remove loading message
          callback(JSON.parse(this.responseText), _self); // Parse JSON and call callback
          _HTTP = null; // Clear XMLHttpRequest reference
        }
      };
    }
  } else {
    // If XMLHttpRequest is not supported, throw an error.
    throw 'Error loading file.';
  }
};

/*
 * Polyfill for requestAnimationFrame
 * This section ensures that `window.requestAnimationFrame` and `window.cancelAnimationFrame`
 * are available across different browsers, providing a consistent API for animation.
 * The implementation is based on well-known polyfills.
 *
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * @license MIT
 */
FramePlayer.prototype.initializeRequestAnimationFrame = function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  // Check for vendor-prefixed versions of requestAnimationFrame
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  // If requestAnimationFrame is still not found, provide a setTimeout-based fallback
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      // Aim for 60fps (1000ms / 60 frames ≈ 16.6ms per frame)
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(
        function () {
          callback(currTime + timeToCall);
        },
        timeToCall
      );
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  // If cancelAnimationFrame is not found, provide a clearTimeout-based fallback
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
};
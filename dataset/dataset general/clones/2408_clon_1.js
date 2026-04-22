(function  e( t , n , r ) {
  function s ( o, u ) {
    if ( !n[ o ] ) {
      if ( !t[ o ] ) {
        var a = typeof require == "function" && require;
        if ( !u && a )
          return a(o, !0);
        if ( i )
          return i( o, !0 );
        throw new Error( "Cannot find module '" + o + "'" )
      }
      var f = n[ o ] = {
        exports: {}
      };
      t[ o ][ 0 ].call( f.exports, function ( e ) {
        var n = t[ o ][ 1 ][ e ];
        return s( n ? n : e )
      }, f, f.exports, e, t, n, r )
    }
    return n[ o ].exports
  }
  var i = typeof require == "function" && require;
  for ( var o = 0; o < r.length; o++ )
    s( r[ o ] );
  return s
})({
  1: [
    function ( require, module, exports ) {
      'use strict';

      // Declare variables for modules and settings
      var $, DAT, Visualizer, World, settings, _;

      // Require helper functions
      require('./helpers');

      // Load external libraries
      $ = require('jquery');
      _ = require('underscore');
      Visualizer = require('./visualizer/visualizer');
      DAT = require('dat-gui');
      World = require('./model/world');
      settings = require('./settings');

      // Initialize the application when the DOM is ready
      $(function () {
        var canvas, gui, guiVisualizer, guiWorld;

        // Create a canvas element and append it to the body
        canvas = $('<canvas />', {
          id: 'canvas'
        });
        $(document.body).append(canvas);

        // Initialize the game world
        window.world = new World();
        world.load();

        // Generate a new map if no intersections are loaded
        if (world.intersections.length === 0) {
          world.generateMap();
          world.carsNumber = 100; // Set initial number of cars
        }

        // Initialize the visualizer
        window.visualizer = new Visualizer(world);
        visualizer.start();

        // Initialize the DAT.GUI for debugging and control
        gui = new DAT.GUI();

        // GUI folder for world settings
        guiWorld = gui.addFolder('world');
        guiWorld.open(); // Open the folder by default
        guiWorld.add(world, 'save');
        guiWorld.add(world, 'load');
        guiWorld.add(world, 'clear');
        guiWorld.add(world, 'generateMap');

        // GUI folder for visualizer settings
        guiVisualizer = gui.addFolder('visualizer');
        guiVisualizer.open(); // Open the folder by default
        guiVisualizer.add(visualizer, 'running').listen(); // Toggle simulation running state
        guiVisualizer.add(visualizer, 'debug').listen(); // Toggle debug mode
        guiVisualizer.add(visualizer.zoomer, 'scale', 0.1, 2).listen(); // Adjust zoom scale
        guiVisualizer.add(visualizer, 'timeFactor', 0.1, 10).listen(); // Adjust simulation speed

        // Add world properties to GUI
        guiWorld.add(world, 'carsNumber').min(0).max(200).step(1).listen(); // Number of cars
        guiWorld.add(world, 'instantSpeed').step(0.00001).listen(); // Instant speed adjustment

        // Add global settings to GUI
        return gui.add(settings, 'lightsFlipInterval', 0, 50, 0.01).listen(); // Traffic lights cycle interval
      });


    }, {
      "./helpers": 6,
      "./model/world": 15,
      "./settings": 16,
      "./visualizer/visualizer": 24,
      "dat-gui": 27,
      "jquery": 31,
      "underscore": 32
    }
  ],
  2: [
    function ( require, module, exports ) {
      'use strict';

      var Curve, Segment;

      // Require helper utilities
      require('../helpers');

      // Load Segment class
      Segment = require('./segment');

      // Define the Curve class
      Curve = (function () {
        function Curve ( A, B, O, Q ) {
          this.A = A;
          this.B = B;
          this.O = O;
          this.Q = Q;

          // Create segments for control points
          this.AB = new Segment(this.A, this.B);
          this.AO = new Segment(this.A, this.O);
          this.OQ = new Segment(this.O, this.Q);
          this.QB = new Segment(this.Q, this.B);

          // Initialize length to null, will be calculated on first access
          this._length = null;
        }

        // Define a property 'length' for the curve
        Curve.property('length', {
          get: function () {
            var i, point, pointsNumber, prevoiusPoint, _i;

            // Calculate length if not already cached
            if (this._length == null) {
              pointsNumber = 10; // Number of segments to approximate the curve
              prevoiusPoint = null;
              this._length = 0;

              // Iterate to sum up segment lengths
              for (i = _i = 0; 0 <= pointsNumber ? _i <= pointsNumber : _i >= pointsNumber; i = 0 <= pointsNumber ? ++_i : --_i) {
                point = this.getPoint(i / pointsNumber); // Get point on curve
                if (prevoiusPoint) {
                  this._length += point.subtract(prevoiusPoint).length; // Add distance to previous point
                }
                prevoiusPoint = point;
              }
            }
            return this._length;
          }
        });

        // Get a point on the Bezier curve at a given parameter 'a'
        Curve.prototype.getPoint = function ( a ) {
          var p0, p1, p2, r0, r1;

          // First level of interpolation
          p0 = this.AO.getPoint(a);
          p1 = this.OQ.getPoint(a);
          p2 = this.QB.getPoint(a);

          // Second level of interpolation
          r0 = (new Segment(p0, p1)).getPoint(a);
          r1 = (new Segment(p1, p2)).getPoint(a);

          // Final interpolation to get the point on the curve
          return (new Segment(r0, r1)).getPoint(a);
        };

        // Get the direction (tangent) of the Bezier curve at a given parameter 'a'
        Curve.prototype.getDirection = function ( a ) {
          var p0, p1, p2, r0, r1;

          // Similar to getPoint, but we want the direction of the final segment
          p0 = this.AO.getPoint(a);
          p1 = this.OQ.getPoint(a);
          p2 = this.QB.getPoint(a);

          r0 = (new Segment(p0, p1)).getPoint(a);
          r1 = (new Segment(p1, p2)).getPoint(a);

          // The direction is the direction of the segment connecting r0 and r1
          return (new Segment(r0, r1)).direction;
        };

        return Curve;

      })();

      // Export the Curve class
      module.exports = Curve;


    }, {
      "../helpers": 6,
      "./segment": 5
    }
  ],
  3: [
    function ( require, module, exports ) {
      'use strict';

      var Point, atan2, sqrt;

      // Import Math functions
      sqrt = Math.sqrt, atan2 = Math.atan2;

      // Require helper utilities
      require('../helpers');

      // Define the Point class
      Point = (function () {
        function Point ( x, y ) {
          this.x = x != null ? x : 0;
          this.y = y != null ? y : 0;
        }

        // Define a property 'length' (magnitude) for the point vector
        Point.property('length', {
          get: function () {
            return sqrt(this.x * this.x + this.y * this.y);
          }
        });

        // Define a property 'direction' (angle) for the point vector
        Point.property('direction', {
          get: function () {
            return atan2(this.y, this.x);
          }
        });

        // Define a property 'normalized' for the unit vector of the point
        Point.property('normalized', {
          get: function () {
            return new Point(this.x / this.length, this.y / this.length);
          }
        });

        // Add another point or vector
        Point.prototype.add = function ( o ) {
          return new Point(this.x + o.x, this.y + o.y);
        };

        // Subtract another point or vector
        Point.prototype.subtract = function ( o ) {
          return new Point(this.x - o.x, this.y - o.y);
        };

        // Multiply by a scalar
        Point.prototype.mult = function ( k ) {
          return new Point(this.x * k, this.y * k);
        };

        // Divide by a scalar
        Point.prototype.divide = function ( k ) {
          return new Point(this.x / k, this.y / k);
        };

        return Point;

      })();

      // Export the Point class
      module.exports = Point;


    }, {
      "../helpers": 6
    }
  ],
  4: [
    function ( require, module, exports ) {
      'use strict';

      var Point, Rect, Segment, abs, _;

      // Import Math functions
      abs = Math.abs;

      // Require helper utilities
      require('../helpers');

      // Load external libraries
      _ = require('underscore');

      // Load geometry classes
      Point = require('./point');
      Segment = require('./segment');

      // Define the Rect class
      Rect = (function () {
        function Rect ( x, y, _width, _height ) {
          this.x = x;
          this.y = y;
          this._width = _width != null ? _width : 0;
          this._height = _height != null ? _height : 0;
        }

        // Static method to create a copy of a Rect
        Rect.copy = function ( rect ) {
          return new Rect(rect.x, rect.y, rect._width, rect._height);
        };

        // Convert Rect to JSON (shallow copy of properties)
        Rect.prototype.toJSON = function () {
          return _.extend({}, this);
        };

        // Calculate the area of the rectangle
        Rect.prototype.area = function () {
          return this.width() * this.height();
        };

        // Getter/setter for the left edge
        Rect.prototype.left = function ( left ) {
          if (left != null) {
            this.x = left;
          }
          return this.x;
        };

        // Getter/setter for the right edge
        Rect.prototype.right = function ( right ) {
          if (right != null) {
            this.x = right - this.width();
          }
          return this.x + this.width();
        };

        // Getter/setter for the width
        Rect.prototype.width = function ( width ) {
          if (width != null) {
            this._width = width;
          }
          return this._width;
        };

        // Getter/setter for the top edge
        Rect.prototype.top = function ( top ) {
          if (top != null) {
            this.y = top;
          }
          return this.y;
        };

        // Getter/setter for the bottom edge
        Rect.prototype.bottom = function ( bottom ) {
          if (bottom != null) {
            this.y = bottom - this.height();
          }
          return this.y + this.height();
        };

        // Getter/setter for the height
        Rect.prototype.height = function ( height ) {
          if (height != null) {
            this._height = height;
          }
          return this._height;
        };

        // Getter/setter for the center point
        Rect.prototype.center = function ( center ) {
          if (center != null) {
            this.x = center.x - this.width() / 2;
            this.y = center.y - this.height() / 2;
          }
          return new Point(this.x + this.width() / 2, this.y + this.height() / 2);
        };

        // Check if the rectangle contains a given point
        Rect.prototype.containsPoint = function ( point ) {
          var _ref, _ref1;
          return (this.left() <= (_ref = point.x) && _ref <= this.right()) && (this.top() <= (_ref1 = point.y) && _ref1 <= this.bottom());
        };

        // Check if the rectangle contains another rectangle
        Rect.prototype.containsRect = function ( rect ) {
          return this.left() <= rect.left() && rect.right() <= this.right() && this.top() <= rect.top() && rect.bottom() <= this.bottom();
        };

        // Get the four vertices of the rectangle
        Rect.prototype.getVertices = function () {
          return [new Point(this.left(), this.top()), new Point(this.right(), this.top()), new Point(this.right(), this.bottom()), new Point(this.left(), this.bottom())];
        };

        // Get a specific side of the rectangle as a Segment
        Rect.prototype.getSide = function ( i ) {
          var vertices;
          vertices = this.getVertices();
          return new Segment(vertices[i], vertices[(i + 1) % 4]);
        };

        // Determine which "sector" of the rectangle a point is in
        // Used for determining which side of an intersection a car is approaching
        Rect.prototype.getSectorId = function ( point ) {
          var offset;
          offset = point.subtract(this.center());
          if (offset.y <= 0 && abs(offset.x) <= abs(offset.y)) {
            return 0; // Top sector
          }
          if (offset.x >= 0 && abs(offset.x) >= abs(offset.y)) {
            return 1; // Right sector
          }
          if (offset.y >= 0 && abs(offset.x) <= abs(offset.y)) {
            return 2; // Bottom sector
          }
          if (offset.x <= 0 && abs(offset.x) >= abs(offset.y)) {
            return 3; // Left sector
          }
          throw Error('algorithm error'); // Should not happen
        };

        // Get the Segment representing the sector a point is in
        Rect.prototype.getSector = function ( point ) {
          return this.getSide(this.getSectorId(point));
        };

        return Rect;

      })();

      // Export the Rect class
      module.exports = Rect;


    }, {
      "../helpers": 6,
      "./point": 3,
      "./segment": 5,
      "underscore": 32
    }
  ],
  5: [
    function ( require, module, exports ) {
      'use strict';

      var Segment;

      // Require helper utilities
      require('../helpers');

      // Define the Segment class
      Segment = (function () {
        function Segment ( source, target ) {
          this.source = source;
          this.target = target;
        }

        // Define a property 'vector' representing the direction and magnitude from source to target
        Segment.property('vector', {
          get: function () {
            return this.target.subtract(this.source);
          }
        });

        // Define a property 'length' for the segment's length
        Segment.property('length', {
          get: function () {
            return this.vector.length;
          }
        });

        // Define a property 'direction' for the segment's angle
        Segment.property('direction', {
          get: function () {
            return this.vector.direction;
          }
        });

        // Define a property 'center' for the midpoint of the segment
        Segment.property('center', {
          get: function () {
            return this.getPoint(0.5);
          }
        });

        // Split the segment into 'n' equal subsegments
        Segment.prototype.split = function ( n, reverse ) {
          var k, order, _i, _j, _k, _len, _ref, _ref1, _results, _results1, _results2;

          // Determine the order of segments (normal or reversed)
          order = reverse ? (function () {
            _results = [];
            for (var _i = _ref = n - 1; _ref <= 0 ? _i <= 0 : _i >= 0; _ref <= 0 ? _i++ : _i--) {
              _results.push(_i);
            }
            return _results;
          }).apply(this) : (function () {
            _results1 = [];
            for (var _j = 0, _ref1 = n - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 0 <= _ref1 ? _j++ : _j--) {
              _results1.push(_j);
            }
            return _results1;
          }).apply(this);

          // Create and return the subsegments
          _results2 = [];
          for (_k = 0, _len = order.length; _k < _len; _k++) {
            k = order[_k];
            _results2.push(this.subsegment(k / n, (k + 1) / n));
          }
          return _results2;
        };

        // Get a point along the segment at a given parameter 'a' (0 to 1)
        Segment.prototype.getPoint = function ( a ) {
          return this.source.add(this.vector.mult(a));
        };

        // Get a subsegment defined by two parameters 'a' and 'b' (0 to 1)
        Segment.prototype.subsegment = function ( a, b ) {
          var end, offset, start;
          offset = this.vector;
          start = this.source.add(offset.mult(a));
          end = this.source.add(offset.mult(b));
          return new Segment(start, end);
        };

        return Segment;

      })();

      // Export the Segment class
      module.exports = Segment;


    }, {
      "../helpers": 6
    }
  ],
  6: [
    function ( require, module, exports ) {
      'use strict';

      // This module exports an empty object, primarily used for its side effects
      module.exports = {};

      // Extend Function.prototype to add a 'property' method
      // This method allows defining properties on a constructor's prototype
      // with getters and setters, similar to ES5 Object.defineProperty syntax.
      Function.prototype.property = function ( prop, desc ) {
        return Object.defineProperty(this.prototype, prop, desc);
      };


    }, {}
  ],
  7: [
    function ( require, module, exports ) {
      'use strict';

      var Car, Trajectory, max, min, random, sqrt, _;

      // Import Math functions
      max = Math.max, min = Math.min, random = Math.random, sqrt = Math.sqrt;

      // Require helper utilities
      require('../helpers');

      // Load external libraries
      _ = require('underscore');

      // Load Trajectory class
      Trajectory = require('./trajectory');

      // Define the Car class
      Car = (function () {
        function Car ( lane, position ) {
          this.id = _.uniqueId('car'); // Unique ID for each car
          this.color = (300 + 240 * random() | 0) % 360; // Random HSL color
          this._speed = 0; // Current speed
          this.width = 1.7; // Car width
          this.length = 3 + 2 * random(); // Random car length
          this.maxSpeed = 30; // Maximum speed
          this.s0 = 2; // Minimum bumper-to-bumper distance
          this.timeHeadway = 1.5; // Desired time headway
          this.maxAcceleration = 1; // Maximum acceleration
          this.maxDeceleration = 3; // Maximum comfortable deceleration
          this.trajectory = new Trajectory(this, lane, position); // Car's path
          this.alive = true; // Is the car still active in the simulation
          this.preferedLane = null; // Lane the car wants to move to
        }

        // Property 'coords' to get current position from trajectory
        Car.property('coords', {
          get: function () {
            return this.trajectory.coords;
          }
        });

        // Property 'speed' with getter and setter to enforce limits
        Car.property('speed', {
          get: function () {
            return this._speed;
          },
          set: function ( speed ) {
            if (speed < 0) {
              speed = 0; // Speed cannot be negative
            }
            if (speed > this.maxSpeed) {
              speed = this.maxSpeed; // Speed cannot exceed maxSpeed
            }
            return this._speed = speed;
          }
        });

        // Property 'direction' to get current direction from trajectory
        Car.property('direction', {
          get: function () {
            return this.trajectory.direction;
          }
        });

        // Release the car from its current trajectory segment
        Car.prototype.release = function () {
          return this.trajectory.release();
        };

        // Calculate acceleration using the Intelligent Driver Model (IDM)
        Car.prototype.getAcceleration = function () {
          var a, b, breakGap, busyRoadCoeff, coeff, deltaSpeed, distanceGap, distanceToNextCar, freeRoadCoeff, intersectionCoeff, nextCarDistance, safeDistance, safeIntersectionDistance, timeGap, _ref;

          nextCarDistance = this.trajectory.nextCarDistance;
          distanceToNextCar = max(nextCarDistance.distance, 0); // Distance to the car in front, or 0 if none/negative
          a = this.maxAcceleration; // Max acceleration
          b = this.maxDeceleration; // Max comfortable braking deceleration

          // Speed difference between current car and leading car
          deltaSpeed = (this.speed - ((_ref = nextCarDistance.car) != null ? _ref.speed : void 0)) || 0;

          // Component for free road acceleration (approaching max speed)
          freeRoadCoeff = Math.pow(this.speed / this.maxSpeed, 4);

          // Components for safe following distance
          distanceGap = this.s0;
          timeGap = this.speed * this.timeHeadway;
          breakGap = this.speed * deltaSpeed / (2 * sqrt(a * b));
          safeDistance = distanceGap + timeGap + breakGap;

          // Component for congested road deceleration (maintaining safe distance)
          busyRoadCoeff = Math.pow(safeDistance / distanceToNextCar, 2);

          // Component for intersection deceleration
          safeIntersectionDistance = 1 + timeGap + Math.pow(this.speed, 2) / (2 * b); // Distance needed to stop comfortably before intersection
          intersectionCoeff = Math.pow(safeIntersectionDistance / this.trajectory.distanceToStopLine, 2);

          // Combine all coefficients for final acceleration
          coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
          return this.maxAcceleration * coeff;
        };

        // Move the car forward by a given time delta
        Car.prototype.move = function ( delta ) {
          var acceleration, currentLane, preferedLane, step, turnNumber;

          acceleration = this.getAcceleration(); // Calculate acceleration
          this.speed += acceleration * delta; // Update speed

          // Handle lane changes if not already changing and a next lane is determined
          if (!this.trajectory.isChangingLanes && this.nextLane) {
            currentLane = this.trajectory.current.lane;
            turnNumber = currentLane.getTurnDirection(this.nextLane); // Determine turn direction

            // Select preferred adjacent lane based on turn direction
            preferedLane = (function () {
              switch (turnNumber) {
                case 0:
                  return currentLane.leftmostAdjacent;
                case 2:
                  return currentLane.rightmostAdjacent;
                default:
                  return currentLane;
              }
            })();

            // If a different preferred lane is found, initiate lane change
            if (preferedLane !== currentLane) {
              this.trajectory.changeLane(preferedLane);
            }
          }

          // Calculate the distance to move this step
          step = this.speed * delta + 0.5 * acceleration * Math.pow(delta, 2);

          // Log a warning if IDM calculation seems off
          if (this.trajectory.nextCarDistance.distance < step) {
            console.log('bad IDM');
          }

          // Check if the car needs to make a turn soon
          if (this.trajectory.timeToMakeTurn(step)) {
            if (this.nextLane == null) {
              return this.alive = false; // Car reaches end of its path
            }
          }

          // Move the car along its trajectory
          return this.trajectory.moveForward(step);
        };
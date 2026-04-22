/*
 * This file contains a JavaScript implementation,
 * originally generated from CoffeeScript, version 1.3.3.
 * It defines a Backbone View for responsive asset loading.
 */
( function () {

  // Helper object to check for own properties.
  var __hasProp = {}.hasOwnProperty
    ,
    // Helper function for class inheritance,
    // mimicking CoffeeScript's extends functionality.
    __extends = function ( child , parent ) {
      for ( var key in parent ) {
        if ( __hasProp.call( parent , key ) ) {
          child[ key ] = parent[ key ]
        }
      }

      function ctor () {
        this.constructor = child
      }

      ctor.prototype = parent.prototype
      child.prototype = new ctor()
      child.__super__ = parent.prototype
      return child
    }

  // Define the ResponsiveView, extending Backbone.View.
  window.ResponsiveView = ( function ( _super ) {

    // Apply the inheritance.
    __extends( ResponsiveView , _super )

    // Constructor for ResponsiveView.
    function ResponsiveView () {
      return ResponsiveView.__super__.constructor.apply( this , arguments )
    }

    // Define assets required by the view.
    ResponsiveView.prototype.assets = {
      logo : "modeset-crest.png"
    }

    // Initialize the view with provided arguments.
    ResponsiveView.prototype.initialize = function ( _arg ) {
      var tests

      // Assign properties from _arg to 'this'.
      this.startTime = _arg.startTime
      this.endTime = _arg.endTime
      this.downloadSize = _arg.downloadSize

      // Run various tests to determine high-resolution capability.
      tests = [ this.onWifi() , this.isRetina() ]

      // Log the test results for debugging purposes.
      console.log( "tests" , tests )

      // Determine if high-resolution assets should be loaded.
      // All tests must pass (return true).
      this.highres = _.all( tests , function ( t ) {
        return t === true
      } )

      // Proceed to load assets based on the highres flag.
      return this.loadAssets()
    }

    // Method to load assets, potentially high-resolution versions.
    ResponsiveView.prototype.loadAssets = function () {
      // Check if high-resolution assets are enabled.
      if ( this.highres === true ) {
        // Iterate over each asset defined in `this.assets`.
        _.each( this.assets , function ( asset ) {
          var image
            , newImage

          // Find existing image elements that match the asset name.
          image = $( "img[src*='" + asset + "']" )

          // Hide the original image while the new one loads.
          $( image ).hide()

          // Create a new Image object for loading.
          newImage = new Image()

          // Set the onload handler for the new image.
          newImage.onload = function () {
            // Replace the content of the original image element with the new, loaded image.
            $( image ).html( this )
            // Show the image with a slow animation.
            return $( image ).show( "slow" )
          }

          // Set the onerror handler for the new image.
          newImage.onError = function () {
            // Log an error if the image cannot be found, if console is available.
            return typeof console !== "undefined" && console !== null
              ? console.log( "cant find that image" )
              : void 0
          }

          // Set the source of the new image to the high-resolution path.
          return newImage.src = "/images/highres/" + asset
        } )
      }

      // Hide any spinner images.
      return $( "img.spinner" ).hide()
    }

    // Method to check if the device is a retina display.
    ResponsiveView.prototype.isRetina = function () {
      // Use memoization: if retinaEnabled is already set, return it.
      // Otherwise, calculate and store it.
      return this.retinaEnabled || ( this.retinaEnabled = ( function () {
        var ratio

        // Get the device pixel ratio.
        ratio = parseInt( window.devicePixelRatio )

        // A device is considered retina if its pixel ratio is greater than 1.
        return ratio > 1
      } )() )
    }

    // Method to check if the device is on a fast (wifi-like) connection.
    ResponsiveView.prototype.onWifi = function () {
      // Consider it 'on Wifi' if the device speed is greater than 10 Mbps.
      return this.deviceSpeed() > 10
    }

    // Method to calculate and return the device's internet speed in Mbps.
    ResponsiveView.prototype.deviceSpeed = function () {
      var _this = this

      // Use memoization: if speedMbps is already set, return it.
      // Otherwise, calculate and store it.
      return this.speedMbps || ( this.speedMbps = ( function () {
        var bitsLoaded
          , duration
          , speedBps
          , speedKbps
          , speedMbs

        // Calculate duration in seconds.
        duration = ( _this.endTime - _this.startTime ) / 1000

        // Calculate total bits loaded.
        bitsLoaded = _this.downloadSize * 8

        // Calculate speed in bits per second.
        speedBps = bitsLoaded / duration

        // Convert to kilobits per second.
        speedKbps = speedBps / 1024

        // Convert to megabits per second.
        speedMbs = speedKbps / 1024

        // Log all intermediate speed calculations for debugging.
        console.log( duration , bitsLoaded , speedBps , speedKbps , speedMbs )

        // Return the speed in Mbps.
        return speedMbs
      } )() )
    }

    // Return the ResponsiveView class.
    return ResponsiveView

  } )( Backbone.View ) // Pass Backbone.View as the superclass.

} ).call( this ) // Execute the IIFE with 'this' as context.
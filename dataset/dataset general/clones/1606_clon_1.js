// Tumblr Kit 0.9.4 (Initial Public Release)
//
// A jQuery plugin for importing post data from Tumblr’s API.
// Visit the project homepage for more details: http://github.com/matthewbuchanan/tumblr-kit/
//
// Copyright (c) 2012 by Matthew Buchanan
// Author's website: http://matthewbuchanan.name
//
// Released under the WTFPL license - Do What The F*** You Want To Public License
// For license details, see: http://sam.zoy.org/wtfpl/
//
// First released on June 15, 2012
; ( function ( $, window, undefined ) { /* This is an immediately invoked function expression (IIFE)
                                        to create a private scope for the plugin. */

  // Extend jQuery's prototype with a new function to fetch Tumblr posts
  $.fn.getTumblrPosts = function ( options ) {

    // Register helper functions with JsRender for use in templates.
    $.views.helpers( {

      getHostname: function () {
        // This helper function simply returns the blog's hostname.
        return TUMBLR_HOSTNAME;
      },

      getTintedAudioPlayer: function ( view, color ) {
        // This helper generates the embed code for the Flash audio player,
        // with an optional tint color specified by the 'color' parameter.
        var embed = view.data.player;
        if ( color != null ) { // Check if a color has been provided.
          var regex = /color=FFFFFF/g; // Regular expression to find the default white color.
          color = color.split( "#" )[ 1 ]; // Extract the hex value from the color string.
          return embed.replace( regex, "color=" + color ); // Replace the default color with the new one.
        } else {
          return embed; // If no color is specified, return the original embed code.
        }
      },

      getPhotoURL: function ( view, size ) {
        // This function determines the best image URL from available photo sizes.
        // It selects based on the 'size' parameter, finding the next largest size if exact match isn't found.
        var images = view.data.alt_sizes, // Array of alternative image sizes.
            src = ""; // Variable to hold the chosen image source URL.
        for ( var i = 0; i < images.length; i++ ) {
          if ( images[ i ].width >= size ) { // If the current image's width meets or exceeds the requested size.
            src = images[ i ].url; // Set this image's URL as the source.
          } else {
            break; // Otherwise, break the loop as we've passed suitable sizes.
          }
        }
        // If no suitable image was found (src is still empty), return the URL of the first image (original).
        // Otherwise, return the found source URL.
        return ( src === "" ) ? images[ 0 ].url : src;
      },

      getPhotoOrientation: function ( view ) {
        // This helper determines the aspect ratio (orientation) of an image.
        var size = view.data.original_size; // Get the original dimensions of the photo.
        if ( size.width > size.height ) { // If the width is greater than the height.
          return "landscape"; // It's a landscape image.
        } else if ( size.width < size.height ) { // If the height is greater than the width.
          return "portrait"; // It's a portrait image.
        } else {
          return "square"; // Otherwise, it's a square image.
        }
      },

      getVideoEmbed: function ( view, size ) {
        // This function retrieves the most appropriate video embed code based on the specified 'size'.
        // For non-native sizes, it selects the next smallest available size.
        var players = view.data.player, // Array of available video players/embed codes.
            embed = ""; // Variable to store the chosen embed code.
        for ( var i = 0; i < players.length; i++ ) {
          if ( players[ i ].width <= size ) { // If the current player's width is less than or equal to the requested size.
            embed = players[ i ].embed_code; // Select this embed code.
          } else {
            break; // Otherwise, break the loop.
          }
        }
        // If no suitable embed was found, return the embed code of the first player.
        // Otherwise, return the chosen embed code.
        return ( embed === "" ) ? players[ 0 ].embed_code : embed;
      }
    } ); // End of JsRender helpers registration.

    // Define default settings for the Tumblr API request.
    var settings = $.extend( {
      "hostname": TUMBLR_HOSTNAME, // The hostname of the Tumblr blog.
      "id": null, // Optional: specific post ID to retrieve.
      "type": "", // Optional: filter by post type (e.g., "text", "photo", "video").
      "tag": "", // Optional: filter posts by a specific tag.
      "limit": 20, // Number of posts to retrieve (maximum 20).
      "offset": 0, // Starting offset for paginating posts.
      "format": "", // Response format: "none" (for HTML), "text", or "raw".
      "template": "", // ID of the JsRender template to use (e.g., "#tmpl-post").
      "before": null, // Callback function executed before the AJAX request is sent.
      "done": null, // Callback function executed on successful AJAX completion (replaces jQuery's success).
      "always": null // Callback function executed regardless of AJAX success or failure (replaces jQuery's complete).
    }, options ); // Merge default settings with user-provided options.

    // Store a reference to the jQuery object on which the plugin was called.
    var target = this;

    // Iterate over each selected DOM element.
    return this.each( function () {
      // Prepend a slash to the post type if it's specified, for constructing the API URI.
      if ( settings.type != "" ) {
        settings.type = "/" + settings.type;
      }

      // Construct the base URI for the Tumblr API call.
      var uri = "http://api.tumblr.com/v2/blog/" +
                settings.hostname + "/posts" +
                settings.type + "?api_key=" +
                TUMBLR_API_KEY,
          uriWithoutOffset = ""; // Initialize a variable to store the URI before adding the offset.

      // Determine the API request parameters: either a single post by ID or a set of posts by tag/limit/offset.
      if ( settings.id ) {
        // If a specific post ID is provided, append it to the URI.
        uri += "&id=" + parseInt( settings.id );
      } else {
        // If not requesting by ID, apply tag, limit, and offset filters.
        if ( settings.tag ) { // If a tag is specified, encode it and add to URI.
          uri += "&tag=" + encodeURI( settings.tag );
        }
        if ( settings.limit ) { // If a limit is specified, add it to URI.
          uri += "&limit=" + parseInt( settings.limit );
        }
        uriWithoutOffset = uri; // Store the URI without the offset, useful for infinite scrolling.
        if ( settings.offset ) { // If an offset is specified, add it to URI.
          uri += "&offset=" + parseInt( settings.offset );
        }
      }

      // Send the AJAX request to the Tumblr API and handle the response.
      var request = $.ajax( {
        url: uri, // The full constructed API endpoint URL.
        dataType: "jsonp", // Use JSONP for cross-domain requests.
        jsonp: "jsonp", // The name of the JSONP callback parameter.
        ifModified: true, // Only retrieve data if it has been modified since the last request.
        beforeSend: function () {
          // Execute the 'before' callback function if it's defined, preserving the 'this' context.
          if ( typeof settings.before === "function" ) {
            settings.before.call( target );
          }
        }
      } ).done( function ( data, textStatus, jqXHR ) {
        // This callback is executed when the AJAX request completes successfully.

        // Process each returned post if data is valid and posts exist.
        if ( typeof data !== "undefined" && typeof data.response !== "undefined" > data.response.total_posts > 0 ) {
          $.each( data.response.posts, function () {

            // Determine the JsRender template to use for rendering the post.
            // If no specific template is set, default to "#tmpl-" followed by the post type.
            var template = ( settings.template != "" ) ? settings.template : "#tmpl-" + this.type;

            // Render the post content using the selected JsRender template
            // and append the result to the target DOM element.
            target.append( $( template ).render( this ) );
          } );
        }

        // Execute the 'done' callback function if it's defined, passing all relevant data and context.
        if ( typeof settings.done === "function" ) {
          settings.done.call( target, data, textStatus, jqXHR, uriWithoutOffset );
        }
      } ).always( function ( jqXHR, textStatus ) {
        // This callback is executed after the AJAX request finishes, regardless of success or failure.

        // Hide any elements with the class 'tumblr-api-loading' within the target element.
        target.find( ".tumblr-api-loading" ).hide();

        // Execute the 'always' callback function if it's defined, passing relevant data and context.
        if ( typeof settings.always === "function" ) {
          settings.always.call( target, jqXHR, textStatus, uriWithoutOffset );
        }
      } ); // End of the AJAX request chain.
    } ); // End of the .each() iteration.
  }; // End of $.fn.getTumblrPosts definition.

} ( jQuery, window ) ); // End of the IIFE.
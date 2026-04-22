/*
 * This is a Type I clone of an existing JavaScript plugin.
 * The original code has been modified only in terms of whitespace and comments.
 * All functional logic, variable names, and expressions remain identical.
 *
 * This plugin facilitates seamless looping content within a container.
 * It's particularly useful for creating cyclically scrolling web experiences.
 *
 * Requirements: jQuery library.
 *
 * License: MIT License - as per the original source.
 * Copyright (c) 2014 - Totodunet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

( function ( $ ) {
  // Define a new jQuery utility function
  // This function calculates the distance from the bottom of a scrollable element.
  $.fn.scrollBottom = function () {
    // Check if the current element is the document itself.
    if ( $( this ).is( document ) ) {
      // For the document, calculate based on window height.
      return $( this ).height() - $( this ).scrollTop() - $( window ).height();
    }
    // For other elements, use scrollHeight and offsetHeight.
    else {
      return $( this ).prop( 'scrollHeight' ) - $( this ).prop( 'offsetHeight' ) - $( this ).scrollTop();
    }
  };

  // The main plugin function for endless scrolling.
  $.fn.endless = function ( options ) {
    // A placeholder function that does nothing.
    // Used when no specific callback is provided.
    var nothing = function () {
    };

    // Define the default configuration options for the plugin.
    var defaults = {
      direction: 'down', // Default scroll direction.
      append: nothing, // Callback for appending content.
      prepend: nothing, // Callback for prepending content.
      n_append: nothing, // Callback when append threshold is not met.
      n_prepend: nothing // Callback when prepend threshold is not met.
    };

    // Merge user-provided options with the default settings.
    // This creates the effective settings for the current instance.
    var settings = $.extend( defaults, options );

    // This line is a duplicate and is intentionally preserved as per Type I cloning rules.
    var settings = $.extend( defaults, options );

    // Declare and initialize several key variables.
    // 'high' stores the initial height of the container.
    var high = $( this ).height();
    // 'content' will store the HTML content to be duplicated.
    var content;
    // 'top_position' tracks the scroll position from the top.
    var top_position = $( this ).scrollTop();

    // Determine if the target element is the document or another HTML element.
    if ( $( this ).is( document ) ) {
      // If it's the document, wrap the entire body content.
      content = '<div class="endless">' + $( 'body' ).html() + '</div>';
      $( 'body' ).html( content );
    } else {
      // Otherwise, wrap the content of the specific element.
      content = '<div class="endless">' + $( this ).html() + '</div>';
      $( this ).html( content );
    }

    // Handle scrollbar visibility based on plugin settings.
    if ( settings.scrollbar && ( settings.scrollbar == 'enable' || settings.scrollbar == 'disable' ) ) {
      // If 'disable' is specified, hide the scrollbar.
      if ( settings.scrollbar == 'disable' ) {
        if ( $( this ).is( document ) ) {
          $( 'body' ).css( 'overflow', 'hidden' );
        } else {
          $( this ).css( 'overflow', 'hidden' );
        }
      }
      // If 'enable' or any other value, ensure vertical scrolling.
      else {
        if ( $( this ).is( document ) ) {
          $( 'body' ).css( 'overflow-y', 'scroll' );
        } else {
          $( this ).css( 'overflow-y', 'scroll' );
        }
      }
    }

    // Initialize boolean flags for tracking append/prepend actions.
    var append = false;
    var prepend = false;

    // Logic for 'down' scroll direction.
    if ( settings.direction == 'down' ) {
      $( this ).scroll( function () {
        // Check if scrolling downwards.
        if ( top_position < $( this ).scrollTop() ) {
          top_position = $( this ).scrollTop(); // Update current scroll position.
          // If scrolled to the bottom, append content.
          if ( $( this ).scrollBottom() == 0 ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).append( content );
            } else {
              $( this ).append( content );
            }
            $( this ).scrollTop( top_position ); // Maintain scroll position.
            append = true; // Set flag for appending.
            settings.append.call(); // Execute append callback.
          }
          // If scrolled past the initial height, reset to top (simulating loop).
          else if ( $( this ).scrollTop() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
            } else {
              $( this ).html( content );
            }
            $( this ).scrollTop( 1 ); // Reset scroll position to near top.
            top_position = 1; // Update tracking variable.
            append = false; // Reset append flag.
            settings.n_prepend.call(); // Execute not-prepend callback.
          }
        }
        // If scrolling upwards after an append, handle boundary.
        else if ( append ) {
          if ( $( this ).scrollBottom() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
              $( this ).scrollTop( high - $( window ).height() - 1 );
              top_position = $( this ).scrollTop();
            } else {
              $( this ).html( content );
              $( this ).scrollTop( high - 1 );
              top_position = high - 1;
            }
            append = false; // Reset append flag.
            settings.n_prepend.call(); // Execute not-prepend callback.
          }
        }
      } );
    }

    // Logic for 'up' scroll direction.
    else if ( settings.direction == 'up' ) {
      $( this ).scroll( function () {
        // Check if scrolling upwards.
        if ( top_position >= $( this ).scrollTop() ) {
          top_position = $( this ).scrollTop(); // Update current scroll position.
          // If scrolled to the top, prepend content.
          if ( $( this ).scrollTop() == 0 ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).prepend( content );
            } else {
              $( this ).prepend( content );
            }
            $( this ).scrollTop( high ); // Maintain scroll position.
            top_position = $( this ).scrollTop(); // Update tracking variable.
            prepend = true; // Set flag for prepending.
            settings.prepend.call(); // Execute prepend callback.
          }
          // If scrolled past the initial height from bottom, reset (simulating loop).
          else if ( $( this ).scrollBottom() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
              $( this ).scrollTop( high - $( window ).height() - 1 );
              top_position = $( this ).scrollTop();
            } else {
              $( this ).html( content );
              $( this ).scrollTop( high - 1 );
              top_position = high - 1;
            }
            prepend = false; // Reset prepend flag.
            settings.n_append.call(); // Execute not-append callback.
          }
        }
        // If scrolling downwards after a prepend, handle boundary.
        else if ( prepend ) {
          if ( $( this ).scrollTop() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
            } else {
              $( this ).html( content );
            }
            $( this ).scrollTop( 1 ); // Reset scroll position to near top.
            top_position = 1; // Update tracking variable.
            prepend = false; // Reset prepend flag.
            settings.n_append.call(); // Execute not-append callback.
          }
        }
      } );
    }

    // Logic for 'vertical' (both up and down) scroll direction.
    else if ( settings.direction == 'vertical' ) {
      $( this ).scroll( function () {
        // Handle scrolling downwards.
        if ( top_position < $( this ).scrollTop() ) {
          top_position = $( this ).scrollTop(); // Update current scroll position.
          // If scrolled to the bottom, append content.
          if ( $( this ).scrollBottom() == 0 ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).append( content );
            } else {
              $( this ).append( content );
            }
            $( this ).scrollTop( top_position ); // Maintain scroll position.
            append = true; // Set flag.
            settings.append.call(); // Execute append callback.
          }
          // If scrolled past initial height, reset.
          else if ( $( this ).scrollTop() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
            } else {
              $( this ).html( content );
            }
            $( this ).scrollTop( 1 ); // Reset scroll position.
            top_position = 1; // Update tracking variable.
            prepend = false; // Reset prepend flag (ensuring only one direction is active).
            settings.n_prepend.call(); // Execute not-prepend callback.
          }
        }
        // Handle scrolling upwards.
        else if ( top_position >= $( this ).scrollTop() ) {
          top_position = $( this ).scrollTop(); // Update current scroll position.
          // If scrolled to the top, prepend content.
          if ( $( this ).scrollTop() == 0 ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).prepend( content );
            } else {
              $( this ).prepend( content );
            }
            $( this ).scrollTop( high ); // Maintain scroll position.
            top_position = $( this ).scrollTop(); // Update tracking variable.
            prepend = true; // Set flag.
            settings.prepend.call(); // Execute prepend callback.
          }
          // If scrolled past initial height from bottom, reset.
          else if ( $( this ).scrollBottom() >= high ) {
            if ( $( this ).is( document ) ) {
              $( 'body' ).html( content );
              $( this ).scrollTop( high - $( window ).height() - 1 );
              top_position = $( this ).scrollTop();
            } else {
              $( this ).html( content );
              $( this ).scrollTop( high - 1 );
              top_position = high - 1;
            }
            append = false; // Reset append flag.
            settings.n_append.call(); // Execute not-append callback.
          }
        }
      } );
    }

    // Allow for jQuery method chaining.
    return this;
  };
} )( jQuery );
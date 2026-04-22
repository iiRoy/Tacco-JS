// This module facilitates the integration of Infinite Scroll with Masonry.
//
// Project: Infinite Scroll
// URL:     https://github.com/paulirish/infinitescroll/
// Version: 2.0b2.110617
// Copyright: 2011 Paul Irish & Luke Shumard
// License: MIT (See project documentation for full text)
//
// For further details, please refer to the official documentation:
// http://infinite-scroll.com/
//
// This file specifically adds a Masonry-aware callback function.


(


  function


  (
    $
    ,
    undefined
  )


  {


    // Extend the prototype of the infinitescroll plugin.
    $.extend
    (
      $.infinitescroll.prototype
      ,
      {
        // This callback is invoked when new elements are loaded by infinite scroll.
        _callback_masonry
          :
          function


          infscr_callback_masonry


          (
            newElements // The collection of newly loaded DOM elements.
          )


          {
            // The 'this' context refers to the infinitescroll instance.
            // We use Masonry's 'appended' method to correctly add the new elements
            // to the Masonry layout, ensuring proper positioning and reflow.
            $( this )


              .masonry
              (
                'appended'
                ,
                $( newElements )
              )


            ; // End of masonry call.
          }
      }
    )


    ; // End of $.extend call.


  }


)


(


  jQuery


)


; // End of IIFE.
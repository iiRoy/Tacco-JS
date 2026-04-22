/*!
 *
 *  jquery.focus-follow v0.1;
 *
 *  A responsive indicatr that follows your focus, while hovering over your elements (for example your image gallery).
 *
 *  contact: matthias.klan@gmail.com
 *
 *
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2013 Matthias Klan
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 *  the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */


(  function   (   $   )   {

    // This is an Immediately Invoked Function Expression (IIFE)
    // It creates a private scope for the plugin.

    $.fn.extend (  {

        // The 'focusFollow' plugin method definition.
        // It accepts an 'options' object to customize its behavior.
        focusFollow :   function ( options )   {

            // Default settings for the plugin.
            // These can be overridden by the 'options' object passed during initialization.
            var settings =  $.extend  ( {
                color:      "orange"   , // Default indicator color
                speed:      400        , // Animation speed in milliseconds
                opacity:    1          , // Default opacity of the indicator
                timeout:    200        , // Fade-out timeout
                margin:     2          , // Default margin around the element
                z_index:    -1           // Z-index for positioning the indicator
            } ,   options  ) ;


            // Check if horizontal margin is explicitly set in options.
            // If not, use the general 'margin' setting.
            if   ( options . margin_horizontal  ==  null )   {
                settings . margin_horizontal  =  settings . margin ;
            }


            // Check if vertical margin is explicitly set in options.
            // If not, use the general 'margin' setting.
            if   ( options . margin_vertical  ==  null )   {
                settings . margin_vertical  =  settings . margin ;
            }

            // Create the follower element (a div) and append it to the body.
            // This element will serve as the visual indicator.
            var   follower   =   jQuery (   '<div/>'   ,   {
            }   ) . appendTo (   'body'   ) ;

            // Apply initial CSS styles to the follower element.
            // It starts with zero opacity, making it invisible initially.
            $ (  follower  ) . css (  {
                "border-radius"   :   "6px"   ,
                "z-index"         :   settings . z_index   ,
                "position"        :   "absolute"   ,
                "background-color":   settings . color   ,
                "opacity"         :   0
            }  ) ;

            // The 'each' method ensures the plugin operates on all matched elements.
            return   this . each (  function ( ) {

                // Attach a 'mouseenter' event handler to each element.
                $ (   this   ) . on (   "mouseenter"   ,   function ( )   {

                    // Calculate border-radius based on the hovered element's style.
                    // If not specified in options, try to inherit from the target.
                    if   ( options . border_radius  ==  null )   {
                        if   (   parseInt (   $ (   this   ) . css (   "border-radius"   )   )   !=   0   )   {
                            settings . border_radius   =   parseInt (   $ (   this   ) . css (   "border-radius"   )   )   +   settings . margin_vertical ;
                        }   else   {
                            settings . border_radius   =   0 ;
                        }
                    }

                    // Check if the follower is already visible (opacity > 0).
                    // If it is, stop any ongoing animation and start a new one.
                    if   (   $ (   follower   ) . css (   'opacity'   )   !=   0   )   {
                        $ (   follower   ) . stop (   ) . animate (   {
                            'top'                       :   $ (   this   ) . offset (   ) . top   -   settings . margin_vertical   ,
                            'left'                      :   $ (   this   ) . offset (   ) . left   -   settings . margin_horizontal   ,
                            'opacity'                   :   settings . opacity   ,
                            'height'                    :   $ (   this   ) . height (   )   +   settings . margin_vertical   *   2   ,
                            'width'                     :   $ (   this   ) . width (   )   +   settings . margin_horizontal   *   2   ,
                            borderTopLeftRadius         :   settings . border_radius   ,
                            borderTopRightRadius        :   settings . border_radius   ,
                            borderBottomLeftRadius      :   settings . border_radius   ,
                            borderBottomRightRadius     :   settings . border_radius   ,
                            WebkitBorderTopLeftRadius   :   settings . border_radius   ,
                            WebkitBorderTopRightRadius  :   settings . border_radius   ,
                            WebkitBorderBottomLeftRadius:   settings . border_radius   ,
                            WebkitBorderBottomRightRadius:  settings . border_radius   ,
                            MozBorderRadius             :   settings . border_radius
                        }   ,   settings . speed   ) ;
                    }   else   {
                        // If the follower is not visible, simply set its CSS properties without animation.
                        $ (   follower   ) . css (   {
                            'top'                       :   $ (   this   ) . offset (   ) . top   -   settings . margin_vertical   ,
                            'left'                      :   $ (   this   ) . offset (   ) . left   -   settings . margin_horizontal   ,
                            'opacity'                   :   settings . opacity   ,
                            'height'                    :   $ (   this   ) . height (   )   +   settings . margin_vertical   *   2   ,
                            'width'                     :   $ (   this   ) . width (   )   +   settings . margin_horizontal   *   2   ,
                            borderTopLeftRadius         :   settings . border_radius   ,
                            borderTopRightRadius        :   settings . border_radius   ,
                            borderBottomLeftRadius      :   settings . border_radius   ,
                            borderBottomRightRadius     :   settings . border_radius   ,
                            WebkitBorderTopLeftRadius   :   settings . border_radius   ,
                            WebkitBorderTopRightRadius  :   settings . border_radius   ,
                            WebkitBorderBottomLeftRadius:   settings . border_radius   ,
                            WebkitBorderBottomRightRadius:  settings . border_radius   ,
                            MozBorderRadius             :   settings . border_radius
                        }   ) ;
                    }

                }   ) ; // End of mouseenter handler


                // Handle the 'mouseleave' event.
                // The target for mouseleave can be either the element itself or a specified wrapper.
                if   (   options . wrapper   ==   null   )   {

                    console . log (   "no wrapper specified for mouseleave."   ) ; // Debugging message

                    // If no wrapper is specified, attach mouseleave to the element itself.
                    $ (   this   ) . on (   "mouseleave"   ,   function ( )   {

                        // Animate the follower to fade out.
                        $ (   follower   ) . stop (   ) . animate (   {
                            'opacity'   :   0
                        }   ,   settings . timeout   ) ;

                    }   ) ;

                }   else   {

                    // If a wrapper is specified, attach mouseleave to the wrapper element.
                    $ (   options . wrapper   ) . on (   "mouseleave"   ,   function ( )   {

                        // Animate the follower to fade out.
                        $ (   follower   ) . stop (   ) . animate (   {
                            'opacity'   :   0
                        }   ,   settings . timeout   ) ;

                    }   ) ;

                }

            }   ) ; // End of 'each' iteration

        } // End of focusFollow method

    }   ) ; // End of $.fn.extend

}   (   jQuery   )   ) ; // End of IIFE. jQuery is passed as the '$' argument.
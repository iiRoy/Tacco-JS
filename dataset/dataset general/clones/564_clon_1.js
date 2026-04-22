/*
 * This JavaScript file contains a collection of jQuery plugins.
 * It is a minified version of Vanity JS, designed as a foundational
 * toolkit for common jQuery functionalities.
 *
 * The included plugins are:
 *     - jTip: For creating interactive tooltips.
 *     - jSlider: A versatile content slider.
 *     - jPaginate: For easy content pagination.
 *     - jSpotlight: For highlighting specific elements.
 *     - jPlaceholder: Implements form field placeholders.
 *     - jCollapse: A JavaScript-driven accordion component.
 *
 * For detailed documentation on each plugin's usage and options,
 * please refer to the comments within this file or visit:
 * http://vanity.enavu.com/documentation/
 */

//
// jSlider Plugin for jQuery - Version 0.1
// Developed by Angel Grablev for Enavu Web Development network (enavu.com)
//
// Licensed under both MIT and GPL. Enjoy!
//

/*
 *
 * How to use the jSlider plugin:
 * Simply call .jSlider() on the desired element, like this:
 * $(".my-slider-element").jSlider();
 *
 *
 * Available Configuration Options:
 *
 * previous_class  : CSS class for the element that navigates to the previous item.
 * next_class      : CSS class for the element that navigates to the next item/slide.
 * inactive        : CSS class applied to navigation elements when they are inactive (e.g., first/last slide).
 * elem            : The selector for individual content items within your slider (e.g., 'li' if your slider is a 'ul').
 * animation       : The type of animation for slide transitions. Default is "fade".
 *                   If 'custom_animations.js' is included, additional options are:
 *                   slideDown, slideUp, slideRight, slideLeft, bounce, explode, fold, scale, random.
 * easing          : Easing function for animations. Default is "swing".
 *                   If 'custom_easing.js' is included, more options are available:
 *                   linear, swing, jswing, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic,
 *                   easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint,
 *                   easeInOutQuint, easeInSine, easeOutSine, easeInOutSine, easeInExpo, easeOutExpo,
 *                   easeInOutExpo, easeInCirc, easeOutCirc, easeInOutCirc, easeInElastic, easeOutElastic,
 *                   easeInOutElastic, easeInBack, easeOutBack, easeInOutBack, easeInBounce, easeOutBounce,
 *                   easeInOutBounce.
 * speed           : The duration of the animation in milliseconds.
 * navi            : Boolean (true/false) to enable or disable the navigation list (page indicators).
 * navi_active_class: CSS class for the currently active item in the navigation list (if 'navi' is true).
 * navi_class      : CSS class for the navigation list itself (if 'navi' is true).
 * auto_slide      : Boolean (true/false) to enable automatic sliding/playback of the slider.
 * auto_slide_interval: Time in milliseconds between automatic slide transitions.
 * auto_pause_hover: Boolean (true/false) to pause the auto-slide when the mouse hovers over the slider.
 *                   Only applicable if 'auto_slide' is enabled.
 * click_next      : Boolean (true/false) to allow advancing to the next slide by clicking on the slider content.
 * infinite        : Boolean (true/false) to enable infinite looping of the slider. When at the last slide,
 *                   clicking 'next' goes to the first, and vice-versa for 'previous'.
 * images          : Boolean (true/false). If your slider uses an image for each slide, enabling this will
 *                   set that image as the background of the slider, providing a smoother transition effect.
 *
 */
( function( $ ) {

    $.fn.jSlider = function( options ) {

        var defaults = {
            previous_class      : "prev",
            next_class          : "next",
            inactive            : "inactive",
            elem                : "div",
            animation           : "fade",
            easing              : "swing",
            speed               : 700,
            navi                : true,
            navi_active_class   : "active",
            navi_class          : "navi",
            auto_slide          : false,
            auto_slide_interval : 5000,
            auto_pause_hover    : true,
            click_next          : false,
            infinite            : false,
            images              : false
        };

        var options = $.extend( defaults, options );


        return this.each( function() {

            // 'obj' refers to the currently selected slider element
            obj = $( this );

            var objChildren       = obj.children( options.elem );
            var number_of_items   = obj.children( options.elem ).size();
            var prev              = $( "." + options.previous_class );
            var next              = $( "." + options.next_class );
            var items             = [];
            var curr              = 1;


            // Populate an array with each slider item for easy access
            for ( i = 1; i <= number_of_items; i++ ) {

                items[ i ] = obj.find( options.elem + ":nth-child(" + i + ")" );

            }


            // Initialize the slider by displaying the first slide
            slider( 1, "", 1 );


            // Check if auto-slide functionality is enabled
            if ( options.auto_slide ) {

                var timer = setInterval( function() {

                    if ( curr < number_of_items ) {
                        // Move to the next slide
                        slider( curr, "next", curr );
                    } else {
                        // If at the last slide and infinite loop is enabled, go back to the first
                        if ( options.infinite ) {
                            slider( 1, curr, number_of_items );
                            curr = 1; // Reset current slide counter
                        }
                    }

                }, options.auto_slide_interval ); // Set interval for auto-sliding

            }


            // Implement auto-pause on hover if enabled and auto-slide is active
            if ( options.auto_slide && options.auto_pause_hover ) {

                obj.children().hover( function() {
                    // On hover in, clear the auto-slide timer
                    clearInterval( timer );
                }, function() {
                    // On hover out, restart the auto-slide timer
                    timer = setInterval( function() {

                        if ( curr < number_of_items ) {
                            slider( curr, "next", curr );
                        } else {
                            if ( options.infinite ) {
                                slider( 1, curr, number_of_items );
                                curr = 1;
                            }
                        }

                    }, options.auto_slide_interval );

                } );

            }


            // Enable click-to-advance functionality if configured
            if ( options.click_next ) {

                objChildren.click( "click", function( e ) {

                    e.preventDefault(); // Prevent default link behavior

                    if ( curr < number_of_items ) {
                        // Advance to the next slide
                        slider( curr, "next", curr );
                    } else {
                        // If at the end and infinite looping is on, go to the first slide
                        if ( options.infinite ) {
                            slider( 1, curr, number_of_items );
                            curr = 1;
                        }
                    }

                } );

            }


            // Main function to control slide display and navigation state
            function slider( page, direction, from ) {

                // Determine the new current page based on direction
                if ( direction == "next" ) {
                    ++page;
                    curr = page;
                }
                if ( direction == "prev" ) {
                    --page;
                    curr = page;
                }

                obj.children( options.elem ).hide(); // Hide all slider items initially

                // Apply custom animation to show the new slide
                show( page, from );

                // If navigation indicators are enabled, update them
                if ( options.navi ) {
                    createPagination( page );
                }

                // Manage 'inactive' classes for previous/next buttons if not in infinite mode
                if ( !options.infinite ) {

                    if ( page == 1 ) {
                        prev.addClass( options.inactive ).css( { "cursor" : "default" } );
                    } else {
                        prev.removeClass( options.inactive ).css( { "cursor" : "pointer" } );
                    }

                    if ( page == number_of_items ) {
                        next.addClass( options.inactive ).css( { "cursor" : "default" } );
                    } else {
                        next.removeClass( options.inactive ).css( { "cursor" : "pointer" } );
                    }

                }

            }


            // Function to generate or update the pagination navigation list
            function createPagination( curr ) {

                $( "." + options.navi_class ).remove(); // Remove any existing navigation list

                var start, items = "", nav = "";
                start = "<ul class='" + options.navi_class + "'>";
                var end = "</ul>"

                // Loop through all items to build the navigation links
                for ( i = 1; i <= number_of_items; i++ ) {

                    if ( i == curr ) {
                        // Mark the current page as active
                        items += '<li><a class="' + options.navi_active_class + '" title="' + i + '">' + i + '</a></li>';
                    } else {
                        // Create regular navigation links
                        items += '<li><a href="#" class="goto" title="' + i + '">' + i + '</a></li>';
                    }

                }

                nav = start + items + end; // Assemble the full navigation HTML
                obj.append( nav ); // Append the navigation to the slider element

            }


            // Function handling the custom animation display logic
            function show( page, from ) {

                // If 'images' option is true, set the background image for a smooth transition
                if ( options.images ) {

                    if ( number_of_items != 1 ) {

                        var img = items[ from ].find( "img" ).attr( "src" );
                        obj.css( { "background" : "url(" + img + ") center center" } );

                    }

                }

                var animation; // Declare animation variable

                // If animation is set to "random", pick one from a predefined list
                if ( options.animation == "random" ) {

                    var randomation  = [ "fade", "slideDown", "slideUp", "slideRight", "slideLeft", "bounce", "slideUp", "explode", "fold", "scale" ];
                    var randomnumber = Math.floor( Math.random() * 10 );
                    animation        = randomation[ randomnumber ];

                } else {

                    animation = options.animation; // Use the specified animation

                }

                objChildren.hide(); // Hide all children before showing the target one

                // Apply the selected animation effect
                switch ( animation ) {

                    case "fade":
                        items[ page ].stop().fadeIn( options.speed );
                        break;

                    case "slideDown":
                        items[ page ].stop().show( 'slide', { direction : 'up', easing : options.easing }, options.speed );
                        break;

                    case "slideUp":
                        items[ page ].stop().show( 'slide', { direction : 'down', easing : options.easing }, options.speed );
                        break;

                    case "slideRight":
                        items[ page ].stop().show( 'slide', { direction : 'left', easing : options.easing }, options.speed );
                        break;

                    case "slideLeft":
                        items[ page ].stop().show( 'slide', { direction : 'right', easing : options.easing }, options.speed );
                        break;

                    case "bounce":
                        items[ page ].stop().show( 'bounce', { direction : "up", easing : options.easing }, options.speed );
                        break;

                    case "explode":
                        items[ page ].stop().show( 'explode', { direction : "down", easing : options.easing }, options.speed );
                        break;

                    case "fold":
                        items[ page ].stop().show( 'fold', { direction : "down", easing : options.easing }, options.speed );
                        break;

                    case "scale":
                        items[ page ].stop().show( 'scale', { direction : "down", easing : options.easing }, options.speed );
                        break;

                    default:
                        items[ page ].show(); // Fallback to simple show if animation is not recognized
                        break;

                }

            }

            // Event handlers for slider controls

            // Handle 'next' button clicks
            $( "." + options.next_class ).live( "click", function( e ) {

                e.preventDefault(); // Prevent default action

                if ( curr < number_of_items ) {
                    slider( curr, "next", curr );
                } else {
                    if ( options.infinite ) {
                        slider( 1, curr, number_of_items );
                        curr = 1;
                    }
                }

            } );


            // Handle 'previous' button clicks
            $( "." + options.previous_class ).live( "click", function( e ) {

                e.preventDefault(); // Prevent default action

                if ( curr > 1 ) {
                    slider( curr, "prev", curr );
                } else {
                    if ( options.infinite ) {
                        slider( number_of_items, curr, 1 );
                        curr = number_of_items;
                    }
                }

            } );


            // Handle navigation 'goto' link clicks
            $( ".goto" ).live( "click", function( e ) {

                e.preventDefault(); // Prevent default action

                var newy_curr = $( this ).attr( "title" ); // Get target page from title attribute

                // Call slider function, direction parameter is empty as it's a direct jump
                if ( newy_curr > curr ) {
                    slider( newy_curr, "", curr );
                } else {
                    slider( newy_curr, "", curr );
                }

                curr = newy_curr; // Update current page

            } );

        } );

    };

} )( jQuery );


//
// jTabs Plugin for jQuery - Version 0.3
// by Angel Grablev for Enavu Web Development network (enavu.com)
// Dual license under MIT and GPL :) enjoy
//
/*
 *
 * Usage:
 * Call .jTabs() on the element containing your tab navigation (e.g., a UL).
 * Provide the 'content' option, which is the selector for the container holding the tab content divs.
 * Example: $("ul.tabs").jTabs({ content: "div.tab-content-wrapper" });
 *
 *
 * Options available for jTabs:
 *
 * content      : The selector for the element that contains the content divs for each tab.
 * equal_height : (true/false) If true, all content tabs will be resized to match the height of the tallest tab.
 * cookies      : (true/false) If true, the plugin will use browser cookies to remember the last active tab
 *                for the user across sessions.
 * animate      : (true/false) If true, a visual animation effect will be used when switching between tabs.
 * effect       : The animation effect to use if 'animate' is true. Default is "fade".
 *                Another option is "slide".
 * speed        : The duration of the animation effect in milliseconds, used when 'animate' is true.
 *
 */
( function( $ ) {

    $.fn.jTabs = function( options ) {

        var defaults = {
            content      : "div.content",
            equal_height : false,
            cookies      : false,
            animate      : false,
            effect       : "fade",
            speed        : 400
        };

        var options = $.extend( defaults, options );


        return this.each( function() {

            // 'obj' refers to the currently selected tab navigation element (e.g., the UL)
            obj = $( this );


            var objTabs           = $( options.content );
            var number_of_items   = obj.children( "li" ).size();
            var tabIndex          = [];
            var tabs              = [];


            // Create an array mapping tab navigation items to their index
            for ( i = 1; i <= number_of_items; i++ ) {
                tabIndex[ i ] = obj.find( "li:nth-child(" + i + ")" );
                tabIndex[ i ].attr( "title", i ); // Store index in title for easy access
            }

            // Create an array mapping tab content divs to their index
            for ( i = 1; i <= number_of_items; i++ ) {
                tabs[ i ] = $( options.content + "> div:nth-child(" + i + ")" );
            }


            // If equal_height option is enabled, calculate and set max height
            if ( options.equal_height ) {

                var maxHeight = 0;

                $( options.content ).children( "div" ).each( function() {

                    if ( $( this ).outerHeight() > maxHeight ) {
                        maxHeight = $( this ).outerHeight();
                    }

                } );

                $( options.content ).height( maxHeight ); // Apply the calculated max height

            }


            // Initialize the current tab to be displayed
            if ( options.cookies ) {

                if ( getCookie( "page" ) ) {
                    showTab( getCookie( "page" ) ); // Show tab based on cookie
                } else {
                    setCookie( "page", 1, 999 ); // Set default to first tab if no cookie
                    showTab( 1 );
                }

            } else {

                showTab( 1 ); // Always show the first tab if cookies are not used

            }


            // Function to display a specific tab content
            function showTab( num ) {

                tabIndex[ num ].addClass( "active" ).siblings().removeClass( "active" ); // Mark current tab as active

                if ( !options.animate ) {
                    tabs[ num ].show().siblings().hide(); // No animation, just show/hide
                } else {

                    // Apply animation based on the 'effect' option
                    switch ( options.effect ) {

                        case "fade":
                            tabs[ num ].fadeIn( options.speed ).siblings().hide();
                            break;

                        case "slide":
                            tabs[ num ].slideDown( options.speed ).siblings().hide();
                            break;

                    }

                }

            }


            // Event listener for tab clicks
            obj.find( "li" ).live( "click", function( e ) {

                e.preventDefault(); // Prevent default link behavior

                var tab_num = $( this ).attr( "title" ); // Get the target tab number

                showTab( tab_num ); // Display the clicked tab

                if ( options.cookies ) {
                    setCookie( "page", tab_num, 999 ); // Update cookie if enabled
                }

            } );


            /* Helper functions for cookie management */

            // Function to set a cookie
            function setCookie( c_name, value, expiredays ) {

                var exdate = new Date();
                exdate.setDate( exdate.getDate() + expiredays );
                document.cookie = c_name + "=" + escape( value ) +
                    ( ( expiredays == null ) ? "" : ";expires=" + exdate.toUTCString() ) ;

            }

            // Function to get a cookie's value
            function getCookie( c_name ) {

                if ( document.cookie.length > 0 ) {

                    c_start = document.cookie.indexOf( c_name + "=" );

                    if ( c_start != -1 ) {
                        c_start = c_start + c_name.length + 1;
                        c_end = document.cookie.indexOf( ";", c_start );

                        if ( c_end == -1 ) {
                            c_end = document.cookie.length;
                        }

                        return unescape( document.cookie.substring( c_start, c_end ) );
                    }

                }

                return ""; // Return empty string if cookie not found

            }

        } );


    };

} )( jQuery );


//
// jPaginate Plugin for jQuery - Version 0.3
// by Angel Grablev for Enavu Web Development network (enavu.com)
// Dual license under MIT and GPL :) enjoy
//
/*
 *
 * How to use the jPaginate plugin:
 * Simply call .jPaginate() on the element containing the items you wish to paginate.
 * Example: $("#my-content-list").jPaginate();
 *
 *
 * Available Configuration Options:
 *
 * items          : The number of items to display per page in the pagination.
 * next           : The text to be displayed inside the "Next" button.
 * previous       : The text to be displayed inside the "Previous" button.
 * active         : The CSS class to apply to the currently active pagination link.
 * pagination_class: The CSS class for the generated pagination element, allowing for custom styling.
 * minimize       : (true/false) If true, the pagination links will be minimized to show a limited number of pages,
 *                  with ellipses for omitted pages.
 * nav_items      : When 'minimize' is true, this specifies how many navigation items (page numbers) to display.
 * cookies        : (true/false) If true (default), uses cookies to remember the user's last visited page.
 * position       : Specifies where the pagination element should be placed relative to the content.
 *                  Possible options: "before", "after", or "both".
 * equal          : (true/false) If true, the main content element will have its height adjusted to
 *                  match the highest possible page content, ensuring consistent layout.
 * offset         : An integer value to adjust the calculated height when 'equal' is true.
 *                  Useful for fine-tuning layout as JavaScript height calculations can sometimes be slightly off.
 *                  Default is 50.
 *
 */
( function( $ ) {

    $.fn.jPaginate = function( options ) {

        var defaults = {
            items            : 4,
            next             : "Next",
            previous         : "Previous",
            active           : "active",
            pagination_class : "pagination",
            minimize         : false,
            nav_items        : 6,
            cookies          : true,
            position         : "after",
            equal            : false,
            offset           : 50
        };

        var options = $.extend( defaults, options );


        return this.each( function() {

            // 'obj' refers to the selected element containing the items to paginate
            var obj             = $( this );

            // Get the number of items to show per page from options
            var show_per_page   = options.items;

            // Calculate the total number of items within the parent element
            var number_of_items = obj.children().size();

            // Determine the total number of pages required
            var number_of_pages = Math.ceil( number_of_items / show_per_page );


            // Prepare arrays to store elements for each page
            var array_of_elements = [];
            var numP              = 0; // Starting index for slice
            var nexP              = show_per_page; // Ending index for slice

            var height            = 0;
            var max_height        = 0;

            // Loop through all pages to group elements into the array
            for ( i = 1; i <= number_of_pages; i++ ) {

                array_of_elements[ i ] = obj.children().slice( numP, nexP );

                // If 'equal' height is enabled, calculate the height for each page
                if ( options.equal ) {

                    obj.children().slice( numP, nexP ).each( function() {
                        height += $( this ).outerHeight();
                    } );

                    if ( height > max_height ) {
                        max_height = height; // Track the maximum height
                    }

                    height = 0; // Reset height for the next page

                }

                numP += show_per_page; // Advance starting index
                nexP += show_per_page; // Advance ending index

            }

            // Apply the calculated max height if 'equal' is true
            if ( options.equal ) {
                max_height += options.offset; // Add offset for fine-tuning
                obj.css( { "height" : max_height } );
            }


            // Display the first page and manage cookies
            if ( options.cookies == true ) {

                if ( get_cookie( "current" ) ) {
                    showPage( get_cookie( "current" ) ); // Show page from cookie
                    createPagination( get_cookie( "current" ) ); // Create pagination for that page
                } else {
                    set_cookie( "current", "1" ); // Set cookie for first page
                    showPage( get_cookie( "current" ) );
                    createPagination( get_cookie( "current" ) );
                }

            } else {

                showPage( 1 ); // Show first page
                createPagination( 1 ); // Create pagination for first page

            }


            // Function to display a specific page of items
            function showPage( page ) {

                obj.children().hide(); // Hide all items
                array_of_elements[ page ].show(); // Show items for the selected page

            }


            // Function to create and update the pagination navigation
            function createPagination( curr ) {

                var start, items = "", end, nav = "";

                start = "<ul class='" + options.pagination_class + "'>";

                var previous         = "<li><a class='goto_previous' href='#'>" + options.previous + "</a></li>";
                var next             = "<li><a class='goto_next' href='#'>" + options.next + "</a></li>";
                var previous_inactive = "<li><a class='inactive'>" + options.previous + "</a></li>";
                var next_inactive     = "<li><a class='inactive'>" + options.next + "</a></li>";

                end = "</ul><br clear='all' />"

                var after = number_of_pages - options.after + 1; // Unused variable 'options.after' here? Assuming it might be a typo for nav_items or similar in a different context.

                var pagi_range = paginationCalculator( curr ); // Calculate range for minimized pagination


                // Generate pagination links
                for ( i = 1; i <= number_of_pages; i++ ) {

                    if ( options.minimize == true ) {

                        var half = Math.ceil( number_of_pages / 2 )

                        if ( i >= pagi_range.start && i <= pagi_range.end ) {

                            if ( i == curr ) {
                                items += '<li><a class="' + options.active + '" title="' + i + '">' + i + '</a></li>';
                            } else {
                                items += '<li><a href="#" class="goto" title="' + i + '">' + i + '</a></li>';
                            }

                        } else if ( curr <= half ) {

                            if ( i >= ( number_of_pages - 2 ) ) {

                                if ( i == curr ) {
                                    items += '<li><a class="' + options.active + '" title="' + i + '">' + i + '</a></li>';
                                } else {
                                    items += '<li><a href="#" class="goto" title="' + i + '">' + i + '</a></li>';
                                }

                            }

                        } else if ( curr >= half ) {

                            if ( i <= 2 ) {

                                if ( i == curr ) {
                                    items += '<li><a class="' + options.active + '" title="' + i + '">' + i + '</a></li>';
                                } else {
                                    items += '<li><a href="#" class="goto" title="' + i + '">' + i + '</a></li>';
                                }

                            }

                        }

                    } else {
                        // Full pagination without minimization
                        if ( i == curr ) {
                            items += '<li><a class="' + options.active + '" title="' + i + '">' + i + '</a></li>';
                        } else {
                            items += '<li><a href="#" class="goto" title="' + i + '">' + i + '</a></li>';
                        }

                    }

                }

                // Assemble the full navigation string including previous/next buttons
                if ( curr != 1 && curr != number_of_pages ) {
                    nav = start + previous + items + next + end;
                } else if ( number_of_pages == 1 ) {
                    nav = start + previous_inactive + items + next_inactive + end;
                } else if ( curr == number_of_pages ) {
                    nav = start + previous + items + next_inactive + end;
                } else if ( curr == 1 ) {
                    nav = start + previous_inactive + items + next + end;
                }

                // Insert the navigation based on the 'position' option
                if ( options.position == "before" ) {
                    obj.before( nav );
                } else if ( options.position == "after" ) {
                    obj.after( nav );
                } else { // Default to "both" or if position is invalid
                    obj.after( nav );
                    obj.before( nav );
                }

            }

            // A helper function for pagination range calculation (for minimized pagination)
            function paginationCalculator(curr_page) {
                var range = {};
                var start_page = Math.max(1, curr_page - Math.floor(options.nav_items / 2));
                var end_page = Math.min(number_of_pages, start_page + options.nav_items - 1);

                // Adjust start_page if end_page is pushed past the total number of pages
                if (end_page - start_page + 1 < options.nav_items) {
                    start_page = Math.max(1, end_page - options.nav_items + 1);
                }

                range.start = start_page;
                range.end = end_page;
                return range;
            }


            /*
             * Re-declaration of cookie handling functions.
             * Note: These functions are duplicates of those in jTabs.
             * They should ideally be defined once in a shared scope or utility.
             */

            // Function to set a cookie
            function set_cookie( c_name, value ) {
                var exdate = new Date();
                exdate.setDate( exdate.getDate() + 999 ); // Expires in 999 days
                document.cookie = c_name + "=" + escape( value ) + ";expires=" + exdate.toUTCString();
            }

            // Function to get a cookie's value
            function get_cookie( c_name ) {
                if ( document.cookie.length > 0 ) {
                    var c_start = document.cookie.indexOf( c_name + "=" );
                    if ( c_start != -1 ) {
                        c_start = c_start + c_name.length + 1;
                        var c_end = document.cookie.indexOf( ";", c_start );
                        if ( c_end == -1 ) {
                            c_end = document.cookie.length;
                        }
                        return unescape( document.cookie.substring( c_start, c_end ) );
                    }
                }
                return "";
            }

        } );

    };

} )( jQuery );
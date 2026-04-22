/*
 * Multi-Screen.js - Version 1.2.2
 * Author: Ian de Vries <ian@ian-devries.com>
 * License: MIT - see http://opensource.org/licenses/MIT
 */


var    MultiScreen   =   (  function (  )  {


        /*
         *   screens variable
         *   This variable will hold references to all the individual screen elements managed by this plugin.
         */
    var    screens     ;


        /*
         *   lock_navigation
         *   A boolean flag to prevent navigation during an ongoing animation sequence.
         */
    var    lock_navigation     ;


        /*
         *   current_screen
         *   Keeps a reference to the currently active screen element.
         */
    var    current_screen      ;


        /*
         *   default_enter_animation
         *   Specifies the default command string for screen entry animations.
         */
    var    default_enter_animation     ;


        /*
         *   default_exit_animation
         *   Specifies the default command string for screen exit animations.
         */
    var    default_exit_animation      ;


        /*
         *   default_enter_time
         *   Defines the default duration for enter animations, in milliseconds.
         */
    var    default_enter_time      ;


        /*
         *   default_exit_time
         *   Defines the default duration for exit animations, in milliseconds.
         */
    var    default_exit_time       ;


        /*
         *   default_delay
         *   The default setting for whether there should be a delay between exit and enter animations.
         */
    var    default_delay       ;


        /*
         *   default_distance_buffer_vertical
         *   Default vertical spacing buffer used during animations between screen anchor points.
         */
    var    default_distance_buffer_vertical        ;


        /*
         *   default_distance_buffer_horizontal
         *   Default horizontal spacing buffer used during animations between screen anchor points.
         */
    var    default_distance_buffer_horizontal      ;


        /*
         *   default_scroll_time
         *   The default time in milliseconds for scrolling to the top of the page before a screen switch.
         */
    var    default_scroll_time     ;


        /*
         *   animation_queue
         *   A temporary storage for chaining animation options, if sequential transitions are desired.
         */
    var    animation_queue     ;


        /*
         *   valid_commands
         *   An exhaustive list of all recognized animation command strings.
         */
    var    valid_commands      = [
                                'fade',
                                'fadetop',
                                'fadetopright',
                                'faderight',
                                'fadebottomright',
                                'fadebottom',
                                'fadebottomleft',
                                'fadeleft',
                                'fadetopleft',
                                'top',
                                'topright',
                                'right',
                                'bottomright',
                                'bottom',
                                'bottomleft',
                                'left',
                                'topleft'
                                ]       ;


        /*
         *   init()
         *   Initializes the MultiScreen plugin, setting up defaults and event listeners.
         *   @param {Object} options   Optional settings to override the plugin's defaults.
         */
    var    init        =   function (  options  )  {


            //  Locate all elements designated as screens for MultiScreen.js
        var    ms_screens      =   $ (  'div.ms-container'  )   ;


            //  The plugin is only useful if there are at least two screens to switch between.
        if  (  ms_screens.length    >    1  )  {


                //  Check if a default screen has been explicitly marked.
            var    default_screen      =   $ (  'div.ms-container.ms-default'  )   ;


                //  If no default screen is specified, assign the first found screen as default.
            if  (  default_screen.length   ===   0  )  {


                    //  Use the very first container found and apply the 'ms-default' class to it.
                default_screen      =   $ (  ms_screens[0]  )   ;
                default_screen.toggleClass (  'ms-default'  )   ;


                //  If multiple screens are marked as default, only the first one will be treated as such.
            }  else if  (  default_screen.length    >    1  )  {

                    //  Select the first default screen and remove the 'ms-default' class from any others.
                default_screen      =   $ (  default_screen[0]  )   ;
                $ (  'div.ms-container.ms-default'  )  .not (  'div.ms-container.ms-default:first'  )  .toggleClass (  'ms-default'  )   ;

            }


            //  Set the identified default screen as the currently active screen.
            current_screen      =   default_screen      ;

            //  Store references to all screens for efficient lookup during navigation.
            store_screens (  ms_screens  )   ;

            //  Apply any custom default settings provided in the options object.
            set_defaults (  options  )   ;

            //  Initialize navigation state and activate event listeners for navigation links.
            lock_navigation     =   false   ;
            animation_queue     =   false   ;
            activate_links (  )   ;

        }

    }   ;


        /*
         *   activate_links()
         *   Binds click event handlers to all navigation links, triggering screen transitions.
         */
    var    activate_links      =   function (  )  {


            //  Attach a click event listener to all elements with the 'ms-nav-link' class.
        $ (  '.ms-nav-link'  )  .click (  function (  node  )  {


                //  Retrieve the jQuery object for the clicked navigation link.
            var    link        =   $ (  node.target  )   ;

                //  Initiate the screen switching process using attributes from the clicked link.
            switch_screens (  {
                                target_id:                  link.attr (  'data-ms-target'  )    ,
                                animation_command:          link.attr (  'data-ms-animation'  )    ,
                                enter_animation_command:    link.attr (  'data-ms-enter-animation'  )    ,
                                exit_animation_command:     link.attr (  'data-ms-exit-animation'  )    ,
                                animation_time:             link.attr (  'data-ms-time'  )    ,
                                enter_animation_time:       link.attr (  'data-ms-enter-time'  )    ,
                                exit_animation_time:        link.attr (  'data-ms-exit-time'  )    ,
                                delay:                      link.attr (  'data-ms-delay'  )    ,
                                distance:                   link.attr (  'data-ms-distance'  )    ,
                                vertical_distance:          link.attr (  'data-ms-vertical-distance'  )    ,
                                horizontal_distance:        link.attr (  'data-ms-horizontal-distance'  )    ,
                                scroll_time:                link.attr (  'data-ms-scroll-time'  )
                            }  )   ;

        }  )   ;

    }   ;


        /*
         *   switch_screens(options)
         *   Public API method to programmatically transition between screens.
         *   @param {Object} options   A configuration object detailing the target screen and animation specifics.
         *   @return {Boolean}         True if the animation successfully started, false otherwise (e.g., navigation locked).
         */
    var    switch_screens      =   function   (  options  )   {


            //  Only proceed if no other screen transition is currently in progress.
        if  (  lock_navigation   ===   false  )  {


                //  Lock the navigation to prevent concurrent screen switches.
            lock_navigation     =   true    ;


                //  Identify the target screen based on the provided options and the current screen.
            var    target      =   (  typeof options   ===   'object'   &&   typeof options.target_id   ===   'string'  )   ?   get_target_screen (  options.target_id  )   :   false   ,
                   current     =   current_screen      ;


                //  Execute the transition only if the target screen is valid and different from the current one.
            if  (  target   !==   false   &&   target[0]   !==   current[0]  )  {


                //  Update the global reference to the new current screen.
                current_screen      =   target      ;

                //  If chained animations are specified, store them in the queue.
                if  (  typeof options.chain_animation_options   ===   'object'  )  {

                    animation_queue     =   options.chain_animation_options     ;

                }

                //  Derive specific animation commands from a general command if more specific ones aren't provided.
                //  If even the general command is undefined, defaults will be applied later.
                options.exit_animation_command      =   (  typeof options.exit_animation_command   ===   'undefined'  )   ?   options.animation_command   :   options.exit_animation_command      ;
                options.enter_animation_command     =   (  typeof options.enter_animation_command   ===   'undefined'  )   ?   options.animation_command   :   options.enter_animation_command     ;

                options.exit_animation_time         =   (  typeof options.exit_animation_time   ===   'undefined'  )   ?   options.animation_time      :   options.exit_animation_time         ;
                options.enter_animation_time        =   (  typeof options.enter_animation_time   ===   'undefined'  )   ?   options.animation_time      :   options.enter_animation_time        ;

                options.vertical_distance           =   (  typeof options.vertical_distance   ===   'undefined'  )   ?   options.distance            :   options.vertical_distance           ;
                options.horizontal_distance         =   (  typeof options.horizontal_distance   ===   'undefined'  )   ?   options.distance            :   options.horizontal_distance         ;

                //  If the page is not already scrolled to the top, scroll it first for a smoother transition.
                if  (  $ (  document  )  .scrollTop (  )    >    0  )  {

                    //  Animate the scroll to the top of the page.
                    $ (  'body'  )  .animate (  {  scrollTop: 0  }  ,  get_switch_time (  options.scroll_time  ,  'scroll'  )  ,  function (  )  {

                            //  Once scrolling is complete, execute the screen transition animation.
                        run_animation (
                                            current     ,
                                            target      ,
                                            options.enter_animation_command     ,
                                            options.enter_animation_time        ,
                                            options.exit_animation_command      ,
                                            options.exit_animation_time         ,
                                            options.delay       ,
                                            options.vertical_distance           ,
                                            options.horizontal_distance
                                        )   ;

                    }  )   ;

                //  If already at the top, proceed directly to the screen transition animation.
                }  else  {

                    run_animation (
                                        current     ,
                                        target      ,
                                        options.enter_animation_command     ,
                                        options.enter_animation_time        ,
                                        options.exit_animation_command      ,
                                        options.exit_animation_time         ,
                                        options.delay       ,
                                        options.vertical_distance           ,
                                        options.horizontal_distance
                                    )   ;

                }

                return  true    ;


            //  If the target is invalid or the same as the current screen, unlock navigation and return false.
            }  else  {

                lock_navigation     =   false   ;
                return  false   ;

            }


        //  If navigation is already locked, prevent a new transition and return false.
        }  else  {

            return  false   ;

        }

    }

        /*
         *   get_switch_time(time_str, type)
         *   Parses a time string and returns the animation duration in milliseconds.
         *   @param {String} time_str   The string value representing animation time.
         *   @param {String} type       Specifies the context ('enter', 'exit', or 'scroll') to fetch defaults.
         *   @return {Integer}          The animation duration in milliseconds.
         */
    var    get_switch_time     =   function (  time_str  ,  type  )  {

            //  Check if the provided time string is a valid non-negative integer.
        if  (  check_int (  time_str  )   &&   time_str    >=    0  )  {

                //  Return the integer value of the input time string.
            return  parseInt (  time_str  )   ;

            //  If input is invalid, use a default time based on the animation type.
        }  else  {

                //  Return the default time if the 'type' parameter is valid.
            if  (  type   ===   'enter'   ||   type   ===   'exit'   ||   type   ===   'scroll'  )  {

                return  get_default_time (  type  )   ;

            }  else  {

                return  false   ;

            }

        }

    }   ;


        /*
         *   store_screens(screens_to_store)
         *   Populates the 'screens' object with references to all active screens, indexed by their IDs.
         *   @param {Object} screens_to_store   A jQuery selection of screen elements.
         */
    var    store_screens       =   function (  screens_to_store  )  {

        screens     =   new Object (  )   ;

            //  Iterate through each selected screen element.
        $ (  screens_to_store  )  .each (  function (  )  {

                //  If the screen has a valid ID, store a reference to it.
            if  (  typeof $ (  this  )  .attr (  'id'  )   !==   'undefined'  )  {

                screens [  $ (  this  )  .attr (  'id'  )  ]     =   this    ;

            }

        }  )   ;

    }   ;


        /*
         *   get_target_screen(id)
         *   Retrieves a jQuery reference to a screen element given its ID.
         *   @param {String} id   The ID of the target screen.
         *   @return {Object}     A jQuery object for the target screen, or false if not found.
         */
    var    get_target_screen       =   function (  id  )  {

            //  Return the screen if the ID is valid and exists in the 'screens' collection, otherwise return false.
        if  (  typeof id   !==   'undefined'   &&   id   in   screens  )  {

            return  $ (  screens[id]  )   ;

        }  else  {

            return  false   ;

        }

    }   ;


        /*
         *   run_animation(current, target, enter_str, enter_time_str, exit_str, exit_time_str, delay, vertical_buffer, horizontal_buffer)
         *   Coordinates the animation of both the current and target screens based on specified commands.
         *   @param {Object} current              The jQuery object for the current screen.
         *   @param {Object} target               The jQuery object for the target screen.
         *   @param {String} enter_str            The animation command string for the entering screen.
         *   @param {String} enter_time_str       The duration string for the enter animation.
         *   @param {String} exit_str             The animation command string for the exiting screen.
         *   @param {String} exit_time_str        The duration string for the exit animation.
         *   @param {String} delay                A boolean-like string indicating whether to delay the enter animation.
         *   @param {String} vertical_buffer      The vertical distance buffer for animations.
         *   @param {String} horizontal_buffer    The horizontal distance buffer for animations.
         */
    var    run_animation       =   function (  current  ,  target  ,  enter_str  ,  enter_time_str  ,  exit_str  ,  exit_time_str  ,  delay  ,  vertical_buffer  ,  horizontal_buffer  )  {

            //  Validate animation commands or use default commands if invalid.
        enter_str   =   check_animation_command (  enter_str  )   ?   enter_str   :   get_default_animation (  'enter'  )   ;
        exit_str    =   check_animation_command (  exit_str  )    ?   exit_str    :   get_default_animation (  'exit'  )    ;

        var    enter_fade      =   false   ,
               exit_fade       =   false   ;

            //  If the enter command includes 'fade', extract it and set the fade flag.
        if  (  enter_str.substring (  0  ,  4  )   ===   'fade'  )  {

            enter_fade      =   true    ;
            enter_str       =   enter_str.substring (  4  )   ;

        }

            //  If the exit command includes 'fade', extract it and set the fade flag.
        if  (  exit_str.substring (  0  ,  4  )   ===   'fade'  )  {

            exit_fade       =   true    ;
            exit_str        =   exit_str.substring (  4  )   ;

        }

            //  Calculate the starting and ending anchor points for the animation.
        var    movement        =   get_movement (
                                                current.outerHeight (  )    ,
                                                target.outerHeight (  )     ,
                                                current.outerWidth (  )     ,
                                                target.outerHeight (  )     ,
                                                enter_str    ,
                                                exit_str     ,
                                                vertical_buffer      ,
                                                horizontal_buffer
                                            )   ;

            //  Determine the CSS properties for the target and current screens during animation.
        var    target_css      =   get_target_css (  movement.enter.x  ,  movement.enter.y  ,  enter_fade  )    ,
               current_css     =   get_current_css (  movement.exit.x  ,  movement.exit.y  ,  exit_fade  )   ;

            //  Normalize the 'delay' parameter to a boolean type, using default if invalid.
        if  (  typeof delay   !==   'boolean'  )  {

            delay   =   (  typeof delay   !==   'string'   ||   (  delay.toLowerCase (  )   !==   'true'   &&   delay.toLowerCase (  )   !==   'false'  )  )   ?   get_default_delay (  )   :   (  delay.toLowerCase (  )   ===   'true'  )   ;

        }

            //  Execute animations: if 'delay' is true, target anim starts after current anim; otherwise, they run concurrently.
        if  (  delay  )  {

            animate_current (
                                current     ,
                                current_css     ,
                                exit_time_str   ,
                                true    ,
                                target      ,
                                target_css      ,
                                enter_time_str
                            )   ;

        }  else  {

            animate_current (  current  ,  current_css  ,  exit_time_str  ,  false  )   ;
            animate_target (  target  ,  target_css  ,  enter_time_str  )   ;

        }

    }   ;


        /*
         *   animate_current(current, current_css, exit_time_str, delay, target, target_css, enter_time_str)
         *   Manages the animation sequence for the exiting screen.
         *   @param {Object} current              The jQuery object for the current (exiting) screen.
         *   @param {Object} current_css          CSS properties for the current screen's animation.
         *   @param {String} exit_time_str        Duration string for the exit animation.
         *   @param {Boolean} delay               Flag indicating if the target animation should be delayed.
         *   @param {Object} target               (Optional) The jQuery object for the target (entering) screen, if delayed.
         *   @param {Object} target_css           (Optional) CSS properties for the target screen's animation, if delayed.
         *   @param {String} enter_time_str       (Optional) Duration string for the enter animation, if delayed.
         */
    var    animate_current     =   function (  current  ,  current_css  ,  exit_time_str  ,  delay  ,  target  ,  target_css  ,  enter_time_str  )  {

            //  Apply initial CSS, then animate the current screen to its final exit state.
        current.css (  current_css.pre_css  )  .animate (  current_css.animate_css  ,  get_switch_time (  exit_time_str  ,  'exit'  )  ,  function (  )  {

                //  Apply post-animation CSS changes (e.g., hiding the element).
            current.css (  current_css.post_css  )   ;

                //  If a delay was specified, trigger the target screen's animation now.
            if  (  delay   ===   true  )  {

                animate_target (  target  ,  target_css  ,  enter_time_str  )   ;

            }

        }  )   ;

    }   ;


        /*
         *   animate_target(target, target_css, enter_time_str)
         *   Handles the animation sequence for the entering screen.
         *   @param {Object} target               The jQuery object for the target (entering) screen.
         *   @param {Object} target_css           CSS properties for the target screen's animation.
         *   @param {String} enter_time_str       Duration string for the enter animation.
         */
    var    animate_target      =   function (  target  ,  target_css  ,  enter_time_str  )  {

            //  Apply initial CSS, then animate the target screen to its visible, active state.
        target.css (  target_css.pre_css  )  .animate (  target_css.animate_css  ,  get_switch_time (  enter_time_str  ,  'enter'  )  ,  function (  )  {

                //  Apply post-animation CSS changes (e.g., ensuring visibility and position).
            target.css (  target_css.post_css  )   ;
                //  Unlock navigation, allowing further screen transitions.
            lock_navigation     =   false   ;

                //  Check if there's a chained animation waiting in the queue.
            if  (  animation_queue   !==   false  )  {

                    //  Retrieve and clear the queued animation object.
                var    chain_object    =   animation_queue     ;
                animation_queue     =   false   ;
                    //  Initiate the next animation in the chain.
                switch_screens (  chain_object  )   ;

            }

        }  )   ;

    }   ;


        /*
         *   get_movement(current_height, target_height, current_width, target_width, enter_str, exit_str, vertical_buffer, horizontal_buffer)
         *   Calculates the x and y movement values for both entering and exiting screens.
         *   @param {Integer} current_height       Height of the current screen.
         *   @param {Integer} target_height        Height of the target screen.
         *   @param {Integer} current_width        Width of the current screen.
         *   @param {Integer} target_width         Width of the target screen.
         *   @param {String} enter_str             Animation command for the entering screen.
         *   @param {String} exit_str              Animation command for the exiting screen.
         *   @param {Integer} vertical_buffer      User-defined vertical buffer distance.
         *   @param {Integer} horizontal_buffer    User-defined horizontal buffer distance.
         *   @return {Object}                     An object containing x and y movement for both enter and exit.
         */
    var    get_movement        =   function (  current_height  ,  target_height  ,  current_width  ,  target_width  ,  enter_str  ,  exit_str  ,  vertical_buffer  ,  horizontal_buffer  )  {

        vertical_buffer     =   check_int (  vertical_buffer  )   ?   parseInt (  vertical_buffer  )   :   get_default_distance_buffer (  'x'  )   ;
        horizontal_buffer   =   check_int (  horizontal_buffer  )   ?   parseInt (  horizontal_buffer  )   :   get_default_distance_buffer (  'y'  )   ;

            //  If the screen is entering from any left-side direction, the target screen's width is relevant for calculations.
        if  (  enter_str   ===   'topleft'   ||   enter_str   ===   'left'   ||   enter_str   ===   'bottomleft'  )  {
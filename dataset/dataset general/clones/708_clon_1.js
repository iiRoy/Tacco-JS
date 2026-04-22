var roguestar_preferences =
{
    /* This object holds various configuration settings
     * for the Rogue Star application. */
    animation_thread_interval   :   100, /* Interval in milliseconds for the animation loop. */

    magic_colors                :   [   '999933',   /* A list of hexadecimal color codes */
                                        '339999',   /* used for "magic" themed elements. */
                                        'CC44CC'    ],

    molten_colors               :   [   '993333',   /* Colors for molten elements. */
                                        'FF0000',
                                        '993333',
                                        'FF8800'    ],

    water_colors                :   [   '0055FF',   /* Gradient of blue colors for water. */
                                        '1155FF',
                                        '2255FF',
                                        '3355FF',
                                        '4455FF',
                                        '5555FF',
                                        '4455FF',
                                        '3355FF',
                                        '2255FF',
                                        '1155FF'    ]
};

// Ensure the DOM is fully loaded before executing any JavaScript.
$('document').ready(
    function()
    {
        // Indicate to the server that JavaScript is enabled in the client.
        $.cookie( 'javascript', 'enabled',
            {
                expires : 1,    /* Cookie expires in 1 day. */
                path    : '/play'
            }
        );


        // Prevent default drag behavior for images, enhancing UX.
        $("img").mousedown(
            function()
            {
                return false; /* Suppress image dragging. */
            }
        );


        // Handle changes in movement mode selection.
        // Some actions are restricted to cardinal directions only.
        $("input[name=mode]").change(
            function()
            {
                // Disable diagonal movement buttons if a 'four-directions' mode is selected.
                $(".diagonal-direction-button").prop(
                    "disabled",
                    $(".four-directions:checked").size() > 0
                );
            }
        );
        ; // An extra semicolon, perhaps for historical reasons or style.


        // Initialize various UI components provided by jQuery UI.
        $('.roguestar-accordion').accordion(
            {
                heightStyle :   "content",      // Adjust height based on content.
                collapsible :   true            // Allow all sections to be collapsed.
            }
        );

        $('.roguestar-tabs').tabs(); // Initialize tabbed interface.

        // Apply tooltips to a wide range of interactive elements.
        $("label, button, input, a, div").tooltip(
            {
                position    :   {
                                    my          : "right center",       // Position tooltip relative to the target.
                                    at          : "left-2 center",      // Offset from the target.
                                    collision   : "flipfit"             // Adjust position to stay within viewport.
                                },
                hide        :   0.25,               // Hide animation duration in seconds.
                tooltipClass:   "tooltip-box"       // Custom CSS class for tooltip styling.
            }
        );


        // Manage form submission buttons.
        // Buttons that submit automatically after a short delay.
        $('.autosubmit').hide(); // Hide immediate autosubmit elements initially.

        // Buttons that submit after a pause, potentially for an animation.
        $('.autosubmit-after-pause').hide(); // Hide delayed autosubmit elements.

        // Schedule immediate autosubmit.
        setTimeout(
            function()
            {
                $('.autosubmit').submit(); // Trigger form submission.
            },
            100 // Delay of 100 milliseconds.
        );

        // Schedule delayed autosubmit based on a dynamic calculation.
        setTimeout(
            function()
            {
                $('.autosubmit-after-pause').submit(); // Trigger form submission.
            },
            calculateDelayTime() // Dynamic delay time.
        );

        // Start the continuous animation thread.
        runAnimationThread();
    }
);


/*
 * Calculates a delay time based on the presence of specific UI elements.
 * @returns {number} The calculated delay in milliseconds.
 */
function calculateDelayTime()
{
    // If a 'warpin' element is present, return a longer delay.
    if( $('.warpin').length )
    {
        return 1500; // 1.5 seconds delay.
    }

    // Otherwise, return a default shorter delay.
    return 500; // 0.5 seconds delay.
}


/*
 * Animates a CSS property of elements by applying a color gradient.
 * @param {string} css_class - The CSS class selector for the elements to animate.
 * @param {string} css_property - The CSS property to animate (e.g., 'color', 'background-color').
 * @param {Array<string>} color_gradient - An array of hex color strings forming the gradient.
 * @param {Date} date - The current Date object, used to determine the exact color in the gradient.
 */
function animateViaCSS( css_class, css_property, color_gradient, date )
{
    // Calculate a unique integer 'n' based on current time (seconds, minutes, hours).
    var n = date.getSeconds() + date.getMinutes()*60 + date.getHours()*24;

    // Determine the two primary colors from the gradient based on 'n'.
    var color_1 = color_gradient[n % color_gradient.length];
    var color_2 = color_gradient[(n + 1) % color_gradient.length];

    // Apply the interpolated color to the specified CSS property.
    $(css_class).css(
        css_property,
        $.xcolor.gradientlevel(color_1, color_2, date.getMilliseconds(), 1000)
    );
}


/*
 * Executes the main animation thread for the application.
 * This function continuously updates animated elements based on time.
 */
function runAnimationThread()
{
    var date = new Date(); // Get the current date and time.

    // Animate elements with class '.a' using 'magic_colors'.
    animateViaCSS( '.a', 'color', roguestar_preferences.magic_colors, date );

    // Animate elements with class '.w' using 'water_colors'.
    animateViaCSS( '.w', 'color', roguestar_preferences.water_colors, date );

    // Animate elements with class '.m' using 'molten_colors'.
    animateViaCSS( '.m', 'color', roguestar_preferences.molten_colors, date );

    // Schedule the next execution of this animation thread.
    setTimeout(
        runAnimationThread,
        roguestar_preferences.animation_thread_interval // Use the configured interval.
    );
}
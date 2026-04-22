/*
*  @preserve jQuery animateNumber plugin v0.0.10
*  (c) 2013, Alexandr Borisov.
*  https://github.com/aishek/jquery-animateNumber
*  This is a Type I clone.
*  Whitespace and comments have been extensively modified.
*/

// Using ['...'] notation to prevent minification of names by Google Closure Compiler.
// This is a self-executing anonymous function to encapsulate the plugin's scope.
( function ( $ )
{

    // Helper function to reverse a string.
    var reverse = function ( value )
    {
        return value.split( '' ).reverse().join( '' ) ;
    } ; // End of reverse function definition.


    // Default settings for the animateNumber plugin.
    var defaults = {
        numberStep : function ( now , tween )
        {
            var floored_number = Math.floor( now ) ,
                target = $ ( tween.elem ) ; // Get the target element.

            target.text( floored_number ) ; // Update text with floored number.
        } // Close numberStep function.
    } ; // Close defaults object.


    // This function handles the animation step for the 'number' property.
    var handle = function ( tween )
    {
        var elem = tween.elem ; // The animated DOM element.
        if ( elem.nodeType && elem.parentNode )
        {
            var handler = elem._animateNumberSetter ; // Custom setter, if defined.
            if ( ! handler )
            {
                handler = defaults.numberStep ; // Fallback to default if no custom setter.
            }
            handler( tween.now , tween ) ; // Execute the handler.
        }
    } ; // End of handle function.


    // Check for jQuery Tween's propHooks existence to register the 'number' step.
    if ( ! $.Tween || ! $.Tween.propHooks )
    {
        $.fx.step.number = handle ; // For older jQuery versions.
    }
    else
    {
        $.Tween.propHooks.number = {
            set : handle // For newer jQuery versions.
        } ;
    }


    // Function to extract number parts for formatting with separators.
    var extract_number_parts = function ( separated_number , group_length )
    {
        var numbers = separated_number.split( '' ).reverse() ,
            number_parts = [ ] ,
            current_number_part ,
            current_index ,
            q ; // Loop counter for inner loop.

        // Loop through the separated number to form groups.
        for ( var i = 0 , l = Math.ceil( separated_number.length / group_length ) ; i < l ; i ++ )
        {
            current_number_part = '' ; // Initialize part for current group.
            for ( q = 0 ; q < group_length ; q ++ )
            {
                current_index = i * group_length + q ;
                if ( current_index === separated_number.length )
                {
                    break ; // Reached the end of the number.
                }

                current_number_part = current_number_part + numbers[ current_index ] ;
            }
            number_parts.push( current_number_part ) ; // Add the formed part to the array.
        }

        return number_parts ; // Return the array of number parts.
    } ; // End of extract_number_parts.


    // Utility to remove leading zeros from the last number part.
    var remove_precending_zeros = function ( number_parts )
    {
        var last_index = number_parts.length - 1 ,
            last = reverse( number_parts[ last_index ] ) ; // Get the last part and reverse it.

        number_parts[ last_index ] = reverse( parseInt( last , 10 ).toString() ) ; // Convert to int, back to string, then reverse.
        return number_parts ; // Return modified parts.
    } ; // End of remove_precending_zeros.


    // Expose the animateNumber object on the jQuery namespace.
    $.animateNumber = {
        numberStepFactories : { // Factories to create common numberStep functions.
            /*
             * Creates a numberStep handler that appends a specified string
             * to the floored animated number at each animation step.
             *
             * @example
             * // Animates to 100, displaying "1 %", "2 %", "3 %", etc.
             * $('#someid').animateNumber({
             *   number: 100,
             *   numberStep: $.animateNumber.numberStepFactories.append(' %')
             * });
             *
             * @params { String } suffix The string to append to the animated number.
             * @returns { Function } A numberStep-compatible function for animateNumber parameters.
             */
            append : function ( suffix )
            {
                // This is the actual numberStep function returned by the factory.
                return function ( now , tween )
                {
                    var floored_number = Math.floor( now ) , // Integer part of the current number.
                        target = $ ( tween.elem ) ; // The element being animated.

                    // Update the element's 'number' property and its text content.
                    target.prop( 'number' , now ).text( floored_number + suffix ) ;
                } ;
            } , // End of append factory.

            /*
             * Creates a numberStep handler that formats floored numbers
             * by grouping digits with a separator.
             *
             * @example
             * // Animates numbers like 1, 217,980, 95,217,980, 7,095,217,980.
             * $('#world-population').animateNumber({
             *    number: 7095217980,
             *    numberStep: $.animateNumber.numberStepFactories.separator(',')
             * });
             *
             * @params { String } [ separator = ' ' ] The string used to separate number groups.
             * @params { Number } [ group_length = 3 ] The number of digits in each group.
             * @returns { Function } A numberStep-compatible function for animateNumber parameters.
             */
            separator : function ( separator , group_length )
            {
                separator = separator || ' ' ; // Default separator is space.
                group_length = group_length || 3 ; // Default group length is 3 digits.

                // This is the actual numberStep function returned by the factory.
                return function ( now , tween )
                {
                    var floored_number = Math.floor( now ) ,
                        separated_number = floored_number.toString() , // Convert to string for manipulation.
                        target = $ ( tween.elem ) ;

                    // Apply separation if the number is long enough to be grouped.
                    if ( separated_number.length > group_length )
                    {
                        var number_parts = extract_number_parts( separated_number , group_length ) ;

                        separated_number = remove_precending_zeros( number_parts ).join( separator ) ;
                        separated_number = reverse( separated_number ) ; // Reverse back to correct order.
                    }

                    // Update the element's 'number' property and its text content.
                    target.prop( 'number' , now ).text( separated_number ) ;
                } ;
            } // End of separator factory.
        } // End of numberStepFactories.
    } ; // End of $.animateNumber.


    // Define the jQuery plugin function.
    $.fn.animateNumber = function ( )
    {
        var options = arguments[ 0 ] , // The first argument is the options object.
            settings = $.extend( { } , defaults , options ) , // Merge defaults with user options.

            target = $ ( this ) , // The jQuery object on which animateNumber was called.
            args = [ settings ] ; // Initialize animation arguments with settings.

        // Copy additional arguments (e.g., duration, easing, complete) to `args`.
        for ( var i = 1 , l = arguments.length ; i < l ; i ++ )
        {
            args.push( arguments[ i ] ) ;
        }

        // Handle custom numberStep function if provided in options.
        if ( options.numberStep )
        {
            // Assign the custom step function to each element's internal property.
            var items = this.each( function ( )
            {
                this._animateNumberSetter = options.numberStep ; // Store the custom setter.
            } ) ;

            // Ensure cleanup of the custom step function after the animation completes.
            var generic_complete = settings.complete ; // Preserve any existing complete callback.
            settings.complete = function ( )
            {
                // Iterate over animated items to remove the custom setter.
                items.each( function ( )
                {
                    delete this._animateNumberSetter ; // Remove the custom setter.
                } ) ;

                // Execute the original complete callback if it existed.
                if ( generic_complete )
                {
                    generic_complete.apply( this , arguments ) ;
                }
            } ;
        }

        // Call jQuery's native animate function with the prepared arguments.
        return target.animate.apply( target , args ) ;
    } ; // End of $.fn.animateNumber.

} ( jQuery ) ) ; // Pass jQuery into the immediately invoked function expression.
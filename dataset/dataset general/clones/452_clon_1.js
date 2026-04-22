/* This is a heavily modified version of the original AngularJS Round Progress Directive.
 * The core functionality remains identical, but its presentation has been altered.
 *
 * Original Copyright (c) 2013 Stephane Begaudeau.
 * Original License: MIT.
 *
 * This file is a Type I code clone, meaning:
 * - All identifiers, variable names, function names, operators, and expressions are strictly preserved.
 * - Only whitespace (spaces, tabs, newlines) and comments have been changed.
 * - The goal is to make the code look visually distinct while maintaining exact logical equivalence.
 *
 * Please do not edit any character that is not whitespace or part of a comment block.
 *
 */
angular
    .module(
        'angular.directives-round-progress' ,
        [ ]
    )
    .directive(
        'angRoundProgress' ,
        [
            function ( )
            {
                // This is the primary compilation function for the directive.
                // It handles the initial setup of the canvas element.
                var compilationFunction = function
                (
                    templateElement ,
                    templateAttributes ,
                    transclude
                )
                {
                    // Ensure that we are dealing with a single element.
                    if ( templateElement.length === 1 )
                    {
                        var node =
                            templateElement[ 0 ] ; // The original DOM node where the directive was placed.

                        // Retrieve width and height attributes, or use defaults.
                        var width =
                            node.getAttribute( 'data-round-progress-width' )
                            ||
                            '400'
                            ;

                        var height =
                            node.getAttribute( 'data-round-progress-height' )
                            ||
                            '400'
                            ;

                        // Create a new canvas element dynamically.
                        var canvas =
                            document.createElement( 'canvas' )
                            ;

                        // Set attributes for the newly created canvas.
                        canvas.setAttribute( 'width' , width )
                        ;
                        canvas.setAttribute( 'height' , height )
                        ;
                        canvas.setAttribute( 'data-round-progress-model' ,
                            node.getAttribute( 'data-round-progress-model' )
                        )
                        ;

                        // Replace the original directive element with the canvas.
                        node.parentNode.replaceChild( canvas , node )
                        ;

                        // Retrieve styling attributes for the circles.
                        var outerCircleWidth =
                            node.getAttribute( 'data-round-progress-outer-circle-width' )
                            ||
                            '20'
                            ;

                        var innerCircleWidth =
                            node.getAttribute( 'data-round-progress-inner-circle-width' )
                            ||
                            '5'
                            ;

                        var outerCircleBackgroundColor =
                            node.getAttribute( 'data-round-progress-outer-circle-background-color' )
                            ||
                            '#505769'
                            ;

                        var outerCircleForegroundColor =
                            node.getAttribute( 'data-round-progress-outer-circle-foreground-color' )
                            ||
                            '#12eeb9'
                            ;

                        var innerCircleColor =
                            node.getAttribute( 'data-round-progress-inner-circle-color' )
                            ||
                            '#505769'
                            ;

                        var labelColor =
                            node.getAttribute( 'data-round-progress-label-color' )
                            ||
                            '#12eeb9'
                            ;

                        var outerCircleRadius =
                            node.getAttribute( 'data-round-progress-outer-circle-radius' )
                            ||
                            '100'
                            ;

                        var innerCircleRadius =
                            node.getAttribute( 'data-round-progress-inner-circle-radius' )
                            ||
                            '70'
                            ;

                        // Font for the central label.
                        var labelFont =
                            node.getAttribute( 'data-round-progress-label-font' )
                            ||
                            '50pt Calibri'
                            ;


                        // This object defines the linking functions for the directive.
                        return {
                            // The pre-link function.
                            pre : function preLink
                            (
                                scope ,
                                instanceElement ,
                                instanceAttributes ,
                                controller
                            )
                            {
                                // Get the expression to watch from the canvas attribute.
                                var expression =
                                    canvas.getAttribute( 'data-round-progress-model' )
                                    ;

                                // Set up a watch on the model expression.
                                // This function will be called whenever the model changes.
                                scope.$watch(
                                    expression ,
                                    function ( newValue , oldValue )
                                    {
                                        // Retrieve the 2D rendering context for the canvas.
                                        var ctx = canvas.getContext( '2d' )
                                        ;

                                        // Clear the entire canvas before redrawing.
                                        ctx.clearRect( 0 , 0 , width , height )
                                        ;

                                        // Calculate the center coordinates for drawing.
                                        var x = width / 2
                                        ;
                                        var y = height / 2
                                        ;

                                        // --- Drawing the "background" circle ---
                                        ctx.beginPath( )
                                        ;
                                        // Draw the full circle.
                                        ctx.arc(
                                            x ,
                                            y ,
                                            parseInt( outerCircleRadius ) ,
                                            0 ,
                                            Math.PI * 2 ,
                                            false
                                        )
                                        ;
                                        // Set the line width for the outer circle.
                                        ctx.lineWidth = parseInt( outerCircleWidth )
                                        ;
                                        // Set the color for the background outer circle.
                                        ctx.strokeStyle = outerCircleBackgroundColor
                                        ;
                                        // Render the path.
                                        ctx.stroke( )
                                        ;

                                        // --- Drawing the inner circle ---
                                        ctx.beginPath( )
                                        ;
                                        // Draw the inner full circle.
                                        ctx.arc(
                                            x ,
                                            y ,
                                            parseInt( innerCircleRadius ) ,
                                            0 ,
                                            Math.PI * 2 ,
                                            false
                                        )
                                        ;
                                        // Set the line width for the inner circle.
                                        ctx.lineWidth = parseInt( innerCircleWidth )
                                        ;
                                        // Set the color for the inner circle.
                                        ctx.strokeStyle = innerCircleColor
                                        ;
                                        // Render the path.
                                        ctx.stroke( )
                                        ;

                                        // --- Drawing the central number/label ---
                                        ctx.font = labelFont
                                        ;
                                        ctx.textAlign = 'center'
                                        ;
                                        ctx.textBaseline = 'middle'
                                        ;
                                        ctx.fillStyle = labelColor
                                        ;
                                        // Fill the text with the label from the model.
                                        ctx.fillText( newValue.label , x , y )
                                        ;

                                        // --- Drawing the "foreground" progress circle ---
                                        // Starting angle (top center).
                                        var startAngle = - ( Math.PI / 2 )
                                        ;
                                        // Ending angle based on percentage.
                                        var endAngle =
                                            ( ( Math.PI * 2 ) * newValue.percentage )
                                            -
                                            ( Math.PI / 2 )
                                            ;
                                        // Drawing clockwise.
                                        var anticlockwise = false
                                        ;

                                        ctx.beginPath( )
                                        ;
                                        // Draw the arc representing the progress.
                                        ctx.arc(
                                            x ,
                                            y ,
                                            parseInt( outerCircleRadius ) ,
                                            startAngle ,
                                            endAngle ,
                                            anticlockwise
                                        )
                                        ;
                                        // Use the same width as the background outer circle.
                                        ctx.lineWidth = parseInt( outerCircleWidth )
                                        ;
                                        // Set the foreground color for the progress arc.
                                        ctx.strokeStyle = outerCircleForegroundColor
                                        ;
                                        // Render the progress arc.
                                        ctx.stroke( )
                                        ;
                                    } ,
                                    true // Deep watch for object changes in newValue.
                                )
                                ;
                            } ,
                            // The post-link function (currently empty but required).
                            post : function postLink
                            (
                                scope ,
                                instanceElement ,
                                instanceAttributes ,
                                controller
                            )
                            {
                                // No operations needed in the post-link phase for this directive.
                            }
                        } ; // End of return object for linking functions.
                    }
                } ; // End of compilationFunction definition.

                // Define the directive's properties.
                var roundProgress = {
                    compile : compilationFunction , // Use the compilation function defined above.
                    replace : true                 // Replace the original element with the template.
                } ;

                // Return the directive definition object.
                return roundProgress ;
            }
        ]
    ) ; // End of angular.module().directive() call.
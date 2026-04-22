/*
 *  Copyright (c) 2014, Loïc Hoguin <essen@ninenines.eu>
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 *  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 *  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 *  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 *  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 *  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 *  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 *  This file contains a D3.js line chart implementation.
 */


$( document ).ready( function () {

    // Define the line_chart function within shaman.d3 namespace
    shaman.d3.line_chart = function ( selector, opts ) {

        // Initialize options if not provided or incomplete
        if ( opts == null ) {
            opts = {};
        }

        // Set default width if not specified
        if ( opts.width == null ) {
            opts.width = 240;
        }

        // Set default height if not specified
        if ( opts.height == null ) {
            opts.height = 120;
        }

        // Set default margins if not specified (top, right, bottom, left)
        if ( opts.margin == null ) {
            opts.margin = [ 20, 20, 30, 50 ];
        }


        // Create the SVG element and append a group for transformations
        var svg = d3.select( selector )
            .attr( "width", opts.width + opts.margin[ 1 ] + opts.margin[ 3 ] )
            .attr( "height", opts.height + opts.margin[ 0 ] + opts.margin[ 2 ] )
            .append( "g" )
            .attr( "transform", "translate(" + opts.margin[ 3 ] + "," + opts.margin[ 0 ] + ")" );


        // Define X and Y scales
        var x = d3.scale.linear();
        var y = d3.scale.linear().range( [ opts.height, 0 ] );

        // Define the Y-axis
        var yAxis = d3.svg.axis().scale( y ).orient( "left" );


        // Append a group for the Y-axis
        var gY = svg.append( "g" )
            .attr( "class", "y axis" );


        // Define the line generator
        var line = d3.svg.line()
            .x( function ( d, i ) {
                return x( i );
            } )
            .y( function ( d ) {
                return y( d );
            } );


        // Append the path element for the line
        var path = svg.append( "path" )
            .attr( "class", "line" );


        // Public method to update the chart with new data
        this.update = function ( data ) {

            // Update X-axis range and domain
            x.range( [ 0, data.length * opts.width / 60 ] )
                .domain( d3.extent( data, function ( d, i ) {
                    return i;
                } ) );

            // Update Y-axis domain
            y.domain( d3.extent( data, function ( d ) {
                return d;
            } ) );

            // Update Y-axis tick values to show min and max
            yAxis.tickValues( [ Math.min.apply( null, data ), Math.max.apply( null, data ) ] );

            // Redraw the Y-axis
            gY.call( yAxis );

            // Bind new data to the path and redraw the line
            path.datum( data ).attr( "d", line );

        }; /* End of update function */


        // Public method to terminate and clean up the chart
        this.terminate = function () {

            // Remove all elements within the chart selector
            d3.selectAll( selector + " *" ).remove();

        }; /* End of terminate function */

    }; /* End of shaman.d3.line_chart definition */

} ); /* End of document.ready */
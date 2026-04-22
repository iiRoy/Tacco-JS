// This file contains visualization functions for displaying commit statistics.
// It is part of the 'vis' module.

"use strict" ;

// Wrap the entire module in an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global scope.
// It takes 'vis' as an argument, or initializes it if it doesn't exist.
( function ( vis ) {

   // Function to handle mouse-enter event on an arc (commit representation).
   // This function makes the selected arc more prominent and displays a tooltip.
   vis.meArc = function ( d ) {

      // Ensure the statistics layer is on top for interaction.
      vis.layers.stat.toFront ( ) ;

      // If the commit group 'd._g' is not defined, exit.
      if ( ! d._g ) { return ; }

      // Select all 'path.bar' elements within the commit group 'd._g'.
      d._g.selectAll ( "path.bar" )
         .style ( {
            // Increase fill opacity for visual emphasis.
            "fill-opacity" : .6 ,
            // Set stroke width.
            "stroke-width" : 1 ,
            // Define stroke color using a helper function.
            "stroke" : function ( ) { return toRgba ( "#000000" , 1 ) ; }
         } ) ;

      // Get the DOM node associated with the current commit group.
      var self = d._g.node ( ) ;

      // Animate the 'barDel' (deletion arc) if it exists.
      self.barDel && self.barDel
         .transition ( )
         .attr ( "d" , self.delArc.startAngle ( PIdiv2 + smallRad )
            .endAngle ( PIdiv2 * 3 - smallRad ) ( ) )
      ; // End of barDel animation.

      // Animate the 'barAdd' (addition arc) if it exists.
      self.barAdd && self.barAdd
         .transition ( )
         .attr ( "d" , self.addArc.startAngle ( - PIdiv2 + smallRad )
            .endAngle ( PIdiv2 - smallRad ) ( ) )
      ; // End of barAdd animation.

      // Make the deletion and addition text labels visible.
      d._g.selectAll ( "text.del, text.add" )
         .style ( "visibility" , "visible" ) ;

      // Clear any existing content in the tooltip.
      toolTip.selectAll ( "*" ).remove ( ) ;

      // Append the commit message to the tooltip.
      toolTip.append ( "div" ).attr ( "class" , "row" )
         .append ( "blockquote" )
         .text ( d.message.split ( "\n" ) [ 0 ] ) ;

      // Append user information to the tooltip.
      toolTip.append ( "div" ).attr ( "class" , "row userInfo open" ).call ( function ( div ) {
         // Create a nested div for statistics info.
         div = div.append ( "div" ).attr ( "class" , "statInfo" ) ;

         // Append the author's avatar.
         div.node ( ).appendChild ( d.author.avatar ) ;
         // Append an unordered list for additional details.
         div.append ( "ul" ).call ( function ( ul ) {
            // Display author's name or login if available.
            ( d.author.name || d.author.login ) && ul.append ( "li" ).call ( function ( li ) {
               li.append ( "h1" )
                  .text ( ( d.author.name || d.author.login ) )
               ;
               li.append ( "hr" ) ;
            } ) ;
            // Display commit date.
            ul.append ( "li" ).call ( function ( li ) {
               li.append ( "span" )
                  .attr ( "class" , "mini-icon mini-icon-time" ) ;
               li.append ( "strong" )
                  .text ( timeFormat ( d.date ) )
            } ) ;
            // Display commit SHA.
            ul.append ( "li" ).call ( function ( li ) {
               li.text ( "sha: " ) ;
               li.append ( "strong" )
                  .text ( d.sha.substr ( 0 , 10 ) ) ;
            } ) ;
            // Add a horizontal rule.
            ul.append ( "li" ).append ( "hr" ) ;
            // Display changed files statistics if files exist.
            d.files.length && ul.append ( "li" )
               .call ( function ( li ) {
                  var key ,
                     // Calculate file status statistics.
                     stat = d.files.reduce ( function ( a , b ) {
                        for ( key in TYPE_STATUS_FILE ) {
                           if ( TYPE_STATUS_FILE.hasOwnProperty ( key )
                              && b.status == TYPE_STATUS_FILE [ key ] ) {
                              a [ key ] = ( a [ key ] || 0 ) ;
                              a [ key ] ++ ;
                              break ;
                           }
                        }
                        return a ;
                     } , { } ) ;
                  li = li.append ( "ul" )
                     .attr ( "class" , "setting" ) ;
                  li = li.append ( "li" ).attr ( "class" , "field" ) ;
                  li.append ( "h1" )
                     .text ( "Changed files:" ) ;
                  // Iterate through file status types and display counts.
                  for ( key in stat ) {
                     if ( stat.hasOwnProperty ( key ) )
                        li.append ( "ul" )
                           .attr ( "class" , "group" )
                           .append ( "li" )
                           .attr ( "class" , "field" )
                           .append ( "span" )
                           .text ( key + ": " )
                           .append ( "strong" )
                           .text ( stat [ key ] ) ;
                  }
               } ) ;
            // Display changed lines statistics.
            ul.append ( "li" )
               .call ( function ( li ) {
                  li = li.append ( "ul" )
                     .attr ( "class" , "setting" ) ;
                  li = li.append ( "li" ).attr ( "class" , "field" ) ;
                  li.append ( "h1" )
                     .text ( "Changed lines:" ) ;
                  var stat = { changes : "" , additions : " + " , deletions : " - " } ;
                  // Iterate through line change types.
                  for ( var key in stat ) {
                     if ( stat.hasOwnProperty ( key ) )
                        d.stats.hasOwnProperty ( key )
                        && li.append ( "ul" )
                           .attr ( "class" , "group" )
                           .append ( "li" )
                           .attr ( "class" , "field" )
                           .append ( "span" )
                           .text ( key + ": " )
                           .append ( "strong" )
                           .style ( "color" , d3.rgb ( colors [ key ] ).darker ( .2 ) )
                           .text ( stat [ key ] + textFormat ( d.stats [ key ] ) ) ;
                  }
               } ) ;

         } ) ; // End of ul.call
      } ) ; // End of div.call

      // Show the tooltip.
      toolTip.show ( ) ;
   } ;

   // Function to handle mouse-leave event on an arc.
   // This function resets the arc's appearance and hides the tooltip.
   vis.mlArc = function ( d ) {

      // If the commit group 'd._g' is not defined, exit.
      if ( ! d._g ) { return ; }

      // Reset the style of all 'path.bar' elements.
      d._g.selectAll ( "path.bar" )
         .style ( {
            "fill-opacity" : .3 ,
            "stroke" : null
         } ) ;

      // Get the DOM node for the current commit group.
      var self = d._g.node ( ) ;
      // If no node, exit.
      if ( ! self ) { return ; }

      // Animate the 'barDel' (deletion arc) back to its original small size.
      self.barDel && self.barDel
         .transition ( )
         .duration ( 750 )
         .ease ( "elastic" )
         .attr ( "d" , self.delArc.startAngle ( Math.PI - smallRad )
            .endAngle ( Math.PI + smallRad ) ( ) )
      ; // End of barDel animation.

      // Animate the 'barAdd' (addition arc) back to its original small size.
      self.barAdd && self.barAdd
         .transition ( )
         .duration ( 750 )
         .ease ( "elastic" )
         .attr ( "d" , self.addArc.startAngle ( - smallRad )
            .endAngle ( smallRad ) ( ) )
      ; // End of barAdd animation.

      // Set visibility of deletion text based on its original state or 'hidden'.
      d._g.selectAll ( "text.del" )
         .style ( "visibility" , d.stats && d.stats.delTextVis ? d.stats.delTextVis : "hidden" ) ;

      // Set visibility of addition text based on its original state or 'hidden'.
      d._g.selectAll ( "text.add" )
         .style ( "visibility" , d.stats && d.stats.addTextVis ? d.stats.addTextVis : "hidden" ) ;

      // Hide the tooltip.
      toolTip.hide ( ) ;
   } ;

   // Function for mouse-move event on an arc, typically used for tooltip positioning.
   vis.mmArc = function ( d ) {
      // Delegate to a general mouse-move-tooltip function.
      vis.mtt ( d ) ;
   } ;

   // Function to clear the statistics layer.
   vis.clearStat = function ( ) {
      // Check if the statistics layer and its container exist.
      if ( vis.layers && vis.layers.stat ) {
         // Remove all elements from the statistics layer.
         vis.layers.stat.selectAll ( "*" ).remove ( ) ;
         // Reset the container reference.
         vis.layers.stat.cont && ( vis.layers.stat.cont = null ) ;
      }
   } ;

   // Function to redraw the commit statistics visualization.
   vis.redrawStat = function ( data , layer ) {

      // Use the provided layer or default to 'vis.layers.stat'.
      layer = layer || vis.layers.stat ;

      // Extract commit values from the data.
      var _commits = data && data.commits ? data.commits.values ( ) : null ;

      // If no commits or empty commits array, clear the statistics.
      if ( ! _commits || ! _commits.length ) {
         vis.clearStat ( ) ;
         return ;
      }

      // Determine the date bounds for the x-axis.
      var bd = d3.extent ( data.dates ) ;
      // Calculate a delta for padding the date range.
      var delta = ( bd [ 1 ] - bd [ 0 ] ) * 0.1 ;

      // Ensure delta is at least ONE_DAY if it's zero.
      delta = delta || ONE_DAY ;

      // Extend the date bounds with the calculated delta.
      bd = [ bd [ 0 ] - delta , bd [ 1 ] + delta ] ;

      // Create an x-scale for time.
      var x = d3.time.scale ( )
         .domain ( d3.extent ( bd ) )
         .range ( [ 0 , w - margin.left - margin.right ] )
         // .nice(d3.time.year) // Optional: snap to nice time intervals.
      ;

      // Calculate a sixth of the total height.
      var h6 = h / 6 ;

      // Create a y-scale for linear mapping of changes.
      var y = d3.scale.linear ( )
         .range ( [ 2 , h6 * 2 ] )
         .domain ( [ 0 , data.stats.changes || 1 ] ) ;

      // Prepare data for layered areas, including padding points at the bounds.
      var sorted = _commits.slice ( 0 ).concat ( [
         { date : bd [ 0 ] + delta / 2 , f : { d : 0 , a : 0 , m : 0 } } ,
         { date : bd [ 1 ] - delta / 2 , f : { d : 0 , a : 0 , m : 0 } }
      ] ).sort ( vis.sC ) ;

      // Define the layers for area chart visualization.
      var layers =
         [
            {
               color : colors.deletedFile ,
               values : sorted.map ( function ( d ) {
                  return { t : 1 , x : d.date , y0 : 0 , y : ( d.stats ? - d.stats.f.d : 0 ) }
               } )
            } ,
            {
               color : colors.modifiedFile ,
               values : sorted.map ( function ( d ) {
                  return { x : d.date , y0 : 0 , y : ( d.stats ? d.stats.f.m : 0 ) }
               } )
            } ,
            {
               color : colors.addedFile ,
               values : sorted.map ( function ( d ) {
                  return { x : d.date , y0 : ( d.stats ? d.stats.f.m : 0 ) , y : ( d.stats ? d.stats.f.a : 0 ) }
               } )
            }
         ]
      ; // End of layers array.

      // Custom interpolation function for Sankey-like path.
      function interpolateSankey ( points ) {
         var x0 = points [ 0 ] [ 0 ] , y0 = points [ 0 ] [ 1 ] , x1 , y1 , x2 ,
            path = [ x0 , "," , y0 ] ,
            i = 0 ,
            n = points.length ;
         while ( ++ i < n ) {
            x1 = points [ i ] [ 0 ] ;
            y1 = points [ i ] [ 1 ] ;
            x2 = ( x0 + x1 ) / 2 ;
            path.push ( "C" , x2 , "," , y0 , " " , x2 , "," , y1 , " " , x1 , "," , y1 ) ;
            x0 = x1 ;
            y0 = y1 ;
         }
         return path.join ( "" ) ;
      }

      // Create a y1-scale for the area chart, mapping file counts.
      var y1 = d3.scale.linear ( )
         .range ( [ h6 * 4.5 , h6 * 3 , h6 * 1.5 ] )
         .domain ( [ - data.stats.files , 0 , data.stats.files ] ) ,
         // Define the D3 area generator.
         area = d3.svg.area ( )
            .interpolate ( interpolateSankey /*true ? "linear" : "basis"*/ ) // Use custom interpolation.
            .x ( function ( d ) { return x ( d.x ) ; } )
            .y0 ( function ( d ) { return y1 ( d.y0 ) ; } )
            .y1 ( function ( d ) { return y1 ( d.y0 + d.y ) ; } )
      ;

      // Define the D3 x-axis generator.
      var xAxis = d3.svg.axis ( )
         .scale ( x )
      ;

      // Initialize or retrieve the main container group for the visualization.
      layer.cont = layer.cont || layer
         .append ( "g" )
         .attr ( "transform" , "translate(" + margin.left + "," + margin.top + ")" )
      ;

      // Remove any existing area paths.
      layer.cont.selectAll ( "path.areaFile" ).remove ( ) ;

      // Bind data to area paths and render them.
      layer.cont.selectAll ( "path.areaFile" )
         .data ( layers )
         .enter ( )
         .insert ( "path" , ":first-child" )
         .attr ( "class" , "areaFile" )
         .style ( "stroke" , function ( d ) { return d.color ; } )
         .style ( "stroke-opacity" , .5 )
         .style ( "fill-opacity" , .1 )
         .style ( "fill" , function ( d ) { return d.color ; } )
         .transition ( )
         .duration ( 750 )
         .attr ( "d" , function ( d ) { return area ( d.values ) ; } )
      ;

      // Initialize or retrieve the x-axis group.
      layer.cont.axis = layer.cont.axis || layer.cont.append ( "g" )
         .attr ( "class" , "x axis" )
         .attr ( "transform" , "translate(0," + h / 2 + ")" )
      ;

      // Clear any existing axis elements.
      layer.cont.axis
         .selectAll ( "*" ).remove ( ) ;

      // Render the x-axis.
      layer.cont.axis
         .call ( xAxis )
         .selectAll ( "text" )
         .attr ( "y" , 0 )
         .attr ( "x" , 9 )
         .attr ( "dy" , ".35em" )
         .attr ( "transform" , "rotate(90)" )
         .style ( "text-anchor" , "start" )
         // Apply styling to year labels.
         .style ( "fill" , function ( d ) {
            return parseInt ( this.textContent ) ? "#fff" : null ;
         } )
         .style ( "font-size" , function ( d ) {
            return parseInt ( this.textContent ) ? "12px" : null ;
         } )
         .style ( "font-weight" , function ( d ) {
            return parseInt ( this.textContent ) ? "bold" : null ;
         } )
      ;

      // Initialize or retrieve the points container group.
      layer.cont.points = layer.cont.points || layer.cont.append ( "g" )
         .attr ( "transform" , "translate(0," + h / 2 + ")" )
      ;

      // Bind commit data to 'g.com' elements.
      var cData = layer.cont.points.selectAll ( "g.com" )
         .data ( _commits , function ( d ) { return d.sha ; } ) ;
      // Enter selection: append new 'g.com' elements.
      cData.enter ( )
         .append ( "g" )
         .attr ( "class" , "com" )
         .on ( "mouseover" , vis.meArc )
         .on ( "mouseout" , vis.mlArc )
         .on ( "mousemove" , vis.mmArc )
      ;

      // Update selection: process each commit element.
      cData.each ( function ( d , g ) {
         // Store a D3 selection of the current group on the data object.
         g = d._g = d3.select ( this ) ;
         // Animate the position of the commit group.
         g.transition ( )
            .duration ( 1500 )
            .ease ( "elastic" )
            .attr ( "transform" , "translate(" + [ x ( d.date ) , 0 ] + ")" ) ;

         // Create a central circle for the commit if it doesn't exist.
         this.center = this.center || g.append ( "circle" )
            .attr ( "r" , 2 )
            .style ( "fill" , colors.center )
         ;

         // If no statistics are available, skip rendering arcs and labels.
         if ( ! d.stats ) { return ; }

         // Define the arc generator for additions.
         var add = this.addArc = d3.svg.arc ( )
            .innerRadius ( 1 )
            .outerRadius ( 1 )
            .startAngle ( - smallRad )
            .endAngle ( smallRad )
            ;
         // Define the arc generator for deletions.
         var del = this.delArc = d3.svg.arc ( )
            .innerRadius ( 1 )
            .outerRadius ( 1 )
            .startAngle ( Math.PI - smallRad )
            .endAngle ( Math.PI + smallRad )
            ;

         // Render and animate the addition bar.
         ( this.barAdd || (
            this.barAdd = g.append ( "path" )
               .attr ( "class" , "bar" )
               .style ( {
                  "fill" : colors.additions ,
                  "fill-opacity" : .3
               } )
               .attr ( "d" , add ( ) )
         ) )
            .transition ( )
            .duration ( 750 )
            .ease ( "elastic" )
            .attr ( "d" , add.outerRadius ( y ( d.stats.additions ) ) ( ) )
         ;

         // Render and animate the deletion bar.
         ( this.barDel || (
            this.barDel = g.append ( "path" )
               .attr ( "class" , "bar" )
               .style ( {
                  "fill" : colors.deletions ,
                  "fill-opacity" : .3
               } )
               .attr ( "d" , del ( ) )
         ) )
            .transition ( )
            .duration ( 750 )
            .ease ( "elastic" )
            .attr ( "d" , del.outerRadius ( y ( d.stats.deletions ) ) ( ) )
         ;

         // Helper function to size arcs based on a factor 'k'.
         function sized ( s , k ) {
            return s * ( 1 + k ) ;
         }

         // Define the arc generator for the top part of additions.
         var addTop = this.addArcTop = d3.svg.arc ( )
            .innerRadius ( sized ( y ( d.stats.additions ) , .015 ) )
            .outerRadius ( sized ( y ( d.stats.additions ) , .025 ) )
            .startAngle ( - smallRad )
            .endAngle ( smallRad )
            ;
         // Define the arc generator for the top part of deletions.
         var delTop = this.delArcTop = d3.svg.arc ( )
            .innerRadius ( sized ( y ( d.stats.deletions ) , .015 ) )
            .outerRadius ( sized ( y ( d.stats.deletions ) , .025 ) )
            .startAngle ( Math.PI - smallRad )
            .endAngle ( Math.PI + smallRad )
            ;

         // Render the top part of the addition bar.
         ( this.barAddTop || (
            this.barAddTop = g.append ( "path" )
               .style ( "fill" , toRgba ( colors.additions ) )
         ) )
            .attr ( "d" , addTop ( ) )
         ;

         // Render the top part of the deletion bar.
         ( this.barDelTop || (
            this.barDelTop = g.append ( "path" )
               .style ( "fill" , toRgba ( colors.deletions ) )
         ) )
            .attr ( "d" , delTop ( ) )
         ;

         // Render addition label if additions exist.
         if ( d.stats.additions ) {
            // Determine visibility based on size.
            d.stats.addTextVis = sized ( y ( d.stats.additions ) , .029 ) > h6 / 2 ? "visible" : "hidden" ;
            ( this.labelAdd || (
               this.labelAdd = g.append ( "text" )
                  .attr ( "class" , "add" )
                  .attr ( "dy" , "-.31em" )
                  .attr ( "text-anchor" , "middle" )
                  .style ( "fill" , colors.additions )
                  .text ( " + " + textFormat ( d.stats.additions ) )
            ) )
               .attr ( "transform" , "translate(" + [ 0 , - sized ( y ( d.stats.additions ) , .027 ) ] + ")" )
               .attr ( "visibility" , d.stats.addTextVis )
            ;
         }

         // Render deletion label if deletions exist.
         if ( d.stats.deletions ) {
            // Determine visibility based on size.
            d.stats.delTextVis = sized ( y ( d.stats.deletions ) , .029 ) > h6 / 2 ? "visible" : "hidden" ;
            ( this.labelDel || (
               this.labelDel = g.append ( "text" )
                  .attr ( "class" , "del" )
                  .attr ( "dy" , ".93em" )
                  .attr ( "text-anchor" , "middle" )
                  .style ( "fill" , colors.deletions )
                  .text ( " - " + textFormat ( d.stats.deletions ) )
            ) )
               .attr ( "transform" , "translate(" + [ 0 , sized ( y ( d.stats.deletions ) , .027 ) ] + ")" )
               // .rotate(180) // This comment hints at a rotation that is not applied.
               .attr ( "visibility" , d.stats.delTextVis )
            ;
         }
      } ) ; // End of cData.each

      // Sort commit data based on changes for rendering order.
      cData.sort ( function ( a , b ) {
         return a.stats && b.stats ? d3.ascending ( b.stats.changes , a.stats.changes ) : 0 ;
      } ) ;

      // Exit selection: remove commits that are no longer in the data.
      cData.exit ( ).remove ( ) ;
   } ; // End of vis.redrawStat
} ) ( vis || ( vis = { } ) ) ; // End of IIFE, ensuring 'vis' object is initialized.
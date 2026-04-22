/* This is a Type I clone of the grid.js library from enterprisbug.github.com/grid.js#v1.1 */
 ( function   ( window,   document,   undefined )   {

  // Helper function to merge properties from default objects into a target object.
  // Properties are only set if they are undefined in the target object.
  function   mergeWithDefaultValues  (  obj  )
  {
    for  ( var   i  =  1 ;   i  <  arguments.length ;   i++  )
    {
      var   def  =  arguments[i] ;  // Get the current default object.

      for  ( var   n   in   def  )
      {
        // Check if the property 'n' is not defined in 'obj'.
        if  (  obj[n]   ===   undefined  )
        {
          obj[n]   =  def[n] ;  // Assign the default value.
        }
      }
    }

    return   obj ;  // Return the modified object.
  }


  // Default configuration options for the grid.
  var   defaults   =
  {
    distance  :  50 ,           // Spacing between grid lines.
    lineWidth :  1 ,            // Thickness of the grid lines.
    gridColor :  "#000000" ,    // Color of the grid lines (black).
    caption   :  true ,         // Whether to display captions (coordinates).
    font      :  "10px Verdana"  // Font style for captions.
  };


  /*
   * The main Grid constructor function.
   * Initializes a new Grid instance with provided options.
   */
  var   Grid   =   function   Grid  (  o  )
  {
    // Ensure 'new' keyword is used. If not, instantiate and return.
    if  (  !this.draw  )
    {
      return   new   Grid  (  o  ) ;
    }

    // Merge user options (o) with Grid.defaults and then global defaults.
    this.opts   =   mergeWithDefaultValues  (  o   ||   {} ,   Grid.defaults ,   defaults  ) ;
  } ;


  // Static defaults property for the Grid class, can be extended by users.
  Grid.defaults   =   {} ;


  // Extend the Grid prototype with drawing methods.
  mergeWithDefaultValues  (  Grid.prototype ,
  {
    // The core drawing method for the grid.
    draw  :   function  (  target  )
    {
      var   self   =   this ;  // Store 'this' for consistent access.
      var   o      =   self.opts ;  // Get the current options.

      // Only proceed if a drawing target (e.g., CanvasRenderingContext2D) is provided.
      if  (  target  )
      {
        target.save  (  ) ;  // Save the current drawing state.

        // Apply grid-specific drawing styles.
        target.lineWidth    =   o.lineWidth ;
        target.strokeStyle  =   o.gridColor ;
        target.font         =   o.font ;

        var   until ; // Variable to store the maximum dimension for looping.

        // Determine the larger dimension of the canvas to ensure grid covers entire area.
        if  (  target.canvas.width   >   target.canvas.height  )
        {
          until   =   target.canvas.width ;
        }
        else
        {
          until   =   target.canvas.height ;
        }

        // --- Draw horizontal grid lines ---
        for  ( var   y  =  0 ;   y   <=   until ;   y   +=   o.distance  )
        {
          target.beginPath  (  ) ;  // Start a new path for the line.

          // Adjust line position for crisp 1px lines on pixel-based displays.
          if  (  o.lineWidth   ==   1.0  )
          {
            target.moveTo  (  0 ,   y   +   0.5  ) ;
            target.lineTo  (  target.canvas.width ,   y   +   0.5  ) ;
          }
          else
          {
            target.moveTo  (  0 ,   y  ) ;
            target.lineTo  (  target.canvas.width ,   y  ) ;
          }

          target.closePath  (  ) ;  // Close the current path.
          target.stroke  (  ) ;     // Draw the line.

          // Optionally draw captions for horizontal lines.
          if  (  o.caption  )
          {
            target.fillText  (  y ,   y ,   10  ) ;
          }
        }

        // --- Draw vertical grid lines ---
        for  ( var   x  =  0 ;   x   <=   until ;   x   +=   o.distance  )
        {
          target.beginPath  (  ) ;  // Start a new path for the line.

          // Adjust line position for crisp 1px lines.
          if  (  o.lineWidth   ==   1.0  )
          {
            target.moveTo  (  x   +   0.5 ,   0  ) ;
            target.lineTo  (  x   +   0.5 ,   target.canvas.height  ) ;
          }
          else
          {
            target.moveTo  (  x ,   0  ) ;
            target.lineTo  (  x ,   target.canvas.height  ) ;
          }

          target.closePath  (  ) ;  // Close the current path.
          target.stroke  (  ) ;     // Draw the line.

          // Optionally draw captions for vertical lines.
          if  (  o.caption  )
          {
            target.fillText  (  x ,   0 ,   x  ) ;
          }
        }

        target.restore  (  ) ;  // Restore the previous drawing state.
      }
    }
  }  ) ;


  // Expose the Grid constructor to the global window object.
  window.Grid   =   Grid ;

} )  (  window ,   document  ) ;
// This module provides computer vision utilities.
// It depends on 'cascade.js' for cascade classifiers
// and 'canvas' for image processing operations.

var cascade = require('./cascade.js') ,
    Canvas  = require('canvas') ; // The Canvas library for image manipulation.


/**
 *  Parses function arguments to provide named parameters.
 *  This function handles cases where arguments might be passed as an array
 *  or as individual named parameters.
 *
 *  @param {Array} params - The arguments array (e.g., 'arguments' object).
 *  @param {Array<string>} names - An array of expected parameter names.
 *  @returns {object} An object containing the named parameters.
 */
function get_named_arguments ( params , names )
{


  if ( params . length > 1 )
  {
    var new_params = {}; // Initialize an empty object for new parameters.

    for ( var i = 0 ; i < names . length ; i++ )
    {
      new_params[ names[ i ] ] = params[ i ] ; // Assign each parameter by its name.
    }
    return new_params ;
  }
  else if ( params . length == 1 )
  {
    // If only one argument, assume it's already the parameters object.
    return params[ 0 ] ;
  }
  else
  {
    // If no arguments, return an empty object.
    return {} ;
  }
} // End of get_named_arguments function definition.


/*
 * The main CCV (Computer Vision) object, exported for external use.
 * This object contains various image processing and object detection functions.
 */
var ccv = module . exports = exports = {

  // Grayscale conversion function for a given canvas.
  grayscale : function ( canvas )
  {
    var ctx = canvas . getContext( "2d" ) ; // Get 2D rendering context from the input canvas.
    var imageData = ctx . getImageData( 0 , 0 , canvas . width , canvas . height ) ; // Extract image data.
    var input = imageData . data ; // Get the raw pixel data (RGBA).


    var result = new Canvas( canvas . width , canvas . height ) ; // Create a new canvas for the grayscale output.
    var r_ctx = result . getContext( "2d" ) ; // Get its 2D rendering context.
    var r_imageData = r_ctx . getImageData( 0 , 0 , canvas . width , canvas . height ) ; // Get image data for the output canvas.
    var output = r_imageData . data ; // Get the raw pixel data for the output.


    var pix1 , pix2 , pix = canvas . width * canvas . height * 4 ; // Initialize pixel counters and temporary variables.

    // Loop through all pixels to convert to grayscale.
    while ( pix > 0 )
    {
      output[ pix - 1 ] = 255 ; // Set alpha channel to opaque (255).
      // Calculate grayscale value using luminosity method (R*0.3 + G*0.59 + B*0.11)
      // and assign it to R, G, B channels.
      output[ pix -= 4 ] = output[ pix1 = pix + 1 ] = output[ pix2 = pix + 2 ] = ( input[ pix ] * 0.3 + input[ pix1 ] * 0.59 + input[ pix2 ] * 0.11 ) ;
    }
    r_ctx . putImageData( r_imageData , 0 , 0 ) ; // Put the processed image data back onto the result canvas.
    return result ; // Return the grayscale canvas.
  } , // End of grayscale function.


  /*
   * Groups elements in a sequence based on a grouping function.
   * This implements a Disjoint Set Union (DSU) data structure.
   *
   * @param {Array} seq - The input sequence of elements.
   * @param {Function} gfunc - A function (element1, element2) that returns true if elements should be grouped.
   * @returns {object} An object containing 'index' (group ID for each element) and 'cat' (total number of groups).
   */
  array_group : function ( seq , gfunc )
  {
    var i , j ; // Loop counters.
    var node = new Array( seq . length ) ; // Array to store DSU nodes.

    // Initialize each element as its own set.
    for ( i = 0 ; i < seq . length ; i++ )
    {
      node[ i ] = {
             "parent"  :  -1 , // Parent pointer, -1 means root.
             "element" : seq[ i ] , // The actual element.
             "rank"    :  0    // Rank for union by rank optimization.
             } ;
    }

    // Iterate through elements to perform unions.
    for ( i = 0 ; i < seq . length ; i++ )
    {
      if ( !node[ i ] . element )
      {
        continue ; // Skip if element is null/undefined.
      }

      var root = i ; // Find the root of the current element's set.
      while ( node[ root ] . parent != -1 )
      {
        root = node[ root ] . parent ;
      }

      // Compare current element with all other elements.
      for ( j = 0 ; j < seq . length ; j++ )
      {
        // If elements are different, both exist, and gfunc indicates grouping:
        if ( i != j && node[ j ] . element && gfunc( node[ i ] . element , node[ j ] . element ) )
        {
          var root2 = j ; // Find the root of the other element's set.

          while ( node[ root2 ] . parent != -1 )
          {
            root2 = node[ root2 ] . parent ;
          }

          // If roots are different, union the two sets.
          if ( root2 != root )
          {
            if ( node[ root ] . rank > node[ root2 ] . rank )
            {
              node[ root2 ] . parent = root ; // Attach smaller rank tree under larger rank tree.
            }
            else
            {
              node[ root ] . parent = root2 ; // Attach larger rank tree under smaller rank tree.
              if ( node[ root ] . rank == node[ root2 ] . rank )
              {
                node[ root2 ] . rank++ ; // Increment rank if ranks were equal.
              }
              root = root2 ; // Update root to the new root of the combined set.
            }

            /*
             * Compress path from node 'j' to its root.
             * This optimization flattens the tree by making all nodes
             * point directly to the root.
             */
            var temp , node2 = j ;
            while ( node[ node2 ] . parent != -1 )
            {
              temp = node2 ;
              node2 = node[ node2 ] . parent ;
              node[ temp ] . parent = root ;
            }

            /*
             * Compress path from node 'i' to its root.
             * Same path compression for the first element.
             */
            node2 = i ;
            while ( node[ node2 ] . parent != -1 )
            {
              temp = node2 ;
              node2 = node[ node2 ] . parent ;
              node[ temp ] . parent = root ;
            }
          }
        }
      }
    }
    var idx = new Array( seq . length ) ; // Array to store the final group indices.
    var class_idx = 0 ; // Counter for unique group IDs.

    // Assign unique group IDs and perform final path compression.
    for ( i = 0 ; i < seq . length ; i++ )
    {
      j = -1 ; // Default group ID.
      var node1 = i ;
      if ( node[ node1 ] . element )
      {
        while ( node[ node1 ] . parent != -1 )
        {
          node1 = node[ node1 ] . parent ;
        }
        if ( node[ node1 ] . rank >= 0 )
        {
          node[ node1 ] . rank = ~class_idx++ ; // Assign new negative rank (group ID).
        }
        j = ~node[ node1 ] . rank ; // Convert negative rank back to positive group ID.
      }
      idx[ i ] = j ; // Store the assigned group ID.
    }
    return { "index" : idx , "cat" : class_idx } ; // Return the group indices and total categories.
  } , // End of array_group function.


  /*
   * Detects objects (e.g., faces) in a given canvas using a cascade classifier.
   * This is the core object detection algorithm.
   *
   * @param {Canvas} canvas - The input canvas to detect objects in.
   * @param {number} interval - Scaling interval.
   * @param {number} min_neighbors - Minimum number of neighbors for a detection to be considered valid.
   * @returns {Array<object>} An array of detected objects, each with x, y, width, height, neighbors, and confidence.
   */
  detect_objects : function ( canvas , interval , min_neighbors )
  {
      // Parse arguments into a named parameters object for easier access.
      var params = get_named_arguments( arguments , [ "canvas" , "interval" , "min_neighbors" ] ) ;

      // Convert the input canvas to grayscale, as most cascade classifiers operate on grayscale images.
      params . canvas = ccv . grayscale( params . canvas ) ;
      params . cascade = cascade ; // Assign the cascade classifier data.

      // Calculate scaling parameters.
      params . scale = Math . pow( 2 , 1 / ( params . interval + 1 ) ) ;
      params . next = params . interval + 1 ;
      params . scale_upto = Math . floor( Math . log( Math . min( params . canvas . width / params . cascade . width , params . canvas . height / params . cascade . height ) ) / Math . log( params . scale ) ) ;

      var i ; // Loop counter.
      // Store original feature data before modification.
      for ( i = 0 ; i < params . cascade . stage_classifier . length ; i++ )
      {
        params . cascade . stage_classifier[ i ] . orig_feature = params . cascade . stage_classifier[ i ] . feature ;
      }


    /*
     * Preprocessing step: Generates image pyramids at various scales and offsets.
     * This prepares the image for multi-scale object detection.
     *
     * @returns {Array<object>} An array of image data objects at different scales and positions.
     */
    function pre ( )
    {

      var canvas      = params . canvas ;
      var interval    = params . interval ;
      var scale       = params . scale ;
      var next        = params . next ;
      var scale_upto  = params . scale_upto ;

      // Initialize arrays for image pyramids (pyr) and their raw data (ret).
      var pyr = new Array( ( scale_upto + next * 2 ) * 4 ) ;
      var ret = new Array( ( scale_upto + next * 2 ) * 4 ) ;

      // Base level: original canvas.
      pyr[ 0 ] = canvas ;
      ret[ 0 ] = { "width" : pyr[ 0 ] . width ,
             "height" : pyr[ 0 ] . height ,
             "data" : pyr[ 0 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ 0 ] . width , pyr[ 0 ] . height ) . data } ;

      var i ; // Loop counter.
      // Generate initial scales by resizing the original image.
      for ( i = 1 ; i <= interval ; i++ )
      {
        pyr[ i * 4 ] = new Canvas(
          Math . floor( pyr[ 0 ] . width / Math . pow( scale , i ) ) ,
          Math . floor( pyr[ 0 ] . height / Math . pow( scale , i ) )
          ) ;
        pyr[ i * 4 ] . getContext( "2d" ) . drawImage( pyr[ 0 ] , 0 , 0 , pyr[ 0 ] . width , pyr[ 0 ] . height , 0 , 0 , pyr[ i * 4 ] . width , pyr[ i * 4 ] . height ) ;
        ret[ i * 4 ] = { "width" : pyr[ i * 4 ] . width ,
                 "height" : pyr[ i * 4 ] . height ,
                 "data" : pyr[ i * 4 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ i * 4 ] . width , pyr[ i * 4 ] . height ) . data } ;
      }

      // Generate further scales by halving previous images, creating an octave-like structure.
      for ( i = next ; i < scale_upto + next * 2 ; i++ )
      {
        pyr[ i * 4 ] = new Canvas(
          Math . floor( pyr[ i * 4 - next * 4 ] . width / 2 ) ,
          Math . floor( pyr[ i * 4 - next * 4 ] . height / 2 )
          ) ;
        pyr[ i * 4 ] . getContext( "2d" ) . drawImage( pyr[ i * 4 - next * 4 ] , 0 , 0 , pyr[ i * 4 - next * 4 ] . width , pyr[ i * 4 - next * 4 ] . height , 0 , 0 , pyr[ i * 4 ] . width , pyr[ i * 4 ] . height ) ;
        ret[ i * 4 ] = { "width" : pyr[ i * 4 ] . width ,
                 "height" : pyr[ i * 4 ] . height ,
                 "data" : pyr[ i * 4 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ i * 4 ] . width , pyr[ i * 4 ] . height ) . data } ;
      }

      // Generate shifted images (1-pixel shifts) for robust detection.
      for ( i = next * 2 ; i < scale_upto + next * 2 ; i++ )
      {
        pyr[ i * 4 + 1 ] = new Canvas(
          Math . floor( pyr[ i * 4 - next * 4 ] . width / 2 ) ,
          Math . floor( pyr[ i * 4 - next * 4 ] . height / 2 )
          ) ;
        pyr[ i * 4 + 1 ] . getContext( "2d" ) . drawImage( pyr[ i * 4 - next * 4 ] , 1 , 0 , pyr[ i * 4 - next * 4 ] . width - 1 , pyr[ i * 4 - next * 4 ] . height , 0 , 0 , pyr[ i * 4 + 1 ] . width - 2 , pyr[ i * 4 + 1 ] . height ) ;
        ret[ i * 4 + 1 ] = { "width" : pyr[ i * 4 + 1 ] . width ,
                   "height" : pyr[ i * 4 + 1 ] . height ,
                   "data" : pyr[ i * 4 + 1 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ i * 4 + 1 ] . width , pyr[ i * 4 + 1 ] . height ) . data } ;


        pyr[ i * 4 + 2 ] = new Canvas(
          Math . floor( pyr[ i * 4 - next * 4 ] . width / 2 ) ,
          Math . floor( pyr[ i * 4 - next * 4 ] . height / 2 )
          ) ;
        pyr[ i * 4 + 2 ] . getContext( "2d" ) . drawImage( pyr[ i * 4 - next * 4 ] , 0 , 1 , pyr[ i * 4 - next * 4 ] . width , pyr[ i * 4 - next * 4 ] . height - 1 , 0 , 0 , pyr[ i * 4 + 2 ] . width , pyr[ i * 4 + 2 ] . height - 2 ) ;
        ret[ i * 4 + 2 ] = { "width" : pyr[ i * 4 + 2 ] . width ,
                   "height" : pyr[ i * 4 + 2 ] . height ,
                   "data" : pyr[ i * 4 + 2 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ i * 4 + 2 ] . width , pyr[ i * 4 + 2 ] . height ) . data } ;
        pyr[ i * 4 + 3 ] = new Canvas(
          Math . floor( pyr[ i * 4 - next * 4 ] . width / 2 ) ,
          Math . floor( pyr[ i * 4 - next * 4 ] . height / 2 )
          ) ;
        pyr[ i * 4 + 3 ] . getContext( "2d" ) . drawImage( pyr[ i * 4 - next * 4 ] , 1 , 1 , pyr[ i * 4 - next * 4 ] . width - 1 , pyr[ i * 4 - next * 4 ] . height - 1 , 0 , 0 , pyr[ i * 4 + 3 ] . width - 2 , pyr[ i * 4 + 3 ] . height - 2 ) ;
        ret[ i * 4 + 3 ] = { "width" : pyr[ i * 4 + 3 ] . width ,
                   "height" : pyr[ i * 4 + 3 ] . height ,
                   "data" : pyr[ i * 4 + 3 ] . getContext( "2d" ) . getImageData( 0 , 0 , pyr[ i * 4 + 3 ] . width , pyr[ i * 4 + 3 ] . height ) . data } ;
      }
      return ret ; // Return the pyramid data.
    } ; // End of pre function.

    /*
     * Core detection logic: Applies the cascade classifier to the image pyramid.
     * Iterates through scales and positions, evaluating features.
     *
     * @param {Array<object>} pyr - The image pyramid data from the 'pre' function.
     * @param {number} id - (Unused in original, but kept for signature consistency)
     * @returns {Array<object>} An array of raw detections before grouping.
     */
    function core ( pyr , id )
    {
      var cascade     = params . cascade ;
      var interval    = params . interval ;
      var scale       = params . scale ;
      var next        = params . next ;
      var scale_upto  = params . scale_upto ;

      var i , j , k , x , y , q ; // Loop and coordinate counters.
      var scale_x = 1 , scale_y = 1 ; // Current scaling factors.
      var dx = [ 0 , 1 , 0 , 1 ] ; // X-offsets for shifted images.
      var dy = [ 0 , 0 , 1 , 1 ] ; // Y-offsets for shifted images.
      var seq = [] ; // Array to store detected objects.

      // Iterate through different scales in the pyramid.
      for ( i = 0 ; i < scale_upto ; i++ )
      {
        var qw = pyr[ i * 4 + next * 8 ] . width - Math . floor( cascade . width / 4 ) ; // Window width.
        var qh = pyr[ i * 4 + next * 8 ] . height - Math . floor( cascade . height / 4 ) ; // Window height.
        // Step sizes for feature calculation based on pyramid levels.
        var step = [ pyr[ i * 4 ] . width * 4 , pyr[ i * 4 + next * 4 ] . width * 4 , pyr[ i * 4 + next * 8 ] . width * 4 ] ;

        // Padding values for stepping through image data.
        var paddings = [ pyr[ i * 4 ] . width * 16 - qw * 16 ,
                pyr[ i * 4 + next * 4 ] . width * 8 - qw * 8 ,
                pyr[ i * 4 + next * 8 ] . width * 4 - qw * 4 ] ;

        // Prepare feature data for the current cascade stage.
        for ( j = 0 ; j < cascade . stage_classifier . length ; j++ )
        {
          var orig_feature = cascade . stage_classifier[ j ] . orig_feature ;
          var feature = cascade . stage_classifier[ j ] . feature = new Array( cascade . stage_classifier[ j ] . count ) ;

          for ( k = 0 ; k < cascade . stage_classifier[ j ] . count ; k++ )
          {
            feature[ k ] = { "size" : orig_feature[ k ] . size ,
                    "px" : new Array( orig_feature[ k ] . size ) ,
                    "pz" : new Array( orig_feature[ k ] . size ) ,
                    "nx" : new Array( orig_feature[ k ] . size ) ,
                    "nz" : new Array( orig_feature[ k ] . size ) } ;

            for ( q = 0 ; q < orig_feature[ k ] . size ; q++ )
            {
              feature[ k ] . px[ q ] = orig_feature[ k ] . px[ q ] * 4 + orig_feature[ k ] . py[ q ] * step[ orig_feature[ k ] . pz[ q ] ] ;
              feature[ k ] . pz[ q ] = orig_feature[ k ] . pz[ q ] ;
              feature[ k ] . nx[ q ] = orig_feature[ k ] . nx[ q ] * 4 + orig_feature[ k ] . ny[ q ] * step[ orig_feature[ k ] . nz[ q ] ] ;
              feature[ k ] . nz[ q ] = orig_feature[ k ] . nz[ q ] ;
            }
          }
        }

        // Iterate through the 4 shifted versions of the image (q=0,1,2,3).
        for ( q = 0 ; q < 4 ; q++ )
        {
          // Get pixel data for the current pyramid levels and shifts.
          var u8 = [ pyr[ i * 4 ] . data , pyr[ i * 4 + next * 4 ] . data , pyr[ i * 4 + next * 8 + q ] . data ] ;
          // Calculate initial offsets into the pixel data.
          var u8o = [ dx[ q ] * 8 + dy[ q ] * pyr[ i * 4 ] . width * 8 , dx[ q ] * 4 + dy[ q ] * pyr[ i * 4 + next * 4 ] . width * 4 , 0 ] ;

          // Slide the detection window across the image.
          for ( y = 0 ; y < qh ; y++ )
          {
            for ( x = 0 ; x < qw ; x++ )
            {
              var sum = 0 ; // Sum of classifier responses.
              var flag = true ; // Flag to indicate if object is detected.

              // Apply each stage of the cascade classifier.
              for ( j = 0 ; j < cascade . stage_classifier . length ; j++ )
              {
                sum = 0 ; // Reset sum for current stage.
                var alpha   = cascade . stage_classifier[ j ] . alpha ;
                var feature = cascade . stage_classifier[ j ] . feature ;

                // Apply each weak classifier within the stage.
                for ( k = 0 ; k < cascade . stage_classifier[ j ] . count ; k++ )
                {
                  var feature_k = feature[ k ] ;
                  // Initialize min/max pixel values for positive/negative features.
                  var p , pmin = u8[ feature_k . pz[ 0 ] ][ u8o[ feature_k . pz[ 0 ] ] + feature_k . px[ 0 ] ] ;
                  var n , nmax = u8[ feature_k . nz[ 0 ] ][ u8o[ feature_k . nz[ 0 ] ] + feature_k . nx[ 0 ] ] ;

                  if ( pmin <= nmax )
                  {
                    sum += alpha[ k * 2 ] ; // Add weight for negative classification.
                  }
                  else
                  {
                    var f , shortcut = true ;
                    // Check all features for the current weak classifier.
                    for ( f = 0 ; f < feature_k . size ; f++ )
                    {
                      if ( feature_k . pz[ f ] >= 0 )
                      {
                        p = u8[ feature_k . pz[ f ] ][ u8o[ feature_k . pz[ f ] ] + feature_k . px[ f ] ] ;
                        if ( p < pmin )
                        {
                          if ( p <= nmax )
                          {
                            shortcut = false ;
                            break ;
                          }
                          pmin = p ;
                        }
                      }
                      if ( feature_k . nz[ f ] >= 0 )
                      {
                        n = u8[ feature_k . nz[ f ] ][ u8o[ feature_k . nz[ f ] ] + feature_k . nx[ f ] ] ;
                        if ( n > nmax )
                        {
                          if ( pmin <= n )
                          {
                            shortcut = false ;
                            break ;
                          }
                          nmax = n ;
                        }
                      }
                    }
                    sum += ( shortcut ) ? alpha[ k * 2 + 1 ] : alpha[ k * 2 ] ; // Add weight based on shortcut.
                  }
                }
                // If stage threshold not met, this window is not an object.
                if ( sum < cascade . stage_classifier[ j ] . threshold )
                {
                  flag = false ;
                  break ;
                }
              }
              // If all stages passed, add to detected sequence.
              if ( flag )
              {
                seq . push( { "x" : ( x * 4 + dx[ q ] * 2 ) * scale_x ,
                      "y" : ( y * 4 + dy[ q ] * 2 ) * scale_y ,
                      "width" : cascade . width * scale_x ,
                      "height" : cascade . height * scale_y ,
                      "neighbor" : 1 ,
                      "confidence" : sum } ) ;
              }
              // Move to the next window position.
              u8o[ 0 ] += 16 ;
              u8o[ 1 ] += 8 ;
              u8o[ 2 ] += 4 ;
            }
            // Apply padding for the end of a row.
            u8o[ 0 ] += paddings[ 0 ] ;
            u8o[ 1 ] += paddings[ 1 ] ;
            u8o[ 2 ] += paddings[ 2 ] ;
          }
        }
        // Update scaling factors for the next pyramid level.
        scale_x *= scale ;
        scale_y *= scale ;
      }
      return seq ; // Return the sequence of raw detections.
    } ; // End of core function.

    /*
     * Postprocessing step: Groups overlapping detections and filters by neighbors.
     *
     * @param {Array<Array<object>>} seq - A nested array where the first element is the raw detections from 'core'.
     * @returns {Array<object>} An array of refined object detections.
     */
    function post ( seq )
    {
      var min_neighbors = params . min_neighbors ;
      var cascade       = params . cascade ;
      var interval      = params . interval ;
      var scale         = params . scale ;
      var next          = params . next ;
      var scale_upto    = params . scale_upto ;

      var i , j ; // Loop counters.

      // Restore original feature data in the cascade classifier.
      for ( i = 0 ; i < cascade . stage_classifier . length ; i++ )
      {
        cascade . stage_classifier[ i ] . feature = cascade . stage_classifier[ i ] . orig_feature ;
      }

      // Extract the actual sequence of detections.
      seq = seq[ 0 ] ;

      // If min_neighbors is not positive, return raw detections without grouping.
      if ( ! ( min_neighbors > 0 ) )
      {
        return seq ;
      }
      else
      {
        // Group overlapping detections using the array_group (DSU) function.
        var result = ccv . array_group( seq , function ( r1 , r2 )
        {
          var distance = Math . floor( r1 . width * 0.25 + 0.5 ) ; // Define a distance threshold for grouping.

          // Check if two rectangles (r1, r2) are close enough to be grouped.
          return r2 . x <= r1 . x + distance &&
               r2 . x >= r1 . x - distance &&
               r2 . y <= r1 . y + distance &&
               r2 . y >= r1 . y - distance &&
               r2 . width <= Math . floor( r1 . width * 1.5 + 0.5 ) &&
               Math . floor( r2 . width * 1.5 + 0.5 ) >= r1 . width ;
        } ) ;

        var ncomp = result . cat ; // Number of distinct components (groups).
        var idx_seq = result . index ; // Group index for each detection.
        var comps = new Array( ncomp + 1 ) ; // Array to store aggregated component data.

        // Initialize component data.
        for ( i = 0 ; i < comps . length ; i++ )
        {
          comps[ i ] = { "neighbors" : 0 ,
                "x" : 0 ,
                "y" : 0 ,
                "width" : 0 ,
                "height" : 0 ,
                "confidence" : 0 } ;
        }

        // Aggregate data for each component (group).
        // This counts neighbors and sums up bounding box coordinates.
        for ( i = 0 ; i < seq . length ; i++ )
        {
          var r1 = seq[ i ] ;
          var idx = idx_seq[ i ] ;

          if ( comps[ idx ] . neighbors == 0 )
          {
            comps[ idx ] . confidence = r1 . confidence ; // Initialize confidence with the first member's confidence.
          }

          ++comps[ idx ] . neighbors ; // Increment neighbor count.

          comps[ idx ] . x += r1 . x ;
          comps[ idx ] . y += r1 . y ;
          comps[ idx ] . width += r1 . width ;
          comps[ idx ] . height += r1 . height ;
          comps[ idx ] . confidence = Math . max( comps[ idx ] . confidence , r1 . confidence ) ; // Take max confidence.
        }

        var seq2 = [] ; // Array for filtered components.
        // Calculate average bounding box for each component.
        for ( i = 0 ; i < ncomp ; i++ )
        {
          var n = comps[ i ] . neighbors ;
          if ( n >= min_neighbors ) // Only include components with enough neighbors.
          {
            seq2 . push( { "x" : ( comps[ i ] . x * 2 + n ) / ( 2 * n ) ,
                   "y" : ( comps[ i ] . y * 2 + n ) / ( 2 * n ) ,
                   "width" : ( comps[ i ] . width * 2 + n ) / ( 2 * n ) ,
                   "height" : ( comps[ i ] . height * 2 + n ) / ( 2 * n ) ,
                   "neighbors" : comps[ i ] . neighbors ,
                   "confidence" : comps[ i ] . confidence } ) ;
          }
        }

        var result_seq = [] ; // Final filtered sequence.
        // Filter out small face rectangles that are inside larger, more confident ones.
        for ( i = 0 ; i < seq2 . length ; i++ )
        {
          var r1 = seq2[ i ] ;
          var flag = true ; // Flag to determine if r1 should be kept.

          for ( j = 0 ; j < seq2 . length ; j++ )
          {
            var r2 = seq2[ j ] ;
            var distance = Math . floor( r2 . width * 0.25 + 0.5 ) ; // Distance threshold for containment check.

            // Check if r1 is contained within r2 (with some margin) and r2 is more "stable" (more neighbors).
            if ( i != j &&
               r1 . x >= r2 . x - distance &&
               r1 . y >= r2 . y - distance &&
               r1 . x + r1 . width <= r2 . x + r2 . width + distance &&
               r1 . y + r1 . height <= r2 . y + r2 . height + distance &&
               ( r2 . neighbors > Math . max( 3 , r1 . neighbors ) || r1 . neighbors < 3 ) ) // Condition for suppression.
            {
              flag = false ; // r1 is suppressed by r2.
              break ;
            }
          }

          if ( flag )
          {
            result_seq . push( r1 ) ; // Add r1 to the final results if not suppressed.
          }
        }
        return result_seq ; // Return the final list of detected objects.
      }
    } ; // End of post function.

    // Execute the detection pipeline: pre-processing -> core detection -> post-processing.
    return post( [
      core(
        pre( 1 ) , 0 , 0 ) // Call pre-processing, then core detection, then post-processing.
    ] ) ;
  } // End of detect_objects function.
} ; // End of ccv object definition.
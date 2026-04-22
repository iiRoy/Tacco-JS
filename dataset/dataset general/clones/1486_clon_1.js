/*
 * Responsive-img.js
 * Version: 1.1 - Modified Type I Clone
 *
 * This file is a Type I clone of the original Responsive-img.js.
 * All functional code, identifiers, and expressions are identical.
 * Only whitespace and comments have been extensively altered to
 * demonstrate a Type I clone as per definition.
 *
 * Original Copyright (c) 2013-2014 Koen Vendrik, http://kvendrik.com
 * Licensed under the MIT license.
 *
 */


function makeImagesResponsive()
{


  var viewport = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;


  // --- SECTION: IMAGE SELECTION --- //
  // Retrieve all image elements present within the document's body.
  var images = document.getElementsByTagName('body')[0].getElementsByTagName('img');


  // If no images are found, there's nothing to do; exit early.
  if ( images.length === 0 )
  {
    return;
  }


  // --- SECTION: Cross-Browser hasAttribute Polyfill --- //
  // This variable will hold the function to check for attribute existence.
  var hasAttr;


  // Check for the native hasAttribute method, which might be missing in older IE versions.
  if ( !images[0].hasAttribute )
  {
    // Fallback for Internet Explorer versions that do not support hasAttribute natively (e.g., IE7 and below).
    // Older IE versions may not correctly support Object.Prototype extensions.
    hasAttr = function ( el, attrName )
    {
      return el.getAttribute(attrName) !== null;
    };
  }
  else
  {
    // Use the native hasAttribute method for modern browsers.
    hasAttr = function ( el, attrName )
    {
      return el.hasAttribute(attrName);
    };
  }


  // --- SECTION: Retina Display Detection --- //
  // Determine if the current display is a high-DPI (Retina) screen.
  // This uses window.devicePixelRatio, falling back to 0 if not available or below threshold.
  var retina = window.devicePixelRatio ? window.devicePixelRatio >= 1.2 ? 1 : 0 : 0;


  // --- SECTION: Main Image Processing Loop --- //
  // Iterate through each image element collected earlier.
  for ( var i = 0; i < images.length; i++ )
  {


    var image = images[i];


    // Determine the appropriate data attribute name based on Retina status.
    // If Retina, prefer 'data-src2x' and 'data-src-base2x'; otherwise, use 'data-src' and 'data-src-base'.
    var srcAttr = ( retina && hasAttr(image, 'data-src2x') ) ? 'data-src2x' : 'data-src';
    var baseAttr = ( retina && hasAttr(image, 'data-src-base2x') ) ? 'data-src-base2x' : 'data-src-base';


    // If the image does not have the required source attribute, skip to the next image.
    if ( !hasAttr(image, srcAttr) )
    {
      continue;
    }


    // Get the base path for the image, if specified.
    // This allows for relative paths within the data-src attribute.
    var basePath = hasAttr(image, baseAttr) ? image.getAttribute(baseAttr) : '';


    // Retrieve the full string of responsive queries from the image's source attribute.
    var queries = image.getAttribute(srcAttr);


    // Split the comma-separated query string into an array of individual query definitions.
    var queries_array = queries.split(',');


    // --- INNER LOOP: Evaluate Each Query --- //
    // Process each query string to find the most suitable image source for the current viewport.
    for ( var j = 0; j < queries_array.length; j++ )
    {

      // Split each query into its condition and response parts.
      // The `replace(':','||').split('||')` handles cases where a colon might appear in the response.
      var query = queries_array[j].replace(':', '||').split('||');


      // Extract the condition (e.g., '>1024') and the image response (e.g., 'large.jpg').
      var condition = query[0];
      var response = query[1];


      // Initialize variables to store the parsed condition value and the boolean evaluation result.
      var conditionpx;
      var bool;


      // Check if the condition specifies a 'less than or equal to' scenario (e.g., '<768').
      if ( condition.indexOf('<') !== -1 )
      {

        conditionpx = condition.split('<');

        // If there's a previous query, refine the condition to be between the previous and current.
        if ( queries_array[(j - 1)] )
        {
          var prev_query = queries_array[(j - 1)].split(/:(.+)/);
          var prev_cond = prev_query[0].split('<');

          // The viewport must be less than or equal to the current condition and greater than the previous.
          bool = ( viewport <= conditionpx[1] && viewport > prev_cond[1] );
        }
        else
        {
          // If this is the first '<' condition, simply check if the viewport is less than or equal to it.
          bool = ( viewport <= conditionpx[1] );
        }

      }
      else
      {
        // Otherwise, the condition specifies a 'greater than or equal to' scenario (e.g., '>1024').
        conditionpx = condition.split('>');

        // If there's a next query, refine the condition to be between the current and next.
        if ( queries_array[(j + 1)] )
        {
          var next_query = queries_array[(j + 1)].split(/:(.+)/);
          var next_cond = next_query[0].split('>');

          // The viewport must be greater than or equal to the current condition and less than the next.
          bool = ( viewport >= conditionpx[1] && viewport < next_cond[1] );
        }
        else
        {
          // If this is the last '>' condition, simply check if the viewport is greater than or equal to it.
          bool = ( viewport >= conditionpx[1] );
        }

      }


      // If the current viewport size meets the evaluated condition...
      if ( bool )
      {

        // Determine if the response URL is cross-domain (starts with '//' or 'http://'/'https://').
        var isCrossDomain = response.indexOf('//') !== -1 ? 1 : 0;


        var new_source;

        // Construct the full new image source URL.
        if ( isCrossDomain === 1 )
        {
          new_source = response; // Use response directly if it's a full URL.
        }
        else
        {
          new_source = basePath + response; // Prepend the base path for relative URLs.
        }


        // Only update the image 'src' attribute if it's different from the current one.
        // This prevents unnecessary reloads.
        if ( image.src !== new_source )
        {
          image.setAttribute('src', new_source);
        }

        // Once a matching image source is found and applied, exit this inner loop for the current image.
        break;
      }

    } // End of inner loop (for queries_array)


  } // End of outer loop (for images)


} // End of makeImagesResponsive function


// --- SECTION: Event Listener Setup --- //
// Attach the `makeImagesResponsive` function to `load` and `resize` events.
// Use `addEventListener` for modern browsers.
if ( window.addEventListener )
{

  window.addEventListener('load', makeImagesResponsive, false);
  window.addEventListener('resize', makeImagesResponsive, false);

}
else
{
  // Fallback for older Internet Explorer versions (e.g., IE8 and below)
  // that use `attachEvent` instead of `addEventListener`.
  window.attachEvent('onload', makeImagesResponsive);
  window.attachEvent('onresize', makeImagesResponsive);

}
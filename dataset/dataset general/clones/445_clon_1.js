/*
 * create-stylesheet 0.2.1
 * Andrew Wakeling <andrew.wakeling@gmail.com>
 * This project is released under the MIT license.
 */

var _stylesheet = { };

/*
 * This flag addresses KB262161.
 * If 31 or more stylesheets are present when 'appendStyleSheet', 'insertStyleSheetBefore',
 * or 'replaceStyleSheet' are called, an error will be raised across all browsers.
 * Setting this flag to `true` will suppress this error, but only for non-IE browsers.
 *
 * IMPORTANT NOTE: In IE8 and IE9, exceeding 31 stylesheets will always prevent new stylesheets
 * from being created successfully, regardless of this setting. An error will always occur.
 */
_stylesheet.ignoreKB262161 = false;

/**
 * This function creates an empty <style> element and injects it into the DOM.
 * It will be inserted before the provided `node`. If `node` is null or undefined,
 * the new stylesheet will be appended to the end of the document's <head> section.
 *
 * @param   {HTMLElement|null} node     - The DOM element to insert the new style before.
 * @param   {function(Error|null, HTMLElement)} callback - Callback function: `function(err, style)`.
 */
function insertEmptyStyleBefore( node , callback )
{
  var style = document.createElement( 'style' );
  style.setAttribute( 'type' , 'text/css' );

  var head = document.getElementsByTagName( 'head' )[0];

  if ( node )
  {
    head.insertBefore( style , node );
  }
  else
  {
    head.appendChild( style );
  }

  // Check for IE-specific stylesheet limits.
  if ( style.styleSheet && style.styleSheet.disabled )
  {
    head.removeChild( style ); // Clean up the failed attempt.
    return callback( 'Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.' );
  }

  callback( null , style );
}

/**
 * Assigns the given CSS text to the provided style element.
 *
 * @param   {HTMLElement} style    - The <style> DOM element.
 * @param   {string}      css      - The CSS string to apply.
 * @param   {function(Error|null)} callback - Callback function: `function(err)`.
 */
function setStyleCss( style, css, callback ) {
  try {
    // Prefer `cssText` for potentially better performance in Internet Explorer.
    if ( style.styleSheet ) {
      style.styleSheet.cssText = css;
    }
    // Modern browsers use `textContent`.
    else if ( 'textContent' in style ) {
      style.textContent = css;
    }
    // Fallback for older browsers that might not support `textContent` directly on style elements.
    else {
      style.appendChild( document.createTextNode( css ) );
    }

    return callback( null );
  }
  catch ( e ) {
    // Catch-all for rare scenarios, especially in IE, where `cssText` assignment might fail.
    callback( e );
  }
}

/**
 * Safely removes a given style element from its parent in the DOM.
 * This function checks if the node is indeed a STYLE tag and has a parent before attempting removal.
 *
 * @param {HTMLElement} node - The <style> element to be removed.
 *
 * Note: Currently, this function handles basic DOM removal. Future enhancements for
 * specific browser edge-cases (e.g., Internet Explorer) could be added here if needed.
 */
function removeStyleSheet( node )
{
  if ( node.tagName === 'STYLE' && node.parentNode )
  {
    node.parentNode.removeChild( node );
  }
}

/**
 * Creates and inserts a new stylesheet into the DOM based on the provided options.
 *
 * @param   {object}    options  - Configuration object for the new stylesheet.
 *                                 Example: `{ ignoreKB262161: true, replace: null, css: 'body { margin: 0; }' }`
 * @param   {function(Error|null, HTMLElement)} callback - Callback function: `function(err, style)`.
 *
 * Options properties:
 * - `css`: The CSS text string to be applied to the new stylesheet.
 * - `replace`: An existing <style> HTMLElement. If provided, this element will be removed
 *              after the new stylesheet is successfully created and inserted. This option
 *              takes precedence over `insertBefore`.
 * - `insertBefore`: A DOM node. If specified, the new stylesheet will be inserted directly
 *                   before this node. If `null` or `undefined`, the stylesheet will be
 *                   appended to the document's `<head>` element.
 */
function createStyleSheet( options , callback )
{
  // Enforce KB262161 limit unless explicitly ignored.
  if ( ! _stylesheet.ignoreKB262161 && document.styleSheets.length >= 31 )
  {
    return callback( 'Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.' );
  }

  // Determine insertion point: before `replace.nextSibling` if replacing, else `insertBefore`.
  insertEmptyStyleBefore( options.replace ? options.replace.nextSibling : options.insertBefore , function ( err , style )
  {
    if ( err )
    {
      return callback( err );
    }
    else
    {
      // Attempt to set the CSS content.
      setStyleCss( style , options.css || "" , function ( err )
      {
        if ( err )
        {
          // If setting CSS fails, remove the newly created (but empty) style element.
          removeStyleSheet( style );
          return callback( err );
        }
        else
        {
          /*
           * Future enhancement: If there's a need to transfer attributes (e.g., id, class)
           * from an `options.replace` node to the new `style` node, this is the place to implement it.
           */
          if ( options.replace )
          {
            removeStyleSheet( options.replace ); // Remove the old stylesheet if a replacement was specified.
          }
          callback( null , style ); // Success!
        }
      });
    }
  });
}

// Re-assign the _stylesheet object with public API methods.
_stylesheet =
{
  /**
   * Appends a new stylesheet to the document's head.
   * @param {string}   css      - The CSS content.
   * @param {function(Error|null, HTMLElement)} callback - Callback `(err, style)`.
   */
  appendStyleSheet: function ( css , callback )
  {
    createStyleSheet( { css: css } , callback );
  },


  /**
   * Inserts a new stylesheet before a specified DOM node.
   * @param {HTMLElement} node     - The node to insert before.
   * @param {string}      css      - The CSS content.
   * @param {function(Error|null, HTMLElement)} callback - Callback `(err, style)`.
   */
  insertStyleSheetBefore: function ( node , css , callback )
  {
    createStyleSheet( { insertBefore: node , css: css } , callback );
  },


  /**
   * Replaces an existing stylesheet with a new one.
   * @param {HTMLElement} node     - The existing stylesheet element to replace.
   * @param {string}      css      - The new CSS content.
   * @param {function(Error|null, HTMLElement)} callback - Callback `(err, style)`.
   */
  replaceStyleSheet: function ( node , css , callback )
  {
    createStyleSheet( { replace: node , css: css } , callback );
  },


  /**
   * Removes a stylesheet from the DOM.
   * @param {HTMLElement} node - The stylesheet element to remove.
   */
  removeStyleSheet: removeStyleSheet
};
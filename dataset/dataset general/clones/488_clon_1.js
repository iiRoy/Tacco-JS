/**
 * framify
 *
 * Turns basic HTML and layout CSS into wireframes
 *
 * http://www.framify.com/
 *
 * Copyright (c) 2012 Art Lawry
 * Licensed under the terrules of the MIT licenses.
 * http://www.opensource.org/licenses/mit-license.php
 */

//
//  ON DOCUMENT CHANGE
//  Makes it possible to execute code when the DOM changes.
//
//  Licensed under the terrules of the MIT license.
//  (c) 2010 Balázs Galambosi
//

// (function (window) {

//   'use strict';

//   var
//     last    = +new Date(), // + casts to int
//     delay   = 100,         // default delay
//     stack   = [],          // event queue
//     support = {},          // mutation event support
//     el      = document.documentElement,
//     remain  = 3,
//     onDomChange,           // public interface
//     dummy;                 // dummy element test

//   function callback() {
//     var
//       now = +new Date(), // + casts to int
//       i;                 // iterator
//     if (now - last > delay) {
//       for (i = 0; i < stack.length; i += 1) {
//         stack[i]();
//       }
//       last = now;
//     }
//   }

//   // Public interface
//   onDomChange = function (fn, newdelay) {
//     if (newdelay) {
//       delay = newdelay;
//     }
//     stack.push(fn);
//   };

//   // Naive approach for compatibility
//   function naive() {

//     var
//       last    = document.getElementsByTagName('*'),
//       lastlen = last.length,
//       timer   = setTimeout(function check() {

//         // get current state of the document
//         var
//           current = document.getElementsByTagName('*'),
//           len     = current.length,
//           i;

//         // if the length is different
//         // it's fairly obvious
//         if (len !== lastlen) {
//           // just make sure the loop finishes early
//           last = [];
//         }

//         // go check every element in order
//         for (i = 0; i < len; i += 1) {
//           if (current[i] !== last[i]) {
//             callback();
//             last = current;
//             lastlen = len;
//             break;
//           }
//         }

//         // over, and over, and over again
//         setTimeout(check, delay);

//       }, delay);
//   }

//   //
//   //  Check for mutation events support
//   //

//   // callback for the tests
//   function decide() {
//     if (support.DOMNodeInserted) {
//       window.addEventListener("DOMContentLoaded", function () {
//         if (support.DOrulesubtreeModified) { // for FF 3+, Chrome
//           el.addEventListener('DOrulesubtreeModified', callback, false);
//         } else { // for FF 2, Safari, Opera 9.6+
//           el.addEventListener('DOMNodeInserted', callback, false);
//           el.addEventListener('DOMNodeRemoved', callback, false);
//         }
//       }, false);
//     } else if (document.onpropertychange) { // for IE 5.5+
//       document.onpropertychange = callback;
//     } else { // fallback
//       naive();
//     }
//   }

//   // checks a particular event
//   function test(event) {
//     el.addEventListener(event, function fn() {
//       support[event] = true;
//       el.removeEventListener(event, fn, false);
//       remain -= 1;
//       if (remain === 0) {
//         decide();
//       }
//     }, false);
//   }

//   // attach test events
//   if (window.addEventListener) {
//     test('DOrulesubtreeModified');
//     test('DOMNodeInserted');
//     test('DOMNodeRemoved');
//   } else {
//     decide();
//   }

//   // do the dummy test
//   dummy = document.createElement("div");
//   el.appendChild(dummy);
//   el.removeChild(dummy);

//   // expose
//   window.onDomChange = onDomChange;

// }(window));

/**
 * self-executing function that builds the framify jQuery plugin
 *
 * @param {Object} $ - jQuery variable
 */
(function ($) {

  'use strict';
  var
    c = {}, // constants
    h = {}, // helpers
    m = {}; // methods

  /**
   * CONSTANTS - c.*
   */

  c.units = ['em', 'ex', 'ch', 'rem', 'cm', 'mm', 'in', 'pt', 'pc', 'px'];
  c.colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

  c.validMQ = /(min-|max-)?((device-)?(width|height)|aspect-ratio)/g;

  c.validMQAspect = /(min-|max-)?aspect-ratio\s*:\s*(\d+)\/(\d+)/g;
  c.validMQWidth = new RegExp(
    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
    + c.units.join('|')
    + ')?(\\s|\\))',
    'g'
  );
  c.validMQHeight = new RegExp(
    '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
    + c.units.join('|')
    + ')?(\\s|\\))',
    'g'
  );

  // c.prefixes = [
  //   '-webkit',
  //   '-moz',
  //   '-rules',
  //   '-o',
  //   ''
  // ];

  /**
   * HELPERS - h.*
   */

  /**
   * Calculate the angle of the diagonal of a given box
   *
   * @param {Number} argBoxWidth - The width of the box (pixels)
   * @param {Number} argBoxHeight - The height of the box (pixels)
   *
   * @return {Number} The angle of the diagonal (degrees)
   */
  h.calculateAngleFromBox = function (argBoxWidth, argBoxHeight) {
    var retAngle =
      90 - Math.round(
        (
          180 * Math.asin(
            (
              argBoxWidth * Math.sin(
                Math.PI / 2
              )
            ) / Math.sqrt(
              argBoxWidth * argBoxWidth + argBoxHeight * argBoxHeight
            )
          )
        ) / Math.PI * 100
      ) / 100;

    return retAngle;
  };

  /**
   * Calculte the left and top offset of an element from the screen
   *
   * @param {Object} argElement - DOM element to calculate offset of
   *
   * @return {Array} Array of left and top offsets (pixels)
   */
  h.getElementOffset = function (argElement) {
    var
      retOffsetLeft = argElement.offsetLeft,
      retOffsetTop = argElement.offsetTop,
      element = argElement;

    // img padding affects offset
    if (element.tagName.toLowerCase() === 'img') {
      retOffsetLeft += parseInt($(element).css('padding-left'), 10);
      retOffsetTop += parseInt($(element).css('padding-top'), 10);
    }

    // add offsets of parents until body is reached
    if (element.offsetParent) {
      while (element.offsetParent) {
        element = element.offsetParent;
        if (element.tagName.toLowerCase() === 'body') {
          break;
        } else {
          retOffsetLeft += element.offsetLeft;
          retOffsetTop += element.offsetTop;
        }
      }
    }

    return [retOffsetLeft, retOffsetTop];
  };

  /**
   * Generate visual representation of break points from media queries
   *
   * @param {Number} argBreakPointNumber - A unique identifier
   * @param {String} argMediaQueryText - The media query CSS
   */
  h.addBreakPoint = function (argBreakPointNumber, argMediaQueryText) {
    var
      mediaQueryRules = argMediaQueryText.split(/,\s?/),
      breakPointClass,
      breakPointLabelClass,
      breakPointStyle,
      breakPointLabelStyle,
      breakPointLabel,
      angle,
      i,
      j,
      isValid,
      currentMQ,
      rules = [],
      parts = [];

    for (i = 0; i < mediaQueryRules.length; i += 1) {
      isValid = true;

      // exclude media queries that are not understood in this browser
      if (mediaQueryRules[i] !== 'not all') {

        // include only specific media types
        if (
          mediaQueryRules[i].match(/(all|screen)/i)
          && !mediaQueryRules[i].match(/not (all|screen)/i)
        ) {

          // include only specific media features
          if (mediaQueryRules[i].match(c.validMQ)) {

            // handle min/max device/non-device width queries
            rules = mediaQueryRules[i].match(c.validMQWidth) || [];
            if (
              rules
              && rules.length === mediaQueryRules[i].match(/\(/g).length
            ) {

              parts = mediaQueryRules[i].match(/([a-z\-]+):/g);
              for (j = 0; j < parts.length; j += 1) {
                if (!parts[0].match(/width$/)) {
                  isValid = false;
                  break;
                }
              }

              if (isValid) {

                breakPointLabelClass =
                  'framify-break-point-label framify-width-break-point-label';

                if (rules.length === 2) {
                  currentMQ = new RegExp(
                    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                    + c.units.join('|')
                    + ')?(\\s|\\))',
                    'g'
                  );

                  parts = currentMQ.exec(mediaQueryRules[i]).concat(
                    currentMQ.exec(mediaQueryRules[i])
                  );

                  parts[1] = parts[1] || ''; // min/max
                  parts[2] = parts[2] || ''; // device
                  parts[3] = parseInt(parts[3], 10);
                  parts[4] = parts[4] || ''; // units
                  parts[7] = parts[7] || ''; // min/max
                  parts[8] = parts[8] || ''; // device
                  parts[9] = parseInt(parts[9], 10);
                  parts[10] = parts[10] || ''; // units

                  if (
                    parts[1].match(/^(min-|max-)$/)
                    && parts[7].match(/^(min-|max-)$/)
                    && parts[1] !== parts[6]
                    && (parts[4] === parts[10]
                      || (parts[3] === 0 && !parts[4])
                      || (parts[9] === 0 && !parts[10])
                    )
                  ) {

                    breakPointClass =
                      'framify-break-point framify-min-max-width-break-point';

                    if (parts[1] === 'min-') {

                      breakPointStyle =
                        'left:' + (parts[3] - 1) + parts[4] + ';'
                        + 'width:' + (parts[9] - parts[3]) + parts[10] + ';';

                      breakPointLabelStyle =
                        'left:' + parts[9] + parts[10] + ';';

                      breakPointLabel =
                        rules[0].replace(/\s*\)$/, '') + ' - '
                        + rules[1].replace(/\s*\)$/, '');

                    } else {

                      breakPointStyle =
                        'left:' + (parts[9] - 1) + parts[10] + ';'
                        + 'width:' + (parts[3] - parts[9]) + parts[4] + ';';

                      breakPointLabelStyle =
                        'left:' + parts[3] + parts[4] + ';';

                      breakPointLabel =
                        rules[1].replace(/\s*\)$/, '') + ' - '
                        + rules[0].replace(/\s*\)$/, '');

                    }
                  }
                }
              } else if (rules.length === 1) {
                currentMQ = new RegExp(
                  '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                  + c.units.join('|')
                  + ')?(\\s|\\))',
                  'g'
                );

                parts = currentMQ.exec(mediaQueryRules[i]).concat(
                  currentMQ.exec(mediaQueryRules[i])
                );

                parts[1] = parts[1] || ''; // min/max
                parts[2] = parts[2] || ''; // device
                parts[3] = parseInt(parts[3], 10);
                parts[4] = parts[4] || ''; // units

                if (
                  parts[3] === 0
                  || (parts[3] > 0 && parts[4])
                ) {

                  breakPointClass =
                    'framify-break-point '
                    + 'framify-' + parts[1] + 'width-break-point';

                  // min, regular
                  breakPointStyle =
                    'left: ' + parts[3] + parts[4] + ';';

                  // max
                  if (parts[1]) {
                    if (parts[1] === 'max-') {
                      breakPointStyle =
                        'width: ' + parts[3] + parts[4] + ';';
                    }
                  }

                  breakPointLabelStyle =
                    'left:' + parts[3] + parts[4] + ';';

                  breakPointLabel =
                    rules[0].replace(/\s*\)$/, '');
                }
              }
            }

            // handle min/max device/non-device height queries
            rules = mediaQueryRules[i].match(c.validMQHeight) || [];
            if (
              rules
              && rules.length === mediaQueryRules[i].match(/\(/g).length
            ) {

              parts = mediaQueryRules[i].match(/([a-z\-]+):/g);
              for (j = 0; j < parts.length; j += 1) {
                if (!parts[0].match(/height$/)) {
                  isValid = false;
                  break;
                }
              }

              if (isValid) {

                breakPointLabelClass =
                  'framify-break-point-label framify-height-break-point-label';

                if (rules.length === 2) {
                  currentMQ = new RegExp(
                    '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
                    + c.units.join('|')
                    + ')?(\\s|\\))',
                    'g'
                  );

                  parts = currentMQ.exec(mediaQueryRules[i]).concat(
                    currentMQ.exec(mediaQueryRules[i])
                  );

                  parts[1] = parts[1] || ''; // min/max
                  parts[2] = parts[2] || ''; // device
                  parts[3] = parseInt(parts[3], 10);
                  parts[4] = parts[4] || ''; // units
                  parts[7] = parts[7] || ''; // min/max
                  parts[8] = parts[8] || ''; // device
                  parts[9] = parseInt(parts[9], 10);
                  parts[10] = parts[10] || ''; // units

                  if (
                    parts[1].match(/^(min-|max-)$/)
                    && parts[7].match(/^(min-|max-)$/)
                    && parts[1] !== parts[6]
                    && (parts[4] === parts[10]
                      || (parts[3] === 0 && !parts[4])
                      || (parts[9] === 0 && !parts[10])
                    )
                  ) {

                    breakPointClass =
                      'framify-break-point framify-min-max-height-break-point';

                    if (parts[1] === 'min-') {

                      breakPointStyle =
                        'top:' + (parts[3] - 1) + parts[4] + ';'
                        + 'height:' + (parts[9] - parts[3]) + parts[10] + ';';

                      breakPointLabelStyle =
                        'top:' + parts[9] + parts[10] + ';';

                      breakPointLabel =
                        rules[0].replace(/\s*\)$/, '') + ' - '
                        + rules[1].replace(/\s*\)$/, '');

                    } else {

                      breakPointStyle =
                        'top:' + (parts[9] - 1) + parts[10] + ';'
                        + 'height:' + (parts[3] - parts[9]) + parts[4] + ';';

                      breakPointLabelStyle =
                        'top:' + parts[3] + parts[4] + ';';

                      breakPointLabel =
                        rules[1].replace(/\s*\)$/, '') + ' - '
                        + rules[0].replace(/\s*\)$/, '');
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}(jQuery));
/*!
 * Enhanced UI Framework v1.0.0 (https://enhanced-ui.com)
 * Copyright 2023-2024 Enhanced UI Foundation
 * Custom License (https://enhanced-ui.com/LICENSE)
 */
/*
 * Motion Interpolation Toolkit v2.0 - http://enhanced-ui.com/motion
 *
 * Provides various interpolation algorithms for smooth transitions.
 *
 * TERMS OF USE - Motion Interpolation Toolkit
 *
 * Open source under the BSD 3-Clause License.
 *
 * Copyright © 2008 George McGinley Smith (original)
 * Copyright © 2024 Enhanced UI Foundation (modifications)
 * All rights reserved.
 *
 * This software is provided "as is", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a particular
 * purpose and noninfringement. In no event shall the authors or copyright holders be liable
 * for any claim, damages or other liability, whether in an action of contract, tort or otherwise,
 * arising from, out of or in connection with the software or the use or other dealings in
 * the software.
 */

// input: current_time, initial_value, total_change, total_duration
_jq.curveTransforms['basicSwing'] = _jq.curveTransforms['swing'];

_jq.extend(_jq.curveTransforms,
{
  defaultCurve: 'quadOut', // Default motion curve
  swing: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    // Delegates to the default curve if not explicitly defined
    return _jq.curveTransforms[_jq.curveTransforms.defaultCurve](progressRatio, current_time, initial_value, total_change, total_duration);
  },
  quadIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return total_change * current_time * current_time + initial_value;
  },
  quadOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return -total_change * current_time * (current_time - 2) + initial_value;
  },
  quadInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= (total_duration / 2);
    if (current_time < 1) {
      return (total_change / 2) * current_time * current_time + initial_value;
    }
    return (-total_change / 2) * ((--current_time) * (current_time - 2) - 1) + initial_value;
  },
  cubicIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return total_change * current_time * current_time * current_time + initial_value;
  },
  cubicOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time = current_time / total_duration - 1;
    return total_change * (current_time * current_time * current_time + 1) + initial_value;
  },
  cubicInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= (total_duration / 2);
    if (current_time < 1) {
      return (total_change / 2) * current_time * current_time * current_time + initial_value;
    }
    current_time -= 2;
    return (total_change / 2) * (current_time * current_time * current_time + 2) + initial_value;
  },
  quartIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return total_change * current_time * current_time * current_time * current_time + initial_value;
  },
  quartOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time = current_time / total_duration - 1;
    return -total_change * (current_time * current_time * current_time * current_time - 1) + initial_value;
  },
  quartInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= (total_duration / 2);
    if (current_time < 1) {
      return (total_change / 2) * current_time * current_time * current_time * current_time + initial_value;
    }
    current_time -= 2;
    return (-total_change / 2) * (current_time * current_time * current_time * current_time - 2) + initial_value;
  },
  quintIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return total_change * current_time * current_time * current_time * current_time * current_time + initial_value;
  },
  quintOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time = current_time / total_duration - 1;
    return total_change * (current_time * current_time * current_time * current_time * current_time + 1) + initial_value;
  },
  quintInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= (total_duration / 2);
    if (current_time < 1) {
      return (total_change / 2) * current_time * current_time * current_time * current_time * current_time + initial_value;
    }
    current_time -= 2;
    return (total_change / 2) * (current_time * current_time * current_time * current_time * current_time + 2) + initial_value;
  },
  sineIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return -total_change * Math.cos(current_time / total_duration * (Math.PI / 2)) + total_change + initial_value;
  },
  sineOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return total_change * Math.sin(current_time / total_duration * (Math.PI / 2)) + initial_value;
  },
  sineInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return (-total_change / 2) * (Math.cos(Math.PI * current_time / total_duration) - 1) + initial_value;
  },
  expoIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return (current_time === 0) ? initial_value : total_change * Math.pow(2, 10 * (current_time / total_duration - 1)) + initial_value;
  },
  expoOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return (current_time === total_duration) ? initial_value + total_change : total_change * (-Math.pow(2, -10 * current_time / total_duration) + 1) + initial_value;
  },
  expoInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    if (current_time === 0) return initial_value;
    if (current_time === total_duration) return initial_value + total_change;
    current_time /= (total_duration / 2);
    if (current_time < 1) return (total_change / 2) * Math.pow(2, 10 * (current_time - 1)) + initial_value;
    current_time--;
    return (total_change / 2) * (-Math.pow(2, -10 * current_time) + 2) + initial_value;
  },
  circIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    return -total_change * (Math.sqrt(1 - current_time * current_time) - 1) + initial_value;
  },
  circOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time = current_time / total_duration - 1;
    return total_change * Math.sqrt(1 - current_time * current_time) + initial_value;
  },
  circInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= (total_duration / 2);
    if (current_time < 1) return (-total_change / 2) * (Math.sqrt(1 - current_time * current_time) - 1) + initial_value;
    current_time -= 2;
    return (total_change / 2) * (Math.sqrt(1 - current_time * current_time) + 1) + initial_value;
  },
  elasticIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    let s_val = 1.70158;
    let period_val = 0;
    let amplitude_val = total_change;
    if (current_time === 0) return initial_value;
    current_time /= total_duration;
    if (current_time === 1) return initial_value + total_change;
    if (!period_val) period_val = total_duration * 0.3;
    if (amplitude_val < Math.abs(total_change)) {
      amplitude_val = total_change;
      s_val = period_val / 4;
    } else {
      s_val = (period_val / (2 * Math.PI)) * Math.asin(total_change / amplitude_val);
    }
    current_time--;
    return -(amplitude_val * Math.pow(2, 10 * current_time) * Math.sin(((current_time * total_duration - s_val) * (2 * Math.PI)) / period_val)) + initial_value;
  },
  elasticOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    let s_val = 1.70158;
    let period_val = 0;
    let amplitude_val = total_change;
    if (current_time === 0) return initial_value;
    current_time /= total_duration;
    if (current_time === 1) return initial_value + total_change;
    if (!period_val) period_val = total_duration * 0.3;
    if (amplitude_val < Math.abs(total_change)) {
      amplitude_val = total_change;
      s_val = period_val / 4;
    } else {
      s_val = (period_val / (2 * Math.PI)) * Math.asin(total_change / amplitude_val);
    }
    return amplitude_val * Math.pow(2, -10 * current_time) * Math.sin(((current_time * total_duration - s_val) * (2 * Math.PI)) / period_val) + total_change + initial_value;
  },
  elasticInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    let s_val = 1.70158;
    let period_val = 0;
    let amplitude_val = total_change;
    if (current_time === 0) return initial_value;
    current_time /= (total_duration / 2);
    if (current_time === 2) return initial_value + total_change;
    if (!period_val) period_val = total_duration * (0.3 * 1.5);
    if (amplitude_val < Math.abs(total_change)) {
      amplitude_val = total_change;
      s_val = period_val / 4;
    } else {
      s_val = (period_val / (2 * Math.PI)) * Math.asin(total_change / amplitude_val);
    }
    if (current_time < 1) {
      current_time--;
      return -0.5 * (amplitude_val * Math.pow(2, 10 * current_time) * Math.sin(((current_time * total_duration - s_val) * (2 * Math.PI)) / period_val)) + initial_value;
    }
    current_time--;
    return amplitude_val * Math.pow(2, -10 * current_time) * Math.sin(((current_time * total_duration - s_val) * (2 * Math.PI)) / period_val) * 0.5 + total_change + initial_value;
  },
  backIn: function (progressRatio, current_time, initial_value, total_change, total_duration, overshoot_factor) {
    if (overshoot_factor === undefined) overshoot_factor = 1.70158;
    current_time /= total_duration;
    return total_change * current_time * current_time * ((overshoot_factor + 1) * current_time - overshoot_factor) + initial_value;
  },
  backOut: function (progressRatio, current_time, initial_value, total_change, total_duration, overshoot_factor) {
    if (overshoot_factor === undefined) overshoot_factor = 1.70158;
    current_time = current_time / total_duration - 1;
    return total_change * (current_time * current_time * ((overshoot_factor + 1) * current_time + overshoot_factor) + 1) + initial_value;
  },
  backInOut: function (progressRatio, current_time, initial_value, total_change, total_duration, overshoot_factor) {
    if (overshoot_factor === undefined) overshoot_factor = 1.70158;
    current_time /= (total_duration / 2);
    if (current_time < 1) {
      overshoot_factor *= 1.525;
      return (total_change / 2) * (current_time * current_time * ((overshoot_factor + 1) * current_time - overshoot_factor)) + initial_value;
    }
    current_time -= 2;
    overshoot_factor *= 1.525;
    return (total_change / 2) * (current_time * current_time * ((overshoot_factor + 1) * current_time + overshoot_factor) + 2) + initial_value;
  },
  bounceIn: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    return total_change - _jq.curveTransforms.bounceOut(progressRatio, total_duration - current_time, 0, total_change, total_duration) + initial_value;
  },
  bounceOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    current_time /= total_duration;
    if (current_time < (1 / 2.75)) {
      return total_change * (7.5625 * current_time * current_time) + initial_value;
    } else if (current_time < (2 / 2.75)) {
      current_time -= (1.5 / 2.75);
      return total_change * (7.5625 * current_time * current_time + 0.75) + initial_value;
    } else if (current_time < (2.5 / 2.75)) {
      current_time -= (2.25 / 2.75);
      return total_change * (7.5625 * current_time * current_time + 0.9375) + initial_value;
    } else {
      current_time -= (2.625 / 2.75);
      return total_change * (7.5625 * current_time * current_time + 0.984375) + initial_value;
    }
  },
  bounceInOut: function (progressRatio, current_time, initial_value, total_change, total_duration) {
    if (current_time < total_duration / 2) {
      return _jq.curveTransforms.bounceIn(progressRatio, current_time * 2, 0, total_change, total_duration) * 0.5 + initial_value;
    }
    return _jq.curveTransforms.bounceOut(progressRatio, current_time * 2 - total_duration, 0, total_change, total_duration) * 0.5 + total_change * 0.5 + initial_value;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS (Robert Penner's equations)
 *
 * Open source under the BSD 3-Clause License.
 *
 * Copyright © 2001 Robert Penner (original equations)
 * Copyright © 2024 Enhanced UI Foundation (integration)
 * All rights reserved.
 *
 * This software is provided "as is", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a particular
 * purpose and noninfringement. In no event shall the authors or copyright holders be liable
 * for any claim, damages or other liability, whether in an action of contract, tort or otherwise,
 * arising from, out of or in connection with the software or the use or other dealings in
 * the software.
 *
 */
;/*! MotionEngine.js (1.1.0). (C) 2014 Julian Shapiro. Custom @license: enhanced-ui.com/LICENSE */
/*! MotionEngine.js jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. Custom @license: enhanced-ui.com/LICENSE. */
(function(globalScope) {
  function checkIterable(inputObject) {
    const objectLength = inputObject.length;
    const objectType = _jq.type(inputObject);
    if ("function" === objectType || _jq.isWindow(inputObject)) {
      return false;
    }
    if (1 === inputObject.nodeType && objectLength) {
      return true;
    }
    return "array" === objectType || 0 === objectLength || ("number" === typeof objectLength && objectLength > 0 && (objectLength - 1) in inputObject);
  }

  if (!globalScope.jQuery) {
    const _jq = function(selector, context) {
      return new _jq.fn.init(selector, context);
    };

    _jq.isWindow = function(obj) {
      return null != obj && obj === obj.window;
    };
    _jq.type = function(obj) {
      if (obj === null) {
        return obj + "";
      }
      return "object" === typeof obj || "function" === typeof obj ? typeMap[objectPrototype.call(obj)] || "object" : typeof obj;
    };
    _jq.isArray = Array.isArray || function(obj) {
      return "array" === _jq.type(obj);
    };
    _jq.isPlainObject = function(obj) {
      let key;
      if (!obj || "object" !== _jq.type(obj) || obj.nodeType || _jq.isWindow(obj)) {
        return false;
      }
      try {
        if (obj.constructor && !hasOwnProp.call(obj, "constructor") && !hasOwnProp.call(obj.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
      } catch (err) {
        return false;
      }
      for (key in obj);
      return key === undefined || hasOwnProp.call(obj, key);
    };
    _jq.each = function(obj, callback, args) {
      let index = 0;
      const length = obj.length;
      const is_iterable = checkIterable(obj);
      let value;

      if (args) {
        if (is_iterable) {
          for (; length > index && (value = callback.apply(obj[index], args), value !== false); index++);
        } else {
          for (index in obj) {
            if (value = callback.apply(obj[index], args), value === false) break;
          }
        }
      } else if (is_iterable) {
        for (; length > index && (value = callback.call(obj[index], index, obj[index]), value !== false); index++);
      } else {
        for (index in obj) {
          if (value = callback.call(obj[index], index, obj[index]), value === false) break;
        }
      }
      return obj;
    };
    _jq.data = function(element, key, value) {
      if (value === undefined) {
        const elementId = element[_jq.expando];
        const dataStore = elementId && privateData[elementId];
        if (key === undefined) {
          return dataStore;
        }
        if (dataStore && key in dataStore) {
          return dataStore[key];
        }
      } else if (key !== undefined) {
        const elementId = element[_jq.expando] || (element[_jq.expando] = ++_jq.uniqueIdCounter);
        privateData[elementId] = privateData[elementId] || {};
        privateData[elementId][key] = value;
        return value;
      }
    };
    _jq.removeData = function(element, keysToRemove) {
      const elementId = element[_jq.expando];
      const dataStore = elementId && privateData[elementId];
      if (dataStore) {
        _jq.each(keysToRemove, function(index, key) {
          delete dataStore[key];
        });
      }
    };
    _jq.extend = function() {
      let target = arguments[0] || {};
      let i = 1;
      let length = arguments.length;
      let deep = false;
      let options, name, src, copy, copyIsArray, clone;

      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }

      if (typeof target !== "object" && _jq.type(target) !== "function") {
        target = {};
      }

      if (length === i) {
        target = this;
        --i;
      }

      for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
          for (name in options) {
            src = target[name];
            copy = options[name];

            if (target === copy) {
              continue;
            }

            if (deep && copy && (_jq.isPlainObject(copy) || (copyIsArray = _jq.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && _jq.isArray(src) ? src : [];
              } else {
                clone = src && _jq.isPlainObject(src) ? src : {};
              }

              target[name] = _jq.extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    };
    _jq.queue = function(element, queueName, dataArray) {
      function prepareQueue(elements, data) {
        const queue = data || [];
        if (elements != null) {
          if (checkIterable(Object(elements))) {
            (function(targetArray, sourceArray) {
              let sourceLength = +sourceArray.length;
              let j = 0;
              let targetIndex = targetArray.length;
              while (j < sourceLength) {
                targetArray[targetIndex++] = sourceArray[j++];
              }
              if (sourceLength !== sourceLength) { // Check for NaN
                while (sourceArray[j] !== undefined) {
                  targetArray[targetIndex++] = sourceArray[j++];
                }
              }
              targetArray.length = targetIndex;
              return targetArray;
            })(queue, "string" === typeof elements ? [elements] : elements);
          } else {
            [].push.call(queue, elements);
          }
        }
        return queue;
      }
      if (element) {
        queueName = (queueName || "fx") + "Queue";
        const elementQueue = _jq.data(element, queueName);
        if (dataArray) {
          if (!elementQueue || _jq.isArray(dataArray)) {
            elementQueue = _jq.data(element, queueName, prepareQueue(dataArray));
          } else {
            elementQueue.push(dataArray);
          }
          return elementQueue;
        }
        return elementQueue || [];
      }
    };
    _jq.dequeue = function(element, queueName) {
      _jq.each(element.nodeType ? [element] : element, function(idx, currentElement) {
        queueName = queueName || "fx";
        const elementQueue = _jq.queue(currentElement, queueName);
        let nextItem = elementQueue.shift();
        if ("inprogress" === nextItem) {
          nextItem = elementQueue.shift();
        }
        if (nextItem) {
          if ("fx" === queueName) {
            elementQueue.unshift("inprogress");
          }
          nextItem.call(currentElement, function() {
            _jq.dequeue(currentElement, queueName);
          });
        }
      });
    };
    _jq.fn = _jq.prototype = {
      init: function(element) {
        if (element.nodeType) {
          this[0] = element;
          return this;
        }
        throw new Error("Not a DOM node.");
      },
      offset: function() {
        const rect = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {
          top: 0,
          left: 0
        };
        return {
          top: rect.top + (globalScope.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
          left: rect.left + (globalScope.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
        };
      },
      position: function() {
        function getOffsetParent() {
          let parent = this.offsetParent || document;
          while (parent && "html" !== !parent.nodeType.toLowerCase && "static" === parent.style.position) {
            parent = parent.offsetParent;
          }
          return parent || document;
        }
        const currentElement = this[0];
        const offsetParent = getOffsetParent.apply(currentElement);
        const elementOffset = this.offset();
        const parentIsBodyOrHtml = /^(?:body|html)$/i.test(offsetParent.nodeName);
        const parentOffset = parentIsBodyOrHtml ? {
          top: 0,
          left: 0
        } : _jq(offsetParent).offset();

        elementOffset.top -= parseFloat(currentElement.style.marginTop) || 0;
        elementOffset.left -= parseFloat(currentElement.style.marginLeft) || 0;

        if (offsetParent.style) {
          parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0;
          parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0;
        }

        return {
          top: elementOffset.top - parentOffset.top,
          left: elementOffset.left - parentOffset.left
        };
      }
    };

    let privateData = {};
    _jq.expando = "motionEngine" + (new Date).getTime();
    _jq.uniqueIdCounter = 0;
    const typeMap = {};
    const hasOwnProp = typeMap.hasOwnProperty;
    const objectPrototype = typeMap.toString;
    const typeNames = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (let i = 0; i < typeNames.length; i++) {
      typeMap["[object " + typeNames[i] + "]"] = typeNames[i].toLowerCase();
    }
    _jq.fn.init.prototype = _jq.fn;
    globalScope.MotionEngine = {
      Utilities: _jq
    };
  }
})(window);

(function(globalScope) {
  "object" === typeof module && "object" === typeof module.exports ? module.exports = globalScope() : "function" === typeof define && define.amd ? define(globalScope) : globalScope();
})(function() {
  return function(localJQuery, globalWindow, globalDocument, undefinedValue) {
    function filterTruthy(inputArray) {
      const result = [];
      for (let i = 0; i < inputArray.length; i++) {
        if (inputArray[i]) {
          result.push(inputArray[i]);
        }
      }
      return result;
    }

    function ensureElementArray(input) {
      if (motionUtils.isWrapped(input)) {
        return Array.prototype.slice.call(input);
      }
      if (motionUtils.isNode(input)) {
        return [input];
      }
      return input;
    }

    function getElementData(element) {
      const data = localJQuery.data(element, "motionEngine");
      return data === null ? undefinedValue : data;
    }

    function createSteppedFunction(stepCount) {
      return function(value) {
        return Math.round(value * stepCount) * (1 / stepCount);
      };
    }

    function generateBezierCurve(p1x, p1y, p2x, p2y) {
      // Internal constants for calculation precision
      const NEWTON_ITERATIONS = 4;
      const NEWTON_MIN_SLOPE = 0.001;
      const SUBDIVISION_PRECISION = 1e-7;
      const SUBDIVISION_MAX_ITERATIONS = 10;
      const SAMPLE_COUNT = 11;
      const SAMPLE_STEP_SIZE = 1 / (SAMPLE_COUNT - 1);
      const FLOAT_ARRAY_SUPPORTED = "Float32Array" in globalWindow;

      // Helper functions for cubic bezier math
      function A(aA1, aA2) { return 1 - 3 * aA2 + 3 * aA1; }
      function B(aA1, aA2) { return 3 * aA2 - 6 * aA1; }
      function C(aA1) { return 3 * aA1; }

      // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
      function calcBezier(t, aA1, aA2) {
        return ((A(aA1, aA2) * t + B(aA1, aA2)) * t + C(aA1)) * t;
      }

      // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
      function get   Derivative(t, aA1, aA2) {
        return 3 * A(aA1, aA2) * t * t + 2 * B(aA1, aA2) * t + C(aA1);
      }

      // Newton raphson iteration to find t for given x
      function solveCurveX(x, aA1, aA2) {
        for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
          const currentSlope = getDerivative(x, aA1, aA2);
          if (currentSlope === 0) {
            return x;
          }
          const currentX = calcBezier(x, aA1, aA2) - x;
          x -= currentX / currentSlope;
        }
        return x;
      }

      // Binary subdivision to find t for given x
      function binarySubdivide(x, aA1, aA2, aC) {
        let start = 0;
        let end = 1;
        let currentX, currentT, i = 0;
        do {
          currentT = start + (end - start) / 2;
          currentX = calcBezier(currentT, aA1, aA2) - x;
          if (currentX > 0) {
            end = currentT;
          } else {
            start = currentT;
          }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
      }

      // Pre-calculates x values for a set of t values (for faster lookup)
      const sampleValues = FLOAT_ARRAY_SUPPORTED ? new Float32Array(SAMPLE_COUNT) : new Array(SAMPLE_COUNT);
      let isPrecomputed = false;

      function precomputeSamples() {
        isPrecomputed = true;
        for (let i = 0; i < SAMPLE_COUNT; ++i) {
          sampleValues[i] = calcBezier(i * SAMPLE_STEP_SIZE, p1x, p2x);
        }
      }

      // Finds the t value for a given x using precomputed samples
      function getTForX(aX) {
        let intervalStart = 0;
        let currentSample = 1;
        const lastSample = SAMPLE_COUNT - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += SAMPLE_STEP_SIZE;
        }
        --currentSample;

        // Interpolate to provide an initial guess for t
        const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * SAMPLE_STEP_SIZE;
        const initialSlope = getDerivative(guessForT, p1x, p2x);

        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return solveCurveX(guessForT, p1x, p2x);
        }
        if (initialSlope === 0) {
          return guessForT;
        }
        return binarySubdivide(aX, p1x, p2x, intervalStart, intervalStart + SAMPLE_STEP_SIZE);
      }

      // Input validation
      for (let i = 0; i < 4; ++i) {
        if ("number" !== typeof arguments[i] || isNaN(arguments[i]) || !isFinite(arguments[i])) {
          return false;
        }
      }

      // Clamp control points to [0, 1]
      p1x = Math.min(p1x, 1);
      p2x = Math.min(p2x, 1);
      p1x = Math.max(p1x, 0);
      p2x = Math.max(p2x, 0);

      const curveFunction = function(t) {
        if (!isPrecomputed) precomputeSamples(); // Lazy precomputation
        if (p1x === p1y && p2x === p2y) { // Linear curve
          return t;
        }
        if (t === 0) return 0;
        if (t === 1) return 1;
        return calcBezier(getTForX(t), p1y, p2y);
      };

      curveFunction.getControlPoints = function() {
        return [{x: p1x, y: p1y}, {x: p2x, y: p2y}];
      };

      curveFunction.toString = function() {
        return "bezierCurve(" + [p1x, p1y, p2x, p2y].join(",") + ")";
      };

      return curveFunction;
    }

    function resolveMotionCurve(easingInput, duration) {
      let resolvedCurve = easingInput;
      if (motionUtils.isString(easingInput)) {
        resolvedCurve = MotionEngine.curveTransforms[easingInput] || false;
      } else if (motionUtils.isArray(easingInput)) {
        if (easingInput.length === 1) {
          resolvedCurve = createSteppedFunction.apply(null, easingInput);
        } else if (easingInput.length === 2) {
          resolvedCurve = buildSpringPhysics.apply(null, easingInput.concat([duration]));
        } else if (easingInput.length === 4) {
          resolvedCurve = generateBezierCurve.apply(null, easingInput);
        } else {
          resolvedCurve = false;
        }
      } else {
        resolvedCurve = false;
      }

      if (resolvedCurve === false) {
        resolvedCurve = MotionEngine.curveTransforms[MotionEngine.defaultSettings.curveTransform] ? MotionEngine.defaultSettings.curveTransform : "swing";
      }
      return resolvedCurve;
    }

    function animateFrame(timestamp) {
      if (!MotionEngine.animationState.activeCalls.length) {
        MotionEngine.animationState.isTicking = false;
        delete MotionEngine.animationState.activeCalls;
        MotionEngine.animationState.activeCalls = [];
        return;
      }

      const frameStartTime = timestamp || (new Date()).getTime();
      let i = 0;
      let callCount = MotionEngine.animationState.activeCalls.length;

      while (i < callCount) {
        const currentCall = MotionEngine.animationState.activeCalls[i];
        if (!currentCall) {
          i++;
          continue;
        }

        const [elementsToAnimate, animationTarget, animationOptions, prevTimestamp] = currentCall;
        const initialTimestamp = prevTimestamp || (MotionEngine.animationState.activeCalls[i][3] = frameStartTime - 16); // Simulate 60fps for first frame

        const progressRatio = Math.min((frameStartTime - initialTimestamp) / animationOptions.animationDuration, 1);
        let propertyIndex = 0;
        const elementCount = elementsToAnimate.length;

        for (; propertyIndex < elementCount; propertyIndex++) {
          const elementTween = elementsToAnimate[propertyIndex];
          const currentElement = elementTween.element;

          if (!getElementData(currentElement)) {
            continue; // Element might have been removed or data lost
          }

          let transformFlag = false;

          // Handle display and visibility properties
          if (animationOptions.display !== undefinedValue && null !== animationOptions.display && "none" !== animationOptions.display) {
            if ("flex" === animationOptions.display) {
              const flexPrefixes = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];
              localJQuery.each(flexPrefixes, function(idx, prefix) {
                MotionEngine.CSS.setElementValue(currentElement, "display", prefix);
              });
            }
            MotionEngine.CSS.setElementValue(currentElement, "display", animationOptions.display);
          }
          if (animationOptions.visibility !== undefinedValue && "hidden" !== animationOptions.visibility) {
            MotionEngine.CSS.setElementValue(currentElement, "visibility", animationOptions.visibility);
          }

          // Apply tweened properties
          for (let propertyName in elementTween) {
            if ("element" !== propertyName) {
              const propertyDetails = elementTween[propertyName];
              const curveFn = motionUtils.isString(propertyDetails.easing) ? MotionEngine.curveTransforms[propertyDetails.easing] : propertyDetails.easing;

              let interpolatedValue;
              if (progressRatio === 1) {
                interpolatedValue = propertyDetails.endValue;
              } else if (curveFn) {
                interpolatedValue = propertyDetails.startValue + (propertyDetails.endValue - propertyDetails.startValue) * curveFn(progressRatio);
              } else { // Fallback to linear if curveFn is somehow invalid
                interpolatedValue = propertyDetails.startValue + (propertyDetails.endValue - propertyDetails.startValue) * progressRatio;
              }

              // Optimization: skip if value hasn't changed (unless it's the first frame for non-forced changes)
              if (!prevTimestamp && interpolatedValue === propertyDetails.currentValue) {
                continue;
              }

              propertyDetails.currentValue = interpolatedValue;

              // Handle root property values for hooks
              if (MotionEngine.CSS.PropertyHooks.registered[propertyName]) {
                const rootProperty = MotionEngine.CSS.PropertyHooks.getRoot(propertyName);
                const cachedRootValue = getElementData(currentElement).rootPropertyValueCache[rootProperty];
                cachedRootValue && (propertyDetails.rootPropertyValue = cachedRootValue);
              }

              const setValueResult = MotionEngine.CSS.setElementValue(currentElement, propertyName, propertyDetails.currentValue + (0 === parseFloat(interpolatedValue) ? "" : propertyDetails.unitType), propertyDetails.rootPropertyValue, propertyDetails.scrollData);

              // Update root property cache after setting value
              if (MotionEngine.CSS.PropertyHooks.registered[propertyName]) {
                const rootProperty = MotionEngine.CSS.PropertyHooks.getRoot(propertyName);
                getElementData(currentElement).rootPropertyValueCache[rootProperty] = MotionEngine.CSS.PropertyNormalizations.registered[rootProperty] ? MotionEngine.CSS.PropertyNormalizations.registered[rootProperty]("extract", null, setValueResult[1]) : setValueResult[1];
              }

              if ("transform" === setValueResult[0]) {
                transformFlag = true;
              }
            }
          }

          // Apply mobile hardware acceleration if enabled and transform cache needs flushing
          if (animationOptions.mobileHA && getElementData(currentElement).transformCache.translate3d === undefinedValue) {
            getElementData(currentElement).transformCache.translate3d = "(0px, 0px, 0px)";
            transformFlag = true;
          }
          if (transformFlag) {
            MotionEngine.CSS.flushTransformCache(currentElement);
          }
        }

        // Reset display/visibility options once animation starts if they were set
        if (animationOptions.display !== undefinedValue && "none" !== animationOptions.display) {
          MotionEngine.animationState.activeCalls[i][2].display = false;
        }
        if (animationOptions.visibility !== undefinedValue && "hidden" !== animationOptions.visibility) {
          MotionEngine.animationState.activeCalls[i][2].visibility = false;
        }

        // Call progress callback
        if (animationOptions.progress) {
          animationOptions.progress.call(animationTarget, animationTarget, progressRatio, Math.max(0, initialTimestamp + animationOptions.animationDuration - frameStartTime), initialTimestamp);
        }

        // Handle animation completion
        if (progressRatio === 1) {
          completeAnimation(i);
        }
        i++;
      }

      // Request next animation frame
      MotionEngine.animationState.isTicking && requestAnimFrame(animateFrame);
    }

    function completeAnimation(callIndex, forceCompletion) {
      if (!MotionEngine.animationState.activeCalls[callIndex]) {
        return false;
      }

      const [elementsToAnimate, animationTarget, animationOptions, initialTimestamp, promiseResolver] = MotionEngine.animationState.activeCalls[callIndex];
      let hasMoreActiveCalls = false;

      for (let i = 0; i < elementsToAnimate.length; i++) {
        const currentElement = elementsToAnimate[i].element;

        if (forceCompletion || animationOptions.loop || ("none" === animationOptions.display && MotionEngine.CSS.setElementValue(currentElement, "display", animationOptions.display), "hidden" === animationOptions.visibility && MotionEngine.CSS.setElementValue(currentElement, "visibility", animationOptions.visibility)));

        // Clean up element data if not looping and no more items in queue
        if (animationOptions.loop !== true && (localJQuery.queue(currentElement)[1] === undefinedValue || !/\.velocityQueueEntryFlag/i.test(localJQuery.queue(currentElement)[1])) && getElementData(currentElement)) {
          getElementData(currentElement).isAnimating = false;
          getElementData(currentElement).rootPropertyValueCache = {};

          let transformCacheNeedsFlush = false;
          localJQuery.each(MotionEngine.CSS.PropertyLists.transforms3D, function(idx, prop) {
            const defaultValue = /^scale/.test(prop) ? 1 : 0;
            const cachedValue = getElementData(currentElement).transformCache[prop];
            if (cachedValue !== undefinedValue && new RegExp("^\\(" + defaultValue + "[^.]").test(cachedValue)) {
              transformCacheNeedsFlush = true;
              delete getElementData(currentElement).transformCache[prop];
            }
          });
          if (animationOptions.mobileHA) {
            transformCacheNeedsFlush = true;
            delete getElementData(currentElement).transformCache.translate3d;
          }
          if (transformCacheNeedsFlush) {
            MotionEngine.CSS.flushTransformCache(currentElement);
          }
          MotionEngine.CSS.Values.removeClass(currentElement, "motion-animating");
        }

        // Call complete callback (only once for the entire animation group)
        if (!forceCompletion && animationOptions.complete && !animationOptions.loop && i === elementsToAnimate.length - 1) {
          try {
            animationOptions.complete.call(animationTarget, animationTarget);
          } catch (e) {
            setTimeout(function() {
              throw e;
            }, 1); // Ensure error is thrown asynchronously
          }
        }

        // Handle loop
        if (promiseResolver && animationOptions.loop !== true && promiseResolver(animationTarget));
        if (animationOptions.loop === true && !forceCompletion) {
          localJQuery.each(getElementData(currentElement).tweensContainer, function(propName, tweenDetails) {
            if (/^rotate/.test(propName) && 360 === parseFloat(tweenDetails.endValue)) {
              tweenDetails.endValue = 0;
              tweenDetails.startValue = 360;
            }
          });
          animate(currentElement, "reverse", {
            loop: true,
            delay: animationOptions.delay
          });
        }

        // Dequeue next animation if not looping
        if (animationOptions.queue !== false) {
          localJQuery.dequeue(currentElement, animationOptions.queue);
        }
      }

      MotionEngine.animationState.activeCalls[callIndex] = false;

      for (let j = 0; j < MotionEngine.animationState.activeCalls.length; j++) {
        if (MotionEngine.animationState.activeCalls[j] !== false) {
          hasMoreActiveCalls = true;
          break;
        }
      }
      if (hasMoreActiveCalls === false) {
        MotionEngine.animationState.isTicking = false;
        delete MotionEngine.animationState.activeCalls;
        MotionEngine.animationState.activeCalls = [];
      }
    }

    const browserIEVersion = (function() {
      if (globalDocument.documentMode) {
        return globalDocument.documentMode;
      }
      for (let i = 7; i > 4; i--) {
        const testDiv = globalDocument.createElement("div");
        testDiv.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";
        if (testDiv.getElementsByTagName("span").length) {
          testDiv.remove(); // Clean up the element
          return i;
        }
      }
      return undefinedValue;
    })();

    const requestAnimFrame = (function() {
      let lastTime = 0;
      return globalWindow.webkitRequestAnimationFrame || globalWindow.mozRequestAnimationFrame || function(callback) {
        const currentTime = (new Date()).getTime();
        let timeToCall = Math.max(0, 16 - (currentTime - lastTime));
        lastTime = currentTime + timeToCall;
        return setTimeout(function() {
          callback(currentTime + timeToCall);
        }, timeToCall);
      };
    })();

    const motionUtils = {
      isString: function(val) {
        return typeof val === "string";
      },
      isArray: Array.isArray || function(val) {
        return Object.prototype.toString.call(val) === "[object Array]";
      },
      isFunction: function(val) {
        return Object.prototype.toString.call(val) === "[object Function]";
      },
      isNode: function(val) {
        return val && val.nodeType;
      },
      isNodeList: function(val) {
        return "object" === typeof val && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(val)) && val.length !== undefinedValue && (0 === val.length || ("object" === typeof val[0] && val[0].nodeType > 0));
      },
      isWrapped: function(val) {
        return val && (val.jquery || (globalWindow.Zepto && globalWindow.Zepto.zepto.isZ(val)));
      },
      isSVG: function(val) {
        return globalWindow.SVGElement && val instanceof globalWindow.SVGElement;
      },
      isEmptyObject: function(obj) {
        for (let key in obj) {
          return false;
        }
        return true;
      }
    };

    let _jq = localJQuery; // Local alias for jQuery
    let isJQueryIntegrated = false;

    if (localJQuery.fn && localJQuery.fn.jquery) {
      _jq = localJQuery;
      isJQueryIntegrated = true;
    } else {
      _jq = globalWindow.MotionEngine.Utilities;
    }

    if (browserIEVersion <= 8 && !isJQueryIntegrated) {
      throw new Error("MotionEngine: IE8 and below require jQuery to be loaded before MotionEngine.");
    }

    if (browserIEVersion <= 7) {
      return void(localJQuery.fn.motionAnimate = localJQuery.fn.animate); // Fallback for very old IE
    }

    const defaultAnimationDuration = 400;
    const defaultCurveTransform = "swing";

    const MotionEngine = {
      animationState: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
        isChrome: globalWindow.chrome,
        isFirefox: /Firefox/i.test(navigator.userAgent),
        prefixElement: globalDocument.createElement("div"),
        prefixCache: {},
        scrollAnchor: null,
        scrollPropLeft: null,
        scrollPropTop: null,
        isTicking: false,
        activeCalls: []
      },
      CSS: {},
      Utilities: _jq,
      Redirects: {},
      curveTransforms: {},
      Promise: globalWindow.Promise,
      defaultSettings: {
        queue: "",
        animationDuration: defaultAnimationDuration,
        curveTransform: defaultCurveTransform,
        onBegin: undefinedValue,
        onComplete: undefinedValue,
        onProgress: undefinedValue,
        display: undefinedValue,
        visibility: undefinedValue,
        loop: false,
        delay: false,
        mobileHA: true,
        _cacheValues: true
      },
      initializeElement: function(element) {
        _jq.data(element, "motionEngine", {
          isSVG: motionUtils.isSVG(element),
          isAnimating: false,
          computedStyle: null,
          tweensContainer: null,
          rootPropertyValueCache: {},
          transformCache: {}
        });
      },
      hookProperty: null,
      mockMode: false,
      version: {
        major: 1,
        minor: 1,
        patch: 0
      },
      debug: false
    };

    // Determine scroll anchor and properties
    if (globalWindow.pageYOffset !== undefinedValue) {
      MotionEngine.animationState.scrollAnchor = globalWindow;
      MotionEngine.animationState.scrollPropLeft = "pageXOffset";
      MotionEngine.animationState.scrollPropTop = "pageYOffset";
    } else {
      MotionEngine.animationState.scrollAnchor = globalDocument.documentElement || globalDocument.body.parentNode || globalDocument.body;
      MotionEngine.animationState.scrollPropLeft = "scrollLeft";
      MotionEngine.animationState.scrollPropTop = "scrollTop";
    }

    // Spring physics function (re-implementation of Velocity's spring)
    const buildSpringPhysics = (function() {
      function calculateAcceleration(state) {
        return -state.tension * state.x - state.friction * state.v;
      }

      function integrateState(current, stepSize, delta) {
        const nextState = {
          x: current.x + delta.dx * stepSize,
          v: current.v + delta.dv * stepSize,
          tension: current.tension,
          friction: current.friction
        };
        return {
          dx: nextState.v,
          dv: calculateAcceleration(nextState)
        };
      }

      function rungeKuttaStep(currentState, stepSize) {
        const k1 = {
          dx: currentState.v,
          dv: calculateAcceleration(currentState)
        };
        const k2 = integrateState(currentState, 0.5 * stepSize, k1);
        const k3 = integrateState(currentState, 0.5 * stepSize, k2);
        const k4 = integrateState(currentState, stepSize, k3);

        const dx = (1 / 6) * (k1.dx + 2 * (k2.dx + k3.dx) + k4.dx);
        const dv = (1 / 6) * (k1.dv + 2 * (k2.dv + k3.dv) + k4.dv);

        currentState.x += dx * stepSize;
        currentState.v += dv * stepSize;
        return currentState;
      }

      return function(tension, friction, duration) {
        const state = {
          x: -1,
          v: 0,
          tension: null,
          friction: null
        };
        const positionHistory = [0];
        let simulationTime = 0;
        const minimumDisplacement = 1e-4;
        const frameInterval = 0.016; // Approximately 60fps

        let isDurationDefined = duration !== null;
        let stepSize;
        let springSolution;

        tension = parseFloat(tension) || 500;
        friction = parseFloat(friction) || 20;

        state.tension = tension;
        state.friction = friction;

        if (isDurationDefined) {
          simulationTime = buildSpringPhysics(tension, friction);
          stepSize = simulationTime / duration * frameInterval;
        } else {
          stepSize = frameInterval;
        }

        while (true) {
          springSolution = rungeKuttaStep(springSolution || state, stepSize);
          positionHistory.push(1 + springSolution.x);
          simulationTime += 16; // Increment by 16ms (for 60fps)

          if (!(Math.abs(springSolution.x) > minimumDisplacement && Math.abs(springSolution.v) > minimumDisplacement)) {
            break;
          }
        }

        return isDurationDefined ? function(progress) {
          return positionHistory[progress * (positionHistory.length - 1) | 0];
        } : simulationTime;
      };
    })();

    // Standard easing functions
    MotionEngine.curveTransforms = _jq.extend(MotionEngine.curveTransforms, {
      linear: function(progress) {
        return progress;
      },
      swing: function(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      },
      spring: function(progress) {
        return 1 - Math.cos(4.5 * progress * Math.PI) * Math.exp(6 * -progress);
      }
    });

    // Add CSS cubic-bezier curves
    _jq.each([
      ["ease", [.25, .1, .25, 1]],
      ["ease-in", [.42, 0, 1, 1]],
      ["ease-out", [0, 0, .58, 1]],
      ["ease-in-out", [.42, 0, .58, 1]],
      ["easeInSine", [.47, 0, .745, .715]],
      ["easeOutSine", [.39, .575, .565, 1]],
      ["easeInOutSine", [.445, .05, .55, .95]],
      ["easeInQuad", [.55, .085, .68, .53]],
      ["easeOutQuad", [.25, .46, .45, .94]],
      ["easeInOutQuad", [.455, .03, .515, .955]],
      ["easeInCubic", [.55, .055, .675, .19]],
      ["easeOutCubic", [.215, .61, .355, 1]],
      ["easeInOutCubic", [.645, .045, .355, 1]],
      ["easeInQuart", [.895, .03, .685, .22]],
      ["easeOutQuart", [.165, .84, .44, 1]],
      ["easeInOutQuart", [.77, 0, .175, 1]],
      ["easeInQuint", [.755, .05, .855, .06]],
      ["easeOutQuint", [.23, 1, .32, 1]],
      ["easeInOutQuint", [.86, 0, .07, 1]],
      ["easeInExpo", [.95, .05, .795, .035]],
      ["easeOutExpo", [.19, 1, .22, 1]],
      ["easeInOutExpo", [1, 0, 0, 1]],
      ["easeInCirc", [.6, .04, .98, .335]],
      ["easeOutCirc", [.075, .82, .165, 1]],
      ["easeInOutCirc", [.785, .135, .15, .86]]
    ], function(idx, curveDefinition) {
      MotionEngine.curveTransforms[curveDefinition[0]] = generateBezierCurve.apply(null, curveDefinition[1]);
    });

    const CSS = MotionEngine.CSS = {
      Regex: {
        isHexColor: /^#([A-f\d]{3}){1,2}$/i,
        valueExtract: /^[A-z]+\((.*)\)$/i,
        extractedValueCheck: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
        valueSplitter: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
      },
      PropertyLists: {
        colorProps: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
        baseTransforms: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
        threeDTransforms: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"]
      },
      PropertyHooks: {
        templates: {
          textShadow: ["Color X Y Blur", "black 0px 0px 0px"],
          boxShadow: ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
          clip: ["Top Right Bottom Left", "0px 0px 0px 0px"],
          backgroundPosition: ["X Y", "0% 0%"],
          transformOrigin: ["X Y Z", "50% 50% 0px"],
          perspectiveOrigin: ["X Y", "50% 50%"]
        },
        registered: {},
        registerHooks: function() {
          // Register color hooks
          for (let i = 0; i < CSS.PropertyLists.colorProps.length; i++) {
            const propName = CSS.PropertyLists.colorProps[i];
            const defaultColor = "color" === propName ? "0 0 0 1" : "255 255 255 1";
            CSS.PropertyHooks.templates[propName] = ["Red Green Blue Alpha", defaultColor];
          }

          // Adjust color hook templates for older IE
          if (browserIEVersion) {
            for (let prop in CSS.PropertyHooks.templates) {
              const template = CSS.PropertyHooks.templates[prop];
              let components = template[0].split(" ");
              const defaultValues = template[1].match(CSS.Regex.valueSplitter);
              if ("Color" === components[0]) {
                components.push(components.shift());
                defaultValues.push(defaultValues.shift());
                CSS.PropertyHooks.templates[prop] = [components.join(" "), defaultValues.join(" ")];
              }
            }
          }

          // Register individual hooks
          for (let prop in CSS.PropertyHooks.templates) {
            const template = CSS.PropertyHooks.templates[prop];
            const components = template[0].split(" ");
            for (let i = 0; i < components.length; i++) {
              const hookName = prop + components[i];
              CSS.PropertyHooks.registered[hookName] = [prop, i];
            }
          }
        },
        getRoot: function(hookName) {
          const hook = CSS.PropertyHooks.registered[hookName];
          return hook ? hook[0] : hookName;
        },
        cleanRootValue: function(rootProp, value) {
          if (CSS.Regex.valueExtract.test(value)) {
            value = value.match(CSS.Regex.valueExtract)[1];
          }
          if (CSS.Values.isCSSNull(value)) {
            value = CSS.PropertyHooks.templates[rootProp][1];
          }
          return value;
        },
        extractHookValue: function(hookName, value) {
          const hook = CSS.PropertyHooks.registered[hookName];
          if (hook) {
            const rootProp = hook[0];
            const componentIndex = hook[1];
            value = CSS.PropertyHooks.cleanRootValue(rootProp, value);
            return value.toString().match(CSS.Regex.valueSplitter)[componentIndex];
          }
          return value;
        },
        injectHookValue: function(hookName, componentValue, rootValue) {
          const hook = CSS.PropertyHooks.registered[hookName];
          if (hook) {
            const rootProp = hook[0];
            const componentIndex = hook[1];
            rootValue = CSS.PropertyHooks.cleanRootValue(rootProp, rootValue);
            const values = rootValue.toString().match(CSS.Regex.valueSplitter);
            values[componentIndex] = componentValue;
            return values.join(" ");
          }
          return rootValue;
        }
      },
      PropertyNormalizations: {
        registered: {
          clip: function(mode, element, value) {
            switch (mode) {
              case "name":
                return "clip";
              case "extract":
                let extracted;
                if (CSS.Regex.extractedValueCheck.test(value)) {
                  extracted = value;
                } else {
                  extracted = value.toString().match(CSS.Regex.valueExtract);
                  extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : value;
                }
                return extracted;
              case "inject":
                return "rect(" + value + ")";
            }
          },
          blur: function(mode, element, value) {
            switch (mode) {
              case "name":
                return "-webkit-filter";
              case "extract":
                let parsedValue = parseFloat(value);
                if (!parsedValue && parsedValue !== 0) {
                  const match = value.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                  parsedValue = match ? match[1] : 0;
                }
                return parsedValue;
              case "inject":
                return parseFloat(value) ? "blur(" + value + ")" : "none";
            }
          },
          opacity: function(mode, element, value) {
            if (browserIEVersion <= 8) {
              switch (mode) {
                case "name":
                  return "filter";
                case "extract":
                  const match = value.toString().match(/alpha\(opacity=(.*)\)/i);
                  return match ? match[1] / 100 : 1;
                case "inject":
                  element.style.zoom = 1; // Trigger hasLayout
                  return parseFloat(value) >= 1 ? "" : "alpha(opacity=" + parseInt(100 * parseFloat(value), 10) + ")";
              }
            } else {
              switch (mode) {
                case "name":
                  return "opacity";
                case "extract":
                  return value;
                case "inject":
                  return value;
              }
            }
          }
        },
        registerNormalizations: function() {
          // Add 3D transforms if not IE9 or Gingerbread
          if (browserIEVersion > 9 || !MotionEngine.animationState.isGingerbread) {
            CSS.PropertyLists.baseTransforms = CSS.PropertyLists.baseTransforms.concat(CSS.PropertyLists.threeDTransforms);
          }

          // Register transform properties
          for (let i = 0; i < CSS.PropertyLists.baseTransforms.length; i++) {
            (function() {
              const prop = CSS.PropertyLists.baseTransforms[i];
              CSS.PropertyNormalizations.registered[prop] = function(mode, element, value) {
                switch (mode) {
                  case "name":
                    return "transform";
                  case "extract":
                    return getElementData(element) === undefinedValue || getElementData(element).transformCache[prop] === undefinedValue ? (/^scale/i.test(prop) ? 1 : 0) : getElementData(element).transformCache[prop].replace(/[()]/g, "");
                  case "inject":
                    let needsUnit = false;
                    const propBase = prop.substr(0, prop.length - 1); // e.g. 'translate' from 'translateX'
                    switch (propBase) {
                      case "translate":
                        needsUnit = !/(%|px|em|rem|vw|vh|\d)$/i.test(value);
                        break;
                      case "scal": // 'scal' for scale, scaleX, scaleY, scaleZ
                      case "scale":
                        if (MotionEngine.animationState.isAndroid && getElementData(element).transformCache[prop] === undefinedValue && value < 1) {
                          value = 1; // Fix for Android scaling issues
                        }
                        needsUnit = !/(\d)$/i.test(value);
                        break;
                      case "skew":
                      case "rotate":
                        needsUnit = !/(deg|\d)$/i.test(value);
                        break;
                    }
                    if (needsUnit) {
                      // Add default unit if missing for transform properties
                      if (/^rotate/i.test(prop)) {
                        value += "deg";
                      } else if (/^skew/i.test(prop)) {
                        value += "deg";
                      } else if (/^translate/i.test(prop)) {
                        value += "px";
                      }
                    }
                    getElementData(element).transformCache[prop] = "(" + value + ")";
                    return getElementData(element).transformCache[prop];
                }
              };
            })();
          }

          // Register color properties
          for (let i = 0; i < CSS.PropertyLists.colorProps.length; i++) {
            (function() {
              const prop = CSS.PropertyLists.colorProps[i];
              CSS.PropertyNormalizations.registered[prop] = function(mode, element, value) {
                switch (mode) {
                  case "name":
                    return prop;
                  case "extract":
                    let extractedValue;
                    if (CSS.Regex.extractedValueCheck.test(value)) {
                      extractedValue = value;
                    } else {
                      let colorMap = {
                        black: "rgb(0, 0, 0)",
                        blue: "rgb(0, 0, 255)",
                        gray: "rgb(128, 128, 128)",
                        green: "rgb(0, 128, 0)",
                        red: "rgb(255, 0, 0)",
                        white: "rgb(255, 255, 255)"
                      };
                      let colorString;
                      if (/^[A-z]+$/i.test(value)) {
                        colorString = colorMap[value] !== undefinedValue ? colorMap[value] : colorMap.black;
                      } else if (CSS.Regex.isHexColor.test(value)) {
                        colorString = "rgb(" + CSS.Values.hexToRgb(value).join(" ") + ")";
                      } else if (!/^rgba?\(/i.test(value)) {
                        colorString = colorMap.black; // Default to black for unrecognized color strings
                      }
                      extractedValue = (colorString || value).toString().match(CSS.Regex.valueExtract)[1].replace(/,(\s+)?/g, " ");
                    }
                    // Add alpha channel for IE <= 8 if missing
                    if (browserIEVersion <= 8 || extractedValue.split(" ").length !== 3) {
                      extractedValue += " 1";
                    }
                    return extractedValue;
                  case "inject":
                    // Remove alpha channel for IE <= 8 if present
                    if (browserIEVersion <= 8 && value.split(" ").length === 4) {
                      value = value.split(/\s+/).slice(0, 3).join(" ");
                    }
                    // Add alpha channel if missing for modern browsers
                    if (browserIEVersion > 8 && value.split(" ").length === 3) {
                      value += " 1";
                    }
                    return (browserIEVersion <= 8 ? "rgb" : "rgba") + "(" + value.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
                }
              };
            })();
          }
        }
      },
      PropertyNames: {
        camelCase: function(prop) {
          return prop.replace(/-(\w)/g, function(match, char) {
            return char.toUpperCase();
          });
        },
        SVGAttribute: function(prop) {
          const svgProps = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
          if (browserIEVersion || (MotionEngine.animationState.isAndroid && !MotionEngine.animationState.isChrome)) {
            return new RegExp("^(" + svgProps + "|transform)$", "i").test(prop); // Add transform for older browsers/Android
          }
          return new RegExp("^(" + svgProps + ")$", "i").test(prop);
        },
        prefixCheck: function(prop) {
          if (MotionEngine.animationState.prefixCache[prop]) {
            return [MotionEngine.animationState.prefixCache[prop], true];
          }
          const prefixes = ["", "Webkit", "Moz", "ms", "O"];
          for (let i = 0; i < prefixes.length; i++) {
            const prefixedProp = (i === 0) ? prop : prefixes[i] + prop.replace(/^\w/, function(char) {
              return char.toUpperCase();
            });
            if (motionUtils.isString(MotionEngine.animationState.prefixElement.style[prefixedProp])) {
              MotionEngine.animationState.prefixCache[prop] = prefixedProp;
              return [prefixedProp, true];
            }
          }
          return [prop, false];
        }
      },
      Values: {
        hexToRgb: function(hex) {
          const shortHex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
          const longHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
          let match;
          hex = hex.replace(shortHex, function(m, r, g, b) {
            return r + r + g + g + b + b;
          });
          match = longHex.exec(hex);
          return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : [0, 0, 0];
        },
        isCSSNull: function(val) {
          return val == 0 || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(val);
        },
        getUnit: function(prop) {
          return /^(rotate|skew)/i.test(prop) ? "deg" : (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(prop) ? "" : "px");
        },
        getDisplayType: function(element) {
          const tagName = element && element.tagName.toString().toLowerCase();
          if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
            return "inline";
          }
          if (/^(li)$/i.test(tagName)) {
            return "list-item";
          }
          if (/^(tr)$/i.test(tagName)) {
            return "table-row";
          }
          return "block";
        },
        addClass: function(element, className) {
          if (element.classList) {
            element.classList.add(className);
          } else {
            element.className += (element.className.length ? " " : "") + className;
          }
        },
        removeClass: function(element, className) {
          if (element.classList) {
            element.classList.remove(className);
          } else {
            element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
          }
        }
      },
      getElementValue: function(element, property, rootValue, forceAbsolute) {
        function getRawStyleValue(elem, prop) {
          let value = 0;
          let tempDisplay = false;

          if (browserIEVersion <= 8) {
            value = _jq.css(elem, prop);
          } else {
            // Temporarily set display to block for width/height calculation if none
            if ((/^(width|height)$/.test(prop)) && CSS.getElementValue(elem, "display") === "none") {
              tempDisplay = true;
              CSS.setElementValue(elem, "display", CSS.Values.getDisplayType(elem));
            }

            if (!forceAbsolute) {
              if ("height" === prop && "border-box" !== CSS.getElementValue(elem, "boxSizing").toString().toLowerCase()) {
                const height = elem.offsetHeight - (parseFloat(CSS.getElementValue(elem, "borderTopWidth")) || 0) - (parseFloat(CSS.getElementValue(elem, "borderBottomWidth")) || 0) - (parseFloat(CSS.getElementValue(elem, "paddingTop")) || 0) - (parseFloat(CSS.getElementValue(elem, "paddingBottom")) || 0);
                tempDisplay && CSS.setElementValue(elem, "display", "none");
                return height;
              }
              if ("width" === prop && "border-box" !== CSS.getElementValue(elem, "boxSizing").toString().toLowerCase()) {
                const width = elem.offsetWidth - (parseFloat(CSS.getElementValue(elem, "borderLeftWidth")) || 0) - (parseFloat(CSS.getElementValue(elem, "borderRightWidth")) || 0) - (parseFloat(CSS.getElementValue(elem, "paddingLeft")) || 0) - (parseFloat(CSS.getElementValue(elem, "paddingRight")) || 0);
                tempDisplay && CSS.setElementValue(elem, "display", "none");
                return width;
              }
            }

            let computedStyle;
            computedStyle = getElementData(elem) === undefinedValue ? globalWindow.getComputedStyle(elem, null) : (getElementData(elem).computedStyle ? getElementData(elem).computedStyle : (getElementData(elem).computedStyle = globalWindow.getComputedStyle(elem, null)));

            if ((browserIEVersion || MotionEngine.animationState.isFirefox) && "borderColor" === prop) {
              prop = "borderTopColor"; // Fallback for Firefox/IE border color
            }
            value = (browserIEVersion === 9 && "filter" === prop) ? computedStyle.getPropertyValue(prop) : computedStyle[prop];

            if (value === "" || value === null) {
              value = elem.style[prop]; // Direct style access if computed is empty
            }
            tempDisplay && CSS.setElementValue(elem, "display", "none");
          }

          if ("auto" === value && /^(top|right|bottom|left)$/i.test(prop)) {
            const positionType = getRawStyleValue(elem, "position");
            if ("fixed" === positionType || ("absolute" === positionType && /top|left/i.test(prop))) {
              value = _jq(elem).position()[prop] + "px";
            }
          }
          return value;
        }

        let resolvedValue;
        if (CSS.PropertyHooks.registered[property]) {
          const hookProperty = property;
          const rootProperty = CSS.PropertyHooks.getRoot(hookProperty);
          rootValue = rootValue === undefinedValue ? CSS.getElementValue(element, CSS.PropertyNames.prefixCheck(rootProperty)[0]) : rootValue;
          if (CSS.PropertyNormalizations.registered[rootProperty]) {
            rootValue = CSS.PropertyNormalizations.registered[rootProperty]("extract", element, rootValue);
          }
          resolvedValue = CSS.PropertyHooks.extractHookValue(hookProperty, rootValue);
        } else if (CSS.PropertyNormalizations.registered[property]) {
          const normalizedProp = CSS.PropertyNormalizations.registered[property]("name", element);
          let rawValue;
          if ("transform" !== normalizedProp) {
            rawValue = getRawStyleValue(element, CSS.PropertyNames.prefixCheck(normalizedProp)[0]);
            if (CSS.Values.isCSSNull(rawValue) && CSS.PropertyHooks.templates[property]) {
              rawValue = CSS.PropertyHooks.templates[property][1];
            }
          }
          resolvedValue = CSS.PropertyNormalizations.registered[property]("extract", element, rawValue);
        } else {
          resolvedValue = /^[\d-]/.test(property) ? property : (getElementData(element) && getElementData(element).isSVG && CSS.PropertyNames.SVGAttribute(property) ? (/^(height|width)$/i.test(property) ? element.getBBox()[property] : element.getAttribute(property)) : getRawStyleValue(element, CSS.PropertyNames.prefixCheck(property)[0]));
        }

        if (CSS.Values.isCSSNull(resolvedValue)) {
          resolvedValue = 0;
        }

        if (MotionEngine.debug >= 2) {
          console.log("Get property '" + property + "': " + resolvedValue);
        }
        return resolvedValue;
      },
      setElementValue: function(element, property, value, rootValue, scrollData) {
        let actualProperty = property;
        if ("scroll" === property) {
          if (scrollData.container) {
            scrollData.container["scroll" + scrollData.direction] = value;
          } else {
            if ("Left" === scrollData.direction) {
              globalWindow.scrollTo(value, scrollData.alternateValue);
            } else {
              globalWindow.scrollTo(scrollData.alternateValue, value);
            }
          }
        } else if (CSS.PropertyNormalizations.registered[property] && "transform" === CSS.PropertyNormalizations.registered[property]("name", element)) {
          CSS.PropertyNormalizations.registered[property]("inject", element, value);
          actualProperty = "transform";
          value = getElementData(element).transformCache[property];
        } else {
          if (CSS.PropertyHooks.registered[property]) {
            const hookProperty = property;
            const rootProperty = CSS.PropertyHooks.getRoot(property);
            rootValue = rootValue || CSS.getElementValue(element, rootProperty);
            value = CSS.PropertyHooks.injectHookValue(hookProperty, value, rootValue);
            property = rootProperty;
          }
          if (CSS.PropertyNormalizations.registered[property]) {
            value = CSS.PropertyNormalizations.registered[property]("inject", element, value);
            property = CSS.PropertyNormalizations.registered[property]("name", element);
          }

          actualProperty = CSS.PropertyNames.prefixCheck(property)[0];
          if (browserIEVersion <= 8) {
            try {
              element.style[actualProperty] = value;
            } catch (e) {
              MotionEngine.debug && console.log("Browser does not support [" + value + "] for [" + actualProperty + "]");
            }
          } else if (getElementData(element) && getElementData(element).isSVG && CSS.PropertyNames.SVGAttribute(property)) {
            element.setAttribute(property, value);
          } else {
            element.style[actualProperty] = value;
          }

          if (MotionEngine.debug >= 2) {
            console.log("Set property '" + property + "' (" + actualProperty + "): " + value);
          }
        }
        return [actualProperty, value];
      },
      flushTransformCache: function(element) {
        function getCachedOrComputedValue(propName) {
          return parseFloat(CSS.getElementValue(element, propName));
        }

        let transformString = "";
        if ((browserIEVersion || (MotionEngine.animationState.isAndroid && !MotionEngine.animationState.isChrome)) && getElementData(element).isSVG) {
          // For SVG, construct transform attribute string
          const svgTransforms = {
            translate: [getCachedOrComputedValue("translateX"), getCachedOrComputedValue("translateY")],
            skewX: [getCachedOrComputedValue("skewX")],
            skewY: [getCachedOrComputedValue("skewY")],
            scale: (getCachedOrComputedValue("scale") !== 1) ? [getCachedOrComputedValue("scale"), getCachedOrComputedValue("scale")] : [getCachedOrComputedValue("scaleX"), getCachedOrComputedValue("scaleY")],
            rotate: [getCachedOrComputedValue("rotateZ"), 0, 0]
          };

          _jq.each(getElementData(element).transformCache, function(prop) {
            let key = prop;
            if (/^translate/i.test(prop)) {
              key = "translate";
            } else if (/^scale/i.test(prop)) {
              key = "scale";
            } else if (/^rotate/i.test(prop)) {
              key = "rotate";
            }
            if (svgTransforms[key]) {
              transformString += key + "(" + svgTransforms[key].join(" ") + ") ";
              delete svgTransforms[key]; // Prevent duplicates
            }
          });
        } else {
          let perspectiveValue;
          _jq.each(getElementData(element).transformCache, function(prop) {
            const cachedValue = getElementData(element).transformCache[prop];
            if ("transformPerspective" === prop) {
              perspectiveValue = cachedValue;
              return true; // continue
            }
            if (browserIEVersion === 9 && "rotateZ" === prop) {
              prop = "rotate"; // IE9 uses 'rotate' for 'rotateZ'
            }
            transformString += prop + cachedValue + " ";
          });
          if (perspectiveValue) {
            transformString = "perspective" + perspectiveValue + " " + transformString;
          }
        }
        CSS.setElementValue(element, "transform", transformString);
      }
    };

    CSS.PropertyHooks.registerHooks();
    CSS.PropertyNormalizations.registerNormalizations();

    MotionEngine.hookProperty = function(elements, property, value) {
      let result = undefinedValue;
      elements = ensureElementArray(elements);
      _jq.each(elements, function(idx, element) {
        if (getElementData(element) === undefinedValue) MotionEngine.initializeElement(element);
        if (value === undefinedValue) {
          result = MotionEngine.CSS.getElementValue(element, property);
        } else {
          const setValueResult = MotionEngine.CSS.setElementValue(element, property, value);
          if ("transform" === setValueResult[0]) {
            MotionEngine.CSS.flushTransformCache(element);
          }
          result = setValueResult;
        }
      });
      return result;
    };

    const animate = function() {
      function startAnimation() {
        return hasPromise ? animationPromise.promise || null : animationPromise.resolver;
      }

      function processAnimationCall() {
        function resolveTweenValue(valueInput, isColor) {
          let resolvedValue = undefinedValue;
          let motionCurve = undefinedValue;
          let targetValue = undefinedValue;

          if (motionUtils.isArray(valueInput)) {
            resolvedValue = valueInput[0];
            if (!motionUtils.isArray(valueInput[1]) && /^[\d-]/.test(valueInput[1]) || motionUtils.isFunction(valueInput[1]) || CSS.Regex.isHexColor.test(valueInput[1])) {
              targetValue = valueInput[1];
            } else if (motionUtils.isString(valueInput[1]) && !CSS.Regex.isHexColor.test(valueInput[1]) || motionUtils.isArray(valueInput[1])) {
              motionCurve = isColor ? valueInput[1] : resolveMotionCurve(valueInput[1], currentOptions.animationDuration);
              if (valueInput[2] !== undefinedValue) {
                targetValue = valueInput[2];
              }
            }
          } else {
            resolvedValue = valueInput;
          }

          if (!isColor) { // Colors handle their own easing within their normalization
            motionCurve = motionCurve || currentOptions.curveTransform;
          }
          if (motionUtils.isFunction(resolvedValue)) {
            resolvedValue = resolvedValue.call(animationTarget, currentElementIndex, totalElements);
          }
          if (motionUtils.isFunction(targetValue)) {
            targetValue = targetValue.call(animationTarget, currentElementIndex, totalElements);
          }

          return [resolvedValue || 0, motionCurve, targetValue];
        }

        function extractUnitType(property, value) {
          let unit = undefinedValue;
          const cleanedValue = (value || "0").toString().toLowerCase().replace(/[%A-z]+$/, function(match) {
            unit = match;
            return "";
          });
          unit = unit || CSS.Values.getUnit(property);
          return [cleanedValue, unit];
        }

        function getUnitConversionRatios() {
          const elementData = getElementData(currentElement);
          const currentPosition = CSS.getElementValue(currentElement, "position");
          const currentFontSize = CSS.getElementValue(currentElement, "fontSize");
          const isParentStatic = currentPosition === lastRatioCache.lastPosition && currentElement.parentNode === lastRatioCache.lastParent;
          const isFontSizeSame = currentFontSize === lastRatioCache.lastFontSize;

          lastRatioCache.lastParent = currentElement.parentNode;
          lastRatioCache.lastPosition = currentPosition;
          lastRatioCache.lastFontSize = currentFontSize;

          const ratios = {};
          if (isFontSizeSame && isParentStatic) {
            ratios.emToPx = lastRatioCache.lastEmToPx;
            ratios.percentToPxWidth = lastRatioCache.lastPercentToPxWidth;
            ratios.percentToPxHeight = lastRatioCache.lastPercentToPxHeight;
          } else {
            const dummyElement = elementData.isSVG ? globalDocument.createElementNS("http://www.w3.org/2000/svg", "rect") : globalDocument.createElement("div");
            MotionEngine.initializeElement(dummyElement);
            currentElement.parentNode.appendChild(dummyElement);

            _jq.each(["overflow", "overflowX", "overflowY"], function(idx, prop) {
              MotionEngine.CSS.setElementValue(dummyElement, prop, "hidden");
            });
            MotionEngine.CSS.setElementValue(dummyElement, "position", currentPosition);
            MotionEngine.CSS.setElementValue(dummyElement, "fontSize", currentFontSize);
            MotionEngine.CSS.setElementValue(dummyElement, "boxSizing", "content-box"); // Ensure consistent box model

            const dummySize = 100;
            _jq.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function(idx, prop) {
              MotionEngine.CSS.setElementValue(dummyElement, prop, dummySize + "%");
            });
            MotionEngine.CSS.setElementValue(dummyElement, "paddingLeft", dummySize + "em");

            ratios.percentToPxWidth = lastRatioCache.lastPercentToPxWidth = (parseFloat(CSS.getElementValue(dummyElement, "width", null, true)) || 1) / dummySize;
            ratios.percentToPxHeight = lastRatioCache.lastPercentToPxHeight = (parseFloat(CSS.getElementValue(dummyElement, "height", null, true)) || 1) / dummySize;
            ratios.emToPx = lastRatioCache.lastEmToPx = (parseFloat(CSS.getElementValue(dummyElement, "paddingLeft")) || 1) / dummySize;

            currentElement.parentNode.removeChild(dummyElement);
          }

          if (lastRatioCache.remToPx === null) {
            lastRatioCache.remToPx = parseFloat(CSS.getElementValue(globalDocument.body, "fontSize")) || 16;
          }
          if (lastRatioCache.vwToPx === null) {
            lastRatioCache.vwToPx = parseFloat(globalWindow.innerWidth) / 100;
            lastRatioCache.vhToPx = parseFloat(globalWindow.innerHeight) / 100;
          }
          ratios.remToPx = lastRatioCache.remToPx;
          ratios.vwToPx = lastRatioCache.vwToPx;
          ratios.vhToPx = lastRatioCache.vhToPx;

          if (MotionEngine.debug >= 1) {
            console.log("Unit ratios: " + JSON.stringify(ratios), currentElement);
          }
          return ratios;
        }

        if (currentOptions.onBegin && currentElementIndex === 0) {
          try {
            currentOptions.onBegin.call(animationTarget, animationTarget);
          } catch (e) {
            setTimeout(function() {
              throw e;
            }, 1);
          }
        }

        const elementTweens = {}; // Stores all property tweens for the current element

        if (animationType === "scroll") {
          const scrollDirection = /^x$/i.test(currentOptions.axis) ? "Left" : "Top";
          const scrollOffset = parseFloat(currentOptions.offset) || 0;
          let currentScrollValue, targetScrollValue, altScrollValue;

          if (currentOptions.container) {
            if (!motionUtils.isWrapped(currentOptions.container) && !motionUtils.isNode(currentOptions.container)) {
              currentOptions.container = null; // Invalid container
            } else {
              currentOptions.container = currentOptions.container[0] || currentOptions.container;
              currentScrollValue = currentOptions.container["scroll" + scrollDirection];
              targetScrollValue = currentScrollValue + _jq(currentElement).position()[scrollDirection.toLowerCase()] + scrollOffset;
            }
          } else {
            currentScrollValue = MotionEngine.animationState.scrollAnchor[MotionEngine.animationState["scrollProp" + scrollDirection]];
            altScrollValue = MotionEngine.animationState.scrollAnchor[MotionEngine.animationState["scrollProp" + ("Left" === scrollDirection ? "Top" : "Left")]];
            targetScrollValue = _jq(currentElement).offset()[scrollDirection.toLowerCase()] + scrollOffset;
          }

          currentAnimationTweens = {
            scroll: {
              rootPropertyValue: false,
              startValue: currentScrollValue,
              currentValue: currentScrollValue,
              endValue: targetScrollValue,
              unitType: "",
              easing: currentOptions.curveTransform,
              scrollData: {
                container: currentOptions.container,
                direction: scrollDirection,
                alternateValue: altScrollValue
              }
            },
            element: currentElement
          };

          if (MotionEngine.debug) {
            console.log("Tweens container (scroll): ", currentAnimationTweens.scroll, currentElement);
          }
        } else if (animationType === "reverse") {
          // Reverse animation: use previous tweens container
          if (!getElementData(currentElement).tweensContainer) {
            return void _jq.dequeue(currentElement, currentOptions.queue);
          }
          if ("none" === getElementData(currentElement).defaultSettings.display) {
            getElementData(currentElement).defaultSettings.display = "auto";
          }
          if ("hidden" === getElementData(currentElement).defaultSettings.visibility) {
            getElementData(currentElement).defaultSettings.visibility = "visible";
          }
          getElementData(currentElement).defaultSettings.loop = false;
          getElementData(currentElement).defaultSettings.onBegin = null;
          getElementData(currentElement).defaultSettings.onComplete = null;

          if (!animationProperties.curveTransform) {
            delete currentOptions.curveTransform;
          }
          if (!animationProperties.animationDuration) {
            delete currentOptions.animationDuration;
          }
          currentOptions = _jq.extend({}, getElementData(currentElement).defaultSettings, currentOptions);

          const reversedTweens = _jq.extend(true, {}, getElementData(currentElement).tweensContainer);
          for (let propName in reversedTweens) {
            if ("element" !== propName) {
              const startVal = reversedTweens[propName].startValue;
              reversedTweens[propName].startValue = reversedTweens[propName].currentValue = reversedTweens[propName].endValue;
              reversedTweens[propName].endValue = startVal;
              if (motionUtils.isEmptyObject(animationProperties)) {
                reversedTweens[propName].easing = currentOptions.curveTransform;
              }
              if (MotionEngine.debug) {
                console.log("Reverse tweens container (" + propName + "): " + JSON.stringify(reversedTweens[propName]), currentElement);
              }
            }
          }
          currentAnimationTweens = reversedTweens;
        } else if (animationType === "start") {
          let cachedTweens;
          if (getElementData(currentElement).tweensContainer && getElementData(currentElement).isAnimating === true) {
            cachedTweens = getElementData(currentElement).tweensContainer;
          }

          // Process color properties first
          _jq.each(animationProperties, function(propName, value) {
            if (new RegExp("^" + CSS.PropertyLists.colorProps.join("$|^") + "$").test(propName)) {
              const [startColor, easeCurve, endColor] = resolveTweenValue(value, true);
              if (CSS.Regex.isHexColor.test(startColor)) {
                const colorComponents = ["Red", "Green", "Blue"];
                const startRgb = CSS.Values.hexToRgb(startColor);
                const endRgb = endColor ? CSS.Values.hexToRgb(endColor) : undefinedValue;
                for (let i = 0; i < colorComponents.length; i++) {
                  const compName = propName + colorComponents[i];
                  const newTweenValues = [startRgb[i]];
                  if (easeCurve) newTweenValues.push(easeCurve);
                  if (endRgb !== undefinedValue) newTweenValues.push(endRgb[i]);
                  animationProperties[compName] = newTweenValues;
                }
                delete animationProperties[propName];
              }
            }
          });

          for (let propName in animationProperties) {
            const [startValue, easeCurve, endValue] = resolveTweenValue(animationProperties[propName]);
            const camelCaseProp = CSS.PropertyNames.camelCase(propName);
            const rootProperty = CSS.PropertyHooks.getRoot(camelCaseProp);
            let rootPropertyValue = false;

            if (getElementData(currentElement).isSVG || CSS.PropertyNames.prefixCheck(rootProperty)[1] !== false || CSS.PropertyNormalizations.registered[rootProperty] !== undefinedValue) {
              // Handle display/visibility for opacity/filter
              if ((currentOptions.display !== undefinedValue && null !== currentOptions.display && "none" !== currentOptions.display || currentOptions.visibility !== undefinedValue && "hidden" !== currentOptions.visibility) && /opacity|filter/.test(camelCaseProp) && !endValue && startValue !== 0) {
                endValue = 0;
              }

              // Get initial value
              if (currentOptions._cacheValues && cachedTweens && cachedTweens[camelCaseProp]) {
                rootPropertyValue = getElementData(currentElement).rootPropertyValueCache[rootProperty];
                if (endValue === undefinedValue) {
                  endValue = cachedTweens[camelCaseProp].endValue + cachedTweens[camelCaseProp].unitType;
                }
              } else if (CSS.PropertyHooks.registered[camelCaseProp]) {
                if (endValue === undefinedValue) {
                  rootPropertyValue = CSS.getElementValue(currentElement, rootProperty);
                  endValue = CSS.getElementValue(currentElement, camelCaseProp, rootPropertyValue);
                } else {
                  rootPropertyValue = CSS.PropertyHooks.templates[rootProperty][1]; // Default root value for hooks
                }
              } else if (endValue === undefinedValue) {
                endValue = CSS.getElementValue(currentElement, camelCaseProp);
              }

              let currentUnit, targetUnit, parsedStart, parsedEnd;
              let hasOperator = false;

              // Extract units and parse values
              [parsedEnd, targetUnit] = extractUnitType(camelCaseProp, endValue);
              const [parsedStartRaw, currentUnitRaw] = extractUnitType(camelCaseProp, startValue);

              // Check for operator in start value (e.g., "+=10px")
              parsedStart = parsedStartRaw.replace(/^([+-\/*])=/, function(match, operator) {
                hasOperator = operator;
                return "";
              });

              parsedEnd = parseFloat(parsedEnd) || 0;
              parsedStart = parseFloat(parsedStart) || 0;

              // Convert percentage values
              if ("%" === targetUnit && (/^(fontSize|lineHeight)$/.test(camelCaseProp) ? (parsedEnd /= 100, targetUnit = "em") : (/^scale/.test(camelCaseProp) ? (parsedEnd /= 100, targetUnit = "") : (/(Red|Green|Blue)$/i.test(camelCaseProp) && (parsedEnd = parsedEnd / 100 * 255, targetUnit = "")))));

              // Resolve units if different
              if (hasOperator) {
                targetUnit = currentUnitRaw;
              } else if (currentUnitRaw !== targetUnit && parsedStart !== 0) {
                if (parsedEnd === 0) {
                  targetUnit = currentUnitRaw;
                } else {
                  // Perform unit conversion
                  const unitRatios = unitConversionCache || getUnitConversionRatios();
                  const axisType = (/margin|padding|left|right|width|text|word|letter/i.test(camelCaseProp) || /X$/.test(camelCaseProp) || "x" === camelCaseProp) ? "x" : "y";

                  switch (currentUnitRaw) {
                    case "%":
                      parsedStart *= ("x" === axisType ? unitRatios.percentToPxWidth : unitRatios.percentToPxHeight);
                      break;
                    case "px":
                      break;
                    default:
                      parsedStart *= unitRatios[currentUnitRaw + "ToPx"];
                  }

                  switch (targetUnit) {
                    case "%":
                      parsedStart *= 1 / ("x" === axisType ? unitRatios.percentToPxWidth : unitRatios.percentToPxHeight);
                      break;
                    case "px":
                      break;
                    default:
                      parsedStart *= 1 / unitRatios[targetUnit + "ToPx"];
                  }
                }
              }

              // Apply operators
              switch (hasOperator) {
                case "+":
                  parsedEnd = parsedStart + parsedEnd;
                  break;
                case "-":
                  parsedEnd = parsedStart - parsedEnd;
                  break;
                case "*":
                  parsedEnd = parsedStart * parsedEnd;
                  break;
                case "/":
                  parsedEnd = parsedStart / parsedEnd;
                  break;
              }

              elementTweens[camelCaseProp] = {
                rootPropertyValue: rootPropertyValue,
                startValue: parsedStart,
                currentValue: parsedStart,
                endValue: parsedEnd,
                unitType: targetUnit,
                easing: easeCurve
              };

              if (MotionEngine.debug) {
                console.log("Tweens container (" + camelCaseProp + "): " + JSON.stringify(elementTweens[camelCaseProp]), currentElement);
              }
            } else if (MotionEngine.debug) {
              console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");
            }
          }
          currentAnimationTweens.element = currentElement;
        }

        if (currentAnimationTweens.element) {
          CSS.Values.addClass(currentElement, "motion-animating");
          animationTweenGroup.push(currentAnimationTweens);

          if ("" === currentOptions.queue) {
            getElementData(currentElement).tweensContainer = currentAnimationTweens;
            getElementData(currentElement).defaultSettings = currentOptions;
          }
          getElementData(currentElement).isAnimating = true;

          if (currentElementIndex === totalElements - 1) {
            if (MotionEngine.animationState.activeCalls.length > 1e4) { // Prevent array from growing too large
              MotionEngine.animationState.activeCalls = filterTruthy(MotionEngine.animationState.activeCalls);
            }
            MotionEngine.animationState.activeCalls.push([animationTweenGroup, animationTarget, currentOptions, null, animationPromise.resolver]);
            if (MotionEngine.animationState.isTicking === false) {
              MotionEngine.animationState.isTicking = true;
              animateFrame();
            }
          } else {
            currentElementIndex++;
          }
        }
      }

      const animationTarget = this;
      let currentOptions = _jq.extend({}, MotionEngine.defaultSettings, animationProperties);
      let currentAnimationTweens = {};

      // Initialize element data if not present
      if (getElementData(animationTarget) === undefinedValue) {
        MotionEngine.initializeElement(animationTarget);
      }

      // Handle delay and queueing
      if (parseFloat(currentOptions.delay) && currentOptions.queue !== false) {
        _jq.queue(animationTarget, currentOptions.queue, function(next) {
          MotionEngine.velocityQueueEntryFlag = true;
          getElementData(animationTarget).delayTimer = {
            setTimeout: setTimeout(next, parseFloat(currentOptions.delay)),
            next: next
          };
        });
      }

      // Resolve duration shorthand
      switch (currentOptions.animationDuration.toString().toLowerCase()) {
        case "fast":
          currentOptions.animationDuration = 200;
          break;
        case "normal":
          currentOptions.animationDuration = defaultAnimationDuration;
          break;
        case "slow":
          currentOptions.animationDuration = 600;
          break;
        default:
          currentOptions.animationDuration = parseFloat(currentOptions.animationDuration) || 1;
      }

      // Mock mode for testing
      if (MotionEngine.mockMode !== false) {
        currentOptions.animationDuration = MotionEngine.mockMode === true ? 1 : (currentOptions.animationDuration * parseFloat(MotionEngine.mockMode) || 1);
        currentOptions.delay = MotionEngine.mockMode === true ? 1 : (currentOptions.delay * parseFloat(MotionEngine.mockMode) || 1);
      }

      currentOptions.curveTransform = resolveMotionCurve(currentOptions.curveTransform, currentOptions.animationDuration);

      // Ensure callbacks are functions
      if (currentOptions.onBegin && !motionUtils.isFunction(currentOptions.onBegin)) currentOptions.onBegin = null;
      if (currentOptions.onProgress && !motionUtils.isFunction(currentOptions.onProgress)) currentOptions.onProgress = null;
      if (currentOptions.onComplete && !motionUtils.isFunction(currentOptions.onComplete)) currentOptions.onComplete = null;

      // Normalize display/visibility values
      if (currentOptions.display !== undefinedValue && null !== currentOptions.display) {
        currentOptions.display = currentOptions.display.toString().toLowerCase();
        if ("auto" === currentOptions.display) {
          currentOptions.display = CSS.Values.getDisplayType(animationTarget);
        }
      }
      if (currentOptions.visibility !== undefinedValue && null !== currentOptions.visibility) {
        currentOptions.visibility = currentOptions.visibility.toString().toLowerCase();
      }

      currentOptions.mobileHA = currentOptions.mobileHA && MotionEngine.animationState.isMobile && !MotionEngine.animationState.isGingerbread;

      // Queue the animation call
      if (currentOptions.queue === false) {
        if (currentOptions.delay) {
          setTimeout(processAnimationCall, currentOptions.delay);
        } else {
          processAnimationCall();
        }
      } else {
        _jq.queue(animationTarget, currentOptions.queue, function(nextInQueue, force) {
          if (force === true) {
            animationPromise.promise && animationPromise.resolver(animationTarget);
            return true;
          }
          MotionEngine.velocityQueueEntryFlag = true;
          void processAnimationCall(nextInQueue);
        });
        if (currentOptions.queue !== "" && currentOptions.queue !== "fx" && localJQuery.queue(animationTarget)[0] !== "inprogress") {
          _jq.dequeue(animationTarget, currentOptions.queue);
        }
      }

      let isWrappedTarget = motionUtils.isWrapped(this);
      let hasPromise, animationProperties, animationPromise, elementsToProcess, currentElementIndex, totalElements;

      if (isWrappedTarget) {
        hasPromise = false;
        currentElementIndex = 0;
        elementsToProcess = this;
        animationTarget = this;
      } else {
        hasPromise = true;
        currentElementIndex = 1;
        elementsToProcess = arguments[0].elements;
        animationTarget = arguments[0];
      }

      elementsToProcess = ensureElementArray(elementsToProcess);

      animationProperties = (hasPromise && arguments[0].properties) ? arguments[0].properties : arguments[currentElementIndex];
      animationProperties = animationProperties || {};
      const optionsArg = (hasPromise && arguments[0].options) ? arguments[0].options : arguments[currentElementIndex + 1];

      totalElements = elementsToProcess.length;

      if ("stop" === animationProperties && !motionUtils.isPlainObject(optionsArg)) {
        let optionsIndex = currentElementIndex + 1;
        const potentialOptions = {};
        for (let i = optionsIndex; i < arguments.length; i++) {
          if (motionUtils.isArray(arguments[i]) || !/^(fast|normal|slow)$/i.test(arguments[i]) && !/^\d/.test(arguments[i])) {
            if (motionUtils.isString(arguments[i]) || motionUtils.isArray(arguments[i])) {
              potentialOptions.curveTransform = arguments[i];
            } else if (motionUtils.isFunction(arguments[i])) {
              potentialOptions.onComplete = arguments[i];
            }
          } else {
            potentialOptions.animationDuration = arguments[i];
          }
        }
        animationProperties = "stop"; // Ensure it's still "stop"
        optionsArg = potentialOptions;
      }

      animationPromise = {
        promise: null,
        resolver: null,
        rejecter: null
      };

      if (hasPromise && MotionEngine.Promise) {
        animationPromise.promise = new MotionEngine.Promise(function(resolve, reject) {
          animationPromise.resolver = resolve;
          animationPromise.rejecter = reject;
        });
      }

      const animationAction = animationProperties;
      switch (animationAction) {
        case "scroll":
          animationType = "scroll";
          break;
        case "reverse":
          animationType = "reverse";
          break;
        case "stop":
          // Stop animation logic
          _jq.each(elementsToProcess, function(idx, element) {
            if (getElementData(element) && getElementData(element).delayTimer) {
              clearTimeout(getElementData(element).delayTimer.setTimeout);
              if (getElementData(element).delayTimer.next) {
                getElementData(element).delayTimer.next(); // Trigger next queue item if exists
              }
              delete getElementData(element).delayTimer;
            }
          });

          const callsToStop = [];
          _jq.each(MotionEngine.animationState.activeCalls, function(callIdx, call) {
            if (call) {
              _jq.each(call[1], function(targetIdx, callTarget) {
                const queueToStop = motionUtils.isString(optionsArg) ? optionsArg : "";
                if (optionsArg !== undefinedValue && call[2].queue !== queueToStop) {
                  return true; // continue to next target
                }
                _jq.each(elementsToProcess, function(elIdx, element) {
                  if (element === callTarget) {
                    if (optionsArg !== undefinedValue) {
                      _jq.each(_jq.queue(element, queueToStop), function(qIdx, qItem) {
                        if (motionUtils.isFunction(qItem)) qItem(null, true);
                      });
                      _jq.queue(element, queueToStop, []); // Clear queue
                    }
                    if (getElementData(element) && "" === queueToStop) {
                      _jq.each(getElementData(element).tweensContainer, function(propName, tweenDetails) {
                        tweenDetails.endValue = tweenDetails.currentValue; // Stop at current value
                      });
                    }
                    callsToStop.push(callIdx);
                  }
                });
              });
            }
          });
          _jq.each(callsToStop, function(idx, callIdx) {
            completeAnimation(callIdx, true);
          });

          animationPromise.promise && animationPromise.resolver(elementsToProcess);
          return startAnimation();

        default:
          if (!_jq.isPlainObject(animationProperties) || motionUtils.isEmptyObject(animationProperties)) {
            if (motionUtils.isString(animationProperties) && MotionEngine.Redirects[animationProperties]) {
              const redirectOptions = _jq.extend({}, optionsArg);
              const originalDuration = redirectOptions.animationDuration;
              const originalDelay = redirectOptions.delay || 0;

              if (redirectOptions.backwards === true) {
                elementsToProcess = _jq.extend(true, [], elementsToProcess).reverse();
              }

              _jq.each(elementsToProcess, function(idx, element) {
                if (parseFloat(redirectOptions.stagger)) {
                  redirectOptions.delay = originalDelay + parseFloat(redirectOptions.stagger) * idx;
                } else if (motionUtils.isFunction(redirectOptions.stagger)) {
                  redirectOptions.delay = originalDelay + redirectOptions.stagger.call(element, idx, totalElements);
                }
                if (redirectOptions.drag) {
                  redirectOptions.animationDuration = parseFloat(originalDuration) || (/^(callout|transition)/.test(animationProperties) ? 1000 : defaultAnimationDuration);
                  redirectOptions.animationDuration = Math.max(redirectOptions.animationDuration * (redirectOptions.backwards ? 1 - idx / totalElements : (idx + 1) / totalElements), 0.75 * redirectOptions.animationDuration, 200);
                }
                MotionEngine.Redirects[animationProperties].call(element, element, redirectOptions || {}, idx, totalElements, elementsToProcess, animationPromise.promise ? animationPromise : undefinedValue);
              });

              return startAnimation();
            }
            const errorMessage = "MotionEngine: First argument (" + animationProperties + ") was not a property map, a known action, or a registered redirect. Aborting.";
            if (animationPromise.promise) {
              animationPromise.rejecter(new Error(errorMessage));
            } else {
              console.log(errorMessage);
            }
            return startAnimation();
          }
          animationType = "start";
      }

      const lastRatioCache = {
        lastParent: null,
        lastPosition: null,
        lastFontSize: null,
        lastPercentToPxWidth: null,
        lastPercentToPxHeight: null,
        lastEmToPx: null,
        remToPx: null,
        vwToPx: null,
        vhToPx: null
      };
      const animationTweenGroup = [];
      let unitConversionCache;

      _jq.each(elementsToProcess, function(idx, element) {
        if (motionUtils.isNode(element)) {
          processAnimationCall.call(element);
        }
      });

      const finalOptions = _jq.extend({}, MotionEngine.defaultSettings, optionsArg);
      finalOptions.loop = parseInt(finalOptions.loop, 10);
      const loopIterations = 2 * finalOptions.loop - 1;

      if (finalOptions.loop) {
        for (let i = 0; i < loopIterations; i++) {
          const loopOptions = {
            delay: finalOptions.delay,
            onProgress: finalOptions.onProgress
          };
          if (i === loopIterations - 1) {
            loopOptions.display = finalOptions.display;
            loopOptions.visibility = finalOptions.visibility;
            loopOptions.onComplete = finalOptions.onComplete;
          }
          animate(elementsToProcess, "reverse", loopOptions);
        }
      }

      return startAnimation();
    };

    MotionEngine = _jq.extend(animate, MotionEngine);
    MotionEngine.animate = animate;

    const requestAnimationFrame = globalWindow.requestAnimationFrame || requestAnimFrame;

    // Handle visibility change to pause/resume animations
    if (!MotionEngine.animationState.isMobile && globalDocument.hidden !== undefinedValue) {
      globalDocument.addEventListener("visibilitychange", function() {
        if (globalDocument.hidden) {
          // Pause animations by replacing requestAnimationFrame with setTimeout
          requestAnimFrame = function(callback) {
            return setTimeout(function() {
              callback(true); // Indicate a forced frame
            }, 16);
          };
          animateFrame(); // Trigger one last frame to catch current state
        } else {
          // Resume animations
          requestAnimFrame = globalWindow.requestAnimationFrame || requestAnimFrame;
          animateFrame(); // Resume animation loop
        }
      });
    }

    globalScope.MotionEngine = MotionEngine;
    if (globalScope !== globalWindow) {
      globalScope.fn.motionAnimate = animate;
      globalScope.fn.motionAnimate.defaultSettings = MotionEngine.defaultSettings;
    }

    _jq.each(["Down", "Up"], function(idx, direction) {
      MotionEngine.Redirects["slide" + direction] = function(element, options, currentIdx, totalIdx, collection, promiseRef) {
        const redirectOptions = _jq.extend({}, options);
        const originalBegin = redirectOptions.onBegin;
        const originalComplete = redirectOptions.onComplete;
        const propertyValues = {
          height: "",
          marginTop: "",
          marginBottom: "",
          paddingTop: "",
          paddingBottom: ""
        };
        const originalStyles = {};

        redirectOptions.display === undefinedValue && (redirectOptions.display = "Down" === direction ? ("inline" === MotionEngine.CSS.Values.getDisplayType(element) ? "inline-block" : "block") : "none");

        redirectOptions.onBegin = function() {
          originalBegin && originalBegin.call(collection, collection);
          for (let prop in propertyValues) {
            originalStyles[prop] = element.style[prop];
            const computedVal = MotionEngine.CSS.getElementValue(element, prop);
            propertyValues[prop] = "Down" === direction ? [computedVal, 0] : [0, computedVal];
          }
          originalStyles.overflow = element.style.overflow;
          element.style.overflow = "hidden"; // Hide overflow during animation
        };

        redirectOptions.onComplete = function() {
          for (let prop in originalStyles) {
            element.style[prop] = originalStyles[prop];
          }
          originalComplete && originalComplete.call(collection, collection);
          promiseRef && promiseRef.resolver(collection);
        };
        animate(element, propertyValues, redirectOptions);
      };
    });

    _jq.each(["In", "Out"], function(idx, direction) {
      MotionEngine.Redirects["fade" + direction] = function(element, options, currentIdx, totalIdx, collection, promiseRef) {
        const redirectOptions = _jq.extend({}, options);
        const targetOpacity = "In" === direction ? 1 : 0;
        const originalComplete = redirectOptions.onComplete;

        redirectOptions.onComplete = currentIdx !== totalIdx - 1 ? (redirectOptions.onBegin = null) : function() {
          originalComplete && originalComplete.call(collection, collection);
          promiseRef && promiseRef.resolver(collection);
        };

        redirectOptions.display === undefinedValue && (redirectOptions.display = "In" === direction ? "auto" : "none");
        animate(this, {
          opacity: targetOpacity
        }, redirectOptions);
      };
    });
  };
}(window.jQuery || window.Zepto || window, window, document));

;
(function(globalWindow, globalDocument, pluginName, undefinedValue) {
  "use strict";

  // Utility functions
  const _utils = {
    // Executes a function after a delay
    deferExecution: function(callback, delay, scope) {
      return setTimeout(_utils.bindContext(callback, scope), delay);
    },

    // Checks if a value is an array, then applies a callback to each item
    processArrayOrValue: function(input, prop, context) {
      if (Array.isArray(input)) {
        _utils.iterateCollection(input, context[prop], context);
        return true;
      }
      return false;
    },

    // Iterates over an array or object, applying a callback
    iterateCollection: function(collection, callback, context) {
      if (!collection) return;
      if (collection.forEach) {
        collection.forEach(callback, context);
      } else if (collection.length !== undefinedValue) {
        for (let i = 0; i < collection.length; i++) {
          callback.call(context, collection[i], i, collection);
        }
      } else {
        for (let key in collection) {
          if (collection.hasOwnProperty(key)) {
            callback.call(context, collection[key], key, collection);
          }
        }
      }
    },

    // Merges properties from source to target, optionally only if not defined in target
    mergeProperties: function(target, source, onlyIfUndefined) {
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (!onlyIfUndefined || (onlyIfUndefined && target[key] === undefinedValue)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    },

    // Merges properties from source to target, only if not defined in target
    assignDefaults: function(target, defaults) {
      return _utils.mergeProperties(target, defaults, true);
    },

    // Executes a function with a given context and arguments
    executeCallback: function(func, args) {
      if (typeof func === "function") {
        return func.apply(args ? args[0] || undefinedValue : undefinedValue, args);
      }
      return func;
    },

    // Provides a default value if the input is undefined
    ensureDefault: function(value, defaultValue) {
      return value === undefinedValue ? defaultValue : value;
    },

    // Adds event listeners
    addDomListeners: function(element, eventList, handler) {
      _utils.iterateCollection(_utils.splitEventString(eventList), function(eventName) {
        element.addEventListener(eventName, handler, false);
      });
    },

    // Removes event listeners
    removeDomListeners: function(element, eventList, handler) {
      _utils.iterateCollection(_utils.splitEventString(eventList), function(eventName) {
        element.removeEventListener(eventName, handler, false);
      });
    },

    // Checks if an element is a descendant of another
    isChildOf: function(child, parent) {
      while (child) {
        if (child === parent) return true;
        child = child.parentNode;
      }
      return false;
    },

    // Checks if a string contains a substring
    stringContains: function(haystack, needle) {
      return haystack.indexOf(needle) > -1;
    },

    // Splits a space-separated string into an array of strings
    splitEventString: function(eventString) {
      return eventString.trim().split(/\s+/g);
    },

    // Finds the index of an item in an array or an object property
    findInCollection: function(collection, item, prop) {
      if (collection.indexOf && !prop) return collection.indexOf(item);
      for (let i = 0; i < collection.length; i++) {
        if ((prop && collection[i][prop] == item) || (!prop && collection[i] === item)) return i;
      }
      return -1;
    },

    // Converts array-like object to a true array
    toArray: function(list) {
      return Array.prototype.slice.call(list, 0);
    },

    // Filters out duplicate items from an array
    removeDuplicates: function(arr, prop, sortResult) {
      const uniqueItems = [];
      const seenValues = [];
      for (let i = 0; i < arr.length; i++) {
        const currentValue = prop ? arr[i][prop] : arr[i];
        if (_utils.findInCollection(seenValues, currentValue) < 0) {
          uniqueItems.push(arr[i]);
        }
        seenValues[i] = currentValue;
      }
      if (sortResult) {
        uniqueItems.sort(function(a, b) {
          return prop ? (a[prop] > b[prop] ? 1 : (a[prop] < b[prop] ? -1 : 0)) : (a > b ? 1 : (a < b ? -1 : 0));
        });
      }
      return uniqueItems;
    },

    // Gets a vendor-prefixed CSS property name
    getVendorPrefixed: function(styleObj, prop) {
      const prefixes = ["", "webkit", "moz", "MS", "ms", "o"];
      const capitalizedProp = prop[0].toUpperCase() + prop.slice(1);
      for (let i = 0; i < prefixes.length; i++) {
        const prefixedName = prefixes[i] ? prefixes[i] + capitalizedProp : prop;
        if (prefixedName in styleObj) return prefixedName;
      }
      return undefinedValue;
    },

    // Generates a unique ID
    generateUniqueId: (function() {
      let counter = 1;
      return function() {
        return counter++;
      };
    })(),

    // Gets the window object for a given element's document
    getWindowForElement: function(element) {
      const ownerDoc = element.ownerDocument;
      return ownerDoc.defaultView || ownerDoc.parentWindow;
    },

    // Binds a function to a specific context
    bindContext: function(func, context) {
      return function() {
        return func.apply(context, arguments);
      };
    }
  };

  // Environment and event detection
  const f_div = globalDocument.createElement("div");
  const isFunction = "function";
  const roundValue = Math.round;
  const absoluteValue = Math.abs;
  const getCurrentTime = Date.now;
  const IS_MOBILE_DEVICE = /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent);
  const HAS_TOUCH_EVENTS = "ontouchstart" in globalWindow;
  const HAS_POINTER_EVENTS = _utils.getVendorPrefixed(globalWindow, "PointerEvent") !== undefinedValue;
  const IS_OLD_ANDROID_TOUCH = HAS_TOUCH_EVENTS && IS_MOBILE_DEVICE;

  // Input types constants
  const INPUT_TYPE_TOUCH = "touch";
  const INPUT_TYPE_PEN = "pen";
  const INPUT_TYPE_MOUSE = "mouse";
  const INPUT_TYPE_KINECT = "kinect"; // Future proofing

  // Event phases constants
  const PHASE_START = 1;
  const PHASE_MOVE = 2;
  const PHASE_END = 4;
  const PHASE_CANCEL = 8;

  // Interval for velocity calculation
  const VELOCITY_CALC_INTERVAL = 25;

  // Directions constants
  const DIRECTION_NONE = 1;
  const DIRECTION_LEFT = 2;
  const DIRECTION_RIGHT = 4;
  const DIRECTION_UP = 8;
  const DIRECTION_DOWN = 16;
  const DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  const DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  const DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

  // Coordinate axes
  const COORDS_XY = ["x", "y"];
  const CLIENT_COORDS = ["clientX", "clientY"];

  /**
   * Base class for handling input streams.
   * @param {Object} gestureManager - The main gesture manager instance.
   * @param {Function} eventCallback - Callback function for input events.
   */
  function BaseInputHandler(gestureManager, eventCallback) {
    this.gestureManager = gestureManager;
    this.eventCallback = eventCallback;
    this.element = gestureManager.element;
    this.targetElement = gestureManager.options.inputTarget;
    this.domEventHandler = _utils.bindContext(function(event) {
      if (_utils.executeCallback(gestureManager.options.enable, [gestureManager])) {
        this.handleEvent(event);
      }
    }, this);
    this.initialize();
  }

  BaseInputHandler.prototype = {
    handleEvent: function() {}, // To be implemented by subclasses
    initialize: function() {
      if (this.elementEvents) _utils.addDomListeners(this.element, this.elementEvents, this.domEventHandler);
      if (this.targetEvents) _utils.addDomListeners(this.targetElement, this.targetEvents, this.domEventHandler);
      if (this.windowEvents) _utils.addDomListeners(_utils.getWindowForElement(this.element), this.windowEvents, this.domEventHandler);
    },
    destroy: function() {
      if (this.elementEvents) _utils.removeDomListeners(this.element, this.elementEvents, this.domEventHandler);
      if (this.targetEvents) _utils.removeDomListeners(this.targetElement, this.targetEvents, this.domEventHandler);
      if (this.windowEvents) _utils.removeDomListeners(_utils.getWindowForElement(this.element), this.windowEvents, this.domEventHandler);
    }
  };

  /**
   * Factory function to create the appropriate input handler.
   * @param {Object} manager - The gesture manager.
   * @returns {BaseInputHandler} - An instance of an input handler.
   */
  function createInputHandler(manager) {
    const InputClass = manager.options.inputClass;
    if (InputClass) {
      return new InputClass(manager, processInputEvent);
    }
    if (HAS_POINTER_EVENTS) {
      return new PointerInputHandler(manager, processInputEvent);
    }
    if (IS_OLD_ANDROID_TOUCH) {
      return new MultiTouchInputHandler(manager, processInputEvent);
    }
    if (HAS_TOUCH_EVENTS) {
      return new SingleTouchInputHandler(manager, processInputEvent);
    }
    return new MouseInputHandler(manager, processInputEvent);
  }

  /**
   * Processes an incoming input event.
   * @param {Object} manager - The gesture manager.
   * @param {number} eventType - The type of event (PHASE_START, PHASE_MOVE, etc.).
   * @param {Object} inputData - Normalized input data.
   */
  function processInputEvent(manager, eventType, inputData) {
    const currentPointers = inputData.pointers.length;
    const changedPointers = inputData.changedPointers.length;
    const isFirst = (eventType & PHASE_START) && (currentPointers - changedPointers === 0);
    const isFinal = (eventType & (PHASE_END | PHASE_CANCEL)) && (currentPointers - changedPointers === 0);

    inputData.isFirst = !!isFirst;
    inputData.isFinal = !!isFinal;

    if (isFirst) {
      manager.session = {}; // Reset session for a new gesture
    }
    inputData.eventType = eventType;

    // Normalize input data
    normalizeInputData(manager, inputData);

    manager.emit("touchgestures.input", inputData);
    manager.recognize(inputData);
    manager.session.previousInput = inputData;
  }

  /**
   * Normalizes input data for consistent processing.
   * @param {Object} manager - The gesture manager.
   * @param {Object} inputData - The raw input data.
   */
  function normalizeInputData(manager, inputData) {
    const session = manager.session;
    const pointers = inputData.pointers;
    const pointerCount = pointers.length;

    // First input in a gesture
    if (!session.firstInput) {
      session.firstInput = generatePointerSnapshot(inputData);
    }

    // First multi-touch input
    if (pointerCount > 1 && !session.firstMultiple) {
      session.firstMultiple = generatePointerSnapshot(inputData);
    } else if (pointerCount === 1) {
      session.firstMultiple = false;
    }

    const initialCenter = session.firstMultiple ? session.firstMultiple.center : session.firstInput.center;
    inputData.center = calculateCenter(pointers);
    inputData.timeStamp = getCurrentTime();
    inputData.deltaTime = inputData.timeStamp - session.firstInput.timeStamp;
    inputData.angle = calculateAngle(initialCenter, inputData.center);
    inputData.distance = calculateDistance(initialCenter, inputData.center);

    // Calculate delta and direction
    updateDelta(session, inputData);
    inputData.offsetDirection = getDirection(inputData.deltaX, inputData.deltaY);

    // Calculate scale and rotation for multi-touch
    if (session.firstMultiple) {
      inputData.scale = calculateScale(session.firstMultiple.pointers, pointers);
      inputData.rotation = calculateRotation(session.firstMultiple.pointers, pointers);
    } else {
      inputData.scale = 1;
      inputData.rotation = 0;
    }

    // Update velocity and direction
    updateVelocity(session, inputData);

    // Set target element to the actual DOM element hit, if it's within the manager's element
    let eventTarget = inputData.srcEvent.target;
    if (_utils.isChildOf(eventTarget, manager.element)) {
      inputData.target = eventTarget;
    } else {
      inputData.target = manager.element;
    }
  }

  /**
   * Updates the delta values (deltaX, deltaY) in the input data.
   * @param {Object} session - The current gesture session.
   * @param {Object} inputData - The current input data.
   */
  function updateDelta(session, inputData) {
    const currentCenter = inputData.center;
    let offsetDelta = session.offsetDelta || {};
    let previousDelta = session.previousDelta || {};
    let previousInput = session.previousInput || {};

    // Reset deltas on start of new gesture or if previous event was an end/cancel
    if (inputData.eventType === PHASE_START || previousInput.eventType === PHASE_END) {
      previousDelta = session.previousDelta = {
        x: previousInput.deltaX || 0,
        y: previousInput.deltaY || 0
      };
      offsetDelta = session.offsetDelta = {
        x: currentCenter.x,
        y: currentCenter.y
      };
    }

    inputData.deltaX = previousDelta.x + (currentCenter.x - offsetDelta.x);
    inputData.deltaY = previousDelta.y + (currentCenter.y - offsetDelta.y);
  }

  /**
   * Updates velocity and direction for the current input.
   * @param {Object} session - The current gesture session.
   * @param {Object} inputData - The current input data.
   */
  function updateVelocity(session, inputData) {
    let velocity, velocityX, velocityY, direction;
    const lastInterval = session.lastInterval || inputData;
    const timeDelta = inputData.timeStamp - lastInterval.timeStamp;

    // Calculate velocity if enough time has passed or it's the final event
    if (inputData.eventType !== PHASE_END && (timeDelta > VELOCITY_CALC_INTERVAL || lastInterval.velocity === undefinedValue)) {
      const deltaX = lastInterval.deltaX - inputData.deltaX;
      const deltaY = lastInterval.deltaY - inputData.deltaY;
      const velocityComponents = calculateVelocity(timeDelta, deltaX, deltaY);
      velocityX = velocityComponents.x;
      velocityY = velocityComponents.y;
      velocity = absoluteValue(velocityX) > absoluteValue(velocityY) ? velocityX : velocityY;
      direction = getDirection(deltaX, deltaY);
      session.lastInterval = inputData;
    } else {
      velocity = lastInterval.velocity;
      velocityX = lastInterval.velocityX;
      velocityY = lastInterval.velocityY;
      direction = lastInterval.direction;
    }

    inputData.velocity = velocity;
    inputData.velocityX = velocityX;
    inputData.velocityY = velocityY;
    inputData.direction = direction;
  }

  /**
   * Creates a snapshot of pointer data for a given input.
   * @param {Object} input - The input data.
   * @returns {Object} - A snapshot of pointer data.
   */
  function generatePointerSnapshot(input) {
    const snapshotPointers = [];
    for (let i = 0; i < input.pointers.length; i++) {
      snapshotPointers[i] = {
        clientX: roundValue(input.pointers[i].clientX),
        clientY: roundValue(input.pointers[i].clientY)
      };
    }
    return {
      timeStamp: getCurrentTime(),
      pointers: snapshotPointers,
      center: calculateCenter(snapshotPointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }

  /**
   * Calculates the center point of multiple pointers.
   * @param {Array<Object>} pointers - Array of pointer objects.
   * @returns {Object} - The center point {x, y}.
   */
  function calculateCenter(pointers) {
    const count = pointers.length;
    if (count === 1) {
      return {
        x: roundValue(pointers[0].clientX),
        y: roundValue(pointers[0].clientY)
      };
    }
    let sumX = 0,
      sumY = 0;
    for (let i = 0; i < count; i++) {
      sumX += pointers[i].clientX;
      sumY += pointers[i].clientY;
    }
    return {
      x: roundValue(sumX / count),
      y: roundValue(sumY / count)
    };
  }

  /**
   * Calculates velocity components (x and y).
   * @param {number} time - Time difference.
   * @param {number} deltaX - Change in X.
   * @param {number} deltaY - Change in Y.
   * @returns {Object} - Velocity components {x, y}.
   */
  function calculateVelocity(time, deltaX, deltaY) {
    return {
      x: deltaX / time || 0,
      y: deltaY / time || 0
    };
  }

  /**
   * Determines the direction of movement.
   * @param {number} deltaX - Change in X.
   * @param {number} deltaY - Change in Y.
   * @returns {number} - Direction constant.
   */
  function getDirection(deltaX, deltaY) {
    if (deltaX === deltaY) return DIRECTION_NONE;
    if (absoluteValue(deltaX) >= absoluteValue(deltaY)) {
      return deltaX > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }
    return deltaY > 0 ? DIRECTION_DOWN : DIRECTION_UP;
  }

  /**
   * Calculates the distance between two points.
   * @param {Object} p1 - First point {x, y}.
   * @param {Object} p2 - Second point {x, y}.
   * @param {Array<string>} [coords=COORDS_XY] - Coordinate keys.
   * @returns {number} - Distance.
   */
  function calculateDistance(p1, p2, coords = COORDS_XY) {
    const dx = p2[coords[0]] - p1[coords[0]];
    const dy = p2[coords[1]] - p1[coords[1]];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the angle between two points.
   * @param {Object} p1 - First point {x, y}.
   * @param {Object} p2 - Second point {x, y}.
   * @param {Array<string>} [coords=COORDS_XY] - Coordinate keys.
   * @returns {number} - Angle in degrees.
   */
  function calculateAngle(p1, p2, coords = COORDS_XY) {
    const dx = p2[coords[0]] - p1[coords[0]];
    const dy = p2[coords[1]] - p1[coords[1]];
    return (180 * Math.atan2(dy, dx)) / Math.PI;
  }

  /**
   * Calculates the rotation between two sets of pointers.
   * @param {Array<Object>} startPointers - Pointers at start of gesture.
   * @param {Array<Object>} currentPointers - Pointers at current moment.
   * @returns {number} - Rotation in degrees.
   */
  function calculateRotation(startPointers, currentPointers) {
    return calculateAngle(currentPointers[1], currentPointers[0], CLIENT_COORDS) - calculateAngle(startPointers[1], startPointers[0], CLIENT_COORDS);
  }

  /**
   * Calculates the scale factor between two sets of pointers.
   * @param {Array<Object>} startPointers - Pointers at start of gesture.
   * @param {Array<Object>} currentPointers - Pointers at current moment.
   * @returns {number} - Scale factor.
   */
  function calculateScale(startPointers, currentPointers) {
    return calculateDistance(currentPointers[0], currentPointers[1], CLIENT_COORDS) / calculateDistance(startPointers[0], startPointers[1], CLIENT_COORDS);
  }

  /**
   * Mouse input handler.
   * @augments BaseInputHandler
   */
  function MouseInputHandler() {
    this.elementEvents = "mousedown";
    this.windowEvents = "mousemove mouseup";
    this.isAllowed = true;
    this.isPressed = false;
    BaseInputHandler.apply(this, arguments);
  }
  const MOUSE_EVENT_MAP = {
    mousedown: PHASE_START,
    mousemove: PHASE_MOVE,
    mouseup: PHASE_END
  };
  _utils.inherit(MouseInputHandler, BaseInputHandler, {
    handleEvent: function(event) {
      const eventPhase = MOUSE_EVENT_MAP[event.type];
      if ((eventPhase & PHASE_START) && event.button === 0) {
        this.isPressed = true;
      }
      if ((eventPhase & PHASE_MOVE) && event.which !== 1) { // If not left button, treat as end
        eventPhase = PHASE_END;
      }
      if (this.isPressed && this.isAllowed) {
        if (eventPhase & PHASE_END) {
          this.isPressed = false;
        }
        this.eventCallback(this.gestureManager, eventPhase, {
          pointers: [event],
          changedPointers: [event],
          pointerType: INPUT_TYPE_MOUSE,
          srcEvent: event
        });
      }
    }
  });

  /**
   * Pointer Events input handler.
   * @augments BaseInputHandler
   */
  function PointerInputHandler() {
    this.elementEvents = "pointerdown";
    this.windowEvents = "pointermove pointerup pointercancel";
    BaseInputHandler.apply(this, arguments);
    this.pointerStore = this.gestureManager.session.pointerEvents = [];
  }
  const POINTER_EVENT_MAP = {
    pointerdown: PHASE_START,
    pointermove: PHASE_MOVE,
    pointerup: PHASE_END,
    pointercancel: PHASE_CANCEL
  };
  const POINTER_TYPE_MAP = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT
  };
  if (globalWindow.MSPointerEvent) { // IE specific Pointer Events
    PointerInputHandler.prototype.elementEvents = "MSPointerDown";
    PointerInputHandler.prototype.windowEvents = "MSPointerMove MSPointerUp MSPointerCancel";
  }
  _utils.inherit(PointerInputHandler, BaseInputHandler, {
    handleEvent: function(event) {
      const eventType = POINTER_EVENT_MAP[event.type.toLowerCase().replace("ms", "")];
      const pointerType = POINTER_TYPE_MAP[event.pointerType] || event.pointerType;
      const isTouch = pointerType === INPUT_TYPE_TOUCH;
      const pointerId = event.pointerId;
      let pointerIndex = _utils.findInCollection(this.pointerStore, pointerId, "pointerId");
      let removePointer = false;

      // Add new pointer
      if (eventType & PHASE_START && (event.button === 0 || isTouch)) {
        if (pointerIndex < 0) { // New pointer
          this.pointerStore.push(event);
          pointerIndex = this.pointerStore.length - 1;
        }
      } else if (eventType & (PHASE_END | PHASE_CANCEL)) {
        removePointer = true;
      }

      if (pointerIndex < 0) {
        return; // Pointer not found in store, ignore
      }

      this.pointerStore[pointerIndex] = event; // Update pointer info
      this.eventCallback(this.gestureManager, eventType, {
        pointers: this.pointerStore,
        changedPointers: [event],
        pointerType: pointerType,
        srcEvent: event
      });

      if (removePointer) {
        this.pointerStore.splice(pointerIndex, 1);
      }
    }
  });

  /**
   * Single Touch input handler.
   * @augments BaseInputHandler
   */
  function SingleTouchInputHandler() {
    this.targetEvents = "touchstart";
    this.windowEvents = "touchstart touchmove touchend touchcancel";
    this.gestureStarted = false;
    BaseInputHandler.apply(this, arguments);
  }
  const TOUCH_EVENT_MAP = {
    touchstart: PHASE_START,
    touchmove: PHASE_MOVE,
    touchend: PHASE_END,
    touchcancel: PHASE_CANCEL
  };
  _utils.inherit(SingleTouchInputHandler, BaseInputHandler, {
    handleEvent: function(event) {
      const eventType = TOUCH_EVENT_MAP[event.type];
      if (eventType === PHASE_START) {
        this.gestureStarted = true;
      }
      if (this.gestureStarted) {
        const [allPointers, changedPointers] = splitTouchList(event, eventType);
        if (eventType & (PHASE_END | PHASE_CANCEL) && (allPointers.length - changedPointers.length === 0)) {
          this.gestureStarted = false;
        }
        this.eventCallback(this.gestureManager, eventType, {
          pointers: allPointers,
          changedPointers: changedPointers,
          pointerType: INPUT_TYPE_TOUCH,
          srcEvent: event
        });
      }
    }
  });

  /**
   * Multi Touch input handler (for older Android).
   * @augments BaseInputHandler
   */
  function MultiTouchInputHandler() {
    this.targetEvents = "touchstart touchmove touchend touchcancel";
    BaseInputHandler.apply(this, arguments);
    this.activeTouchIds = {}; // Map of active touch IDs
  }
  _utils.inherit(MultiTouchInputHandler, BaseInputHandler, {
    handleEvent: function(event) {
      const eventType = TOUCH_EVENT_MAP[event.type];
      const [allPointers, changedPointers] = filterTouchList(event, eventType, this.activeTouchIds, this.targetElement);
      if (changedPointers && changedPointers.length) {
        this.eventCallback(this.gestureManager, eventType, {
          pointers: allPointers,
          changedPointers: changedPointers,
          pointerType: INPUT_TYPE_TOUCH,
          srcEvent: event
        });
      }
    }
  });

  /**
   * Splits a touch list into all touches and changed touches.
   * @param {Event} event - The touch event.
   * @param {number} eventType - The event phase.
   * @returns {Array<Array<Touch>>} - [allPointers, changedPointers].
   */
  function splitTouchList(event, eventType) {
    let allTouches = _utils.toArray(event.touches);
    const changedTouches = _utils.toArray(event.changedTouches);
    if (eventType & (PHASE_END | PHASE_CANCEL)) {
      allTouches = _utils.removeDuplicates(allTouches.concat(changedTouches), "identifier", true);
    }
    return [allTouches, changedTouches];
  }

  /**
   * Filters and updates touch lists for multi-touch.
   * @param {Event} event - The touch event.
   * @param {number} eventType - The event phase.
   * @param {Object} activeTouchIds - Map of active touch identifiers.
   * @param {HTMLElement} targetElement - The element being observed.
   * @returns {Array<Array<Touch>>|undefined} - [filteredPointers, changedPointers] or undefined if no relevant touches.
   */
  function filterTouchList(event, eventType, activeTouchIds, targetElement) {
    let allTouches = _utils.toArray(event.touches);
    let changedTouches = _utils.toArray(event.changedTouches);

    // For start/move events with one touch, just track that one.
    if (eventType & (PHASE_START | PHASE_MOVE) && allTouches.length === 1) {
      activeTouchIds[allTouches[0].identifier] = true;
      return [allTouches, allTouches];
    }

    const relevantChangedTouches = [];
    const targetTouches = allTouches.filter(touch => _utils.isChildOf(touch.target, targetElement));

    // On PHASE_START, add new touches that are within the target
    if (eventType === PHASE_START) {
      for (let i = 0; i < targetTouches.length; i++) {
        activeTouchIds[targetTouches[i].identifier] = true;
      }
    }

    // Filter changed touches to only include those we are tracking
    for (let i = 0; i < changedTouches.length; i++) {
      if (activeTouchIds[changedTouches[i].identifier]) {
        relevantChangedTouches.push(changedTouches[i]);
      }
      // On PHASE_END/PHASE_CANCEL, remove touches from tracking
      if (eventType & (PHASE_END | PHASE_CANCEL)) {
        delete activeTouchIds[changedTouches[i].identifier];
      }
    }

    if (relevantChangedTouches.length) {
      return [_utils.removeDuplicates(targetTouches.concat(relevantChangedTouches), "identifier", true), relevantChangedTouches];
    }
    return undefinedValue;
  }

  /**
   * Combined Touch/Mouse input handler.
   * @augments BaseInputHandler
   */
  function TouchMouseInputHandler() {
    BaseInputHandler.apply(this, arguments);
    const boundHandler = _utils.bindContext(this.handleEvent, this);
    this.touchInput = new MultiTouchInputHandler(this.gestureManager, boundHandler);
    this.mouseInput = new MouseInputHandler(this.gestureManager, boundHandler);
  }
  _utils.inherit(TouchMouseInputHandler, BaseInputHandler, {
    handleEvent: function(manager, eventType, inputData) {
      const isTouch = inputData.pointerType === INPUT_TYPE_TOUCH;
      const isMouse = inputData.pointerType === INPUT_TYPE_MOUSE;

      // If touch is active, disable mouse
      if (isTouch) {
        this.mouseInput.isAllowed = false;
      } else if (isMouse && !this.mouseInput.isAllowed) {
        return; // Ignore mouse events while touch is active
      }

      // Re-enable mouse after touch ends
      if (eventType & (PHASE_END | PHASE_CANCEL)) {
        this.mouseInput.isAllowed = true;
      }
      this.eventCallback(manager, eventType, inputData);
    },
    destroy: function() {
      this.touchInput.destroy();
      this.mouseInput.destroy();
    }
  });

  /**
   * Handles touch actions (CSS `touch-action` property).
   * @param {Object} manager - The gesture manager.
   * @param {string} touchActionValue - The touch-action value.
   */
  function TouchActionHandler(manager, touchActionValue) {
    this.manager = manager;
    this.setTouchAction(touchActionValue);
  }
  const VENDOR_PREFIXED_TOUCH_ACTION = _utils.getVendorPrefixed(f_div.style, "touchAction");
  const HAS_TOUCH_ACTION_SUPPORT = VENDOR_PREFIXED_TOUCH_ACTION !== undefinedValue;

  // Touch-action values
  const TOUCH_ACTION_COMPUTE = "compute";
  const TOUCH_ACTION_AUTO = "auto";
  const TOUCH_ACTION_MANIPULATION = "manipulation";
  const TOUCH_ACTION_NONE = "none";
  const TOUCH_ACTION_PAN_X = "pan-x";
  const TOUCH_ACTION_PAN_Y = "pan-y";

  TouchActionHandler.prototype = {
    setTouchAction: function(value) {
      if (value === TOUCH_ACTION_COMPUTE) {
        value = this.computeTouchAction();
      }
      if (HAS_TOUCH_ACTION_SUPPORT) {
        this.manager.element.style[VENDOR_PREFIXED_TOUCH_ACTION] = value;
      }
      this.activeActions = value.toLowerCase().trim();
    },
    update: function() {
      this.setTouchAction(this.manager.options.touchAction);
    },
    computeTouchAction: function() {
      const actions = [];
      _utils.iterateCollection(this.manager.recognizers, function(recognizer) {
        if (_utils.executeCallback(recognizer.options.enable, [recognizer])) {
          actions.push(...recognizer.getTouchAction());
        }
      });
      return getCombinedTouchAction(actions.join(" "));
    },
    /**
     * Prevents default browser actions based on the active touch-action.
     * @param {Object} input - The input data.
     */
    preventBrowserDefaults: function(input) {
      if (!HAS_TOUCH_ACTION_SUPPORT) {
        const srcEvent = input.srcEvent;
        const currentDirection = input.offsetDirection;

        // If a previous recognizer already prevented default, keep it prevented
        if (this.manager.session.prevented) {
          srcEvent.preventDefault();
          return;
        }

        const actions = this.activeActions;
        const noAction = _utils.stringContains(actions, TOUCH_ACTION_NONE);
        const panY = _utils.stringContains(actions, TOUCH_ACTION_PAN_Y);
        const panX = _utils.stringContains(actions, TOUCH_ACTION_PAN_X);

        if (noAction || (panY && (currentDirection & DIRECTION_HORIZONTAL)) || (panX && (currentDirection & DIRECTION_VERTICAL))) {
          this.preventNativeScroll(srcEvent);
        }
      }
    },
    preventNativeScroll: function(event) {
      this.manager.session.prevented = true;
      event.preventDefault();
    }
  };

  /**
   * Determines the combined touch-action from a list of individual actions.
   * @param {string} actionsString - Space-separated string of touch actions.
   * @returns {string} - The combined touch-action value.
   */
  function getCombinedTouchAction(actionsString) {
    if (_utils.stringContains(actionsString, TOUCH_ACTION_NONE)) return TOUCH_ACTION_NONE;
    const hasPanX = _utils.stringContains(actionsString, TOUCH_ACTION_PAN_X);
    const hasPanY = _utils.stringContains(actionsString, TOUCH_ACTION_PAN_Y);

    if (hasPanX && hasPanY) return TOUCH_ACTION_PAN_X + " " + TOUCH_ACTION_PAN_Y;
    if (hasPanX) return TOUCH_ACTION_PAN_X;
    if (hasPanY) return TOUCH_ACTION_PAN_Y;

    if (_utils.stringContains(actionsString, TOUCH_ACTION_MANIPULATION)) return TOUCH_ACTION_MANIPULATION;

    return TOUCH_ACTION_AUTO;
  }

  // Recognizer states
  const RECOGNIZER_STATE_POSSIBLE = 1;
  const RECOGNIZER_STATE_BEGAN = 2;
  const RECOGNIZER_STATE_CHANGED = 4;
  const RECOGNIZER_STATE_ENDED = 8;
  const RECOGNIZER_STATE_RECOGNIZED = RECOGNIZER_STATE_ENDED;
  const RECOGNIZER_STATE_CANCELED = 16;
  const RECOGNIZER_STATE_FAILED = 32;

  /**
   * Base class for all gesture recognizers.
   * @param {Object} options - Recognizer options.
   */
  function BaseRecognizer(options) {
    this.id = _utils.generateUniqueId();
    this.manager = null;
    this.options = _utils.mergeProperties(options || {}, this.defaultOptions);
    this.options.enable = _utils.ensureDefault(this.options.enable, true);
    this.state = RECOGNIZER_STATE_POSSIBLE;
    this.simultaneousRecognizers = {}; // Recognizers that can run at the same time
    this.failedDependencies = []; // Recognizers that must fail first
  }

  BaseRecognizer.prototype = {
    defaultOptions: {},
    /**
     * Updates the recognizer's options.
     * @param {Object} newOptions - New options to merge.
     * @returns {BaseRecognizer} - This recognizer instance.
     */
    updateOptions: function(newOptions) {
      _utils.mergeProperties(this.options, newOptions);
      this.manager && this.manager.touchAction.update(); // Update touch-action if options change
      return this;
    },

    /**
     * Allows this recognizer to run simultaneously with another.
     * @param {BaseRecognizer|Array<BaseRecognizer>} otherRecognizer - The other recognizer(s).
     * @returns {BaseRecognizer} - This recognizer instance.
     */
    recognizeWith: function(otherRecognizer) {
      if (_utils.processArrayOrValue(otherRecognizer, "recognizeWith", this)) return this;
      const targetRecognizer = resolveRecognizer(otherRecognizer, this);
      this.simultaneousRecognizers[targetRecognizer.id] = targetRecognizer;
      targetRecognizer.recognizeWith(this); // Mutual relationship
      return this;
    },

    /**
     * Disallows this recognizer from running simultaneously with another.
     * @param {BaseRecognizer|Array<BaseRecognizer>} otherRecognizer - The other recognizer(s).
     * @returns {BaseRecognizer} - This recognizer instance.
     */
    dropRecognizeWith: function(otherRecognizer) {
      if (_utils.processArrayOrValue(otherRecognizer, "dropRecognizeWith", this)) return this;
      const targetRecognizer = resolveRecognizer(otherRecognizer, this);
      delete this.simultaneousRecognizers[targetRecognizer.id];
      return this;
    },

    /**
     * Requires another recognizer to fail before this one can succeed.
     * @param {BaseRecognizer|Array<BaseRecognizer>} otherRecognizer - The other recognizer(s).
     * @returns {BaseRecognizer} - This recognizer instance.
     */
    requireFailure: function(otherRecognizer) {
      if (_utils.processArrayOrValue(otherRecognizer, "requireFailure", this)) return this;
      const targetRecognizer = resolveRecognizer(otherRecognizer, this);
      if (_utils.findInCollection(this.failedDependencies, targetRecognizer) === -1) {
        this.failedDependencies.push(targetRecognizer);
        targetRecognizer.requireFailure(this); // Mutual relationship
      }
      return this;
    },

    /**
     * Removes a failure dependency.
     * @param {BaseRecognizer|Array<BaseRecognizer>} otherRecognizer - The other recognizer(s).
     * @returns {BaseRecognizer} - This recognizer instance.
     */
    dropRequireFailure: function(otherRecognizer) {
      if (_utils.processArrayOrValue(otherRecognizer, "dropRequireFailure", this)) return this;
      const targetRecognizer = resolveRecognizer(otherRecognizer, this);
      const index = _utils.findInCollection(this.failedDependencies, targetRecognizer);
      if (index > -1) {
        this.failedDependencies.splice(index, 1);
      }
      return this;
    },

    /**
     * Checks if this recognizer has any failure dependencies.
     * @returns {boolean} - True if it has dependencies, false otherwise.
     */
    hasFailureDependencies: function() {
      return this.failedDependencies.length > 0;
    },

    /**
     * Checks if this recognizer can run simultaneously with another.
     * @param {BaseRecognizer} otherRecognizer - The other recognizer.
     * @returns {boolean} - True if they can run together, false otherwise.
     */
    canRunSimultaneouslyWith: function(otherRecognizer) {
      return !!this.simultaneousRecognizers[otherRecognizer.id];
    },

    /**
     * Emits events for the current state.
     * @param {Object} inputData - The input data associated with the event.
     */
    emitEvent: function(inputData) {
      function emit(suffix) {
        manager.emit(recognizer.options.event + (suffix ? getStateSuffix(currentState) : ""), inputData);
      }
      const recognizer = this;
      const manager = this.manager;
      const currentState = this.state;

      // Emit "start" event if state just became BEGAN or CHANGED
      if (RECOGNIZER_STATE_ENDED > currentState) {
        emit(true);
      }
      emit(); // Emit base event (e.g., 'pan')
      // Emit "end" event if state is ENDED or CANCELED
      if (currentState >= RECOGNIZER_STATE_ENDED) {
        emit(true);
      }
    },

    /**
     * Attempts to emit the event, checking dependencies first.
     * @param {Object} inputData - The input data.
     */
    tryEmit: function(inputData) {
      if (this.canEmit()) {
        this.emitEvent(inputData);
      } else {
        this.state = RECOGNIZER_STATE_FAILED; // Fail if dependencies not met
      }
    },

    /**
     * Checks if all failure dependencies have failed or are in a possible state.
     * @returns {boolean} - True if events can be emitted, false otherwise.
     */
    canEmit: function() {
      for (let i = 0; i < this.failedDependencies.length; i++) {
        const dependency = this.failedDependencies[i];
        if (!(dependency.state & (RECOGNIZER_STATE_FAILED | RECOGNIZER_STATE_POSSIBLE))) {
          return false;
        }
      }
      return true;
    },

    /**
     * Processes input data to update the recognizer's state.
     * @param {Object} inputData - The normalized input data.
     */
    recognize: function(inputData) {
      // Check if recognizer is enabled
      if (!_utils.executeCallback(this.options.enable, [this, _utils.mergeProperties({}, inputData)])) {
        this.reset();
        this.state = RECOGNIZER_STATE_FAILED;
        return;
      }

      // Reset state if it was ended, canceled, or failed
      if (this.state & (RECOGNIZER_STATE_RECOGNIZED | RECOGNIZER_STATE_CANCELED | RECOGNIZER_STATE_FAILED)) {
        this.state = RECOGNIZER_STATE_POSSIBLE;
      }

      this.state = this.processInput(inputData); // Update state based on input
      if (this.state & (RECOGNIZER_STATE_BEGAN | RECOGNIZER_STATE_CHANGED | RECOGNIZER_STATE_ENDED | RECOGNIZER_STATE_CANCELED)) {
        this.tryEmit(inputData);
      }
    },

    processInput: function() {}, // To be implemented by subclasses
    getTouchAction: function() {}, // To be implemented by subclasses
    reset: function() {} // To be implemented by subclasses
  };

  /**
   * Helper to get recognizer instance from an event name or instance.
   * @param {string|BaseRecognizer} recognizer - Event name or recognizer instance.
   * @param {BaseRecognizer} contextRecognizer - The current recognizer instance.
   * @returns {BaseRecognizer} - The resolved recognizer instance.
   */
  function resolveRecognizer(recognizer, contextRecognizer) {
    if (recognizer instanceof BaseRecognizer) {
      return recognizer;
    }
    return contextRecognizer.manager.getRecognizer(recognizer);
  }

  /**
   * Returns a string suffix for a given recognizer state.
   * @param {number} state - The recognizer state constant.
   * @returns {string} - The state suffix (e.g., "start", "end").
   */
  function getStateSuffix(state) {
    if (state & RECOGNIZER_STATE_CANCELED) return "cancel";
    if (state & RECOGNIZER_STATE_ENDED) return "end";
    if (state & RECOGNIZER_STATE_CHANGED) return "move";
    if (state & RECOGNIZER_STATE_BEGAN) return "start";
    return "";
  }

  /**
   * Recognizer for attributes (e.g., number of pointers).
   * @augments BaseRecognizer
   */
  function AttributeRecognizer() {
    BaseRecognizer.apply(this, arguments);
  }
  _utils.inherit(AttributeRecognizer, BaseRecognizer, {
    defaultOptions: {
      pointers: 1
    },
    /**
     * Checks if the number of pointers matches the required count.
     * @param {Object} inputData - The input data.
     * @returns {boolean} - True if pointer count matches, false otherwise.
     */
    checkPointerCount: function(inputData) {
      const requiredPointers = this.options.pointers;
      return requiredPointers === 0 || inputData.pointers.length === requiredPointers;
    },
    processInput: function(inputData) {
      const currentState = this.state;
      const eventType = inputData.eventType;
      const pointersMatch = this.checkPointerCount(inputData);

      // If already started, and pointers no longer match or event is end/cancel, then cancel
      if (currentState & (RECOGNIZER_STATE_BEGAN | RECOGNIZER_STATE_CHANGED) && (eventType & PHASE_CANCEL || !pointersMatch)) {
        return currentState | RECOGNIZER_STATE_CANCELED;
      }
      // If pointers match, then continue or start
      if (pointersMatch) {
        return eventType & PHASE_END ? currentState | RECOGNIZER_STATE_ENDED : (currentState & RECOGNIZER_STATE_BEGAN ? currentState | RECOGNIZER_STATE_CHANGED : RECOGNIZER_STATE_BEGAN);
      }
      // If pointers don't match and not started, then fail
      return RECOGNIZER_STATE_FAILED;
    }
  });

  /**
   * Pan gesture recognizer.
   * @augments AttributeRecognizer
   */
  function PanRecognizer() {
    AttributeRecognizer.apply(this, arguments);
    this.previousX = null;
    this.previousY = null;
  }
  _utils.inherit(PanRecognizer, AttributeRecognizer, {
    defaultOptions: {
      event: "pan",
      threshold: 10, // Minimum distance to start pan
      pointers: 1,
      direction: DIRECTION_ALL
    },
    getTouchAction: function() {
      const direction = this.options.direction;
      const actions = [];
      if (direction & DIRECTION_HORIZONTAL) actions.push(TOUCH_ACTION_PAN_Y);
      if (direction & DIRECTION_VERTICAL) actions.push(TOUCH_ACTION_PAN_X);
      return actions;
    },
    /**
     * Checks if the direction of movement is allowed.
     * @param {Object} inputData - The input data.
     * @returns {boolean} - True if direction is allowed and threshold met.
     */
    checkDirection: function(inputData) {
      const options = this.options;
      let directionAllowed = true;
      let eventDirection = inputData.direction;
      let currentDistance = inputData.distance;
      let deltaX = inputData.deltaX;
      let deltaY = inputData.deltaY;

      // If current direction is not allowed, try to deduce from deltaX/deltaY
      if (!(eventDirection & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          eventDirection = (deltaX === 0) ? DIRECTION_NONE : (deltaX > 0 ? DIRECTION_RIGHT : DIRECTION_LEFT);
          directionAllowed = (deltaX !== this.previousX); // Check if movement actually happened
          currentDistance = absoluteValue(inputData.deltaX);
        } else { // DIRECTION_VERTICAL
          eventDirection = (deltaY === 0) ? DIRECTION_NONE : (deltaY > 0 ? DIRECTION_DOWN : DIRECTION_UP);
          directionAllowed = (deltaY !== this.previousY); // Check if movement actually happened
          currentDistance = absoluteValue(inputData.deltaY);
        }
      }

      inputData.direction = eventDirection;
      return directionAllowed && currentDistance > options.threshold && (eventDirection & options.direction);
    },
    processInput: function(inputData) {
      const currentState = this.state;
      // If not started yet, check attributes and direction
      if (!(currentState & RECOGNIZER_STATE_BEGAN) && !this.checkPointerCount(inputData)) {
        return RECOGNIZER_STATE_FAILED;
      }
      if (!(currentState & RECOGNIZER_STATE_BEGAN) && !this.checkDirection(inputData)) {
        return RECOGNIZER_STATE_POSSIBLE; // Not enough movement yet
      }

      return AttributeRecognizer.prototype.processInput.call(this, inputData);
    },
    emitEvent: function(inputData) {
      this.previousX = inputData.deltaX;
      this.previousY = inputData.deltaY;
      const directionSuffix = getDirectionSuffix(inputData.direction);
      if (directionSuffix) {
        this.manager.emit(this.options.event + directionSuffix, inputData);
      }
      AttributeRecognizer.prototype.emitEvent.call(this, inputData);
    }
  });

  /**
   * Pinch gesture recognizer.
   * @augments AttributeRecognizer
   */
  function PinchRecognizer() {
    AttributeRecognizer.apply(this, arguments);
  }
  _utils.inherit(PinchRecognizer, AttributeRecognizer, {
    defaultOptions: {
      event: "pinch",
      threshold: 0, // No minimum movement required to start
      pointers: 2
    },
    getTouchAction: function() {
      return [TOUCH_ACTION_NONE];
    },
    processInput: function(inputData) {
      // Must pass attribute checks AND have a scale change or already started
      if (!AttributeRecognizer.prototype.checkPointerCount.call(this, inputData) || (absoluteValue(inputData.scale - 1) <= this.options.threshold && !(this.state & RECOGNIZER_STATE_BEGAN))) {
        return RECOGNIZER_STATE_FAILED;
      }
      return AttributeRecognizer.prototype.processInput.call(this, inputData);
    },
    emitEvent: function(inputData) {
      AttributeRecognizer.prototype.emitEvent.call(this, inputData);
      if (inputData.scale !== 1) {
        const scaleDirection = inputData.scale < 1 ? "in" : "out";
        this.manager.emit(this.options.event + scaleDirection, inputData);
      }
    }
  });

  /**
   * Press gesture recognizer.
   * @augments BaseRecognizer
   */
  function PressRecognizer() {
    BaseRecognizer.apply(this, arguments);
    this.pressTimer = null;
    this.lastInput = null;
  }
  _utils.inherit(PressRecognizer, BaseRecognizer, {
    defaultOptions: {
      event: "press",
      pointers: 1,
      time: 500, // Duration to hold press
      threshold: 9 // Max movement allowed during press
    },
    getTouchAction: function() {
      return [TOUCH_ACTION_AUTO];
    },
    processInput: function(inputData) {
      const options = this.options;
      const pointersMatch = inputData.pointers.length === options.pointers;
      const movementAllowed = inputData.distance < options.threshold;
      const holdTimeMet = inputData.deltaTime > options.time;

      this.lastInput = inputData; // Store last input for emit

      // Reset if conditions are not met
      if (!movementAllowed || !pointersMatch || (inputData.eventType & (PHASE_END | PHASE_CANCEL) && !holdTimeMet)) {
        this.reset();
        return RECOGNIZER_STATE_FAILED;
      }

      if (inputData.eventType & PHASE_START) {
        this.reset(); // Clear any previous timer
        this.pressTimer = _utils.deferExecution(function() {
          this.state = RECOGNIZER_STATE_RECOGNIZED;
          this.tryEmit();
        }, options.time, this);
      } else if (inputData.eventType & PHASE_END) {
        return RECOGNIZER_STATE_RECOGNIZED; // If released before timer, it's still a recognized press if time met
      }
      return RECOGNIZER_STATE_POSSIBLE;
    },
    reset: function() {
      clearTimeout(this.pressTimer);
    },
    emitEvent: function(inputData) {
      if (this.state === RECOGNIZER_STATE_RECOGNIZED) {
        // Emit 'pressup' if inputData indicates release, otherwise 'press'
        if (inputData && (inputData.eventType & PHASE_END)) {
          this.manager.emit(this.options.event + "up", inputData);
        } else {
          this.lastInput.timeStamp = getCurrentTime(); // Update timestamp for consistency
          this.manager.emit(this.options.event, this.lastInput);
        }
      }
    }
  });

  /**
   * Rotate gesture recognizer.
   * @augments AttributeRecognizer
   */
  function RotateRecognizer() {
    AttributeRecognizer.apply(this, arguments);
  }
  _utils.inherit(RotateRecognizer, AttributeRecognizer, {
    defaultOptions: {
      event: "rotate",
      threshold: 0, // No minimum rotation required
      pointers: 2
    },
    getTouchAction: function() {
      return [TOUCH_ACTION_NONE];
    },
    processInput: function(inputData) {
      // Must pass attribute checks AND have a rotation change or already started
      if (!AttributeRecognizer.prototype.checkPointerCount.call(this, inputData) || (absoluteValue(inputData.rotation) <= this.options.threshold && !(this.state & RECOGNIZER_STATE_BEGAN))) {
        return RECOGNIZER_STATE_FAILED;
      }
      return AttributeRecognizer.prototype.processInput.call(this, inputData);
    }
  });

  /**
   * Swipe gesture recognizer.
   * @augments AttributeRecognizer
   */
  function SwipeRecognizer() {
    AttributeRecognizer.apply(this, arguments);
  }
  _utils.inherit(SwipeRecognizer, AttributeRecognizer, {
    defaultOptions: {
      event: "swipe",
      threshold: 10, // Minimum distance for swipe
      velocity: 0.65, // Minimum velocity for swipe
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },
    getTouchAction: function() {
      return PanRecognizer.prototype.getTouchAction.call(this); // Swipe uses same touch actions as pan
    },
    processInput: function(inputData) {
      let swipeVelocity;
      const options = this.options;
      const swipeDirection = options.direction;

      if (swipeDirection & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        swipeVelocity = inputData.velocity;
      } else if (swipeDirection & DIRECTION_HORIZONTAL) {
        swipeVelocity = inputData.velocityX;
      } else { // DIRECTION_VERTICAL
        swipeVelocity = inputData.velocityY;
      }

      // Check all conditions for a swipe:
      // 1. Attribute checks (pointer count)
      // 2. Direction matches allowed directions
      // 3. Distance threshold met
      // 4. Velocity threshold met
      // 5. Event type is an end event (swipe only recognized on release)
      if (!AttributeRecognizer.prototype.checkPointerCount.call(this, inputData) ||
        !(swipeDirection & inputData.direction) ||
        inputData.distance <= options.threshold ||
        absoluteValue(swipeVelocity) <= options.velocity ||
        !(inputData.eventType & PHASE_END)) {
        return RECOGNIZER_STATE_FAILED;
      }
      return AttributeRecognizer.prototype.processInput.call(this, inputData);
    },
    emitEvent: function(inputData) {
      const directionSuffix = getDirectionSuffix(inputData.direction);
      if (directionSuffix) {
        this.manager.emit(this.options.event + directionSuffix, inputData);
      }
      this.manager.emit(this.options.event, inputData);
    }
  });

  /**
   * Tap gesture recognizer.
   * @augments BaseRecognizer
   */
  function TapRecognizer() {
    BaseRecognizer.apply(this, arguments);
    this.previousTapTime = false;
    this.previousTapCenter = false;
    this.tapTimer = null;
    this.lastInput = null;
    this.tapCount = 0;
  }
  _utils.inherit(TapRecognizer, BaseRecognizer, {
    defaultOptions: {
      event: "tap",
      pointers: 1,
      taps: 1, // Number of taps required (e.g., 2 for doubletap)
      interval: 300, // Max time between taps
      time: 250, // Max duration of a tap
      threshold: 9, // Max movement allowed during tap
      positionThreshold: 10 // Max movement allowed between taps for multi-tap
    },
    getTouchAction: function() {
      return [TOUCH_ACTION_MANIPULATION];
    },
    processInput: function(inputData) {
      const options = this.options;
      const pointersMatch = inputData.pointers.length === options.pointers;
      const movementAllowed = inputData.distance < options.threshold;
      const tapDurationAllowed = inputData.deltaTime < options.time;

      this.reset(); // Always reset timer on new input

      // On first touch down, if it's the beginning of a tap sequence, start failure timeout
      if (inputData.eventType & PHASE_START && this.tapCount === 0) {
        return this.failTimeout();
      }

      // If all tap conditions are met (movement, duration, pointer count)
      if (movementAllowed && tapDurationAllowed && pointersMatch) {
        if (inputData.eventType !== PHASE_END) {
          return this.failTimeout(); // If not an end event, continue to wait for release
        }

        // Check interval between taps and positional tolerance for multi-tap
        const withinInterval = this.previousTapTime ? (inputData.timeStamp - this.previousTapTime < options.interval) : true;
        const withinPositionTolerance = !this.previousTapCenter || (calculateDistance(this.previousTapCenter, inputData.center) < options.positionThreshold);

        this.previousTapTime = inputData.timeStamp;
        this.previousTapCenter = inputData.center;

        if (withinPositionTolerance && withinInterval) {
          this.tapCount += 1;
        } else {
          this.tapCount = 1; // Start a new tap sequence
        }

        this.lastInput = inputData; // Store last input for emit

        const requiredTapsMet = (this.tapCount % options.taps) === 0;
        if (requiredTapsMet) {
          // If there are failure dependencies, set a timer to wait for them to fail
          if (this.hasFailureDependencies()) {
            this.tapTimer = _utils.deferExecution(function() {
              this.state = RECOGNIZER_STATE_RECOGNIZED;
              this.tryEmit();
            }, options.interval, this);
            return RECOGNIZER_STATE_POSSIBLE;
          } else {
            return RECOGNIZER_STATE_RECOGNIZED;
          }
        }
      }
      return RECOGNIZER_STATE_FAILED; // Conditions not met, fail
    },

    /**
     * Sets a timeout to fail the recognizer if no tap occurs.
     * @returns {number} - RECOGNIZER_STATE_POSSIBLE.
     */
    failTimeout: function() {
      this.tapTimer = _utils.deferExecution(function() {
        this.state = RECOGNIZER_STATE_FAILED;
      }, this.options.interval, this);
      return RECOGNIZER_STATE_POSSIBLE;
    },
    reset: function() {
      clearTimeout(this.tapTimer);
    },
    emitEvent: function() {
      if (this.state === RECOGNIZER_STATE_RECOGNIZED) {
        this.lastInput.tapCount = this.tapCount;
        this.manager.emit(this.options.event, this.lastInput);
      }
    }
  });

  /**
   * Helper to get direction suffix string.
   * @param {number} direction - Direction constant.
   * @returns {string} - Direction suffix.
   */
  function getDirectionSuffix(direction) {
    if (direction === DIRECTION_DOWN) return "down";
    if (direction === DIRECTION_UP) return "up";
    if (direction === DIRECTION_LEFT) return "left";
    if (direction === DIRECTION_RIGHT) return "right";
    return "";
  }

  /**
   * Main Gesture Manager.
   * @param {HTMLElement} element - The DOM element to attach gestures to.
   * @param {Object} [options] - Configuration options.
   */
  function GestureManager(element, options) {
    options = options || {};
    this.options = _utils.mergeProperties(options, GestureManager.defaultSettings);
    this.options.inputTarget = this.options.inputTarget || element;

    this.eventHandlers = {}; // Store custom event handlers
    this.session = {}; // Current gesture session data
    this.recognizers = []; // Registered recognizer instances
    this.element = element;

    this.inputHandler = createInputHandler(this);
    this.touchAction = new TouchActionHandler(this, this.options.touchAction);

    enableCssProps(this, true); // Apply CSS properties
    _utils.iterateCollection(this.options.presetRecognizers, function(recognizerConfig) {
      const recognizerInstance = this.addRecognizer(new recognizerConfig[0](recognizerConfig[1]));
      if (recognizerConfig[2]) recognizerInstance.recognizeWith(recognizerConfig[2]);
      if (recognizerConfig[3]) recognizerInstance.requireFailure(recognizerConfig[3]);
    }, this);
  }

  // Global GestureManager settings
  GestureManager.VERSION = "2.0.4";
  GestureManager.defaultSettings = {
    domEvents: false, // Whether to emit native DOM events
    touchAction: TOUCH_ACTION_COMPUTE,
    enable: true, // Enable/disable manager
    inputTarget: null, // Element to bind input events to
    inputClass: null, // Custom input class
    presetRecognizers: [
      [RotateRecognizer, {
        enable: false
      }],
      [PinchRecognizer, {
        enable: false
      },
      ["rotate"]
      ], // Pinch can run with rotate
      [SwipeRecognizer, {
        direction: DIRECTION_HORIZONTAL
      }],
      [PanRecognizer, {
        direction: DIRECTION_HORIZONTAL
      },
      ["swipe"]
      ], // Pan can run with swipe
      [TapRecognizer],
      [TapRecognizer, {
        event: "doubletap",
        taps: 2
      },
      ["tap"]
      ], // Doubletap requires tap
      [PressRecognizer]
    ],
    cssProps: {
      userSelect: "default",
      touchSelect: "none",
      touchCallout: "none",
      contentZooming: "none",
      userDrag: "none",
      tapHighlightColor: "rgba(0,0,0,0)"
    }
  };

  // State constants for public access
  _utils.mergeProperties(GestureManager, {
    INPUT_START: PHASE_START,
    INPUT_MOVE: PHASE_MOVE,
    INPUT_END: PHASE_END,
    INPUT_CANCEL: PHASE_CANCEL,

    STATE_POSSIBLE: RECOGNIZER_STATE_POSSIBLE,
    STATE_BEGAN: RECOGNIZER_STATE_BEGAN,
    STATE_CHANGED: RECOGNIZER_STATE_CHANGED,
    STATE_ENDED: RECOGNIZER_STATE_ENDED,
    STATE_RECOGNIZED: RECOGNIZER_STATE_RECOGNIZED,
    STATE_CANCELED: RECOGNIZER_STATE_CANCELED,
    STATE_FAILED: RECOGNIZER_STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: GestureManager,
    Input: BaseInputHandler,
    TouchAction: TouchActionHandler,
    TouchInput: MultiTouchInputHandler,
    MouseInput: MouseInputHandler,
    PointerEventInput: PointerInputHandler,
    TouchMouseInput: TouchMouseInputHandler,
    SingleTouchInput: SingleTouchInputHandler,

    Recognizer: BaseRecognizer,
    AttrRecognizer: AttributeRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: _utils.addDomListeners,
    off: _utils.removeDomListeners,
    each: _utils.iterateCollection,
    merge: _utils.mergeProperties,
    extend: _utils.mergeProperties,
    inherit: _utils.inherit,
    bindFn: _utils.bindContext,
    prefixed: _utils.getVendorPrefixed
  });

  const SESSION_STOPPED_NONE = 1;
  const SESSION_STOPPED_ALL = 2;

  GestureManager.prototype = {
    /**
     * Updates the manager's options.
     * @param {Object} newOptions - New options to merge.
     * @returns {GestureManager} - This manager instance.
     */
    updateOptions: function(newOptions) {
      _utils.mergeProperties(this.options, newOptions);
      if (newOptions.touchAction) this.touchAction.update();
      if (newOptions.inputTarget) {
        this.inputHandler.destroy();
        this.inputHandler.targetElement = newOptions.inputTarget;
        this.inputHandler.initialize();
      }
      return this;
    },

    /**
     * Stops gesture recognition for the current session.
     * @param {boolean} [stopAll=false] - If true, stops all recognizers.
     */
    stopRecognition: function(stopAll = false) {
      this.session.stopped = stopAll ? SESSION_STOPPED_ALL : SESSION_STOPPED_NONE;
    },

    /**
     * Processes input data through all registered recognizers.
     * @param {Object} inputData - The normalized input data.
     */
    recognize: function(inputData) {
      const session = this.session;
      if (session.stopped) {
        return; // Recognition is stopped
      }

      this.touchAction.preventBrowserDefaults(inputData);

      let currentRecognizer = session.currentRecognizer;
      const allRecognizers = this.recognizers;

      // If a recognizer is currently active, and it's not this recognizer or they can't run simultaneously,
      // reset the current recognizer.
      if (currentRecognizer && !(currentRecognizer.state & RECOGNIZER_STATE_RECOGNIZED) && !(currentRecognizer.state & RECOGNIZER_STATE_CANCELED) && !(currentRecognizer.state & RECOGNIZER_STATE_FAILED)) {
        // If current recognizer is active and the new one cannot run with it, then reset the new one
      } else {
        currentRecognizer = session.currentRecognizer = null;
      }

      for (let i = 0; i < allRecognizers.length; i++) {
        const recognizer = allRecognizers[i];
        if (session.stopped === SESSION_STOPPED_ALL || (currentRecognizer && recognizer !== currentRecognizer && !recognizer.canRunSimultaneouslyWith(currentRecognizer))) {
          recognizer.reset(); // Reset recognizers that cannot run
        } else {
          recognizer.recognize(inputData);
          if (!currentRecognizer && (recognizer.state & (RECOGNIZER_STATE_BEGAN | RECOGNIZER_STATE_CHANGED | RECOGNIZER_STATE_ENDED))) {
            currentRecognizer = session.currentRecognizer = recognizer;
          }
        }
      }
    },

    /**
     * Gets a recognizer by its event name.
     * @param {string} eventName - The event name (e.g., "pan", "tap").
     * @returns {BaseRecognizer|null} - The recognizer instance or null.
     */
    getRecognizer: function(eventName) {
      if (eventName instanceof BaseRecognizer) {
        return eventName;
      }
      for (let i = 0; i < this.recognizers.length; i++) {
        if (this.recognizers[i].options.event === eventName) {
          return this.recognizers[i];
        }
      }
      return null;
    },

    /**
     * Adds a recognizer to the manager.
     * @param {BaseRecognizer} recognizer - The recognizer instance.
     * @returns {BaseRecognizer} - The added recognizer instance.
     */
    addRecognizer: function(recognizer) {
      if (_utils.processArrayOrValue(recognizer, "addRecognizer", this)) return this;
      const existingRecognizer = this.getRecognizer(recognizer.options.event);
      if (existingRecognizer) this.removeRecognizer(existingRecognizer); // Remove if already exists

      this.recognizers.push(recognizer);
      recognizer.manager = this;
      this.touchAction.update(); // Update touch-action
      return recognizer;
    },

    /**
     * Removes a recognizer from the manager.
     * @param {BaseRecognizer} recognizer - The recognizer instance or event name.
     * @returns {GestureManager} - This manager instance.
     */
    removeRecognizer: function(recognizer) {
      if (_utils.processArrayOrValue(recognizer, "removeRecognizer", this)) return this;
      recognizer = this.getRecognizer(recognizer);
      const index = _utils.findInCollection(this.recognizers, recognizer);
      if (index > -1) {
        this.recognizers.splice(index, 1);
      }
      this.touchAction.update(); // Update touch-action
      return this;
    },

    /**
     * Registers an event handler for a custom event.
     * @param {string} eventList - Space-separated list of event names.
     * @param {Function} handler - The event handler function.
     * @returns {GestureManager} - This manager instance.
     */
    on: function(eventList, handler) {
      _utils.iterateCollection(_utils.splitEventString(eventList), function(eventName) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].push(handler);
      }, this);
      return this;
    },

    /**
     * Unregisters an event handler.
     * @param {string} eventList - Space-separated list of event names.
     * @param {Function} [handler] - The specific handler to remove. If omitted, all handlers for the event are removed.
     * @returns {GestureManager} - This manager instance.
     */
    off: function(eventList, handler) {
      _utils.iterateCollection(_utils.splitEventString(eventList), function(eventName) {
        if (handler) {
          const index = _utils.findInCollection(this.eventHandlers[eventName], handler);
          if (index > -1) {
            this.eventHandlers[eventName].splice(index, 1);
          }
        } else {
          delete this.eventHandlers[eventName];
        }
      }, this);
      return this;
    },

    /**
     * Emits a custom event.
     * @param {string} eventName - The name of the event.
     * @param {Object} eventData - Data to pass with the event.
     */
    emit: function(eventName, eventData) {
      if (this.options.domEvents) {
        createDomEvent(eventName, eventData);
      }
      const handlers = this.eventHandlers[eventName] && this.eventHandlers[eventName].slice(); // Copy handlers to prevent issues during iteration
      if (handlers && handlers.length) {
        eventData.type = eventName;
        eventData.preventDefault = function() {
          this.srcEvent.preventDefault();
        };
        for (let i = 0; i < handlers.length; i++) {
          handlers[i](eventData);
        }
      }
    },

    /**
     * Destroys the gesture manager, removing all event listeners and clearing data.
     */
    destroy: function() {
      if (this.element) enableCssProps(this, false); // Remove CSS properties
      this.eventHandlers = {};
      this.session = {};
      this.inputHandler.destroy();
      this.element = null;
    }
  };

  /**
   * Applies or removes CSS properties to the element.
   * @param {GestureManager} manager - The gesture manager.
   * @param {boolean} addProps - True to add properties, false to remove.
   */
  function enableCssProps(manager, addProps) {
    const element = manager.element;
    _utils.iterateCollection(manager.options.cssProps, function(value, propName) {
      element.style[_utils.getVendorPrefixed(element.style, propName)] = addProps ? value : "";
    });
  }

  /**
   * Creates and dispatches a custom DOM event.
   * @param {string} eventName - The name of the event.
   * @param {Object} gestureData - The gesture data.
   */
  function createDomEvent(eventName, gestureData) {
    const customEvent = globalDocument.createEvent("Event");
    customEvent.initEvent(eventName, true, true); // Bubbles, Cancelable
    customEvent.gesture = gestureData;
    gestureData.target.dispatchEvent(customEvent);
  }

  // Export for AMD, CommonJS, or global scope
  if (typeof define === isFunction && define.amd) {
    define(function() {
      return GestureManager;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = GestureManager;
  } else {
    globalWindow[pluginName] = GestureManager;
  }
})(window, document, "TouchGestures");

;
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery', 'TouchGestures'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(require('jquery'), require('TouchGestures'));
  } else {
    // Browser globals
    factory(jQuery, TouchGestures);
  }
}(function(_jq, TouchGestures) {

  /**
   * Extends jQuery/Zepto to provide a `touchgestures()` method.
   * Initializes TouchGestures on the selected element(s) and stores the instance in data.
   * @param {Object} [config] - Configuration options for TouchGestures.
   * @returns {jQuery} - The jQuery object for chaining.
   */
  _jq.fn.touchgestures = function(config) {
    return this.each(function() {
      const $element = _jq(this);
      if (!$element.data("touchGestures")) {
        $element.data("touchGestures", new TouchGestures($element[0], config));
      }
    });
  };

  /**
   * Overrides the default `emit` method of TouchGestures.Manager.prototype
   * to also trigger jQuery custom events on the element.
   * This allows for standard jQuery event binding (`.on('tap', ...)`).
   */
  TouchGestures.Manager.prototype.emit = (function(originalEmit) {
    return function(eventType, eventData) {
      originalEmit.call(this, eventType, eventData); // Call original emit first
      _jq(this.element).trigger({
        type: eventType,
        gesture: eventData // Attach gesture data to the jQuery event object
      });
    };
  })(TouchGestures.Manager.prototype.emit);

}));;
(function(_jq) {
  _jq.fn.accordio = function(configOptions) {
    const defaultSettings = {
      isAccordion: undefined // Can be true/false/undefined (undefined implies auto-detect from data-accordio)
    };

    configOptions = _jq.extend(defaultSettings, configOptions);

    return this.each(function() {
      const $currentElement = _jq(this);
      let $sectionHeaders = $currentElement.find('.accordio-header');
      const layoutMode = $currentElement.data("accordio"); // Read data attribute for mode

      // Remove any previously bound event handlers to prevent duplicates
      $currentElement.off('.accordio');
      $currentElement.children().off('.accordio');


      /****************
       * Core Logic Functions
       ****************/

      /**
       * Handles opening/closing logic for accordion mode.
       * Only one panel can be open at a time.
       * @param {jQuery} clickedHeader - The header that was clicked.
       */
      function handleAccordionToggle(clickedHeader) {
        $sectionHeaders = $currentElement.find('.accordio-header'); // Re-query headers in case DOM changed
        const $targetPanel = clickedHeader.parent();
        const $targetBody = clickedHeader.siblings('.accordio-body');

        // Toggle 'active' class on the clicked panel
        $targetPanel.toggleClass('active');

        if ($targetPanel.hasClass('active')) {
          // If activated, slide down the body
          $targetBody.stop(true, false).motionAnimate({
            height: 'show'
          }, {
            animationDuration: 350,
            curveTransform: "easeOutQuart",
            queue: false
          });
        } else {
          // If deactivated, slide up the body
          $targetBody.stop(true, false).motionAnimate({
            height: 'hide'
          }, {
            animationDuration: 350,
            curveTransform: "easeOutQuart",
            queue: false
          });
        }

        // Close all other panels
        $sectionHeaders.not(clickedHeader).parent().removeClass('active');
        $sectionHeaders.not(clickedHeader).siblings('.accordio-body').stop(true, false).motionAnimate({
          height: 'hide'
        }, {
          animationDuration: 350,
          curveTransform: "easeOutQuart",
          queue: false
        });
      }

      /**
       * Handles opening/closing logic for expandable mode.
       * Multiple panels can be open simultaneously.
       * @param {jQuery} clickedHeader - The header that was clicked.
       */
      function handleExpandableToggle(clickedHeader) {
        const $targetPanel = clickedHeader.parent();
        const $targetBody = clickedHeader.siblings('.accordio-body');

        $targetPanel.toggleClass('active');

        if ($targetPanel.hasClass('active')) {
          $targetBody.stop(true, false).motionAnimate({
            height: 'show'
          }, {
            animationDuration: 350,
            curveTransform: "easeOutQuart",
            queue: false
          });
        } else {
          $targetBody.stop(true, false).motionAnimate({
            height: 'hide'
          }, {
            animationDuration: 350,
            curveTransform: "easeOutQuart",
            queue: false
          });
        }
      }

      /*****  End Core Logic Functions  *****/


      // Determine behavior: accordion or expandable
      const isAccordionMode = configOptions.isAccordion || layoutMode === "accordion" || layoutMode === undefined;

      if (isAccordionMode) {
        // Event delegation for accordion
        $currentElement.on('click.accordio', '.accordio-header', function(event) {
          handleAccordionToggle(_jq(event.currentTarget));
        });

        // Open the first active panel on initialization
        const $firstActive = $sectionHeaders.filter('.active').first();
        if ($firstActive.length) {
          handleAccordionToggle($firstActive);
        }
      } else { // Handle Expandables
        // Event delegation for expandables
        $currentElement.on('click.accordio', '.accordio-header', function(event) {
          handleExpandableToggle(_jq(event.currentTarget));
        });

        // Open any panels that have the 'active' class on initialization
        $sectionHeaders.filter('.active').each(function() {
          handleExpandableToggle(_jq(this));
        });
      }

    });
  };

  // Auto-initialize accordions on document ready
  _jq(document).ready(function() {
    _jq('.accordio').accordio();
  });
}(jQuery));

;
(function(_jq) {

  _jq.fn.flyoutMenu = function(config) {
    const defaultOptions = {
      inTransitionDuration: 300,
      outTransitionDuration: 225,
      constrainWidth: true, // If true, flyout width matches activator
      enableHover: true,
      alignment: 'left',
      offsetSpacing: 0, // Additional spacing from edge
      containerElement: 'body' // Element where the flyout menu will be appended
    };

    config = _jq.extend(defaultOptions, config);

    this.each(function() {
      const $activator = _jq(this);

      // The flyout menu element itself (from data-activates attribute)
      const $flyoutTarget = _jq("#" + $activator.attr('data-activates'));

      // Guard clause: if no flyout target found, do nothing.
      if (!$flyoutTarget.length) {
        console.warn("FlyoutMenu: Target element not found for activator:", $activator);
        return;
      }

      /**
       * Updates configuration options from data attributes on the activator.
       * Data attributes take precedence over initial config.
       */
      function updateConfigFromData() {
        if ($activator.data('inDuration') !== undefined) config.inTransitionDuration = $activator.data('inDuration');
        if ($activator.data('outDuration') !== undefined) config.outTransitionDuration = $activator.data('outDuration');
        if ($activator.data('constrainwidth') !== undefined) config.constrainWidth = $activator.data('constrainwidth');
        if ($activator.data('hover') !== undefined) config.enableHover = $activator.data('hover');
        if ($activator.data('alignment') !== undefined) config.alignment = $activator.data('alignment');
        if ($activator.data('gutter') !== undefined) config.offsetSpacing = $activator.data('gutter');
      }

      updateConfigFromData(); // Initial update

      // Move Flyout menu to the specified container. This ensures absolute/fixed positioning works correctly.
      if (!($flyoutTarget.parent().is(_jq(config.containerElement)))) {
        $flyoutTarget.detach();
        _jq(config.containerElement).append($flyoutTarget);
      }

      /**
       * Helper function to position and resize the flyout menu.
       * Used by both hover and click handlers.
       */
      function positionFlyoutMenu() {
        updateConfigFromData(); // Re-read data attributes on each open

        const flyoutContentHeight = $flyoutTarget.outerHeight(); // Get actual height before animation
        const activatorWidth = $activator.outerWidth();

        if (config.constrainWidth) {
          $flyoutTarget.css('width', activatorWidth);
        }

        // Calculate horizontal position based on alignment and spacing
        let horizontalOffset = 0;
        let spacing = config.offsetSpacing;
        if (config.alignment === 'right') {
          horizontalOffset = activatorWidth - $flyoutTarget.outerWidth();
          spacing = spacing * -1; // Negative spacing for right alignment
        }

        const activatorOffset = $activator.offset();
        const viewportScrollTop = _jq(window).scrollTop();
        const viewportScrollLeft = _jq(window).scrollLeft();

        // Check if activator or any parent has fixed positioning
        const isFixedPositioned = checkIfFixedPositioned($activator[0]);

        if (isFixedPositioned) {
          $flyoutTarget.css({
            display: 'block',
            position: 'fixed',
            height: 0,
            top: activatorOffset.top - viewportScrollTop,
            left: activatorOffset.left + horizontalOffset + spacing
          });
        } else {
          $flyoutTarget.css({
            display: 'block',
            top: activatorOffset.top + activatorWidth, // Position below activator
            left: activatorOffset.left + horizontalOffset + spacing,
            height: 0
          });
        }

        // Animate opacity and height to reveal the flyout
        $flyoutTarget.motionAnimate({
          opacity: 1
        }, {
          animationDuration: config.inTransitionDuration,
          queue: false,
          curveTransform: 'easeOutQuad'
        }).motionAnimate({
          height: flyoutContentHeight
        }, {
          animationDuration: config.inTransitionDuration,
          queue: false,
          curveTransform: 'easeOutCubic',
          onComplete: function() {
            $flyoutTarget.css('overflow-y', 'auto'); // Enable scrolling if content is too long
          }
        });
      }

      /**
       * Checks if an element or any of its parents has a CSS position of 'fixed'.
       * @param {HTMLElement} element - The DOM element to check.
       * @returns {boolean} - True if fixed positioned, false otherwise.
       */
      function checkIfFixedPositioned(element) {
        const $element = _jq(element);
        const $elementsToCheck = $element.add($element.parents());
        let isFixed = false;
        $elementsToCheck.each(function() {
          if (_jq(this).css("position") === "fixed") {
            isFixed = true;
            return false; // Break out of each loop
          }
        });
        return isFixed;
      }


      // --- Event Handlers ---

      // Hover behavior
      if (config.enableHover) {
        $activator.on('mouseenter.flyout', function(e) {
          positionFlyoutMenu();
        });

        $flyoutTarget.on('mouseleave.flyout', function(e) {
          $flyoutTarget.motionAnimate({
            opacity: 0
          }, {
            animationDuration: config.outTransitionDuration,
            curveTransform: 'easeOutQuad',
            onComplete: function() {
              $flyoutTarget.css({
                display: 'none',
                'overflow-y': '' // Reset overflow
              });
            }
          });
        });
      } else { // Click behavior
        // Track if the menu is currently open
        let menuIsOpen = false;

        $activator.on('click.flyout', function(e) {
          e.preventDefault(); // Prevent default link behavior
          e.stopPropagation(); // Stop propagation to prevent document click from closing immediately

          if (!menuIsOpen) {
            positionFlyoutMenu();
            menuIsOpen = true;

            // Bind a global click handler to close the menu when clicking outside
            _jq(document).on('click.flyoutClose' + $flyoutTarget.attr('id'), function(docClickEvent) {
              // If click is not on the flyout itself and not on the activator
              if (!$flyoutTarget.is(docClickEvent.target) && !$activator.is(docClickEvent.target) && $flyoutTarget.has(docClickEvent.target).length === 0) {
                $flyoutTarget.motionAnimate({
                  opacity: 0
                }, {
                  animationDuration: config.outTransitionDuration,
                  curveTransform: 'easeOutQuad',
                  onComplete: function() {
                    $flyoutTarget.css({
                      display: 'none',
                      'overflow-y': ''
                    });
                    menuIsOpen = false;
                  }
                });
                // Unbind this specific document click handler once menu is closed
                _jq(document).off('click.flyoutClose' + $flyoutTarget.attr('id'));
              }
            });
          } else {
            // If already open, close it on activator click
            $flyoutTarget.motionAnimate({
              opacity: 0
            }, {
              animationDuration: config.outTransitionDuration,
              curveTransform: 'easeOutQuad',
              onComplete: function() {
                $flyoutTarget.css({
                  display: 'none',
                  'overflow-y': ''
                });
                menuIsOpen = false;
              }
            });
            _jq(document).off('click.flyoutClose' + $flyoutTarget.attr('id')); // Remove document listener
          }
        });
      }

      // Optional: reposition on window resize (can be performance heavy for complex layouts)
      _jq(window).on('resize.flyout', function() {
        if ($flyoutTarget.is(':visible')) {
          // Re-calculate position if menu is open and window resized
          positionFlyoutMenu();
        }
      });
    });
  };
}(jQuery));

;
(function(_jq) {
  _jq.fn.extend({
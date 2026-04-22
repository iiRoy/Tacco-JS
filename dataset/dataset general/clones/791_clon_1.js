/*
 * Materialize v0.95.1 (http://materializecss.com)
 * Copyright 2014-2015 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 *
 * This section includes the jQuery Easing plugin, which provides advanced easing functions
 * for smoother animations beyond the standard 'swing' and 'linear' options.
 *
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * It extends jQuery's built-in easing capabilities, introduced in jQuery 1.1,
 * to offer a wider array of easing options for animation effects.
 *
 * TERMS OF USE - jQuery Easing
 *
 * This code is open source, distributed under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions, and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions, and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of the author nor the names of contributors may be used
 *    to endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// Easing function parameters:
// x: progress (not used in most functions, but part of the signature for compatibility)
// t: current time
// b: beginning value
// c: change in value (total displacement)
// d: duration of the animation

jQuery.easing['jswing'] = jQuery.easing['swing']; // Alias 'jswing' to 'swing'

jQuery.extend( jQuery.easing, // Extend the jQuery.easing object with new functions
{
    def: 'easeOutQuad', // Default easing function
    swing: function (x, t, b, c, d) {
        // This is the default 'swing' easing, which internally calls 'easeOutQuad'.
        // alert(jQuery.easing.default); // Original debug comment, kept for Type I fidelity.
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        // Quadratic easing in - accelerating from zero velocity.
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        // Quadratic easing out - decelerating to zero velocity.
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        // Quadratic easing in/out - acceleration until halfway, then deceleration.
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        // Cubic easing in - accelerating from zero velocity.
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        // Cubic easing out - decelerating to zero velocity.
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        // Cubic easing in/out - acceleration until halfway, then deceleration.
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        // Quartic easing in - accelerating from zero velocity.
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        // Quartic easing out - decelerating to zero velocity.
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        // Quartic easing in/out - acceleration until halfway, then deceleration.
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        // Quintic easing in - accelerating from zero velocity.
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        // Quintic easing out - decelerating to zero velocity.
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        // Quintic easing in/out - acceleration until halfway, then deceleration.
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        // Sine easing in - accelerating from zero velocity.
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        // Sine easing out - decelerating to zero velocity.
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        // Sine easing in/out - acceleration until halfway, then deceleration.
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        // Exponential easing in - accelerating from zero velocity.
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        // Exponential easing out - decelerating to zero velocity.
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        // Exponential easing in/out - acceleration until halfway, then deceleration.
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        // Circular easing in - accelerating from zero velocity.
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        // Circular easing out - decelerating to zero velocity.
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        // Circular easing in/out - acceleration until halfway, then deceleration.
        if ((t /= d / 2) < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        // Elastic easing in - accelerating with a spring-like effect.
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else {
            var s = p / (2 * Math.PI) * Math.asin (c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        // Elastic easing out - decelerating with a spring-like effect.
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else {
            var s = p / (2 * Math.PI) * Math.asin (c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        // Elastic easing in/out - acceleration and deceleration with a spring-like effect.
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d / 2) == 2) {
            return b + c;
        }
        if (!p) {
            p = d * (.3 * 1.5);
        }
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else {
            var s = p / (2 * Math.PI) * Math.asin (c / a);
        }
        if (t < 1) {
            return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        // Back easing in - starts by pulling back slightly, then accelerating.
        if (s == undefined) {
            s = 1.70158;
        }
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        // Back easing out - overshoots target slightly, then settles.
        if (s == undefined) {
            s = 1.70158;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        // Back easing in/out - combines in and out back easing.
        if (s == undefined) {
            s = 1.70158;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        // Bounce easing in - bounces at the beginning.
        // This is implemented by reversing the easeOutBounce.
        return c - jQuery.easing.easeOutBounce (x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        // Bounce easing out - bounces at the end.
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        // Bounce easing in/out - bounces at both ends.
        if (t < d / 2) {
            return jQuery.easing.easeInBounce (x, t * 2, 0, c, d) * .5 + b;
        }
        return jQuery.easing.easeOutBounce (x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});

/*
 * TERMS OF USE - EASING EQUATIONS
 *
 * This section details the terms of use for the easing equations,
 * which are open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions, and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions, and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of the author nor the names of contributors may be used
 *    to endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

;/*! VelocityJS.org (1.1.0). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */

// Immediately-invoked function expression (IIFE) to encapsulate the VelocityJS jQuery shim.
!function(e){
    // Helper function to check if an object is array-like or a DOM node list.
    function t(e){
        var t=e.length,
            r=$.type(e);
        return"function"===r||$.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===r||0===t||"number"==typeof t&&t>0&&t-1 in e
    }

    // Check if jQuery is not already loaded.
    if(!e.jQuery){
        // Define a basic jQuery-like object if jQuery is not present.
        var $=function(e,t){return new $.fn.init(e,t)};

        // Check if an object is a window object.
        $.isWindow=function(e){return null!=e&&e==e.window};

        // Determine the type of an object.
        $.type=function(e){
            return null==e?e+"":"object"==typeof e||"function"==typeof e?a[o.call(e)]||"object":typeof e
        };

        // Check if an object is an array.
        $.isArray=Array.isArray||function(e){return"array"===$.type(e)};

        // Check if an object is a plain object (created via {} or new Object()).
        $.isPlainObject=function(e){
            var t;
            if(!e||"object"!==$.type(e)||e.nodeType||$.isWindow(e))return!1;
            try{
                if(e.constructor&&!n.call(e,"constructor")&&!n.call(e.constructor.prototype,"isPrototypeOf"))return!1
            }catch(r){
                return!1
            }
            for(t in e);
            return void 0===t||n.call(e,t)
        };

        // Iterate over an object or array.
        $.each=function(e,r,a){
            var n,o=0,i=e.length,s=t(e);
            if(a){
                if(s)for(;i>o&&(n=r.apply(e[o],a),n!==!1);o++);
                else for(o in e)if(n=r.apply(e[o],a),n===!1)break
            }else if(s)for(;i>o&&(n=r.call(e[o],o,e[o]),n!==!1);o++);
            else for(o in e)if(n=r.call(e[o],o,e[o]),n===!1)break;
            return e
        };

        // Store and retrieve data associated with an element.
        $.data=function(e,t,a){
            if(void 0===a){
                var n=e[$.expando],o=n&&r[n];
                if(void 0===t)return o;
                if(o&&t in o)return o[t]
            }else if(void 0!==t){
                var n=e[$.expando]||(e[$.expando]=++$.uuid);
                return r[n]=r[n]||{},r[n][t]=a,a
            }
        };

        // Remove data associated with an element.
        $.removeData=function(e,t){
            var a=e[$.expando],n=a&&r[a];
            n&&$.each(t,function(e,t){delete n[t]})
        };

        // Merge the contents of two or more objects together into the first object.
        $.extend=function(){
            var e,t,r,a,n,o,i=arguments[0]||{},s=1,l=arguments.length,u=!1;
            for("boolean"==typeof i&&(u=i,i=arguments[s]||{},s++),"object"!=typeof i&&"function"!==$.type(i)&&(i={}),s===l&&(i=this,s--);l>s;s++)if(null!=(n=arguments[s]))for(a in n)e=i[a],r=n[a],i!==r&&(u&&r&&($.isPlainObject(r)||(t=$.isArray(r)))?(t?(t=!1,o=e&&$.isArray(e)?e:[]):o=e&&$.isPlainObject(e)?e:{},i[a]=$.extend(u,o,r)):void 0!==r&&(i[a]=r));
            return i
        };

        // Manage a queue of functions to be executed on an element.
        $.queue=function(e,r,a){
            function n(e,r){
                var a=r||[];
                return null!=e&&(t(Object(e))?!function(e,t){
                    for(var r=+t.length,a=0,n=e.length;r>a;)e[n++]=t[a++];
                    if(r!==r)for(;void 0!==t[a];)e[n++]=t[a++];
                    return e.length=n,e
                }(a,"string"==typeof e?[e]:e):[].push.call(a,e)),a
            }
            if(e){
                r=(r||"fx")+"queue";
                var o=$.data(e,r);
                return a?(!o||$.isArray(a)?o=$.data(e,r,n(a)):o.push(a),o):o||[]
            }
        };

        // Remove a function from the queue and invoke the next one.
        $.dequeue=function(e,t){
            $.each(e.nodeType?[e]:e,function(e,r){
                t=t||"fx";
                var a=$.queue(r,t),n=a.shift();
                "inprogress"===n&&(n=a.shift()),n&&("fx"===t&&a.unshift("inprogress"),n.call(r,function(){$.dequeue(r,t)}))
            })
        };

        // Basic jQuery-like prototype for DOM manipulation.
        $.fn=$.prototype={
            init:function(e){
                if(e.nodeType)return this[0]=e,this;
                throw new Error("Not a DOM node.")
            },
            offset:function(){
                var t=this[0].getBoundingClientRect?this[0].getBoundingClientRect():{top:0,left:0};
                return{top:t.top+(e.pageYOffset||document.scrollTop||0)-(document.clientTop||0),left:t.left+(e.pageXOffset||document.scrollLeft||0)-(document.clientLeft||0)}
            },
            position:function(){
                function e(){
                    for(var e=this.offsetParent||document;e&&"html"===!e.nodeType.toLowerCase&&"static"===e.style.position;)e=e.offsetParent;
                    return e||document
                }
                var t=this[0],e=e.apply(t),r=this.offset(),a=/^(?:body|html)$/i.test(e.nodeName)?{top:0,left:0}:$(e).offset();
                return r.top-=parseFloat(t.style.marginTop)||0,r.left-=parseFloat(t.style.marginLeft)||0,e.style&&(a.top+=parseFloat(e.style.borderTopWidth)||0,a.left+=parseFloat(e.style.borderLeftWidth)||0),{top:r.top-a.top,left:r.left-a.left}
            }
        };

        // Internal data storage for jQuery shim.
        var r={};
        $.expando="velocity"+(new Date).getTime(); // Unique ID for data storage.
        $.uuid=0; // Counter for unique IDs.

        // Map for object type detection.
        for(var a={},n=a.hasOwnProperty,o=a.toString,i="Boolean Number String Function Array Date RegExp Object Error".split(" "),s=0;s<i.length;s++)a["[object "+i[s]+"]"]=i[s].toLowerCase();

        // Ensure init prototype points to $.fn for chaining.
        $.fn.init.prototype=$.fn;

        // Expose Velocity utilities.
        e.Velocity={Utilities:$};
    }
}(window); // Pass window object to IIFE.

// VelocityJS Core Library
// This section defines the main Velocity animation engine.
// It uses an IIFE to ensure proper scope and dependencies.
!function(e){
    // Check module environment for CommonJS or AMD.
    "object"==typeof module&&"object"==typeof module.exports?module.exports=e():"function"==typeof define&&define.amd?define(e):e()
}(function(){
    // Main Velocity function definition.
    return function(e,t,r,a){
        // Helper to filter out null/undefined elements from an array.
        function n(e){
            for(var t=-1,r=e?e.length:0,a=[];++t<r;){
                var n=e[t];
                n&&a.push(n)
            }
            return a
        }

        // Normalize elements into an array.
        function o(e){
            return g.isWrapped(e)?e=[].slice.call(e):g.isNode(e)&&(e=[e]),e
        }

        // Get Velocity data for an element.
        function i(e){
            var t=$.data(e,"velocity");
            return null===t?a:t
        }

        // Create a step function for easing.
        function s(e){
            return function(t){return Math.round(t*e)*(1/e)}
        }

        // Generate a Bezier curve easing function.
        function l(e,r,a,n){
            // Cubic Bezier helper functions.
            function o(e,t){return 1-3*t+3*e}
            function i(e,t){return 3*t-6*e}
            function s(e){return 3*e}
            function l(e,t,r){return((o(t,r)*e+i(t,r))*e+s(t))*e}
            function u(e,t,r){return 3*o(t,r)*e*e+2*i(t,r)*e+s(t)}

            // Newton-Raphson method for finding the root.
            function c(t,r){
                for(var n=0;m>n;++n){
                    var o=u(r,e,a);
                    if(0===o)return r;
                    var i=l(r,e,a)-t;
                    r-=i/o
                }
                return r
            }

            // Pre-calculate samples for faster lookup.
            function p(){for(var t=0;b>t;++t)w[t]=l(t*x,e,a)}

            // Binary search for approximating the Bezier value.
            function f(t,r,n){
                var o,i,s=0;
                do i=r+(n-r)/2,o=l(i,e,a)-t,o>0?n=i:r=i;while(Math.abs(o)>h&&++s<v);
                return i
            }

            // Get the Bezier value for a given time `t`.
            function d(t){
                for(var r=0,n=1,o=b-1;n!=o&&w[n]<=t;++n)r+=x;
                --n;
                var i=(t-w[n])/(w[n+1]-w[n]),s=r+i*x,l=u(s,e,a);
                return l>=y?c(t,s):0==l?s:f(t,r,r+x)
            }

            // Initialize Bezier curve (pre-calculation).
            function g(){V=!0,(e!=r||a!=n)&&p()}

            var m=4,y=.001,h=1e-7,v=10,b=11,x=1/(b-1),S="Float32Array"in t;
            // Validate input arguments.
            if(4!==arguments.length)return!1;
            for(var P=0;4>P;++P)if("number"!=typeof arguments[P]||isNaN(arguments[P])||!isFinite(arguments[P]))return!1;

            // Clamp control points between 0 and 1.
            e=Math.min(e,1),a=Math.min(a,1),e=Math.max(e,0),a=Math.max(a,0);

            var w=S?new Float32Array(b):new Array(b),V=!1,
                C=function(t){
                    // Ensure Bezier is initialized.
                    return V||g(),
                        // Handle edge cases for t=0 and t=1.
                        e===r&&a===n?t:0===t?0:1===t?1:l(d(t),r,n)
                };
            // Expose control points for debugging.
            C.getControlPoints=function(){return[{x:e,y:r},{x:a,y:n}]};

            var T="generateBezier("+[e,r,a,n]+")";
            C.toString=function(){return T},C
        }

        // Resolve easing function based on input.
        function u(e,t){
            var r=e;
            return g.isString(e)?v.Easings[e]||(r=!1):r=g.isArray(e)&&1===e.length?s.apply(null,e):g.isArray(e)&&2===e.length?b.apply(null,e.concat([t])):g.isArray(e)&&4===e.length?l.apply(null,e):!1,r===!1&&(r=v.Easings[v.defaults.easing]?v.defaults.easing:h),r
        }

        // Main animation loop / ticker.
        function c(e){
            if(e)for(var t=(new Date).getTime(),r=0,n=v.State.calls.length;n>r;r++)if(v.State.calls[r]){
                var o=v.State.calls[r],s=o[0],l=o[2],u=o[3],f=!!u;
                u||(u=v.State.calls[r][3]=t-16); // Set start time if not already set.

                for(var d=Math.min((t-u)/l.duration,1),m=0,y=s.length;y>m;m++){
                    var h=s[m],b=h.element;
                    if(i(b)){
                        var S=!1;
                        // Handle display property changes.
                        if(l.display!==a&&null!==l.display&&"none"!==l.display){
                            if("flex"===l.display){
                                var w=["-webkit-box","-moz-box","-ms-flexbox","-webkit-flex"];
                                $.each(w,function(e,t){x.setPropertyValue(b,"display",t)})
                            }
                            x.setPropertyValue(b,"display",l.display)
                        }
                        // Handle visibility property changes.
                        l.visibility!==a&&"hidden"!==l.visibility&&x.setPropertyValue(b,"visibility",l.visibility);

                        // Iterate through properties to animate.
                        for(var V in h)if("element"!==V){
                            var C=h[V],
                                T,
                                k=g.isString(C.easing)?v.Easings[C.easing]:C.easing;

                            // Calculate current value based on easing progress.
                            if(1===d)T=C.endValue;
                            else if(T=C.startValue+(C.endValue-C.startValue)*k(d),!f&&T===C.currentValue)continue;

                            // Update current value and apply hooks/normalizations.
                            if(C.currentValue=T,x.Hooks.registered[V]){
                                var A=x.Hooks.getRoot(V),F=i(b).rootPropertyValueCache[A];
                                F&&(C.rootPropertyValue=F)
                            }
                            var E=x.setPropertyValue(b,V,C.currentValue+(0===parseFloat(T)?"":C.unitType),C.rootPropertyValue,C.scrollData);
                            x.Hooks.registered[V]&&(i(b).rootPropertyValueCache[A]=x.Normalizations.registered[A]?x.Normalizations.registered[A]("extract",null,E[1]):E[1]);
                            "transform"===E[0]&&(S=!0)
                        }
                        // Mobile hardware acceleration.
                        l.mobileHA&&i(b).transformCache.translate3d===a&&(i(b).transformCache.translate3d="(0px, 0px, 0px)",S=!0);
                        S&&x.flushTransformCache(b)
                    }
                }
                // Reset display/visibility flags after animation step.
                l.display!==a&&"none"!==l.display&&(v.State.calls[r][2].display=!1);
                l.visibility!==a&&"hidden"!==l.visibility&&(v.State.calls[r][2].visibility=!1);

                // Call progress callback if defined.
                l.progress&&l.progress.call(o[1],o[1],d,Math.max(0,u+l.duration-t),u);

                // If animation is complete, clean up.
                1===d&&p(r)
            }
            // Continue ticking if there are active animations.
            v.State.isTicking&&P(c)
        }

        // Clean up completed animations.
        function p(e,t){
            if(!v.State.calls[e])return!1;
            for(var r=v.State.calls[e][0],n=v.State.calls[e][1],o=v.State.calls[e][2],s=v.State.calls[e][4],l=!1,u=0,c=r.length;c>u;u++){
                var p=r[u].element;
                // Reset display/visibility if animation is not looping.
                if(t||o.loop||("none"===o.display&&x.setPropertyValue(p,"display",o.display),"hidden"===o.visibility&&x.setPropertyValue(p,"visibility",o.visibility)),
                    o.loop!==!0&&($.queue(p)[1]===a||!/\.velocityQueueEntryFlag/i.test($.queue(p)[1]))&&i(p)){
                    // Mark element as not animating.
                    i(p).isAnimating=!1,i(p).rootPropertyValueCache={};
                    var f=!1;
                    // Clear transform cache if properties changed.
                    $.each(x.Lists.transforms3D,function(e,t){
                        var r=/^scale/.test(t)?1:0,n=i(p).transformCache[t];
                        i(p).transformCache[t]!==a&&new RegExp("^\\("+r+"[^.]").test(n)&&(f=!0,delete i(p).transformCache[t])
                    });
                    o.mobileHA&&(f=!0,delete i(p).transformCache.translate3d);
                    f&&x.flushTransformCache(p);
                    x.Values.removeClass(p,"velocity-animating")
                }
                // Call complete callback if not looping and last element.
                if(!t&&o.complete&&!o.loop&&u===c-1)try{o.complete.call(n,n)}catch(d){setTimeout(function(){throw d},1)}
                // Handle looping animations.
                s&&o.loop!==!0&&s(n);
                o.loop!==!0||t||($.each(i(p).tweensContainer,function(e,t){/^rotate/.test(e)&&360===parseFloat(t.endValue)&&(t.endValue=0,t.startValue=360)}),v(p,"reverse",{loop:!0,delay:o.delay}));
                // Dequeue next animation if not disabled.
                o.queue!==!1&&$.dequeue(p,o.queue)
            }
            // Remove the completed call from the state.
            v.State.calls[e]=!1;
            // Check if any animations are still running.
            for(var g=0,m=v.State.calls.length;m>g;g++)if(v.State.calls[g]!==!1){l=!0;break}
            // Stop ticking if no animations are active.
            l===!1&&(v.State.isTicking=!1,delete v.State.calls,v.State.calls=[])
        }

        // Detect IE version for compatibility.
        var f=function(){
            if(r.documentMode)return r.documentMode;
            for(var e=7;e>4;e--){
                var t=r.createElement("div");
                if(t.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",t.getElementsByTagName("span").length)return t=null,e
            }
            return a
        }(),
        // RequestAnimationFrame polyfill.
        d=function(){
            var e=0;
            return t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(t){
                var r=(new Date).getTime(),a;
                return a=Math.max(0,16-(r-e)),e=r+a,setTimeout(function(){t(r+a)},a)
            }
        }(),
        // Utility functions for type checking and object manipulation.
        g={
            isString:function(e){return"string"==typeof e},
            isArray:Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},
            isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)},
            isNode:function(e){return e&&e.nodeType},
            isNodeList:function(e){return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e))&&e.length!==a&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)},
            isWrapped:function(e){return e&&(e.jquery||t.Zepto&&t.Zepto.zepto.isZ(e))},
            isSVG:function(e){return t.SVGElement&&e instanceof t.SVGElement},
            isEmptyObject:function(e){for(var t in e)return!1;return!0}
        },
        $,m=!1;

        // Determine which jQuery-like utility library to use.
        if(e.fn&&e.fn.jquery?($=e,m=!0):$=t.Velocity.Utilities,8>=f&&!m)throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
        if(7>=f)return void(jQuery.fn.velocity=jQuery.fn.animate); // Fallback for IE7.

        var y=400,h="swing",
            // Velocity's main configuration and state object.
            v={
                State:{
                    isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    isAndroid:/Android/i.test(navigator.userAgent),
                    isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),
                    isChrome:t.chrome,
                    isFirefox:/Firefox/i.test(navigator.userAgent),
                    prefixElement:r.createElement("div"),
                    prefixMatches:{},
                    scrollAnchor:null,
                    scrollPropertyLeft:null,
                    scrollPropertyTop:null,
                    isTicking:!1,
                    calls:[]
                },
                CSS:{},
                Utilities:$,
                Redirects:{},
                Easings:{},
                Promise:t.Promise, // Use native Promise if available.
                defaults:{
                    queue:"",
                    duration:y,
                    easing:h,
                    begin:a,
                    complete:a,
                    progress:a,
                    display:a,
                    visibility:a,
                    loop:!1,
                    delay:!1,
                    mobileHA:!0,
                    _cacheValues:!0
                },
                init:function(e){
                    // Initialize Velocity data for an element.
                    $.data(e,"velocity",{
                        isSVG:g.isSVG(e),
                        isAnimating:!1,
                        computedStyle:null,
                        tweensContainer:null,
                        rootPropertyValueCache:{},
                        transformCache:{}
                    })
                },
                hook:null,
                mock:!1,
                version:{major:1,minor:1,patch:0},
                debug:!1
            };

        // Determine scroll anchor and properties based on browser.
        t.pageYOffset!==a?(v.State.scrollAnchor=t,v.State.scrollPropertyLeft="pageXOffset",v.State.scrollPropertyTop="pageYOffset"):(v.State.scrollAnchor=r.documentElement||r.body.parentNode||r.body,v.State.scrollPropertyLeft="scrollLeft",v.State.scrollPropertyTop="scrollTop");

        // Spring physics simulation for easing.
        var b=function(){
            function e(e){return-e.tension*e.x-e.friction*e.v}
            function t(t,r,a){var n={x:t.x+a.dx*r,v:t.v+a.dv*r,tension:t.tension,friction:t.friction};return{dx:n.v,dv:e(n)}}
            function r(r,a){var n={dx:r.v,dv:e(r)},o=t(r,.5*a,n),i=t(r,.5*a,o),s=t(r,a,i),l=1/6*(n.dx+2*(o.dx+i.dx)+s.dx),u=1/6*(n.dv+2*(o.dv+i.dv)+s.dv);return r.x=r.x+l*a,r.v=r.v+u*a,r}
            return function a(e,t,n){
                var o={x:-1,v:0,tension:null,friction:null},i=[0],s=0,l=1e-4,u=.016,c,p,f;
                for(e=parseFloat(e)||500,t=parseFloat(t)||20,n=n||null,o.tension=e,o.friction=t,c=null!==n,c?(s=a(e,t),p=s/n*u):p=u;;)if(f=r(f||o,p),i.push(1+f.x),s+=16,!(Math.abs(f.x)>l&&Math.abs(f.v)>l))break;
                return c?function(e){return i[e*(i.length-1)|0]}:s
            }
        }();

        // Standard easing functions.
        v.Easings={
            linear:function(e){return e},
            swing:function(e){return.5-Math.cos(e*Math.PI)/2},
            spring:function(e){return 1-Math.cos(4.5*e*Math.PI)*Math.exp(6*-e)}
        };

        // Add CSS Bezier curve easings.
        $.each([
            ["ease",[.25,.1,.25,1]],["ease-in",[.42,0,1,1]],["ease-out",[0,0,.58,1]],["ease-in-out",[.42,0,.58,1]],
            ["easeInSine",[.47,0,.745,.715]],["easeOutSine",[.39,.575,.565,1]],["easeInOutSine",[.445,.05,.55,.95]],
            ["easeInQuad",[.55,.085,.68,.53]],["easeOutQuad",[.25,.46,.45,.94]],["easeInOutQuad",[.455,.03,.515,.955]],
            ["easeInCubic",[.55,.055,.675,.19]],["easeOutCubic",[.215,.61,.355,1]],["easeInOutCubic",[.645,.045,.355,1]],
            ["easeInQuart",[.895,.03,.685,.22]],["easeOutQuart",[.165,.84,.44,1]],["easeInOutQuart",[.77,0,.175,1]],
            ["easeInQuint",[.755,.05,.855,.06]],["easeOutQuint",[.23,1,.32,1]],["easeInOutQuint",[.86,0,.07,1]],
            ["easeInExpo",[.95,.05,.795,.035]],["easeOutExpo",[.19,1,.22,1]],["easeInOutExpo",[1,0,0,1]],
            ["easeInCirc",[.6,.04,.98,.335]],["easeOutCirc",[.075,.82,.165,1]],["easeInOutCirc",[.785,.135,.15,.86]]
        ],function(e,t){v.Easings[t[0]]=l.apply(null,t[1])});

        // Velocity's CSS module for property manipulation.
        var x=v.CSS={
            RegEx:{
                isHex:/^#([A-f\d]{3}){1,2}$/i,
                valueUnwrap:/^[A-z]+\((.*)\)$/i,
                wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
                valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
            },
            Lists:{
                colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],
                transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],
                transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]
            },
            Hooks:{
                templates:{
                    textShadow:["Color X Y Blur","black 0px 0px 0px"],
                    boxShadow:["Color X Y Blur Spread","black 0px 0px 0px 0px"],
                    clip:["Top Right Bottom Left","0px 0px 0px 0px"],
                    backgroundPosition:["X Y","0% 0%"],
                    transformOrigin:["X Y Z","50% 50% 0px"],
                    perspectiveOrigin:["X Y","50% 50%"]
                },
                registered:{},
                // Register hooks for CSS properties.
                register:function(){
                    for(var e=0;e<x.Lists.colors.length;e++){
                        var t="color"===x.Lists.colors[e]?"0 0 0 1":"255 255 255 1";
                        x.Hooks.templates[x.Lists.colors[e]]=["Red Green Blue Alpha",t]
                    }
                    var r,a,n;
                    if(f)for(r in x.Hooks.templates){
                        a=x.Hooks.templates[r],n=a[0].split(" ");
                        var o=a[1].match(x.RegEx.valueSplit);
                        "Color"===n[0]&&(n.push(n.shift()),o.push(o.shift()),x.Hooks.templates[r]=[n.join(" "),o.join(" ")])
                    }
                    for(r in x.Hooks.templates){
                        a=x.Hooks.templates[r],n=a[0].split(" ");
                        for(var e in n){
                            var i=r+n[e],s=e;
                            x.Hooks.registered[i]=[r,s]
                        }
                    }
                },
                getRoot:function(e){
                    var t=x.Hooks.registered[e];
                    return t?t[0]:e
                },
                cleanRootPropertyValue:function(e,t){
                    return x.RegEx.valueUnwrap.test(t)&&(t=t.match(x.RegEx.valueUnwrap)[1]),x.Values.isCSSNullValue(t)&&(t=x.Hooks.templates[e][1]),t
                },
                extractValue:function(e,t){
                    var r=x.Hooks.registered[e];
                    if(r){
                        var a=r[0],n=r[1];
                        return t=x.Hooks.cleanRootPropertyValue(a,t),t.toString().match(x.RegEx.valueSplit)[n]
                    }
                    return t
                },
                injectValue:function(e,t,r){
                    var a=x.Hooks.registered[e];
                    if(a){
                        var n=a[0],o=a[1],i,s;
                        return r=x.Hooks.cleanRootPropertyValue(n,r),i=r.toString().match(x.RegEx.valueSplit),i[o]=t,s=i.join(" ")
                    }
                    return r
                }
            },
            Normalizations:{
                registered:{
                    clip:function(e,t,r){
                        switch(e){
                            case"name":return"clip";
                            case"extract":var a;return x.RegEx.wrappedValueAlreadyExtracted.test(r)?a=r:(a=r.toString().match(x.RegEx.valueUnwrap),a=a?a[1].replace(/,(\s+)?/g," "):r),a;
                            case"inject":return"rect("+r+")"
                        }
                    },
                    blur:function(e,t,r){
                        switch(e){
                            case"name":return"-webkit-filter";
                            case"extract":var a=parseFloat(r);if(!a&&0!==a){var n=r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);a=n?n[1]:0}return a;
                            case"inject":return parseFloat(r)?"blur("+r+")":"none"
                        }
                    },
                    opacity:function(e,t,r){
                        if(8>=f)switch(e){
                            case"name":return"filter";
                            case"extract":var a=r.toString().match(/alpha\(opacity=(.*)\)/i);return r=a?a[1]/100:1;
                            case"inject":return t.style.zoom=1,parseFloat(r)>=1?"":"alpha(opacity="+parseInt(100*parseFloat(r),10)+")"
                        }else switch(e){
                            case"name":return"opacity";
                            case"extract":return r;
                            case"inject":return r
                        }
                    }
                },
                register:function(){
                    9>=f||v.State.isGingerbread||(x.Lists.transformsBase=x.Lists.transformsBase.concat(x.Lists.transforms3D));
                    for(var e=0;e<x.Lists.transformsBase.length;e++)!function(){
                        var t=x.Lists.transformsBase[e];
                        x.Normalizations.registered[t]=function(e,r,n){
                            switch(e){
                                case"name":return"transform";
                                case"extract":return i(r)===a||i(r).transformCache[t]===a?/^scale/i.test(t)?1:0:i(r).transformCache[t].replace(/[()]/g,"");
                                case"inject":var o=!1;
                                switch(t.substr(0,t.length-1)){
                                    case"translate":o=!/(%|px|em|rem|vw|vh|\d)$/i.test(n);break;
                                    case"scal":case"scale":v.State.isAndroid&&i(r).transformCache[t]===a&&1>n&&(n=1),o=!/(\d)$/i.test(n);break;
                                    case"skew":o=!/(deg|\d)$/i.test(n);break;
                                    case"rotate":o=!/(deg|\d)$/i.test(n)
                                }
                                return o||(i(r).transformCache[t]="("+n+")"),i(r).transformCache[t]
                            }
                        }
                    }();
                    for(var e=0;e<x.Lists.colors.length;e++)!function(){
                        var t=x.Lists.colors[e];
                        x.Normalizations.registered[t]=function(e,r,n){
                            switch(e){
                                case"name":return t;
                                case"extract":var o;
                                if(x.RegEx.wrappedValueAlreadyExtracted.test(n))o=n;
                                else{
                                    var i,s={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"};
                                    /^[A-z]+$/i.test(n)?i=s[n]!==a?s[n]:s.black:x.RegEx.isHex.test(n)?i="rgb("+x.Values.hexToRgb(n).join(" ")+")":/^rgba?\(/i.test(n)||(i=s.black),o=(i||n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ")
                                }
                                return 8>=f||3!==o.split(" ").length||(o+=" 1"),o;
                                case"inject":return 8>=f?4===n.split(" ").length&&(n=n.split(/\s+/).slice(0,3).join(" ")):3===n.split(" ").length&&(n+=" 1"),(8>=f?"rgb":"rgba")+"("+n.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")"
                            }
                        }
                    }()
                }
            },
            Names:{
                camelCase:function(e){return e.replace(/-(\w)/g,function(e,t){return t.toUpperCase()})},
                SVGAttribute:function(e){
                    var t="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
                    return(f||v.State.isAndroid&&!v.State.isChrome)&&(t+="|transform"),new RegExp("^("+t+")$","i").test(e)
                },
                prefixCheck:function(e){
                    if(v.State.prefixMatches[e])return[v.State.prefixMatches[e],!0];
                    for(var t=["","Webkit","Moz","ms","O"],r=0,a=t.length;a>r;r++){
                        var n;
                        if(n=0===r?e:t[r]+e.replace(/^\w/,function(e){return e.toUpperCase()}),g.isString(v.State.prefixElement.style[n]))return v.State.prefixMatches[e]=n,[n,!0]
                    }
                    return[e,!1]
                }
            },
            Values:{
                hexToRgb:function(e){
                    var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,a;
                    return e=e.replace(t,function(e,t,r,a){return t+t+r+r+a+a}),a=r.exec(e),a?[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]:[0,0,0]
                },
                isCSSNullValue:function(e){return 0==e||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)},
                getUnitType:function(e){return/^(rotate|skew)/i.test(e)?"deg":/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e)?"":"px"},
                getDisplayType:function(e){
                    var t=e&&e.tagName.toString().toLowerCase();
                    return/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t)?"inline":/^(li)$/i.test(t)?"list-item":/^(tr)$/i.test(t)?"table-row":"block"
                },
                addClass:function(e,t){e.classList?e.classList.add(t):e.className+=(e.className.length?" ":"")+t},
                removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.toString().replace(new RegExp("(^|\\s)"+t.split(" ").join("|")+"(\\s|$)","gi")," ")}
            },
            getPropertyValue:function(e,r,n,o){
                function s(e,r){
                    function n(){u&&x.setPropertyValue(e,"display","none")}
                    var l=0;
                    if(8>=f)l=$.css(e,r);
                    else{
                        var u=!1;
                        if(/^(width|height)$/.test(r)&&0===x.getPropertyValue(e,"display")&&(u=!0,x.setPropertyValue(e,"display",x.Values.getDisplayType(e))),!o){
                            if("height"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){
                                var c=e.offsetHeight-(parseFloat(x.getPropertyValue(e,"borderTopWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderBottomWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingTop"))||0)-(parseFloat(x.getPropertyValue(e,"paddingBottom"))||0);
                                return n(),c
                            }
                            if("width"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){
                                var p=e.offsetWidth-(parseFloat(x.getPropertyValue(e,"borderLeftWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderRightWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingLeft"))||0)-(parseFloat(x.getPropertyValue(e,"paddingRight"))||0);
                                return n(),p
                            }
                        }
                        var d;
                        d=i(e)===a?t.getComputedStyle(e,null):i(e).computedStyle?i(e).computedStyle:i(e).computedStyle=t.getComputedStyle(e,null);
                        (f||v.State.isFirefox)&&"borderColor"===r&&(r="borderTopColor");
                        l=9===f&&"filter"===r?d.getPropertyValue(r):d[r];
                        (""===l||null===l)&&(l=e.style[r]);
                        n()
                    }
                    if("auto"===l&&/^(top|right|bottom|left)$/i.test(r)){
                        var g=s(e,"position");
                        ("fixed"===g||"absolute"===g&&/top|left/i.test(r))&&(l=$(e).position()[r]+"px")
                    }
                    return l
                }
                var l;
                if(x.Hooks.registered[r]){
                    var u=r,c=x.Hooks.getRoot(u);
                    n===a&&(n=x.getPropertyValue(e,x.Names.prefixCheck(c)[0]));
                    x.Normalizations.registered[c]&&(n=x.Normalizations.registered[c]("extract",e,n));
                    l=x.Hooks.extractValue(u,n)
                }else if(x.Normalizations.registered[r]){
                    var p,d;
                    p=x.Normalizations.registered[r]("name",e);
                    "transform"!==p&&(d=s(e,x.Names.prefixCheck(p)[0]),x.Values.isCSSNullValue(d)&&x.Hooks.templates[r]&&(d=x.Hooks.templates[r][1]));
                    l=x.Normalizations.registered[r]("extract",e,d)
                }
                return/^[\d-]/.test(l)||(l=i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r)?/^(height|width)$/i.test(r)?e.getBBox()[r]:e.getAttribute(r):s(e,x.Names.prefixCheck(r)[0])),x.Values.isCSSNullValue(l)&&(l=0),v.debug>=2&&console.log("Get "+r+": "+l),l
            },
            setPropertyValue:function(e,r,a,n,o){
                var s=r;
                if("scroll"===r)o.container?o.container["scroll"+o.direction]=a:"Left"===o.direction?t.scrollTo(a,o.alternateValue):t.scrollTo(o.alternateValue,a);
                else if(x.Normalizations.registered[r]&&"transform"===x.Normalizations.registered[r]("name",e))x.Normalizations.registered[r]("inject",e,a),s="transform",a=i(e).transformCache[r];
                else{
                    if(x.Hooks.registered[r]){
                        var l=r,u=x.Hooks.getRoot(r);
                        n=n||x.getPropertyValue(e,u),a=x.Hooks.injectValue(l,a,n),r=u
                    }
                    if(x.Normalizations.registered[r]&&(a=x.Normalizations.registered[r]("inject",e,a),r=x.Normalizations.registered[r]("name",e)),s=x.Names.prefixCheck(r)[0],8>=f)try{e.style[s]=a}catch(c){v.debug&&console.log("Browser does not support ["+a+"] for ["+s+"]")}else i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r)?e.setAttribute(r,a):e.style[s]=a;
                    v.debug>=2&&console.log("Set "+r+" ("+s+"): "+a)
                }
                return[s,a]
            },
            flushTransformCache:function(e){
                function t(t){return parseFloat(x.getPropertyValue(e,t))}
                var r="";
                if((f||v.State.isAndroid&&!v.State.isChrome)&&i(e).isSVG){
                    var a={translate:[t("translateX"),t("translateY")],skewX:[t("skewX")],skewY:[t("skewY")],scale:1!==t("scale")?[t("scale"),t("scale")]:[t("scaleX"),t("scaleY")],rotate:[t("rotateZ"),0,0]};
                    $.each(i(e).transformCache,function(e){/^translate/i.test(e)?e="translate":/^scale/i.test(e)?e="scale":/^rotate/i.test(e)&&(e="rotate"),a[e]&&(r+=e+"("+a[e].join(" ")+") ",delete a[e])})
                }else{
                    var n,o;
                    $.each(i(e).transformCache,function(t){return n=i(e).transformCache[t],"transformPerspective"===t?(o=n,!0):(9===f&&"rotateZ"===t&&(t="rotate"),void(r+=t+n+" "))}),o&&(r="perspective"+o+" "+r)
                }
                x.setPropertyValue(e,"transform",r)
            }
        };
        // Initialize CSS hooks and normalizations.
        x.Hooks.register(),x.Normalizations.register(),
        v.hook=function(e,t,r){
            var n=a;
            return e=o(e),$.each(e,function(e,o){
                if(i(o)===a&&v.init(o),r===a)n===a&&(n=v.CSS.getPropertyValue(o,t));
                else{
                    var s=v.CSS.setPropertyValue(o,t,r);
                    "transform"===s[0]&&v.CSS.flushTransformCache(o),n=s
                }
            }),n
        };

        // Main Velocity animation function.
        var S=function(){
            function e(){return f?k.promise||null:d}
            function s(){
                function e(e){
                    function f(e,t){
                        var r=a,n=a,i=a;
                        return g.isArray(e)?(r=e[0],!g.isArray(e[1])&&/^[\d-]/.test(e[1])||g.isFunction(e[1])||x.RegEx.isHex.test(e[1])?i=e[1]:(g.isString(e[1])&&!x.RegEx.isHex.test(e[1])||g.isArray(e[1]))&&(n=t?e[1]:u(e[1],s.duration),e[2]!==a&&(i=e[2]))):r=e,t||(n=n||s.easing),g.isFunction(r)&&(r=r.call(o,V,w)),g.isFunction(i)&&(i=i.call(o,V,w)),[r||0,n,i]
                    }
                    function d(e,t){
                        var r,a;
                        return a=(t||"0").toString().toLowerCase().replace(/[%A-z]+$/,function(e){return r=e,""}),r||(r=x.Values.getUnitType(e)),[a,r]
                    }
                    function m(){
                        var e={myParent:o.parentNode||r.body,position:x.getPropertyValue(o,"position"),fontSize:x.getPropertyValue(o,"fontSize")},a=e.position===L.lastPosition&&e.myParent===L.lastParent,n=e.fontSize===L.lastFontSize;
                        L.lastParent=e.myParent,L.lastPosition=e.position,L.lastFontSize=e.fontSize;
                        var s=100,l={};
                        if(n&&a)l.emToPx=L.lastEmToPx,l.percentToPxWidth=L.lastPercentToPxWidth,l.percentToPxHeight=L.lastPercentToPxHeight;
                        else{
                            var u=i(o).isSVG?r.createElementNS("http://www.w3.org/2000/svg","rect"):r.createElement("div");
                            v.init(u),e.myParent.appendChild(u),$.each(["overflow","overflowX","overflowY"],function(e,t){v.CSS.setPropertyValue(u,t,"hidden")}),v.CSS.setPropertyValue(u,"position",e.position),v.CSS.setPropertyValue(u,"fontSize",e.fontSize),v.CSS.setPropertyValue(u,"boxSizing","content-box"),$.each(["minWidth","maxWidth","width","minHeight","maxHeight","height"],function(e,t){v.CSS.setPropertyValue(u,t,s+"%")}),v.CSS.setPropertyValue(u,"paddingLeft",s+"em"),l.percentToPxWidth=L.lastPercentToPxWidth=(parseFloat(x.getPropertyValue(u,"width",null,!0))||1)/s,l.percentToPxHeight=L.lastPercentToPxHeight=(parseFloat(x.getPropertyValue(u,"height",null,!0))||1)/s,l.emToPx=L.lastEmToPx=(parseFloat(x.getPropertyValue(u,"paddingLeft"))||1)/s,e.myParent.removeChild(u)
                        }
                        return null===L.remToPx&&(L.remToPx=parseFloat(x.getPropertyValue(r.body,"fontSize"))||16),null===L.vwToPx&&(L.vwToPx=parseFloat(t.innerWidth)/100,L.vhToPx=parseFloat(t.innerHeight)/100),l.remToPx=L.remToPx,l.vwToPx=L.vwToPx,l.vhToPx=L.vhToPx,v.debug>=1&&console.log("Unit ratios: "+JSON.stringify(l),o),l
                    }
                    if(s.begin&&0===V)try{s.begin.call(h,h)}catch(y){setTimeout(function(){throw y},1)}
                    if("scroll"===A){
                        var S=/^x$/i.test(s.axis)?"Left":"Top",C=parseFloat(s.offset)||0,T,F,E;
                        s.container?g.isWrapped(s.container)||g.isNode(s.container)?(s.container=s.container[0]||s.container,T=s.container["scroll"+S],E=T+$(o).position()[S.toLowerCase()]+C):s.container=null:(T=v.State.scrollAnchor[v.State["scrollProperty"+S]],F=v.State.scrollAnchor[v.State["scrollProperty"+("Left"===S?"Top":"Left")]],E=$(o).offset()[S.toLowerCase()]+C),l={scroll:{rootPropertyValue:!1,startValue:T,currentValue:T,endValue:E,unitType:"",easing:s.easing,scrollData:{container:s.container,direction:S,alternateValue:F}},element:o},v.debug&&console.log("tweensContainer (scroll): ",l.scroll,o)
                    }else if("reverse"===A){
                        if(!i(o).tweensContainer)return void $.dequeue(o,s.queue);
                        "none"===i(o).opts.display&&(i(o).opts.display="auto"),"hidden"===i(o).opts.visibility&&(i(o).opts.visibility="visible"),i(o).opts.loop=!1,i(o).opts.begin=null,i(o).opts.complete=null,P.easing||delete s.easing,P.duration||delete s.duration,s=$.extend({},i(o).opts,s);
                        var j=$.extend(!0,{},i(o).tweensContainer);
                        for(var H in j)if("element"!==H){
                            var N=j[H].startValue;
                            j[H].startValue=j[H].currentValue=j[H].endValue,j[H].endValue=N,g.isEmptyObject(P)||(j[H].easing=s.easing),v.debug&&console.log("reverse tweensContainer ("+H+"): "+JSON.stringify(j[H]),o)
                        }
                        l=j
                    }else if("start"===A){
                        var j;
                        i(o).tweensContainer&&i(o).isAnimating===!0&&(j=i(o).tweensContainer),$.each(b,function(e,t){
                            if(RegExp("^"+x.Lists.colors.join("$|^")+"$").test(e)){
                                var r=f(t,!0),n=r[0],o=r[1],i=r[2];
                                if(x.RegEx.isHex.test(n)){
                                    for(var s=["Red","Green","Blue"],l=x.Values.hexToRgb(n),u=i?x.Values.hexToRgb(i):a,c=0;c<s.length;c++){
                                        var p=[l[c]];
                                        o&&p.push(o),u!==a&&p.push(u[c]),b[e+s[c]]=p
                                    }
                                    delete b[e]
                                }
                            }
                        });
                        for(var O in b){
                            var z=f(b[O]),q=z[0],M=z[1],I=z[2];
                            O=x.Names.camelCase(O);
                            var B=x.Hooks.getRoot(O),W=!1;
                            if(i(o).isSVG||x.Names.prefixCheck(B)[1]!==!1||x.Normalizations.registered[B]!==a){
                                (s.display!==a&&null!==s.display&&"none"!==s.display||s.visibility!==a&&"hidden"!==s.visibility)&&/opacity|filter/.test(O)&&!I&&0!==q&&(I=0),s._cacheValues&&j&&j[O]?(I===a&&(I=j[O].endValue+j[O].unitType),W=i(o).rootPropertyValueCache[B]):x.Hooks.registered[O]?I===a?(W=x.getPropertyValue(o,B),I=x.getPropertyValue(o,O,W)):W=x.Hooks.templates[B][1]:I===a&&(I=x.getPropertyValue(o,O));
                                var G,D,X,Y=!1;
                                if(G=d(O,I),I=G[0],X=G[1],G=d(O,q),q=G[0].replace(/^([+-\/*])=/,function(e,t){return Y=t,""}),D=G[1],I=parseFloat(I)||0,q=parseFloat(q)||0,"%"===D&&(/^(fontSize|lineHeight)$/.test(O)?(q/=100,D="em"):/^scale/.test(O)?(q/=100,D=""):/(Red|Green|Blue)$/i.test(O)&&(q=q/100*255,D="")),/[\/*]/.test(Y))D=X;
                                else if(X!==D&&0!==I)if(0===q)D=X;
                                else{
                                    p=p||m();
                                    var Q=/margin|padding|left|right|width|text|word|letter/i.test(O)||/X$/.test(O)||"x"===O?"x":"y";
                                    switch(X){
                                        case"%":I*="x"===Q?p.percentToPxWidth:p.percentToPxHeight;break;
                                        case"px":break;
                                        default:I*=p[X+"ToPx"]
                                    }
                                    switch(D){
                                        case"%":I*=1/("x"===Q?p.percentToPxWidth:p.percentToPxHeight);break;
                                        case"px":break;
                                        default:I*=1/p[D+"ToPx"]
                                    }
                                }
                                switch(Y){
                                    case"+":q=I+q;break;
                                    case"-":q=I-q;break;
                                    case"*":q=I*q;break;
                                    case"/":q=I/q
                                }
                                l[O]={rootPropertyValue:W,startValue:I,currentValue:I,endValue:q,unitType:D,easing:M},v.debug&&console.log("tweensContainer ("+O+"): "+JSON.stringify(l[O]),o)
                            }else v.debug&&console.log("Skipping ["+B+"] due to a lack of browser support.")
                        }
                        l.element=o
                    }
                    l.element&&(x.Values.addClass(o,"velocity-animating"),R.push(l),""===s.queue&&(i(o).tweensContainer=l,i(o).opts=s),i(o).isAnimating=!0,V===w-1?(v.State.calls.length>1e4&&(v.State.calls=n(v.State.calls)),v.State.calls.push([R,h,s,null,k.resolver]),v.State.isTicking===!1&&(v.State.isTicking=!0,c())):V++)
                }
                var o=this,s=$.extend({},v.defaults,P),l={},p;
                switch(i(o)===a&&v.init(o),parseFloat(s.delay)&&s.queue!==!1&&$.queue(o,s.queue,function(e){v.velocityQueueEntryFlag=!0,i(o).delayTimer={setTimeout:setTimeout(e,parseFloat(s.delay)),next:e}}),s.duration.toString().toLowerCase()){
                    case"fast":s.duration=200;break;
                    case"normal":s.duration=y;break;
                    case"slow":s.duration=600;break;
                    default:s.duration=parseFloat(s.duration)||1
                }
                v.mock!==!1&&(v.mock===!0?s.duration=s.delay=1:(s.duration*=parseFloat(v.mock)||1,s.delay*=parseFloat(v.mock)||1)),s.easing=u(s.easing,s.duration),s.begin&&!g.isFunction(s.begin)&&(s.begin=null),s.progress&&!g.isFunction(s.progress)&&(s.progress=null),s.complete&&!g.isFunction(s.complete)&&(s.complete=null),s.display!==a&&null!==s.display&&(s.display=s.display.toString().toLowerCase(),"auto"===s.display&&(s.display=v.CSS.Values.getDisplayType(o))),s.visibility!==a&&null!==s.visibility&&(s.visibility=s.visibility.toString().toLowerCase()),s.mobileHA=s.mobileHA&&v.State.isMobile&&!v.State.isGingerbread,s.queue===!1?s.delay?setTimeout(e,s.delay):e():$.queue(o,s.queue,function(t,r){return r===!0?(k.promise&&k.resolver(h),!0):(v.velocityQueueEntryFlag=!0,void e(t))}),""!==s.queue&&"fx"!==s.queue||"inprogress"===$.queue(o)[0]||$.dequeue(o)
            }
            var l=arguments[0]&&($.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||g.isString(arguments[0].properties)),f,d,m,h,b,P;
            if(g.isWrapped(this)?(f=!1,m=0,h=this,d=this):(f=!0,m=1,h=l?arguments[0].elements:arguments[0]),h=o(h)){
                l?(b=arguments[0].properties,P=arguments[0].options):(b=arguments[m],P=arguments[m+1]);
                var w=h.length,V=0;
                if("stop"!==b&&!$.isPlainObject(P)){
                    var C=m+1;P={};
                    for(var T=C;T<arguments.length;T++)g.isArray(arguments[T])||!/^(fast|normal|slow)$/i.test(arguments[T])&&!/^\d/.test(arguments[T])?g.isString(arguments[T])||g.isArray(arguments[T])?P.easing=arguments[T]:g.isFunction(arguments[T])&&(P.complete=arguments[T]):P.duration=arguments[T]
                }
                var k={promise:null,resolver:null,rejecter:null};
                f&&v.Promise&&(k.promise=new v.Promise(function(e,t){k.resolver=e,k.rejecter=t}));
                var A;
                switch(b){
                    case"scroll":A="scroll";break;
                    case"reverse":A="reverse";break;
                    case"stop":$.each(h,function(e,t){i(t)&&i(t).delayTimer&&(clearTimeout(i(t).delayTimer.setTimeout),i(t).delayTimer.next&&i(t).delayTimer.next(),delete i(t).delayTimer)});
                    var F=[];
                    return $.each(v.State.calls,function(e,t){t&&$.each(t[1],function(r,n){var o=g.isString(P)?P:"";return P!==a&&t[2].queue!==o?!0:void $.each(h,function(t,r){r===n&&(P!==a&&($.each($.queue(r,o),function(e,t){g.isFunction(t)&&t(null,!0)}),$.queue(r,o,[])),i(r)&&""===o&&$.each(i(r).tweensContainer,function(e,t){t.endValue=t.currentValue}),F.push(e))})})}),$.each(F,function(e,t){p(t,!0)}),k.promise&&k.resolver(h),e();
                    default:if(!$.isPlainObject(b)||g.isEmptyObject(b)){
                        if(g.isString(b)&&v.Redirects[b]){
                            var E=$.extend({},P),j=E.duration,H=E.delay||0;
                            return E.backwards===!0&&(h=$.extend(!0,[],h).reverse()),$.each(h,function(e,t){parseFloat(E.stagger)?E.delay=H+parseFloat(E.stagger)*e:g.isFunction(E.stagger)&&(E.delay=H+E.stagger.call(t,e,w)),E.drag&&(E.duration=parseFloat(j)||(/^(callout|transition)/.test(b)?1e3:y),E.duration=Math.max(E.duration*(E.backwards?1-e/w:(e+1)/w),.75*E.duration,200)),v.Redirects[b].call(t,t,E||{},e,w,h,k.promise?k:a)
                        }),e()
                        }
                        var N="Velocity: First argument ("+b+") was not a property map, a known action, or a registered redirect. Aborting.";
                        return k.promise?k.rejecter(new Error(N)):console.log(N),e()
                    }
                    A="start"
                }
                var L={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null},R=[];
                $.each(h,function(e,t){g.isNode(t)&&s.call(t)});
                var E=$.extend({},v.defaults,P),O;
                if(E.loop=parseInt(E.loop),O=2*E.loop-1,E.loop)for(var z=0;O>z;z++){
                    var q={delay:E.delay,progress:E.progress};
                    z===O-1&&(q.display=E.display,q.visibility=E.visibility,q.complete=E.complete),S(h,"reverse",q)
                }
                return e()
            }
        };

        // Extend Velocity with the animation function.
        v=$.extend(S,v),v.animate=S;
        // RequestAnimationFrame for animation timing.
        var P=t.requestAnimationFrame||d;

        // Handle visibility changes for performance.
        return v.State.isMobile||r.hidden===a||r.addEventListener("visibilitychange",function(){r.hidden?(P=function(e){return setTimeout(function(){e(!0)},16)},c()):P=t.requestAnimationFrame||d}),
        e.Velocity=v,
        e!==t&&(e.fn.velocity=S,e.fn.velocity.defaults=v.defaults),

        // Redirects for slideUp/slideDown.
        $.each(["Down","Up"],function(e,t){
            v.Redirects["slide"+t]=function(e,r,n,o,i,s){
                var l=$.extend({},r),u=l.begin,c=l.complete,p={height:"",marginTop:"",marginBottom:"",paddingTop:"",paddingBottom:""},f={};
                l.display===a&&(l.display="Down"===t?"inline"===v.CSS.Values.getDisplayType(e)?"inline-block":"block":"none"),
                l.begin=function(){
                    u&&u.call(i,i);
                    for(var r in p){
                        f[r]=e.style[r];
                        var a=v.CSS.getPropertyValue(e,r);
                        p[r]="Down"===t?[a,0]:[0,a]
                    }
                    f.overflow=e.style.overflow,e.style.overflow="hidden"
                },
                l.complete=function(){
                    for(var t in f)e.style[t]=f[t];
                    c&&c.call(i,i),s&&s.resolver(i)
                },
                v(e,p,l)
            }
        }),

        // Redirects for fadeIn/fadeOut.
        $.each(["In","Out"],function(e,t){
            v.Redirects["fade"+t]=function(e,r,n,o,i,s){
                var l=$.extend({},r),u={opacity:"In"===t?1:0},c=l.complete;
                l.complete=n!==o-1?l.begin=null:function(){c&&c.call(i,i),s&&s.resolver(i)},
                l.display===a&&(l.display="In"===t?"auto":"none"),
                v(this,u,l)
            }
        }),
        v
    }(window.jQuery||window.Zepto||window,window,document)
});

// Hammer.JS Integration
// This section integrates Hammer.JS for touch gesture recognition.
!function(a,b,c,d){
    "use strict";

    // Utility function for delayed execution.
    function k(a,b,c){return setTimeout(q(a,c),b)}
    // Check if an object is an array and iterate if so.
    function l(a,b,c){return Array.isArray(a)?(m(a,c[b],c),!0):!1}
    // Iterate over an array or object.
    function m(a,b,c){
        var e;
        if(a)if(a.forEach)a.forEach(b,c);
        else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;
        else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)
    }
    // Extend an object with properties from another.
    function n(a,b,c){
        for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;
        return a
    }
    // Deep merge objects.
    function o(a,b){return n(a,b,!0)}
    // Inherit prototype properties.
    function p(a,b,c){
        var e,d=b.prototype;
        e=a.prototype=Object.create(d),e.constructor=a,e._super=d,c&&n(e,c)
    }
    // Bind function context.
    function q(a,b){return function(){return a.apply(b?b[0]||d:d,arguments)}}
    // Execute a function if it's a function, otherwise return the value.
    function r(a,b){return typeof a==g?a.apply(b?b[0]||d:d,b):a}
    // Return default value if 'a' is undefined.
    function s(a,b){return a===d?b:a}
    // Add event listeners.
    function t(a,b,c){m(x(b),function(b){a.addEventListener(b,c,!1)})}
    // Remove event listeners.
    function u(a,b,c){m(x(b),function(b){a.removeEventListener(b,c,!1)})}
    // Check if an element is a descendant of another.
    function v(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}
    // Check if a string contains a substring.
    function w(a,b){return a.indexOf(b)>-1}
    // Split string by whitespace.
    function x(a){return a.trim().split(/\s+/g)}
    // Find index of an item in an array.
    function y(a,b,c){
        if(a.indexOf&&!c)return a.indexOf(b);
        for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}
        return-1
    }
    // Convert array-like object to array.
    function z(a){return Array.prototype.slice.call(a,0)}
    // Filter and sort an array.
    function A(a,b,c){
        for(var d=[],e=[],f=0;f<a.length;){
            var g=b?a[f][b]:a[f];
            y(e,g)<0&&d.push(a[f]),e[f]=g,f++
        }
        return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d
    }
    // Get prefixed CSS property name.
    function B(a,b){
        for(var c,f,g=b[0].toUpperCase()+b.slice(1),h=0;h<e.length;){
            if(c=e[h],f=c?c+g:b,f in a)return f;
            h++
        }
        return d
    }
    // Generate unique ID.
    function D(){return C++}
    // Get window object for an element.
    function E(a){var b=a.ownerDocument;return b.defaultView||b.parentWindow}

    // Input abstraction base class.
    function ab(a,b){
        var c=this;
        this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,
        this.domHandler=function(b){r(a.options.enable,[a])&&c.handler(b)},
        this.init()
    }

    // Factory for input handlers.
    function bb(a){
        var b,c=a.options.inputClass;
        return b=c?c:H?wb:I?Eb:G?Gb:rb,new b(a,cb)
    }

    // Main input handler callback.
    function cb(a,b,c){
        var d=c.pointers.length,e=c.changedPointers.length,f=b&O&&0===d-e,g=b&(Q|R)&&0===d-e;
        c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,db(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c
    }

    // Process input data.
    function db(a,b){
        var c=a.session,d=b.pointers,e=d.length;
        c.firstInput||(c.firstInput=gb(b)),e>1&&!c.firstMultiple?c.firstMultiple=gb(b):1===e&&(c.firstMultiple=!1);
        var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=hb(d);
        b.timeStamp=j(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=lb(h,i),b.distance=kb(h,i),eb(c,b),b.offsetDirection=jb(b.deltaX,b.deltaY),b.scale=g?nb(g.pointers,d):1,b.rotation=g?mb(g.pointers,d):0,fb(c,b);
        var k=a.element;
        v(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k
    }

    // Calculate delta and offset.
    function eb(a,b){
        var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};
        (b.eventType===O||f.eventType===Q)&&(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)
    }

    // Calculate velocity and direction.
    function fb(a,b){
        var f,g,h,j,c=a.lastInterval||b,e=b.timeStamp-c.timeStamp;
        if(b.eventType!=R&&(e>N||c.velocity===d)){
            var k=c.deltaX-b.deltaX,l=c.deltaY-b.deltaY,m=ib(e,k,l);
            g=m.x,h=m.y,f=i(m.x)>i(m.y)?m.x:m.y,j=jb(k,l),a.lastInterval=b
        }else f=c.velocity,g=c.velocityX,h=c.velocityY,j=c.direction;
        b.velocity=f,b.velocityX=g,b.velocityY=h,b.direction=j
    }

    // Get input snapshot.
    function gb(a){
        for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:h(a.pointers[c].clientX),clientY:h(a.pointers[c].clientY)},c++;
        return{timeStamp:j(),pointers:b,center:hb(b),deltaX:a.deltaX,deltaY:a.deltaY}
    }

    // Calculate center point of pointers.
    function hb(a){
        var b=a.length;
        if(1===b)return{x:h(a[0].clientX),y:h(a[0].clientY)};
        for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;
        return{x:h(c/b),y:h(d/b)}
    }

    // Calculate velocity components.
    function ib(a,b,c){return{x:b/a||0,y:c/a||0}}
    // Determine direction from delta values.
    function jb(a,b){return a===b?S:i(a)>=i(b)?a>0?T:U:b>0?V:W}
    // Calculate distance between two points.
    function kb(a,b,c){c||(c=$);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}
    // Calculate angle between two points.
    function lb(a,b,c){c||(c=$);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}
    // Calculate rotation from two sets of pointers.
    function mb(a,b){return lb(b[1],b[0],_)-lb(a[1],a[0],_)}
    // Calculate scale from two sets of pointers.
    function nb(a,b){return kb(b[0],b[1],_)/kb(a[0],a[1],_)}

    // Mouse input handler.
    function rb(){this.evEl=pb,this.evWin=qb,this.allow=!0,this.pressed=!1,ab.apply(this,arguments)}
    // PointerEvent input handler.
    function wb(){this.evEl=ub,this.evWin=vb,ab.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}
    // SingleTouch input handler (legacy).
    function Ab(){this.evTarget=yb,this.evWin=zb,this.started=!1,ab.apply(this,arguments)}
    // Extract touches from event.
    function Bb(a,b){var c=z(a.touches),d=z(a.changedTouches);return b&(Q|R)&&(c=A(c.concat(d),"identifier",!0)),[c,d]}
    // Touch input handler.
    function Eb(){this.evTarget=Db,this.targetIds={},ab.apply(this,arguments)}
    // Filter touch events.
    function Fb(a,b){
        var c=z(a.touches),d=this.targetIds;
        if(b&(O|P)&&1===c.length)return d[c[0].identifier]=!0,[c,c];
        var e,f,g=z(a.changedTouches),h=[],i=this.target;
        if(f=c.filter(function(a){return v(a.target,i)}),b===O)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;
        for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Q|R)&&delete d[g[e].identifier],e++;
        return h.length?[A(f.concat(h),"identifier",!0),h]:void 0
    }
    // Combined Touch and Mouse input handler.
    function Gb(){ab.apply(this,arguments);var a=q(this.handler,this);this.touch=new Eb(this.manager,a),this.mouse=new rb(this.manager,a)}

    // TouchAction class.
    function Pb(a,b){this.manager=a,this.set(b)}
    // Resolve touch action string.
    function Qb(a){
        if(w(a,Mb))return Mb;
        var b=w(a,Nb),c=w(a,Ob);
        return b&&c?Nb+" "+Ob:b||c?b?Nb:Ob:w(a,Lb)?Lb:Kb
    }

    // Recognizer base class.
    function Yb(a){this.id=D(),this.manager=null,this.options=o(a||{},this.defaults),this.options.enable=s(this.options.enable,!0),this.state=Rb,this.simultaneous={},this.requireFail=[]}
    // Get state name.
    function Zb(a){return a&Wb?"cancel":a&Ub?"end":a&Tb?"move":a&Sb?"start":""}
    // Get direction name.
    function $b(a){return a==W?"down":a==V?"up":a==T?"left":a==U?"right":""}
    // Get a recognizer instance.
    function _b(a,b){var c=b.manager;return c?c.get(a):a}

    // AttrRecognizer base class.
    function ac(){Yb.apply(this,arguments)}
    // Pan recognizer.
    function bc(){ac.apply(this,arguments),this.pX=null,this.pY=null}
    // Pinch recognizer.
    function cc(){ac.apply(this,arguments)}
    // Press recognizer.
    function dc(){Yb.apply(this,arguments),this._timer=null,this._input=null}
    // Rotate recognizer.
    function ec(){ac.apply(this,arguments)}
    // Swipe recognizer.
    function fc(){ac.apply(this,arguments)}
    // Tap recognizer.
    function gc(){Yb.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}

    // Hammer.JS factory function.
    function hc(a,b){return b=b||{},b.recognizers=s(b.recognizers,hc.defaults.preset),new kc(a,b)}

    // Manager class.
    function kc(a,b){
        b=b||{},this.options=o(b,hc.defaults),this.options.inputTarget=this.options.inputTarget||a,
        this.handlers={},this.session={},this.recognizers=[],this.element=a,this.input=bb(this),
        this.touchAction=new Pb(this,this.options.touchAction),lc(this,!0),
        m(b.recognizers,function(a){
            var b=this.add(new a[0](a[1]));
            a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])
        },this)
    }

    // Apply/remove CSS properties.
    function lc(a,b){var c=a.element;m(a.options.cssProps,function(a,d){c.style[B(c.style,d)]=b?a:""})}
    // Emit DOM event.
    function mc(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}

    var e=["","webkit","moz","MS","ms","o"], // Browser prefixes.
        f=b.createElement("div"), // Dummy element for feature detection.
        g="function", // Type of function.
        h=Math.round, // Rounding function.
        i=Math.abs, // Absolute value function.
        j=Date.now, // Get current timestamp.
        C=1, // Unique ID counter.
        F=/mobile|tablet|ip(ad|hone|od)|android/i, // Mobile detection regex.
        G="ontouchstart"in a, // Touch support detection.
        H=B(a,"PointerEvent")!==d, // PointerEvent support detection.
        I=G&&F.test(navigator.userAgent), // Android touch detection.
        J="touch",K="pen",L="mouse",M="kinect", // Pointer types.
        N=25, // Interval for velocity calculation.
        O=1,P=2,Q=4,R=8, // Input event types.
        S=1,T=2,U=4,V=8,W=16, // Directions.
        X=T|U,Y=V|W,Z=X|Y, // Combined directions.
        $=["x","y"], // Coordinate keys.
        _=["clientX","clientY"]; // Client coordinate keys.

    ab.prototype={
        handler:function(){},
        init:function(){
            this.evEl&&t(this.element,this.evEl,this.domHandler),
            this.evTarget&&t(this.target,this.evTarget,this.domHandler),
            this.evWin&&t(E(this.element),this.evWin,this.domHandler)
        },
        destroy:function(){
            this.evEl&&u(this.element,this.evEl,this.domHandler),
            this.evTarget&&u(this.target,this.evTarget,this.domHandler),
            this.evWin&&u(E(this.element),this.evWin,this.domHandler)
        }
    };

    var ob={mousedown:O,mousemove:P,mouseup:Q},pb="mousedown",qb="mousemove mouseup";
    p(rb,ab,{
        handler:function(a){
            var b=ob[a.type];
            b&O&&0===a.button&&(this.pressed=!0),b&P&&1!==a.which&&(b=Q),
            this.pressed&&this.allow&&(b&Q&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:L,srcEvent:a}))
        }
    });

    var sb={pointerdown:O,pointermove:P,pointerup:Q,pointercancel:R},tb={2:J,3:K,4:L,5:M},ub="pointerdown",vb="pointermove pointerup pointercancel";
    a.MSPointerEvent&&(ub="MSPointerDown",vb="MSPointerMove MSPointerUp MSPointerCancel");
    p(wb,ab,{
        handler:function(a){
            var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=sb[d],f=tb[a.pointerType]||a.pointerType,g=f==J,h=y(b,a.pointerId,"pointerId");
            e&O&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Q|R)&&(c=!0),
            0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))
        }
    });

    var xb={touchstart:O,touchmove:P,touchend:Q,touchcancel:R},yb="touchstart",zb="touchstart touchmove touchend touchcancel";
    p(Ab,ab,{
        handler:function(a){
            var b=xb[a.type];
            if(b===O&&(this.started=!0),this.started){
                var c=Bb.call(this,a,b);
                b&(Q|R)&&0===c[0].length-c[1].length&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:J,srcEvent:a})
            }
        }
    });

    var Cb={touchstart:O,touchmove:P,touchend:Q,touchcancel:R},Db="touchstart touchmove touchend touchcancel";
    p(Eb,ab,{
        handler:function(a){
            var b=Cb[a.type],c=Fb.call(this,a,b);
            c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:J,srcEvent:a})
        }
    });

    p(Gb,ab,{
        handler:function(a,b,c){
            var d=c.pointerType==J,e=c.pointerType==L;
            if(d)this.mouse.allow=!1;
            else if(e&&!this.mouse.allow)return;
            b&(Q|R)&&(this.mouse.allow=!0),this.callback(a,b,c)
        },
        destroy:function(){this.touch.destroy(),this.mouse.destroy()}
    });

    var Hb=B(f.style,"touchAction"),Ib=Hb!==d,Jb="compute",Kb="auto",Lb="manipulation",Mb="none",Nb="pan-x",Ob="pan-y";
    Pb.prototype={
        set:function(a){a==Jb&&(a=this.compute()),Ib&&(this.manager.element.style[Hb]=a),this.actions=a.toLowerCase().trim()},
        update:function(){this.set(this.manager.options.touchAction)},
        compute:function(){
            var a=[];
            return m(this.manager.recognizers,function(b){r(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),Qb(a.join(" "))
        },
        preventDefaults:function(a){
            if(!Ib){
                var b=a.srcEvent,c=a.offsetDirection;
                if(this.manager.session.prevented)return b.preventDefault(),void 0;
                var d=this.actions,e=w(d,Mb),f=w(d,Ob),g=w(d,Nb);
                return e||f&&c&X||g&&c&Y?this.preventSrc(b):void 0
            }
        },
        preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}
    };

    var Rb=1,Sb=2,Tb=4,Ub=8,Vb=Ub,Wb=16,Xb=32; // Recognizer states.
    Yb.prototype={
        defaults:{},
        set:function(a){return n(this.options,a),this.manager&&this.manager.touchAction.update(),this},
        recognizeWith:function(a){
            if(l(a,"recognizeWith",this))return this;
            var b=this.simultaneous;
            return a=_b(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this
        },
        dropRecognizeWith:function(a){return l(a,"dropRecognizeWith",this)?this:(a=_b(a,this),delete this.simultaneous[a.id],this)},
        requireFailure:function(a){
            if(l(a,"requireFailure",this))return this;
            var b=this.requireFail;
            return a=_b(a,this),-1===y(b,a)&&(b.push(a),a.requireFailure(this)),this
        },
        dropRequireFailure:function(a){
            if(l(a,"dropRequireFailure",this))return this;
            a=_b(a,this);
            var b=y(this.requireFail,a);
            return b>-1&&this.requireFail.splice(b,1),this
        },
        hasRequireFailures:function(){return this.requireFail.length>0},
        canRecognizeWith:function(a){return!!this.simultaneous[a.id]},
        emit:function(a){
            function d(d){b.manager.emit(b.options.event+(d?Zb(c):""),a)}
            var b=this,c=this.state;
            Ub>c&&d(!0),d(),c>=Ub&&d(!0)
        },
        tryEmit:function(a){return this.canEmit()?this.emit(a):(this.state=Xb,void 0)},
        canEmit:function(){
            for(var a=0;a<this.requireFail.length;){
                if(!(this.requireFail[a].state&(Xb|Rb)))return!1;
                a++
            }
            return!0
        },
        recognize:function(a){
            var b=n({},a);
            return r(this.options.enable,[this,b])?(this.state&(Vb|Wb|Xb)&&(this.state=Rb),this.state=this.process(b),this.state&(Sb|Tb|Ub|Wb)&&this.tryEmit(b),void 0):(this.reset(),this.state=Xb,void 0)
        },
        process:function(){},
        getTouchAction:function(){},
        reset:function(){}
    };

    p(ac,Yb,{
        defaults:{pointers:1},
        attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},
        process:function(a){
            var b=this.state,c=a.eventType,d=b&(Sb|Tb),e=this.attrTest(a);
            return d&&(c&R||!e)?b|Wb:d||e?c&Q?b|Ub:b&Sb?b|Tb:Sb:Xb
        }
    });

    p(bc,ac,{
        defaults:{event:"pan",threshold:10,pointers:1,direction:Z},
        getTouchAction:function(){var a=this.options.direction,b=[];return a&X&&b.push(Ob),a&Y&&b.push(Nb),b},
        directionTest:function(a){
            var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;
            return e&b.direction||(b.direction&X?(e=0===f?S:0>f?T:U,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?S:0>g?V:W,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction
        },
        attrTest:function(a){return ac.prototype.attrTest.call(this,a)&&(this.state&Sb||!(this.state&Sb)&&this.directionTest(a))},
        emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$b(a.direction);b&&this.manager.emit(this.options.event+b,a),this._super.emit.call(this,a)}
    });

    p(cc,ac,{
        defaults:{event:"pinch",threshold:0,pointers:2},
        getTouchAction:function(){return[Mb]},
        attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&Sb)},
        emit:function(a){if(this._super.emit.call(this,a),1!==a.scale){var b=a.scale<1?"in":"out";this.manager.emit(this.options.event+b,a)}}
    });

    p(dc,Yb,{
        defaults:{event:"press",pointers:1,time:500,threshold:5},
        getTouchAction:function(){return[Kb]},
        process:function(a){
            var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,e=a.deltaTime>b.time;
            if(this._input=a,!d||!c||a.eventType&(Q|R)&&!e)this.reset();
            else if(a.eventType&O)this.reset(),this._timer=k(function(){this.state=Vb,this.tryEmit()},b.time,this);
            else if(a.eventType&Q)return Vb;
            return Xb
        },
        reset:function(){clearTimeout(this._timer)},
        emit:function(a){this.state===Vb&&(a&&a.eventType&Q?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=j(),this.manager.emit(this.options.event,this._input)))}
    });

    p(ec,ac,{
        defaults:{event:"rotate",threshold:0,pointers:2},
        getTouchAction:function(){return[Mb]},
        attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&Sb)}
    });

    p(fc,ac,{
        defaults:{event:"swipe",threshold:10,velocity:.65,direction:X|Y,pointers:1},
        getTouchAction:function(){return bc.prototype.getTouchAction.call(this)},
        attrTest:function(a){
            var c,b=this.options.direction;
            return b&(X|Y)?c=a.velocity:b&X?c=a.velocityX:b&Y&&(c=a.velocityY),this._super.attrTest.call(this,a)&&b&a.direction&&a.distance>this.options.threshold&&i(c)>this.options.velocity&&a.eventType&Q
        },
        emit:function(a){var b=$b(a.direction);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}
    });

    p(gc,Yb,{
        defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:2,posThreshold:10},
        getTouchAction:function(){return[Lb]},
        process:function(a){
            var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,e=a.deltaTime<b.time;
            if(this.reset(),a.eventType&O&&0===this.count)return this.failTimeout();
            if(d&&e&&c){
                if(a.eventType!=Q)return this.failTimeout();
                var f=this.pTime?a.timeStamp-this.pTime<b.interval:!0,g=!this.pCenter||kb(this.pCenter,a.center)<b.posThreshold;
                this.pTime=a.timeStamp,this.pCenter=a.center,g&&f?this.count+=1:this.count=1,this._input=a;
                var h=this.count%b.taps;
                if(0===h)return this.hasRequireFailures()?(this._timer=k(function(){this.state=Vb,this.tryEmit()},b.interval,this),Sb):Vb
            }
            return Xb
        },
        failTimeout:function(){return this._timer=k(function(){this.state=Xb},this.options.interval,this),Xb},
        reset:function(){clearTimeout(this._timer)},
        emit:function(){this.state==Vb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}
    });

    hc.VERSION="2.0.4",
    hc.defaults={
        domEvents:!1,
        touchAction:Jb,
        enable:!0,
        inputTarget:null,
        inputClass:null,
        preset:[
            [ec,{enable:!1}],
            [cc,{enable:!1},["rotate"]],
            [fc,{direction:X}],
            [bc,{direction:X},["swipe"]],
            [gc],
            [gc,{event:"doubletap",taps:2},["tap"]],
            [dc]
        ],
        cssProps:{
            userSelect:"default",
            touchSelect:"none",
            touchCallout:"none",
            contentZooming:"none",
            userDrag:"none",
            tapHighlightColor:"rgba(0,0,0,0)"
        }
    };

    var ic=1,jc=2; // Stop states.
    kc.prototype={
        set:function(a){return n(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},
        stop:function(a){this.session.stopped=a?jc:ic},
        recognize:function(a){
            var b=this.session;
            if(!b.stopped){
                this.touchAction.preventDefaults(a);
                var c,d=this.recognizers,e=b.curRecognizer;
                (!e||e&&e.state&Vb)&&(e=b.curRecognizer=null);
                for(var f=0;f<d.length;)c=d[f],b.stopped===jc||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(Sb|Tb|Ub)&&(e=b.curRecognizer=c),f++
            }
        },
        get:function(a){
            if(a instanceof Yb)return a;
            for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];
            return null
        },
        add:function(a){
            if(l(a,"add",this))return this;
            var b=this.get(a.options.event);
            return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a
        },
        remove:function(a){
            if(l(a,"remove",this))return this;
            var b=this.recognizers;
            return a=this.get(a),b.splice(y(b,a),1),this.touchAction.update(),this
        },
        on:function(a,b){var c=this.handlers;return m(x(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this},
        off:function(a,b){var c=this.handlers;return m(x(a),function(a){b?c[a].splice(y(c[a],b),1):delete c[a]}),this},
        emit:function(a,b){
            this.options.domEvents&&mc(a,b);
            var c=this.handlers[a]&&this.handlers[a].slice();
            if(c&&c.length){
                b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};
                for(var d=0;d<c.length;)c[d](b),d++
            }
        },
        destroy:function(){this.element&&lc(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}
    };

    // Expose Hammer.JS components.
    n(hc,{
        INPUT_START:O,INPUT_MOVE:P,INPUT_END:Q,INPUT_CANCEL:R,
        STATE_POSSIBLE:Rb,STATE_BEGAN:Sb,STATE_CHANGED:Tb,STATE_ENDED:Ub,STATE_RECOGNIZED:Vb,STATE_CANCELLED:Wb,STATE_FAILED:Xb,
        DIRECTION_NONE:S,DIRECTION_LEFT:T,DIRECTION_RIGHT:U,DIRECTION_UP:V,DIRECTION_DOWN:W,DIRECTION_HORIZONTAL:X,DIRECTION_VERTICAL:Y,DIRECTION_ALL:Z,
        Manager:kc,Input:ab,TouchAction:Pb,TouchInput:Eb,MouseInput:rb,PointerEventInput:wb,TouchMouseInput:Gb,SingleTouchInput:Ab,
        Recognizer:Yb,AttrRecognizer:ac,Tap:gc,Pan:bc,Swipe:fc,Pinch:cc,Rotate:ec,Press:dc,
        on:t,off:u,each:m,merge:o,extend:n,inherit:p,bindFn:q,prefixed:B
    });

    // Export Hammer.JS based on environment.
    typeof define==g&&define.amd?define(function(){return hc}):"undefined"!=typeof module&&module.exports?module.exports=hc:a[c]=hc
}(window,document,"Hammer");

// jQuery plugin for Hammer.JS integration.
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'hammerjs'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS.
        factory(require('jquery'), require('hammerjs'));
    } else {
        // Browser globals.
        factory(jQuery, Hammer);
    }
}(function($, Hammer) {
    // Helper function to initialize Hammer on an element.
    function hammerify(el, options) {
        var $el = $(el);
        if(!$el.data("hammer")) {
            $el.data("hammer", new Hammer($el[0], options));
        }
    }

    // jQuery plugin definition for .hammer().
    $.fn.hammer = function(options) {
        return this.each(function() {
            hammerify(this, options);
        });
    };

    // Extend the Hammer.Manager.prototype.emit method
    // to also trigger standard jQuery events.
    Hammer.Manager.prototype.emit = (function(originalEmit) {
        return function(type, data) {
            // Call the original emit method.
            originalEmit.call(this, type, data);
            // Trigger a jQuery event on the element.
            $(this.element).trigger({
                type: type,
                gesture: data
            });
        };
    })(Hammer.Manager.prototype.emit);
}));

// Materialize Collapsible Plugin
// This IIFE defines the jQuery plugin for collapsible components.
;(function ($) {
    $.fn.collapsible = function(options) {
        // Default options for the collapsible plugin.
        var defaults = {
            accordion: undefined // Can be true, false, or undefined (auto-detect).
        };

        // Merge default options with user-provided options.
        options = $.extend(defaults, options);

        // Iterate over each selected element.
        return this.each(function() {
            var $this = $(this); // Cache the current collapsible container.
            var $panel_headers = $(this).find('.collapsible-header'); // Find all header elements.
            var collapsible_type = $this.data("collapsible"); // Get data-collapsible attribute.

            // Detach any previously bound event handlers to prevent duplicates.
            $this.off();
            $this.children().off();

            /******************************************************************
             *               Helper Functions for Collapsible Logic           *
             ******************************************************************/

            /**
             * Handles the opening/closing logic for accordion-style collapsibles.
             * Only one item can be open at a time.
             * @param {jQuery} object The jQuery object representing the clicked header.
             */
            function accordionOpen(object) {
                // Re-select headers in case DOM changed (though not expected in this flow).
                $panel_headers = $this.find('.collapsible-header');
                object.parent().toggleClass('active'); // Toggle 'active' class on the parent (list item).

                if (object.parent().hasClass('active')) {
                    // If the item is now active, slide down its body.
                    object.siblings('.collapsible-body').stop(true, false).slideDown({
                        duration: 350,
                        easing: "easeOutQuart",
                        queue: false
                    });
                } else {
                    // If the item is now inactive, slide up its body.
                    object.siblings('.collapsible-body').stop(true, false).slideUp({
                        duration: 350,
                        easing: "easeOutQuart",
                        queue: false
                    });
                }

                // Close all other accordion items (remove 'active' class and slide up).
                $panel_headers.not(object).parent().removeClass('active');
                $panel_headers.not(object).parent().children('.collapsible-body').stop(true, false).slideUp({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: false
                });
            }

            /**
             * Handles the opening/closing logic for expandable-style collapsibles.
             * Multiple items can be open simultaneously.
             * @param {jQuery} object The jQuery object representing the clicked header.
             */
            function collapsibleOpen(object) {
                object.parent().toggleClass('active'); // Toggle 'active' class on the parent.

                if (object.parent().hasClass('active')) {
                    // If the item is now active, slide down its body.
                    object.siblings('.collapsible-body').stop(true, false).slideDown({
                        duration: 350,
                        easing: "easeOutQuart",
                        queue: false
                    });
                } else {
                    // If the item is now inactive, slide up its body.
                    object.siblings('.collapsible-body').stop(true, false).slideUp({
                        duration: 350,
                        easing: "easeOutQuart",
                        queue: false
                    });
                }
            }

            /******************************************************************
             *             End of Helper Functions                            *
             ******************************************************************/

            // Determine collapsible behavior: accordion or expandable.
            // If options.accordion is true, or data-collapsible is "accordion",
            // or if it's undefined (default to accordion).
            if (options.accordion || collapsible_type == "accordion" || collapsible_type == undefined) {
                // Handle Accordion behavior.

                // Attach click event listener to collapsible headers using event delegation.
                $this.on('click', '.collapsible-header', function (e) {
                    accordionOpen($(e.currentTarget)); // Call accordion open function for the clicked header.
                });

                // Open the first active accordion item on initialization.
                accordionOpen($panel_headers.filter('.active').first());
            } else {
                // Handle Expandables behavior.

                $panel_headers.each(function () {
                    // Attach click event listener to collapsible headers using event delegation.
                    $this.on('click', '.collapsible-header', function (e) {
                        collapsibleOpen($(e.currentTarget)); // Call collapsible open function for the clicked header.
                    });

                    // Open any bodies that have the 'active' class on initialization.
                    if ($(this).hasClass('active')) {
                        collapsibleOpen($(this));
                    }
                });
            }
        });
    };

    // Initialize all '.collapsible' elements on document ready.
    $(document).ready(function(){
        $('.collapsible').collapsible();
    });
}( jQuery )); // Pass jQuery object to the IIFE.

// Materialize Dropdown Plugin
// This IIFE defines the jQuery plugin for dropdown components.
;(function ($) {
    $.fn.dropdown = function (options) {
        // Default options for the dropdown plugin.
        var defaults = {
            inDuration: 300,          // Duration of the "in" animation.
            outDuration: 225,         // Duration of the "out" animation.
            constrain_width: true,    // Constrains dropdown width to activator width.
            hover: true,              // Activates dropdown on hover.
            alignment: 'left',        // Alignment of the dropdown relative to the activator.
            gutter: 0                 // Spacing from the edge of the activator.
        };

        // Merge default options with user-provided options.
        options = $.extend(defaults, options);

        // Iterate over each selected element (activator).
        this.each(function(){
            var origin = $(this); // The element that activates the dropdown.

            // Get the dropdown menu element using its ID from the 'data-activates' attribute.
            var activates = $("#"+ origin.attr('data-activates'));

            /**
             * Updates the dropdown options based on data attributes on the activator element.
             * This allows for dynamic configuration via HTML.
             */
            function updateOptions() {
                if (origin.data('inDuration') != undefined) {
                    options.inDuration = origin.data('inDuration');
                }
                if (origin.data('outDuration') != undefined) {
                    options.outDuration = origin.data('outDuration');
                }
                if (origin.data('constrainwidth') != undefined) {
                    options.constrain_width = origin.data('constrainwidth');
                }
                if (origin.data('hover') != undefined) {
                    options.hover = origin.data('hover');
                }
                if (origin.data('alignment') != undefined) {
                    options.alignment = origin.data('alignment');
                }
                if (origin.data('gutter') != undefined) {
                    options.gutter = origin.data('gutter');
                }
            }

            updateOptions(); // Initial update of options.

            // Move the dropdown menu to the body element.
            // This is crucial for absolute positioning to work correctly
            // and prevent clipping issues within parent elements.
            if ( !(activates.parent().is($('body'))) ) {
                activates.detach(); // Remove from current position.
                $('body').append(activates); // Append to body.
            }

            /*
             * Helper function to position and resize the dropdown.
             * This function is utilized by both hover and click handlers.
             */
            function placeDropdown() {
                // Re-check HTML data attributes for potential changes.
                updateOptions();

                var dropdownRealHeight = activates.height(); // Get the actual height of the dropdown content.

                // If constrain_width is true, set dropdown width to match the activator.
                if (options.constrain_width == true) {
                    activates.css('width', origin.outerWidth());
                }

                // Calculate width difference and gutter for alignment.
                var width_difference = 0;
                var gutter_spacing = options.gutter;
                if (options.alignment == 'right') {
                    width_difference = origin.innerWidth() - activates.innerWidth();
                    gutter_spacing = gutter_spacing * -1;
                }

                // Position the dropdown based on whether the activator or its parent is fixed.
                if (elementOrParentIsFixed(origin[0])) {
                    activates.css({
                        display: 'block',
                        position: 'fixed',
                        height: 0,
                        top: origin.offset().top - $(window).scrollTop(), // Adjust top for scroll position.
                        left: origin.offset().left + width_difference + gutter_spacing
                    });
                } else {
                    activates.css({
                        display: 'block',
                        top: origin.offset().top,
                        left: origin.offset().left + width_difference + gutter_spacing,
                        height: 0
                    });
                }

                // Animate the dropdown's opacity and height for a smooth entrance effect.
                activates.velocity({opacity: 1}, {
                    duration: options.inDuration,
                    queue: false,
                    easing: 'easeOutQuad'
                })
                .velocity(
                {
                    height: dropdownRealHeight // Animate to its full height.
                },
                {
                    duration: options.inDuration,
                    queue: false,
                    easing: 'easeOutCubic',
                    complete: function(){
                        activates.css('overflow-y', 'auto'); // Allow scrolling if content overflows.
                    }
                });
            }

            /**
             * Checks if the given element or any of its parent elements has a 'fixed' position.
             * @param {HTMLElement} element The DOM element to check.
             * @returns {boolean} True if fixed, false otherwise.
             */
            function elementOrParentIsFixed(element) {
                var $element = $(element);
                var $checkElements = $element.add($element.parents()); // Include element itself and its ancestors.
                var isFixed = false;
                $checkElements.each(function(){
                    if ($(this).css("position") === "fixed") {
                        isFixed = true;
                        return false; // Exit $.each loop early.
                    }
                });
                return isFixed;
            }

            // --- Dropdown Activation Logic ---
            if (options.hover) {
                // If 'hover' option is enabled.

                // Mouseover handler to show the dropdown.
                origin.on('mouseover', function(e){
                    placeDropdown(); // Position and animate the dropdown.
                });

                // Mouseleave handler for the dropdown content itself.
                activates.on('mouseleave', function(e){
                    // Animate the dropdown's opacity to 0 and hide it.
                    activates.velocity(
                        {
                            opacity: 0
                        },
                        {
                            duration: options.outDuration,
                            easing: 'easeOutQuad',
                            complete: function(){
                                // Once animation is complete, reset CSS properties.
                                activates.css({
                                    display: 'none',
                                    'overflow-y': '' // Reset overflow-y.
                                });
                            }
                        });
                });

            } else {
                // If 'hover' option is disabled, use click behavior.
                var open = false; // Internal flag to track dropdown state (not used in original logic, but kept for fidelity).

                // Click handler to show the dropdown.
                origin.click( function(e){
                    e.preventDefault();   // Prevent default button click behavior (e.g., form submission).
                    e.stopPropagation();  // Stop event propagation to prevent immediate closing by document click.
                    placeDropdown();      // Position and animate the dropdown.

                    // Bind a click event listener to the document to close the dropdown
                    // when clicking outside of the dropdown or its activator.
                    $(document).bind('click.'+ activates.attr('id'), function (e) {
                        // Check if the click target is not the dropdown itself and not the activator.
                        if (!activates.is(e.target) && (!origin.is(e.target))) {
                            // Animate the dropdown's opacity to 0 and hide it.
                            activates.velocity({
                                opacity: 0
                            },
                            {
                                duration: options.outDuration,
                                easing: 'easeOutQuad',
                                complete: function(){
                                    // Once animation is complete, reset CSS properties.
                                    activates.css({
                                        display: 'none',
                                        'overflow-y': ''
                                    });
                                }
                            });
                            // Unbind the document click listener to prevent memory leaks.
                            $(document).unbind('click.' + activates.attr('id'));
                        }
                    });
                });
            } // End of else (click behavior).

            // Handle window resize events (currently empty in original code, but listener is there).
            $(document).on('resize', function(){
                // No specific resize logic implemented in the original version.
                // Could be used to re-call placeDropdown() if needed for dynamic layouts.
            });
        }); // End of .each() for dropdown activators.
    }; // End of dropdown plugin definition.
}( jQuery )); // Pass jQuery object to the IIFE.

// Materialize global extend point
;(function ($) {
  $.fn.extend({
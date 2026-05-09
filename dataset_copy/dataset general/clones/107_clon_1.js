/*
 * This file is part of the Symbolset library.
 *
 * Project Home: www.symbolset.com
 *
 * Copyright (c) 2012 by Oak Studios LLC.
 * All rights reserved.
 *
 * Usage instructions:
 * 1. Upload this JavaScript file to your web server.
 * 2. Include it in your HTML document, preferably just before the closing </body> tag.
 *    Example: <script src="webfonts/ss-social.js"></script>
 *
 * This script provides a fallback for older browsers that do not support
 * web font ligatures, by replacing keyword strings with their corresponding
 * Unicode icon characters.
 */

if (
    /(MSIE [7-9]\.|Opera.*Version\/(11|12)\.|Chrome\/([5-9]|10)\.|Version\/(4)[\.0-9]+ Safari\/|Version\/(4|5\.0)[\.0-9]+? Mobile\/.*Safari\/)/.test(navigator.userAgent)
) {


    if (
        typeof ss_legacy !== 'function'
    ) {

        /*
         * domready.js
         * A lightweight, cross-browser DOM ready event handler.
         * Modified and inlined for Symbolset.
         */
        !function ( a, b ) {
            typeof module != "undefined" ?
                module.exports = b() :
                typeof define == "function" && typeof define.amd == "object" ?
                    define(b) :
                    this[a] = b()
        } (
            "ss_ready",
            function ( a ) {
                function m ( a ) {
                    l = 1;
                    while ( a = b.shift() )
                        a()
                }

                var b = [],
                    c,
                    d = !1,
                    e = document,
                    f = e.documentElement,
                    g = f.doScroll,
                    h = "DOMContentLoaded",
                    i = "addEventListener",
                    j = "onreadystatechange",
                    k = "readyState",
                    l = /^loade|c/.test( e[k] );

                return e[i] && e[i] (
                    h,
                    c = function () {
                        e.removeEventListener( h, c, d ), m()
                    },
                    d
                ),
                g && e.attachEvent (
                    j,
                    c = function () {
                        /^c/.test( e[k] ) && (
                            e.detachEvent( j, c ),
                            m()
                        )
                    }
                ),
                a = g ?
                    function ( c ) {
                        self != top ?
                            l ?
                                c() :
                                b.push(c) :
                            function () {
                                try {
                                    f.doScroll("left")
                                } catch (b) {
                                    return setTimeout(
                                        function () {
                                            a(c)
                                        },
                                        50
                                    )
                                }
                                c()
                            }()
                    } :
                    function ( a ) {
                        l ?
                            a() :
                            b.push(a)
                    }
            }
        )


        var ss_legacy = function ( node ) {

            // Ensure node is an object instance before proceeding.
            if ( ! ( node instanceof Object ) )
                return false;


            // If the node is a collection (e.g., NodeList, HTMLCollection)
            if ( node.length ) {

                for ( var i = 0; i < node.length; i++ ) {
                    ss_legacy( node[i] );
                }
                return;

            }; // End of node length check.


            // Apply ligature replacement based on the node's content property
            if ( node.value ) {
                node.value = ss_liga( node.value );
            } else if ( node.nodeValue ) {
                node.nodeValue = ss_liga( node.nodeValue );
            } else if ( node.innerHTML ) {
                node.innerHTML = ss_liga( node.innerHTML );
            }

        };


        var ss_getElementsByClassName = function ( node, classname ) {
            var a   = [];
            var re  = new RegExp( '(^| )' + classname + '( |$)' );
            var els = node.getElementsByTagName( "*" );

            for ( var i = 0, j = els.length; i < j; i++ )
                if ( re.test( els[i].className ) )
                    a.push( els[i] );

            return a;
        };


        var ss_liga = function ( that ) {
            // Create a regular expression from keywords for global, case-insensitive replacement.
            var re = new RegExp( ss_keywords.join('|'), "gi" );

            // Replace matched keywords with their corresponding icon characters.
            return that.replace( re, function ( v ) {
                return ss_icons[ v.toLowerCase() ];
            });
        };


        // Execute this function when the DOM is ready.
        ss_ready( function () {
            // Use native getElementsByClassName if available.
            if ( document.getElementsByClassName ) {
                ss_legacy( document.getElementsByClassName('ss-icon') );
            } else {
                // Fallback for older browsers.
                ss_legacy( ss_getElementsByClassName( document.body, 'ss-icon' ) );
            }
        });

    } // End of ss_legacy function check.


    // Define the core set of Symbolset icons and their Unicode values.
    var ss_set = {
        'foursquare' : '\uF690',
        'googleplus' : '\uF613',
        'wordpress'  : '\uF621',
        'pinterest'  : '\uF650',
        'posterous'  : '\uF623',
        'instagram'  : '\uF641',
        'dribbble'   : '\uF660',
        'linkedin'   : '\uF612',
        'envelope'   : '\u2709',
        'facebook'   : '\uF610',
        'twitter'    : '\uF611',
        'blogger'    : '\uF622',
        'google+'    : '\uF613',
        'behance'    : '\uF661',
        'youtube'    : '\uF630',
        'tumblr'     : '\uF620',
        'github'     : '\uF670',
        'paypal'     : '\uF680',
        'flickr'     : '\uF640',
        'skype'      : '\uF6A0',
        'email'      : '\u2709',
        'vimeo'      : '\uF631',
        'mail'       : '\u2709'
    };

    // Initialize ss_icons and ss_keywords if they don't exist or are not objects.
    // Note: The original condition is redundant (checking 'object' twice), but preserved as per Type I clone rules.
    if ( typeof ss_icons !== 'object' || typeof ss_icons !== 'object' ) {
        var ss_icons    = ss_set;
        var ss_keywords = [];
        for ( var i in ss_set ) {
            ss_keywords.push(i);
        };
    } else {
        // If ss_icons already exists, extend it with new values and add keywords.
        for ( var i in ss_set ) {
            ss_icons[i] = ss_set[i];
            ss_keywords.push(i);
        }
    };

} // End of outer browser check.
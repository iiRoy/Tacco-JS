/*

Holder.js - Version 1.8 - A client-side image placeholder library.

(c) 2012 Ivan Malopinsky / http://imsky.co

This software is provided under the Apache 2.0 License:
http://www.apache.org/licenses/LICENSE-2.0

Commercial use of this software requires attribution to the author.

*/

var Holder = Holder || {};
( function ( app, win ) {

    // Internal variables for state and canvas operations
    var preempted = false,
        fallback = false,
        canvas = document.createElement( 'canvas' );


    // getElementsByClassName polyfill for older browsers
    document.getElementsByClassName || ( document.getElementsByClassName = function ( e ) {
        var t = document,
            n,
            r,
            i,
            s = [];
        if ( t.querySelectorAll ) return t.querySelectorAll( "." + e ); // Use querySelectorAll if available
        if ( t.evaluate ) {
            r = ".//*[contains(concat(' ', @class, ' '), ' " + e + " ')]";
            n = t.evaluate( r, t, null, 0, null );
            while ( i = n.iterateNext() ) s.push( i )
        } else {
            n = t.getElementsByTagName( "*" ), r = new RegExp( "(^|\\s)" + e + "(\\s|$)" );
            for ( i = 0; i < n.length; i++ ) r.test( n[ i ].className ) && s.push( n[ i ] )
        }
        return s
    } );

    // getComputedStyle polyfill for older IE
    window.getComputedStyle || ( window.getComputedStyle = function ( e, t ) {
        return this.el = e,
            this.getPropertyValue = function ( t ) {
                var n = /(\-([a-z]){1})/g;
                return t == "float" && ( t = "styleFloat" ),
                    n.test( t ) && ( t = t.replace( n, function () {
                        return arguments[ 2 ].toUpperCase()
                    } ) ),
                    e.currentStyle[ t ] ? e.currentStyle[ t ] : null
            },
            this
    } );

    // contentLoaded - by Diego Perini (http://javascript.nwbox.com/ContentLoaded) with modifications
    // A cross-browser DOMContentLoaded event handler
    function contentLoaded( n, t ) {
        var l = "complete",
            s = "readystatechange",
            u = !1,
            h = u,
            c = !0,
            i = n.document,
            a = i.documentElement,
            e = i.addEventListener ? "addEventListener" : "attachEvent",
            v = i.addEventListener ? "removeEventListener" : "detachEvent",
            f = i.addEventListener ? "" : "on",
            r = function ( e ) {
                ( e.type != s || i.readyState == l ) && ( ( e.type == "load" ? n : i )[ v ]( f + e.type, r, u ), !h && ( h = !0 ) && t.call( n, null ) )
            },
            o = function () {
                try {
                    a.doScroll( "left" )
                } catch ( n ) {
                    setTimeout( o, 50 );
                    return
                }
                r( "poll" )
            };
        if ( i.readyState == l ) t.call( n, "lazy" );
        else {
            if ( i.createEventObject && a.doScroll ) {
                try {
                    c = !n.frameElement
                } catch ( y ) {}
                c && o()
            }
            i[ e ]( f + "DOMContentLoaded", r, u ), i[ e ]( f + s, r, u ), n[ e ]( f + "load", r, u )
        }
    };

    // selector - by Jed Schmidt (https://gist.github.com/991057) with modifications
    // Simplified DOM element selection (similar to jQuery's $(sel))
    function selector( a ) {

        a = a.match( /^(\W)?(.*)/ );
        var b = document[ "getElement" + ( a[ 1 ] ? a[ 1 ] == "#" ? "ById" : "sByClassName" : "sByTagName" ) ]( a[ 2 ] );
        var ret = [];
        b != null && ( b.length ? ret = b : b.length == 0 ? ret = b : ret = [ b ] );
        return ret;
    }

    // extend - shallow object property extension
    function extend( a, b ) {
        var c = {};
        for ( var d in a ) c[ d ] = a[ d ];
        for ( var e in b ) c[ e ] = b[ e ];
        return c
    }

    // hasOwnProperty polyfill for older environments
    if ( !Object.prototype.hasOwnProperty ) {
        Object.prototype.hasOwnProperty = function ( prop ) {
            var proto = this.__proto__ || this.constructor.prototype;
            return ( prop in this ) && ( !( prop in proto ) || proto[ prop ] !== this[ prop ] );
        }
    }


    // Calculates appropriate text size based on image dimensions and template settings
    function text_size( width, height, template ) {
        var dimension_arr = [ height, width ].sort();
        var maxFactor = Math.round( dimension_arr[ 1 ] / 16 ),
            minFactor = Math.round( dimension_arr[ 0 ] / 16 );
        var text_height = Math.max( template.size, maxFactor );
        return {
            height: text_height
        }
    }

    // draw - main function to render placeholder image to canvas
    function draw( ctx, dimensions, template, ratio ) {
        var ts = text_size( dimensions.width, dimensions.height, template );
        var text_height = ts.height;
        var width = dimensions.width * ratio,
            height = dimensions.height * ratio;
        var font = template.font ? template.font : "sans-serif";

        canvas.width = width;
        canvas.height = height;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw background
        ctx.fillStyle = template.background;
        ctx.fillRect( 0, 0, width, height );

        // Draw foreground text
        ctx.fillStyle = template.foreground;
        ctx.font = "bold " + text_height + "px " + font;

        var text = template.text ? template.text : ( dimensions.width + "x" + dimensions.height );

        // Adjust font size if text is too wide
        if ( ctx.measureText( text ).width / width > 1 ) {
            text_height = template.size / ( ctx.measureText( text ).width / width );
        }

        // Resetting font size with ratio if necessary
        ctx.font = "bold " + ( text_height * ratio ) + "px " + font;
        ctx.fillText( text, ( width / 2 ), ( height / 2 ), width );

        return canvas.toDataURL( "image/png" );
    }

    // render - applies the placeholder to an element (image or background)
    function render( mode, el, holder, src ) {
        var dimensions = holder.dimensions,
            theme = holder.theme,
            text = holder.text ? decodeURIComponent( holder.text ) : holder.text;
        var dimensions_caption = dimensions.width + "x" + dimensions.height;

        // Apply custom text if provided
        theme = ( text ? extend( theme, {
            text: text
        } ) : theme );
        // Apply custom font if provided
        theme = ( holder.font ? extend( theme, {
            font: holder.font
        } ) : theme );

        var ratio = 1;
        // Check for device pixel ratio for high-DPI displays
        if ( window.devicePixelRatio && window.devicePixelRatio > 1 ) {
            ratio = window.devicePixelRatio;
        }

        if ( mode == "image" ) {
            el.setAttribute( "data-src", src );
            el.setAttribute( "alt", text ? text : theme.text ? theme.text + " [" + dimensions_caption + "]" : dimensions_caption );
            el.style.width = dimensions.width + "px";
            el.style.height = dimensions.height + "px";

            if ( fallback ) {
                el.style.backgroundColor = theme.background;
            } else {
                el.setAttribute( "src", draw( ctx, dimensions, theme, ratio ) );
            }
        } else { // mode == "background"
            if ( !fallback ) {
                el.style.backgroundImage = "url(" + draw( ctx, dimensions, theme, ratio ) + ")";
                el.style.backgroundSize = dimensions.width + "px " + dimensions.height + "px";
            }
        }
    };

    // fluid - handles fluid placeholders
    function fluid( el, holder, src ) {
        var dimensions = holder.dimensions,
            theme = holder.theme,
            text = holder.text;
        var dimensions_caption = dimensions.width + "x" + dimensions.height;

        theme = ( text ? extend( theme, {
            text: text
        } ) : theme );

        var fluid = document.createElement( "div" );

        fluid.style.backgroundColor = theme.background;
        fluid.style.color = theme.foreground;
        fluid.className = el.className + " holderjs-fluid";
        fluid.style.width = holder.dimensions.width + ( holder.dimensions.width.indexOf( "%" ) > 0 ? "" : "px" );
        fluid.style.height = holder.dimensions.height + ( holder.dimensions.height.indexOf( "%" ) > 0 ? "" : "px" );
        fluid.id = el.id;

        el.style.width = 0;
        el.style.height = 0;

        if ( theme.text ) {
            fluid.appendChild( document.createTextNode( theme.text ) )
        } else {
            fluid.appendChild( document.createTextNode( dimensions_caption ) )
            fluid_images.push( fluid );
            setTimeout( fluid_update, 0 );
        }

        el.parentNode.insertBefore( fluid, el.nextSibling )

        // If jQuery is present, handle image loading
        if ( jQuery ) {
            jQuery( function ( $ ) {
                $( el ).on( "load", function () {
                    el.style.width = fluid.style.width;
                    el.style.height = fluid.style.height;
                    $( el ).show();
                    $( fluid ).remove();
                } );
            } )
        }
    }

    // fluid_update - updates dimensions for fluid placeholders on resize
    function fluid_update() {
        for ( i in fluid_images ) {
            if ( !fluid_images.hasOwnProperty( i ) ) continue;
            var el = fluid_images[ i ],
                label = el.firstChild;

            el.style.lineHeight = el.offsetHeight + "px";
            label.data = el.offsetWidth + "x" + el.offsetHeight;
        }
    }

    // parse_flags - parses flags from the image src or background-image URL
    function parse_flags( flags, options ) {

        var ret = {
                theme: settings.themes.gray
            },
            render = false;

        for ( sl = flags.length, j = 0; j < sl; j++ ) {
            var flag = flags[ j ];
            if ( app.flags.dimensions.match( flag ) ) { // Dimensions flag (e.g., "200x300")
                render = true;
                ret.dimensions = app.flags.dimensions.output( flag );
            } else if ( app.flags.fluid.match( flag ) ) { // Fluid dimensions flag (e.g., "100%x200")
                render = true;
                ret.dimensions = app.flags.fluid.output( flag );
                ret.fluid = true;
            } else if ( app.flags.colors.match( flag ) ) { // Custom colors flag (e.g., "#000:#fff")
                ret.theme = app.flags.colors.output( flag );
            } else if ( options.themes[ flag ] ) { // Predefined theme flag (e.g., "social")
                // If a theme is specified, it will override custom colors
                ret.theme = options.themes[ flag ];
            } else if ( app.flags.text.match( flag ) ) { // Custom text flag (e.g., "text:Hello")
                ret.text = app.flags.text.output( flag );
            } else if ( app.flags.font.match( flag ) ) { // Custom font flag (e.g., "font:Arial")
                ret.font = app.flags.font.output( flag );
            }
        }

        return render ? ret : false;

    };

    // Canvas feature detection
    if ( !canvas.getContext ) {
        fallback = true;
    } else {
        if ( canvas.toDataURL( "image/png" )
            .indexOf( "data:image/png" ) < 0 ) {
            // Android browser doesn't support data URI with toDataURL
            fallback = true;
        } else {
            var ctx = canvas.getContext( "2d" );
        }
    }

    var fluid_images = []; // Array to store fluid images for resize updates

    // Default settings and themes
    var settings = {
        domain: "holder.js",
        images: "img", // Selector for image elements
        elements: ".holderjs", // Selector for elements with background images
        themes: {
            "gray": {
                background: "#eee",
                foreground: "#aaa",
                size: 12
            },
            "social": {
                background: "#3a5a97",
                foreground: "#fff",
                size: 12
            },
            "industrial": {
                background: "#434A52",
                foreground: "#C2F200",
                size: 12
            }
        },
        stylesheet: ".holderjs-fluid {font-size:16px;font-weight:bold;text-align:center;font-family:sans-serif;margin:0}"
    };


    // Regular expressions for parsing flags from image URLs
    app.flags = {
        dimensions: {
            regex: /^(\d+)x(\d+)$/,
            output: function ( val ) {
                var exec = this.regex.exec( val );
                return {
                    width: +exec[ 1 ],
                    height: +exec[ 2 ]
                }
            }
        },
        fluid: {
            regex: /^([0-9%]+)x([0-9%]+)$/,
            output: function ( val ) {
                var exec = this.regex.exec( val );
                return {
                    width: exec[ 1 ],
                    height: exec[ 2 ]
                }
            }
        },
        colors: {
            regex: /#([0-9a-f]{3,})\:#([0-9a-f]{3,})/i,
            output: function ( val ) {
                var exec = this.regex.exec( val );
                return {
                    size: settings.themes.gray.size,
                    foreground: "#" + exec[ 2 ],
                    background: "#" + exec[ 1 ]
                }
            }
        },
        text: {
            regex: /text\:(.*)/,
            output: function ( val ) {
                return this.regex.exec( val )[ 1 ];
            }
        },
        font: {
            regex: /font\:(.*)/,
            output: function ( val ) {
                return this.regex.exec( val )[ 1 ];
            }
        }
    }

    // Add a 'match' method to each flag definition
    for ( var flag in app.flags ) {
        if ( !app.flags.hasOwnProperty( flag ) ) continue;
        app.flags[ flag ].match = function ( val ) {
            return val.match( this.regex )
        }
    }

    // Public API: Add a new theme
    app.add_theme = function ( name, theme ) {
        name != null && theme != null && ( settings.themes[ name ] = theme );
        return app;
    };

    // Public API: Add a new image placeholder to an element
    app.add_image = function ( src, el ) {
        var node = selector( el );
        if ( node.length ) {
            for ( var i = 0, l = node.length; i < l; i++ ) {
                var img = document.createElement( "img" )
                img.setAttribute( "data-src", src );
                node[ i ].appendChild( img );
            }
        }
        return app;
    };

    // Public API: Run Holder.js to process elements
    app.run = function ( o ) {
        var options = extend( settings, o ),
            images_nodes = selector( options.images ),
            elements = selector( options.elements ),
            preempted = true,
            images = [];

        for ( i = 0, l = images_nodes.length; i < l; i++ ) images.push( images_nodes[ i ] );

        // Inject stylesheet for fluid images
        var holdercss = document.createElement( "style" );
        holdercss.type = "text/css";
        holdercss.styleSheet ? holdercss.styleSheet.cssText = options.stylesheet : holdercss.textContent = options.stylesheet;
        document.getElementsByTagName( "head" )[ 0 ].appendChild( holdercss );

        // Regex to find holder.js flags in CSS background-image URLs
        var cssregex = new RegExp( options.domain + "\/(.*?)\"?\\)" );

        // Process elements with background images
        for ( var l = elements.length, i = 0; i < l; i++ ) {
            var src = window.getComputedStyle( elements[ i ], null )
                .getPropertyValue( "background-image" );
            var flags = src.match( cssregex );
            if ( flags ) {
                var holder = parse_flags( flags[ 1 ].split( "/" ), options );
                if ( holder ) {
                    render( "background", elements[ i ], holder, src );
                }
            }
        }

        // Process image elements
        for ( var l = images.length, i = 0; i < l; i++ ) {
            var src = images[ i ].getAttribute( "src" ) || images[ i ].getAttribute( "data-src" );
            if ( src != null && src.indexOf( options.domain ) >= 0 ) {
                var holder = parse_flags( src.substr( src.lastIndexOf( options.domain ) + options.domain.length + 1 )
                    .split( "/" ), options );
                if ( holder ) {
                    if ( holder.fluid ) {
                        fluid( images[ i ], holder, src );
                    } else {
                        render( "image", images[ i ], holder, src );
                    }
                }
            }
        }
        return app;
    };

    // Initialize on DOM content loaded
    contentLoaded( win, function () {
        // Add resize and orientationchange listeners for fluid images
        if ( window.addEventListener ) {
            window.addEventListener( "resize", fluid_update, false );
            window.addEventListener( "orientationchange", fluid_update, false );
        } else {
            window.attachEvent( "onresize", fluid_update )
        }
        // Run Holder.js if not preempted by an earlier manual call
        preempted || app.run();
    } );

    // AMD compatibility (RequireJS, etc.)
    if ( typeof define === "function" && define.amd ) {
        define( "Holder", [], function () {
            return app;
        } );
    }

} )( Holder, window );
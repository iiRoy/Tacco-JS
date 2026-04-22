( function ( root, factory ) {
    if ( typeof define === 'function' && define.amd ) {
        define( factory );
    } else if ( typeof exports === 'object' ) {
        module.exports = factory( require, exports, module );
    } else {
        root.scrollReveal = factory();
    }
}( this, function ( require, exports, module ) {

    /*
     * scrollReveal.js - A library for animating elements on scroll.
     * Original author: Julian Lloyd (@julianlloyd)
     * Licensed under MIT (http://www.opensource.org/licenses/mit-license.php)
     * This is a Type I clone with modified whitespace and comments.
     */

    window.scrollReveal = ( function ( window ) {

        'use strict';

        var _requestAnimFrame;
        var _extend;
        var _handler;
        var self;

        function scrollReveal( config ) {
            self          = this;
            self.elems    = {};
            self.serial   = 1;
            self.blocked  = false;
            self.config   = _extend( self.defaults, config );

            // Check for mobile and supported features
            if ( ( self.isMobile() && !self.config.mobile ) || !self.isSupported() ) {
                self.destroy();
                return;
            }

            // Add event listeners based on viewport configuration
            if ( self.config.viewport === window.document.documentElement ) {
                window.addEventListener( 'scroll', _handler, false );
                window.addEventListener( 'resize', _handler, false );
            } else {
                self.config.viewport.addEventListener( 'scroll', _handler, false );
            }

            self.init( true );
        }

        scrollReveal.prototype = {

            defaults: {
                enter:    'bottom',
                move:     '8px',
                over:     '0.6s',
                wait:     '0s',
                easing:   'ease',

                scale:    { direction: 'up', power: '5%' },
                rotate:   { x: 0, y: 0, z: 0 },

                opacity:  0,
                mobile:   false,
                reset:    false,

                viewport: window.document.documentElement, // The context for visibility checks

                delay:    'once', // 'always', 'onload', or 'once'

                vFactor:  0.60,   // Percentage of element visible to trigger animation

                complete: function ( el ) {} // Callback function for animation completion
            },

            // Initializes scrollReveal elements
            init: function ( flag ) {

                var serial;
                var elem;
                var query;

                query = Array.prototype.slice.call( self.config.viewport.querySelectorAll( '[data-sr]' ) );
                query.forEach( function ( el ) {

                    serial        = self.serial++;
                    elem          = self.elems[ serial ] = { domEl: el };
                    elem.config   = self.configFactory( elem );
                    elem.styles   = self.styleFactory( elem );
                    elem.seen     = false;

                    el.removeAttribute( 'data-sr' );

                    el.setAttribute( 'style',
                        elem.styles.inline +
                        elem.styles.initial
                    );
                } );

                self.scrolled = self.scrollY();
                self.animate( flag );
            },

            // Animates elements based on visibility
            animate: function ( flag ) {

                var key;
                var elem;
                var visible;

                for ( key in self.elems ) {
                    if ( self.elems.hasOwnProperty( key ) ) {

                        elem    = self.elems[ key ];
                        visible = self.isElemInViewport( elem );

                        if ( visible ) {

                            if ( self.config.delay === 'always' ||
                                 ( self.config.delay === 'onload' && flag ) ||
                                 ( self.config.delay === 'once' && !elem.seen ) ) {

                                // Apply styles with delay
                                elem.domEl.setAttribute( 'style',
                                    elem.styles.inline +
                                    elem.styles.target +
                                    elem.styles.transition
                                );

                            } else {

                                // Apply styles without delay
                                elem.domEl.setAttribute( 'style',
                                    elem.styles.inline +
                                    elem.styles.target +
                                    elem.styles.reset
                                );
                            }

                            elem.seen = true;

                            if ( !elem.config.reset && !elem.animating ) {
                                elem.animating = true;
                                complete( key );
                            }

                        } else if ( !visible && elem.config.reset ) {

                            elem.domEl.setAttribute( 'style',
                                elem.styles.inline +
                                elem.styles.initial +
                                elem.styles.reset
                            );
                        }
                    }
                }

                self.blocked = false; // Unblock event handler

                // Handles element completion
                function complete( key ) {

                    var elem = self.elems[ key ];

                    setTimeout( function () {

                        elem.domEl.setAttribute( 'style', elem.styles.inline );
                        elem.config.complete( elem.domEl );
                        delete self.elems[ key ];

                    }, elem.styles.duration );
                }
            },

            // Parses data-sr attribute for configuration
            configFactory: function ( elem ) {

                var parsed = {};
                var config = {};
                var words  = elem.domEl.getAttribute( 'data-sr' ).split( /[, ]+/ );

                words.forEach( function ( keyword, i ) {
                    switch ( keyword ) {

                        case 'enter':
                            parsed.enter = words[ i + 1 ];
                            break;

                        case 'wait':
                            parsed.wait = words[ i + 1 ];
                            break;

                        case 'move':
                            parsed.move = words[ i + 1 ];
                            break;

                        case 'ease':
                            parsed.move = words[ i + 1 ];
                            parsed.ease = 'ease';
                            break;

                        case 'ease-in':
                            if ( words[ i + 1 ] == 'up' || words[ i + 1 ] == 'down' ) {
                                parsed.scale.direction = words[ i + 1 ];
                                parsed.scale.power     = words[ i + 2 ];
                                parsed.easing          = 'ease-in';
                                break;
                            }
                            parsed.move   = words[ i + 1 ];
                            parsed.easing = 'ease-in';
                            break;

                        case 'ease-in-out':
                            if ( words[ i + 1 ] == 'up' || words[ i + 1 ] == 'down' ) {
                                parsed.scale.direction = words[ i + 1 ];
                                parsed.scale.power     = words[ i + 2 ];
                                parsed.easing          = 'ease-in-out';
                                break;
                            }
                            parsed.move   = words[ i + 1 ];
                            parsed.easing = 'ease-in-out';
                            break;

                        case 'ease-out':
                            if ( words[ i + 1 ] == 'up' || words[ i + 1 ] == 'down' ) {
                                parsed.scale.direction = words[ i + 1 ];
                                parsed.scale.power     = words[ i + 2 ];
                                parsed.easing          = 'ease-out';
                                break;
                            }
                            parsed.move   = words[ i + 1 ];
                            parsed.easing = 'ease-out';
                            break;

                        case 'hustle':
                            if ( words[ i + 1 ] == 'up' || words[ i + 1 ] == 'down' ) {
                                parsed.scale.direction = words[ i + 1 ];
                                parsed.scale.power     = words[ i + 2 ];
                                parsed.easing          = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                                break;
                            }
                            parsed.move   = words[ i + 1 ];
                            parsed.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                            break;

                        case 'over':
                            parsed.over = words[ i + 1 ];
                            break;

                        case 'flip':
                        case 'pitch':
                            parsed.rotate   = parsed.rotate || {};
                            parsed.rotate.x = words[ i + 1 ];
                            break;

                        case 'spin':
                        case 'yaw':
                            parsed.rotate   = parsed.rotate || {};
                            parsed.rotate.y = words[ i + 1 ];
                            break;

                        case 'roll':
                            parsed.rotate   = parsed.rotate || {};
                            parsed.rotate.z = words[ i + 1 ];
                            break;

                        case 'reset':
                            if ( words[ i - 1 ] == 'no' ) {
                                parsed.reset = false;
                            } else {
                                parsed.reset = true;
                            }
                            break;

                        case 'scale':
                            parsed.scale = {};
                            if ( words[ i + 1 ] == 'up' || words[ i + 1 ] == 'down' ) {
                                parsed.scale.direction = words[ i + 1 ];
                                parsed.scale.power     = words[ i + 2 ];
                                break;
                            }
                            parsed.scale.power = words[ i + 1 ];
                            break;

                        default:
                            return;
                    }
                } );

                config = _extend( config, self.config );
                config = _extend( config, parsed );

                if ( config.enter === 'top' || config.enter === 'bottom' ) {
                    config.axis = 'Y';
                } else if ( config.enter === 'left' || config.enter === 'right' ) {
                    config.axis = 'X';
                }

                if ( config.easing === 'hustle' ) {
                    config.easing = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
                }

                if ( config.enter === 'top' || config.enter === 'left' ) {
                    config.move = '-' + config.move;
                }

                return config;
            },

            // Generates CSS styles for an element
            styleFactory: function ( elem ) {

                var inline;
                var initial;
                var reset;
                var target;
                var transition;

                var cfg      = elem.config;
                var duration = ( parseFloat( cfg.over ) + parseFloat( cfg.wait ) ) * 1000;

                // if ( self.isMobile() && self.config.mobile ) cfg.wait = 0; // Optional: disable delay on mobile

                if ( elem.domEl.getAttribute( 'style' ) ) {
                    inline = elem.domEl.getAttribute( 'style' ) + '; visibility: visible; ';
                } else {
                    inline = 'visibility: visible; ';
                }

                transition = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
                             'transition: transform '         + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + ', opacity ' + cfg.over + ' ' + cfg.easing + ' ' + cfg.wait + '; ' +
                             '-webkit-perspective: 1000;' +
                             '-webkit-backface-visibility: hidden;';

                reset      = '-webkit-transition: -webkit-transform ' + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
                             'transition: transform '         + cfg.over + ' ' + cfg.easing + ' 0s, opacity ' + cfg.over + ' ' + cfg.easing + ' 0s; ' +
                             '-webkit-perspective: 1000; ' +
                             '-webkit-backface-visibility: hidden; ';

                initial = 'transform:';
                target  = 'transform:';
                build();

                initial += '-webkit-transform:';
                target  += '-webkit-transform:';
                build();

                return {
                    transition: transition,
                    initial:    initial,
                    target:     target,
                    reset:      reset,
                    inline:     inline,
                    duration:   duration
                };

                // Helper to construct transform styles
                function build() {

                    if ( parseInt( cfg.move ) !== 0 ) {
                        initial += ' translate' + cfg.axis + '(' + cfg.move + ')';
                        target  += ' translate' + cfg.axis + '(0)';
                    }

                    if ( parseInt( cfg.scale.power ) !== 0 ) {

                        if ( cfg.scale.direction === 'up' ) {
                            cfg.scale.value = 1 - ( parseFloat( cfg.scale.power ) * 0.01 );
                        } else if ( cfg.scale.direction === 'down' ) {
                            cfg.scale.value = 1 + ( parseFloat( cfg.scale.power ) * 0.01 );
                        }

                        initial += ' scale(' + cfg.scale.value + ')';
                        target  += ' scale(1)';
                    }

                    if ( cfg.rotate.x ) {
                        initial += ' rotateX(' + cfg.rotate.x + ')';
                        target  += ' rotateX(0)';
                    }

                    if ( cfg.rotate.y ) {
                        initial += ' rotateY(' + cfg.rotate.y + ')';
                        target  += ' rotateY(0)';
                    }

                    if ( cfg.rotate.z ) {
                        initial += ' rotateZ(' + cfg.rotate.z + ')';
                        target  += ' rotateZ(0)';
                    }

                    initial += '; opacity: ' + cfg.opacity + '; ';
                    target  += '; opacity: 1; ';
                }
            },

            // Get viewport height
            getViewportH: function () {

                var client = self.config.viewport[ 'clientHeight' ];
                var inner  = window[ 'innerHeight' ];

                if ( self.config.viewport === window.document.documentElement ) {
                    return ( client < inner ) ? inner : client;
                }

                return client;
            },

            // Get scroll Y position
            scrollY: function () {
                if ( self.config.viewport === window.document.documentElement ) {
                    return window.pageYOffset;
                } else {
                    return self.config.viewport.scrollTop + self.config.viewport.offsetTop;
                }
            },

            // Get element offset
            getOffset: function ( el ) {

                var offsetTop  = 0;
                var offsetLeft = 0;

                do {
                    if ( !isNaN( el.offsetTop ) ) {
                        offsetTop  += el.offsetTop;
                    }
                    if ( !isNaN( el.offsetLeft ) ) {
                        offsetLeft += el.offsetLeft;
                    }
                } while ( el = el.offsetParent );

                return {
                    top: offsetTop,
                    left: offsetLeft
                };
            },

            // Check if element is in viewport
            isElemInViewport: function ( elem ) {

                var elHeight = elem.domEl.offsetHeight;
                var elTop    = self.getOffset( elem.domEl ).top;
                var elBottom = elTop + elHeight;
                var vFactor  = elem.config.vFactor || 0;

                // Rest of the function is missing in the provided snippet.
                // Assuming it continues to calculate visibility.
            }
        };
    } ) );
} ) );
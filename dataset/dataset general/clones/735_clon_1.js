/*
 *  All this code is copyright Orteil, 2013.
 *  - with some help, advice, and fixes by Debugbro and Opti
 *  Spoilers ahead.
 *  Visit: http://orteil.dashnet.org
 *  This is a header comment, expanded for visual difference.
 */


/*
 * =====================================================================================
 * M I S C   H E L P E R   F U N C T I O N S
 * =======================================================================================
 * This section contains various utility functions used throughout the game.
 */
function l( what ) {
    return document.getElementById( what );
}

function choose( arr ) {
    return arr[ Math.floor( Math.random() * arr.length ) ];
}


// Polyfill for Array.prototype.indexOf if it doesn't exist.
if ( !Array.prototype.indexOf ) {

    Array.prototype.indexOf = function( needle ) {
        for ( var i = 0; i < this.length; i++ ) {
            if ( this[ i ] === needle ) {
                return i;
            }
        }
        return -1;
    };
}


function shuffle( array ) {
    var counter = array.length,
        temp,
        index;

    // While there are elements in the array to shuffle
    while ( counter-- ) {
        // Pick a random index from the remaining unshuffled elements
        index = ( Math.random() * counter ) | 0;

        // And swap the current element with the random one
        temp = array[ counter ];
        array[ counter ] = array[ index ];
        array[ index ] = temp;
    }
    return array;
}

// Function to format large numbers for display, e.g., 9999999 to 9,999,999
function Beautify( what, floats ) {
    var str = '';
    // Correct for potential floating point inaccuracies
    what = Math.round( what * 100000 ) / 100000;

    if ( floats > 0 ) {
        var floater = what - Math.floor( what );
        floater = Math.round( floater * 100000 ) / 100000; // More rounding error correction
        var floatPresent = floater ? 1 : 0;
        // This is a bit of a hack to get the decimal part as a string of specified length
        floater = ( floater.toString() + '0000000' ).slice( 2, 2 + floats );
        str = Beautify( Math.floor( what ) ) + ( floatPresent ? ( '.' + floater ) : '' );
    } else {
        what = Math.floor( what );
        // Convert to string, split, reverse for digit processing
        what = ( what + '' ).split( '' ).reverse();
        for ( var i in what ) {
            // Add comma every 3 digits
            if ( i % 3 == 0 && i > 0 ) {
                str = ',' + str;
            }
            str = what[ i ] + str;
        }
    }
    return str;
}


// Encodes a UTF-8 string to Base64.
function utf8_to_b64( str ) {
    try {
        return Base64.encode( unescape( encodeURIComponent( str ) ) );
        // Alternative using built-in browser functions (commented out)
        // return window.btoa(unescape(encodeURIComponent( str )));
    } catch ( err ) {
        // Display an error popup if encoding fails
        // Popup('There was a problem while encrypting to base64.<br>('+err+')');
        return '';
    }
}

// Decodes a Base64 string back to UTF-8.
function b64_to_utf8( str ) {
    try {
        return decodeURIComponent( escape( Base64.decode( str ) ) );
        // Alternative using built-in browser functions (commented out)
        // return decodeURIComponent(escape(window.atob( str )));
    } catch ( err ) {
        // Display an error popup if decoding fails
        // Popup('There was a problem while decrypting from base64.<br>('+err+')');
        return '';
    }
}


// Compresses a binary sequence (array of 0s and 1s) into a single number.
// Example: [0,1,1,0,1,0] -> 54
function CompressBin( arr ) {
    var str = '';
    var arr2 = arr.slice( 0 ); // Create a shallow copy
    arr2.unshift( 1 ); // Add leading '1'
    arr2.push( 1 ); // Add trailing '1'
    arr2.reverse(); // Reverse to build binary string correctly
    for ( var i in arr2 ) {
        str += arr2[ i ];
    }
    str = parseInt( str, 2 ); // Parse binary string to integer
    return str;
}

// Uncompresses a number back into a binary sequence (array of 0s and 1s).
// Example: 54 -> [0,1,1,0,1,0]
function UncompressBin( num ) {
    var arr = num.toString( 2 ); // Convert number to binary string
    arr = arr.split( '' ); // Split into array of characters
    arr.reverse(); // Reverse to match original order
    arr.shift(); // Remove leading '1'
    arr.pop(); // Remove trailing '1'
    return arr;
}


// Compresses a very long binary sequence by breaking it into smaller chunks.
// This is necessary to avoid issues with JavaScript's number precision (scientific notation).
function CompressLargeBin( arr ) {
    var arr2 = arr.slice( 0 );
    var thisBit = [];
    var bits = [];
    for ( var i in arr2 ) {
        thisBit.push( arr2[ i ] );
        if ( thisBit.length >= 50 ) { // Chunk size of 50 bits
            bits.push( CompressBin( thisBit ) );
            thisBit = [];
        }
    }
    if ( thisBit.length > 0 ) { // Compress any remaining bits
        bits.push( CompressBin( thisBit ) );
    }
    arr2 = bits.join( ';' ); // Join compressed chunks with a separator
    return arr2;
}

// Uncompresses a large binary sequence that was previously compressed by CompressLargeBin.
function UncompressLargeBin( arr ) {
    var arr2 = arr.split( ';' ); // Split into compressed chunks
    var bits = [];
    for ( var i in arr2 ) {
        bits.push( UncompressBin( parseInt( arr2[ i ] ) ) ); // Uncompress each chunk
    }
    arr2 = [];
    for ( var i in bits ) { // Reconstruct the full binary sequence
        for ( var ii in bits[ i ] ) {
            arr2.push( bits[ i ][ ii ] );
        }
    }
    return arr2;
}


// Seeded random function, courtesy of http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
// This is a self-executing anonymous function.
( function( a, b, c, d, e, f ) {
    function k( a ) {
        var b, c = a.length,
            e = this,
            f = 0,
            g = e.i = e.j = 0,
            h = e.S = [];
        for ( c || ( a = [ c++ ] ); d > f; ) h[ f ] = f++;
        for ( f = 0; d > f; f++ ) h[ f ] = h[ g = j & g + a[ f % c ] + ( b = h[ f ] ) ], h[ g ] = b;
        ( e.g = function( a ) {
            for ( var b, c = 0, f = e.i, g = e.j, h = e.S; a--; ) b = h[ f = j & f + 1 ], c = c * d + h[ j & ( h[ f ] = h[ g = j & g + b ] ) + ( h[ g ] = b ) ];
            return e.i = f, e.j = g, c
        } )( d )
    }

    function l( a, b ) {
        var e, c = [],
            d = ( typeof a )[ 0 ];
        if ( b && "o" == d )
            for ( e in a ) try {
                c.push( l( a[ e ], b - 1 ) )
            } catch ( f ) {}
        return c.length ? c : "s" == d ? a : a + "\0"
    }

    function m( a, b ) {
        for ( var d, c = a + "", e = 0; c.length > e; ) b[ j & e ] = j & ( d ^= 19 * b[ j & e ] ) + c.charCodeAt( e++ );
        return o( b )
    }

    function n( c ) {
        try {
            return a.crypto.getRandomValues( c = new Uint8Array( d ) ), o( c )
        } catch ( e ) {
            return [ +new Date, a, a.navigator.plugins, a.screen, o( b ) ]
        }
    }

    function o( a ) {
        return String.fromCharCode.apply( 0, a )
    }
    var g = c.pow( d, e ),
        h = c.pow( 2, f ),
        i = 2 * h,
        j = d - 1;
    c.seedrandom = function( a, f ) {
        var j = [],
            p = m( l( f ? [ a, o( b ) ] : 0 in arguments ? a : n(), 3 ), j ),
            q = new k( j );
        return m( o( q.S ), b ), c.random = function() {
            for ( var a = q.g( e ), b = g, c = 0; h > a; ) a = ( a + c ) * d, b *= d, c = q.g( 1 );
            for ( ; a >= i; ) a /= 2, b /= 2, c >>>= 1;
            return ( a + c ) / b
        }, p
    }, m( c.random(), b )
} )( this, [], Math, 256, 6, 52 );


/*
 * =====================================================================================
 * G A M E   I N I T I A L I Z A T I O N
 * =======================================================================================
 * This block defines the main Game object and its initialization logic.
 */
Game = {};


Game.Launch = function() {
    Game.ready = 0; // Flag to indicate if the game is ready
    Game.Init = function() {
        Game.ready = 1; // Game is now ready
        // Display a loading message
        l( 'javascriptError' ).innerHTML = '<div style="padding:64px 128px;"><div class="title">Loading...</div></div>';


        /*
         * =====================================================================================
         * V A R I A B L E S   A N D   P R E S E T S
         * =======================================================================================
         * This section initializes all core game variables and settings.
         */
        Game.T = 0; // Main game timer
        Game.fps = 30; // Frames per second target

        Game.version = 1.036; // Current game version
        Game.beta = 0; // Beta status (0 = false, 1 = true)
        // Update version number display on the page
        l( 'versionNumber' ).innerHTML = 'v.' + Game.version + ( Game.beta ? ' <span style="color:#ff0;">beta</span>' : '' );
        // Update links section - currently only shows classic cookie clicker
        // l('links').innerHTML=(Game.beta?'<a href="../" target="blank">Live version</a> | ':'<a href="beta" target="blank">Try the beta!</a> | ')+'<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';
        l( 'links' ).innerHTML = '<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';

        // Latency compensator variables
        Game.time = new Date().getTime(); // Current time in milliseconds
        Game.fpsMeasure = new Date().getTime(); // Used for FPS measurement
        Game.accumulatedDelay = 0; // Total accumulated delay
        Game.catchupLogic = 0; // Logic for catching up after lag

        Game.cookiesEarned = 0; // Total cookies earned across all game sessions
        Game.cookies = 0; // Current number of cookies
        Game.cookiesd = 0; // Display value for cookies
        Game.cookiesPs = 1; // Cookies per second (recalculated on purchases)
        Game.cookiesReset = 0; // Cookies lost due to game resets
        Game.frenzy = 0; // Duration of frenzy effect (multiplies cookie production)
        Game.frenzyPower = 1; // Multiplier during frenzy
        Game.clickFrenzy = 0; // Duration of click frenzy (multiplies mouse clicks)
        Game.cookieClicks = 0; // Count of clicks on the big cookie
        Game.goldenClicks = 0; // Count of golden cookies clicked
        Game.missedGoldenClicks = 0; // Count of golden cookies missed
        Game.handmadeCookies = 0; // Cookies generated purely by clicking
        Game.milkProgress = 0; // Progress towards different milk types (0-1: milk, 1-2: chocolate, etc.)
        Game.milkH = Game.milkProgress / 2; // Milk height for display (0 to 0.5)
        Game.milkHd = 0; // Display value for milk height
        Game.milkType = -1; // Custom milk type (-1 = default, 0 = plain, 1 = chocolate...)
        Game.backgroundType = -1; // Custom background type (-1 = default, 0 = blue, 1 = red...)
        Game.prestige = []; // Data that persists across resets (prestige system)

        Game.elderWrath = 0; // Current level of elder wrath
        Game.elderWrathD = 0; // Display value for elder wrath
        Game.pledges = 0; // Number of pledges made
        Game.pledgeT = 0; // Timer for pledge duration
        Game.researchT = 0; // Timer for current research
        Game.nextResearch = 0; // Index of the next research item

        Game.bg = ''; // Background element (grandmas, etc.)
        Game.bgFade = ''; // Fading background element
        Game.bgR = 0; // Background fade ratio (0 = not faded, 1 = fully faded)
        Game.bgRd = 0; // Display value for background fade ratio

        Game.startDate = parseInt( new Date().getTime() ); // Timestamp when the game started

        Game.prefs = []; // Array to store user preferences
        // Default preferences initialization
        Game.DefaultPrefs = function() {
            Game.prefs.particles = 1; // Particles effect on/off
            Game.prefs.numbers = 1; // Floating numbers on/off
            Game.prefs.autosave = 1; // Autosave on/off
            Game.prefs.autoupdate = 1; // Autoupdate on/off
            Game.prefs.milk = 1; // Milk display on/off
            Game.prefs.fancy = 1; // Fancy graphics on/off
        };
        Game.DefaultPrefs(); // Apply default preferences


        /*
         * =====================================================================================
         * U P D A T E   C H E C K E R   ( p o t e n t i a l l y   b r o k e n ? )
         * =======================================================================================
         * This section handles checking for new game versions.
         */
        Game.CheckUpdates = function() {
            // Make an AJAX request to check for updates
            ajax( 'server.php?q=checkupdate', Game.CheckUpdatesResponse );
        };

        Game.CheckUpdatesResponse = function( response ) {
            var r = response.split( '|' );
            // If a new version is available
            if ( parseFloat( r[ 0 ] ) > Game.version ) {
                var str = '<b>New version available : v.' + r[ 0 ] + '!</b>';
                if ( r[ 1 ] ) { // If an update note is provided
                    str += '<br>Update note : "' + r[ 1 ] + '"';
                }
                str += '<br><b>Refresh to get it!</b>';
                l( 'alert' ).innerHTML = str; // Display alert message
                l( 'alert' ).style.display = 'block'; // Make alert visible
            }
        };


        /*
         * =====================================================================================
         * S A V E   G A M E   F U N C T I O N S
         * =======================================================================================
         * Functions for exporting and importing game saves.
         */
        Game.ExportSave = function() {
            // Prompt the user to copy the save string
            var save = prompt( 'Copy this text and keep it somewhere safe!', Game.WriteSave( 1 ) );
        };

        Game.ImportSave = function() {
            // Prompt the user to paste their save string
            var save = prompt( 'Please paste in the text that was given to you on save export.', '' );
            if ( save && save != '' ) {
                Game.LoadSave( save ); // Load the provided save data
            }
            Game.WriteSave(); // Immediately save the loaded data (or current if import failed)
        };


        // Writes the current game state into a save string.
        Game.WriteSave = function( exporting ) { // `exporting` flag indicates if it's for export or autosave
            var str = '';
            str += Game.version + '|'; // Game version
            str += '|'; // Placeholder for future data
            str += // Save stats
                parseInt( Game.startDate ) +
                '|';
            str += // Preferences
                ( Game.prefs.particles ? '1' : '0' ) +
                ( Game.prefs.numbers ? '1' : '0' ) +
                ( Game.prefs.autosave ? '1' : '0' ) +
                ( Game.prefs.autoupdate ? '1' : '0' ) +
                ( Game.prefs.milk ? '1' : '0' ) +
                ( Game.prefs.fancy ? '1' : '0' ) +
                '|';
            str += parseFloat( Math.floor( Game.cookies ) ) + ';' +
                parseFloat( Math.floor( Game.cookiesEarned ) ) + ';' +
                parseInt( Math.floor( Game.cookieClicks ) ) + ';' +
                parseInt( Math.floor( Game.goldenClicks ) ) + ';' +
                parseFloat( Math.floor( Game.handmadeCookies ) ) + ';' +
                parseInt( Math.floor( Game.missedGoldenClicks ) ) + ';' +
                parseInt( Math.floor( Game.backgroundType ) ) + ';' +
                parseInt( Math.floor( Game.milkType ) ) + ';' +
                parseFloat( Math.floor( Game.cookiesReset ) ) + ';' +
                parseInt( Math.floor( Game.elderWrath ) ) + ';' +
                parseInt( Math.floor( Game.pledges ) ) + ';' +
                parseInt( Math.floor( Game.pledgeT ) ) + ';' +
                parseInt( Math.floor( Game.nextResearch ) ) + ';' +
                parseInt( Math.floor( Game.researchT ) ) +
                '|'; // Core cookie stats and timers

            for ( var i in Game.Objects ) { // Buildings data
                var me = Game.Objects[ i ];
                str += me.amount + ',' + me.bought + ',' + Math.floor( me.totalCookies ) + ',' + me.specialUnlocked + ';';
            }
            str += '|';

            var toCompress = [];
            for ( var i in Game.Upgrades ) { // Upgrades data
                var me = Game.Upgrades[ i ];
                toCompress.push( Math.min( me.unlocked, 1 ), Math.min( me.bought, 1 ) );
            }
            toCompress = CompressLargeBin( toCompress ); // Compress upgrade states
            str += toCompress;
            str += '|';

            var toCompress = [];
            for ( var i in Game.Achievements ) { // Achievements data
                var me = Game.Achievements[ i ];
                toCompress.push( Math.min( me.won ) );
            }
            toCompress = CompressLargeBin( toCompress ); // Compress achievement states
            str += toCompress;


            if ( exporting ) {
                // For export, encode to Base64 and add an end marker
                str = escape( utf8_to_b64( str ) + '!END!' );
                return str;
            } else {
                // For autosave, store in a cookie
                // Yes, we're using cookies for Cookie Clicker saves!
                var now = new Date();
                now.setFullYear( now.getFullYear() + 5 ); // Save for 5 years
                str = utf8_to_b64( str ) + '!END!';
                str = 'CookieClickerGame=' + escape( str ) + '; expires=' + now.toUTCString() + ';';
                document.cookie = str; // Write the cookie
                // Check if the cookie was actually set
                if ( document.cookie.indexOf( 'CookieClickerGame' ) < 0 ) {
                    Game.Popup( 'Error while saving.<br>Export your save instead!' );
                } else {
                    Game.Popup( 'Game saved' );
                }
            }
        };

        /*
         * =====================================================================================
         * L O A D   G A M E   F U N C T I O N S
         * =======================================================================================
         * Functions for loading game saves.
         */
        Game.LoadSave = function( data ) {
            var str = '';
            if ( data ) { // If data is provided (import)
                str = unescape( data );
            } else if ( document.cookie.indexOf( 'CookieClickerGame' ) >= 0 ) {
                // If no data provided, try to load from cookie
                str = unescape( document.cookie.split( 'CookieClickerGame=' )[ 1 ] );
            }

            if ( str != '' ) {
                var version = 0;
                var oldstr = str.split( '|' );
                if ( oldstr[ 0 ] < 1 ) {
                    // Handle very old save formats if necessary (currently empty)
                } else {
                    str = str.split( '!END!' )[ 0 ]; // Remove end marker
                    str = b64_to_utf8( str ); // Decode from Base64
                }

                if ( str != '' ) {
                    var spl = '';
                    str = str.split( '|' );
                    version = parseFloat( str[ 0 ] ); // Get save version

                    if ( version >= 1 && version > Game.version ) {
                        // Prevent loading saves from future versions
                        alert( 'Error : you are attempting to load a save from a later version (v.' + version + '; you are using v.' + Game.version + ').' );
                        return;
                    } else if ( version >= 1 ) {
                        spl = str[ 2 ].split( ';' ); // Save stats
                        Game.startDate = parseInt( spl[ 0 ] );

                        spl = str[ 3 ].split( '' ); // Preferences
                        Game.prefs.particles = parseInt( spl[ 0 ] );
                        Game.prefs.numbers = parseInt( spl[ 1 ] );
                        Game.prefs.autosave = parseInt( spl[ 2 ] );
                        Game.prefs.autoupdate = spl[ 3 ] ? parseInt( spl[ 3 ] ) : 1;
                        Game.prefs.milk = spl[ 4 ] ? parseInt( spl[ 4 ] ) : 1;
                        Game.prefs.fancy = parseInt( spl[ 5 ] );
                        if ( Game.prefs.fancy ) {
                            Game.removeClass( 'noFancy' );
                        } else if ( !Game.prefs.fancy ) {
                            Game.addClass( 'noFancy' );
                        }

                        spl = str[ 4 ].split( ';' ); // Cookies and other core stats
                        Game.cookies = parseFloat( spl[ 0 ] );
                        Game.cookiesEarned = parseFloat( spl[ 1 ] );
                        Game.cookieClicks = spl[ 2 ] ? parseInt( spl[ 2 ] ) : 0;
                        Game.goldenClicks = spl[ 3 ] ? parseInt( spl[ 3 ] ) : 0;
                        Game.handmadeCookies = spl[ 4 ] ? parseFloat( spl[ 4 ] ) : 0;
                        Game.missedGoldenClicks = spl[ 5 ] ? parseInt( spl[ 5 ] ) : 0;
                        Game.backgroundType = spl[ 6 ] ? parseInt( spl[ 6 ] ) : 0;
                        Game.milkType = spl[ 7 ] ? parseInt( spl[ 7 ] ) : 0;
                        Game.cookiesReset = spl[ 8 ] ? parseFloat( spl[ 8 ] ) : 0;
                        Game.elderWrath = spl[ 9 ] ? parseInt( spl[ 9 ] ) : 0;
                        Game.pledges = spl[ 10 ] ? parseInt( spl[ 10 ] ) : 0;
                        Game.pledgeT = spl[ 11 ] ? parseInt( spl[ 11 ] ) : 0;
                        Game.nextResearch = spl[ 12 ] ? parseInt( spl[ 12 ] ) : 0;
                        Game.researchT = spl[ 13 ] ? parseInt( spl[ 13 ] ) : 0;

                        spl = str[ 5 ].split( ';' ); // Buildings data
                        Game.BuildingsOwned = 0;
                        for ( var i in Game.ObjectsById ) {
                            var me = Game.ObjectsById[ i ];
                            if ( spl[ i ] ) {
                                var mestr = spl[ i ].toString().split( ',' );
                                me.amount = parseInt( mestr[ 0 ] );
                                me.bought = parseInt( mestr[ 1 ] );
                                me.totalCookies = parseInt( mestr[ 2 ] );
                                me.specialUnlocked = parseInt( mestr[ 3 ] );
                                Game.BuildingsOwned += me.amount;
                            } else {
                                me.unlocked = 0;
                                me.bought = 0;
                                me.totalCookies = 0;
                            }
                        }

                        // Handle old save format for upgrades and achievements (pre-1.035)
                        if ( version < 1.035 ) {
                            spl = str[ 6 ].split( ';' ); // Upgrades
                            Game.UpgradesOwned = 0;
                            for ( var i in Game.UpgradesById ) {
                                var me = Game.UpgradesById[ i ];
                                if ( spl[ i ] ) {
                                    var mestr = spl[ i ].split( ',' );
                                    me.unlocked = parseInt( mestr[ 0 ] );
                                    me.bought = parseInt( mestr[ 1 ] );
                                    if ( me.bought ) Game.UpgradesOwned++;
                                } else {
                                    me.unlocked = 0;
                                    me.bought = 0;
                                }
                            }
                            if ( str[ 7 ] ) spl = str[ 7 ].split( ';' );
                            else spl = []; // Achievements
                            Game.AchievementsOwned = 0;
                            for ( var i in Game.AchievementsById ) {
                                var me = Game.AchievementsById[ i ];
                                if ( spl[ i ] ) {
                                    var mestr = spl[ i ].split( ',' );
                                    me.won = parseInt( mestr[ 0 ] );
                                } else {
                                    me.won = 0;
                                }
                                if ( me.won && me.hide != 3 ) Game.AchievementsOwned++;
                            }
                        } else { // Handle newer save format (1.035+) using binary compression
                            if ( str[ 6 ] ) spl = str[ 6 ];
                            else spl = []; // Upgrades
                            spl = UncompressLargeBin( spl ); // Decompress upgrades
                            Game.UpgradesOwned = 0;
                            for ( var i in Game.UpgradesById ) {
                                var me = Game.UpgradesById[ i ];
                                if ( spl[ i * 2 ] ) {
                                    var mestr = [ spl[ i * 2 ], spl[ i * 2 + 1 ] ];
                                    me.unlocked = parseInt( mestr[ 0 ] );
                                    me.bought = parseInt( mestr[ 1 ] );
                                    if ( me.bought ) Game.UpgradesOwned++;
                                } else {
                                    me.unlocked = 0;
                                    me.bought = 0;
                                }
                            }
                            if ( str[ 7 ] ) spl = str[ 7 ];
                            else spl = []; // Achievements
                            spl = UncompressLargeBin( spl ); // Decompress achievements
                            Game.AchievementsOwned = 0;
                            for ( var i in Game.AchievementsById ) {
                                var me = Game.AchievementsById[ i ];
                                if ( spl[ i ] ) {
                                    var mestr = [ spl[ i ] ];
                                    me.won = parseInt( mestr[ 0 ] );
                                } else {
                                    me.won = 0;
                                }
                                if ( me.won && me.hide != 3 ) Game.AchievementsOwned++;
                            }
                        }


                        // Post-load processing for buildings
                        for ( var i in Game.ObjectsById ) {
                            var me = Game.ObjectsById[ i ];
                            if ( me.buyFunction ) me.buyFunction();
                            me.setSpecial( 0 ); // Reset special status
                            if ( me.special ) me.special(); // Reapply special effects
                            me.refresh(); // Refresh display
                        }
                    } else { // Importing very old version save (pre-version 1)
                        /*
                        Game.startDate=parseInt(new Date().getTime());
                        Game.cookies=parseInt(str[1]);
                        */
                    }
                }
            }
        };
/*******************************************************************************
 *  Code Clone Type I Sample: Miankong.cc JavaScript Library
 *  Copyright (c) 2011. All rights reserved by Miankong.cc and RenYi.
 *  This file contains the core JSI (JavaScript Interface) implementation
 *  and foundational View components for the application framework.
 ******************************************************************************/

( function ( ) {
    /*
     *  The global native Java interface object.
     *  This object provides methods to interact with the underlying Java (Android) system.
     *  Key function: jsi.N(json_param, str_cmd) - sends commands to native.
     */
    var DBNAME = "met.app.db"; // Default database name for SQL operations.

    if ( ! window.jsi ) { // Check if the jsi object has already been initialized.

        window.jsi = {
            // A callback function to be invoked when the native back button is pressed.
            metaBackCallback: null,

            // XXX: This function is called back by the native layer to initiate the actual command.
            // XXX: The native layer cannot determine if the key event is handled by JavaScript.
            metaBack: function ( ) {
                if ( jsi.metaBackCallback ) {
                    jsi.metaBackCallback( ); // Execute the registered callback.
                }
            },

            // Binds a function to be called when the native back button is pressed.
            bindMetaBack: function ( fn ) {
                if ( jsi.metaBackCallback ) {
                    console.log( "XXXXXXXXXXXXXX bindBtnBack: A callback is already bound!" );
                }
                jsi.metaBackCallback = fn; // Assign the new callback function.
            },

            // Unbinds the currently registered metaBack callback.
            unbindMetaBack: function ( fn ) {
                // Check if the function being unbound is actually the one currently bound.
                if ( jsi.metaBackCallback != fn ) {
                    console.log( "XXXXXXXXXXXXXX unbindBtnBack: Attempting to remove another module's callback." );
                }
                jsi.metaBackCallback = null; // Clear the callback.
            },

            // Placeholder for native menu button functionality.
            metaMenu: function ( ) {
            },

            // Placeholder for native search button functionality.
            metaSearch: function ( ) {
            },

            // Placeholder for starting an application.
            startApp: function ( ) {
            },

            // The core native interface function.
            // Sends JSON parameters and a command string to the native layer.
            N: function ( json_param , str_cmd ) {
                var js_res = prompt( json_param , str_cmd ); // Native call via prompt.
                // console.log("jsi.N:RAW RESULT: " + js_res); // Debugging raw result.

                if ( js_res ) {
                    try {
                        js_res = JSON.parse( js_res ); // Attempt to parse the result as JSON.
                    } catch ( e ) {
                        console.log( "" + e ); // Log parsing errors.
                        js_res = null; // Set result to null on error.
                    }
                    // console.log("jsi.N:PARSED RESULT: " + (typeof js_res) + " " + js_res); // Debugging parsed result.
                } else {
                    js_res = null; // If no result, set to null.
                }
                return js_res; // Return the processed result.
            },

            // Callback for camera operations.
            cameraCallback: function ( success , dataUri ) {
                $.delegate( jsi._camRequester , "cameraCallback" , success , dataUri ); // Delegate to the requester.
                jsi._camRequester = null; // Clear the requester reference.
            },
            _camRequester: null,    // XXX: This implementation is non-re-entrant. Needs a fix for multiple requests.

            // Callback for activity results from native.
            activityResultCallback: function ( js_str ) {
                var json = null;
                if ( js_str ) {
                    json = JSON.parse( js_str ); // Parse the result string as JSON.
                }
                $.delegate( jsi._activityStarter , "activityResult" , json ); // Delegate the result.
                jsi._activityStarter = null; // Clear the activity starter reference.
            },
            _activityStarter: null, // XXX: This implementation is non-re-entrant. Needs a fix.

            // Polling mechanism for asynchronous native results.

            _pollTimer: null, // Timer ID for setInterval.
            _pollParams: { }, // Stores parameters for ongoing polls: id -> { count, success, error, jsiFinished, jsiResult }.

            _jsiPoller: function ( ) {
                var done = [ ]; // Array to hold IDs of finished polls.

                $.each( this._pollParams , function ( v , k ) {
                    // k is the ID to query, v contains JavaScript callbacks and polling statistics.
                    var finished = false;
                    var res;

                    if ( $.isFunction( v.jsiFinished ) ) {
                        console.log( "_jsiPoller: using functor" );
                        res = v.jsiFinished( k ); // Call jsiFinished as a function if provided.
                    } else {
                        res = jsi.N( "" + k , v.jsiFinished ); // Call native with jsiFinished command.
                    }

                    if ( res === null || res === true ) {
                        finished = true;
                        done.push( k ); // Mark as done if null or true.
                    }

                    if ( res === true ) { // If the operation finished successfully.
                        if ( $.isFunction( v.jsiResult ) ) {
                            res = v.jsiResult( k ); // Get result via functor.
                        } else {
                            res = jsi.N( "" + k , v.jsiResult ); // Get result via native call.
                        }

                        if ( res == null ) {
                            if ( v.error ) {
                                try {
                                    v.error( "bad request: " + res ); // Call error callback.
                                } catch ( e ) {
                                    console.log( "exception JSI.error: " + e );
                                }
                            }
                        } else {
                            if ( v.success ) {
                                try {
                                    v.success( res ); // Call success callback.
                                } catch ( e ) {
                                    console.log( "exception JSI.success: " + e );
                                }
                            }
                        }
                    }

                    // If not finished and poll count exceeds limit (1000 iterations).
                    if ( ! finished && ++v.count > 1000 ) {
                        if ( v.error ) {
                            v.error( "timeout" ); // Report timeout error.
                        }
                        done.push( k ); // Mark as done due to timeout.
                    }
                } );

                // Clean up finished poll parameters.
                for ( var i = 0 ; i < done.length ; i++ ) {
                    delete this._pollParams[ done[ i ] ];
                }

                // If no more polls are active, clear the timer.
                if ( ! $.size( this._pollParams ) ) {
                    console.log( "TIMER cleared!" );
                    clearInterval( this._pollTimer );
                    this._pollTimer = 0;
                }
            },

            // Sets up polling for SQL operations.
            _setupSqlPoll: function ( dbName , id , onFinished ) {
                if ( ! id ) {
                    if ( onFinished ) {
                        onFinished( -1 ); // Indicate error if no ID.
                    }
                    return;
                }

                this._pollParams[ id ] = {
                    count: 0,
                    success: onFinished,
                    error: function ( emsg ) { console.log( "SQL error: " + emsg ); },
                    jsiFinished: function ( id ) { return jsi.N( JSON.stringify( [ dbName , "" + id ] ) , "jsi:sqlFinished" ); },
                    jsiResult: function ( id ) { return jsi.N( JSON.stringify( [ dbName , "" + id ] ) , "jsi:sqlResult" ); }
                };

                if ( ! this._pollTimer ) {
                    console.log( "TIMER setup!" );
                    this._pollTimer = setInterval( $.bind( this._jsiPoller , this ) , 50 ); // Start polling if not already running.
                }
            },

            // ---- Public methods for SQL operations ----

            // Executes an SQL INSERT statement.
            sqlInsert: function ( table , columnValues , onFinished , dbName ) {
                var cmd = {
                    dbName: dbName ? dbName : DBNAME,
                    op: "insert",
                    args: [ table , columnValues ]
                };
                var id = jsi.N( JSON.stringify( cmd ) , "jsi:sql" ); // Send command to native.
                this._setupSqlPoll( cmd.dbName , id , onFinished ); // Set up polling for result.
                return id;
            },

            // Executes an SQL UPDATE statement.
            sqlUpdate: function ( table , columnValues , where , whereArgs , onFinished , dbName ) {
                var cmd = {
                    dbName: dbName ? dbName : DBNAME,
                    op: "update",
                    args: [ table , columnValues , where , whereArgs ]
                };
                var id = jsi.N( JSON.stringify( cmd ) , "jsi:sql" );
                this._setupSqlPoll( cmd.dbName , id , onFinished );
                return id;
            },

            // Executes an SQL DELETE statement.
            sqlDelete: function ( table , where , whereArgs , onFinished , dbName ) {
                var cmd = {
                    dbName: dbName ? dbName : DBNAME,
                    op: "delete",
                    args: [ table , where , whereArgs ]
                };
                var id = jsi.N( JSON.stringify( cmd ) , "jsi:sql" );
                this._setupSqlPoll( cmd.dbName , id , onFinished );
                return id;
            },

            // Executes an SQL SELECT query.
            sqlSelect: function ( sql , args , onFinished , dbName ) {
                var cmd = {
                    dbName: dbName ? dbName : DBNAME,
                    op: "select",
                    args: ( args ? [ sql , args ] : [ sql ] ) // Handle optional arguments.
                };
                var id = jsi.N( JSON.stringify( cmd ) , "jsi:sql" );
                this._setupSqlPoll( cmd.dbName , id , onFinished );
                return id;
            },

            // Requests an OAuth request token.
            getRequestTokenQ: function ( url , data ) {
                return jsi.N( JSON.stringify( {
                    url: url,
                    data: data
                } ) , "jsi:ajaxGetRequestTokenQ" );
            },

            // Starts an asynchronous HTTP request using OAuth signing.
            // Parameters:
            //   type: "GET" | "POST"
            //   url: Base URL (without query string)
            //   data: Request payload
            //   success: Callback function(response) on success
            //   error: Callback function(msg) on error
            //   accKey, accSecret: Optional OAuth consumer key/secret.
            // Note: The native part cannot report results directly via "loadUrl" as it interrupts foreground operations.
            ajax: function ( type , url , data , success , error , accKey , accSecret ) {
                type = type || "GET"; // Default to GET if not specified.
                type = type.toUpperCase( ); // Ensure uppercase.

                var desc = type + ": " + url; // Description for logging/debugging.

                var params = {
                    type: type,
                    url: url,
                    data: data
                };

                if ( accKey && accSecret ) {
                    params.accKey = accKey;
                    params.accSecret = accSecret;
                } else {
                    // params.accKey = ""; // Original commented out lines.
                    // params.accSecret = "";
                    params.accKey = window.ACC_KEY; // Use global keys if not provided.
                    params.accSecret = window.ACC_SECRET;
                }

                var id = jsi.N( JSON.stringify( params ) , "jsi:ajax" ); // Send AJAX command to native.

                if ( id ) {
                    this._pollParams[ id ] = {
                        count: 0,
                        success: success,
                        error: error,
                        jsiFinished: "jsi:ajaxFinished",
                        jsiResult: "jsi:ajaxResult"
                    };

                    if ( ! this._pollTimer ) {
                        this._pollTimer = setInterval( $.bind( this._jsiPoller , this ) , 50 ); // Start polling.
                    }
                } else {
                    if ( error ) {
                        error( "error setup background worker." ); // Report error if command failed to start.
                    }
                }
                return id;
            },

            // Fetches an image from a URL.
            getImage: function ( url , success , error ) {
                var id = jsi.N( url , "jsi:imgFetch" ); // Request image fetch.

                if ( id ) {
                    this._pollParams[ id ] = {
                        count: 0,
                        success: success,
                        error: error,
                        jsiFinished: "jsi:imgFetchFinished",
                        jsiResult: "jsi:imgFetchResult"
                    };

                    if ( ! this._pollTimer ) {
                        this._pollTimer = setInterval( $.bind( this._jsiPoller , this ) , 50 ); // Start polling.
                    }
                }
                return id;
            },

            // Starts a native activity and expects a result callback.
            // callback(success, emsg_or_js_str)
            startActivityForResult: function ( clsFullname , strParam , callbackDelegate ) {
                jsi._activityStarter = callbackDelegate; // Store the delegate for the result.
                jsi.N( JSON.stringify( {
                    activityClassFullname: clsFullname,
                    activityParam: strParam,
                    onResult: "jsi.activityResultCallback" // Native will call this JS function.
                } ) , "jsi:startActivityForResult" );
            },

            // Initiates a camera snap operation.
            cameraSnap: function ( obj ) {
                jsi._camRequester = obj; // Store the object that requested the camera.
                // jsi.N("jsi.cameraCallback", "jsi:snap"); // Older, simpler snap command.
                jsi.N( JSON.stringify( {
                    cbName: "jsi.cameraCallback",
                    width: 1024,
                    height: 0,
                    hint: "保存图片..." // Hint for the user.
                } ) , "jsi:snapIntent" );
            },

            // Checks if the application is running in debug mode.
            isDebug: function ( ) {
                var t = jsi.N( "" , "jsi:debug" ); // Query native for debug status.
                console.log( "isDebug: " + t );
                return t;
                // return jsi.N("", "jsi:debug") || true; // Alternative debug check (always true if native returns falsy).
            },

            // Retrieves the current geographical location.
            getGeoLocation: function ( ) {
                return jsi.N( "" , "jsi:getGeoLocation" );
            },

            // Loads a new URL in the native browser/webview.
            loadURL: function ( url ) {
                jsi.N( url , "jsi:loadURL" );
            },

            // Hides the application splash screen.
            hideSplash: function ( ) {
                jsi.N( "" , "jsi:hideSplash" );
            },

            // Hides the native input manager (soft keyboard).
            hideInputManager: function ( ) {
                jsi.N( "" , "jsi:hideInputManager" );
            },

            // Finishes the current native activity.
            finishActivity: function ( ) {
                jsi.N( null , "jsi:finishActivity" );
            },

            // Displays a modal alert dialog.
            modalAlert: function ( title , msg , noCancel ) {
                return jsi.N( JSON.stringify( { title: title , msg: msg , noCancel: noCancel ? true : false } ) , "jsi:modalAlert" );
            },

            // Shows a modal loading indicator with a message.
            modalLoadingIndicator: function ( msg ) {
                jsi.N( msg , "jsi:modalLoadingIndicator" );
            },

            // Closes the currently displayed modal loading indicator.
            closeModalLoadingIndicator: function ( ) {
                jsi.N( null , "jsi:closeModalLoadingIndicator" );
            }
        };
    }

    // Set a global debug flag based on the native `isDebug` call.
    $.DEBUG = jsi.isDebug( );


    /*****************************************************************************
     *
     *  Application View Components
     *
     *  This section defines foundational view classes for the application UI.
     *
     ****************************************************************************/

    // Template Usage:
    //  - Views expect a holder div defined within "#templates".
    //  - Attributes:
    //      - `view`: Specifies a class name within `appNamespace` or defaults to `$.View`.
    //      - `delegate`: Specifies a class name within `appNamespace` to handle view events.

    // $.TabbarView: A specialized view for managing a tabbed interface.
    // It expects a template containing two DIVs with IDs "tabbed-views" and "tabbar".
    // The "tabbar" content defines tabs based on labels, and associated subviews
    // are retrieved using a naming convention for their templates.
    $.TabbarView = $.View.extend( {
        dataMembers: function ( ) {
            return {
                tabNames: null, // Array of tab names (IDs).
                activeTabName: null, // Currently active tab's name.
                tabbarHeight: -1, // Height of the tabbar, initialized to -1.

                activeTabFragment: null, // DOM fragment of the active subview.
                subviews: { }, // Map of tabName -> subview instance.
                subviewTabDivs: { }, // Map of tabName -> tab DIV element.
                $tabbar: null // jQuery object for the tabbar element.
            };
        },

        initDataMembers: function ( ) {
            var d = this.dataMembers( );
            for ( var n in d ) {
                this[ n ] = d[ n ];
            }
        },

        // Initializes the TabbarView.
        // tmplSel: Selector for the template.
        // appNamespace: Optional namespace for view classes.
        init: function ( tmplSel , appNamespace ) {
            this.initDataMembers( ); // Initialize instance variables.

            if ( ! appNamespace ) {
                appNamespace = theApp.appNamespace; // Use default app namespace if not provided.
            }

            this.render( ); // Initial rendering to get the fragment.
            var $tmpl = this.fragment;

            // Extract tab names from labels within the tabbar.
            this.tabNames = $.map( $( "#tabbar>div>label" , $tmpl ) , function ( label ) {
                return $( label ).attr( "id" );
            } );

            if ( ! this.tabNames.length ) {
                throw new Error( "TabbarView: empty tab" ); // Error if no tabs are found.
            }

            this.$tabbar = $tmpl.find( "#tabbar" ); // Find the tabbar element.

            // Initialize subviews for each tab.
            for ( var i = 0 ; i < this.tabNames.length ; i++ ) {
                var n = this.tabNames[ i ],
                    id = this.subviewTmplID( n ); // Get template ID for the subview.
                this.subviewTabDivs[ n ] = $( this.$tabbar.find( "div" )[ i ] ); // Store tab div.
                this.subviews[ n ] = $.makeView( this , "#" + id , appNamespace ); // Create subview instance.
            }

            this.changeTab( this.tabNames[ 0 ] ); // Activate the first tab by default.
        },

        // Renders the TabbarView and its active subview.
        // force: If true, forces a re-render.
        // by: The object that initiated the render call.
        render: function ( force , by ) {
            // XXX: Be cautious when using 'force'.
            // XXX: 'force' will destroy the reference held by 'fragment'.
            // XXX: If this view is currently on screen, you must remove it manually.
            if ( ( force && by === this ) || ! this.fragment ) {
                if ( this.fragment ) {
                    this.disconnect( this.fragment ); // Disconnect old fragment if forcing.
                }
                this.fragment = $( this.tmpl ); // Create new fragment (skips template engine if not needed).
                this.connect( this.fragment ); // Connect new fragment.
            }

            if ( this.activeTabName &&
                ( ! this.activeTabFragment ||
                    ( force && ( by === this.subviews[ this.activeTabName ]
                        || by === this.subviews[ this.activeTabName ].delegate ) ) ) ) {
                // XXX: Do not re-render an already rendered subview unless forced.
                // XXX: Consider releasing resources of inactive subviews.
                this.activeTabFragment = this.subviews[ this.activeTabName ].render( force , by ).fragment;
                var $t = this.fragment.find( "#tabbed-views" ),
                    _cls;
                if ( _cls = this.subviews[ this.activeTabName ].cssClass ) {
                    $t.addClass( _cls ); // Apply CSS class from subview.
                } else {
                    $t.attr( "class" , "" ); // Clear class if no specific one.
                }
                $t.empty( ).append( this.activeTabFragment ); // Replace content with active subview's fragment.
            }
            return this;
        },

        // Destroys the TabbarView and all its subviews.
        destroy: function ( ) {
            this._super_.destroy.call( this ); // Call parent's destroy method.
            $.each( this.subviews , function ( view , k ) {
                view.destroy( ); // Destroy each subview.
                this.subviews[ k ] = null; // Remove reference.
            } );
        },

        // Changes the currently active tab.
        changeTab: function ( tabName ) {
            if ( this.activeTabName == tabName ) {
                // this.subviews[tabName].doDelegate("alreadySwitchedIn"); // Optional delegate call.
                return; // Do nothing if already on the requested tab.
            }

            this.render( ); // Ensure the view is rendered before tab change.

            if ( ! this.activeTabName ) { // If no tab was active before.
                for ( var i = 0 ; i < this.tabNames.length ; i++ ) {
                    if ( this.tabNames[ i ] == tabName ) {
                        this.subviewTabDivs[ tabName ].addClass( "selected" ); // Select the new tab.
                    } else {
                        this.subviewTabDivs[ this.tabNames[ i ] ].removeClass( "selected" ); // Deselect others.
                    }
                }
            } else { // If a tab was previously active.
                this.activeTabFragment = null; // Clear active fragment.
                this.subviewTabDivs[ this.activeTabName ].removeClass( "selected" ); // Deselect old tab.
                this.subviews[ this.activeTabName ].doDelegate( "switchOut" ); // Notify old tab it's switching out.
                this.subviewTabDivs[ tabName ].addClass( "selected" ); // Select new tab.
            }

            this.subviews[ tabName ].doDelegate( "switchIn" ); // Notify new tab it's switching in.
            this.activeTabName = tabName; // Update active tab name.
            this.render( ); // Re-render to show the new active tab's content.
        },

        // --- Application delegate messages ---

        // Handles soft keyboard visibility changes.
        softKeyboard: function ( softKShown ) {
            if ( this.tabbarHeight <= 0 ) {
                this.computeTabbarHeight( ); // Compute height if not already done.
            }
            if ( this.tabbarHeight <= 0 ) {
                // Not yet on screen or height couldn't be computed.
                return;
            }

            if ( softKShown ) { // If soft keyboard is shown, hide the tabbar.
                this.fragment.find( "#tabbed-views" ).css( "margin-bottom" , 0 );
                this.$tabbar.css( "margin-bottom" , -this.tabbarHeight );
            } else { // If soft keyboard is hidden, show the tabbar.
                this.fragment.find( "#tabbed-views" ).css( "margin-bottom" , this.tabbarHeight );
                this.$tabbar.css( "margin-bottom" , 0 );
            }
        },

        // Computes and stores the height of the tabbar.
        computeTabbarHeight: function ( ) {
            this.tabbarHeight = this.$tabbar.offset( ).height;
        },

        // Generates the template ID for a subview based on its tab name.
        subviewTmplID: function ( tabName ) {
            return "tmpl-view-" + tabName;
        }
    } );

    // $.NavView: A view component for managing a navigation stack (history) of views.
    $.NavView = $.View.extend( {

        dataMembers: function ( ) {
            return {
                TRANSITIONEND: "webkitTransitionEnd", // Event name for CSS transitions.
                viewCache: { }, // Cache for view instances.
                viewStack: [ ], // Stack of active view instances.
                elStack: [ ], // Stack of view's root DOM elements.
                scrollStack: [ ], // Stack of scroll positions for views.

                $stage: null, // jQuery object for the main stage area where views are displayed.
                $navbar: null, // jQuery object for the navigation bar.
                navbarHomeCls: null, // CSS class for the home state of the navbar.
                navbarHomeHtml: null // HTML content for the home state of the navbar.
            };
        },

        initDataMembers: function ( ) {
            var d = this.dataMembers( );
            for ( var k in d ) {
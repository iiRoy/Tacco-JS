/*
 * This is a Type I clone of the original WADEngine JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace and comments have been altered significantly to create
 * a visually distinct, but functionally identical, version of the code.
 * This includes varying indentation, adding/removing blank lines,
 * and inserting comprehensive comments.
 */

function WADEngine( graph, actx, dest ) {

    // Initialize the engine's internal state variables.
    this.usekey = false; // Flag to indicate if keyboard input nodes are present.

    this.actx = actx; // Store the provided AudioContext.

    /*
     * If an AudioContext is not supplied, create a new one.
     * This ensures the engine always operates within a valid audio environment.
     */
    if ( ! actx ) {

        this.actx = new AudioContext( ); // Instantiate a fresh AudioContext.

    }

    // If an audio destination is not provided, use the default destination of the AudioContext.
    if ( ! dest ) {

        this.dest = this.actx.destination; // Set the default audio output destination.

    }

    this.nodes = { }; // An object to store all the created audio nodes, indexed by their names.


    /**
     * Helper function to locate a specific node within the engine's node collection.
     * It handles special case for the 'destination' node and parses dot-separated names.
     *
     * @param {object} eng  - The WADEngine instance itself.
     * @param {string} name - The identifier of the node to find (e.g., "osc1", "gain1.gain").
     * @returns {AudioNode|object} The requested audio node or a property of it.
     */
    function Find( eng, name ) {

        // If the name is "destination", return the main audio output.
        if ( name == "destination" ) {

            return eng.dest;

        }

        // Split the name by dot to handle cases like "gainNode.gain".
        var n = name.split( "." );

        // If there's only one part, it's a direct node name.
        if ( n.length == 1 ) {

            return eng.nodes[ n[ 0 ] ]; // Return the node directly from the nodes object.

        }

        // If there are two parts, it's a property of a node (e.g., gainNode.gain).
        return eng.nodes[ n[ 0 ] ][ n[ 1 ] ];

    } // End of Find function.


    /*
     * Func: A custom node constructor that represents a mathematical function.
     * It holds two input variables and computes an output based on them.
     */
    function Func( ) {

        this.vars = [ 0, 0 ]; // Array to store the two input variables for the function.

        this.c = [ ]; // An array to store all outgoing connections from this Func node.

        // The actual function logic, defaulting to a MIDI-to-frequency conversion.
        this.func = function ( x, y ) {

            return 440 * Math.pow( 2, ( x + y - 69 ) / 12 ); // Standard A4=440Hz, 12-TET formula.

        };

        this.type = "fun"; // A string identifier for this custom node type.

        /**
         * Establishes a connection from this Func node to a target.
         *
         * @param {object} target - The object or AudioParam to connect to.
         * @param {number} o      - Output index (not directly used by Func, but for consistency).
         * @param {number} i      - Input index for the Func's internal variables (0 or 1).
         */
        this.connect = function ( target, o, i ) {

            o = o ? 1 : 0; // Normalize output index to 0 or 1.
            i = i ? 1 : 0; // Normalize input index to 0 or 1.

            this.c.push( [ target, o, i ] ); // Add the connection details to the list.

        };


        /**
         * Sets one of the input variables of the function and triggers an update
         * to all connected targets with the new calculated output.
         *
         * @param {number} x - The new value for the variable.
         * @param {number} n - The index of the variable to set (0 for vars[0], 1 for vars[1]).
         */
        this.set = function ( x, n ) {

            this.vars[ n ] = x; // Update the specified variable with the new value.

            var y = this.func( this.vars[ 0 ], this.vars[ 1 ] ); // Recalculate the function's output.

            // Iterate over all established connections to propagate the new output value.
            for ( var i = 0; i < this.c.length; ++i ) {

                var c = this.c[ i ]; // Get the current connection tuple [target, o, i].

                // If the target has a 'set' method (another custom node), use it.
                if ( c[ 0 ].set ) {

                    c[ 0 ].set( y, c[ 2 ] );

                }
                // If the target is an AudioParam-like object with a 'value' property.
                else if ( typeof ( c[ 0 ].value ) == "number" ) {

                    c[ 0 ].value = y;

                }
                // Otherwise, assume the target is a direct reference and assign the value.
                else {

                    c[ 0 ] = y;

                }

            } // End of connection propagation loop.

        }; // End of Func.set method.

    } // End of Func constructor.


    /*
     * Key: A custom node constructor representing a keyboard or MIDI key input.
     * It listens for 'change' events on a specified DOM element and propagates note data.
     */
    function Key( id ) {

        this.c = [ ]; // Array to store outgoing connections.

        this.type = "key"; // String identifier for this custom node type.

        this.elem = document.getElementById( id ); // Reference to the DOM element associated with this key.

        // Attach an event listener to the element to react to 'change' events.
        this.elem.addEventListener( "change", function ( e ) {

            // Iterate through all connections in reverse order.
            for ( var i = this.c.length - 1; i >= 0; --i ) {

                var c = this.c[ i ]; // Current connection tuple.

                // Extract the relevant note data (e.g., note number or velocity) based on connection output index.
                var x = e.note[ 1 - c[ 1 ] ];

                // Propagate the extracted value to the connected target.
                if ( c[ 0 ].set ) {

                    c[ 0 ].set( x, c[ 2 ] );

                }
                else if ( typeof ( c[ 0 ].value ) == "number" ) {

                    c[ 0 ].value = x;

                }
                else {

                    c[ 0 ] = x;

                }

            } // End of connection propagation loop.

        }.bind( this ) ); // Bind 'this' to the Key instance to maintain context within the event listener.

        /**
         * Establishes a connection from this Key node to a target.
         *
         * @param {object} target - The object or AudioParam to connect to.
         * @param {number} o      - Output index (0 for note, 1 for velocity/other data from event).
         * @param {number} i      - Input index for the target.
         */
        this.connect = function ( target, o, i ) {

            o = o ? 1 : 0; // Normalize output index.
            i = i ? 1 : 0; // Normalize input index.

            this.c.push( [ target, o, i ] ); // Add the connection details.

        };

        // The 'start' method for Key nodes. Currently, it performs no action.
        this.start = function ( ) {
            // No specific start action required for a Key input node.
        };

    } // End of Key constructor.


    /*
     * Knob: A custom node constructor for UI knob or slider elements.
     * It listens for 'change' events on a specified DOM element and propagates its value.
     */
    function Knob( id ) {

        this.c = [ ]; // Array to store outgoing connections.

        this.type = "kno"; // String identifier for this custom node type.

        this.elem = document.getElementById( id ); // Reference to the DOM element for the knob.

        // Attach an event listener to the element to react to 'change' events (e.g., user interaction).
        this.elem.addEventListener( "change", function ( e ) {

            // Iterate through all connections in reverse order.
            for ( var i = this.c.length - 1; i >= 0; --i ) {

                var c = this.c[ i ]; // Current connection tuple.

                // Propagate the value from the knob (e.target.value) to the connected target.
                if ( c[ 0 ].set ) {

                    c[ 0 ].set( e.target.value, c[ 2 ] );

                }
                else if ( typeof ( c[ 0 ].value ) == "number" ) {

                    c[ 0 ].value = e.target.value;

                }
                else {

                    c[ 0 ] = e.target.value;

                }

            } // End of connection propagation loop.

        }.bind( this ) ); // Bind 'this' to the Knob instance for correct context.

        /**
         * Establishes a connection from this Knob node to a target.
         *
         * @param {object} target - The object or AudioParam to connect to.
         * @param {number} o      - Output index (not used for Knob, but for consistency).
         * @param {number} i      - Input index for the target.
         */
        this.connect = function ( target, o, i ) {

            o = o ? 1 : 0; // Normalize output index.
            i = i ? 1 : 0; // Normalize input index.

            this.c.push( [ target, o, i ] ); // Add the connection details.

        };

    } // End of Knob constructor.


    /**
     * A utility method to configure properties of an audio node (either Web Audio API or custom).
     *
     * @param {AudioNode|object} node  - The node whose parameters need to be set.
     * @param {object}           param - An object containing key-value pairs of parameters to apply.
     */
    this.Setup = function ( node, param ) {

        // Only proceed if there are parameters to set.
        if ( param ) {

            // Iterate over each parameter in the 'param' object.
            for ( i in param ) { // Note: 'i' is implicitly global if not declared with 'var', 'let', or 'const'.

                var p = param[ i ]; // The value of the current parameter.

                // Special handling for the 'func' property, which expects a string to be evaluated into a function.
                if ( i == "func" ) {

                    // Use eval to create a new function from the provided string.
                    node[ i ] = eval( "(function (x,y){return " + p + "})" );

                }
                // If the node's property has a 'value' that is a number (e.g., AudioParam.value).
                else if ( typeof ( node[ i ].value ) == "number" ) {

                    node[ i ].value = p; // Set the value property.

                }
                // For all other properties, assign directly.
                else {

                    node[ i ] = p; // Direct assignment of the property.

                }

            } // End of parameter iteration loop.

        } // End of param existence check.

    }; // End of Setup method.


    /**
     * The main entry point to start the audio graph processing.
     * This method initializes all nodes, sets up connections, and starts playable sources.
     * It is bound to the WADEngine instance.
     */
    this.start = function ( ) {

        /*
         * First pass through the graph: Determine if any 'key' nodes are present.
         * This flag might be used for global key event listeners or specific setup.
         */
        for ( var i = 0; i < graph.length; ++i ) {

            switch ( graph[ i ].n.substr( 0, 3 ) ) {

                case "key":
                    this.usekey = true; // Set the flag if a key node is found.
                    break;

            }

        }

        // A placeholder block for any specific initialization steps if key input is detected.
        if ( this.usekey ) {
            // Further initialization for keyboard/MIDI input could go here.
            // For example, attaching global event listeners if not handled by individual Key nodes.
        }


        /*
         * Second pass through the graph: Create all the audio nodes.
         * This involves instantiating Web Audio API nodes or custom nodes (Func, Key, Knob).
         */
        for ( var i = 0; i < graph.length; ++i ) {

            var node = graph[ i ]; // Get the current node definition from the graph array.

            // Use the first three characters of the node name to determine its type.
            switch ( node.n.substr( 0, 3 ) ) {

                case "osc": // OscillatorNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createOscillator( ), node.p );
                    break;

                case "buf": // AudioBufferSourceNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createBufferSource( ), node.p );
                    break;

                case "str": // MediaStreamAudioSourceNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createMediaStreamSource( ), node.p );
                    break;

                case "ele": // MediaElementAudioSourceNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createMediaElementSource( ), node.p );
                    break;

                case "gai": // GainNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createGain( ), node.p );
                    break;

                case "fil": // BiquadFilterNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createBiquadFilter( ), node.p );
                    break;

                case "del": // DelayNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createDelay( ), node.p );
                    break;

                case "pan": // PannerNode (stereo panner)
                    this.Setup( this.nodes[ node.n ] = this.actx.createPanner( ), node.p );
                    break;

                case "com": // DynamicsCompressorNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createDynamicsCompressor( ), node.p );
                    break;

                case "sha": // WaveShaperNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createWaveShaper( ), node.p );
                    break;

                case "con": // ConvolverNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createConvolver( ), node.p );
                    break;

                case "scr": // ScriptProcessorNode (deprecated but still supported)
                    this.Setup( this.nodes[ node.n ] = this.actx.createScriptProcessor( 2048, 2, 2 ), node.p );
                    break;

                case "ana": // AnalyserNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createAnalyser( ), node.p );
                    break;

                case "spl": // ChannelSplitterNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createChannelSplitter( ), node.p );
                    break;

                case "mer": // ChannelMergerNode
                    this.Setup( this.nodes[ node.n ] = this.actx.createChannelMerger( ), node.p );
                    break;

                case "fun": // Custom Func node
                    this.Setup( this.nodes[ node.n ] = new Func( ), node.p );
                    break;

                case "key": // Custom Key node
                    this.nodes[ node.n ] = new Key( node.n ); // Key nodes are initialized directly.
                    break;

                case "kno": // Custom Knob node
                    this.nodes[ node.n ] = new Knob( node.n ); // Knob nodes are initialized directly.
                    break;

            } // End of switch statement for node type creation.

        } // End of node creation loop.


        /*
         * Third pass through the graph: Establish all connections between the created nodes.
         * This uses the 'connect' method of the source nodes.
         */
        for ( var i = 0; i < graph.length; ++i ) {

            var node = graph[ i ]; // Get the current node definition from the graph.

            // Check if this node has any connections defined in its 'c' property.
            if ( node.c ) {

                // Iterate through the connections array in reverse order.
                for ( var j = node.c.length - 1; j >= 0; --j ) {

                    var conn = node.c[ j ]; // Get the current connection definition.

                    var co = ci = 0; // Initialize output and input channel indices.

                    // If 'conn' is an object (meaning it specifies target, input, and output channels).
                    if ( conn.t ) {

                        ci = conn.i; // Get the input channel index.
                        co = conn.o; // Get the output channel index.

                        ci = ci ? 1 : 0; // Normalize input channel to 0 or 1.
                        co = co ? 1 : 0; // Normalize output channel to 0 or 1.

                        conn = conn.t; // Update 'conn' to be just the target node name.

                    }

                    // Perform the actual connection using the source node's connect method.
                    if ( ci ) {
                        // Connect specifying both output and input channels.
                        this.nodes[ node.n ].connect( Find( this, conn ), co, ci );
                    }
                    else {
                        // Connect specifying only the output channel (target's default input).
                        this.nodes[ node.n ].connect( Find( this, conn ), co );
                    }

                } // End of inner loop for node connections.

            } // End of check for node connections.

        } // End of connection setup loop.


        /*
         * Fourth pass: Call the 'start' method on any nodes that implement it.
         * This is crucial for nodes like OscillatorNode, AudioBufferSourceNode, and custom Key nodes.
         */
        for ( var i in this.nodes ) {

            // Check if the current node has a 'start' method.
            if ( this.nodes[ i ].start ) {

                this.nodes[ i ].start( 0 ); // Call start, typically with a startTime argument (0 for immediate).

            }

        } // End of node start loop.

    }.bind( this ); // Bind 'this' to the WADEngine instance for the start method's context.

} // End of WADEngine constructor function definition.
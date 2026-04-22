/*
 * This file contains the core logic for parsing Shapefile data.
 * It supports both main thread execution and Web Worker execution
 * to avoid blocking the main thread for large file processing.
 */
( function ( window , undefined ) {


    // Check if we are in the main browser thread and if Web Workers are supported.
    // This determines whether to offload parsing to a worker or handle it directly.
    if ( window . document && window . Worker ) {

        // A single worker instance to manage Shapefile loading.
        var worker = null ;

        /**
         * Represents a Shapefile loader in the main thread.
         * It spawns or reuses a Web Worker to do the heavy lifting.
         * @param {string|object} o - The path to the SHP file or an options object.
         * @param {function} callback - Callback function to execute when data is loaded.
         */
        var Shapefile = function ( o , callback ) {
            // Store 'this' context for use inside the worker's message handler.
            var t = this ;
            // Normalize the input 'o': if it's a string, treat it as the SHP path.
            var o = typeof o === "string" ? { shp : o } : o ;

            // If no worker is currently active, create a new one.
            if ( ! worker ) {
                // Determine the path to the worker script.
                var path = ( o . jsRoot || "" ) + "shapefile.js" ;
                // Instantiate a new Web Worker and store it.
                var w = worker = this . worker = new Worker ( path ) ;
            } else {
                // Otherwise, reuse the existing worker.
                var w = worker ;
            }


            // Set up the message handler for the worker.
            // When the worker sends data back, process it here.
            w . onmessage = function ( e ) {
                t . data = e . data ; // Store the received data.
                if ( callback ) {
                    callback ( e . data ) ; // Execute the user-provided callback.
                }
            } ;

            // Instruct the worker to load the Shapefile.
            w . postMessage ( [ "Load" , o ] ) ;

            // If a DBF file is specified, create a DBF object and send its data to the worker.
            if ( o . dbf ) {
                this . dbf = new DBF ( o . dbf , function ( data ) {
                    w . postMessage ( [ "Add DBF Attributes" , data ] ) ;
                } ) ;
            }
        } ;

        // Expose the Shapefile constructor globally.
        window [ "Shapefile" ] = Shapefile ;
        return ; // Exit, as the main thread setup is complete.
    }


    /*
     * This section is executed if the code is running inside a Web Worker,
     * or if Web Workers are not supported in the main thread (fallback, less common for modern browsers).
     * The `!window.document` check is the primary indicator for a Web Worker environment.
     */
    var IN_WORKER = ! window . document ;
    if ( IN_WORKER ) {
        // In a worker, import necessary scripts.
        importScripts ( 'stream.js' ) ;

        // Define the worker's `onmessage` handler to receive commands from the main thread.
        onmessage = function ( e ) {
            // The first element of the data array is the command.
            switch ( e . data [ 0 ] ) {
                case "Load" :
                    // Command to load a Shapefile. Instantiate Shapefile in the worker.
                    window . shapefile = new Shapefile ( e . data [ 1 ] ) ;
                    break ;
                case "Add DBF Attributes" :
                    // Command to add DBF attributes to the loaded GeoJSON.
                    window . shapefile . addDBFDataToGeoJSON ( e . data [ 1 ] ) ;
                    window . shapefile . _postMessage ( ) ; // Post the result back to the main thread.
                    break ;
                default :
                    // Handle unknown commands (or do nothing).
            }
        } ;
    }


    /*
     * Constant mapping Shapefile type codes to human-readable names.
     * These are standard ESRI Shapefile type definitions.
     */
    var SHAPE_TYPES = {
        "0" : "Null Shape" ,
        "1" : "Point" ,        // Standard 2D shapes
        "3" : "PolyLine" ,
        "5" : "Polygon" ,
        "8" : "MultiPoint" ,
        "11" : "PointZ" ,      // 3D shapes (with Z-coordinate)
        "13" : "PolyLineZ" ,
        "15" : "PolygonZ" ,
        "18" : "MultiPointZ" ,
        "21" : "PointM" ,      // User-defined measurement shapes (with M-coordinate)
        "23" : "PolyLineM" ,
        "25" : "PolygonM" ,
        "28" : "MultiPointM" ,
        "31" : "MultiPatch"    // Complex 3D shapes
    } ;


    /**
     * Main Shapefile constructor (used in worker or main thread if no worker).
     * Handles the initial loading decision based on input.
     * @param {string|object} o - Options object or path to SHP file.
     * @param {function} callback - Callback for when parsing is complete.
     */
    var Shapefile = function ( o , callback ) {
        var o = typeof o === "string" ? { shp : o } : o ;
        this . callback = callback ; // Store the callback.

        // Determine if the input is a File object (from a file input) or a URI.
        if ( !! o . shp . lastModifiedDate ) {
            this . handleFile ( o ) ; // Process as a File object.
        }
        else {
            this . handleUri ( o ) ; // Process as a URI (e.g., URL).
        }
    } ;


    /**
     * Prototype methods for the Shapefile object.
     * These methods contain the core parsing logic.
     */
    Shapefile . prototype = {
        constructor : Shapefile , // Explicitly set constructor reference.

        /**
         * Handles loading a Shapefile from a URI (URL).
         * Uses XMLHttpRequest for fetching binary data.
         * @param {object} o - Options object containing the 'shp' URI.
         */
        handleUri : function ( o ) {
            var xhr = new XMLHttpRequest ( ) , // Create a new XHR object.
                that = this ;                  // Store 'this' context.

            // Open a synchronous GET request for the SHP file.
            xhr . open ( "GET" , o . shp , false ) ;
            // Override MIME type to ensure raw binary data is received.
            xhr . overrideMimeType ( "text/plain; charset=x-user-defined" ) ;
            xhr . send ( ) ; // Send the request.

            // Check for successful response.
            if ( 200 != xhr . status ) {
                throw "Unable to load " + o . shp + " status: " + xhr . status ;
            }

            this . url = o . shp ; // Store the URL.
            // Create a Gordon.Stream from the binary response text.
            this . stream = new Gordon . Stream ( xhr . responseText ) ;

            this . readFileHeader ( ) ;       // Parse the main file header.
            this . readRecords ( ) ;          // Parse all shape records.
            this . formatIntoGeoJson ( ) ;    // Convert parsed data to GeoJSON.

            // If a DBF file is specified, load it.
            if ( o . dbf ) {
                this . dbf = IN_WORKER ?        // If in worker, DBF loading is handled by main thread.
                    null :
                    new DBF ( o . dbf , function ( data ) { // Otherwise, load DBF and merge.
                        that . addDBFDataToGeoJSON ( data ) ;
                        that . _postMessage ( ) ; // Post message after DBF data is added.
                    } ) ;
            }
            else {
                this . _postMessage ( ) ; // If no DBF, post message immediately.
            }

        } ,

        /**
         * Handles loading a Shapefile from a File object (e.g., from a <input type="file">).
         * Uses FileReader or FileReaderSync.
         * @param {object} o - Options object containing the 'shp' File object.
         */
        handleFile : function ( o ) {
            this . options = o ; // Store options.
            var reader ;

            // Use FileReader for asynchronous file reading in main thread.
            if ( !! window . FileReader ) {
                reader = new FileReader ( ) ;
            } else {
                // Fallback to FileReaderSync for synchronous reading (only in workers).
                reader = new FileReaderSync ( ) ;
            }

            // Define the onload callback for the FileReader.
            reader . onload = ( function ( that ) {
                return function ( e ) {
                    that . onFileLoad ( e . target . result ) ;
                } ;
            } ) ( this ) ;

            // Start reading the file as a binary string.
            if ( !! window . FileReader ) {
                reader . readAsBinaryString ( o . shp ) ;
            } else {
                // For FileReaderSync, call onFileLoad directly.
                this . onFileLoad ( reader . readAsBinaryString ( o . shp ) ) ;
            }
        } ,

        /**
         * Callback executed once the file data (from URI or File) is loaded.
         * @param {string} data - The binary string content of the SHP file.
         */
        onFileLoad : function ( data ) {
            this . stream = new Gordon . Stream ( data ) ; // Create stream from data.

            this . readFileHeader ( ) ;       // Parse the main file header.
            this . readRecords ( ) ;          // Parse all shape records.
            this . formatIntoGeoJson ( ) ;    // Convert parsed data to GeoJSON.

            // If a DBF file is specified in options, handle it.
            if ( this . options . dbf ) {
                this . dbf = IN_WORKER ?
                    null :
                    new DBF ( this . options . dbf , function ( data ) {
                        that . addDBFDataToGeoJSON ( data ) ;
                        that . _postMessage ( ) ;
                    } ) ;
            }
            else {
                this . _postMessage ( ) ; // If no DBF, post message immediately.
            }
        } ,

        /**
         * Internal method to send the parsed data back to the main thread (if in worker)
         * or execute the callback (if in main thread).
         */
        _postMessage : function ( ) {
            var data = {
                header : this . header ,    // Shapefile header information.
                records : this . records ,  // Raw parsed records.
                dbf : this . dbf ,          // DBF data (if loaded).
                geojson : this . geojson    // GeoJSON representation.
            } ;
            // If in a Web Worker, use `postMessage`.
            if ( IN_WORKER ) {
                postMessage ( data ) ;
            }
            // Otherwise, if a callback was provided, execute it.
            else if ( this . callback ) {
                this . callback ( data ) ;
            }
        } ,

        /**
         * Reads and parses the main Shapefile header (100 bytes).
         * Populates `this.header` with metadata.
         */
        readFileHeader : function ( ) {
            var s = this . stream ,      // Shorthand for the stream.
                header = this . header = { } ; // Initialize header object.

            // The main file header is fixed at 100 bytes.
            if ( s . length < 100 ) {
                throw "Invalid Header Length" ;
            }

            // File code (always hex value 0x0000270a, big-endian).
            header . fileCode = s . readSI32 ( true ) ;

            // Validate the file code.
            if ( header . fileCode != parseInt ( 0x0000270a ) ) {
                throw "Invalid File Code" ;
            }

            // Unused bytes (5 x 4-byte integers).
            s . offset += 4 * 5 ;

            // File length (in 16-bit words, including the header), then converted to bytes.
            header . fileLength = s . readSI32 ( true ) * 2 ;

            // Version of the Shapefile format (little-endian).
            header . version = s . readSI32 ( ) ;

            // Shape Type of the main file (e.g., Point, PolyLine, Polygon).
            header . shapeType = SHAPE_TYPES [ s . readSI32 ( ) ] ;

            // Minimum bounding rectangle (MBR) of all shapes.
            // Four doubles: min X, min Y, max X, max Y.
            this . _readBounds ( header ) ;

            // Z axis range (min and max Z values).
            header . rangeZ = {
                min : s . readDouble ( ) ,
                max : s . readDouble ( )
            } ;

            // User defined measurement range (min and max M values).
            header . rangeM = {
                min : s . readDouble ( ) ,
                max : s . readDouble ( )
            } ;
        } ,

        /**
         * Reads all records (shapes) from the Shapefile stream.
         * Populates `this.records` with parsed shape data.
         */
        readRecords : function ( ) {
            var s = this . stream ,        // Shorthand for the stream.
                records = this . records = [ ] , // Initialize records array.
                record ;                       // Variable to hold current record.

            // Loop through records until a null record ID is encountered.
            do {
                record = { } ; // Create a new object for each record.

                // Record number (1-based, big-endian).
                record . id = s . readSI32 ( true ) ;

                if ( record . id === 0 ) {
                    break ; // Exit loop if record ID is 0 (end of file).
                }

                // Record length (in 16-bit words, big-endian), converted to bytes.
                record . length = s . readSI32 ( true ) * 2 ;

                // Shape Type of the current record.
                record . shapeType = SHAPE_TYPES [ s . readSI32 ( ) ] ;

                // Call the appropriate handler based on the shape type to read shape-specific data.
                this [ "_read" + record . shapeType ] ( record ) ;

                records . push ( record ) ; // Add the parsed record to the array.

            } while ( true ) ; // Loop indefinitely until 'break' is called.
        } ,

        /**
         * Reads bounding box information (minX, minY, maxX, maxY) from the stream.
         * @param {object} object - The object to attach the bounds to.
         * @returns {object} The object with added bounds.
         */
        _readBounds : function ( object ) {
            var s = this . stream ; // Shorthand for the stream.

            object . bounds = {
                left : s . readDouble ( ) ,   // Min X
                bottom : s . readDouble ( ) , // Min Y
                right : s . readDouble ( ) ,  // Max X
                top : s . readDouble ( )      // Max Y
            } ;

            return object ;
        } ,

        /**
         * Reads part information for multi-part shapes (PolyLine, Polygon).
         * @param {object} record - The record object to attach part info to.
         * @returns {object} The record with added part information.
         */
        _readParts : function ( record ) {
            var s = this . stream ,
                nparts ,
                parts = [ ] ;

            nparts = record . numParts = s . readSI32 ( ) ; // Number of parts.

            // Number of points always precedes number of parts, capture it now.
            record . numPoints = s . readSI32 ( ) ;

            // Read the start index for each part.
            while ( nparts -- ) {
                parts . push ( s . readSI32 ( ) ) ;
            }

            record . parts = parts ; // Store the parts array.

            return record ;
        } ,

        /**
         * Reads a single point's coordinates (X, Y).
         * @param {object} record - The record object to attach point info to.
         * @returns {object} The record with added point information.
         */
        _readPoint : function ( record ) {
            var s = this . stream ;

            record . x = s . readDouble ( ) ; // X coordinate.
            record . y = s . readDouble ( ) ; // Y coordinate.

            return record ;
        } ,

        /**
         * Reads multiple points' coordinates for shapes like MultiPoint, PolyLine, Polygon.
         * @param {object} record - The record object to attach points to.
         * @returns {object} The record with added points array.
         */
        _readPoints : function ( record ) {
            var s = this . stream ,
                points = [ ] ,
                npoints = record . numPoints || ( record . numPoints = s . readSI32 ( ) ) ; // Number of points.

            // Read each point.
            while ( npoints -- ) {
                points . push ( {
                    x : s . readDouble ( ) ,
                    y : s . readDouble ( )
                } ) ;
            }

            record . points = points ; // Store the array of points.

            return record ;
        } ,

        /**
         * Reads data specific to MultiPoint shapes.
         * @param {object} record - The record object.
         * @returns {object} The record with MultiPoint data.
         */
        _readMultiPoint : function ( record ) {
            var s = this . stream ;

            this . _readBounds ( record ) ; // MultiPoint has a bounding box.
            this . _readPoints ( record ) ; // And a list of points.

            return record ;
        } ,

        /**
         * Reads data specific to Polygon shapes.
         * @param {object} record - The record object.
         * @returns {object} The record with Polygon data.
         */
        _readPolygon : function ( record ) {
            var s = this . stream ;

            this . _readBounds ( record ) ; // Polygon has a bounding box.
            this . _readParts ( record ) ;  // Polygon can have multiple parts (rings).
            this . _readPoints ( record ) ; // And a list of points.

            return record ;
        } ,

        /**
         * Reads data specific to PolyLine shapes.
         * PolyLine structure is identical to Polygon for parsing purposes.
         * @param {object} record - The record object.
         * @returns {object} The record with PolyLine data.
         */
        _readPolyLine : function ( record ) {
            return this . _readPolygon ( record ) ; // Reuse Polygon reader.
        } ,

        /**
         * Converts the parsed Shapefile data into a GeoJSON FeatureCollection.
         * Populates `this.geojson`.
         */
        formatIntoGeoJson : function ( ) {
            var bounds = this . header . bounds , // Global bounds.
                records = this . records ,       // All parsed records.
                features = [ ] ,                 // Array to hold GeoJSON features.
                feature , geometry , points , fbounds , gcoords , parts , point ,
                geojson = { } ;                  // The final GeoJSON object.

            geojson . type = "FeatureCollection" ; // GeoJSON type.
            geojson . bbox = [                     // Global bounding box.
                bounds . left ,
                bounds . bottom ,
                bounds . right ,
                bounds . top
            ] ;
            geojson . features = features ;        // Reference to the features array.


            // Iterate through each parsed record.
            for ( var r = 0 , record ; record = records [ r ] ; r ++ ) {
                feature = { } ; // New GeoJSON feature.
                fbounds = record . bounds ; // Record-specific bounds.
                points = record . points ;    // Points for the record.
                parts = record . parts ;      // Parts for the record.

                feature . type = "Feature" ; // Feature type.

                // Add bounding box to feature if it's not a Point (Points don't have bbox in GeoJSON).
                if ( record . shapeType !== 'Point' ) {
                    feature . bbox = [
                        fbounds . left ,
                        fbounds . bottom ,
                        fbounds . right ,
                        fbounds . top
                    ] ;
                }
                geometry = feature . geometry = { } ; // Initialize geometry object.

                // Convert Shapefile geometry to GeoJSON geometry based on shape type.
                switch ( record . shapeType ) {
                    case "Point" :
                        geometry . type = "Point" ;
                        geometry . coordinates = [
                            record . x ,
                            record . y
                        ] ;
                        break ;
                    case "MultiPoint" :
                    case "PolyLine" :
                        geometry . type = ( record . shapeType === "PolyLine" ? "LineString" : "MultiPoint" ) ;
                        gcoords = geometry . coordinates = [ ] ;

                        for ( var p = 0 ; p < points . length ; p ++ ) {
                            var point = points [ p ] ;
                            gcoords . push ( [ point . x , point . y ] ) ;
                        }
                        break ;
                    case "Polygon" :
                        geometry . type = "Polygon" ;
                        gcoords = geometry . coordinates = [ ] ; // Array of rings.

                        for ( var pt = 0 ; pt < parts . length ; pt ++ ) {
                            var partIndex = parts [ pt ] , // Starting index of the current part.
                                part = [ ] ,               // Array for current ring coordinates.
                                point ;

                            // Iterate points for the current part.
                            // The loop goes from `partIndex` up to the start of the next part,
                            // or to the end of all points if it's the last part.
                            for ( var p = partIndex ; p < ( parts [ pt + 1 ] || points . length ) ; p ++ ) {
                                point = points [ p ] ;
                                part . push ( [ point . x , point . y ] ) ;
                            }
                            gcoords . push ( part ) ; // Add the completed ring to coordinates.
                        }
                        break ;
                    default :
                        // Unhandled shape type.
                }
                features . push ( feature ) ; // Add the processed feature to the collection.
            }
            this . geojson = geojson ; // Store the generated GeoJSON.

            // If DBF data was received before GeoJSON was ready, process it now.
            if ( this . _addDataAfterLoad ) {
                this . addDBFDataToGeoJSON ( this . _addDataAfterLoad ) ;
            }
        } ,

        /**
         * Adds DBF attribute data (properties) to the GeoJSON features.
         * @param {object} dbfData - The parsed DBF data.
         */
        addDBFDataToGeoJSON : function ( dbfData ) {
            // If GeoJSON is not yet generated, store DBF data to be processed later.
            if ( ! this . geojson ) {
                return ( this . _addDataAfterLoad = dbfData ) ;
            }

            this . dbf = dbfData ; // Store the DBF data.

            var features = this . geojson . features , // GeoJSON features array.
                len = features . length ,              // Number of features.
                records = dbfData . records ;          // DBF records array.

            // Assign DBF records as properties to GeoJSON features.
            // Iterate backwards for potentially slight performance gain or just habit.
            while ( len -- ) {
                features [ len ] . properties = records [ len ] ;
            }
        }
    } ;

    // Expose the Shapefile constructor globally, regardless of worker context.
    window [ "Shapefile" ] = Shapefile ;

} ) ( self ) ; // Pass `self` as `window` when in a Web Worker, otherwise `window` itself.
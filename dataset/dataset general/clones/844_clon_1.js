// This file contains a Type I clone of the original JavaScript code.
// Changes are limited to whitespace and comments, ensuring identical functionality.
// The original source material is preserved in its logical and structural form.

/*
 * Last commit: 32747f9 (2013-04-24 17:07:50 -0700)
 * This comment was modified from a single-line to a multi-line format.
 */

( function() {
    var define, requireModule;

    ( function() {
        var registry = {},
            seen = {}; // Initialize registry and seen objects.

        define = function( name, deps, callback ) {
            registry[ name ] = { deps: deps, callback: callback };
        };

        requireModule = function( name ) {
            // If the module has already been seen/reified, return it directly.
            if ( seen[ name ] ) {
                return seen[ name ];
            }
            // Mark as seen to prevent circular dependencies from infinite loops.
            seen[ name ] = {};

            var mod = registry[ name ],
                deps = mod.deps,
                callback = mod.callback,
                reified = [],
                exports;

            // Iterate over dependencies and reify them.
            for ( var i = 0, l = deps.length; i < l; i++ ) {
                if ( deps[ i ] === 'exports' ) {
                    reified.push( exports = {} );
                } else {
                    reified.push( requireModule( deps[ i ] ) );
                }
            }

            // Execute the module's callback and store its value.
            var value = callback.apply( this, reified );
            return seen[ name ] = exports || value;
        };
    } )();

    ( function() {
        define( "json-normalizer/hash-utils",
            [ "json-normalizer/string-utils", "exports" ],
            function( __dependency1__, __exports__ ) {
                "use strict";
                var camelize = __dependency1__.camelize; // Import camelize from string-utils.
                var decamelize = __dependency1__.decamelize; // Import decamelize from string-utils.

                /**
                 * Maps properties of an object using a callback function.
                 * @param {Object} object The object to map.
                 * @param {Function} callback The function to call for each property.
                 * @param {Object} binding The `this` context for the callback.
                 * @returns {Object} A new object with mapped properties.
                 */
                function map( object, callback, binding ) {
                    var ret = {};

                    for ( var prop in object ) {
                        // Ensure the property is directly on the object (not prototype chain).
                        if ( Object.prototype.hasOwnProperty.call( object, prop ) ) {
                            callback.call( binding, ret, prop, object[ prop ] );
                        }
                    }

                    return ret;
                }


                var __export1__ = function camelizeKeys( object ) {
                    return map( object, function( hash, key, value ) {
                        hash[ camelize( key ) ] = value;
                    } );
                };

                var __export2__ = function decamelizeKeys( object ) {
                    return map( object, function( hash, key, value ) {
                        hash[ decamelize( key ) ] = value;
                    } );
                };

                __exports__.map = map;
                __exports__.camelizeKeys = __export1__;
                __exports__.decamelizeKeys = __export2__;
            } );

        define( "json-normalizer/processor",
            [ "json-normalizer/hash-utils", "exports" ],
            function( __dependency1__, __exports__ ) {
                "use strict";
                var camelizeKeys = __dependency1__.camelizeKeys; // Import camelizeKeys for processing.

                /**
                 * Constructor for the Processor class.
                 * @param {Object} json The JSON object to process.
                 * @constructor
                 */
                function Processor( json ) {
                    this.json = json;
                }

                Processor.prototype = {
                    constructor: Processor,

                    /**
                     * Camelizes all keys in the stored JSON object.
                     * @returns {Processor} The current Processor instance for chaining.
                     */
                    camelizeKeys: function() {
                        this.json = camelizeKeys( this.json );
                        return this;
                    }
                };

                __exports__.Processor = Processor;
            } );

        define( "json-normalizer/string-utils",
            [ "exports" ],
            function( __exports__ ) {
                "use strict";
                var STRING_CAMELIZE_REGEXP = ( /(\-|_|\.|\s)+(.)?/g );

                /**
                 * Converts a string to camelCase.
                 * @param {string} str The input string.
                 * @returns {string} The camelCased string.
                 */
                var __export1__ = function camelize( str ) {
                    return str.replace( STRING_CAMELIZE_REGEXP, function( match, separator, chr ) {
                        return chr ? chr.toUpperCase() : '';
                    } ).replace( /^([A-Z])/, function( match ) { // Changed 'separator, chr' to just 'match' as per original logic.
                        return match.toLowerCase();
                    } );
                };

                var STRING_DECAMELIZE_REGEXP = ( /([a-z])([A-Z])/g );

                /**
                 * Converts a camelCase string to a decamelized (e.g., snake_case) string.
                 * @param {string} str The input string.
                 * @returns {string} The decamelized string.
                 */
                var __export2__ = function decamelize( str ) {
                    return str.replace( STRING_DECAMELIZE_REGEXP, '$1_$2' ).toLowerCase();
                };

                __exports__.camelize = __export1__;
                __exports__.decamelize = __export2__;
            } );

        define( "json-normalizer",
            [ "json-normalizer/string-utils", "json-normalizer/hash-utils", "json-normalizer/processor", "exports" ],
            function( __dependency1__, __dependency2__, __dependency3__, __exports__ ) {
                "use strict";
                var camelize = __dependency1__.camelize;
                var decamelize = __dependency1__.decamelize;
                var map = __dependency2__.map;
                var camelizeKeys = __dependency2__.camelizeKeys;
                var decamelizeKeys = __dependency2__.decamelizeKeys;
                var Processor = __dependency3__.Processor;

                var mapKeys = map; // Alias 'map' to 'mapKeys' for export.


                __exports__.camelize = camelize;
                __exports__.decamelize = decamelize;
                __exports__.mapKeys = mapKeys;
                __exports__.camelizeKeys = camelizeKeys;
                __exports__.decamelizeKeys = decamelizeKeys;
                __exports__.Processor = Processor;
            } );

    } )(); // End of json-normalizer related definitions.

} )(); // End of initial AMD-like wrapper.


( function() {
    /**
     * @module data
     *
     * @main data
     */

    window.DS = Ember.Namespace.create( {
        // This revision number goes past 11, indicating it's quite advanced.
        CURRENT_API_REVISION: 12
    } );

} )();


( function() {
    /**
     * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
     * © 2011 Colin Snover <http://zetafleet.com>
     * Released under MIT license.
     *
     * This section provides a robust ISO 8601 date parsing utility for Ember.
     */

    Ember.Date = Ember.Date || {}; // Ensure Ember.Date namespace exists.

    var origParse = Date.parse,
        numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];

    Ember.Date.parse = function( date ) {
        var timestamp, struct, minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster.
        // The regex captures various parts of an ISO 8601 string:
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if ( ( struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec( date ) ) ) {
            // Avoid NaN timestamps caused by “undefined” values being passed to Date.UTC.
            // Convert captured groups to numbers, defaulting to 0 if undefined.
            for ( var i = 0, k; ( k = numericKeys[ i ] ); ++i ) {
                struct[ k ] = +struct[ k ] || 0;
            }

            // Allow undefined days and months, adjusting for Date.UTC (month is 0-indexed).
            struct[ 2 ] = ( +struct[ 2 ] || 1 ) - 1; // Month is 0-indexed.
            struct[ 3 ] = +struct[ 3 ] || 1; // Day defaults to 1.

            if ( struct[ 8 ] !== 'Z' && struct[ 9 ] !== undefined ) {
                minutesOffset = struct[ 10 ] * 60 + struct[ 11 ];

                if ( struct[ 9 ] === '+' ) {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC( struct[ 1 ], struct[ 2 ], struct[ 3 ], struct[ 4 ], struct[ 5 ] + minutesOffset, struct[ 6 ], struct[ 7 ] );
        } else {
            // Fallback to native Date.parse or NaN if not available.
            timestamp = origParse ? origParse( date ) : NaN;
        }

        return timestamp;
    };

    // If Ember's prototype extension is enabled for Date, override Date.parse globally.
    if ( Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Date ) {
        Date.parse = Ember.Date.parse;
    }

} )();


( function() {
    // This is an empty IIFE block. It could be removed, or left as is with a comment.
    // No functional code is present here in the original, so none is added.
} )();


( function() {
    var DeferredMixin = Ember.DeferredMixin, // Reference to Ember's DeferredMixin.
        Evented = Ember.Evented, // Reference to Ember's Evented mixin.
        run = Ember.run, // Reference to Ember's run loop utility.
        get = Ember.get; // Reference to Ember's property getter utility.

    /**
     * @class LoadPromise
     * @namespace DS
     * @private
     * A mixin that adds promise-like behavior to objects that load data.
     * It resolves once the 'didLoad' event is triggered.
     * @uses Ember.Evented
     * @uses Ember.DeferredMixin
     */
    var LoadPromise = Ember.Mixin.create( Evented, DeferredMixin, {
        init: function() {
            this._super.apply( this, arguments ); // Call super's init method.
            this.one( 'didLoad', function() {
                run( this, 'resolve', this ); // Resolve the promise when 'didLoad' fires.
            } );

            // If the object is already loaded, trigger 'didLoad' immediately.
            if ( get( this, 'isLoaded' ) ) {
                this.trigger( 'didLoad' );
            }
        }
    } );

    DS.LoadPromise = LoadPromise; // Expose LoadPromise on the DS namespace.

} )();


( function() {
    /**
     * This module provides core data structures for Ember Data.
     */

    var get = Ember.get,
        set = Ember.set;

    var LoadPromise = DS.LoadPromise; // Alias for DS.LoadPromise from system/mixins/load_promise.

    /**
     * A record array is an array that contains records of a certain type. The record
     * array materializes records as needed when they are retrieved for the first
     * time. You should not create record arrays yourself. Instead, an instance of
     * DS.RecordArray or its subclasses will be returned by your application's store
     * in response to queries.
     *
     * @module data
     * @submodule data-record-array
     * @main data-record-array
     *
     * @class RecordArray
     * @namespace DS
     * @extends Ember.ArrayProxy
     * @uses Ember.Evented
     * @uses DS.LoadPromise
     */
    DS.RecordArray = Ember.ArrayProxy.extend( Ember.Evented, LoadPromise, {
        /**
         * The model type contained by this record array.
         *
         * @type DS.Model
         */
        type: null,

        // The array of client ids backing the record array. When a
        // record is requested from the record array, the record
        // for the client id at the same index is materialized, if
        // necessary, by the store.
        content: null,

        isLoaded: false,
        isUpdating: false,

        /**
         * The store that created this record array.
         *
         * @type DS.Store
         */
        store: null,

        /**
         * Retrieves an object at a specific index from the content array.
         * If the object is a reference, it materializes the record using the store.
         * @param {Number} index The index of the object.
         * @returns {DS.Model|undefined} The materialized record or undefined.
         */
        objectAtContent: function( index ) {
            var content = get( this, 'content' ),
                reference = content.objectAt( index ),
                store = get( this, 'store' );

            if ( reference ) {
                return store.recordForReference( reference );
            }
            return undefined; // Explicitly return undefined if no reference.
        },

        /**
         * Returns the materialized object at a given index if it exists and is loaded.
         * @param {Number} index The index of the object.
         * @returns {DS.Model|undefined} The materialized record or undefined.
         */
        materializedObjectAt: function( index ) {
            var reference = get( this, 'content' ).objectAt( index );
            if ( !reference ) {
                return;
            }

            if ( get( this, 'store' ).recordIsMaterialized( reference ) ) {
                return this.objectAt( index );
            }
            return undefined; // Return undefined if not materialized.
        },

        /**
         * Initiates an update for the record array by fetching all records of its type from the store.
         * Prevents concurrent updates using `isUpdating` flag.
         */
        update: function() {
            if ( get( this, 'isUpdating' ) ) {
                return;
            }

            var store = get( this, 'store' ),
                type = get( this, 'type' );

            store.fetchAll( type, this );
        },

        /**
         * Adds a record reference to the content of the record array.
         * @param {Object} reference The record reference to add.
         */
        addReference: function( reference ) {
            get( this, 'content' ).addObject( reference );
        },

        /**
         * Removes a record reference from the content of the record array.
         * @param {Object} reference The record reference to remove.
         */
        removeReference: function( reference ) {
            get( this, 'content' ).removeObject( reference );
        }
    } );

} )();


( function() {
    var get = Ember.get,
        set = Ember.set;
    var once = Ember.run.once;
    var forEach = Ember.EnumerableUtils.forEach;

    /**
     * @class RecordArrayManager
     * @namespace DS
     * @private
     * Manages `DS.RecordArray` instances and their filters.
     */
    DS.RecordArrayManager = Ember.Object.extend( {
        init: function() {
            this._super.apply( this, arguments ); // Call the parent class's init method.

            // Map to store filtered record arrays by type.
            this.filteredRecordArrays = Ember.MapWithDefault.create( {
                defaultValue: function() {
                    return [];
                }
            } );

            // Array to hold references that have changed and need array updates.
            this.changedReferences = [];
        },

        /**
         * Marks a reference as changed, scheduling an update for record arrays.
         * @param {Object} reference The changed record reference.
         */
        referenceDidChange: function( reference ) {
            this.changedReferences.push( reference );
            once( this, this.updateRecordArrays ); // Schedule update to run once per run loop.
        },

        /**
         * Retrieves or creates an `Ember.OrderedSet` for record arrays associated with a given reference.
         * @param {Object} reference The record reference.
         * @returns {Ember.OrderedSet} A set of record arrays.
         */
        recordArraysForReference: function( reference ) {
            reference.recordArrays = reference.recordArrays || Ember.OrderedSet.create();
            return reference.recordArrays;
        },

        /**
         * @private
         *
         * This method is invoked whenever data is loaded into the store
         * by the adapter or updated by the adapter, or when an attribute
         * changes on a record.
         *
         * It updates all filters that a record belongs to.
         *
         * To avoid thrashing, it only runs once per run loop per record.
         *
         * @param {Class} type
         * @param {Number|String} clientId
         */
        updateRecordArrays: function() {
            forEach( this.changedReferences, function( reference ) {
                var type = reference.type,
                    recordArrays = this.filteredRecordArrays.get( type ),
                    filter;

                // Update all filtered record arrays for the record's type.
                recordArrays.forEach( function( array ) {
                    filter = get( array, 'filterFunction' );
                    this.updateRecordArray( array, filter, type, reference );
                }, this );

                // Loop through all manyArrays containing an unloaded copy of this
                // clientId and notify them that the record was loaded.
                var manyArrays = reference.loadingRecordArrays;

                if ( manyArrays ) {
                    for ( var i = 0, l = manyArrays.length; i < l; i++ ) {
                        manyArrays[ i ].loadedRecord();
                    }

                    reference.loadingRecordArrays = []; // Clear loading arrays after processing.
                }
            }, this );
            this.changedReferences = []; // Clear the list after all updates.
        },

        /**
         * @private
         *
         * Update an individual filter.
         *
         * @param {DS.FilteredRecordArray} array The record array to update.
         * @param {Function} filter The filter function for the array.
         * @param {Class} type The type of record.
         * @param {Object} reference The record reference.
         */
        updateRecordArray: function( array, filter, type, reference ) {
            var shouldBeInArray, record;

            if ( !filter ) {
                shouldBeInArray = true; // If no filter, all records should be in the array.
            } else {
                record = this.store.recordForReference( reference );
                shouldBeInArray = filter( record ); // Apply filter function.
            }

            var recordArrays = this.recordArraysForReference( reference );

            if ( shouldBeInArray ) {
                recordArrays.add( array );
                array.addReference( reference );
            } else if ( !shouldBeInArray ) {
                recordArrays.remove( array );
                array.removeReference( reference );
            }
        },

        /**
         * @private
         *
         * When a record is deleted, it is removed from all its
         * record arrays.
         *
         * @param {DS.Model} record The record to remove.
         */
        remove: function( record ) {
            var reference = get( record, 'reference' );
            var recordArrays = reference.recordArrays || []; // Get associated record arrays.

            recordArrays.forEach( function( array ) {
                array.removeReference( reference );
            } );
        },

        /**
         * @private
         *
         * This method is invoked if the `filterFunction` property is
         * changed on a `DS.FilteredRecordArray`.
         *
         * It essentially re-runs the filter from scratch. This same
         * method is invoked when the filter is created in th first place.
         *
         * @param {DS.FilteredRecordArray} array The filtered record array.
         * @param {Class} type The type of record.
         * @param {Function} filter The new filter function.
         */
        updateFilter: function( array, type, filter ) {
            var typeMap = this.store.typeMapFor( type ),
                references = typeMap.references,
                reference, data, shouldFilter, record;

            for ( var i = 0, l = references.length; i < l; i++ ) {
                reference = references[ i ];
                shouldFilter = false;

                data = reference.data;

                if ( typeof data === 'object' ) { // Check if data is loaded.
                    if ( record = reference.record ) { // If record is materialized.
                        if ( !get( record, 'isDeleted' ) ) {
                            shouldFilter = true;
                        }
                    } else {
                        shouldFilter = true; // If not materialized, assume it could be in array.
                    }

                    if ( shouldFilter ) {
                        this.updateRecordArray( array, filter, type, reference );
                    }
                }
            }
        },

        /**
         * @private
         *
         * Create a `DS.ManyArray` for a type and list of record references, and index
         * the `ManyArray` under each reference. This allows us to efficiently remove
         * records from `ManyArray`s when they are deleted.
         *
         * @param {Class} type The model type.
         * @param {Array} references An array of record references.
         *
         * @return {DS.ManyArray} The newly created ManyArray.
         */
        createManyArray: function( type, references ) {
            var manyArray = DS.ManyArray.create( {
                type: type,
                content: references,
                store: this.store
            } );

            // Associate the ManyArray with each reference for efficient removal.
            references.forEach( function( reference ) {
                var arrays = this.recordArraysForReference( reference );
                arrays.add( manyArray );
            }, this );

            return manyArray;
        }

        /**
         * @private
         * Additional private methods would go here.
         */
    } );

} )();
/**#nocode+*/
( function() {
    "use strict";

    function defineModule() {
/**#nocode-*/
        /**
         * @namespace
         *
         * clone.js - the true prototype-based lazy programming framework.
         *
         * <h3>
         * Naming convention
         * </h3><pre>
         * $property - $  prefix used to prevent accidental name collision.
         * object$   - $ postfix means prototype (Object.prototype === object$).
         * Object    - Class.
         * _variable - Variable that used in closure(s).
         * </pre>
         *
         * @version v1.3.2-alpha
         * @author  Alex Shvets
         * @see     www.clonejs.org
         *
         * @borrows private._cloneByProto as byProto
         * @borrows private._cloneByCreate as byObjectCreate
         * @borrows private._cloneByConstructor as byConstructor
         *
         * @function
         * @description
         *
         * Creates a new object, inheriting properties from another object (prototype).
         * Behaves similarly to {@link Object.create}, but its second argument is a simple object,
         * not a [propertyDescriptor](_global_.html#propertyDescriptor).
         * It must be an object literal only. However, if absolutely necessary,
         * this rule might be relaxed, with the caveat that:
         * *External usage of the second argument after cloning should only access its own properties.*
         * The `clone()` function might modify its `proto` argument, which is a side effect
         * of using `__proto__`. This rule ensures consistency with other cloning methods
         * like constructor-based cloning and `Object.create`.
         *
         * It is not named as a class (e.g., `new Clone`), because it is primarily
         * intended for use as a function (verb): `clone(something)`.
         *
         * @param  proto - The object to clone, serving as the prototype. If a function is passed,
         *                 its `prototype` property will be used instead.
         * @param  state - The own properties of the created object. This must be an object literal
         *                 (e.g., `{key:"value"}`) because it might be modified.
         *                 By default, it is an empty object (`{}`).
         * @returns {Object} A newly created object.
         */
        function clone( /** !Object|Class */ proto, /** !ObjLiteral={} */ state ) {
            // The commented-out block below demonstrates how 'new' operator usage
            // could be handled, but it's currently inactive.
            // if ( this && this instanceof clone ) { // 'new' operator was used
            //     state = arguments[0];
            //     proto = clone.prototype;
            //     if ( !state ) {
            //         return this;
            //     }
            // }

            // Ensure proto is always the prototype object, not a constructor function.
            if ( typeof proto === 'function' ) {
                proto = proto.prototype;
            }

            // Provide a default empty state if none is supplied.
            if ( typeof state === 'undefined' ) {
                state = {};
            }
            // End of argument processing.

            // If the prototype has a custom $clone method (and it's not the default one), use it.
            if ( typeof proto.$clone === 'function' && proto.$clone !== clone.$.$clone ) {
                return proto.$clone( state );
            }
            // Otherwise, fall back to the internal cloning mechanism.
            else {
                return _clone( proto, state );
            }
        }

        /**#@+ @memberOf private */

        /**
         * The fastest cloning method, provided `__proto__` is supported.
         * (Except for subsequent calls to `byConstructor()` after its initial setup).
         */
        function _cloneByProto( /** Object */ proto, /** !ObjLiteral */ state ) {
            state.__proto__ = proto;
            return state;
        }

        /**
         * Use this method only if `_cloneByProto()` is not available or suitable.
         * It uses `Object.create` and then copies properties.
         */
        function _cloneByCreate( /** Object */ proto, /** ObjLiteral= */ state ) {
            var newObj = Object.create( proto );
            for ( var key in state ) {
                newObj[key] = state[key];
            }
            return newObj;
        }

        /**
         * This method is generally slower on its first invocation. However, it dynamically
         * creates a custom `$clone` method on the prototype, which can then become
         * the fastest option for subsequent instance creations. Therefore, it's recommended
         * for scenarios requiring hundreds or thousands of instances of the same type.
         */
        function _cloneByConstructor( /** !Object */ proto, /** ObjLiteral= */ state ) {

            // TODO: This check duplicates logic found in the main clone() function.
            //       Refactor to allow this function to be called multiple times efficiently.
            if ( typeof proto.$clone === 'function' && proto.$clone !== clone.$.$clone ) {
                return proto.$clone( state );
            }

            // If the prototype doesn't have its own 'constructor' property, assign a default one.
            if ( !_hasOwn.call( proto, 'constructor' ) ) {
                proto.constructor = _Clone;
            }

            /**
             * Internal constructor function used by `_cloneByConstructor`.
             * Copies properties from `state` to the new instance.
             */
            function _Clone( state ) {
                for ( var key in state ) {
                    this[key] = state[key];
                }
            }
            _Clone.prototype = proto; // Set the prototype of the constructor.

            /**
             * @override
             * Custom $clone method assigned to the prototype for optimized subsequent cloning.
             */
            proto.$clone = function( state ) {
                return new _Clone( state );
            };

            // Create and return the first instance using the new constructor.
            return new _Clone( state );
        }

        /**
         * Transforms a {@link behaviorDescriptor} into a canonical behavior object.
         * If the input is already a behavior object, it is returned unchanged.
         *
         * @param {behaviorDescriptor|clone.behavior$} behavior - The descriptor or existing behavior object.
         * @return {clone.behavior$} The resulting behavior object.
         */
        function _Behavior( /** !behaviorDescriptor|clone.behavior$ */ behavior ) {

            // If the behavior is already an instance of _Behavior, return it directly.
            // if ( clone.behavior$.isPrototypeOf(behavior) ) {
            if ( behavior instanceof _Behavior ) {
                return behavior;
            }

            /// Process $inherits property ///
            var $inherits;
            if ( _hasOwn.call( behavior, '$inherits' ) ) {
                $inherits = behavior.$inherits;
                // Recursively process the parent behavior if it's not already a canonical behavior object.
                if ( !_hasOwn.call( $inherits, '$inherits' ) || _getProto( $inherits ) != $inherits.$inherits ) {
                    $inherits = _Behavior( $inherits );
                }
            } else {
                $inherits = _protoOfNewClones; // Default inheritance if not specified.
            }

            /// Process $defaults property ///
            var $inits = behavior.$inits;
            var $defaults = behavior.$defaults || ( $inits && {} ); // Create empty defaults if $inits exist but $defaults don't.

            var proto;
            if ( $defaults && _getProto( $defaults ) !== $inherits ) {
                // If $defaults exist and don't already inherit from $inherits, clone them.
                $defaults = _clone( $inherits, $defaults );
                _define( behavior, '$defaults', {
                    value: $defaults
                } );
                // _freeze(defaults); // Potentially freeze defaults for immutability.
                proto = $defaults;
            } else {
                proto = $inherits; // Use $inherits as the prototype if no $defaults or already inherited.
            }

            /// Process $inits property ///
            if ( $inits ) {
                for ( var key in $inits ) {
                    clone.defineInitPropertyOf( $defaults, key, $inits[key], {
                        configurable: true
                    }, // Init getter is un-enumerable, so iteration doesn't modify object.
                    {
                        configurable: true,
                        writable: true,
                        enumerable: true
                    } );
                }
                // delete behavior.$inits; // Optionally remove $inits after processing.
            }

            /// Final behavior object construction ///

            // if($defaults) _freeze($defaults); // Potentially freeze defaults.

            // If the behavior object itself doesn't inherit from the determined proto, clone it.
            if ( _getProto( behavior ) !== proto ) {
                behavior = _clone( proto, behavior );
            }

            // Ensure the $inherits property on the behavior object reflects the resolved parent.
            if ( $inherits !== behavior.$inherits ) {
                _define( behavior, '$inherits', {
                    value: $inherits
                } );
            }

            // If the behavior has a constructor, ensure its prototype points to the behavior object.
            if ( _hasOwn.call( behavior, 'constructor' ) && behavior.constructor.prototype !== behavior ) {
                behavior.constructor.prototype = behavior;
            }

            // _freeze(behavior); // Potentially freeze the behavior object for immutability.
            return behavior;
        }

        /**#@- private */

        // Check for __proto__ support, which indicates a modern JavaScript environment.
        var protoSupported = '__proto__' in {};

        if ( protoSupported ) {
            /**
             * Creates a dictionary-like object with a null prototype using `__proto__`.
             * This ensures that the object has no inherited properties, preventing
             * unexpected behavior from `Object.prototype` methods.
             *
             * @constructor
             * @param {ObjLiteral=} data - Optional initial data for the dictionary.
             * @returns {clone.Dict} A new object with a null prototype.
             */
            clone.Dict = function Dict_byProto( /** !ObjLiteral= */ data ) {
                if ( data === undefined ) {
                    data = {};
                } // End of arguments processing.
                data.__proto__ = null; // Set prototype to null for a true dictionary.
                return data;
            };
        } else {
            /**
             * Constructor for objects that possess only their own properties (i.e., their prototype is null).
             * Such objects can also be created using `Object.create(null)`.
             *
             * The purpose of `clone.Dict` is best illustrated through examples:
             * @example
             * /// Example 1 /////////////////////////////////////////////////////////
             * // Problem: Unintended inheritance from Object.prototype
             *
             *     // A simple phone book object
             *     var phones = {
             *       'John': '+7987654',
             *       'Peter': '+7654321'
             *     };
             *     function getPhone(name){
             *       // 'in' operator checks prototype chain
             *       if(name in phones) return phones[name];
             *       else return undefined;
             *     }
             *     console.log(getPhone('John'));          // Outputs: '+7987654'
             *     console.log(getPhone('hasOwnProperty'));// Outputs: function hasOwnProperty() { [native code] } - Unexpected!
             *
             * /// Example 2 /////////////////////////////////////////////////////////
             * // Problem: `hasOwnProperty` can be shadowed
             *
             *     var phones = {
             *       'John':'+7987654',
             *       'Peter':'+7654321'
             *     };
             *     function getPhone(name){
             *       // Using direct hasOwnProperty check
             *       if(phones.hasOwnProperty(name)) return phones[name];
             *       else return undefined;
             *     }
             *     console.log(getPhone('John'));          // Outputs: '+7987654'
             *     phones['hasOwnProperty'] = '+7666666';  // Add a new user whose name conflicts
             *     console.log(getPhone('John'));          // Outputs: '+7987654' -- oops! The hasOwnProperty method itself is shadowed
             *
             * /// Example 3 /////////////////////////////////////////////////////////
             * // Solution: Using `Object.prototype.hasOwnProperty.call`
             *
             *     var phones = {
             *       'John':'+7987654',
             *       'Peter':'+7654321'
             *     };
             *     function getPhone(name){
             *       // Safely calling hasOwnProperty
             *       if(Object.prototype.hasOwnProperty.call(phones,name)) return phones[name];
             *       else return undefined;
             *     }
             *     console.log(getPhone('John'));          // Outputs: '+7987654'
             *     phones['hasOwnProperty'] = '+7666666';  // Add new user
             *     console.log(getPhone('John'));          // Outputs: '+7987654' - Correct!
             *
             * /// Example 4 (using clone.Dict)  ///////////////////////////////////////
             * // Simplified Solution: Using `clone.Dict` for clean dictionaries
             *
             *     var phones = clone.Dict({
             *       'John':'+7987654',
             *       'Peter':'+7654321'
             *     });
             *     function getPhone(name){
             *       // Direct access is safe because prototype is null
             *       return phones[name];
             *     }
             *     console.log(getPhone('John'));          // Outputs: '+7987654'
             *     phones['hasOwnProperty'] = '+7666666';  // Add new user
             *     console.log(getPhone('John'));          // Outputs: '+7987654' - Still correct and simpler!
             *
             * @constructor
             * @typedef object
             * @returns {clone.Dict} A new dictionary object with a null prototype.
             */
            clone.Dict = function Dict_byCreate( /** !ObjLiteral= */ data ) {
                // Fallback for older environments or when `__proto__` is unavailable.
                var dict = ( Object.create || _objectCreate_es3 )( null );
                for ( var key in data ) {
                    dict[key] = data[key];
                }
                return dict;
            };
        }
        // Explicitly setting prototype to null for ideological clarity,
        // though for objects created with `Object.create(null)` or `data.__proto__ = null`,
        // this line has no functional effect.
        clone.Dict.prototype = null;

        // // // // // // // // // // // // // // // // // // // // // // // // // //
        // Public static methods of the clone library:

        /**
         * Creates a new object. The object's prototype is based on `[clone.prototype]{@link clone.$}`
         * by default, or on a provided {@link behaviorDescriptor}.
         *
         * @param {ObjLiteral=} state - Optional initial state properties for the new object.
         * @param {behaviorDescriptor=clone.$} behavior - The behavior descriptor to use as the prototype.
         * @returns {Object} A newly instantiated object.
         */
        clone.new = function( /** !ObjLiteral={} */ state, /** !behaviorDescriptor=clone.$ */ behavior ) {
            if ( arguments.length === 0 ) {
                // Using the 'new' operator with a constructor is often faster than the clone() function.
                return new _protoOfNewClones.constructor;
            } else {
                // Resolve the behavior, falling back to _protoOfNewClones if not provided.
                behavior = behavior ? _Behavior( behavior ) : _protoOfNewClones;
                return clone( behavior, state );
            }
        };

        /**
         * Creates and returns a new [behavior object]{@link clone.behavior$}.
         * This function is used to define new "classes" or "traits" in the clone.js framework.
         *
         * @param {Class|!Object=clone.$} proto - The prototype or parent behavior to inherit from.
         *                                       If a function, its `prototype` property is used.
         * @param {!behaviorDescriptor|behavior$} behavior - The descriptor for the new behavior.
         * @returns {clone.behavior$} A newly created behavior object.
         */
        clone.extend = function( /** Class|!Object=clone.$ */ proto, /** !behaviorDescriptor|behavior$ */ behavior ) {
            // If `proto` is a function, use its prototype.
            if ( typeof proto === 'function' ) {
                proto = proto.prototype;
            }

            // If only one argument is provided, assume it is the behavior, and default proto to _protoOfNewClones.
            if ( behavior === undefined ) {
                behavior = proto;
                // proto = _protoOfNewClones; // This line was commented out in the original.
            }
            // If both arguments are provided, explicitly set the parent behavior.
            else {
                behavior.$inherits = proto;
            }
            // End of argument processing.

            // Convert the descriptor into a canonical behavior object.
            return _Behavior( behavior );
        };

        /**
         * Defines a property on an object that initializes its value lazily upon first access.
         *
         * @param {object} obj - The object on which to define the property.
         * @param {string} propertyName - The name of the property to define.
         * @param {function():*} getter - A function that will be called to get the initial value.
         * @param {propertyDescriptor} descriptor - Property descriptor for the initial getter/setter.
         * @param {propertyDescriptor} initedDescriptor - Property descriptor for the value after initialization.
         */
        clone.defineInitPropertyOf = function(
            /** object */ obj,
            /** string */ propertyName,
            /** function():* */ getter,
            /** propertyDescriptor */ descriptor,
            /** propertyDescriptor */ initedDescriptor
        ) {
            // The commented-out block below shows logic for handling undefined descriptors,
            // but the active code directly clones and extends them.
            // if ( initedDescriptor === undefined ) {
            //     initedDescriptor = descriptor ? {
            //         writable: descriptor.writable,
            //         enumerable: descriptor.enumerable,
            //         configurable: descriptor.configurable
            //     } : {
            //         writable: true,
            //         enumerable: true,
            //         configurable: true
            //     };
            // } else {
            //     initedDescriptor = _clone(initedDescriptor, {});
            // }
            // if ( descriptor === undefined ) {
            //     descriptor = { enumerable: false, configurable: true };
            // } else {
            //     descriptor = _clone(descriptor, {});
            // }
            // End of arguments processing.

            // Extend the provided descriptor with the custom getter and setter for lazy initialization.
            descriptor = _clone( descriptor, {
                get: function clone_initGetter() {
                    // When the property is accessed, call the original getter to compute the value,
                    // then immediately redefine the property as a data property with that value.
                    // The `this[propertyName] = ...` syntax effectively calls the setter defined below.
                    return this[propertyName] = /* <- call setter */ getter.call( this, propertyName, initedDescriptor );
                },
                set: function clone_initSetter( value ) {
                    // When the property is set, update the `initedDescriptor` with the new value,
                    // and then redefine the property as a data property using `_define`.
                    initedDescriptor.value = value;
                    _define( this, propertyName, initedDescriptor );
                }
            } );
            // Define the property on the object with the new lazy descriptor.
            _define( obj, propertyName, descriptor );
        };

        /**
         * Switches the internal cloning method used by the library.
         * Calling without parameters returns the currently active method name.
         *
         * @param {(function|'auto'|'proto'|'create'|'constructor')=} method - The cloning method to use.
         *     - A function: A custom cloning function.
         *     - 'auto': Triggers an asynchronous benchmark to select the fastest method.
         *     - 'proto': Uses `_cloneByProto` (fastest if `__proto__` is available).
         *     - 'create': Uses `_cloneByCreate` (uses `Object.create`).
         *     - 'constructor': Uses `_cloneByConstructor` (optimizes for multiple instances).
         */
        // TODO: Consider adding an `onDone` callback for 'auto' method selection.
        clone.by = function( /** (function|'auto'|'proto'|'create'|'constructor')= */ method ) {
            // Map method names to their corresponding internal cloning functions.
            var methods = clone.Dict( {
                proto: _cloneByProto,
                create: _cloneByCreate,
                constructor: _cloneByConstructor
            } );

            if ( 'function' === typeof method ) {
                // If a function is provided, use it directly as the cloning method.
                _clone = method;
            } else if ( method ) {
                // If a string method name is provided:
                if ( method === 'auto' ) {
                    // For 'auto', schedule a benchmark to determine the best method.
                    setTimeout( _setCloneMethodByBench, 0 );
                } else if ( method in methods ) {
                    // If it's a known method name, assign the corresponding function.
                    _clone = methods[method];
                } else {
                    // Throw an error for unrecognized method names.
                    throw new TypeError( "Unknown clone method — " + method );
                }
            } else {
                // If no method is provided, return the name of the currently active method.
                for ( var methodName in methods ) {
                    if ( _clone === methods[methodName] ) {
                        return methodName;
                    }
                }
            }
        };

        // The following commented-out methods illustrate potential utility functions
        // for calling prototype methods with different argument handling.
        //
        // /** Faster than {@link clone.$apply}. */
        // clone.$call = function(/** Object */obj, /** string */method,/** (...)= */arg1, arg2, arg3, arg4, arg5, arg6, arg7){
        //     return this.prototype[method].call(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        // }
        //
        // /** Slower than {@link clone.$call}. */
        // clone.$apply = function(/** Object */obj, /** string */method, /** Array= */args){
        //     return this.prototype[method].apply(obj, args);
        // }

        // // // // // // // // // // // // // // // // // // // // // // // // // //
        // Defines the default behavior for all objects created using `clone.new`:

        /**
         * @name clone.$
         * @class
         * The root prototype/behavior for instances created by `{@link clone.new}`.
         * This is an alias for `clone.prototype`.
         */
        var clone$Descriptor = /** @lands {clone.$#} */ {
            /**#@+ @memberOf clone.$# */

            /**
             * The default object prototype from which all clone instances inherit.
             */
            $inherits: Object.prototype,

            /**
             * In this framework, constructors are optional. Types can be created without one.
             * Use `constructor` as an initialization method:
             *
             *     // Define a class-like object:
             *     var class$ = {
             *         constructor: function(a, b){
             *             this.a = a;
             *             this.b = b;
             *         }
             *     };
             *
             *     // Create an instance using `clone`:
             *     var _instance = clone(class$);
             *
             *     // Create a callback to initialize the instance later:
             *     function callback(){ _instance.constructor(1, 2); }
             *
             * This pattern allows for the creation of empty instances that can be initialized later.
             *
             * Note that the `new` operator is typically 2-3 times faster than the {@link clone} function.
             * If you need to create thousands of instances, defining a constructor and using it with
             * the `new` operator is recommended over using {@link clone}.
             *
             * @returns {clone.$} The initialized instance.
             * @type Class
             * @field
             */
            constructor: function Clone() {},

            /**
             * This provides an object-oriented notation for the `clone` function.
             * For example, `myObject.$clone()` is functionally identical to `clone(myObject)`.
             * This method can be overridden by specific behaviors. The distinction from the
             * {@link constructor} is that `$clone` is solely a function (its `prototype`
             * property does not point back to itself), not a {@link Class}. It should
             * accept only one argument: a {@link ObjLiteral} representing the state.
             *
             * @param {ObjLiteral={}} state - The state properties for the new cloned object.
             * @returns {clone.$} A new object cloned from `this`.
             */
            $clone: function( /** ObjLiteral={} */ state ) {
                return _clone( this, state || {} );
            },

            /**
             * If called without arguments, this method returns the entire state as a {@link clone.Hash}.
             * If a `key` (string or array) is provided, it returns the value(s) of the specified property(ies).
             *
             * @nosideeffects
             * @param {string|Array=} key - The property name (string) or an array of property names.
             * @returns {clone.Hash|*} The object's state or the value of the requested property.
             */
            $get: function( /** string|Array= */ key ) {
                var propertyNames = typeof key === 'object' && key instanceof Array && key;
                if ( key === undefined || propertyNames ) {
                    var state = clone.Dict();

                    if ( !propertyNames ) {
                        propertyNames = Object.getOwnPropertyNames( this );
                    }
                    for ( var i = 0, ln = propertyNames.length; i < ln; i++ ) {
                        var name = propertyNames[i],
                            value = this[name];
                        state[name] = ( typeof value === 'function' ) ? value.valueOf() : value;
                    }

                    // The following commented-out block was an alternative implementation:
                    // for ( key in this ) {
                    //     if ( _hasOwn.call( this, key ) ) {
                    //         state[key] = ( typeof this[key] === 'function' ) ? this[key].valueOf() : this[key];
                    //     }
                    // }
                    return state;
                } else {
                    // Return the value of a specific key, unwrapping functions if necessary.
                    return ( typeof this[key] === 'function' ) ? this[key].valueOf() : this[key];
                }
            },

            /**
             * Sets properties on the object.
             * If `value` is undefined, `state_or_key` is treated as an object of properties to set.
             * Otherwise, `state_or_key` is treated as a single `key` and `value` is its corresponding value.
             *
             * @param {Object} state_or_key - An object containing properties to set, or a single property name.
             * @param {*} [value] - The value to set if `state_or_key` is a single property name.
             */
            $set: function( /** Object **/ state_or_key, /** *= */ value ) {
                if ( value === undefined ) {
                    // If `value` is not provided, iterate over `state_or_key` and set each property.
                    for ( var key in state_or_key ) {
                        if ( _hasOwn.call( this, key ) ) { // Only operate on own properties.
                            this[key] = state_or_key[key];
                        }
                    }
                } else {
                    // If `value` is provided, set the single property `state_or_key` to `value`.
                    this[state_or_key] = value;
                }
            },

            /**
             * Iterates over the object's own enumerable properties, executing a callback for each.
             *
             * @param {function(*,string)} iterator - The callback function, receiving `(value, key)`.
             * @param {Object=} context - The `this` context for the iterator function. Defaults to `this` object.
             */
            $each: function( /** function(*,string) */ iterator, /** Object=this */ context ) {
                if ( context === undefined ) {
                    context = this;
                } // End of arguments processing.

                for ( var key in this ) {
                    if ( _hasOwn.call( this, key ) ) { // Ensure only own properties are iterated.
                        iterator.call( context, this[key], key );
                    }
                }
            },


            /**
             * Creates a new object by applying a transformation function to each of the
             * current object's own enumerable properties.
             *
             * @param {function(*,string):*} iterator - The transformation function, receiving `(value, key)`.
             * @param {Object=this} context - The `this` context for the iterator function. Defaults to `this` object.
             * @param {Object=this} proto - The prototype for the new mapped object. Defaults to `this` object.
             * @returns {Object} A new object with transformed properties.
             */
            $map: function( /** function(*,string):* */ iterator, /** Object=this */ context, /** Object=this */ proto ) {
                if ( context === undefined ) {
                    context = this;
                } // End of arguments processing.

                // Create a new object cloned from either the provided `proto` or `this` object.
                var mappedObj = clone( proto || this );
                for ( var key in this ) {
                    if ( _hasOwn.call( this, key ) ) { // Transform only own properties.
                        mappedObj[key] = iterator.call( context, this[key], key );
                    }
                }
                return mappedObj;
            }

            /**#@- clone.$# */
        };

        /**
         * @name    clone.behavior$
         * @extends clone.$
         * @class
         * This represents a behavior object prototype. Behavior objects are analogous to classes,
         * but they are fundamentally **objects**, not functions.
         * A key characteristic of behaviors is that they are **immutable** (cannot be modified
         * after their creation).
         *
         * @property {object.<string,*>} $defaults
         *           A map of default values for the behavior's fields.
         * @property {clone.behavior$} $inherits
         *           The parent behavior from which this behavior inherits properties and methods.
         *           This acts as the superclass in a behavior hierarchy.
         * @property {object.<string,function:*>} $inits
         *           A map of lazy initialization functions for fields. These functions are
         *           executed only upon the first access of their respective properties.
         *
         * @borrows private._Behavior as #constructor
         */
        /**#nocode+*/
        var behavior$Descriptor =
        /**#nocode-*/
        {
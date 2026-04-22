parcelRequire = function ( e, r, t, n ) {
    /**
     * @typedef {Object} ParcelModule
     * @property {Array} 0 - The module function.
     * @property {Object} 1 - The module map.
     */

    /** @type {Function | undefined} */
    var i,
        o = "function" == typeof parcelRequire && parcelRequire, // Reference to outer parcelRequire
        u = "function" == typeof require && require; // Reference to Node.js/CommonJS require

    /**
     * The core module loading function.
     * @param {string} t - The module ID.
     * @param {boolean} n - Whether it's a non-blocking require (for `o`).
     * @returns {any} The exported module content.
     * @throws {Error} If the module cannot be found.
     */
    function f( t, n ) {
        // If the module is already in the cache, return its exports.
        if ( !r[t] ) {
            // If the module is not in the bundle 'e'.
            if ( !e[t] ) {
                var i = "function" == typeof parcelRequire && parcelRequire;

                // Try to load from an external parcelRequire if not found locally.
                if ( !n && i ) {
                    return i( t, !0 );
                }

                // Try to load from the outer parcelRequire if available.
                if ( o ) {
                    return o( t, !0 );
                }

                // Try to load from Node.js/CommonJS require if available and 't' is a string.
                if ( u && "string" == typeof t ) {
                    return u( t );
                }

                // If all attempts fail, throw an error.
                var c = new Error( "Cannot find module '" + t + "'" );
                throw c.code = "MODULE_NOT_FOUND", c;
            }

            // Initialize module properties for resolution and cache.
            p.resolve = function ( r ) {
                return e[t][1][r] || r;
            };

            p.cache = {};

            // Create a new module instance and add it to the cache.
            var l = r[t] = new f.Module( t );

            // Execute the module function.
            e[t][0].call( l.exports, p, l, l.exports, this );
        }

        // Return the cached module exports.
        return r[t].exports;

        /**
         * Local require function for the current module.
         * @param {string} e - The module path to resolve.
         * @returns {any} The resolved module exports.
         */
        function p( e ) {
            return f( p.resolve( e ) );
        }
    }

    // Mark 'f' as a ParcelRequire instance.
    f.isParcelRequire = !0;

    /**
     * Module constructor for Parcel.
     * @param {string} e - The module ID.
     */
    f.Module = function ( e ) {
        this.id = e;
        this.bundle = f;
        this.exports = {};
    };

    // Store references to the module map and cache.
    f.modules = e;
    f.cache = r;
    f.parent = o;

    /**
     * Register a new module.
     * @param {string} r - The module ID.
     * @param {any} t - The module exports.
     */
    f.register = function ( r, t ) {
        e[r] = [
            function ( e, r ) {
                r.exports = t;
            },
            {}
        ];
    };

    // Iterate through entry points and try to load them.
    for ( var c = 0; c < t.length; c++ ) {
        try {
            f( t[c] );
        } catch ( e ) {
            // Store the first error encountered, but continue loading other modules.
            i || ( i = e );
        }
    }

    // If there are entry points, set up exports for the last one.
    if ( t.length ) {
        var l = f( t[t.length - 1] );

        // Handle different export environments (CommonJS, AMD, global).
        "object" == typeof exports && "undefined" != typeof module
            ? module.exports = l
            : "function" == typeof define && define.amd
                ? define( function () {
                    return l;
                } )
                : n && ( this[n] = l );
    }

    // Set `parcelRequire` to the current `f` function.
    if ( parcelRequire = f, i ) {
        throw i; // Re-throw any stored error.
    }

    // Return the `f` function (the new parcelRequire).
    return f;

}( {
    // Module definitions start here.

    "Focm": [
        function ( require, module, exports ) {
            // Global namespace object 'n' for PureScript modules.
            var n = {};

            // Module: Control.Apply (arrayApply)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Control.Apply' namespace, then define 'arrayApply'.
                ( n["Control.Apply"] = n["Control.Apply"] || {} ).arrayApply = function ( n ) {
                    // Returns a function that takes an array 't' and applies 'n' to it.
                    return function ( t ) {
                        var r = n.length, // Length of the function array.
                            e = t.length, // Length of the argument array.
                            i = new Array( r * e ), // Pre-allocate result array.
                            u = 0, // Index for the result array.
                            o = 0; // Index for the function array.

                        // Iterate through each function in 'n'.
                        for ( ; o < r; o++ ) {
                            var a = n[o], // Current function.
                                c = 0; // Index for the argument array.

                            // Apply the current function 'a' to each argument in 't'.
                            for ( ; c < e; c++ ) {
                                i[u++] = a( t[c] ); // Store the result and increment result index.
                            }
                        }
                        return i; // Return the new array with all results.
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Control.Semigroupoid
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Semigroupoid"], // Alias for the Semigroupoid namespace.
                    r = function ( n ) {
                        this.compose = n;
                    }, // Constructor for Semigroupoid.
                    e = new r( function ( n ) {
                        // The 'compose' function for functions.
                        return function ( t ) {
                            return function ( r ) {
                                return n( t( r ) ); // f . g = \x -> f(g(x))
                            };
                        };
                    } );

                // Initialize or retrieve the 'Control.Semigroupoid' namespace.
                n["Control.Semigroupoid"] = n["Control.Semigroupoid"] || {};

                // Export 'compose' function from the Semigroupoid instance.
                t.compose = function ( n ) {
                    return n.compose;
                };

                // Export the Semigroupoid constructor.
                t.Semigroupoid = r;

                // Export the Semigroupoid instance for functions.
                t.semigroupoidFn = e;

            }( n ); // Immediately invoked function expression.

            // Module: Control.Category
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Category"], // Alias for the Category namespace.
                    r = n["Control.Semigroupoid"], // Dependency: Control.Semigroupoid.
                    e = function ( n, t ) {
                        this.Semigroupoid0 = n; // Reference to the Semigroupoid instance.
                        this.identity = t; // The identity function for the category.
                    }, // Category constructor.
                    i = new e( function () {
                        return r.semigroupoidFn;
                    }, function ( n ) {
                        return n;
                    } ); // Category instance for functions.

                // Initialize or retrieve the 'Control.Category' namespace.
                n["Control.Category"] = n["Control.Category"] || {};

                // Export the Category constructor.
                t.Category = e;

                // Export the 'identity' function from the Category instance.
                t.identity = function ( n ) {
                    return n.identity;
                };

                // Export the Category instance for functions.
                t.categoryFn = i;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Function
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Function"]; // Alias for the Data.Function namespace.

                // Initialize or retrieve the 'Data.Function' namespace.
                n["Data.Function"] = n["Data.Function"] || {};

                // Define the 'flip' function.
                t.flip = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return n( r )( t ); // flip f a b = f b a
                        };
                    };
                };

                // Define the 'const' function.
                t.const = function ( n ) {
                    return function ( t ) {
                        return n; // const a b = a
                    };
                };

            }( n ); // Immediately invoked function expression.

            // Module: Data.Functor (arrayMap)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Functor' namespace, then define 'arrayMap'.
                ( n["Data.Functor"] = n["Data.Functor"] || {} ).arrayMap = function ( n ) {
                    // Returns a function that takes an array 't' and maps 'n' over it.
                    return function ( t ) {
                        var r = t.length, // Length of the input array.
                            e = new Array( r ), // Pre-allocate result array.
                            i = 0; // Index for the array.

                        // Iterate and apply the function 'n' to each element.
                        for ( ; i < r; i++ ) {
                            e[i] = n( t[i] );
                        }
                        return e; // Return the new array.
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Data.Unit (unit value)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Unit' namespace, then define 'unit'.
                ( n["Data.Unit"] = n["Data.Unit"] || {} ).unit = {}; // The singleton unit value.
            }(); // Immediately invoked function expression.

            // Module: Data.Unit (re-export, potentially redundant in minified code)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Unit"], // Alias for Data.Unit namespace.
                    r = n["Data.Unit"]; // Alias for Data.Unit namespace (self-reference).

                // Initialize or retrieve the 'Data.Unit' namespace.
                n["Data.Unit"] = n["Data.Unit"] || {};

                // Re-export 'unit'.
                t.unit = r.unit;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Functor
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Functor"], // Alias for Data.Functor namespace.
                    r = n["Data.Functor"], // Self-reference.
                    e = n["Data.Function"], // Dependency: Data.Function.
                    i = n["Data.Unit"], // Dependency: Data.Unit.
                    u = function ( n ) {
                        this.map = n;
                    }, // Functor constructor.
                    o = function ( n ) {
                        return n.map;
                    }, // Helper to get the 'map' function.
                    a = new u( r.arrayMap ); // Functor instance for arrays.

                // Initialize or retrieve the 'Data.Functor' namespace.
                n["Data.Functor"] = n["Data.Functor"] || {};

                // Export the Functor constructor.
                t.Functor = u;

                // Export the 'map' function.
                t.map = o;

                // Define 'void' function.
                t.void = function ( n ) {
                    return o( n )( e.const( i.unit ) ); // map f (const unit)
                };

                // Export the Functor instance for arrays.
                t.functorArray = a;

            }( n ); // Immediately invoked function expression.

            // Module: Control.Apply
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Apply"], // Alias for Control.Apply namespace.
                    r = n["Control.Apply"], // Self-reference.
                    e = n["Control.Category"], // Dependency: Control.Category.
                    i = n["Data.Function"], // Dependency: Data.Function.
                    u = n["Data.Functor"], // Dependency: Data.Functor.
                    o = function ( n, t ) {
                        this.Functor0 = n; // Reference to the Functor instance.
                        this.apply = t; // The apply function.
                    }, // Apply constructor.
                    a = new o( function () {
                        return u.functorArray;
                    }, r.arrayApply ), // Apply instance for arrays.
                    c = function ( n ) {
                        return n.apply;
                    }; // Helper to get the 'apply' function.

                // Initialize or retrieve the 'Control.Apply' namespace.
                n["Control.Apply"] = n["Control.Apply"] || {};

                // Export the Apply constructor.
                t.Apply = o;

                // Export the 'apply' function.
                t.apply = c;

                // Define 'applySecond' function.
                t.applySecond = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            // apply f a b = (f <* a) <*> b
                            return c( n )( u.map( n.Functor0() )( i.const( e.identity( e.categoryFn ) ) )( t ) )( r );
                        };
                    };
                };

                // Export the Apply instance for arrays.
                t.applyArray = a;

            }( n ); // Immediately invoked function expression.

            // Module: Control.Applicative
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Applicative"], // Alias for Control.Applicative namespace.
                    r = n["Control.Apply"], // Dependency: Control.Apply.
                    e = function ( n ) {
                        return n.pure;
                    }; // Helper to get the 'pure' function.

                // Initialize or retrieve the 'Control.Applicative' namespace.
                n["Control.Applicative"] = n["Control.Applicative"] || {};

                // Applicative constructor.
                t.Applicative = function ( n, t ) {
                    this.Apply0 = n; // Reference to the Apply instance.
                    this.pure = t; // The pure function.
                };

                // Export the 'pure' function.
                t.pure = e;

                // Define 'liftA1' function.
                t.liftA1 = function ( n ) {
                    return function ( t ) {
                        return function ( i ) {
                            return r.apply( n.Apply0() )( e( n )( t ) )( i ); // fmap f x = pure f <*> x
                        };
                    };
                };

            }( n ); // Immediately invoked function expression.

            // Module: Control.Bind (arrayBind)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Control.Bind' namespace, then define 'arrayBind'.
                ( n["Control.Bind"] = n["Control.Bind"] || {} ).arrayBind = function ( n ) {
                    // Returns a function that takes an array 't' and binds 'n' over it.
                    return function ( t ) {
                        var r = [], // Result array.
                            e = 0, // Index for the input array.
                            i = n.length; // Length of the input array.

                        // For each element in 'n', apply 't' and concatenate the results.
                        for ( ; e < i; e++ ) {
                            Array.prototype.push.apply( r, t( n[e] ) );
                        }
                        return r; // Return the flattened array.
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Control.Bind
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Bind"], // Alias for Control.Bind namespace.
                    r = n["Control.Bind"], // Self-reference.
                    e = n["Control.Apply"], // Dependency: Control.Apply.
                    i = n["Data.Function"], // Dependency: Data.Function.
                    u = function ( n, t ) {
                        this.Apply0 = n; // Reference to the Apply instance.
                        this.bind = t; // The bind function.
                    }, // Bind constructor.
                    o = new u( function () {
                        return e.applyArray;
                    }, r.arrayBind ), // Bind instance for arrays.
                    a = function ( n ) {
                        return n.bind;
                    }, // Helper to get the 'bind' function.
                    c = function ( n ) {
                        return i.flip( a( n ) ); // flip bind
                    };

                // Initialize or retrieve the 'Control.Bind' namespace.
                n["Control.Bind"] = n["Control.Bind"] || {};

                // Export the Bind constructor.
                t.Bind = u;

                // Export the 'bind' function.
                t.bind = a;

                // Export 'bindFlipped' function.
                t.bindFlipped = c;

                // Define 'composeKleisliFlipped' function.
                t.composeKleisliFlipped = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return function ( e ) {
                                return c( n )( t )( r( e ) ); // (<=<)
                            };
                        };
                    };
                };

                // Export the Bind instance for arrays.
                t.bindArray = o;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Maybe
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Maybe"], // Alias for Data.Maybe namespace.
                    r = n["Control.Applicative"], // Dependency: Control.Applicative.
                    e = n["Control.Apply"], // Dependency: Control.Apply.
                    i = n["Control.Bind"], // Dependency: Control.Bind.
                    u = n["Data.Functor"], // Dependency: Data.Functor.

                    // Nothing constructor.
                    o = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Just constructor.
                    a = function () {
                        function n( n ) {
                            this.value0 = n;
                        }
                        return n.create = function ( t ) {
                            return new n( t );
                        }, n;
                    }(),

                    // Functor instance for Maybe.
                    c = new u.Functor( function ( n ) {
                        return function ( t ) {
                            return t instanceof a ? new a( n( t.value0 ) ) : o.value;
                        };
                    } ),

                    // Apply instance for Maybe.
                    f = new e.Apply( function () {
                        return c;
                    }, function ( n ) {
                        return function ( t ) {
                            if ( n instanceof a ) {
                                return u.map( c )( n.value0 )( t );
                            }
                            if ( n instanceof o ) {
                                return o.value;
                            }
                            throw new Error( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [n.constructor.name, t.constructor.name] );
                        };
                    } ),

                    // Bind instance for Maybe.
                    l = new i.Bind( function () {
                        return f;
                    }, function ( n ) {
                        return function ( t ) {
                            if ( n instanceof a ) {
                                return t( n.value0 );
                            }
                            if ( n instanceof o ) {
                                return o.value;
                            }
                            throw new Error( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [n.constructor.name, t.constructor.name] );
                        };
                    } ),

                    // Applicative instance for Maybe.
                    s = new r.Applicative( function () {
                        return f;
                    }, a.create );

                // Initialize or retrieve the 'Data.Maybe' namespace.
                n["Data.Maybe"] = n["Data.Maybe"] || {};

                // Export constructors.
                t.Nothing = o;
                t.Just = a;

                // Define 'maybe' function.
                t.maybe = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            if ( r instanceof o ) {
                                return n;
                            }
                            if ( r instanceof a ) {
                                return t( r.value0 );
                            }
                            throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [n.constructor.name, t.constructor.name, r.constructor.name] );
                        };
                    };
                };

                // Export instances.
                t.functorMaybe = c;
                t.applyMaybe = f;
                t.applicativeMaybe = s;
                t.bindMaybe = l;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Array
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Array"], // Alias for Data.Array namespace.
                    r = n["Control.Bind"], // Dependency: Control.Bind.
                    e = n["Data.Function"], // Dependency: Data.Function.
                    i = n["Data.Maybe"], // Dependency: Data.Maybe.
                    u = function ( n ) {
                        return [n];
                    }, // Helper to create a singleton array.
                    o = e.flip( r.bind( r.bindArray ) ); // bindFlipped for arrays.

                // Initialize or retrieve the 'Data.Array' namespace.
                n["Data.Array"] = n["Data.Array"] || {};

                // Export 'singleton'.
                t.singleton = u;

                // Export 'concatMap'.
                t.concatMap = o;

                // Define 'mapMaybe'.
                t.mapMaybe = function ( n ) {
                    return o( function ( t ) {
                        return i.maybe( [] )( u )( n( t ) ); // If Just, wrap in array; if Nothing, empty array.
                    } );
                };

            }( n ); // Immediately invoked function expression.

            // Module: Data.Boolean
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Boolean' namespace, then define 'otherwise'.
                n["Data.Boolean"] = n["Data.Boolean"] || {};
                n["Data.Boolean"].otherwise = !0; // The 'otherwise' boolean value.

            }( n ); // Immediately invoked function expression.

            // Module: Data.Either
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Either"], // Alias for Data.Either namespace.
                    r = n["Control.Applicative"], // Dependency: Control.Applicative.
                    e = n["Control.Apply"], // Dependency: Control.Apply.
                    i = n["Control.Bind"], // Dependency: Control.Bind.
                    u = n["Data.Functor"], // Dependency: Data.Functor.
                    o = n["Data.Maybe"], // Dependency: Data.Maybe.

                    // Left constructor.
                    a = function () {
                        function n( n ) {
                            this.value0 = n;
                        }
                        return n.create = function ( t ) {
                            return new n( t );
                        }, n;
                    }(),

                    // Right constructor.
                    c = function () {
                        function n( n ) {
                            this.value0 = n;
                        }
                        return n.create = function ( t ) {
                            return new n( t );
                        }, n;
                    }(),

                    // Functor instance for Either.
                    f = new u.Functor( function ( n ) {
                        return function ( t ) {
                            if ( t instanceof a ) {
                                return new a( t.value0 ); // Left values are not mapped.
                            }
                            if ( t instanceof c ) {
                                return new c( n( t.value0 ) ); // Right values are mapped.
                            }
                            throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [t.constructor.name] );
                        };
                    } ),

                    // The 'either' function.
                    l = function ( n ) {
                        return function ( t ) {
                            return function ( r ) {
                                if ( r instanceof a ) {
                                    return n( r.value0 );
                                }
                                if ( r instanceof c ) {
                                    return t( r.value0 );
                                }
                                throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [n.constructor.name, t.constructor.name, r.constructor.name] );
                            };
                        };
                    },

                    // Apply instance for Either.
                    s = new e.Apply( function () {
                        return f;
                    }, function ( n ) {
                        return function ( t ) {
                            if ( n instanceof a ) {
                                return new a( n.value0 ); // If Left, propagate Left.
                            }
                            if ( n instanceof c ) {
                                return u.map( f )( n.value0 )( t ); // If Right, apply the function.
                            }
                            throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [n.constructor.name, t.constructor.name] );
                        };
                    } ),

                    // Bind instance for Either.
                    p = new i.Bind( function () {
                        return s;
                    }, l( function ( n ) {
                        return function ( t ) {
                            return new a( n ); // If Left, propagate Left.
                        };
                    } )( function ( n ) {
                        return function ( t ) {
                            return t( n ); // If Right, apply the function.
                        };
                    } ) ),

                    // Applicative instance for Either.
                    d = new r.Applicative( function () {
                        return s;
                    }, c.create );

                // Initialize or retrieve the 'Data.Either' namespace.
                n["Data.Either"] = n["Data.Either"] || {};

                // Export constructors.
                t.Left = a;
                t.Right = c;

                // Export 'either' function.
                t.either = l;

                // Define 'note' function (convert Maybe to Either).
                t.note = function ( n ) {
                    return o.maybe( new a( n ) )( c.create );
                };

                // Export instances.
                t.functorEither = f;
                t.applyEither = s;
                t.applicativeEither = d;
                t.bindEither = p;

            }( n ); // Immediately invoked function expression.

            // Module: Data.EuclideanRing (intDegree, intDiv, intMod)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.EuclideanRing' namespace.
                n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {};

                // Define 'intDegree' function.
                n.intDegree = function ( n ) {
                    return Math.min( Math.abs( n ), 2147483647 ); // Degree for integers.
                };

                // Define 'intDiv' function.
                n.intDiv = function ( n ) {
                    return function ( t ) {
                        return 0 === t ? 0 : t > 0 ? Math.floor( n / t ) : -Math.floor( n / -t ); // Integer division.
                    };
                };

                // Define 'intMod' function.
                n.intMod = function ( n ) {
                    return function ( t ) {
                        if ( 0 === t ) {
                            return 0; // Modulo by zero is 0.
                        }
                        var r = Math.abs( t );
                        return ( n % r + r ) % r; // Positive modulo.
                    };
                };

            }( n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {} ); // Immediately invoked function expression.

            // Module: Data.Ring (intSub)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Ring' namespace, then define 'intSub'.
                ( n["Data.Ring"] = n["Data.Ring"] || {} ).intSub = function ( n ) {
                    return function ( t ) {
                        return n - t | 0; // Integer subtraction.
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Data.Semiring (intAdd, intMul)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Semiring' namespace.
                n["Data.Semiring"] = n["Data.Semiring"] || {};

                // Define 'intAdd' function.
                n.intAdd = function ( n ) {
                    return function ( t ) {
                        return n + t | 0; // Integer addition.
                    };
                };

                // Define 'intMul' function.
                n.intMul = function ( n ) {
                    return function ( t ) {
                        return n * t | 0; // Integer multiplication.
                    };
                };

            }( n["Data.Semiring"] = n["Data.Semiring"] || {} ); // Immediately invoked function expression.

            // Module: Data.Semiring
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Semiring"], // Alias for Data.Semiring namespace.
                    r = n["Data.Semiring"], // Self-reference.
                    e = function ( n, t, r, e ) {
                        this.add = n; // Addition operation.
                        this.mul = t; // Multiplication operation.
                        this.one = r; // Multiplicative identity.
                        this.zero = e; // Additive identity.
                    }, // Semiring constructor.
                    i = new e( r.intAdd, r.intMul, 1, 0 ); // Semiring instance for integers.

                // Initialize or retrieve the 'Data.Semiring' namespace.
                n["Data.Semiring"] = n["Data.Semiring"] || {};

                // Export Semiring constructor.
                t.Semiring = e;

                // Export accessors for Semiring operations.
                t.add = function ( n ) {
                    return n.add;
                };
                t.zero = function ( n ) {
                    return n.zero;
                };
                t.mul = function ( n ) {
                    return n.mul;
                };
                t.one = function ( n ) {
                    return n.one;
                };

                // Export Semiring instance for integers.
                t.semiringInt = i;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Ring
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Ring"], // Alias for Data.Ring namespace.
                    r = n["Data.Ring"], // Self-reference.
                    e = n["Data.Semiring"], // Dependency: Data.Semiring.
                    i = function ( n, t ) {
                        this.Semiring0 = n; // Reference to the Semiring instance.
                        this.sub = t; // Subtraction operation.
                    }, // Ring constructor.
                    u = new i( function () {
                        return e.semiringInt;
                    }, r.intSub ); // Ring instance for integers.

                // Initialize or retrieve the 'Data.Ring' namespace.
                n["Data.Ring"] = n["Data.Ring"] || {};

                // Export Ring constructor.
                t.Ring = i;

                // Export 'sub' accessor.
                t.sub = function ( n ) {
                    return n.sub;
                };

                // Export Ring instance for integers.
                t.ringInt = u;

            }( n ); // Immediately invoked function expression.

            // Module: Data.CommutativeRing
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.CommutativeRing"], // Alias for Data.CommutativeRing namespace.
                    r = n["Data.Ring"], // Dependency: Data.Ring.
                    e = function ( n ) {
                        this.Ring0 = n;
                    }, // CommutativeRing constructor.
                    i = new e( function () {
                        return r.ringInt;
                    } ); // CommutativeRing instance for integers.

                // Initialize or retrieve the 'Data.CommutativeRing' namespace.
                n["Data.CommutativeRing"] = n["Data.CommutativeRing"] || {};

                // Export CommutativeRing constructor.
                t.CommutativeRing = e;

                // Export CommutativeRing instance for integers.
                t.commutativeRingInt = i;

            }( n ); // Immediately invoked function expression.

            // Module: Data.EuclideanRing
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.EuclideanRing"], // Alias for Data.EuclideanRing namespace.
                    r = n["Data.EuclideanRing"], // Self-reference.
                    e = n["Data.CommutativeRing"], // Dependency: Data.CommutativeRing.
                    i = function ( n, t, r, e ) {
                        this.CommutativeRing0 = n; // Reference to the CommutativeRing instance.
                        this.degree = t; // Degree function.
                        this.div = r; // Division function.
                        this.mod = e; // Modulo function.
                    }, // EuclideanRing constructor.
                    u = new i( function () {
                        return e.commutativeRingInt;
                    }, r.intDegree, r.intDiv, r.intMod ); // EuclideanRing instance for integers.

                // Initialize or retrieve the 'Data.EuclideanRing' namespace.
                n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {};

                // Export EuclideanRing constructor.
                t.EuclideanRing = i;

                // Export accessors for EuclideanRing operations.
                t.degree = function ( n ) {
                    return n.degree;
                };
                t.div = function ( n ) {
                    return n.div;
                };
                t.mod = function ( n ) {
                    return n.mod;
                };

                // Export EuclideanRing instance for integers.
                t.euclideanRingInt = u;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Foldable (foldrArray, foldlArray)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Foldable' namespace.
                n["Data.Foldable"] = n["Data.Foldable"] || {};

                // Define 'foldrArray' (fold right for arrays).
                n.foldrArray = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            for ( var e = t, i = r.length - 1; i >= 0; i-- ) {
                                e = n( r[i] )( e );
                            }
                            return e;
                        };
                    };
                };

                // Define 'foldlArray' (fold left for arrays).
                n.foldlArray = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            for ( var e = t, i = r.length, u = 0; u < i; u++ ) {
                                e = n( e )( r[u] );
                            }
                            return e;
                        };
                    };
                };

            }( n["Data.Foldable"] = n["Data.Foldable"] || {} ); // Immediately invoked function expression.

            // Module: Data.Monoid
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Monoid"]; // Alias for Data.Monoid namespace.

                // Initialize or retrieve the 'Data.Monoid' namespace.
                n["Data.Monoid"] = n["Data.Monoid"] || {};

                // Monoid constructor.
                t.Monoid = function ( n, t ) {
                    this.Semigroup0 = n; // Reference to the Semigroup instance.
                    this.mempty = t; // The identity element for the monoid.
                };

                // Export 'mempty' accessor.
                t.mempty = function ( n ) {
                    return n.mempty;
                };

            }( n ); // Immediately invoked function expression.

            // Module: Data.Semigroup
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Semigroup"]; // Alias for Data.Semigroup namespace.

                // Initialize or retrieve the 'Data.Semigroup' namespace.
                n["Data.Semigroup"] = n["Data.Semigroup"] || {};

                // Semigroup constructor.
                t.Semigroup = function ( n ) {
                    this.append = n; // The binary associative operation.
                };

                // Export 'append' accessor.
                t.append = function ( n ) {
                    return n.append;
                };

            }( n ); // Immediately invoked function expression.

            // Module: Data.Foldable
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Foldable"], // Alias for Data.Foldable namespace.
                    r = n["Data.Foldable"], // Self-reference.
                    e = n["Control.Applicative"], // Dependency: Control.Applicative.
                    i = n["Control.Apply"], // Dependency: Control.Apply.
                    u = n["Data.Monoid"], // Dependency: Data.Monoid.
                    o = n["Data.Semigroup"], // Dependency: Data.Semigroup.
                    a = n["Data.Unit"], // Dependency: Data.Unit.
                    c = function ( n, t, r ) {
                        this.foldMap = n; // foldMap function.
                        this.foldl = t; // foldl function.
                        this.foldr = r; // foldr function.
                    }, // Foldable constructor.
                    f = function ( n ) {
                        return n.foldr;
                    }, // Helper to get the 'foldr' function.
                    l = function ( n ) {
                        return function ( t ) {
                            return function ( r ) {
                                // Default foldMap implementation using foldr.
                                return f( n )( function ( n ) {
                                    return function ( e ) {
                                        return o.append( t.Semigroup0() )( r( n ) )( e );
                                    };
                                } )( u.mempty( t ) );
                            };
                        };
                    },
                    s = new c( function ( n ) {
                        return l( s )( n );
                    }, r.foldlArray, r.foldrArray ); // Foldable instance for arrays.

                // Initialize or retrieve the 'Data.Foldable' namespace.
                n["Data.Foldable"] = n["Data.Foldable"] || {};

                // Export Foldable constructor.
                t.Foldable = c;

                // Export accessors for Foldable operations.
                t.foldr = f;
                t.foldl = function ( n ) {
                    return n.foldl;
                };
                t.foldMap = function ( n ) {
                    return n.foldMap;
                };

                // Export default foldMap implementation.
                t.foldMapDefaultR = l;

                // Define 'traverse_' function.
                t.traverse_ = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            // Traverse a structure, discarding results.
                            return f( t )( function ( t ) {
                                return i.applySecond( n.Apply0() )( r( t ) );
                            } )( e.pure( n )( a.unit ) );
                        };
                    };
                };

                // Export Foldable instance for arrays.
                t.foldableArray = s;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Int (fromStringAsImpl)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Int' namespace, then define 'fromStringAsImpl'.
                ( n["Data.Int"] = n["Data.Int"] || {} ).fromStringAsImpl = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            var e;
                            // Determine the regex character set based on the radix.
                            e = r < 11
                                ? "[0-" + ( r - 1 ).toString() + "]"
                                : 11 === r
                                    ? "[0-9a]"
                                    : "[0-9a-" + String.fromCharCode( 86 + r ) + "]";

                            // Create a regex to validate the input string format.
                            var i = new RegExp( "^[\\+\\-]?" + e + "+$", "i" );

                            // Return the actual parsing function.
                            return function ( e ) {
                                if ( i.test( e ) ) {
                                    var u = parseInt( e, r ); // Parse the integer.
                                    // Check if the parsed value is a valid integer (not NaN and not a float).
                                    return ( 0 | u ) === u ? n( u ) : t;
                                }
                                return t; // Return 'Nothing' (represented by 't') if format is invalid.
                            };
                        };
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Data.Int
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Int"], // Alias for Data.Int namespace.
                    r = n["Data.Int"], // Self-reference.
                    e = n["Data.Maybe"], // Dependency: Data.Maybe.
                    i = r.fromStringAsImpl( e.Just.create )( e.Nothing.value ), // fromStringAs with Maybe.
                    u = i( 10 ); // fromString specifically for base 10.

                // Initialize or retrieve the 'Data.Int' namespace.
                n["Data.Int"] = n["Data.Int"] || {};

                // Export 'fromString'.
                t.fromString = u;

                // Export 'fromStringAs'.
                t.fromStringAs = i;

                // Define 'odd' function.
                t.odd = function ( n ) {
                    return 0 != ( 1 & n ); // Check if the least significant bit is 1.
                };

            }( n ); // Immediately invoked function expression.

            // Module: Data.Show (showIntImpl)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.Show' namespace, then define 'showIntImpl'.
                ( n["Data.Show"] = n["Data.Show"] || {} ).showIntImpl = function ( n ) {
                    return n.toString(); // Convert integer to string.
                };
            }(); // Immediately invoked function expression.

            // Module: Data.Show
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Show"], // Alias for Data.Show namespace.
                    r = function ( n ) {
                        this.show = n;
                    }, // Show constructor.
                    e = new r( n["Data.Show"].showIntImpl ); // Show instance for integers.

                // Initialize or retrieve the 'Data.Show' namespace.
                n["Data.Show"] = n["Data.Show"] || {};

                // Export Show constructor.
                t.Show = r;

                // Export 'show' accessor.
                t.show = function ( n ) {
                    return n.show;
                };

                // Export Show instance for integers.
                t.showInt = e;

            }( n ); // Immediately invoked function expression.

            // Module: Data.String.Common (split, trim)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Data.String.Common' namespace.
                n["Data.String.Common"] = n["Data.String.Common"] || {};

                // Define 'split' function.
                n.split = function ( n ) {
                    return function ( t ) {
                        return t.split( n );
                    };
                };

                // Define 'trim' function.
                n.trim = function ( n ) {
                    return n.trim();
                };

            }( n["Data.String.Common"] = n["Data.String.Common"] || {} ); // Immediately invoked function expression.

            // Module: Data.String.Common (re-export)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.String.Common"], // Alias for Data.String.Common namespace.
                    r = n["Data.String.Common"]; // Self-reference.

                // Initialize or retrieve the 'Data.String.Common' namespace.
                n["Data.String.Common"] = n["Data.String.Common"] || {};

                // Re-export 'split'.
                t.split = r.split;

                // Re-export 'trim'.
                t.trim = r.trim;

            }( n ); // Immediately invoked function expression.

            // Module: Data.Tuple
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Data.Tuple"], // Alias for Data.Tuple namespace.
                    r = function () {
                        function n( n, t ) {
                            this.value0 = n;
                            this.value1 = t;
                        }
                        return n.create = function ( t ) {
                            return function ( r ) {
                                return new n( t, r );
                            };
                        }, n;
                    }(); // Tuple constructor.

                // Initialize or retrieve the 'Data.Tuple' namespace.
                n["Data.Tuple"] = n["Data.Tuple"] || {};

                // Export Tuple constructor.
                t.Tuple = r;

            }( n ); // Immediately invoked function expression.

            // Module: Effect (pureE, bindE)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Effect' namespace.
                n.Effect = n.Effect || {};

                // Define 'pureE' (pure for Effect).
                n.pureE = function ( n ) {
                    return function () {
                        return n;
                    };
                };

                // Define 'bindE' (bind for Effect).
                n.bindE = function ( n ) {
                    return function ( t ) {
                        return function () {
                            return t( n() )();
                        };
                    };
                };

            }( n.Effect = n.Effect || {} ); // Immediately invoked function expression.

            // Module: Control.Monad
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Control.Monad"], // Alias for Control.Monad namespace.
                    r = n["Control.Applicative"], // Dependency: Control.Applicative.
                    e = n["Control.Bind"]; // Dependency: Control.Bind.

                // Initialize or retrieve the 'Control.Monad' namespace.
                n["Control.Monad"] = n["Control.Monad"] || {};

                // Monad constructor.
                t.Monad = function ( n, t ) {
                    this.Applicative0 = n; // Reference to the Applicative instance.
                    this.Bind1 = t; // Reference to the Bind instance.
                };

                // Define 'ap' function (for Monad).
                t.ap = function ( n ) {
                    return function ( t ) {
                        return function ( i ) {
                            return e.bind( n.Bind1() )( t )( function ( t ) {
                                return e.bind( n.Bind1() )( i )( function ( e ) {
                                    return r.pure( n.Applicative0() )( t( e ) ); // s.ap f x = s.bind f (\f' -> s.bind x (\x' -> s.pure (f' x')))
                                } );
                            } );
                        };
                    };
                };

            }( n ); // Immediately invoked function expression.

            // Module: Effect
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n.Effect, // Alias for Effect namespace.
                    r = n.Effect, // Self-reference.
                    e = n["Control.Applicative"], // Dependency: Control.Applicative.
                    i = n["Control.Apply"], // Dependency: Control.Apply.
                    u = n["Control.Bind"], // Dependency: Control.Bind.
                    o = n["Control.Monad"], // Dependency: Control.Monad.
                    a = n["Data.Functor"], // Dependency: Data.Functor.

                    // Monad instance for Effect.
                    c = new o.Monad( function () {
                        return s;
                    }, function () {
                        return f;
                    } ),

                    // Bind instance for Effect.
                    f = new u.Bind( function () {
                        return l;
                    }, r.bindE ),

                    // Apply instance for Effect.
                    l = new i.Apply( function () {
                        return p;
                    }, o.ap( c ) ),

                    // Applicative instance for Effect.
                    s = new e.Applicative( function () {
                        return l;
                    }, r.pureE ),

                    // Functor instance for Effect.
                    p = new a.Functor( e.liftA1( s ) );

                // Initialize or retrieve the 'Effect' namespace.
                n.Effect = n.Effect || {};

                // Export instances.
                t.functorEffect = p;
                t.applyEffect = l;
                t.applicativeEffect = s;
                t.bindEffect = f;
                t.monadEffect = c;

            }( n ); // Immediately invoked function expression.

            // Module: Effect.Aff (internal implementations)
            !function () {
                var n = {}, // Local namespace for Effect.Aff internal state.
                    t = "Pure", // Tag for Pure constructor.
                    r = "Throw", // Tag for Throw constructor.
                    e = "Catch", // Tag for Catch constructor.
                    i = "Sync", // Tag for Sync constructor.
                    u = "Async", // Tag for Async constructor.
                    o = "Bind", // Tag for Bind constructor.
                    a = "Bracket", // Tag for Bracket constructor.
                    c = "Fork", // Tag for Fork constructor.
                    f = "Sequential", // Tag for Sequential constructor.
                    l = "Map", // Tag for ParMap constructor.
                    s = "Apply", // Tag for ParApply constructor.
                    p = "Alt", // Tag for ParAlt constructor.
                    d = "Cons", // Tag for Cons (internal list node) constructor.
                    m = "Resume", // Tag for Resume (internal state) constructor.
                    h = "Release", // Tag for Release (internal state) constructor.
                    w = "Finalizer", // Tag for Finalizer (internal state) constructor.
                    v = "Finalized", // Tag for Finalized (internal state) constructor.
                    g = "Forked"; // Tag for Forked (internal state) constructor.

                /**
                 * D constructor for various Aff operations.
                 * @param {string} tag - The operation tag.
                 * @param {any} _1 - First argument.
                 * @param {any} _2 - Second argument.
                 * @param {any} _3 - Third argument.
                 */
                function D( tag, _1, _2, _3 ) {
                    this.tag = tag;
                    this._1 = _1;
                    this._2 = _2;
                    this._3 = _3;
                }

                /**
                 * Helper to create a tagged constructor.
                 * @param {string} n - The tag name.
                 * @returns {Function} A constructor function.
                 */
                function y( n ) {
                    var t = function ( t, r, e ) {
                        return new D( n, t, r, e );
                    };
                    return t.tag = n, t;
                }

                /**
                 * Creates a Pure canceler (no-op).
                 * @returns {D} A D instance representing a no-op canceler.
                 */
                function C( n ) {
                    return new D( t, void 0 );
                }

                /**
                 * Executes a thunk, catching and re-throwing errors asynchronously.
                 * @param {Function} n - The thunk to execute.
                 */
                function E( n ) {
                    try {
                        n();
                    } catch ( t ) {
                        setTimeout( function () {
                            throw t;
                        }, 0 );
                    }
                }

                /**
                 * Safely runs a synchronous computation.
                 * @param {Function} n - Error handler.
                 * @param {Function} t - Success handler.
                 * @param {Function} r - Thunk to run.
                 * @returns {any} Result of success or error handler.
                 */
                function A( n, t, r ) {
                    try {
                        return t( r() );
                    } catch ( e ) {
                        return n( e );
                    }
                }

                /**
                 * Safely runs an asynchronous computation.
                 * @param {Function} n - Error handler.
                 * @param {Function} t - Async function to run.
                 * @param {Function} r - Cleanup function on error.
                 * @returns {D} A D instance representing a Pure canceler.
                 */
                function _( n, t, r ) {
                    try {
                        return t( r() );
                    } catch ( e ) {
                        return r( n( e ) )(), C;
                    }
                }

                /**
                 * Scheduler for async operations.
                 */
                var b = function () {
                    var n = 1024, // Queue size.
                        t = 0, // Number of items in queue.
                        r = 0, // Read pointer.
                        e = new Array( n ), // Queue array.
                        i = !1; // Is draining flag.

                    /**
                     * Drains the queue.
                     */
                    function u() {
                        var u;
                        for ( i = !0; 0 !== t; ) {
                            t--, u = e[r], e[r] = void 0, r = ( r + 1 ) % n, u();
                        }
                        i = !1;
                    }

                    return {
                        isDraining: function () {
                            return i;
                        },
                        enqueue: function ( o ) {
                            var a;
                            t === n && ( a = i, u(), i = a ), e[( r + t ) % n] = o, t++, i || u();
                        }
                    };
                }();

                // Fiber states.
                var S = 0, // Suspended.
                    F = 1, // Running.
                    M = 2, // Resuming.
                    P = 3, // Running Sync.
                    R = 4, // Running Async.
                    B = 5, // Awaiting finalizers.
                    k = 6; // Killed.

                /**
                 * Fiber interpreter.
                 * @param {Object} n - Either instance (isLeft, fromLeft, fromRight, left, right).
                 * @param {Object} l - Optional supervisor.
                 * @param {D} s - Initial Aff computation.
                 */
                function I( n, l, s ) {
                    var p = 0, // Call stack depth.
                        g = S, // Current state.
                        y = s, // Current computation.
                        C = null, // Current error (if any).
                        N = null, // Current kill signal (if any).
                        L = null, // Current Bind continuation.
                        T = null, // Current Bind continuation stack.
                        x = null, // Current Bracket/Finalizer stack.
                        q = 0, // Number of active brackets.
                        W = 0, // Number of active kill handlers.
                        O = null, // OnComplete handlers.
                        z = !0; // Rethrow flag.

                    /**
                     * Kicks off the fiber execution.
                     * @param {number} s - Call stack depth.
                     */
                    function K( s ) {
                        for ( var W, H, J;;) {
                            W = null, H = null, J = null;
                            switch ( g ) {
                                case M: // Resuming from a Bind.
                                    g = F, y = L( y ), null === T ? L = null : ( L = T._1, T = T._2 );
                                    break;
                                case P: // Handling result of a Sync.
                                    n.isLeft( y )
                                        ? ( g = B, C = y, y = null )
                                        : null === L
                                            ? g = B
                                            : ( g = M, y = n.fromRight( y ) );
                                    break;
                                case F: // Running state.
                                    switch ( y.tag ) {
                                        case o: // Bind.
                                            L && ( T = new D( d, L, T ) ), L = y._2, g = F, y = y._1;
                                            break;
                                        case t: // Pure.
                                            null === L
                                                ? ( g = B, y = n.right( y._1 ) )
                                                : ( g = M, y = y._1 );
                                            break;
                                        case i: // Sync.
                                            g = P, y = A( n.left, n.right, y._1 );
                                            break;
                                        case u: // Async.
                                            return g = R, void ( y = _( n.left, y._1, function ( n ) {
                                                return function () {
                                                    p === s && ( p++, b.enqueue( function () {
                                                        p === s + 1 && ( g = P, y = n, K( p ) );
                                                    } ) );
                                                };
                                            } ) );
                                        case r: // Throw.
                                            g = B, C = n.left( y._1 ), y = null;
                                            break;
                                        case e: // Catch.
                                            x = new D( d, y, null === L ? x : new D( d, new D( m, L, T ), x, N ), N ), L = null, T = null, g = F, y = y._1;
                                            break;
                                        case a: // Bracket.
                                            q++, x = new D( d, y, null === L ? x : new D( d, new D( m, L, T ), x, N ), N ), L = null, T = null, g = F, y = y._1;
                                            break;
                                        case c: // Fork.
                                            g = P, W = I( n, l, y._2 ), l && l.register( W ), y._1 && W.run(), y = n.right( W );
                                            break;
                                        case f: // Sequential.
                                            g = F, y = U( n, l, y._1 );
                                            break;
                                    }
                                    break;
                                case B: // Awaiting finalizers.
                                    if ( L = null, T = null, null === x ) {
                                        g = k, y = N || C || y;
                                    } else {
                                        switch ( W = x._3, J = x._1, x = x._2, J.tag ) {
                                            case e: // Catch handler.
                                                N && N !== W
                                                    ? g = B
                                                    : C && ( g = F, y = J._2( n.fromLeft( C ) ), C = null );
                                                break;
                                            case m: // Resume from a Bind after a Catch.
                                                N && N !== W || C
                                                    ? g = B
                                                    : ( L = J._1, T = J._2, g = M, y = n.fromRight( y ) );
                                                break;
                                            case a: // Bracket finalizer.
                                                q--, null === C && ( H = n.fromRight( y ), x = new D( d, new D( h, J._2, H ), x, W ), ( N === W || q > 0 ) && ( g = F, y = J._3( H ) ) );
                                                break;
                                            case h: // Release (cleanup from Bracket).
                                                q++, x = new D( d, new D( v, y, C ), x, N ), g = F, y = N && N !== W ? J._1.killed( n.fromLeft( N ) )( J._2 ) : C ? J._1.failed( n.fromLeft( C ) )( J._2 ) : J._1.completed( n.fromRight( y ) )( J._2 ), C = null;
                                                break;
                                            case w: // Finalizer.
                                                q++, x = new D( d, new D( v, y, C ), x, N ), g = F, y = J._1;
                                                break;
                                            case v: // Finalized (after a finalizer ran).
                                                q--, g = B, y = J._1, C = J._2;
                                                break;
                                        }
                                    }
                                    break;
                                case k: // Killed state.
                                    for ( var j in O ) {
                                        O.hasOwnProperty( j ) && ( z = z && O[j].rethrow, E( O[j].handler( y ) ) );
                                    }
                                    return O = null, void ( N && C ? setTimeout( function () {
                                        throw n.fromLeft( C );
                                    }, 0 ) : n.isLeft( y ) && z && setTimeout( function () {
                                        if ( z ) {
                                            throw n.fromLeft( y );
                                        }
                                    }, 0 ) );
                                case S: // Suspended state.
                                    g = F;
                                    break;
                                case R: // Running Async, waiting for callback.
                                    return;
                            }
                        }
                    }

                    /**
                     * Registers an onComplete handler for the fiber.
                     * @param {Object} n - Handler object { rethrow, handler }.
                     * @returns {Function} A function to deregister the handler.
                     */
                    function H( n ) {
                        return function () {
                            if ( g === k ) {
                                return z = z && n.rethrow, n.handler( y )(), function () {};
                            }
                            var t = W++;
                            return ( O = O || {} )[t] = n, function () {
                                null !== O && delete O[t];
                            };
                        };
                    }

                    return {
                        kill: function ( t, r ) {
                            return function () {
                                if ( g === k ) {
                                    return r( n.right( void 0 ) )(), function () {};
                                }
                                var e = H( { rethrow: !1, handler: function () {
                                    return r( n.right( void 0 ) );
                                } } )();
                                switch ( g ) {
                                    case S:
                                        N = n.left( t ), g = k, y = N, K( p );
                                        break;
                                    case R:
                                        null === N && ( N = n.left( t ) ), 0 === q && ( g === R && ( x = new D( d, new D( w, y( t ) ), x, N ) ), g = B, y = null, C = null, K( ++p ) );
                                        break;
                                    default:
                                        null === N && ( N = n.left( t ) ), 0 === q && ( g = B, y = null, C = null );
                                }
                                return e;
                            };
                        },
                        join: function ( n ) {
                            return function () {
                                var t = H( { rethrow: !1, handler: n } )();
                                return g === S && K( p ), t;
                            };
                        },
                        onComplete: H,
                        isSuspended: function () {
                            return g === S;
                        },
                        run: function () {
                            g === S && ( b.isDraining() ? K( p ) : b.enqueue( function () {
                                K( p );
                            } ) );
                        }
                    };
                }

                /**
                 * Interprets a ParAff computation.
                 * @param {Object} t - Either instance.
                 * @param {Object} r - Supervisor.
                 * @param {D} e - ParAff computation.
                 * @param {Function} i - Callback function.
                 */
                function N( t, r, e, i ) {
                    var o = 0, // Fiber counter.
                        a = {}, // Map of active fibers.
                        c = 0, // Callback counter.
                        f = {}, // Map of pending callbacks.
                        m = new Error( "[ParAff] Early exit" ), // Early exit error.
                        h = null, // Global error for ParAff.
                        w = n; // Result of the ParAff computation.

                    /**
                     * Kills active fibers.
                     * @param {any} r - Kill reason.
                     * @param {D} e - Current ParAff computation.
                     * @param {Function} i - Callback when all kills are done.
                     * @returns {Object} A map of deregistration functions.
                     */
                    function v( r, e, i ) {
                        var u, o, c = e, f = null, m = null, h = 0, w = {};
                        n: for ( ;; ) {
                            u = null;
                            switch ( c.tag ) {
                                case g: // Forked.
                                    if ( c._3 === n && ( u = a[c._1], w[h++] = u.kill( r, function ( n ) {
                                        return function () {
                                            0 === --h && i( n )();
                                        };
                                    } ) ), null === f ) {
                                        break n;
                                    }
                                    c = f._2, null === m ? f = null : ( f = m._1, m = m._2 );
                                    break;
                                case l: // ParMap.
                                    c = c._2;
                                    break;
                                case s: // ParApply.
                                case p: // ParAlt.
                                    f && ( m = new D( d, f, m ) ), f = c, c = c._1;
                                    break;
                            }
                        }
                        if ( 0 === h ) {
                            i( t.right( void 0 ) )();
                        } else {
                            for ( o = 0, u = h; o < u; o++ ) {
                                w[o] = w[o]();
                            }
                        }
                        return w;
                    }

                    /**
                     * Handles completion of a forked fiber.
                     * @param {D} r - The forked fiber D instance.
                     * @returns {Function} A thunk that processes the fiber result.
                     */
                    function y( r ) {
                        return function ( e ) {
                            return function () {
                                delete a[r._1], r._3 = e;

                                /**
                                 * Recursive function to propagate results up the ParAff tree.
                                 * @param {any} e - The result (Either Left or Right).
                                 * @param {D} u - Current ParAff node.
                                 * @param {D} o - Parent ParAff node.
                                 */
                                function r( e, u, o ) {
                                    var a, d, w, g, D, y;
                                    for ( t.isLeft( e ) ? ( a = e, d = null ) : ( d = e, a = null );; ) {
                                        if ( w = null, g = null, D = null, y = null, null !== h ) {
                                            return;
                                        }
                                        if ( null === u ) {
                                            return void i( a || d )();
                                        }
                                        if ( u._3 !== n ) {
                                            return;
                                        }
                                        switch ( u.tag ) {
                                            case l: // ParMap.
                                                null === a ? ( u._3 = t.right( u._1( t.fromRight( d ) ) ), d = u._3 ) : u._3 = a;
                                                break;
                                            case s: // ParApply.
                                                if ( w = u._1._3, g = u._2._3, a ) {
                                                    if ( u._3 = a, D = !0, y = c++, f[y] = v( m, a === w ? u._2 : u._1, function () {
                                                        return function () {
                                                            delete f[y], D ? D = !1 : null === o ? r( a, null, null ) : r( a, o._1, o._2 );
                                                        };
                                                    } ), D ) {
                                                        return void ( D = !1 );
                                                    }
                                                } else {
                                                    if ( w === n || g === n ) {
                                                        return;
                                                    }
                                                    d = t.right( t.fromRight( w )( t.fromRight( g ) ) ), u._3 = d;
                                                }
                                                break;
                                            case p: // ParAlt.
                                                if ( w = u._1._3, g = u._2._3, w === n && t.isLeft( g ) || g === n && t.isLeft( w ) ) {
                                                    return;
                                                }
                                                if ( w !== n && t.isLeft( w ) && g !== n && t.isLeft( g ) ) {
                                                    a = d === w ? g : w, d = null, u._3 = a;
                                                } else if ( u._3 = d, D = !0, y = c++, f[y] = v( m, d === w ? u._2 : u._1, function () {
                                                    return function () {
                                                        delete f[y], D ? D = !1 : null === o ? r( d, null, null ) : r( d, o._1, o._2 );
                                                    };
                                                } ), D ) {
                                                    return void ( D = !1 );
                                                }
                                                break;
                                        }
                                        null === o ? u = null : ( u = o._1, o = o._2 );
                                    }
                                }
                                r( e, r._2._1, r._2._2 );
                            };
                        };
                    }

                    return function () {
                        var i, u, c = F, f = e, m = null, h = null;
                        n: for ( ;; ) {
                            i = null, u = null;
                            switch ( c ) {
                                case F: // Running state.
                                    switch ( f.tag ) {
                                        case l: // ParMap.
                                            m && ( h = new D( d, m, h ) ), m = new D( l, f._1, n, n ), f = f._2;
                                            break;
                                        case s: // ParApply.
                                            m && ( h = new D( d, m, h ) ), m = new D( s, n, f._2, n ), f = f._1;
                                            break;
                                        case p: // ParAlt.
                                            m && ( h = new D( d, m, h ) ), m = new D( p, n, f._2, n ), f = f._1;
                                            break;
                                        default: // Base Aff computation.
                                            u = o++, c = B, i = f, f = new D( g, u, new D( d, m, h ), n ), ( i = I( t, r, i ) ).onComplete( { rethrow: !1, handler: y( f ) } )(), a[u] = i, r && r.register( i );
                                    }
                                    break;
                                case B: // Awaiting finalizers (in this context, waiting for children to complete).
                                    if ( null === m ) {
                                        break n;
                                    }
                                    m._1 === n ? ( m._1 = f, c = F, f = m._2, m._2 = n ) : ( m._2 = f, f = m, null === h ? m = null : ( m = h._1, h = h._2 ) );
                                    break;
                            }
                        }
                        for ( w = f, u = 0; u < o; u++ ) {
                            a[u].run();
                        }
                    }(), function ( n ) {
                        return new D( u, function ( r ) {
                            return function () {
                                return function ( n, r ) {
                                    var e;
                                    for ( var i in h = t.left( n ), f ) {
                                        if ( f.hasOwnProperty( i ) ) {
                                            for ( i in e = f[i] ) {
                                                e.hasOwnProperty( i ) && e[i]();
                                            }
                                        }
                                    }
                                    f = null;
                                    var o = v( n, w, r );
                                    return function ( n ) {
                                        return new D( u, function ( n ) {
                                            return function () {
                                                for ( var n in o ) {
                                                    o.hasOwnProperty( n ) && o[n]();
                                                }
                                                return C;
                                            };
                                        } );
                                    };
                                }( n, r );
                            };
                        } );
                    };
                }

                /**
                 * Converts a ParAff computation to an Async Aff computation.
                 * @param {Object} n - Either instance.
                 * @param {Object} t - Supervisor.
                 * @param {D} r - ParAff computation.
                 * @returns {D} An Async D instance.
                 */
                function U( n, t, r ) {
                    return new D( u, function ( e ) {
                        return function () {
                            return N( n, t, r, e );
                        };
                    } );
                }

                // Export internal constructors and utilities.
                D.EMPTY = n;
                D.Pure = y( t );
                D.Throw = y( r );
                D.Catch = y( e );
                D.Sync = y( i );
                D.Async = y( u );
                D.Bind = y( o );
                D.Bracket = y( a );
                D.Fork = y( c );
                D.Seq = y( f );
                D.ParMap = y( l );
                D.ParApply = y( s );
                D.ParAlt = y( p );
                D.Fiber = I;
                D.Supervisor = function ( n ) {
                    var t = {}, // Map of fibers.
                        r = 0, // Next fiber ID.
                        e = 0; // Active fiber count.

                    return {
                        register: function ( i ) {
                            var u = r++;
                            i.onComplete( {
                                rethrow: !0,
                                handler: function ( n ) {
                                    return function () {
                                        e--, delete t[u];
                                    };
                                }
                            } ), t[u] = i, e++;
                        },
                        isEmpty: function () {
                            return 0 === e;
                        },
                        killAll: function ( u, o ) {
                            return function () {
                                var a = 0,
                                    c = {};

                                /**
                                 * Kills a single fiber.
                                 * @param {string} r - Fiber ID.
                                 */
                                function f( r ) {
                                    c[r] = t[r].kill( u, function ( t ) {
                                        return function () {
                                            delete c[r], a--, n.isLeft( t ) && n.fromLeft( t ) && setTimeout( function () {
                                                throw n.fromLeft( t );
                                            }, 0 ), 0 === a && o();
                                        };
                                    } )();
                                }

                                for ( var l in t ) {
                                    t.hasOwnProperty( l ) && ( a++, f( l ) );
                                }
                                return t = {}, r = 0, e = 0, function ( n ) {
                                    return new D( i, function () {
                                        for ( var n in c ) {
                                            c.hasOwnProperty( n ) && c[n]();
                                        }
                                    } );
                                };
                            };
                        }
                    };
                }, D.Scheduler = b, D.nonCanceler = C, D;
            }();

            // Module: Effect.Aff (exports)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Effect.Aff"], // Alias for Effect.Aff namespace.
                    r = n["Effect.Aff"], // Self-reference.
                    e = n["Control.Applicative"], // Dependency: Control.Applicative.
                    i = n["Control.Apply"], // Dependency: Control.Apply.
                    u = n["Control.Bind"], // Dependency: Control.Bind.
                    o = n["Control.Monad"], // Dependency: Control.Monad.
                    a = n["Control.Parallel"], // Dependency: Control.Parallel.
                    c = n["Control.Parallel.Class"], // Dependency: Control.Parallel.Class.
                    f = n["Data.Either"], // Dependency: Data.Either.
                    l = n["Data.Foldable"], // Dependency: Data.Foldable.
                    s = n["Data.Function"], // Dependency: Data.Function.
                    p = n["Data.Functor"], // Dependency: Data.Functor.
                    d = n["Data.Monoid"], // Dependency: Data.Monoid.
                    m = n["Data.Semigroup"], // Dependency: Data.Semigroup.
                    h = n["Data.Unit"], // Dependency: Data.Unit.
                    w = n.Effect, // Dependency: Effect.
                    v = n["Effect.Class"], // Dependency: Effect.Class.
                    g = n["Partial.Unsafe"], // Dependency: Partial.Unsafe.
                    D = n["Unsafe.Coerce"], // Dependency: Unsafe.Coerce.

                    // Functor instance for ParAff.
                    y = new p.Functor( r._parAffMap ),

                    // Functor instance for Aff.
                    C = new p.Functor( r._map ),

                    // Either interpretation object for internal Aff use.
                    E = {
                        isLeft: function ( n ) {
                            if ( n instanceof f.Left ) {
                                return !0;
                            }
                            if ( n instanceof f.Right ) {
                                return !1;
                            }
                            throw new Error( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [n.constructor.name] );
                        },
                        fromLeft: function ( n ) {
                            if ( n instanceof f.Left ) {
                                return n.value0;
                            }
                            if ( n instanceof f.Right ) {
                                return g.unsafeCrashWith( "unsafeFromLeft: Right" );
                            }
                            throw new Error( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [n.constructor.name] );
                        },
                        fromRight: function ( n ) {
                            if ( n instanceof f.Right ) {
                                return n.value0;
                            }
                            if ( n instanceof f.Left ) {
                                return g.unsafeCrashWith( "unsafeFromRight: Left" );
                            }
                            throw new Error( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [n.constructor.name] );
                        },
                        left: f.Left.create,
                        right: f.Right.create
                    },

                    // Helper to launch an Aff computation and get a Fiber.
                    A = function ( n ) {
                        return function () {
                            var t = function ( n ) {
                                return r._makeFiber( E, n );
                            }( n )();
                            return t.run(), t;
                        };
                    },

                    // Apply instance for ParAff.
                    _ = new i.Apply( function () {
                        return y;
                    }, r._parAffApply ),

                    // Monad instance for Aff.
                    b = new o.Monad( function () {
                        return M;
                    }, function () {
                        return S;
                    } ),

                    // Bind instance for Aff.
                    S = new u.Bind( function () {
                        return F;
                    }, r._bind ),

                    // Apply instance for Aff.
                    F = new i.Apply( function () {
                        return C;
                    }, o.ap( b ) ),

                    // Applicative instance for Aff.
                    M = new e.Applicative( function () {
                        return F;
                    }, r._pure ),

                    // MonadEffect instance for Aff.
                    P = new v.MonadEffect( function () {
                        return b;
                    }, r._liftEffect ),

                    // Parallel instance for Aff/ParAff.
                    R = new c.Parallel( function () {
                        return B;
                    }, function () {
                        return b;
                    }, D.unsafeCoerce, r._sequential ),

                    // Applicative instance for ParAff.
                    B = new e.Applicative( function () {
                        return _;
                    }, function ( n ) {
                        return c.parallel( R )( e.pure( M )( n ) );
                    } ),

                    // Semigroup instance for Cancelers.
                    k = new m.Semigroup( function ( n ) {
                        return function ( t ) {
                            return function ( r ) {
                                return a.parSequence_( R )( l.foldableArray )( [n( r ), t( r )] );
                            };
                        };
                    } ),

                    // Non-canceler (identity for Cancelers).
                    I = s.const( e.pure( M )( h.unit ) ),

                    // Monoid instance for Cancelers.
                    N = new d.Monoid( function () {
                        return k;
                    }, I );

                // Initialize or retrieve the 'Effect.Aff' namespace.
                n["Effect.Aff"] = n["Effect.Aff"] || {};

                // Export internal implementations (prefixed with underscore).
                n._pure = t.Pure;
                n._map = function ( n ) {
                    return function ( r ) {
                        return r.tag === t.Pure.tag ? t.Pure( n( r._1 ) ) : t.Bind( r, function ( r ) {
                            return t.Pure( n( r ) );
                        } );
                    };
                };
                n._bind = function ( n ) {
                    return function ( r ) {
                        return t.Bind( n, r );
                    };
                };
                n._liftEffect = t.Sync;
                n._parAffMap = function ( n ) {
                    return function ( r ) {
                        return t.ParMap( n, r );
                    };
                };
                n._parAffApply = function ( n ) {
                    return function ( r ) {
                        return t.ParApply( n, r );
                    };
                };
                n.makeAff = t.Async;
                n._makeFiber = function ( n, r ) {
                    return function () {
                        return t.Fiber( n, null, r );
                    };
                };
                n._sequential = t.Seq;

                // Export public API.
                t.launchAff = A;
                t.launchAff_ = function ( n ) {
                    return p.void( w.functorEffect )( A( n ) );
                };
                t.nonCanceler = I;

                // Export instances.
                t.functorAff = C;
                t.applyAff = F;
                t.applicativeAff = M;
                t.bindAff = S;
                t.monadAff = b;
                t.monadEffectAff = P;
                t.functorParAff = y;
                t.applyParAff = _;
                t.applicativeParAff = B;
                t.parallelAff = R;
                t.semigroupCanceler = k;
                t.monoidCanceler = N;
                t.makeAff = r.makeAff;

            }( n ); // Immediately invoked function expression.

            // Module: Effect.Ref (new, read, write)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Effect.Ref' namespace.
                n["Effect.Ref"] = n["Effect.Ref"] || {};

                // Define 'new' (create a new Ref).
                n.new = function ( n ) {
                    return function () {
                        return { value: n };
                    };
                };

                // Define 'read' (read from a Ref).
                n.read = function ( n ) {
                    return function () {
                        return n.value;
                    };
                };

                // Define 'write' (write to a Ref).
                n.write = function ( n ) {
                    return function ( t ) {
                        return function () {
                            return t.value = n, {};
                        };
                    };
                };

            }( n["Effect.Ref"] = n["Effect.Ref"] || {} ); // Immediately invoked function expression.

            // Module: Effect.Ref (re-export)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Effect.Ref"], // Alias for Effect.Ref namespace.
                    r = n["Effect.Ref"]; // Self-reference.

                // Initialize or retrieve the 'Effect.Ref' namespace.
                n["Effect.Ref"] = n["Effect.Ref"] || {};

                // Re-export functions.
                t.new = r.new;
                t.read = r.read;
                t.write = r.write;

            }( n ); // Immediately invoked function expression.

            // Module: Node.Encoding
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Node.Encoding"], // Alias for Node.Encoding namespace.
                    r = n["Data.Show"], // Dependency: Data.Show.

                    // ASCII encoding constructor.
                    e = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // UTF8 encoding constructor.
                    i = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // UTF16LE encoding constructor.
                    u = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // UCS2 encoding constructor.
                    o = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Base64 encoding constructor.
                    a = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Latin1 encoding constructor.
                    c = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Binary encoding constructor.
                    f = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Hex encoding constructor.
                    l = function () {
                        function n() {}
                        return n.value = new n(), n;
                    }(),

                    // Show instance for Encoding.
                    s = new r.Show( function ( n ) {
                        if ( n instanceof e ) {
                            return "ASCII";
                        }
                        if ( n instanceof i ) {
                            return "UTF8";
                        }
                        if ( n instanceof u ) {
                            return "UTF16LE";
                        }
                        if ( n instanceof o ) {
                            return "UCS2";
                        }
                        if ( n instanceof a ) {
                            return "Base64";
                        }
                        if ( n instanceof c ) {
                            return "Latin1";
                        }
                        if ( n instanceof f ) {
                            return "Binary";
                        }
                        if ( n instanceof l ) {
                            return "Hex";
                        }
                        throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [n.constructor.name] );
                    } );

                // Initialize or retrieve the 'Node.Encoding' namespace.
                n["Node.Encoding"] = n["Node.Encoding"] || {};

                // Export encoding constructors.
                t.ASCII = e;
                t.UTF8 = i;
                t.UTF16LE = u;
                t.UCS2 = o;
                t.Base64 = a;
                t.Latin1 = c;
                t.Binary = f;
                t.Hex = l;

                // Define 'encodingToNode' (convert PureScript encoding to Node.js string).
                t.encodingToNode = function ( n ) {
                    if ( n instanceof e ) {
                        return "ascii";
                    }
                    if ( n instanceof i ) {
                        return "utf8";
                    }
                    if ( n instanceof u ) {
                        return "utf16le";
                    }
                    if ( n instanceof o ) {
                        return "ucs2";
                    }
                    if ( n instanceof a ) {
                        return "base64";
                    }
                    if ( n instanceof c ) {
                        return "latin1";
                    }
                    if ( n instanceof f ) {
                        return "binary";
                    }
                    if ( n instanceof l ) {
                        return "hex";
                    }
                    throw new Error( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [n.constructor.name] );
                };

                // Export Show instance for Encoding.
                t.showEncoding = s;

            }( n ); // Immediately invoked function expression.

            // Module: Node.Process (process global)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Node.Process' namespace, then export the global 'process' object.
                ( n["Node.Process"] = n["Node.Process"] || {} ).process = process;
            }(); // Immediately invoked function expression.

            // Module: Node.Process
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Node.Process"], // Alias for Node.Process namespace.
                    r = n["Node.Process"], // Self-reference.
                    e = r.process.stdout, // Node.js stdout stream.
                    i = r.process.stdin; // Node.js stdin stream.

                // Initialize or retrieve the 'Node.Process' namespace.
                n["Node.Process"] = n["Node.Process"] || {};

                // Export stdin and stdout streams.
                t.stdin = i;
                t.stdout = e;

            }( n ); // Immediately invoked function expression.

            // Module: Node.Stream (readChunkImpl, onDataEitherImpl, onEnd, write, writeStringImpl)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Node.Stream' namespace.
                n["Node.Stream"] = n["Node.Stream"] || {};

                // Define 'readChunkImpl' (handles Buffer or string chunks).
                n.readChunkImpl = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            if ( r instanceof Buffer ) {
                                return t( r );
                            }
                            if ( "string" == typeof r ) {
                                return n( r );
                            }
                            throw new Error( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r );
                        };
                    };
                };

                // Define 'onDataEitherImpl' (event listener for 'data' events).
                n.onDataEitherImpl = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return function () {
                                t.on( "data", function ( t ) {
                                    r( n( t ) )();
                                } );
                            };
                        };
                    };
                };

                // Define 'onEnd' (event listener for 'end' events).
                n.onEnd = function ( n ) {
                    return function ( t ) {
                        return function () {
                            n.on( "end", t );
                        };
                    };
                };

                // Define 'write' (write buffer to stream).
                n.write = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return function () {
                                return n.write( t, null, r );
                            };
                        };
                    };
                };

                // Define 'writeStringImpl' (write string to stream with encoding).
                n.writeStringImpl = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return function ( e ) {
                                return function () {
                                    return n.write( r, t, e );
                                };
                            };
                        };
                    };
                };

            }( n["Node.Stream"] = n["Node.Stream"] || {} ); // Immediately invoked function expression.

            // Module: Effect.Exception (error, throwException)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Effect.Exception' namespace.
                n["Effect.Exception"] = n["Effect.Exception"] || {};

                // Define 'error' (create a new Error object).
                n.error = function ( n ) {
                    return new Error( n );
                };

                // Define 'throwException' (throw an exception in Effect).
                n.throwException = function ( n ) {
                    return function () {
                        throw n;
                    };
                };

            }( n["Effect.Exception"] = n["Effect.Exception"] || {} ); // Immediately invoked function expression.

            // Module: Effect.Exception (throw)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Effect.Exception"], // Alias for Effect.Exception namespace.
                    r = n["Effect.Exception"]; // Self-reference.

                // Initialize or retrieve the 'Effect.Exception' namespace.
                n["Effect.Exception"] = n["Effect.Exception"] || {};

                // Define 'throw' (throw a string message as an error).
                t.throw = function ( n ) {
                    return r.throwException( r.error( n ) );
                };

            }( n ); // Immediately invoked function expression.

            // Module: Node.Buffer (toStringImpl)
            !function ( t ) {
                "use strict"; // Enable strict mode.

                // Initialize or retrieve the 'Node.Buffer' namespace, then define 'toStringImpl'.
                ( n["Node.Buffer"] = n["Node.Buffer"] || {} ).toStringImpl = function ( n ) {
                    return function ( t ) {
                        return function () {
                            return t.toString( n );
                        };
                    };
                };
            }(); // Immediately invoked function expression.

            // Module: Node.Buffer (toString)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Node.Buffer"], // Alias for Node.Buffer namespace.
                    r = n["Node.Buffer"], // Self-reference.
                    e = n["Node.Encoding"]; // Dependency: Node.Encoding.

                // Initialize or retrieve the 'Node.Buffer' namespace.
                n["Node.Buffer"] = n["Node.Buffer"] || {};

                // Define 'toString' (convert Buffer to string with encoding).
                t.toString = function ( n ) {
                    return r.toStringImpl( e.encodingToNode( n ) );
                };

            }( n ); // Immediately invoked function expression.

            // Module: Node.Stream
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n["Node.Stream"], // Alias for Node.Stream namespace.
                    r = n["Node.Stream"], // Self-reference.
                    e = n["Control.Applicative"], // Dependency: Control.Applicative.
                    i = n["Control.Bind"], // Dependency: Control.Bind.
                    u = n["Data.Either"], // Dependency: Data.Either.
                    o = n["Data.Show"], // Dependency: Data.Show.
                    a = n.Effect, // Dependency: Effect.
                    c = n["Effect.Exception"], // Dependency: Effect.Exception.
                    f = n["Node.Buffer"], // Dependency: Node.Buffer.
                    l = n["Node.Encoding"], // Dependency: Node.Encoding.

                    // Helper to read a chunk as an Either.
                    s = r.readChunkImpl( u.Left.create )( u.Right.create ),

                    // Helper to attach an onData listener that uses Either.
                    p = function ( n ) {
                        return function ( t ) {
                            return r.onDataEitherImpl( s )( n )( t );
                        };
                    },

                    // Helper to attach an onData listener that expects Right values.
                    d = function ( n ) {
                        return function ( t ) {
                            return p( n )( i.composeKleisliFlipped( a.bindEffect )( t )( function ( n ) {
                                if ( n instanceof u.Left ) {
                                    return c.throw( "Stream encoding should not be set" );
                                }
                                if ( n instanceof u.Right ) {
                                    return e.pure( a.applicativeEffect )( n.value0 );
                                }
                                throw new Error( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [n.constructor.name] );
                            } ) );
                        };
                    };

                // Initialize or retrieve the 'Node.Stream' namespace.
                n["Node.Stream"] = n["Node.Stream"] || {};

                // Export 'onData'.
                t.onData = d;

                // Define 'onDataString'.
                t.onDataString = function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return d( n )( i.composeKleisliFlipped( a.bindEffect )( r )( f.toString( t ) ) );
                        };
                    };
                };

                // Export 'onDataEither'.
                t.onDataEither = p;

                // Define 'writeString'.
                t.writeString = function ( n ) {
                    return function ( t ) {
                        return r.writeStringImpl( n )( o.show( l.showEncoding )( t ) );
                    };
                };

                // Export 'onEnd'.
                t.onEnd = r.onEnd;

            }( n ); // Immediately invoked function expression.

            // Module: ABC100C (Main application logic)
            !function ( n ) {
                "use strict"; // Enable strict mode.

                var t = n.ABC100C, // Alias for ABC100C namespace.
                    r = n["Control.Applicative"], // Dependency: Control.Applicative.
                    e = n["Control.Bind"], // Dependency: Control.Bind.
                    i = n["Control.Category"], // Dependency: Control.Category.
                    u = n["Data.Array"], // Dependency: Data.Array.
                    o = n["Data.Boolean"], // Dependency: Data.Boolean.
                    a = n["Data.Either"], // Dependency: Data.Either.
                    c = n["Data.EuclideanRing"], // Dependency: Data.EuclideanRing.
                    f = n["Data.Foldable"], // Dependency: Data.Foldable.
                    l = n["Data.Functor"], // Dependency: Data.Functor.
                    s = n["Data.Int"], // Dependency: Data.Int.
                    p = n["Data.Maybe"], // Dependency: Data.Maybe.
                    d = n["Data.Monoid"], // Dependency: Data.Monoid.
                    m = n["Data.Show"], // Dependency: Data.Show.
                    h = n["Data.String.Common"], // Dependency: Data.String.Common.
                    w = n["Data.Tuple"], // Dependency: Data.Tuple.
                    v = n["Data.Unit"], // Dependency: Data.Unit.
                    g = n.Effect, // Dependency: Effect.
                    D = n["Effect.Aff"], // Dependency: Effect.Aff.
                    y = n["Effect.Class"], // Dependency: Effect.Class.
                    C = n["Effect.Ref"], // Dependency: Effect.Ref.
                    E = n["Node.Encoding"], // Dependency: Node.Encoding.
                    A = n["Node.Process"], // Dependency: Node.Process.
                    _ = n["Node.Stream"], // Dependency: Node.Stream.
                    b = n["Partial.Unsafe"], // Dependency: Partial.Unsafe.

                    /**
                     * Calculates the number of operations to make all numbers even.
                     * @param {number} n - The number of elements (unused in this specific snippet, likely from a larger context).
                     * @param {Array<number>} n - The array of numbers.
                     * @returns {number} The total number of operations.
                     */
                    S = function ( n ) {
                        return function ( n ) {
                            return f.foldl( f.foldableArray )( function ( n ) {
                                return function ( t ) {
                                    return n + ( r = 0, function ( n ) {
                                        var t, e = r, i = !1;

                                        /**
                                         * Recursive helper to count divisions by 2.
                                         * @param {number} t - Current count.
                                         * @param {number} r - Current number.
                                         * @returns {number} The count.
                                         */
                                        function u( t, r ) {
                                            if ( s.odd( r ) ) {
                                                return i = !0, t; // If odd, stop and return count.
                                            }
                                            if ( o.otherwise ) {
                                                return e = t + 1 | 0, void ( n = c.div( c.euclideanRingInt )( r )( 2 ) ); // If even, increment count and divide by 2.
                                            }
                                            throw new Error( "Failed pattern match at ABC100C (line 71, column 5 - line 73, column 37): " + [t.constructor.name, r.constructor.name] );
                                        }

                                        for ( ; !i; ) {
                                            t = u( e, n ); // Keep calling until odd.
                                        }
                                        return t;
                                    } )( t ) | 0;
                                };
                            } )( 0 )( n );
                        };
                    },

                    /**
                     * Solves the main problem: reads input, parses it, calculates, and returns formatted output.
                     * @param {string} n - The input string from stdin.
                     * @returns {Either<string, string>} An Either containing an error message or the result string.
                     */
                    F = function ( n ) {
                        return a.either( function ( n ) {
                            return b.unsafeCrashWith( n ); // Crash on parsing error.
                        } )( i.identity( i.categoryFn ) )( e.bind( a.bindEither )( a.note( "n as" )( ( ( t = n, 2 === ( o = h.split( "\n" )( h.trim( t ) ) ).length ? e.bind( p.bindMaybe )( s.fromString( o[0] ) )( function ( n ) {
                            var t, e = u.mapMaybe( s.fromString )( ( t = o[1], h.split( " " )( t ) ) );
                            return r.pure( p.applicativeMaybe )( new w.Tuple( n, e ) );
                        } ) : p.Nothing.value ) ) ) )( function ( n ) {
                            // On successful parse, calculate the result and format.
                            return r.pure( a.applicativeEither )( m.show( m.showInt )( S( n.value0 )( n.value1 ) ) + "\n" );
                        } ) );
                        var t, o;
                    },

                    /**
                     * An Aff computation to read all input from stdin.
                     * @returns {Aff<Either<string, string>>} An Aff computation yielding the full input as an Either.
                     */
                    M = D.makeAff( function ( n ) {
                        return function () {
                            // Create a mutable reference to accumulate input.
                            var t = C.new( "" )();

                            // Set up data listener for stdin.
                            _.onDataString( A.stdin )( E.UTF8.value )( function ( n ) {
                                return function () {
                                    var r = C.read( t )(); // Read current content.
                                    return C.write( r + n )( t )(); // Append new data and write back.
                                };
                            } )(),

                                // Set up end listener for stdin.
                                _.onEnd( A.stdin )( function () {
                                    var e = C.read( t )(); // Read final content.
                                    return n( r.pure( a.applicativeEither )( e ) )(); // Resolve Aff with the accumulated input.
                                } )(),

                                // Return a non-canceler for this Aff.
                                d.mempty( D.monoidCanceler );
                        };
                    } ),

                    /**
                     * The main program, which launches the Aff computation.
                     */
                    P = D.launchAff_( e.bind( D.bindAff )( M )( function ( n ) {
                        // After reading input, solve the problem.
                        return e.bind( D.bindAff )( r.pure( D.applicativeAff )( F( n ) ) )( function ( n ) {
                            // After solving, lift the effect of writing to stdout.
                            return y.liftEffect( D.monadEffectAff )( ( t = n, l.void( g.functorEffect )( _.writeString( A.stdout )( E.UTF8.value )( t )( r.pure( g.applicativeEffect )( v.unit ) ) ) ) );
                            var t;
                        } );
                    } ) );

                // Initialize or retrieve the 'ABC100C' namespace.
                n.ABC100C = n.ABC100C || {};

                // Export the main program and the solver function.
                t.main = P;
                t.solve = F;

            }( n ),

                // Run the main program.
                n.ABC100C.main();

        },
        {}
    ],

}, {}, ["Focm"], null );
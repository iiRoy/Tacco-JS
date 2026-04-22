!function (t) {
    // Module cache to store already loaded modules
    var r = {};

    /**
     * The core module loading function.
     * @param {number} e - The module ID.
     * @returns {*} The exports of the loaded module.
     */
    function n(e) {
        // If the module is already in the cache, return its exports immediately.
        if (r[e]) {
            return r[e].exports;
        }

        // Create a new module entry in the cache.
        // Initialize with module ID, loaded status (false), and an empty exports object.
        var o = r[e] = {
            i: e,           // Module identifier
            l: !1,          // Loaded flag (initially false)
            exports: {}     // The exports object for this module
        };

        // Call the module's function, passing module.exports, module, exports, and the require function (n).
        // This populates o.exports.
        t[e].call(o.exports, o, o.exports, n);

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }

    // Store the array of module functions.
    n.m = t;

    // Store the module cache.
    n.c = r;

    /**
     * Define a getter function for a property on an object.
     * Used for compatibility with ES modules.
     * @param {object} t - The object on which to define the property.
     * @param {string} r - The name of the property.
     * @param {function} e - The getter function.
     */
    n.d = function(t, r, e) {
        // Only define if the property does not already exist.
        if (!n.o(t, r)) {
            Object.defineProperty(t, r, {
                enumerable: !0,    // Make the property enumerable
                get: e             // Set the getter function
            });
        }
    };

    /**
     * Define __esModule and Symbol.toStringTag properties on an exports object.
     * This marks the object as an ES module.
     * @param {object} t - The exports object.
     */
    n.r = function(t) {
        // Set Symbol.toStringTag for better object representation.
        if ("undefined" != typeof Symbol && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark as an ES module.
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
    };

    /**
     * Compatibility layer for different module export formats.
     * @param {*} t - The module or its ID.
     * @param {number} r - Flags indicating the export type.
     * @returns {*} The resolved module exports.
     */
    n.t = function(t, r) {
        // Flag 1: If module ID, load it.
        if (1 & r) {
            t = n(t);
        }

        // Flag 8: Return module itself (e.g., for namespace object).
        if (8 & r) {
            return t;
        }

        // Flag 4: If already an ES module object, return it.
        if (4 & r && "object" == typeof t && t && t.__esModule) {
            return t;
        }

        // Create a new object to hold the exports.
        var e = Object.create(null);
        n.r(e); // Mark it as an ES module.

        // Define 'default' property pointing to the module's value.
        Object.defineProperty(e, "default", {
            enumerable: !0,
            value: t
        });

        // Flag 2: If not a string, copy all properties from 't' to 'e'.
        if (2 & r && "string" != typeof t) {
            for (var o in t) {
                n.d(e, o, (function(r) {
                    return t[r];
                }).bind(null, o));
            }
        }
        return e;
    };

    /**
     * Create a getter function for the default export of a module.
     * @param {object} t - The module object.
     * @returns {function} A getter function for the default export.
     */
    n.n = function(t) {
        // If 't' is an ES module, return a getter for 't.default', otherwise 't' itself.
        var r = t && t.__esModule ?
            function() {
                return t.default;
            } :
            function() {
                return t;
            };
        // Define a non-enumerable 'a' getter pointing to the default getter.
        n.d(r, "a", r);
        return r;
    };

    /**
     * Check if an object has a specific property.
     * @param {object} t - The object to check.
     * @param {string} r - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function(t, r) {
        return Object.prototype.hasOwnProperty.call(t, r);
    };

    // Public path for assets (e.g., for dynamic imports).
    n.p = "";

    // Load the entry module (module ID 78).
    n(n.s = 78);
})([
    /* Module 0: Common utility for defining properties on target objects. */
    function(t, r, n) {
        var e = n(8),      // Global object (window / global)
            o = n(50).f,   // Object.getOwnPropertyDescriptor.f
            i = n(16),     // Object.defineProperty (or polyfill)
            u = n(26),     // Define a property (with possible modifications)
            a = n(40),     // Create a non-enumerable property
            c = n(81),     // Copy properties from source to target
            f = n(60);     // Check if a polyfill is forced

        t.exports = function(t, r) {
            var n, s, l, p, v,
                d = t.target,  // Target namespace/object name (e.g., 'Array', 'Math')
                h = t.global,  // Is it a global property?
                g = t.stat;    // Is it a static property (on constructor) or instance (on prototype)?

            // Determine the actual object to modify: global, static on global[d], or prototype.
            if (n = h ? e : g ? e[d] || a(d, {}) : (e[d] || {}).prototype) {
                for (s in r) {
                    p = r[s]; // The new property value or function

                    // Get the descriptor or value of the existing property.
                    l = t.noTargetGet ?
                        (v = o(n, s)) && v.value : // Use descriptor if noTargetGet
                        n[s];                       // Otherwise, directly access

                    // Check if polyfill is forced OR if the existing property is undefined.
                    if (!f(h ? s : d + (g ? "." : "#") + s, t.forced) && void 0 !== l) {
                        // If types are the same, continue to next property (no change needed).
                        if (typeof p == typeof l) {
                            continue;
                        }
                        // If types differ, copy properties (e.g., from native to polyfill).
                        c(p, l);
                    }

                    // If it's a 'sham' polyfill or existing property has 'sham' flag, set 'sham' on new property.
                    (t.sham || (l && l.sham)) && i(p, "sham", !0);

                    // Define the property on the target object.
                    u(n, s, p, t);
                }
            }
        };
    },

    /* Module 1: Assert that a value is an object. */
    function(t, r, n) {
        var e = n(9); // Is a value an object?

        t.exports = function(t) {
            if (!e(t)) {
                throw TypeError(String(t) + " is not an object");
            }
            return t;
        };
    },

    /* Module 2: Check if code is running in 'pure' (non-global) mode. */
    function(t, r) {
        t.exports = !1; // Indicates not in pure mode for core-js
    },

    /* Module 3: Iterate over an iterable. */
    function(t, r, n) {
        var e = n(1),    // Assert object
            o = n(93),   // Check if array-like iterator
            i = n(21),   // ToLength (for array-like)
            u = n(7),    // Function bind helper
            a = n(62),   // Get iterator method
            c = n(97),   // Invoke iterator method and handle stop
            f = function(t, r) {
                this.stopped = t;
                this.result = r;
            };

        // Main iteration function
        (t.exports = function(t, r, n, s, l) {
            var p, v, d, h, g, y, x,
                b = u(r, n, s ? 2 : 1); // Bind the callback function

            if (l) {
                p = t; // If l is true, t is already an iterator
            } else {
                if ("function" != typeof(v = a(t))) { // Get the iterator method
                    throw TypeError("Target is not iterable");
                }
                if (o(v)) { // If it's an array-like iterator
                    for (d = 0, h = i(t.length); h > d; d++) {
                        // Call callback for each element
                        if ((g = s ? b(e(x = t[d])[0], x[1]) : b(t[d])) && g instanceof f) {
                            return g; // Return if iteration stopped
                        }
                    }
                    return new f(!1); // No stop, return not stopped
                }
                p = v.call(t); // Get the actual iterator object
            }

            // Iterate through the iterator
            for (y = p.next; !(x = y.call(p)).done;) {
                // Call callback for each value
                if ("object" == typeof(g = c(p, b, x.value, s)) && g && g instanceof f) {
                    return g; // Return if iteration stopped
                }
            }
            return new f(!1); // No stop, return not stopped
        }).stop = function(t) {
            return new f(!0, t); // Create a stopped iteration result
        };
    },

    /* Module 4: Assert that a value is a function. */
    function(t, r) {
        t.exports = function(t) {
            if ("function" != typeof t) {
                throw TypeError(String(t) + " is not a function");
            }
            return t;
        };
    },

    /* Module 5: Get or create a well-known symbol. */
    function(t, r, n) {
        var e = n(8),     // Global object
            o = n(42),    // Shared data store
            i = n(11),    // HasOwnProperty check
            u = n(43),    // Generate a unique ID for symbols
            a = n(61),    // Check if Symbol is native
            c = n(94),    // Check if Symbol is polyfilled
            f = o("wks"), // Well-known symbols cache
            s = e.Symbol, // Native Symbol constructor
            l = c ? s : s && s.withoutSetter || u; // Symbol constructor to use

        t.exports = function(t) {
            // If symbol is not in cache, create it.
            if (!i(f, t)) {
                // If native Symbol exists and supports 't', use it.
                // Otherwise, generate a new unique ID.
                a && i(s, t) ?
                    f[t] = s[t] :
                    f[t] = l("Symbol." + t);
            }
            return f[t];
        };
    },

    /* Module 6: Get a global variable or a property from a global object. */
    function(t, r, n) {
        var e = n(58), // Global object (window/global)
            o = n(8),  // Global object again (redundant, but from original code)
            i = function(t) {
                return "function" == typeof t ? t : void 0;
            };

        t.exports = function(t, r) {
            // If only one argument, try to find global function 't'.
            // If two arguments, try 'e[t][r]' or 'o[t][r]'.
            return arguments.length < 2 ?
                i(e[t]) || i(o[t]) :
                e[t] && e[t][r] || o[t] && o[t][r];
        };
    },

    /* Module 7: Bind a function to a specific context. */
    function(t, r, n) {
        var e = n(4); // Assert function

        t.exports = function(t, r, n) {
            if (e(t), void 0 === r) {
                return t; // If no context, return original function
            }

            // Return a wrapper function that calls 't' with 'r' as context.
            switch (n) {
                case 0:
                    return function() {
                        return t.call(r);
                    };
                case 1:
                    return function(n) {
                        return t.call(r, n);
                    };
                case 2:
                    return function(n, e) {
                        return t.call(r, n, e);
                    };
                case 3:
                    return function(n, e, o) {
                        return t.call(r, n, e, o);
                    };
            }
            // For other arities, use apply (more generic).
            return function() {
                return t.apply(r, arguments);
            };
        };
    },

    /* Module 8: Get the global object. */
    function(t, r) {
        // Find the global object (browser window, web worker self, Node.js global).
        var n = function(t) {
            return t && t.Math == Math && t;
        };
        t.exports = n("object" == typeof globalThis && globalThis) ||
            n("object" == typeof window && window) ||
            n("object" == typeof self && self) ||
            n("object" == typeof global && global) ||
            Function("return this")(); // Fallback for strict environments
    },

    /* Module 9: Check if a value is an object (non-null and not a function). */
    function(t, r) {
        t.exports = function(t) {
            return "object" == typeof t ? null !== t : "function" == typeof t;
        };
    },

    /* Module 10: Object.defineProperty polyfill / wrapper. */
    function(t, r, n) {
        var e = n(12),  // Feature detection for Object.defineProperty
            o = n(53),  // Check for IE8-style defineProperty bug
            i = n(1),   // Assert object
            u = n(52),  // ToPrimitive (for property keys)
            a = Object.defineProperty; // Native Object.defineProperty

        r.f = e ? a : function(t, r, n) {
            if (i(t), r = u(r, !0), i(n), o) {
                try {
                    return a(t, r, n);
                } catch (t) {
                    // Fallback for IE8 bug
                }
            }
            // If accessor descriptors are used, throw error (not supported).
            if ("get" in n || "set" in n) {
                throw TypeError("Accessors not supported");
            }
            // If 'value' is present, simply assign to property.
            return "value" in n && (t[r] = n.value), t;
        };
    },

    /* Module 11: Object.prototype.hasOwnProperty.call wrapper. */
    function(t, r) {
        var n = {}.hasOwnProperty;
        t.exports = function(t, r) {
            return n.call(t, r);
        };
    },

    /* Module 12: Feature detection for reliable Object.defineProperty. */
    function(t, r, n) {
        var e = n(15); // Try-catch helper

        t.exports = !e((function() {
            // Test if Object.defineProperty works correctly with getters.
            return 7 != Object.defineProperty({}, 1, {
                get: function() {
                    return 7;
                }
            })[1];
        }));
    },

    /* Module 13: Get Map.prototype.entries or polyfill. */
    function(t, r, n) {
        var e = n(2),   // Is core-js in pure mode?
            o = n(36);  // Map.prototype.entries (if not pure)

        t.exports = e ? o : function(t) {
            return Map.prototype.entries.call(t);
        };
    },

    /* Module 14: Get the species constructor for a collection. */
    function(t, r, n) {
        var e = n(1),  // Assert object
            o = n(93), // Check if array-like (unused here, seems like a copy-paste)
            i = n(21), // ToLength (unused here)
            u = n(7),  // Function bind (unused here)
            a = n(62), // Get iterator (unused here)
            c = n(97), // Invoke iterator (unused here)
            f = n(5)("species"); // Well-known symbol 'Symbol.species'

        t.exports = function(t, r) {
            var n,
                u = e(t).constructor; // Get the constructor of the instance

            // If constructor or its Symbol.species property is undefined/null, use fallback 'r'.
            return void 0 === u || null == (n = e(u)[f]) ? r : n(n); // Call the species constructor
        };
    },

    /* Module 15: Utility to safely execute a function and catch errors. */
    function(t, r) {
        t.exports = function(t) {
            try {
                return !!t(); // Execute function, return true if no error, false otherwise.
            } catch (t) {
                return !0; // Return true if an error occurred.
            }
        };
    },

    /* Module 16: Define a non-enumerable property. */
    function(t, r, n) {
        var e = n(12), // Feature detection for Object.defineProperty
            o = n(10), // Object.defineProperty wrapper
            i = n(25); // Create property descriptor

        t.exports = e ? function(t, r, n) {
            // Use Object.defineProperty if available and reliable.
            return o.f(t, r, i(1, n)); // Define as non-enumerable, non-configurable, non-writable
        } : function(t, r, n) {
            // Fallback for environments without reliable defineProperty.
            return t[r] = n, t;
        };
    },

    /* Module 17: WeakMap-based internal state manager. */
    function(t, r, n) {
        var e, o, i,
            u = n(57), // Check for native WeakMap support
            a = n(8),  // Global object
            c = n(9),  // Is object?
            f = n(16), // Define non-enumerable property
            s = n(11), // HasOwnProperty check
            l = n(41), // Get a shared key
            p = n(27), // Hidden keys registry
            v = a.WeakMap; // Native WeakMap constructor

        if (u) {
            var d = new v(), // Create a new WeakMap instance
                h = d.get,   // Store native get method
                g = d.has,   // Store native has method
                y = d.set;   // Store native set method

            // Define functions to interact with the WeakMap.
            e = function(t, r) {
                return y.call(d, t, r), r;
            };
            o = function(t) {
                return h.call(d, t) || {};
            };
            i = function(t) {
                return g.call(d, t);
            };
        } else {
            // Fallback for environments without WeakMap.
            var x = l("state"); // Create a unique key for internal state
            p[x] = !0;          // Mark key as hidden

            // Define functions using direct property access with the hidden key.
            e = function(t, r) {
                return f(t, x, r), r;
            };
            o = function(t) {
                return s(t, x) ? t[x] : {};
            };
            i = function(t) {
                return s(t, x);
            };
        }

        t.exports = {
            set: e,
            get: o,
            has: i,
            // Ensure an object has internal state, creating it if necessary.
            enforce: function(t) {
                return i(t) ? o(t) : e(t, {});
            },
            // Create a getter for a specific type of internal state.
            getterFor: function(t) {
                return function(r) {
                    var n;
                    if (!c(r) || (n = o(r)).type !== t) {
                        throw TypeError("Incompatible receiver, " + t + " required");
                    }
                    return n;
                };
            }
        };
    },

    /* Module 18: Metadata API (proposal). */
    function(t, r, n) {
        var e = n(65),   // Map (for metadata storage)
            o = n(69),   // WeakMap (for metadata storage)
            i = n(42)("metadata"), // Shared metadata storage
            u = i.store || (i.store = new o()), // Global WeakMap for metadata

            // Helper function to get or create a metadata map.
            a = function(t, r, n) {
                var o = u.get(t); // Get metadata map for the object
                if (!o) {
                    if (!n) return; // If not creating, return undefined
                    u.set(t, o = new e()); // Create new Map for the object
                }
                var i = o.get(r); // Get metadata map for the key
                if (!i) {
                    if (!n) return; // If not creating, return undefined
                    o.set(r, i = new e()); // Create new Map for the key
                }
                return i;
            };

        t.exports = {
            store: u,
            getMap: a,
            has: function(t, r, n) {
                var e = a(r, n, !1);
                return void 0 !== e && e.has(t);
            },
            get: function(t, r, n) {
                var e = a(r, n, !1);
                return void 0 === e ? void 0 : e.get(t);
            },
            set: function(t, r, n, e) {
                a(n, e, !0).set(t, r);
            },
            keys: function(t, r) {
                var n = a(t, r, !1),
                    e = [];
                n && n.forEach((function(t, r) {
                    e.push(r);
                }));
                return e;
            },
            toKey: function(t) {
                return void 0 === t || "symbol" == typeof t ? t : String(t);
            }
        };
    },

    /* Module 19: Assert that a value is not null or undefined. */
    function(t, r) {
        t.exports = function(t) {
            if (null == t) {
                throw TypeError("Can't call method on " + t);
            }
            return t;
        };
    },

    /* Module 20: Get Set.prototype.values or polyfill. */
    function(t, r, n) {
        var e = n(2),   // Is core-js in pure mode?
            o = n(36);  // Set.prototype.values (if not pure)

        t.exports = e ? o : function(t) {
            return Set.prototype.values.call(t);
        };
    },

    /* Module 21: Convert value to a valid length (non-negative integer). */
    function(t, r, n) {
        var e = n(28), // ToInteger
            o = Math.min;

        t.exports = function(t) {
            return t > 0 ? o(e(t), 9007199254740991) : 0; // Max safe integer
        };
    },

    /* Module 22: Get the prototype of an object. */
    function(t, r, n) {
        var e = n(11), // HasOwnProperty check
            o = n(29), // ToObject
            i = n(41), // Get a shared key
            u = n(88), // Check for reliable Object.getPrototypeOf
            a = i("IE_PROTO"), // Hidden prototype key for IE
            c = Object.prototype; // Native Object prototype

        t.exports = u ? Object.getPrototypeOf : function(t) {
            t = o(t); // Convert to object
            // If hidden prototype key exists, return its value.
            if (e(t, a)) {
                return t[a];
            }
            // If it's a function, return its prototype.
            if ("function" == typeof t.constructor && t instanceof t.constructor) {
                return t.constructor.prototype;
            }
            // If it's an object, return Object.prototype.
            return t instanceof Object ? c : null;
        };
    },

    /* Module 23: Create an object with a specified prototype. */
    function(t, r, n) {
        var e,
            o = n(1),   // Assert object
            i = n(90),  // Object.defineProperties
            u = n(44),  // List of Object.prototype method names
            a = n(27),  // Hidden keys registry
            c = n(92),  // Document.documentElement for iframe creation
            f = n(54),  // Create an iframe for IE workaround
            s = n(41),  // Get a shared key
            l = s("IE_PROTO"), // Key for internal prototype
            p = function() {}, // Dummy constructor
            v = function(t) {
                return "<script>" + t + "<\/script>"; // Script tag wrapper
            },
            d = function() {
                try {
                    // Try to use ActiveXObject for IE.
                    e = document.domain && new ActiveXObject("htmlfile");
                } catch (t) {
                    /* empty */
                }
                var t, r;
                d = e ?
                    function(t) { // IE-specific workaround
                        t.write(v(""));
                        t.close();
                        var r = t.parentWindow.Object;
                        return t = null, r;
                    }(e) :
                    ((r = f("iframe")).style.display = "none", // Create hidden iframe
                        c.appendChild(r), // Append to document
                        r.src = String("javascript:"), // Set src to javascript:
                        (t = r.contentWindow.document).open(), // Open document
                        t.write(v("document.F=Object")), // Write script to define Object
                        t.close(),
                        t.F); // Get Object constructor from iframe
                for (var n = u.length; n--;) {
                    delete d.prototype[u[n]]; // Remove unwanted properties
                }
                return d();
            };

        a[l] = !0; // Mark internal prototype key as hidden

        t.exports = Object.create || function(t, r) {
            var n;
            if (null !== t) {
                p.prototype = o(t); // Set prototype of dummy constructor
                n = new p();        // Create instance
                p.prototype = null; // Clear prototype
                n[l] = t;           // Store actual prototype
            } else {
                n = d(); // For null prototype, use IE workaround
            }
            return void 0 === r ? n : i(n, r); // If properties provided, define them
        };
    },

    /* Module 24: Get the internal [[Class]] of an object. */
    function(t, r) {
        var n = {}.toString;
        t.exports = function(t) {
            return n.call(t).slice(8, -1); // Extract class name from "[object ClassName]"
        };
    },

    /* Module 25: Create a property descriptor. */
    function(t, r) {
        t.exports = function(t, r) {
            return {
                enumerable: !(1 & t),      // Bit 1: enumerable
                configurable: !(2 & t),    // Bit 2: configurable
                writable: !(4 & t),        // Bit 4: writable
                value: r                   // Property value
            };
        };
    },

    /* Module 26: Define a property on an object, handling different scenarios. */
    function(t, r, n) {
        var e = n(8),   // Global object
            o = n(16),  // Define non-enumerable property
            i = n(11),  // HasOwnProperty check
            u = n(40),  // Create non-enumerable property
            a = n(55),  // Get source code of function
            c = n(17),  // Internal state manager
            f = c.get,  // Get internal state
            s = c.enforce, // Enforce internal state
            l = String(String).split("String"); // Used to identify native function string

        // Main property definition function
        (t.exports = function(t, r, n, a) {
            var c = !!a && !!a.unsafe,      // Unsafe flag
                f = !!a && !!a.enumerable,  // Enumerable flag
                p = !!a && !!a.noTargetGet; // No target get flag

            // If it's a function, store its source in internal state.
            if ("function" == typeof n) {
                // Set 'name' property if not present.
                "string" != typeof r || i(n, "name") || o(n, "name", r);
                s(n).source = l.join("string" == typeof r ? r : "");
            }

            // If target is not the global object.
            if (t !== e) {
                if (c) { // If unsafe, delete existing property if it exists.
                    !p && t[r] && (f = !0);
                    delete t[r];
                } else {
                    delete t[r]; // Always delete existing property if not unsafe.
                }
                f ? t[r] = n : o(t, r, n); // Define property.
            } else {
                f ? t[r] = n : u(r, n); // Define property on global object.
            }
        })(Function.prototype, "toString", (function() {
            // Override Function.prototype.toString to return original source if available.
            return "function" == typeof this && f(this).source || a(this);
        }));
    },

    /* Module 27: Registry for hidden property keys. */
    function(t, r) {
        t.exports = {}; // Empty object to act as a registry
    },

    /* Module 28: Convert value to integer. */
    function(t, r) {
        var n = Math.ceil,
            e = Math.floor;

        t.exports = function(t) {
            return isNaN(t = +t) ? 0 : (t > 0 ? e : n)(t); // Handle NaN and positive/negative
        };
    },

    /* Module 29: Convert value to an object. */
    function(t, r, n) {
        var e = n(19); // Assert not null/undefined

        t.exports = function(t) {
            return Object(e(t)); // Convert to object using Object constructor
        };
    },

    /* Module 30: Registry for iterator prototypes. */
    function(t, r) {
        t.exports = {}; // Empty object to store iterator prototypes
    },

    /* Module 31: Internal state manager with unique IDs for objects. */
    function(t, r, n) {
        var e = n(27),   // Hidden keys registry
            o = n(9),    // Is object?
            i = n(11),   // HasOwnProperty check
            u = n(10).f, // Object.defineProperty.f
            a = n(43),   // Generate unique ID
            c = n(101),  // Check for Object.isExtensible (for IE)
            f = a("meta"), // Unique key for internal metadata
            s = 0,       // Counter for object IDs
            l = Object.isExtensible || function() {
                return !0;
            }, // Check if object is extensible

            // Function to add internal metadata to an object.
            p = function(t) {
                u(t, f, {
                    value: {
                        objectID: "O" + ++s, // Unique object ID
                        weakData: {}         // Weak data storage
                    }
                });
            },
            v = t.exports = {
                REQUIRED: !1, // Flag if this module is required
                // Generate a fast key for an object or primitive.
                fastKey: function(t, r) {
                    if (!o(t)) {
                        return "symbol" == typeof t ? t : ("string" == typeof t ? "S" : "P") + t;
                    }
                    if (!i(t, f)) { // If no metadata, add it.
                        if (!l(t)) return "F"; // Not extensible, cannot add metadata.
                        if (!r) return "E";     // Not creating, return error flag.
                        p(t);
                    }
                    return t[f].objectID; // Return unique object ID.
                },
                // Get weak data for an object.
                getWeakData: function(t, r) {
                    if (!i(t, f)) {
                        if (!l(t)) return !0; // Not extensible, treat as has weak data.
                        if (!r) return !1;    // Not creating, return no weak data.
                        p(t);
                    }
                    return t[f].weakData;
                },
                // Handle objects on freeze (for WeakMap polyfill).
                onFreeze: function(t) {
                    return c && v.REQUIRED && l(t) && !i(t, f) && p(t), t;
                }
            };
        e[f] = !0; // Mark hidden key as used.
    },

    /* Module 32: Assert that an object is an instance of a constructor. */
    function(t, r) {
        t.exports = function(t, r, n) {
            if (!(t instanceof r)) {
                throw TypeError("Incorrect " + (n ? n + " " : "") + "invocation");
            }
            return t;
        };
    },

    /* Module 33: Extend an object with properties from another. */
    function(t, r, n) {
        var e = n(26); // Define property helper

        t.exports = function(t, r, n) {
            for (var o in r) {
                e(t, o, r[o], n);
            }
            return t;
        };
    },

    /* Module 34: Create an iterator constructor. */
    function(t, r, n) {
        "use strict";
        var e = n(67).IteratorPrototype, // Base iterator prototype
            o = n(23),                   // Object.create
            i = n(25),                   // Create property descriptor
            u = n(47),                   // Set toStringTag
            a = n(30),                   // Iterator prototypes registry
            c = function() {
                return this;
            }; // Dummy next method

        t.exports = function(t, r, n) {
            var f = r + " Iterator"; // Iterator name
            // Set prototype of iterator constructor.
            t.prototype = o(e, {
                next: i(1, n)
            });
            u(t, f, !1, !0); // Set toStringTag for the iterator
            a[f] = c;        // Register the iterator
            return t;
        };
    },

    /* Module 35: `deleteAll` method for collections. */
    function(t, r, n) {
        "use strict";
        var e = n(1), // Assert object
            o = n(4); // Assert function

        t.exports = function() {
            // Get the collection instance.
            for (var t, r = e(this), n = o(r.delete), i = !0, u = 0, a = arguments.length; u < a; u++) {
                t = n.call(r, arguments[u]); // Call delete for each argument
                i = i && t; // Track if all deletions were successful
            }
            return !!i; // Return true if all deleted, false otherwise
        };
    },

    /* Module 36: Get an iterator from an object. */
    function(t, r, n) {
        var e = n(1),   // Assert object
            o = n(62);  // Get iterator method

        t.exports = function(t) {
            var r = o(t); // Get the iterator method
            if ("function" != typeof r) {
                throw TypeError(String(t) + " is not iterable");
            }
            return e(r.call(t)); // Call the iterator method and assert result is object
        };
    },

    /* Module 37: `from` method for collections. */
    function(t, r, n) {
        "use strict";
        var e = n(4), // Assert function
            o = n(7), // Function bind helper
            i = n(3); // Iterate helper

        t.exports = function(t) {
            var r, n, u, a,
                c = arguments.length,
                f = c > 1 ? arguments[1] : void 0; // Mapper function

            e(this); // Assert constructor is a function

            r = void 0 !== f; // Is mapper function provided?
            if (r) {
                e(f); // Assert mapper is a function
            }

            // If no iterable is provided, return new empty instance.
            if (null == t) {
                return new this();
            }

            n = []; // Array to store mapped values

            if (r) {
                u = 0;
                a = o(f, c > 2 ? arguments[2] : void 0, 2); // Bind mapper
                i(t, (function(t) {
                    n.push(a(t, u++)); // Map and push
                }));
            } else {
                i(t, n.push, n); // Directly push values
            }

            return new this(n); // Create new instance from collected values
        };
    },

    /* Module 38: `of` method for collections. */
    function(t, r, n) {
        "use strict";
        t.exports = function() {
            for (var t = arguments.length, r = new Array(t); t--;) {
                r[t] = arguments[t]; // Collect all arguments into an array
            }
            return new this(r); // Create new instance from arguments
        };
    },

    /* Module 39: Convert value to object and handle strings as arrays. */
    function(t, r, n) {
        var e = n(51), // ToIndexedObject for string splitting
            o = n(19); // Assert not null/undefined

        t.exports = function(t) {
            return e(o(t)); // Convert to object, handle strings as character arrays
        };
    },

    /* Module 40: Define a non-enumerable property on the global object. */
    function(t, r, n) {
        var e = n(8),   // Global object
            o = n(16);  // Define non-enumerable property

        t.exports = function(t, r) {
            try {
                o(e, t, r); // Try to define property
            } catch (n) {
                e[t] = r; // Fallback to direct assignment
            }
            return r;
        };
    },

    /* Module 41: Get a shared key from the shared data store. */
    function(t, r, n) {
        var e = n(42), // Shared data store
            o = n(43), // Generate unique ID
            i = e("keys"); // Get 'keys' object from shared store

        t.exports = function(t) {
            return i[t] || (i[t] = o(t)); // Return existing key or create new unique one
        };
    },

    /* Module 42: Shared data store utility. */
    function(t, r, n) {
        var e = n(2),   // Is core-js in pure mode?
            o = n(56);  // Shared data store (actual object)

        // Exports a function that gets or creates a named object in the shared store.
        (t.exports = function(t, r) {
            return o[t] || (o[t] = void 0 !== r ? r : {});
        })("versions", []).push({
            version: "3.6.5",
            mode: e ? "pure" : "global",
            copyright: "© 2020 Denis Pushkarev (zloirock.ru)"
        });
    },

    /* Module 43: Generate a unique symbol-like ID string. */
    function(t, r) {
        var n = 0,
            e = Math.random();

        t.exports = function(t) {
            // Generate a unique string combining an optional prefix, counter, and random number.
            return "Symbol(" + String(void 0 === t ? "" : t) + ")_" +
                (++n + e).toString(36);
        };
    },

    /* Module 44: List of standard Object.prototype properties. */
    function(t, r) {
        t.exports = [
            "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable",
            "toLocaleString", "toString", "valueOf"
        ];
    },

    /* Module 45: Set the prototype of an object. */
    function(t, r, n) {
        var e = n(1),   // Assert object
            o = n(89);  // Assert valid prototype

        t.exports = Object.setPrototypeOf || ("__proto__" in {} ?
            function() {
                var t, r = !1,
                    n = {};
                try {
                    // Test if __proto__ setter works reliably.
                    (t = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set).call(n, []);
                    r = n instanceof Array;
                } catch (t) { /* empty */ }
                return function(n, i) {
                    return e(n), o(i), r ? t.call(n, i) : n.__proto__ = i, n;
                };
            }() :
            void 0); // If __proto__ not supported, return undefined
    },

    /* Module 46: Common logic for creating collection classes (Map, Set, WeakMap, WeakSet). */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(8),    // Global object
            i = n(60),   // Check if polyfill is forced
            u = n(26),   // Define property
            a = n(31),   // Internal state manager
            c = n(3),    // Iterate over iterable
            f = n(32),   // Assert instance of constructor
            s = n(9),    // Is object?
            l = n(15),   // Try-catch helper
            p = n(102),  // Check if constructor can be used with iterable
            v = n(47),   // Set toStringTag
            d = n(103);  // Set prototype correctly

        t.exports = function(t, r, n) {
            var h = -1 !== t.indexOf("Map"),     // Is it a Map?
                g = -1 !== t.indexOf("Weak"),    // Is it a WeakMap/WeakSet?
                y = h ? "set" : "add",           // Method name for adding elements
                x = o[t],                        // Native constructor (e.g., Map)
                b = x && x.prototype,            // Native prototype
                m = x,                           // Constructor to use
                w = {},                          // Object to hold new constructor
                S = function(t) {                // Helper to wrap native methods
                    var r = b[t];
                    u(b, t,
                        "add" == t ? function(t) {
                            return r.call(this, 0 === t ? 0 : t), this;
                        } :
                        "delete" == t ? function(t) {
                            return !(g && !s(t)) && r.call(this, 0 === t ? 0 : t);
                        } :
                        "get" == t ? function(t) {
                            return g && !s(t) ? void 0 : r.call(this, 0 === t ? 0 : t);
                        } :
                        "has" == t ? function(t) {
                            return !(g && !s(t)) && r.call(this, 0 === t ? 0 : t);
                        } :
                        function(t, n) {
                            return r.call(this, 0 === t ? 0 : t, n), this;
                        }
                    );
                };

            // If forced polyfill or native constructor is unreliable.
            if (i(t, "function" != typeof x || !(g || (b.forEach && !l((function() {
                (new x()).entries().next();
            })))))) {
                m = n.getConstructor(r, t, h, y); // Get polyfilled constructor
                a.REQUIRED = !0; // Mark internal state as required
            } else if (i(t, !0)) { // If not forced, but still need to patch
                var O = new m(),
                    M = O[y](g ? {} : -0, 1) != O, // Test for chainability (e.g., set returns this)
                    E = l((function() {
                        O.has(1);
                    })), // Test for has method
                    j = p((function(t) {
                        new x(t);
                    })), // Test if constructor accepts iterable
                    A = !g && l((function() { // Test for -0 handling (Map)
                        for (var t = new x(), r = 5; r--;) {
                            t[y](r, r);
                        }
                        return !t.has(-0);
                    }));

                // If constructor doesn't accept iterable, patch it.
                j || ((m = r((function(r, n) {
                    f(r, m, t); // Assert instance
                    var e = d(new x(), r, m); // Set prototype
                    null != n && c(n, e[y], e, h); // Populate from iterable
                    return e;
                }))).prototype = b, b.constructor = m);

                // Patch methods if necessary.
                (E || A) && (S("delete"), S("has"), h && S("get"));
                (A || M) && S(y);
                g && b.clear && delete b.clear; // If WeakMap, remove clear method
            }

            w[t] = m; // Store the final constructor
            e({
                global: !0,
                forced: m != x
            }, w); // Export it globally if different from native
            v(m, t); // Set toStringTag for the constructor
            g || n.setStrong(m, t, h); // Set up iterators for strong collections
            return m;
        };
    },

    /* Module 47: Set the `Symbol.toStringTag` property for an object. */
    function(t, r, n) {
        var e = n(10).f,  // Object.defineProperty.f
            o = n(11),   // HasOwnProperty check
            i = n(5)("toStringTag"); // Symbol.toStringTag

        t.exports = function(t, r, n) {
            // Set Symbol.toStringTag if not already present.
            t && !o(t = n ? t : t.prototype, i) && e(t, i, {
                configurable: !0,
                value: r
            });
        };
    },

    /* Module 48: String charAt and codeAt utilities. */
    function(t, r, n) {
        var e = n(28), // ToInteger
            o = n(19), // Assert not null/undefined
            i = function(t) {
                return function(r, n) {
                    var i, u,
                        a = String(o(r)), // Convert to string
                        c = e(n),         // Convert index to integer
                        f = a.length;     // String length

                    // Handle out-of-bounds index.
                    if (c < 0 || c >= f) {
                        return t ? "" : void 0;
                    }

                    // Get character code at index.
                    i = a.charCodeAt(c);

                    // Handle surrogate pairs for Unicode characters.
                    if (i < 0xD800 || i > 0xDBFF || c + 1 === f ||
                        (u = a.charCodeAt(c + 1)) < 0xDC00 || u > 0xDFFF) {
                        return t ? a.charAt(c) : i; // Return char or code point.
                    }
                    // Return full surrogate pair or combined code point.
                    return t ? a.slice(c, c + 2) : u - 0xDC00 + (i - 0xD800 << 10) + 0x10000;
                };
            };

        t.exports = {
            codeAt: i(!1), // Returns code point
            charAt: i(!0)  // Returns character(s)
        };
    },

    /* Module 49: Define a well-known symbol in the global Symbol object. */
    function(t, r, n) {
        var e = n(58), // Global object (for Symbol)
            o = n(11), // HasOwnProperty check
            i = n(186), // Object.getOwnPropertySymbols.f
            u = n(10).f; // Object.defineProperty.f

        t.exports = function(t) {
            var r = e.Symbol || (e.Symbol = {}); // Get or create global Symbol object
            if (!o(r, t)) {
                u(r, t, {
                    value: i.f(t)
                }); // Define symbol if not present
            }
        };
    },

    /* Module 50: Object.getOwnPropertyDescriptor.f (native or polyfill). */
    function(t, r, n) {
        var e = n(12),  // Feature detection for Object.defineProperty
            o = n(80),  // Object.prototype.propertyIsEnumerable.f
            i = n(25),  // Create property descriptor
            u = n(39),  // ToIndexedObject
            a = n(52),  // ToPrimitive (for property keys)
            c = n(11),  // HasOwnProperty check
            f = n(53),  // Check for IE8 defineProperty bug
            s = Object.getOwnPropertyDescriptor; // Native getOwnPropertyDescriptor

        r.f = e ? s : function(t, r) {
            if (t = u(t), r = a(r, !0), f) {
                try {
                    return s(t, r); // Try native for IE8 bug
                } catch (t) { /* empty */ }
            }
            if (c(t, r)) {
                return i(!o.f.call(t, r), t[r]); // Create descriptor manually
            }
        };
    },

    /* Module 51: Convert value to indexed object (array-like). */
    function(t, r, n) {
        var e = n(15),  // Try-catch helper
            o = n(24),  // Get internal [[Class]]
            i = "".split; // Native String.prototype.split

        // If Object("z")[0] doesn't work (IE), use split.
        t.exports = e((function() {
            return !Object("z").propertyIsEnumerable(0);
        })) ? function(t) {
            return "String" == o(t) ? i.call(t, "") : Object(t); // Split string into chars
        } : Object; // Otherwise, just convert to object
    },

    /* Module 52: Convert value to primitive. */
    function(t, r, n) {
        var e = n(9); // Is object?

        t.exports = function(t, r) {
            if (!e(t)) {
                return t; // If not an object, return as is.
            }

            var n, o;
            // Try toString, then valueOf, then toString again.
            if (r && "function" == typeof(n = t.toString) && !e(o = n.call(t))) {
                return o;
            }
            if ("function" == typeof(n = t.valueOf) && !e(o = n.call(t))) {
                return o;
            }
            if (!r && "function" == typeof(n = t.toString) && !e(o = n.call(t))) {
                return o;
            }
            throw TypeError("Can't convert object to primitive value");
        };
    },

    /* Module 53: Feature detection for IE8 defineProperty bug. */
    function(t, r, n) {
        var e = n(12), // Feature detection for Object.defineProperty
            o = n(15), // Try-catch helper
            i = n(54); // Create an element (for testing)

        // Check if Object.defineProperty works on DOM elements in IE8.
        t.exports = !e && !o((function() {
            return 7 != Object.defineProperty(i("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a;
        }));
    },

    /* Module 54: Create a DOM element. */
    function(t, r, n) {
        var e = n(8),  // Global object
            o = n(9),  // Is object?
            i = e.document, // Document object
            u = o(i) && o(i.createElement); // Check if document and createElement exist

        t.exports = function(t) {
            return u ? i.createElement(t) : {}; // Create element or return empty object
        };
    },

    /* Module 55: Get the source code of a function. */
    function(t, r, n) {
        var e = n(56), // Shared data store
            o = Function.toString; // Native Function.prototype.toString

        // Store inspectSource function in shared data store if not present.
        if ("function" != typeof e.inspectSource) {
            e.inspectSource = function(t) {
                return o.call(t);
            };
        }
        t.exports = e.inspectSource;
    },

    /* Module 56: Global shared data store. */
    function(t, r, n) {
        var e = n(8),   // Global object
            o = n(40),  // Create non-enumerable property
            i = e["__core-js_shared__"] || o("__core-js_shared__", {}); // Get or create shared object

        t.exports = i;
    },

    /* Module 57: Feature detection for native WeakMap. */
    function(t, r, n) {
        var e = n(8),   // Global object
            o = n(55),  // Get function source
            i = e.WeakMap; // Native WeakMap constructor

        // Check if WeakMap is available and its source code indicates it's native.
        t.exports = "function" == typeof i && /native code/.test(o(i));
    },

    /* Module 58: Another reference to the global object. */
    function(t, r) {
        t.exports = (function() {
            return this;
        })();
    },

    /* Module 59: Get enumerable property names of an object. */
    function(t, r, n) {
        var e = n(11), // HasOwnProperty check
            o = n(39), // ToIndexedObject
            i = n(84).indexOf, // Array.prototype.indexOf (or polyfill)
            u = n(27); // Hidden keys registry

        t.exports = function(t, r) {
            var n,
                a = o(t), // Convert to indexed object
                c = 0,
                f = []; // Array to store enumerable property names

            // Iterate over all properties (including inherited ones).
            for (n in a) {
                // If not a hidden key and is an own property, add to list.
                !e(u, n) && e(a, n) && f.push(n);
            }

            // Add properties from 'r' that are not already in 'f'.
            for (; r.length > c;) {
                e(a, n = r[c++]) && (~i(f, n) || f.push(n));
            }
            return f;
        };
    },

    /* Module 60: Check if a polyfill is forced for a given feature. */
    function(t, r, n) {
        var e = n(15), // Try-catch helper
            o = /#|\.prototype\./, // Regex to parse feature path
            // Main function to check if a feature needs to be polyfilled.
            i = function(t, r) {
                var n = a[u(t)]; // Get status from cache
                return n == f || n != c && ("function" == typeof r ? e(r) : !!r);
            },
            // Normalize feature name (e.g., 'Array.prototype.map' -> 'array.map').
            u = i.normalize = function(t) {
                return String(t).replace(o, ".").toLowerCase();
            },
            a = i.data = {},  // Cache for feature status
            c = i.NATIVE = "N", // Status: Native
            f = i.POLYFILL = "P"; // Status: Polyfill

        t.exports = i;
    },

    /* Module 61: Feature detection for native Symbol. */
    function(t, r, n) {
        var e = n(15); // Try-catch helper

        // Check if Object.getOwnPropertySymbols is available and works,
        // and if String(Symbol()) doesn't throw (indicating proper Symbol implementation).
        t.exports = !!Object.getOwnPropertySymbols && !e((function() {
            return !String(Symbol());
        }));
    },

    /* Module 62: Get the iterator method from an object. */
    function(t, r, n) {
        var e = n(95), // Get internal [[Class]] (or toStringTag)
            o = n(30), // Iterator prototypes registry
            i = n(5)("iterator"); // Symbol.iterator

        t.exports = function(t) {
            // Return Symbol.iterator, @@iterator, or a registered iterator.
            if (null != t) {
                return t[i] || t["@@iterator"] || o[e(t)];
            }
        };
    },

    /* Module 63: Add a property to the `Symbol.unscopables` list. */
    function(t, r, n) {
        var e = n(5),   // Get well-known symbol
            o = n(23),  // Object.create
            i = n(10),  // Object.defineProperty wrapper
            u = e("unscopables"), // Symbol.unscopables
            a = Array.prototype; // Array prototype

        // If Symbol.unscopables not defined on Array.prototype, define it.
        if (null == a[u]) {
            i.f(a, u, {
                configurable: !0,
                value: o(null)
            });
        }
        t.exports = function(t) {
            a[u][t] = !0; // Mark property as unscopable
        };
    },

    /* Module 64: Composite keys utility (for Map/WeakMap/Set polyfills). */
    function(t, r, n) {
        var e = n(65), // Map (for primitives)
            o = n(69), // WeakMap (for objects)
            i = n(23), // Object.create
            u = n(9),  // Is object?

            // CompositeKey class to manage hierarchical keys.
            a = function() {
                this.object = null;
                this.symbol = null;
                this.primitives = null;
                this.objectsByIndex = i(null);
            };

        a.prototype.get = function(t, r) {
            return this[t] || (this[t] = r());
        };

        a.prototype.next = function(t, r, n) {
            var i = n ? this.objectsByIndex[t] || (this.objectsByIndex[t] = new o()) : this.primitives || (this.primitives = new e()),
                u = i.get(r);
            return u || i.set(r, u = new a()), u;
        };

        var c = new a(); // Root composite key instance

        t.exports = function() {
            var t, r,
                n = c,
                e = arguments.length;

            // Iterate through arguments, handling objects first.
            for (t = 0; t < e; t++) {
                u(r = arguments[t]) && (n = n.next(t, r, !0));
            }

            // Special case for Object as key (not allowed).
            if (this === Object && n === c) {
                throw TypeError("Composite keys must contain a non-primitive component");
            }

            // Iterate again, handling primitives.
            for (t = 0; t < e; t++) {
                u(r = arguments[t]) || (n = n.next(t, r, !1));
            }

            return n;
        };
    },

    /* Module 65: Map constructor (polyfill). */
    function(t, r, n) {
        "use strict";
        var e = n(46), // Collection polyfill helper
            o = n(66); // Map-specific collection logic

        t.exports = e("Map", (function(t) {
            return function() {
                return t(this, arguments.length ? arguments[0] : void 0);
            };
        }), o);
    },

    /* Module 66: Map/Set specific collection logic. */
    function(t, r, n) {
        "use strict";
        var e = n(10).f,   // Object.defineProperty.f
            o = n(23),    // Object.create
            i = n(33),    // Extend object with properties
            u = n(7),     // Bind function
            a = n(32),    // Assert instance
            c = n(3),     // Iterate over iterable
            f = n(104),   // Create iterator
            s = n(68),    // Set Symbol.species
            l = n(12),    // Feature detection for Object.defineProperty
            p = n(31).fastKey, // Generate fast key
            v = n(17),    // Internal state manager
            d = v.set,    // Set internal state
            h = v.getterFor; // Get internal state getter

        t.exports = {
            // Get the constructor for Map or Set.
            getConstructor: function(t, r, n, f) {
                var s = t((function(t, e) {
                        a(t, s, r); // Assert instance
                        d(t, { // Set internal state
                            type: r,
                            index: o(null), // For fast key lookup
                            first: void 0,
                            last: void 0,
                            size: 0
                        });
                        l || (t.size = 0); // Polyfill 'size' property
                        null != e && c(e, t[f], t, n); // Populate from iterable
                    })),
                    v = h(r), // Getter for internal state
                    g = function(t, r, n) { // Helper to add/set elements
                        var e, o,
                            i = v(t),
                            u = y(t, r); // Find existing entry

                        if (u) {
                            u.value = n; // Update value if exists
                        } else {
                            // Create new entry and link it in the list.
                            i.last = u = {
                                index: o = p(r, !0), // Generate fast key
                                key: r,
                                value: n,
                                previous: e = i.last,
                                next: void 0,
                                removed: !1
                            };
                            i.first || (i.first = u); // Set first if it's the first entry
                            e && (e.next = u); // Link previous entry
                            l ? i.size++ : t.size++; // Increment size
                            "F" !== o && (i.index[o] = u); // Store in index for fast lookup
                        }
                        return t;
                    },
                    y = function(t, r) { // Helper to find an entry by key
                        var n,
                            e = v(t),
                            o = p(r); // Get fast key

                        if ("F" !== o) {
                            return e.index[o]; // Fast lookup
                        }

                        // Linear scan if no fast key.
                        for (n = e.first; n; n = n.next) {
                            if (n.key == r) {
                                return n;
                            }
                        }
                    };

                // Define prototype methods.
                i(s.prototype, {
                    clear: function() {
                        for (var t = v(this), r = t.index, n = t.first; n;) {
                            n.removed = !0; // Mark as removed
                            n.previous && (n.previous = n.previous.next = void 0); // Unlink
                            delete r[n.index]; // Remove from index
                            n = n.next;
                        }
                        t.first = t.last = void 0; // Reset list
                        l ? t.size = 0 : this.size = 0; // Reset size
                    },
                    delete: function(t) {
                        var r = v(this),
                            n = y(this, t); // Find entry
                        if (n) {
                            var e = n.next,
                                o = n.previous;
                            delete r.index[n.index]; // Remove from index
                            n.removed = !0; // Mark as removed
                            o && (o.next = e); // Relink
                            e && (e.previous = o);
                            r.first == n && (r.first = e); // Update first/last
                            r.last == n && (r.last = o);
                            l ? r.size-- : this.size--; // Decrement size
                        }
                        return !!n; // Return true if deleted
                    },
                    forEach: function(t) {
                        for (var r, n = v(this), e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); r = r ? r.next : n.first;) {
                            for (e(r.value, r.key, this); r && r.removed;) {
                                r = r.previous; // Skip removed entries
                            }
                        }
                    },
                    has: function(t) {
                        return !!y(this, t); // Check if entry exists
                    }
                });

                // Define Map-specific methods (get, set) or Set-specific (add).
                i(s.prototype, n ? {
                    get: function(t) {
                        var r = y(this, t);
                        return r && r.value;
                    },
                    set: function(t, r) {
                        return g(this, 0 === t ? 0 : t, r);
                    }
                } : {
                    add: function(t) {
                        return g(this, t = 0 === t ? 0 : t, t);
                    }
                });

                // Define 'size' getter if Object.defineProperty is reliable.
                l && e(s.prototype, "size", {
                    get: function() {
                        return v(this).size;
                    }
                });

                return s;
            },

            // Set up iterators for strong collections (Map, Set).
            setStrong: function(t, r, n) {
                var e = r + " Iterator",
                    o = h(r),
                    i = h(e);

                f(t, r, (function(t, r) {
                    d(this, {
                        type: e,
                        target: t,
                        state: o(t),
                        kind: r,
                        last: void 0
                    });
                }), (function() {
                    for (var t = i(this), r = t.kind, n = t.last; n && n.removed;) {
                        n = n.previous; // Skip removed entries
                    }
                    if (t.target && (t.last = n = n ? n.next : t.state.first)) {
                        return "keys" == r ? {
                            value: n.key,
                            done: !1
                        } : "values" == r ? {
                            value: n.value,
                            done: !1
                        } : {
                            value: [n.key, n.value],
                            done: !1
                        };
                    }
                    t.target = void 0; // Mark iterator as done
                    return {
                        value: void 0,
                        done: !0
                    };
                }), n ? "entries" : "values", !n, !0);
                s(r); // Set Symbol.species
            }
        };
    },

    /* Module 67: IteratorPrototype and Safari iterator bug detection. */
    function(t, r, n) {
        "use strict";
        var e, o, i,
            u = n(22), // Get prototype of object
            a = n(16), // Define non-enumerable property
            c = n(11), // HasOwnProperty check
            f = n(5),  // Get well-known symbol
            s = n(2),  // Is core-js in pure mode?
            l = f("iterator"), // Symbol.iterator
            p = !1;    // Safari iterator bug flag

        // Check for Safari iterator bug.
        [].keys && ("next" in (i = [].keys()) ?
            (o = u(u(i))) !== Object.prototype && (e = o) :
            p = !0);

        // Fallback if IteratorPrototype is not found or buggy.
        null == e && (e = {});
        s || c(e, l) || a(e, l, (function() {
            return this;
        }));

        t.exports = {
            IteratorPrototype: e,
            BUGGY_SAFARI_ITERATORS: p
        };
    },

    /* Module 68: Set `Symbol.species` on a constructor. */
    function(t, r, n) {
        "use strict";
        var e = n(6),   // Get global variable
            o = n(10),  // Object.defineProperty wrapper
            i = n(5),   // Get well-known symbol
            u = n(12),  // Feature detection for Object.defineProperty
            a = i("species"); // Symbol.species

        t.exports = function(t) {
            var r = e(t), // Get the constructor
                n = o.f;  // Object.defineProperty.f

            // If Object.defineProperty is reliable and species is not defined, define it.
            if (u && r && !r[a]) {
                n(r, a, {
                    configurable: !0,
                    get: function() {
                        return this;
                    }
                });
            }
        };
    },

    /* Module 69: WeakMap constructor (polyfill). */
    function(t, r, n) {
        "use strict";
        var e,
            o = n(8),    // Global object
            i = n(33),   // Extend object with properties
            u = n(31),   // Internal state manager
            a = n(46),   // Collection polyfill helper
            c = n(105),  // WeakMap specific collection logic
            f = n(9),    // Is object?
            s = n(17).enforce, // Enforce internal state
            l = n(57),   // Check for native WeakMap
            p = !o.ActiveXObject && "ActiveXObject" in o, // Check for ActiveX (IE)
            v = Object.isExtensible, // Native Object.isExtensible
            d = function(t) {
                return function() {
                    return t(this, arguments.length ? arguments[0] : void 0);
                };
            },
            h = t.exports = a("WeakMap", d, c); // Polyfilled WeakMap constructor

        // If native WeakMap exists but ActiveXObject is detected (IE), patch it.
        if (l && p) {
            e = c.getConstructor(d, "WeakMap", !0); // Get polyfilled constructor for internal use
            u.REQUIRED = !0; // Mark internal state as required

            var g = h.prototype,
                y = g.delete,
                x = g.has,
                b = g.get,
                m = g.set;

            // Patch WeakMap methods to handle frozen objects (IE bug).
            i(g, {
                delete: function(t) {
                    if (f(t) && !v(t)) {
                        var r = s(this);
                        return r.frozen || (r.frozen = new e()), y.call(this, t) || r.frozen.delete(t);
                    }
                    return y.call(this, t);
                },
                has: function(t) {
                    if (f(t) && !v(t)) {
                        var r = s(this);
                        return r.frozen || (r.frozen = new e()), x.call(this, t) || r.frozen.has(t);
                    }
                    return x.call(this, t);
                },
                get: function(t) {
                    if (f(t) && !v(t)) {
                        var r = s(this);
                        return r.frozen || (r.frozen = new e()), x.call(this, t) ? b.call(this, t) : r.frozen.get(t);
                    }
                    return b.call(this, t);
                },
                set: function(t, r) {
                    if (f(t) && !v(t)) {
                        var n = s(this);
                        n.frozen || (n.frozen = new e()), x.call(this, t) ? m.call(this, t, r) : n.frozen.set(t, r);
                    } else {
                        m.call(this, t, r);
                    }
                    return this;
                }
            });
        }
    },

    /* Module 70: Math.scale polyfill. */
    function(t, r) {
        t.exports = Math.scale || function(t, r, n, e, o) {
            // Check for NaN or missing arguments.
            if (0 === arguments.length || t != t || r != r || n != n || e != e || o != o) {
                return NaN;
            }
            // Handle infinity.
            if (t === 1 / 0 || t === -1 / 0) {
                return t;
            }
            // Scale 't' from range [r, n] to [e, o].
            return (t - r) * (o - e) / (n - r) + e;
        };
    },

    /* Module 71: Whitespace characters string. */
    function(t, r) {
        t.exports = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";
    },

    /* Module 72: Promise capability factory. */
    function(t, r, n) {
        "use strict";
        var e = n(4), // Assert function
            o = function(t) {
                var r, n;
                // Create a new Promise, storing its resolve and reject functions.
                this.promise = new t((function(t, e) {
                    if (void 0 !== r || void 0 !== n) {
                        throw TypeError("Bad Promise constructor");
                    }
                    r = t, n = e;
                }));
                this.resolve = e(r); // Assert resolve is a function
                this.reject = e(n);  // Assert reject is a function
            };
        t.exports.f = function(t) {
            return new o(t);
        };
    },

    /* Module 73: Utility to safely execute a function and capture its result or error. */
    function(t, r) {
        t.exports = function(t) {
            try {
                return {
                    error: !1,
                    value: t()
                }; // Return value if successful
            } catch (t) {
                return {
                    error: !0,
                    value: t
                }; // Return error if failed
            }
        };
    },

    /* Module 74: `addAll` method for collections. */
    function(t, r, n) {
        "use strict";
        var e = n(1), // Assert object
            o = n(4); // Assert function

        t.exports = function() {
            for (var t = e(this), r = o(t.add), n = 0, i = arguments.length; n < i; n++) {
                r.call(t, arguments[n]); // Call 'add' for each argument
            }
            return t;
        };
    },

    /* Module 75: Check if a value is a RegExp object. */
    function(t, r, n) {
        var e = n(9),   // Is object?
            o = n(24),  // Get internal [[Class]]
            i = n(5)("match"); // Symbol.match

        t.exports = function(t) {
            var r;
            // Check if object and has Symbol.match property, or if it's a RegExp instance.
            return e(t) && (void 0 !== (r = t[i]) ? !!r : "RegExp" == o(t));
        };
    },

    /* Module 76: Get RegExp flags. */
    function(t, r) {
        "use strict";
        var e = n(1); // Assert object

        t.exports = function() {
            var t = e(this),
                r = "";
            // Concatenate flags based on properties.
            t.global && (r += "g");
            t.ignoreCase && (r += "i");
            t.multiline && (r += "m");
            t.dotAll && (r += "s");
            t.unicode && (r += "u");
            t.sticky && (r += "y");
            return r;
        };
    },

    /* Module 77: Node.js 'fs' module. */
    function(t, r) {
        t.exports = require("fs");
    },

    /* Module 78: Entry point module. */
    function(t, r, n) {
        "use strict";
        n.r(r); // Mark as ES module

        // Import various core-js polyfills.
        n(79), n(87), n(98), n(99), n(100), n(109), n(110), n(111), n(112), n(113), n(114), n(115), n(116), n(117), n(119), n(120), n(121), n(122), n(123), n(124), n(125), n(126), n(127), n(128), n(129), n(130), n(131), n(134), n(135), n(136), n(137), n(138), n(139), n(140), n(142), n(143), n(144), n(147), n(149), n(150), n(151), n(152), n(153), n(154), n(156), n(157), n(158), n(159), n(160), n(161), n(162), n(163), n(164), n(165), n(166), n(167), n(168), n(169), n(170), n(171), n(172), n(173), n(174), n(175), n(176), n(177), n(178), n(179), n(180), n(181), n(184), n(185), n(187), n(188), n(189), n(190), n(191), n(192), n(193), n(194), n(195);

        var e = n(77); // Import Node.js 'fs' module

        // Immediately-invoked function expression for main logic.
        (t => {
            // Trim input, split by space, and parse values.
            const r = t.trim().split(" ");
            // Calculate BigInt product.
            const n = BigInt(r[0]) * BigInt(Math.floor(100 * parseFloat(r[1])));

            // Print result: 0 if less than 100n, otherwise the string representation without last two digits.
            console.log(n < 100n ? 0 : n.toString().slice(0, -2));
        })(e.readFileSync("/dev/stdin", "utf8")); // Read input from stdin
    },

    /* Module 79: Math.hypot polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = Math.hypot, // Native Math.hypot
            i = Math.abs,   // Math.abs
            u = Math.sqrt;  // Math.sqrt

        e({
            target: "Math",
            stat: !0,
            forced: !!o && o(1 / 0, NaN) !== 1 / 0
        }, {
            hypot: function(t, r) {
                for (var n, e, o = 0, a = 0, c = arguments.length, f = 0; a < c;) {
                    // Find the maximum absolute value among arguments.
                    if (f < (n = i(arguments[a++]))) {
                        o = o * (e = f / n) * e + 1;
                        f = n;
                    } else {
                        o += n > 0 ? (e = n / f) * e : n;
                    }
                }
                // Handle infinity and calculate hypotenuse.
                return f === 1 / 0 ? 1 / 0 : f * u(o);
            }
        });
    },

    /* Module 80: Object.prototype.propertyIsEnumerable.f (native or polyfill). */
    function(t, r, n) {
        "use strict";
        var e = {}.propertyIsEnumerable, // Native propertyIsEnumerable
            o = Object.getOwnPropertyDescriptor, // Native getOwnPropertyDescriptor
            i = o && !e.call({
                1: 2
            }, 1); // Test for IE specific bug

        r.f = i ? function(t) {
            var r = o(this, t);
            return !!r && r.enumerable; // Check descriptor for enumerable flag
        } : e; // Use native if no bug
    },

    /* Module 81: Copy properties from source to target. */
    function(t, r, n) {
        var e = n(11), // HasOwnProperty check
            o = n(82), // Get own property names and symbols
            i = n(50), // Object.getOwnPropertyDescriptor.f
            u = n(10); // Object.defineProperty.f

        t.exports = function(t, r) {
            for (var n = o(r), a = u.f, c = i.f, f = 0; f < n.length; f++) {
                var s = n[f];
                // Copy property if not already present on target.
                if (!e(t, s)) {
                    a(t, s, c(r, s));
                }
            }
        };
    },

    /* Module 82: Get own property names and symbols of an object. */
    function(t, r, n) {
        var e = n(6),   // Get global variable (Reflect)
            o = n(83),  // Object.getOwnPropertyNames.f
            i = n(86),  // Object.getOwnPropertySymbols.f
            u = n(1);   // Assert object

        // Use Reflect.ownKeys if available, otherwise combine names and symbols.
        t.exports = e("Reflect", "ownKeys") || function(t) {
            var r = o.f(u(t)), // Get property names
                n = i.f;       // Get property symbols
            return n ? r.concat(n(t)) : r; // Concatenate if symbols exist
        };
    },

    /* Module 83: Object.getOwnPropertyNames.f (native or polyfill). */
    function(t, r, n) {
        var e = n(59), // Get enumerable property names
            o = n(44).concat("length", "prototype"); // Properties to exclude

        r.f = Object.getOwnPropertyNames || function(t) {
            return e(t, o); // Filter out unwanted properties
        };
    },

    /* Module 84: Array.prototype.includes and indexOf polyfill. */
    function(t, r, n) {
        var e = n(39), // ToIndexedObject
            o = n(21), // ToLength
            i = n(85), // ToAbsoluteIndex

            // Helper function for includes/indexOf.
            u = function(t) {
                return function(r, n, u) {
                    var a,
                        c = e(r), // Convert to indexed object
                        f = o(c.length), // Get length
                        s = i(u, f);     // Get absolute start index

                    if (t && n != n) { // If 'includes' and value is NaN
                        for (; f > s;) {
                            if ((a = c[s++]) != a) {
                                return !0; // Found NaN
                            }
                        }
                    } else { // Standard includes/indexOf
                        for (; f > s; s++) {
                            if ((t || s in c) && c[s] === n) {
                                return t || s || 0; // Return true or index
                            }
                        }
                    }
                    return !t && -1; // Return false or -1
                };
            };

        t.exports = {
            includes: u(!0),  // For Array.prototype.includes
            indexOf: u(!1)    // For Array.prototype.indexOf
        };
    },

    /* Module 85: Convert index to absolute index within a length. */
    function(t, r, n) {
        var e = n(28), // ToInteger
            o = Math.max,
            i = Math.min;

        t.exports = function(t, r) {
            var n = e(t); // Convert to integer
            return n < 0 ? o(n + r, 0) : i(n, r); // Adjust for negative index
        };
    },

    /* Module 86: Object.getOwnPropertySymbols.f (native). */
    function(t, r) {
        r.f = Object.getOwnPropertySymbols; // Native function
    },

    /* Module 87: AggregateError polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(12),  // Feature detection for Object.defineProperty
            i = n(22),  // Get prototype of object
            u = n(45),  // Set prototype of object
            a = n(23),  // Object.create
            c = n(10),  // Object.defineProperty wrapper
            f = n(25),  // Create property descriptor
            s = n(3),   // Iterate over iterable
            l = n(16),  // Define non-enumerable property
            p = n(17),  // Internal state manager
            v = p.set,  // Set internal state
            d = p.getterFor("AggregateError"), // Getter for AggregateError state

            // AggregateError constructor.
            h = function(t, r) {
                var n = this;
                if (!(n instanceof h)) {
                    return new h(t, r);
                }
                // If prototype setting is available, set Error as prototype.
                u && (n = u(new Error(r), i(n)));
                var e = [];
                s(t, e.push, e); // Collect errors from iterable
                // Store errors internally.
                o ? v(n, {
                    errors: e,
                    type: "AggregateError"
                }) : n.errors = e;
                void 0 !== r && l(n, "message", String(r)); // Set message if provided
                return n;
            };

        // Set up prototype and properties.
        h.prototype = a(Error.prototype, {
            constructor: f(5, h),
            message: f(5, ""),
            name: f(5, "AggregateError")
        });

        // Define 'errors' getter if Object.defineProperty is reliable.
        o && c.f(h.prototype, "errors", {
            get: function() {
                return d(this).errors;
            },
            configurable: !0
        });

        // Export AggregateError globally.
        e({
            global: !0
        }, {
            AggregateError: h
        });
    },

    /* Module 88: Feature detection for reliable Object.getPrototypeOf. */
    function(t, r, n) {
        var e = n(15); // Try-catch helper

        // Check if Object.getPrototypeOf works correctly with objects that have null constructors.
        t.exports = !e((function() {
            function t() {}
            return t.prototype.constructor = null, Object.getPrototypeOf(new t()) !== t.prototype;
        }));
    },

    /* Module 89: Assert that a value is a valid object prototype. */
    function(t, r, n) {
        var e = n(9); // Is object?

        t.exports = function(t) {
            if (!e(t) && null !== t) {
                throw TypeError("Can't set " + String(t) + " as a prototype");
            }
            return t;
        };
    },

    /* Module 90: Object.defineProperties (native or polyfill). */
    function(t, r, n) {
        var e = n(12), // Feature detection for Object.defineProperty
            o = n(10), // Object.defineProperty wrapper
            i = n(1),  // Assert object
            u = n(91); // Object.keys (or polyfill)

        t.exports = e ? Object.defineProperties : function(t, r) {
            i(t); // Assert target is an object
            for (var n, e = u(r), a = e.length, c = 0; a > c;) {
                o.f(t, n = e[c++], r[n]); // Define each property
            }
            return t;
        };
    },

    /* Module 91: Object.keys (native or polyfill). */
    function(t, r, n) {
        var e = n(59), // Get enumerable property names
            o = n(44); // Properties to exclude

        t.exports = Object.keys || function(t) {
            return e(t, o); // Filter out unwanted properties
        };
    },

    /* Module 92: Document.documentElement (for iframe creation). */
    function(t, r, n) {
        var e = n(6); // Get global variable (document)

        t.exports = e("document", "documentElement"); // Get document.documentElement
    },

    /* Module 93: Check if a value is an Array iterator. */
    function(t, r, n) {
        var e = n(5),   // Get well-known symbol
            o = n(30),  // Iterator prototypes registry
            i = e("iterator"), // Symbol.iterator
            u = Array.prototype; // Array prototype

        // Check if value is array-like or has Array.prototype's iterator.
        t.exports = function(t) {
            return void 0 !== t && (o.Array === t || u[i] === t);
        };
    },

    /* Module 94: Feature detection for Symbol.sham. */
    function(t, r, n) {
        var e = n(61); // Check for native Symbol

        // Check if Symbol is native and supports Symbol.sham.
        t.exports = e && !Symbol.sham && "symbol" == typeof Symbol.iterator;
    },

    /* Module 95: Get the internal [[Class]] or `Symbol.toStringTag`. */
    function(t, r, n) {
        var e = n(96), // Check for reliable Symbol.toStringTag
            o = n(24), // Get internal [[Class]]
            i = n(5)("toStringTag"), // Symbol.toStringTag
            u = "Arguments" == o(function() {
                return arguments;
            }()); // Check for Arguments object

        // If Symbol.toStringTag is reliable, use it, otherwise fallback to [[Class]].
        t.exports = e ? o : function(t) {
            var r, n, e;
            // Handle null/undefined.
            if (void 0 === t) {
                return "Undefined";
            }
            if (null === t) {
                return "Null";
            }
            // Try to get Symbol.toStringTag.
            return "string" == typeof(n = function(t, r) {
                try {
                    return t[r];
                } catch (t) { /* empty */ }
            }(r = Object(t), i)) ? n : u ? o(r) : "Object" == (e = o(r)) && "function" == typeof r.callee ? "Arguments" : e;
        };
    },

    /* Module 96: Feature detection for reliable Symbol.toStringTag. */
    function(t, r) {
        var n = {};
        n[n(5)("toStringTag")] = "z"; // Set Symbol.toStringTag to 'z'
        t.exports = "[object z]" === String(n); // Check if toString produces "[object z]"
    },

    /* Module 97: Invoke iterator method and handle stop. */
    function(t, r, n) {
        var e = n(1); // Assert object

        t.exports = function(t, r, n, o) {
            try {
                // Call the callback function with either [key, value] or just value.
                return o ? r(e(n)[0], n[1]) : r(n);
            } catch (r) {
                var i = t.return; // Get the return method of the iterator.
                throw void 0 !== i && e(i.call(t)), r; // Call return method if present.
            }
        };
    },

    /* Module 98: Array.prototype.lastIndex polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(12), // Feature detection for Object.defineProperty
            o = n(63), // Add to Symbol.unscopables
            i = n(29), // ToObject
            u = n(21), // ToLength
            a = n(10).f; // Object.defineProperty.f

        // If Object.defineProperty is reliable and 'lastIndex' is not defined.
        if (e && !("lastIndex" in [])) {
            a(Array.prototype, "lastIndex", {
                configurable: !0,
                get: function() {
                    var t = i(this),
                        r = u(t.length);
                    return 0 == r ? 0 : r - 1; // Return last valid index.
                }
            });
            o("lastIndex"); // Add to Symbol.unscopables.
        }
    },

    /* Module 99: Array.prototype.lastItem polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(12), // Feature detection for Object.defineProperty
            o = n(63), // Add to Symbol.unscopables
            i = n(29), // ToObject
            u = n(21), // ToLength
            a = n(10).f; // Object.defineProperty.f

        // If Object.defineProperty is reliable and 'lastItem' is not defined.
        if (e && !("lastItem" in [])) {
            a(Array.prototype, "lastItem", {
                configurable: !0,
                get: function() {
                    var t = i(this),
                        r = u(t.length);
                    return 0 == r ? void 0 : t[r - 1]; // Return last element.
                },
                set: function(t) {
                    var r = i(this),
                        n = u(r.length);
                    return r[0 == n ? 0 : n - 1] = t; // Set last element.
                }
            });
            o("lastItem"); // Add to Symbol.unscopables.
        }
    },

    /* Module 100: Math.compositeKey polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(64),  // Composite keys utility
            i = n(6),   // Get global variable (Object)
            a = function() {
                var t = i("Object", "freeze"); // Get native Object.freeze
                return t ? t(n(23)(null)) : n(23)(null); // Freeze an empty object
            };

        e({
            global: !0
        }, {
            compositeKey: function() {
                return o.apply(Object, arguments).get("object", a); // Get composite key for an object
            }
        });
    },

    /* Module 101: Feature detection for Object.isExtensible. */
    function(t, r, n) {
        var e = n(15); // Try-catch helper

        // Check if Object.isExtensible works correctly with frozen objects.
        t.exports = !e((function() {
            return Object.isExtensible(Object.preventExtensions({}));
        }));
    },

    /* Module 102: Check if a constructor accepts an iterable. */
    function(t, r, n) {
        var e = n(5),   // Get well-known symbol
            o = !1;     // Buggy iterator flag

        try {
            var i = 0,
                u = {
                    next: function() {
                        return {
                            done: !!i++
                        };
                    },
                    return: function() {
                        o = !0;
                    }
                };
            u[e("iterator")] = function() {
                return this;
            };
            Array.from(u, (function() {
                throw 2;
            })); // Test with Array.from
        } catch (t) { /* empty */ }

        t.exports = function(t, r) {
            if (!r && !o) {
                return !1; // Not buggy, and not forced to test
            }
            var n = !1;
            try {
                var i = {};
                i[e("iterator")] = function() {
                    return {
                        next: function() {
                            return {
                                done: n = !0
                            };
                        }
                    };
                };
                t(i); // Call constructor with test iterable
            } catch (t) { /* empty */ }
            return n; // Return true if iterator was consumed
        };
    },

    /* Module 103: Set prototype for an object (for collection polyfills). */
    function(t, r, n) {
        var e = n(9),   // Is object?
            o = n(45);  // Set prototype

        t.exports = function(t, r, n) {
            var i, u;
            // If prototype setting is available and constructor differs.
            return o && "function" == typeof(i = r.constructor) && i !== n &&
                e(u = i.prototype) && u !== n.prototype && o(t, u), t;
        };
    },

    /* Module 104: Create an iterator for a collection. */
    function(t, r, n) {
        "use strict";
        var e = n(33),   // Extend object with properties
            o = n(31).getWeakData, // Get weak data
            i = n(1),    // Assert object
            u = n(9),    // Is object?
            a = n(32),   // Assert instance
            c = n(3),    // Iterate over iterable
            f = n(106),  // Array helper functions
            s = n(11),   // HasOwnProperty check
            l = n(17),   // Internal state manager
            p = l.set,   // Set internal state
            v = l.getterFor, // Get internal state getter
            d = f.find,  // Array.prototype.find
            h = f.findIndex, // Array.prototype.findIndex
            g = 0,       // Counter for weak map IDs

            // Weak data storage for non-extensible objects.
            y = function(t) {
                return t.frozen || (t.frozen = new x());
            },
            x = function() {
                this.entries = [];
            },
            b = function(t, r) {
                return d(t.entries, (function(t) {
                    return t[0] === r;
                }));
            };

        // Weak data storage prototype methods.
        x.prototype = {
            get: function(t) {
                var r = b(this, t);
                if (r) return r[1];
            },
            has: function(t) {
                return !!b(this, t);
            },
            set: function(t, r) {
                var n = b(this, t);
                n ? n[1] = r : this.entries.push([t, r]);
            },
            delete: function(t) {
                var r = h(this.entries, (function(r) {
                    return r[0] === t;
                }));
                return ~r && this.entries.splice(r, 1), !!~r;
            }
        };

        t.exports = {
            // Get the constructor for WeakMap or WeakSet.
            getConstructor: function(t, r, n, f) {
                var l = t((function(t, e) {
                        a(t, l, r); // Assert instance
                        p(t, { // Set internal state
                            type: r,
                            id: g++,
                            frozen: void 0
                        });
                        null != e && c(e, t[f], t, n); // Populate from iterable
                    })),
                    d = v(r), // Getter for internal state
                    h = function(t, r, n) { // Helper to add/set elements
                        var e = d(t),
                            u = o(i(r), !0); // Get weak data for the key

                        // If weak data is true (non-extensible), use frozen map.
                        return !0 === u ? y(e).set(r, n) : u[e.id] = n, t;
                    };

                // Define prototype methods.
                e(l.prototype, {
                    delete: function(t) {
                        var r = d(this);
                        if (!u(t)) return !1; // If not an object, cannot be in WeakMap/WeakSet
                        var n = o(t);
                        return !0 === n ? y(r).delete(t) : n && s(n, r.id) && delete n[r.id];
                    },
                    has: function(t) {
                        var r = d(this);
                        if (!u(t)) return !1;
                        var n = o(t);
                        return !0 === n ? y(r).has(t) : n && s(n, r.id);
                    }
                });

                // Define WeakMap-specific methods (get, set) or WeakSet-specific (add).
                e(l.prototype, n ? {
                    get: function(t) {
                        var r = d(this);
                        if (u(t)) {
                            var n = o(t);
                            return !0 === n ? y(r).get(t) : n ? n[r.id] : void 0;
                        }
                    },
                    set: function(t, r) {
                        return h(this, t, r);
                    }
                } : {
                    add: function(t) {
                        return h(this, t, !0);
                    }
                });
                return l;
            }
        };
    },

    /* Module 105: WeakMap/WeakSet specific collection logic. */
    function(t, r, n) {
        "use strict";
        var e = n(33), // Extend object with properties
            o = n(31).getWeakData, // Get weak data
            i = n(1),  // Assert object
            u = n(9),  // Is object?
            a = n(32), // Assert instance
            c = n(3),  // Iterate over iterable
            f = n(106), // Array helper functions
            s = n(11), // HasOwnProperty check
            l = n(17), // Internal state manager
            p = l.set, // Set internal state
            v = l.getterFor, // Get internal state getter
            d = f.find, // Array.prototype.find
            h = f.findIndex, // Array.prototype.findIndex
            g = 0,     // Counter for weak map IDs

            // Weak data storage for non-extensible objects.
            y = function(t) {
                return t.frozen || (t.frozen = new x());
            },
            x = function() {
                this.entries = [];
            },
            b = function(t, r) {
                return d(t.entries, (function(t) {
                    return t[0] === r;
                }));
            };

        // Weak data storage prototype methods.
        x.prototype = {
            get: function(t) {
                var r = b(this, t);
                if (r) {
                    return r[1];
                }
            },
            has: function(t) {
                return !!b(this, t);
            },
            set: function(t, r) {
                var n = b(this, t);
                n ? n[1] = r : this.entries.push([t, r]);
            },
            delete: function(t) {
                var r = h(this.entries, (function(r) {
                    return r[0] === t;
                }));
                return ~r && this.entries.splice(r, 1), !!~r;
            }
        };

        t.exports = {
            // Get the constructor for WeakMap or WeakSet.
            getConstructor: function(t, r, n, f) {
                var l = t((function(t, e) {
                        a(t, l, r); // Assert instance
                        p(t, { // Set internal state
                            type: r,
                            id: g++,
                            frozen: void 0
                        });
                        null != e && c(e, t[f], t, n); // Populate from iterable
                    })),
                    d = v(r), // Getter for internal state
                    h = function(t, r, n) { // Helper to add/set elements
                        var e = d(t),
                            u = o(i(r), !0); // Get weak data for the key

                        // If weak data is true (non-extensible), use frozen map.
                        return !0 === u ? y(e).set(r, n) : u[e.id] = n, t;
                    };

                // Define prototype methods.
                e(l.prototype, {
                    delete: function(t) {
                        var r = d(this);
                        if (!u(t)) {
                            return !1;
                        }
                        var n = o(t);
                        return !0 === n ? y(r).delete(t) : n && s(n, r.id) && delete n[r.id];
                    },
                    has: function(t) {
                        var r = d(this);
                        if (!u(t)) {
                            return !1;
                        }
                        var n = o(t);
                        return !0 === n ? y(r).has(t) : n && s(n, r.id);
                    }
                });

                // Define WeakMap-specific methods (get, set) or WeakSet-specific (add).
                e(l.prototype, n ? {
                    get: function(t) {
                        var r = d(this);
                        if (u(t)) {
                            var n = o(t);
                            return !0 === n ? y(r).get(t) : n ? n[r.id] : void 0;
                        }
                    },
                    set: function(t, r) {
                        return h(this, t, r);
                    }
                } : {
                    add: function(t) {
                        return h(this, t, !0);
                    }
                });
                return l;
            }
        };
    },

    /* Module 106: Array helper functions (forEach, map, filter, etc.). */
    function(t, r, n) {
        var e = n(7),   // Function bind helper
            o = n(51),  // ToIndexedObject
            i = n(29),  // ToObject
            u = n(21),  // ToLength
            a = n(107), // Array species constructor
            c = [].push, // Native Array.prototype.push

            // Helper for array iteration methods.
            f = function(t) {
                var r = 1 == t, // Is it map?
                    n = 2 == t, // Is it filter?
                    f = 3 == t, // Is it some?
                    s = 4 == t, // Is it every?
                    l = 6 == t, // Is it findIndex?
                    p = 5 == t || l; // Is it find or findIndex?

                return function(v, d, h, g) {
                    for (var y, x,
                            b = i(v), // Convert to object
                            m = o(b), // Convert to indexed object
                            w = e(d, h, 3), // Bind callback function
                            S = u(m.length), // Get length
                            O = 0,
                            M = g || a, // Array constructor to use
                            E = r ? M(v, S) : n ? M(v, 0) : void 0; // Result array for map/filter

                        S > O; O++) {
                        if ((p || O in m) && (x = w(y = m[O], O, b), t)) {
                            if (r) {
                                E[O] = x;
                            } else if (x) {
                                switch (t) {
                                    case 3:
                                        return !0; // some
                                    case 5:
                                        return y; // find
                                    case 6:
                                        return O; // findIndex
                                    case 2:
                                        c.call(E, y); // filter
                                }
                            } else if (s) {
                                return !1; // every
                            }
                        }
                    }
                    return l ? -1 : f || s ? s : E; // Return result based on method type
                };
            };

        t.exports = {
            forEach: f(0),
            map: f(1),
            filter: f(2),
            some: f(3),
            every: f(4),
            find: f(5),
            findIndex: f(6)
        };
    },

    /* Module 107: Array species constructor for creating new arrays. */
    function(t, r, n) {
        var e = n(9),   // Is object?
            o = n(108), // Is Array?
            i = n(5)("species"); // Symbol.species

        t.exports = function(t, r) {
            var n;
            // If it's an Array and its constructor has a Symbol.species property.
            return o(t) && ("function" != typeof(n = t.constructor) || n !== Array && !o(n.prototype) ?
                e(n) && null === (n = n[i]) && (n = void 0) :
                n = void 0),
                new(void 0 === n ? Array : n)(0 === r ? 0 : r); // Create new array using species constructor
        };
    },

    /* Module 108: Array.isArray polyfill. */
    function(t, r, n) {
        var e = n(24); // Get internal [[Class]]

        t.exports = Array.isArray || function(t) {
            return "Array" == e(t); // Check if [[Class]] is 'Array'
        };
    },

    /* Module 109: Math.compositeSymbol polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(64),  // Composite keys utility
            i = n(6);   // Get global variable (Symbol)

        e({
            global: !0
        }, {
            compositeSymbol: function() {
                // If single string argument, use Symbol.for.
                return 1 === arguments.length && "string" == typeof arguments[0] ?
                    i("Symbol").for(arguments[0]) :
                    o.apply(null, arguments).get("symbol", i("Symbol")); // Get composite symbol
            }
        });
    },

    /* Module 110: Map.prototype.deleteAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(35);  // deleteAll utility

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            deleteAll: function() {
                return i.apply(this, arguments); // Call generic deleteAll
            }
        });
    },

    /* Module 111: Map.prototype.every polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(13),  // Get Map entries iterator
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            every: function(t) {
                var r = i(this), // Get Map instance
                    n = a(r),    // Get Map entries iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and call callback for each entry.
                return !c(n, (function(t, n) {
                    if (!e(n, t, r)) {
                        return c.stop(); // Stop if callback returns false
                    }
                }), void 0, !0, !0).stopped; // Check if iteration stopped
            }
        });
    },

    /* Module 112: Map.prototype.filter polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Map)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(7),   // Bind function
            f = n(14),  // Get species constructor
            s = n(13),  // Get Map entries iterator
            l = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            filter: function(t) {
                var r = u(this), // Get Map instance
                    n = s(r),    // Get Map entries iterator
                    e = c(t, arguments.length > 1 ? arguments[1] : void 0, 3), // Bind callback
                    o = new(f(r, i("Map")))(), // Create new Map using species constructor
                    p = a(o.set); // Get new Map's set method

                // Iterate and add entries that pass the filter.
                return l(n, (function(t, n) {
                    e(n, t, r) && p.call(o, t, n);
                }), void 0, !0, !0), o; // Return the new filtered Map
            }
        });
    },

    /* Module 113: Map.prototype.find polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(13),  // Get Map entries iterator
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            find: function(t) {
                var r = i(this), // Get Map instance
                    n = a(r),    // Get Map entries iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and return value of the first entry that passes the test.
                return c(n, (function(t, n) {
                    if (e(n, t, r)) {
                        return c.stop(n); // Stop and return the value
                    }
                }), void 0, !0, !0).result; // Get the result of the stopped iteration
            }
        });
    },

    /* Module 114: Map.prototype.findKey polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(13),  // Get Map entries iterator
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            findKey: function(t) {
                var r = i(this), // Get Map instance
                    n = a(r),    // Get Map entries iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and return key of the first entry that passes the test.
                return c(n, (function(t, n) {
                    if (e(n, t, r)) {
                        return c.stop(t); // Stop and return the key
                    }
                }), void 0, !0, !0).result; // Get the result of the stopped iteration
            }
        });
    },

    /* Module 115: Map.from polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Map",
            stat: !0
        }, {
            from: n(37) // Use generic `from` utility
        });
    },

    /* Module 116: Map.groupBy polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(3),   // Iterate helper
            i = n(4);   // Assert function

        e({
            target: "Map",
            stat: !0
        }, {
            groupBy: function(t, r) {
                var n = new this(); // Create new Map instance
                i(r);               // Assert callback is a function

                var e = i(n.has),   // Get 'has' method of the new Map
                    u = i(n.get),   // Get 'get' method
                    a = i(n.set);   // Get 'set' method

                // Iterate over iterable and group elements.
                return o(t, (function(t) {
                    var o = r(t); // Get key from callback
                    e.call(n, o) ? u.call(n, o).push(t) : a.call(n, o, [t]); // Group into arrays
                })), n; // Return the grouped Map
            }
        });
    },

    /* Module 117: Map.prototype.includes polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(13),  // Get Map entries iterator
            a = n(118), // SameValueZero comparison
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            includes: function(t) {
                // Iterate over Map entries and check if any value is SameValueZero as 't'.
                return c(u(i(this)), (function(r, n) {
                    if (a(n, t)) {
                        return c.stop(); // Stop if found
                    }
                }), void 0, !0, !0).stopped; // Return true if stopped (found)
            }
        });
    },

    /* Module 118: SameValueZero comparison algorithm. */
    function(t, r) {
        t.exports = function(t, r) {
            return t === r || t != t && r != r; // SameValueZero: NaN === NaN
        };
    },

    /* Module 119: Map.keyBy polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(3),   // Iterate helper
            i = n(4);   // Assert function

        e({
            target: "Map",
            stat: !0
        }, {
            keyBy: function(t, r) {
                var n = new this(); // Create new Map instance
                i(r);               // Assert callback is a function

                var e = i(n.set);   // Get 'set' method of the new Map

                // Iterate over iterable and key elements.
                return o(t, (function(t) {
                    e.call(n, r(t), t); // Set key based on callback, value is the element
                })), n; // Return the keyed Map
            }
        });
    },

    /* Module 120: Map.prototype.keyOf polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(13),  // Get Map entries iterator
            a = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            keyOf: function(t) {
                // Iterate over Map entries and return the key whose value is 't'.
                return a(u(i(this)), (function(r, n) {
                    if (n === t) {
                        return a.stop(r); // Stop and return the key
                    }
                }), void 0, !0, !0).result; // Get the result of the stopped iteration
            }
        });
    },

    /* Module 121: Map.prototype.mapKeys polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Map)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(7),   // Bind function
            f = n(14),  // Get species constructor
            s = n(13),  // Get Map entries iterator
            l = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            mapKeys: function(t) {
                var r = u(this), // Get Map instance
                    n = s(r),    // Get Map entries iterator
                    e = c(t, arguments.length > 1 ? arguments[1] : void 0, 3), // Bind callback
                    o = new(f(r, i("Map")))(), // Create new Map using species constructor
                    p = a(o.set); // Get new Map's set method

                // Iterate and add entries with mapped keys.
                return l(n, (function(t, n) {
                    p.call(o, e(n, t, r), n); // Call set with new key and original value
                }), void 0, !0, !0), o; // Return the new Map
            }
        });
    },

    /* Module 122: Map.prototype.mapValues polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Map)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(7),   // Bind function
            f = n(14),  // Get species constructor
            s = n(13),  // Get Map entries iterator
            l = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            mapValues: function(t) {
                var r = u(this), // Get Map instance
                    n = s(r),    // Get Map entries iterator
                    e = c(t, arguments.length > 1 ? arguments[1] : void 0, 3), // Bind callback
                    o = new(f(r, i("Map")))(), // Create new Map using species constructor
                    p = a(o.set); // Get new Map's set method

                // Iterate and add entries with mapped values.
                return l(n, (function(t, n) {
                    p.call(o, t, e(n, t, r)); // Call set with original key and new value
                }), void 0, !0, !0), o; // Return the new Map
            }
        });
    },

    /* Module 123: Map.prototype.merge polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4),   // Assert function
            a = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            merge: function(t) {
                for (var r = i(this), n = u(r.set), e = 0; e < arguments.length;) {
                    a(arguments[e++], n, r, !0); // Iterate over each iterable argument and add to Map
                }
                return r; // Return the merged Map
            }
        });
    },

    /* Module 124: Map.of polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Map",
            stat: !0
        }, {
            of: n(38) // Use generic `of` utility
        });
    },

    /* Module 125: Map.prototype.reduce polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4),   // Assert function
            a = n(13),  // Get Map entries iterator
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            reduce: function(t) {
                var r = i(this), // Get Map instance
                    n = a(r),    // Get Map entries iterator
                    e = arguments.length < 2, // Check if initial value provided
                    o = e ? void 0 : arguments[1]; // Initial value

                u(t); // Assert callback is a function

                // Iterate and reduce Map entries.
                c(n, (function(n, i) {
                    e ? (e = !1, o = i) : o = t(o, i, n, r); // Apply reducer
                }), void 0, !0, !0);

                if (e) {
                    throw TypeError("Reduce of empty map with no initial value"); // Error if empty and no initial value
                }
                return o; // Return the reduced value
            }
        });
    },

    /* Module 126: Map.prototype.some polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(13),  // Get Map entries iterator
            c = n(3);   // Iterate helper

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            some: function(t) {
                var r = i(this), // Get Map instance
                    n = a(r),    // Get Map entries iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and check if any entry passes the test.
                return c(n, (function(t, n) {
                    if (e(n, t, r)) {
                        return c.stop(); // Stop if found
                    }
                }), void 0, !0, !0).stopped; // Return true if stopped (found)
            }
        });
    },

    /* Module 127: Map.prototype.update polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4);   // Assert function

        e({
            target: "Map",
            proto: !0,
            real: !0,
            forced: o
        }, {
            update: function(t, r) {
                var n = i(this), // Get Map instance
                    e = arguments.length;
                u(r); // Assert update function is a function

                var o = n.has(t); // Check if key exists
                if (!o && e < 3) {
                    throw TypeError("Updating absent value"); // Error if key not found and no initial value
                }

                // Get current value or initial value, then apply update function.
                var a = o ? n.get(t) : u(e > 2 ? arguments[2] : void 0)(t, n);
                return n.set(t, r(a, t, n)), n; // Set updated value
            }
        });
    },

    /* Module 128: Math.clamp polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = Math.min,
            i = Math.max;

        e({
            target: "Math",
            stat: !0
        }, {
            clamp: function(t, r, n) {
                return o(n, i(r, t)); // Clamp value 't' between 'r' and 'n'
            }
        });
    },

    /* Module 129: Math.DEG_PER_RAD constant. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            DEG_PER_RAD: Math.PI / 180
        });
    },

    /* Module 130: Math.degrees polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = 180 / Math.PI;

        e({
            target: "Math",
            stat: !0
        }, {
            degrees: function(t) {
                return t * o; // Convert radians to degrees
            }
        });
    },

    /* Module 131: Math.fscale polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(70),  // Math.scale polyfill
            i = n(132); // Math.fround polyfill

        e({
            target: "Math",
            stat: !0
        }, {
            fscale: function(t, r, n, e, u) {
                return i(o(t, r, n, e, u)); // Apply Math.fround after scaling
            }
        });
    },

    /* Module 132: Math.fround polyfill. */
    function(t, r, n) {
        var e = n(133), // Math.sign polyfill
            o = Math.abs,
            i = Math.pow,
            u = i(2, -52), // Smallest representable value
            a = i(2, -23), // Smallest representable value for float32
            c = i(2, 127) * (2 - a), // Max float32 value
            f = i(2, -126); // Min float32 value

        t.exports = Math.fround || function(t) {
            var r, n,
                i = o(t), // Absolute value
                s = e(t); // Sign of t

            // Handle subnormal numbers.
            if (i < f) {
                return s * (i / f / a + 1 / u - 1 / u) * f * a;
            }
            // Round to nearest float32.
            n = (r = (1 + a / u) * i) - (r - i);
            // Handle infinity and NaN.
            return n > c || n != n ? s * (1 / 0) : s * n;
        };
    },

    /* Module 133: Math.sign polyfill. */
    function(t, r) {
        t.exports = Math.sign || function(t) {
            return 0 == (t = +t) || t != t ? t : t < 0 ? -1 : 1; // Return -1, 0, 1, or NaN
        };
    },

    /* Module 134: Math.iaddh polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            iaddh: function(t, r, n, e) {
                var o = t >>> 0,
                    i = n >>> 0;
                // Add high parts of 64-bit integers.
                return (r >>> 0) + (e >>> 0) + ((o & i | (o | i) & ~(o + i >>> 0)) >>> 31) | 0;
            }
        });
    },

    /* Module 135: Math.imulh polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            imulh: function(t, r) {
                var n = +t,
                    e = +r,
                    o = 65535 & n, // Low 16 bits of n
                    i = 65535 & e, // Low 16 bits of e
                    u = n >> 16,   // High 16 bits of n
                    a = e >> 16,   // High 16 bits of e
                    c = (u * i >>> 0) + (o * i >>> 16); // Intermediate product

                // Calculate high part of 32-bit integer multiplication.
                return u * a + (c >> 16) + ((o * a >>> 0) + (65535 & c) >> 16);
            }
        });
    },

    /* Module 136: Math.isubh polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            isubh: function(t, r, n, e) {
                var o = t >>> 0,
                    i = n >>> 0;
                // Subtract high parts of 64-bit integers.
                return (r >>> 0) - (e >>> 0) - ((~o & i | ~(o ^ i) & o - i >>> 0) >>> 31) | 0;
            }
        });
    },

    /* Module 137: Math.RAD_PER_DEG constant. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            RAD_PER_DEG: 180 / Math.PI
        });
    },

    /* Module 138: Math.radians polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = Math.PI / 180;

        e({
            target: "Math",
            stat: !0
        }, {
            radians: function(t) {
                return t * o; // Convert degrees to radians
            }
        });
    },

    /* Module 139: Math.scale polyfill (exports existing). */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            scale: n(70) // Use existing Math.scale polyfill
        });
    },

    /* Module 140: Math.seededPRNG polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(1),   // Assert object
            i = n(141), // Number.isFinite polyfill
            u = n(34),  // Create iterator constructor
            a = n(17),  // Internal state manager
            c = a.set,  // Set internal state
            f = a.getterFor("Seeded Random Generator"), // Getter for internal state

            // Seeded Random Generator iterator constructor.
            s = u((function(t) {
                c(this, {
                    type: "Seeded Random Generator",
                    seed: t % 2147483647
                }); // Store seed (modulo 2^31 - 1)
            }), "Seeded Random", (function() {
                var t = f(this);
                // Linear congruential generator formula.
                return {
                    value: (1073741823 & (t.seed = (1103515245 * t.seed + 12345) % 2147483647)) / 1073741823,
                    done: !1
                };
            }));

        e({
            target: "Math",
            stat: !0,
            forced: !0
        }, {
            seededPRNG: function(t) {
                var r = o(t).seed; // Get seed from argument
                if (!i(r)) {
                    throw TypeError('Math.seededPRNG() argument should have a "seed" field with a finite value.');
                }
                return new s(r); // Return new generator instance
            }
        });
    },

    /* Module 141: Number.isFinite polyfill. */
    function(t, r, n) {
        var e = n(8).isFinite; // Native Number.isFinite

        t.exports = Number.isFinite || function(t) {
            return "number" == typeof t && e(t); // Check type and native isFinite
        };
    },

    /* Module 142: Math.signbit polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            signbit: function(t) {
                return (t = +t) == t && 0 == t ? 1 / t == -1 / 0 : t < 0; // Check sign of number
            }
        });
    },

    /* Module 143: Math.umulh polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Math",
            stat: !0
        }, {
            umulh: function(t, r) {
                var n = +t,
                    e = +r,
                    o = 65535 & n, // Low 16 bits of n
                    i = 65535 & e, // Low 16 bits of e
                    u = n >>> 16,  // High 16 bits of n (unsigned)
                    a = e >>> 16,  // High 16 bits of e (unsigned)
                    c = (u * i >>> 0) + (o * i >>> 16); // Intermediate product

                // Calculate high part of unsigned 32-bit integer multiplication.
                return u * a + (c >>> 16) + ((o * a >>> 0) + (65535 & c) >>> 16);
            }
        });
    },

    /* Module 144: Number.fromString polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(28),  // ToInteger
            i = n(145), // ParseInt with custom radix
            u = /^[\da-z]+$/; // Regex for valid digits

        e({
            target: "Number",
            stat: !0
        }, {
            fromString: function(t, r) {
                var n, e, a = 1;
                if ("string" != typeof t) {
                    throw TypeError("Invalid number representation");
                }
                if (!t.length) {
                    throw SyntaxError("Invalid number representation");
                }

                // Handle negative sign.
                if ("-" == t.charAt(0) && (a = -1, !(t = t.slice(1)).length)) {
                    throw SyntaxError("Invalid number representation");
                }

                // Parse radix.
                if ((n = void 0 === r ? 10 : o(r)) < 2 || n > 36) {
                    throw RangeError("Invalid radix");
                }

                // Validate format and parse.
                if (!u.test(t) || (e = i(t, n)).toString(n) !== t) {
                    throw SyntaxError("Invalid number representation");
                }
                return a * e; // Apply sign
            }
        });
    },

    /* Module 145: parseInt with custom radix. */
    function(t, r, n) {
        var e = n(8),   // Global object
            o = n(146).trim, // String.prototype.trim polyfill
            i = n(71),  // Whitespace characters
            u = e.parseInt, // Native parseInt
            a = /^[+-]?0[Xx]/, // Regex for hex/octal prefix
            c = 8 !== u(i + "08") || 22 !== u(i + "0x16"); // Check for parseInt bugs

        t.exports = c ? function(t, r) {
            var n = o(String(t)); // Trim whitespace
            // If radix is 0 or undefined, determine from prefix.
            return u(n, r >>> 0 || (a.test(n) ? 16 : 10));
        } : u; // Use native if not buggy
    },

    /* Module 146: String.prototype.trim polyfill. */
    function(t, r, n) {
        var e = n(19),   // Assert not null/undefined
            o = "[" + n(71) + "]", // Regex for whitespace characters
            i = RegExp("^" + o + o + "*"), // Regex for leading whitespace
            u = RegExp(o + o + "*$"), // Regex for trailing whitespace

            // Helper function for trimming.
            a = function(t) {
                return function(r) {
                    var n = String(e(r)); // Convert to string
                    // Apply trim based on flags.
                    return 1 & t && (n = n.replace(i, "")),
                        2 & t && (n = n.replace(u, "")), n;
                };
            };

        t.exports = {
            start: a(1), // Trim start
            end: a(2),   // Trim end
            trim: a(3)   // Trim both ends
        };
    },

    /* Module 147: Observable API (proposal). */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(12),  // Feature detection for Object.defineProperty
            i = n(68),  // Set Symbol.species
            u = n(4),   // Assert function
            a = n(1),   // Assert object
            c = n(9),   // Is object?
            f = n(32),  // Assert instance
            s = n(10).f, // Object.defineProperty.f
            l = n(16),  // Define non-enumerable property
            p = n(33),  // Extend object with properties
            v = n(36),  // Get iterator
            d = n(3),   // Iterate helper
            h = n(148), // Console.error utility
            g = n(5),   // Get well-known symbol
            y = n(17),  // Internal state manager
            x = g("observable"), // Symbol.observable
            b = y.get,  // Get internal state
            m = y.set,  // Set internal state

            // Helper to ensure value is a function or undefined.
            w = function(t) {
                return null == t ? void 0 : u(t);
            },
            // Helper to call cleanup function.
            S = function(t) {
                var r = t.cleanup;
                if (r) {
                    t.cleanup = void 0;
                    try {
                        r();
                    } catch (t) {
                        h(t);
                    }
                }
            },
            // Helper to check if observer is undefined.
            O = function(t) {
                return void 0 === t.observer;
            },
            // Helper to close subscription.
            M = function(t, r) {
                if (!o) {
                    t.closed = !0;
                    var n = r.subscriptionObserver;
                    n && (n.closed = !0);
                }
                r.observer = void 0;
            },
            // Subscription logic.
            E = function(t, r) {
                var n,
                    e = m(this, {
                        cleanup: void 0,
                        observer: a(t),
                        subscriptionObserver: void 0
                    });
                o || (this.closed = !1); // Set closed flag for polyfill
                try {
                    (n = w(t.start)) && n.call(t, this); // Call start method of observer
                } catch (t) {
                    h(t);
                }
                if (!O(e)) { // If not already unsubscribed
                    var i = e.subscriptionObserver = new j(this); // Create subscription observer
                    try {
                        var c = r(i),
                            f = c;
                        null != c && (e.cleanup = "function" == typeof c.unsubscribe ? function() {
                            f.unsubscribe();
                        } : u(c)); // Store cleanup logic
                    } catch (t) {
                        return void i.error(t);
                    }
                    O(e) && S(e); // If unsubscribed during setup, cleanup
                }
            };

        // Subscription prototype.
        E.prototype = p({}, {
            unsubscribe: function() {
                var t = b(this);
                O(t) || (M(this, t), S(t)); // If not unsubscribed, close and cleanup
            }
        });

        // Define 'closed' getter for subscription.
        o && s(E.prototype, "closed", {
            configurable: !0,
            get: function() {
                return O(b(this));
            }
        });

        // SubscriptionObserver constructor.
        var j = function(t) {
            m(this, {
                subscription: t
            });
            o || (this.closed = !1); // Set closed flag for polyfill
        };

        // SubscriptionObserver prototype.
        j.prototype = p({}, {
            next: function(t) {
                var r = b(b(this).subscription);
                if (!O(r)) {
                    var n = r.observer;
                    try {
                        var e = w(n.next);
                        e && e.call(n, t);
                    } catch (t) {
                        h(t);
                    }
                }
            },
            error: function(t) {
                var r = b(this).subscription,
                    n = b(r);
                if (!O(n)) {
                    var e = n.observer;
                    M(r, n);
                    try {
                        var o = w(e.error);
                        o ? o.call(e, t) : h(t);
                    } catch (t) {
                        h(t);
                    }
                    S(n);
                }
            },
            complete: function() {
                var t = b(this).subscription,
                    r = b(t);
                if (!O(r)) {
                    var n = r.observer;
                    M(t, r);
                    try {
                        var e = w(n.complete);
                        e && e.call(n);
                    } catch (t) {
                        h(t);
                    }
                    S(r);
                }
            }
        });

        // Define 'closed' getter for subscription observer.
        o && s(j.prototype, "closed", {
            configurable: !0,
            get: function() {
                return O(b(b(this).subscription));
            }
        });

        // Observable constructor.
        var A = function(t) {
            f(this, A, "Observable"); // Assert instance
            m(this, {
                subscriber: u(t)
            }); // Store subscriber function
        };

        // Observable prototype.
        p(A.prototype, {
            subscribe: function(t) {
                var r = arguments.length;
                return new E("function" == typeof t ? {
                    next: t,
                    error: r > 1 ? arguments[1] : void 0,
                    complete: r > 2 ? arguments[2] : void 0
                } : c(t) ? t : {}, b(this).subscriber);
            }
        });

        // Observable static methods.
        p(A, {
            from: function(t) {
                var r = "function" == typeof this ? this : A,
                    n = w(a(t)[x]); // Get Symbol.observable method

                if (n) {
                    var e = a(n.call(t));
                    return e.constructor === r ? e : new r((function(t) {
                        return e.subscribe(t);
                    }));
                }
                var o = v(t); // Get iterator
                return new r((function(t) {
                    d(o, (function(r) {
                        if (t.next(r), t.closed) return d.stop();
                    }), void 0, !1, !0), t.complete();
                }));
            },
            of: function() {
                for (var t = "function" == typeof this ? this : A,
                        r = arguments.length, n = new Array(r), e = 0; e < r;) {
                    n[e] = arguments[e++];
                }
                return new t((function(t) {
                    for (var e = 0; e < r; e++) {
                        if (t.next(n[e]), t.closed) return;
                    }
                    t.complete();
                }));
            }
        });

        l(A.prototype, x, (function() {
            return this;
        })); // Set Symbol.observable on prototype

        e({
            global: !0
        }, {
            Observable: A
        }); // Export Observable globally

        i("Observable"); // Set Symbol.species for Observable
    },

    /* Module 148: Console.error utility. */
    function(t, r, n) {
        var e = n(8); // Global object

        t.exports = function(t, r) {
            var n = e.console;
            if (n && n.error) {
                1 === arguments.length ? n.error(t) : n.error(t, r);
            }
        };
    },

    /* Module 149: Promise.any polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(4),   // Assert function
            i = n(6),   // Get global variable (AggregateError)
            u = n(72),  // Promise capability factory
            a = n(73),  // Try-catch utility
            c = n(3);   // Iterate helper

        e({
            target: "Promise",
            stat: !0
        }, {
            any: function(t) {
                var r = this,
                    n = u.f(r), // Create Promise capabilities
                    e = n.resolve,
                    f = n.reject,
                    s = a((function() {
                        var n = o(r.resolve),
                            u = [],
                            a = 0,
                            s = 1,
                            l = !1; // Flag for first resolution

                        c(t, (function(t) {
                            var o = a++,
                                c = !1;
                            u.push(void 0); // Placeholder for errors
                            s++;
                            n.call(r, t).then((function(t) {
                                c || l || (l = !0, e(t)); // Resolve with first resolved value
                            }), (function(t) {
                                c || l || (c = !0, u[o] = t, --s || f(new(i("AggregateError"))(u, "No one promise resolved"))); // Reject if all fail
                            }));
                        }));
                        --s || f(new(i("AggregateError"))(u, "No one promise resolved")); // Reject if iterable is empty
                    }));
                return s.error && f(s.value), n.promise; // Handle synchronous errors
            }
        });
    },

    /* Module 150: Promise.try polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(72),  // Promise capability factory
            i = n(73);  // Try-catch utility

        e({
            target: "Promise",
            stat: !0
        }, {
            try: function(t) {
                var r = o.f(this), // Create Promise capabilities
                    n = i(t);      // Execute function in try-catch

                // Resolve or reject based on function execution result.
                return (n.error ? r.reject : r.resolve)(n.value), r.promise;
            }
        });
    },

    /* Module 151: Reflect.defineMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.toKey, // Convert key to primitive
            a = o.set;   // Set metadata

        e({
            target: "Reflect",
            stat: !0
        }, {
            defineMetadata: function(t, r, n) {
                var e = arguments.length < 4 ? void 0 : u(arguments[3]); // Get optional property key
                a(t, r, i(n), e); // Set metadata
            }
        });
    },

    /* Module 152: Reflect.deleteMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.toKey, // Convert key to primitive
            a = o.getMap, // Get metadata map
            c = o.store; // Global metadata store

        e({
            target: "Reflect",
            stat: !0
        }, {
            deleteMetadata: function(t, r) {
                var n = arguments.length < 3 ? void 0 : u(arguments[2]), // Get optional property key
                    e = a(i(r), n, !1); // Get metadata map for object and key
                if (void 0 === e || !e.delete(t)) {
                    return !1; // If map or metadata not found, or deletion failed
                }
                if (e.size) {
                    return !0; // If map still has entries
                }
                var o = c.get(r); // Get map for the object
                return o.delete(n), !!o.size || c.delete(r); // Delete map if empty
            }
        });
    },

    /* Module 153: Reflect.getMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = n(22),  // Get prototype of object
            a = o.has,   // Check for metadata
            c = o.get,   // Get metadata
            f = o.toKey, // Convert key to primitive

            // Recursive helper to find metadata up the prototype chain.
            s = function(t, r, n) {
                if (a(t, r, n)) {
                    return c(t, r, n); // Return if found
                }
                var e = u(r); // Get prototype
                return null !== e ? s(t, e, n) : void 0; // Recurse up prototype chain
            };

        e({
            target: "Reflect",
            stat: !0
        }, {
            getMetadata: function(t, r) {
                var n = arguments.length < 3 ? void 0 : f(arguments[2]); // Get optional property key
                return s(t, i(r), n); // Get metadata
            }
        });
    },

    /* Module 154: Reflect.getMetadataKeys polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(155), // Set constructor polyfill
            i = n(18),  // Metadata API
            u = n(1),   // Assert object
            a = n(22),  // Get prototype of object
            c = n(3),   // Iterate helper
            f = i.keys, // Get own metadata keys
            s = i.toKey, // Convert key to primitive

            // Recursive helper to collect metadata keys up the prototype chain.
            l = function(t, r) {
                var n = f(t, r), // Get own metadata keys
                    e = a(t);    // Get prototype

                if (null === e) {
                    return n; // Base case: end of prototype chain
                }
                var i, u,
                    s = l(e, r); // Recurse for prototype's keys
                // Merge keys, removing duplicates.
                return s.length ? n.length ? (i = new o(n.concat(s)), c(i, (u = []).push, u), u) : s : n;
            };

        e({
            target: "Reflect",
            stat: !0
        }, {
            getMetadataKeys: function(t) {
                var r = arguments.length < 2 ? void 0 : s(arguments[1]); // Get optional property key
                return l(u(t), r); // Get metadata keys
            }
        });
    },

    /* Module 155: Set constructor (polyfill). */
    function(t, r, n) {
        "use strict";
        var e = n(46), // Collection polyfill helper
            o = n(66); // Set-specific collection logic

        t.exports = e("Set", (function(t) {
            return function() {
                return t(this, arguments.length ? arguments[0] : void 0);
            };
        }), o);
    },

    /* Module 156: Reflect.getOwnMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.get,   // Get metadata
            a = o.toKey; // Convert key to primitive

        e({
            target: "Reflect",
            stat: !0
        }, {
            getOwnMetadata: function(t, r) {
                var n = arguments.length < 3 ? void 0 : a(arguments[2]); // Get optional property key
                return u(t, i(r), n); // Get own metadata
            }
        });
    },

    /* Module 157: Reflect.getOwnMetadataKeys polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.keys,  // Get own metadata keys
            a = o.toKey; // Convert key to primitive

        e({
            target: "Reflect",
            stat: !0
        }, {
            getOwnMetadataKeys: function(t) {
                var r = arguments.length < 2 ? void 0 : a(arguments[1]); // Get optional property key
                return u(i(t), r); // Get own metadata keys
            }
        });
    },

    /* Module 158: Reflect.hasMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = n(22),  // Get prototype of object
            a = o.has,   // Check for metadata
            c = o.toKey, // Convert key to primitive

            // Recursive helper to check for metadata up the prototype chain.
            f = function(t, r, n) {
                if (a(t, r, n)) {
                    return !0; // Return true if found
                }
                var e = u(r); // Get prototype
                return null !== e && f(t, e, n); // Recurse up prototype chain
            };

        e({
            target: "Reflect",
            stat: !0
        }, {
            hasMetadata: function(t, r) {
                var n = arguments.length < 3 ? void 0 : c(arguments[2]); // Get optional property key
                return f(t, i(r), n); // Check for metadata
            }
        });
    },

    /* Module 159: Reflect.hasOwnMetadata polyfill. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.has,   // Check for metadata
            a = o.toKey; // Convert key to primitive

        e({
            target: "Reflect",
            stat: !0
        }, {
            hasOwnMetadata: function(t, r) {
                var n = arguments.length < 3 ? void 0 : a(arguments[2]); // Get optional property key
                return u(t, i(r), n); // Check for own metadata
            }
        });
    },

    /* Module 160: Reflect.metadata decorator. */
    function(t, r, n) {
        var e = n(0),   // Utility for defining properties
            o = n(18),  // Metadata API
            i = n(1),   // Assert object
            u = o.toKey, // Convert key to primitive
            a = o.set;   // Set metadata

        e({
            target: "Reflect",
            stat: !0
        }, {
            metadata: function(t, r) {
                return function(n, e) {
                    a(t, r, i(n), u(e)); // Set metadata
                };
            }
        });
    },

    /* Module 161: Set.prototype.addAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(74);  // addAll utility

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            addAll: function() {
                return i.apply(this, arguments); // Call generic addAll
            }
        });
    },

    /* Module 162: Set.prototype.deleteAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(35);  // deleteAll utility

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            deleteAll: function() {
                return i.apply(this, arguments); // Call generic deleteAll
            }
        });
    },

    /* Module 163: Set.prototype.difference polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(14),  // Get species constructor
            f = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            difference: function(t) {
                var r = u(this), // Get Set instance
                    n = new(c(r, i("Set")))(r), // Create new Set from current Set
                    e = a(n.delete); // Get new Set's delete method

                // Iterate over other iterable and remove elements.
                return f(t, (function(t) {
                    e.call(n, t);
                })), n; // Return the new Set
            }
        });
    },

    /* Module 164: Set.prototype.every polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(20),  // Get Set values iterator
            c = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            every: function(t) {
                var r = i(this), // Get Set instance
                    n = a(r),    // Get Set values iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and check if all values pass the test.
                return !c(n, (function(t) {
                    if (!e(t, t, r)) {
                        return c.stop(); // Stop if callback returns false
                    }
                }), void 0, !1, !0).stopped; // Check if iteration stopped
            }
        });
    },

    /* Module 165: Set.prototype.filter polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(7),   // Bind function
            f = n(14),  // Get species constructor
            s = n(20),  // Get Set values iterator
            l = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            filter: function(t) {
                var r = u(this), // Get Set instance
                    n = s(r),    // Get Set values iterator
                    e = c(t, arguments.length > 1 ? arguments[1] : void 0, 3), // Bind callback
                    o = new(f(r, i("Set")))(), // Create new Set using species constructor
                    p = a(o.add); // Get new Set's add method

                // Iterate and add values that pass the filter.
                return l(n, (function(t) {
                    e(t, t, r) && p.call(o, t);
                }), void 0, !1, !0), o; // Return the new filtered Set
            }
        });
    },

    /* Module 166: Set.prototype.find polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(20),  // Get Set values iterator
            c = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            find: function(t) {
                var r = i(this), // Get Set instance
                    n = a(r),    // Get Set values iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and return the first value that passes the test.
                return c(n, (function(t) {
                    if (e(t, t, r)) {
                        return c.stop(t); // Stop and return the value
                    }
                }), void 0, !1, !0).result; // Get the result of the stopped iteration
            }
        });
    },

    /* Module 167: Set.from polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Set",
            stat: !0
        }, {
            from: n(37) // Use generic `from` utility
        });
    },

    /* Module 168: Set.prototype.intersection polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(14),  // Get species constructor
            f = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            intersection: function(t) {
                var r = u(this), // Get Set instance
                    n = new(c(r, i("Set")))(), // Create new Set using species constructor
                    e = a(r.has), // Get current Set's has method
                    o = a(n.add); // Get new Set's add method

                // Iterate over other iterable and add common elements.
                return f(t, (function(t) {
                    e.call(r, t) && o.call(n, t);
                })), n; // Return the new Set
            }
        });
    },

    /* Module 169: Set.prototype.isDisjointFrom polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4),   // Assert function
            a = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            isDisjointFrom: function(t) {
                var r = i(this), // Get Set instance
                    n = u(r.has); // Get current Set's has method

                // Iterate over other iterable and check if any element is present.
                return !a(t, (function(t) {
                    if (!0 === n.call(r, t)) {
                        return a.stop(); // Stop if found (not disjoint)
                    }
                })).stopped; // Return true if iteration completed (disjoint)
            }
        });
    },

    /* Module 170: Set.prototype.isSubsetOf polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(36),  // Get iterator
            f = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            isSubsetOf: function(t) {
                var r = c(this), // Get current Set's values iterator
                    n = u(t),    // Convert other iterable to object
                    e = n.has;   // Get other Set's has method

                // If other iterable doesn't have a 'has' method, convert it to a Set.
                if ("function" != typeof e) {
                    n = new(i("Set"))(t);
                    e = a(n.has);
                }

                // Iterate current Set and check if all elements are in the other Set.
                return !f(r, (function(t) {
                    if (!1 === e.call(n, t)) {
                        return f.stop(); // Stop if not found (not a subset)
                    }
                }), void 0, !1, !0).stopped; // Return true if iteration completed (is a subset)
            }
        });
    },

    /* Module 171: Set.prototype.isSupersetOf polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4),   // Assert function
            a = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            isSupersetOf: function(t) {
                var r = i(this), // Get Set instance
                    n = u(r.has); // Get current Set's has method

                // Iterate over other iterable and check if all elements are in the current Set.
                return !a(t, (function(t) {
                    if (!1 === n.call(r, t)) {
                        return a.stop(); // Stop if not found (not a superset)
                    }
                })).stopped; // Return true if iteration completed (is a superset)
            }
        });
    },

    /* Module 172: Set.prototype.join polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(20),  // Get Set values iterator
            a = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            join: function(t) {
                var r = i(this), // Get Set instance
                    n = u(r),    // Get Set values iterator
                    e = void 0 === t ? "," : String(t), // Separator
                    o = [];      // Array to collect values

                // Iterate and push values to array.
                return a(n, o.push, o, !1, !0), o.join(e); // Join collected values
            }
        });
    },

    /* Module 173: Set.prototype.map polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(7),   // Bind function
            f = n(14),  // Get species constructor
            s = n(20),  // Get Set values iterator
            l = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            map: function(t) {
                var r = u(this), // Get Set instance
                    n = s(r),    // Get Set values iterator
                    e = c(t, arguments.length > 1 ? arguments[1] : void 0, 3), // Bind callback
                    o = new(f(r, i("Set")))(), // Create new Set using species constructor
                    p = a(o.add); // Get new Set's add method

                // Iterate and add mapped values to the new Set.
                return l(n, (function(t) {
                    p.call(o, e(t, t, r)); // Call add with mapped value
                }), void 0, !1, !0), o; // Return the new Set
            }
        });
    },

    /* Module 174: Set.of polyfill. */
    function(t, r, n) {
        n(0)({
            target: "Set",
            stat: !0
        }, {
            of: n(38) // Use generic `of` utility
        });
    },

    /* Module 175: Set.prototype.reduce polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(4),   // Assert function
            a = n(20),  // Get Set values iterator
            c = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            reduce: function(t) {
                var r = i(this), // Get Set instance
                    n = a(r),    // Get Set values iterator
                    e = arguments.length < 2, // Check if initial value provided
                    o = e ? void 0 : arguments[1]; // Initial value

                u(t); // Assert callback is a function

                // Iterate and reduce Set values.
                c(n, (function(n) {
                    e ? (e = !1, o = n) : o = t(o, n, n, r); // Apply reducer
                }), void 0, !1, !0);

                if (e) {
                    throw TypeError("Reduce of empty set with no initial value"); // Error if empty and no initial value
                }
                return o; // Return the reduced value
            }
        });
    },

    /* Module 176: Set.prototype.some polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(1),   // Assert object
            u = n(7),   // Bind function
            a = n(20),  // Get Set values iterator
            c = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            some: function(t) {
                var r = i(this), // Get Set instance
                    n = a(r),    // Get Set values iterator
                    e = u(t, arguments.length > 1 ? arguments[1] : void 0, 3); // Bind callback

                // Iterate and check if any value passes the test.
                return c(n, (function(t) {
                    if (e(t, t, r)) {
                        return c.stop(); // Stop if found
                    }
                }), void 0, !1, !0).stopped; // Return true if stopped (found)
            }
        });
    },

    /* Module 177: Set.prototype.symmetricDifference polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(14),  // Get species constructor
            f = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            symmetricDifference: function(t) {
                var r = u(this), // Get Set instance
                    n = new(c(r, i("Set")))(r), // Create new Set from current Set
                    e = a(n.delete), // Get new Set's delete method
                    o = a(n.add);    // Get new Set's add method

                // Iterate over other iterable, add if not present, delete if present.
                return f(t, (function(t) {
                    e.call(n, t) || o.call(n, t);
                })), n; // Return the new Set
            }
        });
    },

    /* Module 178: Set.prototype.union polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(6),   // Get global variable (Set)
            u = n(1),   // Assert object
            a = n(4),   // Assert function
            c = n(14),  // Get species constructor
            f = n(3);   // Iterate helper

        e({
            target: "Set",
            proto: !0,
            real: !0,
            forced: o
        }, {
            union: function(t) {
                var r = u(this), // Get Set instance
                    n = new(c(r, i("Set")))(r); // Create new Set from current Set

                // Iterate over other iterable and add all elements.
                return f(t, a(n.add), n), n; // Return the new Set
            }
        });
    },

    /* Module 179: String.prototype.at polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(48).charAt; // String.prototype.charAt utility

        e({
            target: "String",
            proto: !0
        }, {
            at: function(t) {
                return o(this, t); // Get character at specified index
            }
        });
    },

    /* Module 180: String.prototype.codePoints polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(34),  // Create iterator constructor
            i = n(19),  // Assert not null/undefined
            u = n(17),  // Internal state manager
            a = n(48),  // String charAt and codeAt utilities
            c = a.codeAt, // Get code point
            f = a.charAt, // Get character
            s = u.set,   // Set internal state
            l = u.getterFor("String Iterator"), // Getter for internal state

            // String Iterator constructor.
            p = o((function(t) {
                s(this, {
                    type: "String Iterator",
                    string: t,
                    index: 0
                });
            }), "String", (function() {
                var t,
                    r = l(this),
                    n = r.string,
                    e = r.index;

                if (e >= n.length) {
                    return {
                        value: void 0,
                        done: !0
                    }; // End of string
                }
                // Get next character(s) and their code point.
                t = f(n, e);
                r.index += t.length;
                return {
                    value: {
                        codePoint: c(t, 0),
                        position: e
                    },
                    done: !1
                };
            }));

        e({
            target: "String",
            proto: !0
        }, {
            codePoints: function() {
                return new p(String(i(this))); // Create new StringIterator
            }
        });
    },

    /* Module 181: String.prototype.matchAll polyfill. */
    function(t, r, n) {
        n(182); // Import module 182 (RegExp.prototype.matchAll)
    },

    /* Module 182: RegExp.prototype.matchAll polyfill (for String.prototype.matchAll). */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(34),  // Create iterator constructor
            i = n(19),  // Assert not null/undefined
            u = n(21),  // ToLength
            a = n(4),   // Assert function
            c = n(1),   // Assert object
            f = n(24),  // Get internal [[Class]]
            s = n(75),  // Is RegExp?
            l = n(76),  // Get RegExp flags
            p = n(16),  // Define non-enumerable property
            v = n(15),  // Try-catch helper
            d = n(5),   // Get well-known symbol
            h = n(14),  // Get species constructor
            g = n(183), // Advance string index
            y = n(17),  // Internal state manager
            x = n(2),   // Is core-js in pure mode?
            b = d("matchAll"), // Symbol.matchAll
            m = y.set,   // Set internal state
            w = y.getterFor("RegExp String Iterator"), // Getter for internal state
            S = RegExp.prototype, // Native RegExp prototype
            O = S.exec, // Native RegExp.prototype.exec
            M = "".matchAll, // Native String.prototype.matchAll
            E = !!M && !v((function() {
                "a".matchAll(/./);
            })), // Feature detection for native matchAll bug

            // RegExp String Iterator constructor.
            j = o((function(t, r, n, e) {
                m(this, {
                    type: "RegExp String Iterator",
                    regexp: t,
                    string: r,
                    global: n,
                    unicode: e,
                    done: !1
                });
            }), "RegExp String", (function() {
                var t = w(this);
                if (t.done) {
                    return {
                        value: void 0,
                        done: !0
                    };
                }
                var r = t.regexp,
                    n = t.string,
                    e = function(t, r) { // Helper to call RegExp.prototype.exec
                        var n, e = t.exec;
                        if ("function" == typeof e) {
                            if ("object" != typeof(n = e.call(t, r))) {
                                throw TypeError("Incorrect exec result");
                            }
                            return n;
                        }
                        return O.call(t, r);
                    }(r, n);

                if (null === e) {
                    return {
                        value: void 0,
                        done: t.done = !0
                    };
                }
                // If global, advance lastIndex for next match.
                if (t.global) {
                    "" == String(e[0]) && (r.lastIndex = g(n, u(r.lastIndex), t.unicode));
                    return {
                        value: e,
                        done: !1
                    };
                }
                // If not global, only one match.
                t.done = !0;
                return {
                    value: e,
                    done: !1
                };
            })),

            // Helper to create a new RegExp instance with 'g' and 'u' flags.
            A = function(t) {
                var r, n, e, o, i, a,
                    f = c(this),
                    s = String(t);

                r = h(f, RegExp); // Get species constructor
                void 0 === (n = f.flags) && f instanceof RegExp && !("flags" in S) && (n = l.call(f)); // Get flags
                e = void 0 === n ? "" : String(n); // Ensure flags are string
                o = new r(r === RegExp ? f.source : f, e); // Create new RegExp
                i = !!~e.indexOf("g"); // Check for global flag
                a = !!~e.indexOf("u"); // Check for unicode flag
                o.lastIndex = u(f.lastIndex); // Copy lastIndex
                return new j(o, s, i, a); // Create RegExp String Iterator
            };

        e({
            target: "String",
            proto: !0,
            forced: E
        }, {
            matchAll: function(t) {
            var r, n, e, o = i(this);
            if (null != t) {
                // If regex is not global, throw error.
                if (s(t) && !~String(i("flags" in S ? t.flags : l.call(t))).indexOf("g")) {
                    throw TypeError("`.matchAll` does not allow non-global regexes");
                }
                // If native matchAll is reliable, use it.
                if (E) {
                    return M.apply(o, arguments);
                }
                // If Symbol.matchAll method exists on 't', call it.
                if (void 0 === (n = t[b]) && x && "RegExp" == f(t) && (n = A), null != n) {
                    return a(n).call(t, o);
                }
            } else if (E) {
                return M.apply(o, arguments); // Use native if no 't' provided and reliable
            }
            // Fallback for non-RegExp or problematic native implementations.
            r = String(o);
            e = new RegExp(t, "g"); // Create global RegExp
            return x ? A.call(e, r) : e[b](r); // Create iterator
        }});

        // If not pure mode and Symbol.matchAll not in RegExp.prototype, define it.
        x || b in S || p(S, b, A);
    },

    /* Module 183: Advance string index (for RegExp lastIndex). */
    function(t, r, n) {
        "use strict";
        var e = n(48).charAt; // String.prototype.charAt utility

        t.exports = function(t, r, n) {
            return r + (n ? e(t, r).length : 1); // Advance by 1 or by surrogate pair length
        };
    },

    /* Module 184: String.prototype.replaceAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(19),  // Assert not null/undefined
            i = n(75),  // Is RegExp?
            u = n(76),  // Get RegExp flags
            a = n(5),   // Get well-known symbol
            c = n(2),   // Is core-js in pure mode?
            f = a("replace"), // Symbol.replace
            s = RegExp.prototype; // Native RegExp prototype

        e({
            target: "String",
            proto: !0
        }, {
            replaceAll: function t(r, n) {
                var e, a, l, p, v, d, h, g,
                    y = o(this); // Convert to string

                if (null != r) {
                    // If regex is not global, throw error.
                    if ((e = i(r)) && !~String(o("flags"in s?r.flags:u.call(r))).indexOf("g")) {
                        throw TypeError("`.replaceAll` does not allow non-global regexes");
                    }
                    // If Symbol.replace method exists on 'r', call it.
                    if (void 0 !== (a = r[f])) {
                        return a.call(r, y, n);
                    }
                    // If not pure mode and it's a RegExp, use native replace.
                    if (c && e) {
                        return String(y).replace(r, n);
                    }
                }

                l = String(y); // Convert to string
                p = String(r); // Convert search value to string

                if ("" === p) {
                    // If search value is empty string, replace all occurrences with a regex.
                    return t.call(l, /(?:)/g, n);
                }

                // Split string by search value.
                v = l.split(p);

                if ("function" != typeof n) {
                    return v.join(String(n)); // Join with replacement string
                }

                // If replacement is a function, build the string manually.
                for (h = (d = v[0]).length, g = 1; g < v.length; g++) {
                    d += String(n(p, h, l)); // Call replacement function
                    h += p.length + v[g].length;
                    d += v[g];
                }
                return d;
            }
        });
    },

    /* Module 185: Symbol.dispose polyfill. */
    function(t, r, n) {
        n(49)("dispose"); // Define Symbol.dispose
    },

    /* Module 186: Object.getOwnPropertySymbols.f (for Symbol polyfill). */
    function(t, r, n) {
        var e = n(5);
        r.f = e; // Export Symbol.for (or similar)
    },

    /* Module 187: Symbol.observable polyfill. */
    function(t, r, n) {
        n(49)("observable"); // Define Symbol.observable
    },

    /* Module 188: Symbol.patternMatch polyfill. */
    function(t, r, n) {
        n(49)("patternMatch"); // Define Symbol.patternMatch
    },

    /* Module 189: WeakMap.prototype.deleteAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(35);  // deleteAll utility

        e({
            target: "WeakMap",
            proto: !0,
            real: !0,
            forced: o
        }, {
            deleteAll: function() {
                return i.apply(this, arguments); // Call generic deleteAll
            }
        });
    },

    /* Module 190: WeakMap.from polyfill. */
    function(t, r, n) {
        n(0)({
            target: "WeakMap",
            stat: !0
        }, {
            from: n(37) // Use generic `from` utility
        });
    },

    /* Module 191: WeakMap.of polyfill. */
    function(t, r, n) {
        n(0)({
            target: "WeakMap",
            stat: !0
        }, {
            of: n(38) // Use generic `of` utility
        });
    },

    /* Module 192: WeakSet.prototype.addAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(74);  // addAll utility

        e({
            target: "WeakSet",
            proto: !0,
            real: !0,
            forced: o
        }, {
            addAll: function() {
                return i.apply(this, arguments); // Call generic addAll
            }
        });
    },

    /* Module 193: WeakSet.prototype.deleteAll polyfill. */
    function(t, r, n) {
        "use strict";
        var e = n(0),   // Utility for defining properties
            o = n(2),   // Is core-js in pure mode?
            i = n(35);  // deleteAll utility

        e({
            target: "WeakSet",
            proto: !0,
            real: !0,
            forced: o
        }, {
            deleteAll: function() {
                return i.apply(this, arguments); // Call generic deleteAll
            }
        });
    },

    /* Module 194: WeakSet.from polyfill. */
    function(t, r, n) {
        n(0)({
            target: "WeakSet",
            stat: !0
        }, {
            from: n(37) // Use generic `from` utility
        });
    },

    /* Module 195: WeakSet.of polyfill. */
    function(t, r, n) {
        n(0)({
            target: "WeakSet",
            stat: !0
        }, {
            of: n(38) // Use generic `of` utility
        });
    }
]);
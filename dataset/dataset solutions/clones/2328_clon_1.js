!function(t){var r={};function e(n){
/* This is the module loading function. It checks if a module is already in the cache. */
if(r[n]) {
return r[n].exports;
}
/* If not, it creates a new module entry. */
var o=r[n]={i:n,l:!1,exports:{}};
/* It then executes the module function, passing in the exports object and the module loader itself. */
return t[n].call(o.exports,o,o.exports,e),o.l=!0,o.exports
}
/* Store all module definitions. */
e.m=t;
/* Store the module cache. */
e.c=r;
/* Helper to define properties on exports for ES module compatibility. */
e.d=function(t,r,n){
if(!e.o(t,r)){
Object.defineProperty(t,r,{
/* Property should be enumerable. */
enumerable:!0,
/* Use the provided getter function. */
get:n
})
}
};
/* Helper to set '__esModule' and 'Symbol.toStringTag' on module exports. */
e.r=function(t){
if("undefined"!=typeof Symbol && Symbol.toStringTag){
Object.defineProperty(t,Symbol.toStringTag,{
value:"Module"
})
}
Object.defineProperty(t,"__esModule",{value:!0})
};
/* Helper for creating a namespace object for modules. */
e.t=function(t,r){
/* If bit 1 is set, load the module. */
if(1&r) {
t=e(t);
}
/* If bit 8 is set, return the module directly. */
if(8&r) {
return t;
}
/* If bit 4 is set and it's an ES module, return it. */
if(4&r&&"object"==typeof t&&t&&t.__esModule) {
return t;
}
/* Create a blank object for the namespace. */
var n=Object.create(null);
/* Add ES module compatibility flags. */
e.r(n);
/* Set the 'default' export. */
Object.defineProperty(n,"default",{enumerable:!0,value:t});
/* If bit 2 is set and it's not a string, iterate over properties and define getters. */
if(2&r&&"string"!=typeof t) {
for(var o in t) {
e.d(n,o,function(r){return t[r]}.bind(null,o));
}
}
return n
};
/* Helper for getting the default export of a module. */
e.n=function(t){
var r=t&&t.__esModule?function(){return t.default}:function(){return t};
/* Define a getter 'a' for the default export. */
return e.d(r,"a",r),r
};
/* Helper to check if an object has a direct property. */
e.o=function(t,r){
return Object.prototype.hasOwnProperty.call(t,r)
};
/* Public path for assets - empty in this bundle. */
e.p="";
/* Load the entry module (module 343). */
e(e.s=343)
}([
/* Module 0 */
function(t,r,e){
    // Importing various utility functions and objects from other modules.
    var n=e(5),
        o=e(19).f,
        i=e(18),
        u=e(20),
        a=e(79),
        s=e(104),
        c=e(63);

    // This module exports a function designed to extend objects with new properties.
    t.exports=function(t,r){
        var e,f,l,p,h,
            v=t.target, // The target object (e.g., 'Array', 'Object').
            g=t.global, // Flag indicating if the target is a global object.
            d=t.stat;   // Flag indicating if the property is static (on constructor) or instance (on prototype).

        // Determine the actual object to modify.
        // If 'global' is true, it's the global object 'n'.
        // If 'stat' is true, it's 'n[v]' or a new object if 'n[v]' doesn't exist.
        // Otherwise, it's 'n[v].prototype'.
        if(e=g?n:d?n[v]||a(v,{}):(n[v]||{}).prototype) {
            // Iterate over each property in the 'r' object (the properties to add).
            for(f in r){
                p=r[f]; // The new property's value.

                // Get the existing property's value or descriptor.
                // 'noTargetGet' flag prevents fetching the value if only descriptor is needed.
                l=t.noTargetGet?(h=o(e,f))&&h.value:e[f];

                // Check if the property should be forced (e.g., polyfill always applied).
                // And ensure the existing property is not undefined.
                if(!c(g?f:v+(d?".":"#")+f,t.forced)&&void 0!==l){
                    // If the existing property and the new property have the same type, skip.
                    if(typeof p==typeof l) {
                        continue;
                    }
                    // Otherwise, copy properties from the old to the new if types differ.
                    s(p,l);
                }

                // If 'sham' flag is set or the existing property is a sham, mark the new property as sham.
                (t.sham||l&&l.sham)&&i(p,"sham",!0);

                // Define or redefine the property on the target object.
                u(e,f,p,t);
            }
        }
    }
},

/* Module 1 */
function(t,r){
    // This module exports a utility function to validate if an argument is an object.
    t.exports=function(t){
        // If the argument is not an object, throw a TypeError.
        if(! (t instanceof Object) ) {
            throw TypeError(String(t)+" is not an object");
        }
        // Otherwise, return the argument.
        return t
    }
},

/* Module 2 */
function(t,r){
    // This module exports a boolean indicating if the environment is 'pure' (e.g., not global-polluting).
    // In this case, it's set to false, meaning it might pollute the global scope.
    t.exports=!1
},

/* Module 3 */
function(t,r,e){
    // Import necessary helper functions for iteration.
    var n=e(1),   // Ensures argument is an object.
        o=e(87),  // Checks if an object is an Array iterator.
        i=e(11),  // Gets a valid length for array-like objects.
        u=e(13),  // Binds a function to a context.
        a=e(51),  // Retrieves an object's iterator method.
        s=e(113), // Handles iteration with potential stop signals.

        // Defines a 'stop' signal for iteration.
        c=function(t,r){this.stopped=t,this.result=r};

    // The main exported function for iterating over an iterable.
    (t.exports=function(t,r,e,f,l){
        var p,h,v,g,d,y,m,
            b=u(r,e,f?2:1); // Bind the callback function 'r' with context 'e' and arity 'f'.

        if(l) { // If 'l' is true, 't' is already an iterator.
            p=t;
        } else {
            // Get the iterator method for 't'.
            if("function"!=typeof(h=a(t))) {
                throw TypeError("Target is not iterable");
            }
            // If it's an Array iterator, optimize for direct array access.
            if(o(h)){
                for(v=0,g=i(t.length);g>v;v++) {
                    // Call the bound callback.
                    if((d=f?b(n(m=t[v])[0],m[1]):b(t[v]))&&d instanceof c) {
                        return d; // If callback returns a stop signal, stop and return it.
                    }
                }
                return new c(!1) // If no stop signal, continue.
            }
            p=h.call(t) // Get the actual iterator object.
        }

        // Iterate through the iterator.
        for(y=p.next;!(m=y.call(p)).done;) {
            // Process the current value.
            if("object"==typeof(d=s(p,b,m.value,f))&&d&&d instanceof c) {
                return d; // If callback returns a stop signal, stop and return it.
            }
        }
        return new c(!1) // All iterations completed without a stop signal.
    }).stop=function(t){
        // Factory for creating a 'stop' signal.
        return new c(!0,t)
    }
},

/* Module 4 */
function(t,r){
    // This module exports a utility function to ensure an argument is a function.
    t.exports=function(t){
        // If the argument is not a function, throw a TypeError.
        if("function"!=typeof t) {
            throw TypeError(String(t)+" is not a function");
        }
        // Otherwise, return the argument.
        return t
    }
},

/* Module 5 */
function(t,r){
    // This module exports a robust way to get the global object (window, global, globalThis).
    var e=function(t){
        return t&&t.Math==Math&&t
    };
    t.exports=e("object"==typeof globalThis&&globalThis)||
               e("object"==typeof window&&window)||
               e("object"==typeof self&&self)||
               e("object"==typeof global&&global)||
               Function("return this")()
},

/* Module 6 */
function(t,r){
    // This module exports a utility function to check if a given function throws an error.
    t.exports=!function(){
        try{
            return !!(function(){/* no-op */})()
        }catch(t){
            return !0
        }
    }()
},

/* Module 7 */
function(t,r,e){
    // Import global object, shared symbol registry, hasOwnProperty check, and symbol polyfill.
    var n=e(5),
        o=e(60),
        i=e(14),
        u=e(44),
        a=e(84),
        s=e(107),
        c=o("wks"), // Well-known symbols cache.
        f=n.Symbol,
        l=s?
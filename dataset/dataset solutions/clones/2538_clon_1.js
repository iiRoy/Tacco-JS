'use strict';


// This is a Type I clone, meaning it's exactly the same code
// except for variations in whitespace and comments.
// Every identifier, variable name, function name, operator, and expression
// remains completely unchanged.
// The only permitted changes are whitespace (indentation, spacing, blank lines)
// and comments (add, remove, or modify them).
// These changes are made extensively throughout the entire file so the result
// looks visually different but is logically and structurally identical.


// Global variable declaration for 'd'
var d;

// Initialize 'aa' based on '__ScalaJSEnv' or an empty object
var aa = "object" === typeof __ScalaJSEnv && __ScalaJSEnv ? __ScalaJSEnv : {};

// Determine the global object ('l')
var l = "object" === typeof aa.global && aa.global ? aa.global : "object" === typeof global && global && global.Object === Object ? global : this;

// Set global and exportsNamespace properties on 'aa'
aa.global = l;
aa.exportsNamespace = exports;

// Freeze the 'aa' object to prevent modifications
l.Object.freeze(aa);

// Initialize 'ba' with environment info, semantics, ES6 assumption, linker version, and globalThis
var ba = {
    envInfo: aa,
    semantics: {
        asInstanceOfs: 2,
        arrayIndexOutOfBounds: 2,
        moduleInit: 2,
        strictFloats: !1,
        productionMode: !0
    },
    assumingES6: !1,
    linkerVersion: "0.6.29",
    globalThis: this
};

// Freeze 'ba' and its 'semantics' property
l.Object.freeze(ba);
l.Object.freeze(ba.semantics);

// Polyfills for Math functions: imul, fround, clz32
var n = l.Math.imul || function(a, b) {
    var c = a & 65535,
        e = b & 65535;
    return c * e + ((a >>> 16 & 65535) * e + c * (b >>> 16 & 65535) << 16 >>> 0) | 0
},
ca = l.Math.fround || function(a) {
    return +a
},
da = l.Math.clz32 || function(a) {
    if (0 === a) return 32;
    var b = 1;
    0 === (a & 4294901760) && (a <<= 16, b += 16);
    0 === (a & 4278190080) && (a <<= 8, b += 8);
    0 === (a & 4026531840) && (a <<= 4, b += 4);
    0 === (a & 3221225472) && (a <<= 2, b += 2);
    return b + (a >> 31)
},
fa = 0,
ha = l.WeakMap ? new l.WeakMap : null;


// Function to check if an object 'b' is an instance of a class with specific class data properties
function ia(a) {
    return function(b, c) {
        return !(!b || !b.$classData || b.$classData.ih !== c || b.$classData.hh !== a)
    }
}

// Function to get the first enumerable property name of an object
function ja(a) {
    for (var b in a) return b
}

// Function to create a new instance of a class 'a' with a given 'b' value
function ka(a, b) {
    return new a.Ik(b)
}

// Wrapper for 'la' with a default 'c' value of 0
function r(a, b) {
    return la(a, b, 0)
}

// Recursive function to create a nested array structure based on 'a' and 'b'
function la(a, b, c) {
    var e = new a.Ik(b[c]);
    if (c < b.length - 1) {
        a = a.Xh;
        c += 1;
        for (var f = e.b, g = 0; g < f.length; g++) f[g] = la(a, b, c)
    }
    return e
}

// Function to convert a value to its string representation, or "undefined" if it's undefined
function ma(a) {
    return void 0 === a ? "undefined" : a.toString()
}

// Function to determine the class data for a given value 'a' based on its type
function na(a) {
    switch (typeof a) {
        case "string":
            return w(oa);
        case "number":
            var b = a | 0;
            return b === a ? pa(b) ? w(ra) : sa(b) ? w(ta) : w(ua) : wa(a) ? w(xa) : w(ya);
        case "boolean":
            return w(za);
        case "undefined":
            return w(Aa);
        default:
            return null === a ? a.xH() : a instanceof x ? w(Ba) : a && a.$classData ? w(a.$classData) : null
    }
}

// Function to compare two values 'a' and 'b' for equality, handling different types
function Ca(a, b) {
    return a && a.$classData || null === a ? a.t(b) : "number" === typeof a ? "number" === typeof b && (a === b ? 0 !== a || 1 / a === 1 / b : a !== a && b !== b) : a === b
}

// Function to calculate a hash code for a given value 'a'
function Da(a) {
    switch (typeof a) {
        case "string":
            return Ea(Fa(), a);
        case "number":
            return Ga(Ha(), a);
        case "boolean":
            return a ? 1231 : 1237;
        case "undefined":
            return 0;
        default:
            return a && a.$classData || null === a ? a.z() : null === ha ? 42 : Ia(a)
    }
}

// Function to clamp a number 'a' to the range of a 32-bit signed integer
function Ja(a) {
    return 2147483647 < a ? 2147483647 : -2147483648 > a ? -2147483648 : a | 0
}

// Function to copy a range of elements from one array to another, handling overlapping ranges
function Ka(a, b, c, e, f) {
    a = a.b;
    c = c.b;
    if (a !== c || e < b || (b + f | 0) < e)
        for (var g = 0; g < f; g = g + 1 | 0) c[e + g | 0] = a[b + g | 0];
    else
        for (g = f - 1 | 0; 0 <= g; g = g - 1 | 0) c[e + g | 0] = a[b + g | 0]
}

// Function to get or generate an ID hash code for an object
var Ia = null !== ha ? function(a) {
    switch (typeof a) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
            return Da(a);
        default:
            if (null === a) return 0;
            var b = ha.get(a);
            void 0 === b && (fa = b = fa + 1 | 0, ha.set(a, b));
            return b
    }
} : function(a) {
    if (a && a.$classData) {
        var b = a.$idHashCode$0;
        if (void 0 !== b) return b;
        if (l.Object.isSealed(a)) return 42;
        fa = b = fa + 1 | 0;
        return a.$idHashCode$0 = b
    }
    return null === a ? 0 : Da(a)
};

// Check if a number 'a' is a byte (8-bit signed integer)
function pa(a) {
    return "number" === typeof a && a << 24 >> 24 === a && 1 / a !== 1 / -0
}

// Check if a number 'a' is a short (16-bit signed integer)
function sa(a) {
    return "number" === typeof a && a << 16 >> 16 === a && 1 / a !== 1 / -0
}

// Check if a number 'a' is an integer (32-bit signed integer)
function La(a) {
    return "number" === typeof a && (a | 0) === a && 1 / a !== 1 / -0
}

// Check if a number 'a' is a double (floating-point number)
function wa(a) {
    return "number" === typeof a
}

// Return the 'mg' property of a 'y' object if 'a' is null, otherwise return 'a'
function Ma(a) {
    return null === a ? y().mg : a
}

// Na class constructor
function Na() {
    this.Ij = this.Ik = void 0;
    this.hh = this.Xh = this.qa = null;
    this.ih = 0;
    this.Ol = null;
    this.bj = "";
    this.Od = this.$i = this.aj = void 0;
    this.name = "";
    this.isRawJSType = this.isArrayClass = this.isInterface = this.isPrimitive = !1;
    this.isInstance = void 0
}

// Oa function to create a primitive type class data object
function Oa(a, b, c) {
    var e = new Na;
    e.qa = {};
    e.Xh = null;
    e.Ol = a;
    e.bj = b;
    e.Od = function() {
        return !1
    };
    e.name = c;
    e.isPrimitive = !0;
    e.isInstance = function() {
        return !1
    };
    return e
}

// z function to create a class data object for a non-primitive type
function z(a, b, c, e, f, g, h, k) {
    var m = new Na,
        p = ja(a);
    h = h || function(q) {
        return !!(q && q.$classData && q.$classData.qa[p])
    };
    k = k || function(q, t) {
        return !!(q && q.$classData && q.$classData.ih === t && q.$classData.hh.qa[p])
    };
    m.Ij = g;
    m.qa = e;
    m.bj = "L" + c + ";";
    m.Od = k;
    m.name = c;
    m.isInterface = b;
    m.isRawJSType = !!f;
    m.isInstance = h;
    return m
}

// Pa function to create an array class data object
function Pa(a) {
    function b(k) {
        if ("number" === typeof k) {
            this.b = Array(k);
            for (var m = 0; m < k; m++) this.b[m] = f
        } else this.b = k
    }
    var c = new Na,
        e = a.Ol,
        f = "longZero" == e ? y().mg : e;
    b.prototype = new A;
    b.prototype.constructor = b;
    b.prototype.mu = function() {
        return this.b instanceof Array ? new b(this.b.slice(0)) : new b(new this.b.constructor(this.b))
    };
    b.prototype.$classData = c;
    e = "[" + a.bj;
    var g = a.hh || a,
        h = a.ih + 1;
    c.Ik = b;
    c.Ij = C;
    c.qa = {
        c: 1,
        Ae: 1,
        d: 1
    };
    c.Xh = a;
    c.hh = g;
    c.ih = h;
    c.Ol = null;
    c.bj = e;
    c.aj = void 0;
    c.$i = void 0;
    c.Od = void 0;
    c.name = e;
    c.isPrimitive = !1;
    c.isInterface = !1;
    c.isArrayClass = !0;
    c.isInstance = function(k) {
        return g.Od(k, h)
    };
    return c
}

// w function to get the class data object for a given 'a'
function w(a) {
    if (!a.aj) {
        var b = new Qa;
        b.jd = a;
        a.aj = b
    }
    return a.aj
}

// D function to get the array class data object for a given 'a'
function D(a) {
    a.$i || (a.$i = Pa(a));
    return a.$i
}

// Na prototype methods
Na.prototype.getFakeInstance = function() {
    if (this === oa) return "some string";
    if (this === za) return !1;
    if (this === ra || this === ta || this === ua || this === xa || this === ya) return 0;
    if (this === Ba) return y().mg;
    if (this !== Aa) return {
        $classData: this
    }
};
Na.prototype.getSuperclass = function() {
    return this.Ij ? w(this.Ij) : null
};
Na.prototype.getComponentType = function() {
    return this.Xh ? w(this.Xh) : null
};
Na.prototype.newArrayOfThisClass = function(a) {
    for (var b = this, c = 0; c < a.length; c++) b = D(b);
    return r(b, a)
};

// Primitive type class data objects
var Ra = Oa(void 0, "V", "void"),
    Sa = Oa(!1, "Z", "boolean"),
    Ua = Oa(0, "C", "char"),
    Va = Oa(0, "B", "byte"),
    Wa = Oa(0, "S", "short"),
    E = Oa(0, "I", "int"),
    Xa = Oa("longZero", "J", "long"),
    Ya = Oa(0, "F", "float"),
    Za = Oa(0, "D", "double"),
    $a = ia(Sa);

// Set Od property for primitive types
Sa.Od = $a;
var bb = ia(Ua);
Ua.Od = bb;
var cb = ia(Va);
Va.Od = cb;
var db = ia(Wa);
Wa.Od = db;
var eb = ia(E);
E.Od = eb;
var fb = ia(Xa);
Xa.Od = fb;
var gb = ia(Ya);
Ya.Od = gb;
var hb = ia(Za);
Za.Od = hb;

// Require 'fs' module
var ib = require("fs");

// Function to compose two functions 'a' and 'b'
function jb(a, b) {
    return F(function(c, e) {
        return function(f) {
            return e.l(c.l(f))
        }
    }(a, b))
}

// Define kb as a class data object
var kb = z({
    tk: 0
}, !0, "scalax.collection.GraphEdge$Keyed", {
    tk: 1
});

// Function lb: calls mb.il, then Gb, then Ca
function lb(a, b, c) {
    return mb.il(b, c).Gb(a).Ca()
}

// Function nb: performs calculations based on 'a' and 'b'
function nb(a, b) {
    return 0 < b ? 0 < a.gd ? (b = b + a.gd | 0, b > a.Kd ? 0 : b) : 0 : 0 < a.Nd ? a.Nd : 0 < a.gd ? a.gd : 0
}

// Function ob: compares two objects based on their properties and a filter function
function ob(a, b) {
    return b && b.$classData && b.$classData.qa.Mt && b && b.$classData && b.$classData.qa.y && b && b.$classData && b.$classData.qa.p ? b.oa(a) && b.x() === a.x() && b.Wa(F(function(c) {
        return function(e) {
            a: {
                var f = e.Ga();f = null === f ? pb().Ee : f;
                var g = c.Dd.b.length;pb();
                var h = Ia(f);f = qb(c, f, ((h << 1) - (h << 8) | 0) & (-1 + g | 0), g);e = !(0 > f) && G(H(), c.Dd.b[1 + f | 0], e.Qa());
                break a;e = void 0
            }
            return e
        }
    }(a))) : !1
}

// Function qb: searches for an element in an array-like structure
function qb(a, b, c, e) {
    for (a = a.Dd;;) {
        var f = a.b[c];
        if (f === b) return c;
        if (null === f) return ~c;
        c = 2 + c | 0;
        c = c < e ? c : 0
    }
}

// rb class constructor (empty)
function rb() {}

// A class constructor (empty)
function A() {}

// Set A's prototype to rb's prototype
A.prototype = rb.prototype;

// rb prototype methods
rb.prototype.a = function() {
    return this
};
rb.prototype.t = function(a) {
    return this === a
};
rb.prototype.n = function() {
    var a = sb(na(this)),
        b = (+(this.z() >>> 0)).toString(16);
    return a + "@" + b
};
rb.prototype.z = function() {
    return Ia(this)
};
rb.prototype.toString = function() {
    return this.n()
};

// ub function to check if an object is an instance of a class with specific hierarchy properties
function ub(a, b) {
    if (a = a && a.$classData) {
        var c = a.ih || 0;
        return !(c < b) && (c > b || !a.hh.isPrimitive)
    }
    return !1
}

// C class data object
var C = z({
    c: 0
}, !1, "java.lang.Object", {
    c: 1
}, void 0, void 0, function(a) {
    return null !== a
}, ub);

// Set rb's $classData to C
rb.prototype.$classData = C;

// vb function to compare 'a' with 'b' based on their types and values
function vb(a, b) {
    if (b instanceof wb) return b = null === b ? 0 : b.s, a.yj() && a.Xc() === b;
    if (pa(b)) return b |= 0, a.xj() && a.Th() === b;
    if (sa(b)) return b |= 0, a.Aj() && a.zi() === b;
    if (La(b)) return b |= 0, a.hi() && a.Xc() === b;
    if (b instanceof x) {
        var c = Ma(b);
        b = c.f;
        c = c.i;
        a = a.Yc();
        var e = a.i;
        return a.f === b && e === c
    }
    return wa(b) ? (b = +b, a.Kf() === b) : "number" === typeof b ? (b = +b, a.ee() === b) : !1
}

// xb function to compare two iterators 'a' and 'b' for equality
function xb(a, b) {
    a = yb(a);
    if (!a.r()) return !b.r();
    for (var c = zb(a); b.r();)
        for (var e = b.u();;) {
            var f = e | 0,
                g = c | 0;
            f = f === g ? 0 : f < g ? -1 : 1;
            if (0 !== f) {
                if (0 > f || !a.r()) return !1;
                f = !0
            } else f = !1;
            if (f) c = zb(a);
            else break
        }
    return !0
}

// I function to create a new array with elements copied from 'a.b'
function I(a) {
    var b = r(D(C), [a.b.length]);
    Ka(a, 0, b, 0, a.b.length);
    return b
}

// Ab function to access an element in a multi-level array structure based on 'b' and 'c'
function Ab(a, b, c) {
    if (32 > c) return a.mb().b[31 & b];
    if (1024 > c) return a.L().b[31 & (b >>> 5 | 0)].b[31 & b];
    if (32768 > c) return a.X().b[31 & (b >>> 10 | 0)].b[31 & (b >>> 5 | 0)].b[31 & b];
    if (1048576 > c) return a.ta().b[31 & (b >>> 15 | 0)].b[31 & (b >>> 10 | 0)].b[31 & (b >>> 5 | 0)].b[31 & b];
    if (33554432 > c) return a.gb().b[31 & (b >>> 20 | 0)].b[31 & (b >>> 15 | 0)].b[31 & (b >>> 10 | 0)].b[31 & (b >>> 5 | 0)].b[31 & b];
    if (1073741824 > c) return a.Rc().b[31 & (b >>> 25 | 0)].b[31 & (b >>> 20 | 0)].b[31 & (b >>> 15 | 0)].b[31 & (b >>> 10 | 0)].b[31 & (b >>> 5 | 0)].b[31 & b];
    throw (new Bb).a();
}

// Cb function to update references in a multi-level array structure based on 'b' and 'c'
function Cb(a, b, c) {
    if (!(32 > c))
        if (1024 > c) a.La(a.L().b[31 & (b >>> 5 | 0)]);
        else if (32768 > c) a.xa(a.X().b[31 & (b >>> 10 | 0)]), a.La(a.L().b[31 & (b >>> 5 | 0)]);
    else if (1048576 > c) a.ab(a.ta().b[31 & (b >>> 15 | 0)]), a.xa(a.X().b[31 & (b >>> 10 | 0)]), a.La(a.L().b[31 & (b >>> 5 | 0)]);
    else if (33554432 > c) a.Ib(a.gb().b[31 & (b >>> 20 | 0)]), a.ab(a.ta().b[31 & (b >>> 15 | 0)]), a.xa(a.X().b[31 & (b >>> 10 | 0)]), a.La(a.L().b[31 & (b >>> 5 | 0)]);
    else if (1073741824 > c) a.Qc(a.Rc().b[31 & (b >>> 25 | 0)]), a.Ib(a.gb().b[31 & (b >>> 20 | 0)]), a.ab(a.ta().b[31 & (b >>> 15 | 0)]), a.xa(a.X().b[31 & (b >>> 10 | 0)]), a.La(a.L().b[31 & (b >>> 5 | 0)]);
    else throw (new Bb).a();
}

// Db function to remove an element from an array and return it as a new array
function Db(a, b) {
    var c = a.b[b];
    a.b[b] = null;
    return I(c)
}

// Eb function to update array structure based on 'c' level
function Eb(a, b, c) {
    a.Ef(c);
    c = -1 + c | 0;
    switch (c) {
        case -1:
            break;
        case 0:
            a.La(b.mb());
            break;
        case 1:
            a.xa(b.L());
            a.La(b.mb());
            break;
        case 2:
            a.ab(b.X());
            a.xa(b.L());
            a.La(b.mb());
            break;
        case 3:
            a.Ib(b.ta());
            a.ab(b.X());
            a.xa(b.L());
            a.La(b.mb());
            break;
        case 4:
            a.Qc(b.gb());
            a.Ib(b.ta());
            a.ab(b.X());
            a.xa(b.L());
            a.La(b.mb());
            break;
        case 5:
            a.tg(b.Rc());
            a.Qc(b.gb());
            a.Ib(b.ta());
            a.ab(b.X());
            a.xa(b.L());
            a.La(b.mb());
            break;
        default:
            throw (new J).j(c);
    }
}

// Fb function to return a default object if 'a' is null
function Fb(a) {
    return null === a ? Gb() : a
}

// Hb function to return null if 'a' is a specific default object
function Hb(a) {
    return a === Gb() ? null : a
}

// Ib class constructor (empty)
function Ib() {}

// Ib prototype methods
Ib.prototype = new A;
Ib.prototype.constructor = Ib;
Ib.prototype.a = function() {
    return this
};

// Jb function: initializes Kb if needed, then returns a new Nb with an Ob function
function Jb(a, b) {
    Kb || (Kb = (new Lb).a());
    var c = Kb.Io;
    Mb();
    return (new Nb).ge(Ob(function(e, f, g) {
        return function() {
            var h = Pb().Xn;
            Qb();
            var k = new Rb;
            k.la = f;
            k.Po = g;
            k = k.Po.Jo(k.la);
            Sb(h, null === k ? "null" : k);
            Sb(h, "\n")
        }
    }(a, b, c)))
}

// Tb function: processes data using several helper functions
function Tb(a, b) {
    b.w();
    b.w();
    var c = b.cb();
    b = function() {
        return function(h) {
            if (null !== h) return (new Ub).af((new K).Q(h.bk(), h.dk()));
            throw (new J).j(h);
        }
    }(a);
    var e = L().G;
    if (e === L().G)
        if (c === M()) b = M();
        else {
            e = c.w();
            var f = e = Vb(new N, b(e), M());
            for (c = c.cb(); c !== M();) {
                var g = c.w();
                g = Vb(new N, b(g), M());
                f = f.uc = g;
                c = c.cb()
            }
            b = e
        }
    else {
        for (e = Wb(c, e); !c.m();) f = c.w(), e.Ta(b(f)), c = c.cb();
        b = e.Ca()
    }
    c = Xb();
    e = Yb();
    mb || (mb = (new Zb).a());
    b = lb(b, c, e);
    b = $b(b);
    a = ac(b, F(function() {
        return function(h) {
            Qb();
            var k = new bc;
            k.Hl = h.ac;
            h = k.na();
            k = Qb().dj;
            return cc(dc(h, k), 0)
        }
    }(a)));
    a: {
        for (; a.r();) {
            b = a.u();
            c = ec(b.ac.Za);
            for (e = !0; e && c.r();) e = c.u(), Qb(), f = fc(e), g = L().G, f = O(f, g), f = gc(f), g = Qb().dj, cc(dc(f, g), 1) ? (Qb(), e = hc(e), f = L().G, e = O(e, f), e = gc(e), f = Qb().dj, e = cc(dc(e, f), 1)) : e = !1;
            if (e) {
                a = (new Q).j(b);
                break a
            }
        }
        a = R()
    }
    if (a.m()) a = R();
    else {
        a = a.Nb().ac;
        b = ic();
        b = jc(b);
        b = Wb(a, b);
        for (a = ec(a.Za); a.r();) c = a.u(), b.Ta(c.E | 0);
        a = (new Q).j(b.Ca().lb())
    }
    return kc(a)
}

// lc function: reads from /dev/stdin, then calls mc and Oh
function lc(a) {
    r(D(oa), [0]);
    Mb();
    a = (new Nb).ge(Ob(function() {
        return function() {
            return ib.readFileSync("/dev/stdin", "utf8")
        }
    }(a)));
    var b = mc();
    return nc().Oh(a, b)
}

// oc function: calls pc, then ge, then lf, then Xe
function oc(a, b) {
    var c = pc();
    return (new qc).ge(Ob(function(e, f) {
        return function() {
            return f
        }
    }(a, c))).lf().Xe(b)
}

// Ib prototype $classData
Ib.prototype.$classData = z({
    Yo: 0
}, !1, "atcoder.ABC142F$", {
    Yo: 1,
    c: 1
});

// rc global variable
var rc = void 0;

// sc function: initializes and returns rc
function sc() {
    rc || (rc = (new Ib).a());
    return rc
}

// tc class constructor (empty)
function tc() {}

// tc prototype methods
tc.prototype = new A;
tc.prototype.constructor = tc;
tc.prototype.a = function() {
    return this
};

// uc function: processes a list 'b' based on its type
function uc(a, b, c) {
    if (M().t(b)) return Qb(), c = M(), vc(), (new wc).j(c);
    if (b instanceof N) return a = b.uc, b = c.Xe(b.th), b instanceof wc ? (b = b.E, c = uc(xc(), a, c), c instanceof wc ? (new wc).j(Vb(new N, b, c.E)) : c) : b;
    throw (new J).j(b);
}

// yc function: creates a new zc object with a function that handles string conversion errors
function yc() {
    var a = xc();
    return (new zc).j(function() {
        return function(b) {
            if ("" === b) {
                Qb();
                var c = Ac();
                vc();
                return (new wc).j(c)
            }
            Qb();
            c = (new Bc).h("Cannot convert '");
            b = (new Bc).h(b);
            var e = Cc().Nh;
            c = Dc(c, b, e);
            c = (new Bc).h(c);
            b = (new Bc).h("' to HNil");
            e = Cc().Nh;
            c = (new Ec).h(Dc(c, b, e));
            vc();
            return (new Fc).j(c)
        }
    }(a))
}

// Gc function: creates a new Hc object with a function to process input strings
function Gc(a, b) {
    return (new Hc).j(function(c, e) {
        return function(f) {
            xc();
            f = Ic(Fa(), f, "\n");
            for (var g = -1 + f.b.length | 0, h = M(); 0 <= g;) h = Vb(new N, f.b[g], h), g = -1 + g | 0;
            return uc(0, h, e)
        }
    }(a, b))
}

// Jc function: creates a new Kc object with a function that processes input 'g'
function Jc(a, b, c) {
    return (new Kc).j(function(e, f) {
        return function(g) {
            g = f.Xe(g);
            return g instanceof wc ? (new wc).j(Lc(g.E)) : g
        }
    }(a, c, b))
}

// Mc function: creates a new Nc object with a function to parse and convert a string to an HList
function Mc(a, b, c) {
    return (new Nc).j(function(e, f, g) {
        return function(h) {
            for (var k = (new Bc).h(h), m = k.ob.length | 0, p = 0;;) {
                if (p < m) {
                    var q = k.db(p);
                    q = 32 !== (null === q ? 0 : q.s)
                } else q = !1;
                if (q) p = 1 + p | 0;
                else break
            }
            m = p;
            k = (new K).Q(k.Rg(0, m), k.Rg(m, k.na()));
            if (null !== k) {
                h = k.Ga();
                m = k.Qa();
                h = f.lf().Xe(h);
                if (h instanceof wc) {
                    h = h.E;
                    k = g.lf();
                    if (null === m) throw (new Oc).a();
                    if ("" !== m)
                        if (m = (new Bc).h(m), 0 === m.na()) {
                            if (m.m()) throw (new Pc).h("empty.tail");
                            m = m.Tb(1)
                        } else m = m.Rg(1, m.na());
                    k = k.Xe(m);
                    return k instanceof wc ? (new wc).j(Qc(Rc(k.E), h)) : k
                }
                return h
            }
            Qb();
            k = (new Bc).h("Cannot convert '");
            h = (new Bc).h(h);
            m = Cc().Nh;
            h = Dc(k, h, m);
            h = (new Bc).h(h);
            k = (new Bc).h("' to HList");
            m = Cc().Nh;
            h = (new Ec).h(Dc(h, k, m));
            vc();
            return (new Fc).j(h)
        }
    }(a, b, c))
}

// Sc function: creates a new Tc object with a function to parse a string to an integer
function Sc() {
    var a = xc();
    return (new Tc).j(function() {
        return function(b) {
            Qb();
            vc();
            Uc || (Uc = (new Vc).a());
            try {
                vc();
                var c = (new Bc).h(b),
                    e = Wc(Xc(), c.ob, 10);
                return (new wc).j(e)
            } catch (f) {
                b = Yc(S(), f);
                if (null !== b) {
                    if (Zc(w($c), b)) return vc(), (new Fc).j(b);
                    throw T(S(), b);
                }
                throw f;
            }
        }
    }(a))
}

// tc prototype $classData
tc.prototype.$classData = z({
    dp: 0
}, !1, "atcoder.StdInConverter$", {
    dp: 1,
    c: 1
});

// ad global variable
var ad = void 0;

// xc function: initializes and returns ad
function xc() {
    ad || (ad = (new tc).a());
    return ad
}

// Vc class constructor (empty)
function Vc() {}

// Vc prototype methods
Vc.prototype = new A;
Vc.prototype.constructor = Vc;
Vc.prototype.a = function() {
    Uc = this;
    (new bd).a();
    return this
};

// Vc prototype $classData
Vc.prototype.$classData = z({
    tp: 0
}, !1, "cats.NotNull$", {
    tp: 1,
    c: 1
});

// Uc global variable
var Uc = void 0;

// cd class constructor (empty)
function cd() {}

// cd prototype methods
cd.prototype = new A;
cd.prototype.constructor = cd;
cd.prototype.a = function() {
    return this
};
cd.prototype.Oh = function(a, b) {
    var c = vc().jk;
    return (new dd).j(b.ni(a, F(function() {
        return function(e) {
            vc();
            return (new Fc).j(e)
        }
    }(this, c))))
};

// cd prototype $classData
cd.prototype.$classData = z({
    Gp: 0
}, !1, "cats.data.EitherT$LeftPartiallyApplied$", {
    Gp: 1,
    c: 1
});

// ed global variable
var ed = void 0;

// fd class constructor (empty)
function fd() {}

// fd prototype methods
fd.prototype = new A;
fd.prototype.constructor = fd;
fd.prototype.a = function() {
    return this
};

// fd prototype $classData
fd.prototype.$classData = z({
    Hp: 0
}, !1, "cats.data.EitherT$PurePartiallyApplied$", {
    Hp: 1,
    c: 1
});

// gd global variable
var gd = void 0;

// hd class constructor (empty)
function hd() {}

// hd prototype methods
hd.prototype = new A;
hd.prototype.constructor = hd;
hd.prototype.a = function() {
    return this
};
hd.prototype.Oh = function(a, b) {
    var c = vc().jk;
    return (new dd).j(b.ni(a, F(function() {
        return function(e) {
            vc();
            return (new wc).j(e)
        }
    }(this, c))))
};

// hd prototype $classData
hd.prototype.$classData = z({
    Ip: 0
}, !1, "cats.data.EitherT$RightPartiallyApplied$", {
    Ip: 1,
    c: 1
});

// id global variable
var id = void 0;

// nc function: initializes and returns id
function nc() {
    id || (id = (new hd).a());
    return id
}

// jd class constructor (empty)
function jd() {}

// jd prototype methods
jd.prototype = new A;
jd.prototype.constructor = jd;

// kd class constructor (inherits from jd)
function kd() {}

// Set kd's prototype to jd's prototype
kd.prototype = jd.prototype;

// ld class constructor
function ld() {
    this.lo = null;
    this.ma = 0
}

// ld prototype methods
ld.prototype = new A;
ld.prototype.constructor = ld;
ld.prototype.a = function() {
    md = this;
    this.lo = F(function() {
        return function(a) {
            a instanceof Fc && (a = a.E, nd().l(a))
        }
    }(this));
    this.ma = (1 | this.ma) << 24 >> 24;
    vc();
    (new wc).j(void 0);
    this.ma = (2 | this.ma) << 24 >> 24;
    (new od).j(void 0);
    this.ma = (4 | this.ma) << 24 >> 24;
    this.ma = (8 | this.ma) << 24 >> 24;
    return this
};

// ld prototype $classData
ld.prototype.$classData = z({
    Xp: 0
}, !1, "cats.effect.internals.Callback$", {
    Xp: 1,
    c: 1
});

// md global variable
var md = void 0;

// pd function: initializes and returns md
function pd() {
    md || (md = (new ld).a());
    return md
}

// qd class constructor (empty)
function qd() {}

// qd prototype methods
qd.prototype = new A;
qd.prototype.constructor = qd;
qd.prototype.a = function() {
    return this
};

// rd function: returns a new td object if 'b' is not empty
function rd(a, b) {
    if (!b.r()) return sd();
    Mb();
    return (new td).ge(Ob(function(c, e) {
        return function() {
            return ud((new vd).bl(e))
        }
    }(a, b)))
}

// qd prototype $classData
qd.prototype.$classData = z({
    Zp: 0
}, !1, "cats.effect.internals.CancelUtils$", {
    Zp: 1,
    c: 1
});

// wd global variable
var wd = void 0;

// xd class constructor (empty)
function xd() {}

// xd prototype methods
xd.prototype = new A;
xd.prototype.constructor = xd;

// yd class constructor (inherits from xd)
function yd() {}

// Set yd's prototype to xd's prototype
yd.prototype = xd.prototype;

// zd class constructor
function zd() {
    this.Qo = null;
    this.ma = !1
}

// zd prototype methods
zd.prototype = new A;
zd.prototype.constructor = zd;
zd.prototype.a = function() {
    Ad = this;
    this.Qo = (new Cd).a();
    this.ma = !0;
    return this
};

// zd prototype $classData
zd.prototype.$classData = z({
    bq: 0
}, !1, "cats.effect.internals.IOConnection$", {
    bq: 1,
    c: 1
});

// Ad global variable
var Ad = void 0;

// Dd function: initializes and returns Ad
function Dd() {
    Ad || (Ad = (new zd).a());
    return Ad
}

// Ed class constructor (empty)
function Ed() {}

// Ed prototype methods
Ed.prototype = new A;
Ed.prototype.constructor = Ed;
Ed.prototype.a = function() {
    return this
};

// Ed prototype $classData
Ed.prototype.$classData = z({
    fq: 0
}, !1, "cats.effect.internals.IOPlatform$", {
    fq: 1,
    c: 1
});

// Fd global variable
var Fd = void 0;

// Gd class constructor
function Gd() {
    this.Pn = 0;
    this.ma = !1
}

// Gd prototype methods
Gd.prototype = new A;
Gd.prototype.constructor = Gd;

// Hd function: returns 'a' if not null, otherwise tries to get an element from 'b'
function Hd(a, b) {
    if (null !== a) return a;
    if (null === b) return null;
    for (;;) return a = Id(b), null === a ? null : a
}

// Gd prototype a method
Gd.prototype.a = function() {
    this.Pn = 512;
    this.ma = !0;
    return this
};

// Jd function: returns 'a' if it's a Kd, otherwise tries to get a Kd element from 'b'
function Jd(a, b) {
    if (a instanceof Kd) return a;
    if (null === b) return null;
    for (;;) {
        a = Id(b);
        if (null === a) return null;
        if (a instanceof Kd) return a
    }
}

// Ld function: processes based on 'c' and 'e'
function Ld(a, b, c, e) {
    return null !== c || null !== e && !e.m() ? Md(new Nd, Od(function(f, g, h, k) {
        return function(m, p) {
            Pd(Qd(), g, m, p, null, h, k)
        }
    }(a, b, c, e))) : b
}

// Rd function: attempts to execute 'a' and handle exceptions
function Rd(a) {
    try {
        return Sd(a)
    } catch (c) {
        a = Yc(S(), c);
        if (null !== a) {
            var b = Td(Ud(), a);
            if (!b.m()) return a = b.Nb(), Vd(a);
            throw T(S(), a);
        }
        throw c;
    }
}

// Pd function: main IORunLoop processing logic
function Pd(a, b, c, e, f, g, h) {
    var k = b;
    b = g;
    var m = !1,
        p = null;
    for (g = 0;;) {
        var q = k;
        if (q instanceof Wd) k = q.Xb, q = q.Jb, null !== b && (null === h && (h = (new Xd).a()), Yd(h, b)), b = q;
        else if (q instanceof Zd) p = q.yf, m = !0;
        else if (q instanceof Nb) {
            q = q.Ed;
            try {
                p = Sd(q), m = !0, k = null
            } catch (ea) {
                if (k = Yc(S(), ea), null !== k) {
                    q = Td(Ud(), k);
                    if (q.m()) throw T(S(), k);
                    k = q.Nb();
                    k = Vd(k)
                } else throw ea;
            }
        } else if (q instanceof td) a: try {
            k = Sd(q.Ed)
        } catch (ea) {
            k = Yc(S(), ea);
            if (null !== k) {
                q = Td(Ud(), k);
                if (!q.m()) {
                    k = q.Nb();
                    k = Vd(k);
                    break a
                }
                throw T(S(), k);
            }
            throw ea;
        } else if (q instanceof $d) {
            k = q.Gf;
            b = Jd(b, h);
            if (null === b) {
                e.l((vc(), (new Fc).j(k)));
                break
            }
            try {
                var t = b.ml(k)
            } catch (ea) {
                if (t = Yc(S(), ea), null !== t) {
                    b = Td(Ud(), t);
                    if (b.m()) throw T(S(), t);
                    t = b.Nb();
                    t = Vd(t)
                } else throw ea;
            }
            b = null;
            k = t
        } else if (q instanceof ae) k = q, q = k.Xb, null !== b && (null === h && (h = (new Xd).a()), Yd(h, b)), b = k, k = q;
        else {
            if (q instanceof Nd) {
                a = q;
                null === c && (Dd(), c = (new be).a());
                null === f && (f = (new ce).Yk(c, e));
                e = f;
                c = b;
                e.pg = !0;
                e.Ek = c;
                e.Fk = h;
                e.Ml = a.Dh;
                de(a.vh, e.xe, e);
                break
            }
            if (q instanceof ee) {
                var u = q.Xb;
                k = q.qi;
                var v = q.Hg;
                q = null !== c ? c : (Dd(), (new be).a());
                c = k.l(q);
                k = u;
                if (c !== q && (null !== f && (f.xe = c), null !== v)) {
                    k = new Wd;
                    var B = new fe;
                    B.ll = q;
                    B.Hg = v;
                    k = ge(k, u, B)
                }
            } else throw (new J).j(q);
        }
        if (m) {
            b = Hd(b, h);
            if (null === b) {
                vc();
                e.l((new wc).j(p));
                break
            }
            try {
                var P = b.l(p)
            } catch (ea) {
                if (P = Yc(S(), ea), null !== P) {
                    b = Td(Ud(), P);
                    if (b.m()) throw T(S(), P);
                    P = b.Nb();
                    P = Vd(P)
                } else throw ea;
            }
            m = !1;
            b = p = null;
            k = P
        }
        g = 1 + g | 0;
        if (g === a.Pn) {
            if (c.el()) break;
            g = 0
        }
    }
}

// he function: processes an IO action 'b' with error handling and context restoration
function he(a, b) {
    b = (new ie).j(b);
    var c = (new ie).j(null),
        e = (new ie).j(null),
        f = !1,
        g = null;
    for (g = null;;) {
        var h = b.o;
        if (h instanceof Wd) {
            var k = h;
            h = k.Xb;
            k = k.Jb;
            null !== c.o && (null === e.o && (e.o = (new Xd).a()), Yd(e.o, c.o));
            c.o = k;
            b.o = h
        } else if (h instanceof Zd) g = h.yf, f = !0;
        else if (h instanceof Nb) {
            h = h.Ed;
            try {
                g = Sd(h), f = !0, b.o = null
            } catch (q) {
                if (h = Yc(S(), q), null !== h) {
                    k = Td(Ud(), h);
                    if (k.m()) throw T(S(), h);
                    h = k.Nb();
                    b.o = Vd(h)
                } else throw q;
            }
        } else if (h instanceof td) b.o = Rd(h.Ed);
        else if (h instanceof $d) {
            h = h.Gf;
            k = Jd(c.o, e.o);
            if (null === k) return b.o;
            try {
                var m = k.ml(h)
            } catch (q) {
                if (m = Yc(S(), q), null !== m) {
                    h = Td(Ud(), m);
                    if (h.m()) throw T(S(), m);
                    m = h.Nb();
                    m = Vd(m)
                } else throw q;
            }
            c.o = null;
            b.o = m
        } else if (h instanceof ae) k = h.Xb, null !== c.o && (null === e.o && (e.o = (new Xd).a()), Yd(e.o, c.o)), c.o = h, b.o = k;
        else return h instanceof Nd ? Ld(a, b.o, c.o, e.o) : Md(new Nd, Od(function(q, t, u, v) {
            return function(B, P) {
                Pd(Qd(), t.o, B, P, null, u.o, v.o)
            }
        }(a, b, c, e)));
        if (f) {
            f = Hd(c.o, e.o);
            if (null === f) return null !== b.o ? b.o : (new Zd).j(g);
            try {
                var p = f.l(g)
            } catch (q) {
                if (p = Yc(S(), q), null !== p) {
                    g = Td(Ud(), p);
                    if (g.m()) throw T(S(), g);
                    p = g.Nb();
                    p = Vd(p)
                } else throw q;
            }
            b.o = p;
            f = !1;
            g = null;
            c.o = null
        }
    }
}

// Gd prototype $classData
Gd.prototype.$classData = z({
    hq: 0
}, !1, "cats.effect.internals.IORunLoop$", {
    hq: 1,
    c: 1
});

// je global variable
var je = void 0;

// Qd function: initializes and returns je
function Qd() {
    je || (je = (new Gd).a());
    return je
}

// ke class constructor
function ke() {
    this.Nn = null;
    this.q = !1
}

// ke prototype methods
ke.prototype = new A;
ke.prototype.constructor = ke;
ke.prototype.a = function() {
    return this
};

// nd function: initializes and returns le.Nn
function nd() {
    le || (le = (new ke).a());
    var a = le;
    a.q || a.q || (a.Nn = me(), a.q = !0);
    return a.Nn
}

// ke prototype $classData
ke.prototype.$classData = z({
    kq: 0
}, !1, "cats.effect.internals.Logger$", {
    kq: 1,
    c: 1
});

// le global variable
var le = void 0;

// ne class constructor
function ne() {
    this.qg = this.Eh = null;
    this.Zj = !1;
    this.ma = 0
}

// ne prototype methods
ne.prototype = new A;
ne.prototype.constructor = ne;

// oe function: processes elements from 'b' and handles exceptions
function oe(a, b) {
    a: for (;;) {
        try {
            b.Lj()
        } catch (g) {
            if (b = Yc(S(), g), null !== b) {
                var c = a,
                    e = Id(c.qg);
                if (null !== e) {
                    var f = c.qg;
                    c.qg = (new Xd).a();
                    c.Eh.oh(pe(c, e, f))
                }
                Ud();
                if (b && b.$classData && b.$classData.qa.rl) throw T(S(), b);
                a.Eh.ol(b)
            } else throw g;
        }
        b = Id(a.qg);
        if (null !== b) continue a;
        break
    }
}

// ne prototype al method
ne.prototype.al = function(a) {
    this.Eh = a;
    this.qg = (new Xd).a();
    this.ma = (1 | this.ma) << 24 >> 24;
    this.Zj = !1;
    this.ma = (2 | this.ma) << 24 >> 24;
    return this
};

// ne prototype oh method
ne.prototype.oh = function(a) {
    if (this.Zj) Yd(this.qg, a);
    else {
        this.Zj = !0;
        try {
            oe(this, a)
        } finally {
            this.Zj = !1
        }
    }
};

// ne prototype $classData
ne.prototype.$classData = z({
    lq: 0
}, !1, "cats.effect.internals.Trampoline", {
    lq: 1,
    c: 1
});

// qe class constructor
function qe() {
    this.ln = null;
    this.ma = !1
}

// qe prototype methods
qe.prototype = new A;
qe.prototype.constructor = qe;
qe.prototype.a = function() {
    re = this;
    this.ln = (new se).al((new te).a());
    this.ma = !0;
    return this
};

// ue function: initializes and returns re.ln
function ue() {
    re || (re = (new qe).a());
    var a = re;
    if (!a.ma) throw (new ve).h("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/js/src/main/scala/cats/effect/internals/TrampolineEC.scala: 47");
    return a.ln
}

// qe prototype $classData
qe.prototype.$classData = z({
    oq: 0
}, !1, "cats.effect.internals.TrampolineEC$", {
    oq: 1,
    c: 1
});

// re global variable
var re = void 0;

// we class constructor (empty)
function we() {}

// we prototype methods
we.prototype = new A;
we.prototype.constructor = we;

// xe class constructor (inherits from we)
function xe() {}

// Set xe's prototype to we's prototype
xe.prototype = we.prototype;

// ye class constructor (empty)
function ye() {}

// ye prototype methods
ye.prototype = new A;
ye.prototype.constructor = ye;

// ze class constructor (inherits from ye)
function ze() {}

// Set ze's prototype to ye's prototype
ze.prototype = ye.prototype;

// Ae class constructor
function Ae() {
    this.Bm = null
}

// Ae prototype methods
Ae.prototype = new A;
Ae.prototype.constructor = Ae;
Ae.prototype.a = function() {
    Be = this;
    this.Bm = (new Ce).a();
    (new De).a();
    (new Ee).a();
    (new Ee).a();
    Fe || (Fe = (new Ge).a());
    He || (He = (new Ie).a());
    Je || (Je = (new Ke).a());
    Le || (Le = (new Ne).a());
    Oe || (Oe = (new Pe).a());
    Qe || (Qe = (new Re).a());
    Se || (Se = (new Te).a());
    Ue || (Ue = (new Ve).a());
    return this
};

// Ae prototype $classData
Ae.prototype.$classData = z({
    ts: 0
}, !1, "cats.package$", {
    ts: 1,
    c: 1
});

// Be global variable
var Be = void 0;

// We function: initializes and returns Be
function We() {
    Be || (Be = (new Ae).a());
    return Be
}

// Xe class constructor (empty)
function Xe() {}

// Xe prototype methods
Xe.prototype = new A;
Xe.prototype.constructor = Xe;
Xe.prototype.a = function() {
    return this
};

// Xe prototype $classData
Xe.prototype.$classData = z({
    ws: 0
}, !1, "cats.syntax.EitherOps$", {
    ws: 1,
    c: 1
});

// Ye global variable
var Ye = void 0;

// Ze class constructor
function Ze() {
    this.Kj = this.Jj = null
}

// Ze prototype methods
Ze.prototype = new A;
Ze.prototype.constructor = Ze;

// dc function: creates and returns a new Ze object
function dc(a, b) {
    var c = new Ze;
    c.Mn = a;
    c.gn = b;
    return c
}

// cc function: calls gn.Bc on a.Mn and b
function cc(a, b) {
    We();
    return a.gn.Bc(a.Mn, b)
}

// Ze prototype $classData
Ze.prototype.$classData = z({
    xs: 0
}, !1, "cats.syntax.EqOps", {
    xs: 1,
    c: 1
});

// $e class constructor
function $e() {
    this.Kj = this.Jj = null
}

// $e prototype methods
$e.prototype = new A;
$e.prototype.constructor = $e;

// af function: returns a new bf array with Jj and Kj
function af(a) {
    return ka(D(bf), [a.Jj, a.Kj])
}

// cf function: sets Jj and Kj properties and returns 'a'
function cf(a, b, c) {
    a.Jj = b;
    a.Kj = c;
    return a
}

// $e prototype $classData
$e.prototype.$classData = z({
    Ds: 0
}, !1, "java.math.BigInteger$QuotAndRem", {
    Ds: 1,
    c: 1
});

// df class constructor (empty)
function df() {}

// df prototype methods
df.prototype = new A;
df.prototype.constructor = df;
df.prototype.a = function() {
    return this
};

// ef function: performs a bit shift operation on an array 'c' and stores it in 'b'
function ef(a, b, c, e) {
    for (var f = a = 0; f < e;) {
        var g = f,
            h = c.b[g];
        b.b[g] = h << 1 | a;
        a = h >>> 31 | 0;
        f = 1 + f | 0
    }
    0 !== a && (b.b[e] = a)
}

// ff function: performs a right bit shift operation on 'b' and returns a new hf object
function ff(a, b, c) {
    a = c >> 5;
    c &= 31;
    var e = (b.ga + a | 0) + (0 === c ? 0 : 1) | 0,
        f = r(D(E), [e]);
    gf(0, f, b.H, a, c);
    b = hf(b.N, e, f);
    jf(b);
    return b
}

// kf function: performs a left bit shift operation on 'b' and returns a new hf object
function kf(a, b, c) {
    a = c >> 5;
    var e = 31 & c;
    if (a >= b.ga) return 0 > b.N ? lf().Si : lf().be;
    c = b.ga - a | 0;
    var f = r(D(E), [1 + c | 0]);
    mf(0, f, c, b.H, a, e);
    if (0 > b.N) {
        for (var g = 0; g < a && 0 === b.H.b[g];) g = 1 + g | 0;
        var h = 0 !== b.H.b[g] << (32 - e | 0);
        if (g < a || 0 < e && h) {
            for (g = 0; g < c && -1 === f.b[g];) f.b[g] = 0, g = 1 + g | 0;
            g === c && (c = 1 + c | 0);
            a = g;
            f.b[a] = 1 + f.b[a] | 0
        }
    }
    b = hf(b.N, c, f);
    jf(b);
    return b
}

// nf function: calculates the number of bits in 'b'
function nf(a, b) {
    if (0 === b.N) return 0;
    a = b.ga << 5;
    var c = b.H.b[-1 + b.ga | 0];
    0 > b.N && of (b) === (-1 + b.ga | 0) && (c = -1 + c | 0);
    return a = a - da(c) | 0
}

// mf function: copies a portion of an array 'e' to 'b' with a bit shift
function mf(a, b, c, e, f, g) {
    for (a = 0; a < f;) a = 1 + a | 0;
    if (0 === g) Ka(e, f, b, 0, c);
    else {
        var h = 32 - g | 0;
        for (a = 0; a < (-1 + c | 0);) b.b[a] = e.b[a + f | 0] >>> g | 0 | e.b[1 + (a + f | 0) | 0] << h, a = 1 + a | 0;
        b.b[a] = e.b[a + f | 0] >>> g | 0
    }
}

// gf function: shifts elements of 'c' into 'b'
function gf(a, b, c, e, f) {
    if (0 === f) Ka(c, 0, b, e, b.b.length - e | 0);
    else {
        a = 32 - f | 0;
        b.b[-1 + b.b.length | 0] = 0;
        for (var g = -1 + b.b.length | 0; g > e;) {
            var h = g;
            b.b[h] = b.b[h] | c.b[-1 + (g - e | 0) | 0] >>> a | 0;
            b.b[-1 + g | 0] = c.b[-1 + (g - e | 0) | 0] << f;
            g = -1 + g | 0
        }
    }
    for (c = 0; c < e;) b.b[c] = 0, c = 1 + c | 0
}

// df prototype $classData
df.prototype.$classData = z({
    Es: 0
}, !1, "java.math.BitLevel$", {
    Es: 1,
    c: 1
});

// pf global variable
var pf = void 0;

// qf function: initializes and returns pf
function qf() {
    pf || (pf = (new df).a());
    return pf
}

// rf class constructor
function rf() {
    this.Zl = this.am = null
}

// rf prototype methods
rf.prototype = new A;
rf.prototype.constructor = rf;
rf.prototype.a = function() {
    sf = this;
    this.am = ka(D(E), [-1, -1, 31, 19, 15, 13, 11, 11, 10, 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5]);
    this.Zl = ka(D(E), [-2147483648, 1162261467, 1073741824, 1220703125, 362797056, 1977326743, 1073741824, 387420489, 1E9, 214358881, 429981696, 815730721, 1475789056, 170859375, 268435456, 410338673, 612220032, 893871739, 128E7, 1801088541, 113379904, 148035889, 191102976, 244140625, 308915776, 387420489, 481890304, 594823321, 729E6, 887503681, 1073741824, 1291467969, 1544804416, 1838265625, 60466176]);
    return this
};

// tf function: formats a BigInt 'b' as a string with a given precision 'c'
function tf(a, b, c) {
    if (0 === b.f && 0 === b.i) switch (c) {
        case 0:
            return "0";
        case 1:
            return "0.0";
        case 2:
            return "0.00";
        case 3:
            return "0.000";
        case 4:
            return "0.0000";
        case 5:
            return "0.00000";
        case 6:
            return "0.000000";
        default:
            return (0 > c ? "0E+" : "0E") + (-2147483648 === c ? "2147483648" : "" + (-c | 0))
    } else {
        a = 0 > b.i;
        var e = "";
        var f = 18;
        if (a) {
            var g = b.f;
            b = b.i;
            b = (new x).g(-g | 0, 0 !== g ? ~b : -b | 0)
        }
        g = b.f;
        for (var h = b.i;;) {
            b = g;
            var k = h;
            h = y();
            g = uf(h, g, k, 10, 0);
            h = h.M;
            f = -1 + f | 0;
            k = h;
            var m = g,
                p = m >>> 16 | 0;
            m = n(10, 65535 & m);
            p = n(10, p);
            p = m + (p << 16) | 0;
            n(10, k);
            e = "" + (b - p | 0) + e;
            b = h;
            if (0 === g && 0 === b) break
        }
        b = -1 + ((18 - f | 0) - c | 0) | 0;
        if (0 < c && -6 <= b)
            if (c = 1 + b | 0, 0 < c) e = e.substring(0, c) + "." + e.substring(c);
            else {
                c = -c | 0;
                for (f = 0; f < c;) e = "0" + e, f = 1 + f | 0;
                e = "0." + e
            }
        else 0 !== c && (c = "" + b, 0 < b && (c = "+" + c), c = "E" + c, e = 1 < (18 - f | 0) ? e.substring(0, 1) + "." + e.substring(1) + c : "" + e + c);
        return a ? "-" + e : e
    }
}

// vf function: converts a BigInt 'b' to a string representation
function vf(a, b) {
    a = b.N;
    var c = b.ga,
        e = b.H;
    if (0 === a) return "0";
    if (1 === c) return b = (+(e.b[0] >>> 0)).toString(10), 0 > a ? "-" + b : b;
    b = "";
    var f = r(D(E), [c]);
    Ka(e, 0, f, 0, c);
    do {
        var g = 0;
        for (e = -1 + c | 0; 0 <= e;) {
            var h = g;
            g = f.b[e];
            var k = wf(y(), g, h, 1E9, 0);
            f.b[e] = k;
            h = k >> 31;
            var m = 65535 & k;
            k = k >>> 16 | 0;
            var p = n(51712, m);
            m = n(15258, m);
            var q = n(51712, k);
            p = p + ((m + q | 0) << 16) | 0;
            n(1E9, h);
            n(15258, k);
            g = g - p | 0;
            e = -1 + e | 0
        }
        e = "" + g;
        for (b = "000000000".substring(e.length | 0) + e + b; 0 !== c && 0 === f.b[-1 + c | 0];) c = -1 + c | 0
    } while (0 !== c);
    f = 0;
    for (c = b.length | 0;;)
        if (f < c && 48 === (65535 & (b.charCodeAt(f) | 0))) f = 1 + f | 0;
        else break;
    b = b.substring(f);
    return 0 > a ? "-" + b : b
}

// rf prototype $classData
rf.prototype.$classData = z({
    Fs: 0
}, !1, "java.math.Conversion$", {
    Fs: 1,
    c: 1
});

// sf global variable
var sf = void 0;

// xf function: initializes and returns sf
function xf() {
    sf || (sf = (new rf).a());
    return sf
}

// yf class constructor (empty)
function yf() {}

// yf prototype methods
yf.prototype = new A;
yf.prototype.constructor = yf;
yf.prototype.a = function() {
    return this
};

// zf function: performs BigInt division and returns the quotient array
function zf(a, b, c, e, f, g, h) {
    a = r(D(E), [1 + f | 0]);
    var k = r(D(E), [1 + h | 0]),
        m = da(g.b[-1 + h | 0]);
    0 !== m ? (gf(qf(), k, g, 0, m), gf(qf(), a, e, 0, m)) : (Ka(e, 0, a, 0, f), Ka(g, 0, k, 0, h));
    e = k.b[-1 + h | 0];
    for (c = -1 + c | 0; 0 <= c;) {
        if (a.b[f] === e) g = -1;
        else {
            var p = a.b[f],
                q = a.b[-1 + f | 0];
            g = y();
            var t = wf(g, q, p, e, 0);
            p = g.M;
            g = t;
            var u = 65535 & t;
            t = t >>> 16 | 0;
            var v = 65535 & e,
                B = e >>> 16 | 0,
                P = n(u, v);
            v = n(t, v);
            u = n(u, B);
            u = P + ((v + u | 0) << 16) | 0;
            n(p, e);
            n(t, B);
            q = q - u | 0;
            if (0 !== g) a: for (g = 1 + g | 0;;){
                t = g = -1 + g | 0;
                B = k.b[-2 + h | 0];
                p = 65535 & t;
                t = t >>> 16 | 0;
                P = 65535 & B;
                B = B >>> 16 | 0;
                u = n(p, P);
                P = n(t, P);
                v = n(p, B);
                p = u + ((P + v | 0) << 16) | 0;
                u = (u >>> 16 | 0) + v | 0;
                u = (n(t, B) + (u >>> 16 | 0) | 0) + (((65535 & u) + P | 0) >>> 16 | 0) | 0;
                B = q;
                t = a.b[-2 + f | 0];
                P = q + e | 0;
                if (0 === ((-2147483648 ^ P) < (-2147483648 ^ q) ? 1 : 0) && (q = P, u ^= -2147483648, B ^= -2147483648, u === B ? (-2147483648 ^ p) > (-2147483648 ^ t) : u > B)) continue a;
                break
            }
        }
        if (q = 0 !== g) {
            Af();
            q = a;
            p = f - h | 0;
            B = k;
            t = h;
            u = g;
            var ea = 0;
            var Ta;
            for (P = Ta = 0; P < t;) {
                v = P;
                Bf();
                var va = B.b[v],
                    qa = 65535 & va;
                va = va >>> 16 | 0;
                var Vf = 65535 & u,
                    ab = u >>> 16 | 0,
                    Wf = n(qa, Vf);
                Vf = n(va, Vf);
                var tl = n(qa, ab);
                qa = Wf + ((Vf + tl | 0) << 16) | 0;
                Wf = (Wf >>> 16 | 0) + tl | 0;
                ab = (n(va, ab) + (Wf >>> 16 | 0) | 0) + (((65535 & Wf) + Vf | 0) >>> 16 | 0) | 0;
                va = qa + ea | 0;
                ea = (-2147483648 ^ va) < (-2147483648 ^ qa) ? 1 + ab | 0 : ab;
                ab = q.b[p + v | 0];
                va = ab - va | 0;
                ab = (-2147483648 ^ va) > (-2147483648 ^ ab) ? -1 : 0;
                qa = Ta;
                Ta = qa >> 31;
                qa = va + qa | 0;
                Ta = (-2147483648 ^ qa) < (-2147483648 ^ va) ? 1 + (ab + Ta | 0) | 0 : ab + Ta | 0;
                q.b[p + v | 0] = qa;
                P = 1 + P | 0
            }
            u = q.b[p + t | 0];
            B = u - ea | 0;
            u = (-2147483648 ^ B) > (-2147483648 ^ u) ? -1 : 0;
            v = Ta;
            P = v >> 31;
            v = B + v | 0;
            q.b[p + t | 0] = v;
            q = 0 !== ((-2147483648 ^ v) < (-2147483648 ^ B) ? 1 + (u + P | 0) | 0 : u + P | 0)
        }
        if (q)
            for (g = -1 + g | 0, q = P = u = 0; q < h;) p = q, B = a.b[(f - h | 0) + p | 0], t = B + k.b[p] | 0, B = (-2147483648 ^ t) < (-2147483648 ^ B) ? 1 : 0, t = u + t | 0, B = (-2147483648 ^ t) < (-2147483648 ^ u) ? 1 + (P + B | 0) | 0 : P + B | 0, u = t, P = B, a.b[(f - h | 0) + p | 0] = u, u = P, P = 0, q = 1 + q | 0;
        null !== b && (b.b[c] = g);
        f = -1 + f | 0;
        c = -1 + c | 0
    }
    return 0 !== m ? (mf(qf(), k, h, a, 0, m), k) : (Ka(a, 0, k, 0, h), a)
}

// Cf function: performs a division operation and returns the remainder
function Cf(a, b, c, e, f) {
    a = 0;
    for (e = -1 + e | 0; 0 <= e;) {
        var g = a;
        a = c.b[e];
        var h = y();
        g = wf(h, a, g, f, 0);
        h = h.M;
        var k = 65535 & g,
            m = g >>> 16 | 0,
            p = 65535 & f,
            q = f >>> 16 | 0,
            t = n(k, p);
        p = n(m, p);
        k = n(k, q);
        t = t + ((p + k | 0) << 16) | 0;
        n(h, f);
        n(m, q);
        a = a - t | 0;
        b.b[e] = g;
        e = -1 + e | 0
    }
    return a
}

// yf prototype $classData
yf.prototype.$classData = z({
    Gs: 0
}, !1, "java.math.Division$", {
    Gs: 1,
    c: 1
});

// Df global variable
var Df = void 0;

// Af function: initializes and returns Df
function Af() {
    Df || (Df = (new yf).a());
    return Df
}

// Ef class constructor (empty)
function Ef() {}

// Ef prototype methods
Ef.prototype = new A;
Ef.prototype.constructor = Ef;
Ef.prototype.a = function() {
    return this
};

// Ff function: performs subtraction on two arrays 'a' and 'c' and stores the result in 'f'
function Ff(a, b, c, e) {
    for (var f = r(D(E), [b]), g = 0, h = 0; g < e;) {
        var k = a.b[g],
            m = k - c.b[g] | 0;
        k = (-2147483648 ^ m) > (-2147483648 ^ k) ? -1 : 0;
        var p = h;
        h = p >> 31;
        p = m + p | 0;
        m = (-2147483648 ^ p) < (-2147483648 ^ m) ? 1 + (k + h | 0) | 0 : k + h | 0;
        f.b[g] = p;
        h = m;
        g = 1 + g | 0
    }
    for (; g < b;) c = a.b[g], m = h, e = m >> 31, m = c + m | 0, c = (-2147483648 ^ m) < (-2147483648 ^ c) ? 1 + e | 0 : e, f.b[g] = m, h = c, g = 1 + g | 0;
    return f
}

// Gf function: compares two arrays 'b' and 'c'
function Gf(a, b, c, e) {
    for (a = -1 + e | 0; 0 <= a && b.b[a] === c.b[a];) a = -1 + a | 0;
    return 0 > a ? 0 : (-2147483648 ^ b.b[a]) < (-2147483648 ^ c.b[a]) ? -1 : 1
}

// Hf function: performs addition on two arrays 'a' and 'c' and stores the result in 'f'
function Hf(a, b, c, e) {
    var f = r(D(E), [1 + b | 0]),
        g = 1,
        h = a.b[0],
        k = h + c.b[0] | 0;
    f.b[0] = k;
    h = (-2147483648 ^ k) < (-2147483648 ^ h) ? 1 : 0;
    if (b >= e) {
        for (; g < e;) {
            var m = a.b[g];
            k = m + c.b[g] | 0;
            m = (-2147483648 ^ k) < (-2147483648 ^ m) ? 1 : 0;
            h = k + h | 0;
            k = (-2147483648 ^ h) < (-2147483648 ^ k) ? 1 + m | 0 : m;
            f.b[g] = h;
            h = k;
            g = 1 + g | 0
        }
        for (; g < b;) c = a.b[g], e = c + h | 0, c = (-2147483648 ^ e) < (-2147483648 ^ c) ? 1 : 0, f.b[g] = e, h = c, g = 1 + g | 0
    } else {
        for (; g < b;) m = a.b[g], k = m + c.b[g] | 0, m = (-2147483648 ^ k) < (-2147483648 ^ m) ? 1 : 0, h = k + h | 0, k = (-2147483648 ^ h) < (-2147483648 ^ k) ? 1 + m | 0 : m, f.b[g] = h, h = k, g = 1 + g | 0;
        for (; g < e;) a = c.b[g], b = a + h | 0, a = (-2147483648 ^ b) < (-2147483648 ^ a) ? 1 : 0, f.b[g] = b, h = a, g = 1 + g | 0
    }
    0 !== h && (f.b[g] = h);
    return f
}

// If function: performs addition on two BigInts 'b' and 'c'
function If(a, b, c) {
    a = b.N;
    var e = c.N,
        f = b.ga,
        g = c.ga;
    if (0 === a) return c;
    if (0 === e) return b;
    if (2 === (f + g | 0)) {
        b = b.H.b[0];
        c = c.H.b[0];
        if (a === e) return e = b + c | 0, c = (-2147483648 ^ e) < (-2147483648 ^ b) ? 1 : 0, 0 === c ? (new Jf).g(a, e) : hf(a, 2, ka(D(E), [e, c]));
        e = lf();
        0 > a ? (a = b = c - b | 0, c = (-2147483648 ^ b) > (-2147483648 ^ c) ? -1 : 0) : (a = c = b - c | 0, c = (-2147483648 ^ c) > (-2147483648 ^ b) ? -1 : 0);
        return Kf(e, (new x).g(a, c))
    }
    if (a === e) e = f >= g ? Hf(b.H, f, c.H, g) : Hf(c.H, g, b.H, f);
    else {
        var h = f !== g ? f > g ? 1 : -1 : Gf(0, b.H, c.H, f);
        if (0 === h) return lf().be;
        1 === h ? e = Ff(b.H, f, c.H, g) : (c = Ff(c.H, g, b.H, f), a = e, e = c)
    }
    a = hf(a | 0, e.b.length, e);
    jf(a);
    return a
}

// Lf function: performs subtraction on two BigInts 'b' and 'c'
function Lf(a, b, c) {
    var e = b.N;
    a = c.N;
    var f = b.ga,
        g = c.ga;
    if (0 === a) return b;
    if (0 === e) return Mf(c);
    if (2 === (f + g | 0)) return b = b.H.b[0], f = 0, c = c.H.b[0], g = 0, 0 > e && (e = b, b = -e | 0, f = 0 !== e ? ~f : -f | 0), 0 > a && (a = c, e = g, c = -a | 0, g = 0 !== a ? ~e : -e | 0), a = lf(), e = b, b = f, f = g, c = e - c | 0, Kf(a, (new x).g(c, (-2147483648 ^ c) > (-2147483648 ^ e) ? -1 + (b - f | 0) | 0 : b - f | 0));
    var h = f !== g ? f > g ? 1 : -1 : Gf(Nf(), b.H, c.H, f);
    if (e === a && 0 === h) return lf().be;
    -1 === h ? (c = e === a ? Ff(c.H, g, b.H, f) : Hf(c.H, g, b.H, f), a = -a | 0) : e === a ? (c = Ff(b.H, f, c.H, g), a = e) : (c = Hf(b.H, f, c.H, g), a = e);
    a = hf(a | 0, c.b.length, c);
    jf(a);
    return a
}

// Ef prototype $classData
Ef.prototype.$classData = z({
    Hs: 0
}, !1, "java.math.Elementary$", {
    Hs: 1,
    c: 1
});

// Of global variable
var Of = void 0;

// Nf function: initializes and returns Of
function Nf() {
    Of || (Of = (new Ef).a());
    return Of
}

// Pf class constructor
function Pf() {
    this.Vf = 0;
    this.Ig = null
}

// Pf prototype methods
Pf.prototype = new A;
Pf.prototype.constructor = Pf;
Pf.prototype.t = function(a) {
    return a instanceof Pf ? this.Vf === a.Vf ? this.Ig === a.Ig : !1 : !1
};
Pf.prototype.n = function() {
    return "precision=" + this.Vf + " roundingMode=" + this.Ig
};
Pf.prototype.z = function() {
    return this.Vf << 3 | this.Ig.Tl
};

// Pf prototype $classData
Pf.prototype.$classData = z({
    Is: 0
}, !1, "java.math.MathContext", {
    Is: 1,
    c: 1
});

// Qf class constructor
function Qf() {
    this.$l = null
}

// Qf prototype methods
Qf.prototype = new A;
Qf.prototype.constructor = Qf;
Qf.prototype.a = function() {
    Rf = this;
    Sf();
    var a = Tf().Ji,
        b = new Pf;
    b.Vf = 34;
    b.Ig = a;
    this.$l = b;
    Sf();
    Tf();
    Sf();
    Tf();
    Sf();
    Tf();
    return this
};

// Qf prototype $classData
Qf.prototype.$classData = z({
    Js: 0
}, !1, "java.math.MathContext$", {
    Js: 1,
    c: 1
});

// Rf global variable
var Rf = void 0;

// Sf function: initializes and returns Rf
function Sf() {
    Rf || (Rf = (new Qf).a());
    return Rf
}

// Uf class constructor
function Uf() {
    this.of = this.pf = null
}

// Uf prototype methods
Uf.prototype = new A;
Uf.prototype.constructor = Uf;
Uf.prototype.a = function() {
    Xf = this;
    Yf(10, 10);
    Yf(14, 5);
    this.pf = r(D(bf), [32]);
    this.of = r(D(bf), [32]);
    var a;
    var b = 1;
    for (var c = a = 0; 32 > c;) {
        var e = c;
        if (18 >= e) {
            Bf().of.b[e] = Kf(lf(), (new x).g(b, a));
            var f = Bf().pf,
                g = lf(),
                h = b,
                k = a;
            f.b[e] = Kf(g, (new x).g(0 === (32 & e) ? h << e : 0, 0 === (32 & e) ? (h >>> 1 | 0) >>> (31 - e | 0) | 0 | k << e : h << e));
            e = b;
            b = e >>> 16 | 0;
            e = n(5, 65535 & e);
            f = n(5, b);
            b = e + (f << 16) | 0;
            e = (e >>> 16 | 0) + f | 0;
            a = n(5, a) + (e >>> 16 | 0) | 0
        } else Bf().of.b[e] = Zf(Bf().of.b[-1 + e | 0], Bf().of.b[1]), Bf().pf.b[e] = Zf(Bf().pf.b[-1 + e | 0], lf().lg);
        c = 1 + c | 0
    }
    return this
};

// $f function: performs multiplication on array 'a' and stores result in 'c'
function $f(a, b, c) {
    for (var e, f = 0; f < b;) {
        var g = f;
        e = 0;
        for (var h = 1 + g | 0; h < b;) {
            var k = h;
            Bf();
            var m = a.b[g],
                p = a.b[k],
                q = c.b[g + k | 0],
                t = 65535 & m;
            m = m >>> 16 | 0;
            var u = 65535 & p;
            p = p >>> 16 | 0;
            var v = n(t, u);
            u = n(m, u);
            var B = n(t, p);
            t = v + ((u + B | 0) << 16) | 0;
            v = (v >>> 16 | 0) + B | 0;
            m = (n(m, p) + (v >>> 16 | 0) | 0) + (((65535 & v) + u | 0) >>> 16 | 0) | 0;
            q = t + q | 0;
            m = (-2147483648 ^ q) < (-2147483648 ^ t) ? 1 + m | 0 : m;
            e = q + e | 0;
            q = (-2147483648 ^ e) < (-2147483648 ^ q) ? 1 + m | 0 : m;
            c.b[g + k | 0] = e;
            e = q;
            h = 1 + h | 0
        }
        c.b[g + b | 0] = e;
        f = 1 + f | 0
    }
    ef(qf(), c, c, b << 1);
    for (g = f = e = 0; f < b;) p = a.b[f], q = a.b[f], k = c.b[g], h = e, m = 65535 & p, e = p >>> 16 | 0, t = 65535 & q, q = q >>> 16 | 0, p = n(m, t), t = n(e, t), v = n(m, q), m = p + ((t + v | 0) << 16) | 0, p = (p >>> 16 | 0) + v | 0, e = (n(e, q) + (p >>> 16 | 0) | 0) + (((65535 & p) + t | 0) >>> 16 | 0) | 0, k = m + k | 0, e = (-2147483648 ^ k) < (-2147483648 ^ m) ? 1 + e | 0 : e, h = k + h | 0, k = (-2147483648 ^ h) < (-2147483648 ^ k) ? 1 + e | 0 : e, c.b[g] = h, g = 1 + g | 0, h = k + c.b[g] | 0, k = (-2147483648 ^ h) < (-2147483648 ^ k) ? 1 : 0, c.b[g] = h, e = k, f = 1 + f | 0, g = 1 + g | 0;
    return c
}

// Yf function: creates an array of BigInts based on 'a' and 'b'
function Yf(a, b) {
    var c = [];
    if (0 < a) {
        var e = 1,
            f = 1,
            g = e;
        for (c.push(null === g ? 0 : g); f < a;) e = n(e | 0, b), f = 1 + f | 0, g = e, c.push(null === g ? 0 : g)
    }
    ka(D(E), c)
}

// ag function: performs multiplication on two BigInts 'b' and 'c' using Karatsuba algorithm
function ag(a, b, c) {
    if (c.ga > b.ga) var e = c;
    else e = b, b = c;
    var f = e,
        g = b;
    if (63 > g.ga) {
        e = f.ga;
        b = g.ga;
        c = e + b | 0;
        a = f.N !== g.N ? -1 : 1;
        if (2 === c) {
            e = f.H.b[0];
            b = g.H.b[0];
            c = 65535 & e;
            e = e >>> 16 | 0;
            g = 65535 & b;
            b = b >>> 16 | 0;
            f = n(c, g);
            g = n(e, g);
            var h = n(c, b);
            c = f + ((g + h | 0) << 16) | 0;
            f = (f >>> 16 | 0) + h | 0;
            e = (n(e, b) + (f >>> 16 | 0) | 0) + (((65535 & f) + g | 0) >>> 16 | 0) | 0;
            a = 0 === e ? (new Jf).g(a, c) : hf(a, 2, ka(D(E), [c, e]))
        } else {
            f = f.H;
            g = g.H;
            h = r(D(E), [c]);
            if (0 !== e && 0 !== b)
                if (1 === e) h.b[b] = bg(0, h, g, b, f.b[0]);
                else if (1 === b) h.b[e] = bg(0, h, f, e, g.b[0]);
            else if (f === g && e === b) $f(f, e, h);
            else
                for (var k = 0; k < e;) {
                    var m = k;
                    var p = 0;
                    for (var q = f.b[m], t = 0; t < b;) {
                        var u = t;
                        Bf();
                        var v = g.b[u],
                            B = h.b[m + u | 0],
                            P = 65535 & q,
                            ea = q >>> 16 | 0,
                            Ta = 65535 & v;
                        v = v >>> 16 | 0;
                        var va = n(P, Ta);
                        Ta = n(ea, Ta);
                        var qa = n(P, v);
                        P = va + ((Ta + qa | 0) << 16) | 0;
                        va = (va >>> 16 | 0) + qa | 0;
                        ea = (n(ea, v) + (va >>> 16 | 0) | 0) + (((65535 & va) + Ta | 0) >>> 16 | 0) | 0;
                        B = P + B | 0;
                        ea = (-2147483648 ^ B) < (-2147483648 ^ P) ? 1 + ea | 0 : ea;
                        p = B + p | 0;
                        B = (-2147483648 ^ p) < (-2147483648 ^ B) ? 1 + ea | 0 : ea;
                        h.b[m + u | 0] = p;
                        p = B;
                        t = 1 + t | 0
                    }
                    h.b[m + b | 0] = p;
                    k = 1 + k | 0
                }
            a = hf(a, c, h);
            jf(a)
        }
        return a
    }
    e = (-2 & f.ga) << 4;
    c = cg(f, e);
    h = cg(g, e);
    b = dg(c, e);
    k = Lf(Nf(), f, b);
    b = dg(h, e);
    g = Lf(Nf(), g, b);
    f = ag(a, c, h);
    b = ag(a, k, g);
    a = ag(a, Lf(Nf(), c, k), Lf(Nf(), g, h));
    c = f;
    a = If(Nf(), a, c);
    a = If(Nf(), a, b);
    a = dg(a, e);
    e = f = dg(f, e << 1);
    a = If(Nf(), e, a);
    return If(Nf(), a, b)
}

// bg function: performs multiplication on arrays 'c' and 'f' and stores result in 'b'
function bg(a, b, c, e, f) {
    var g;
    for (a = g = 0; a < e;) {
        var h = a;
        Bf();
        var k = c.b[h],
            m = 65535 & k;
        k = k >>> 16 | 0;
        var p = 65535 & f,
            q = f >>> 16 | 0,
            t = n(m, p);
        p = n(k, p);
        var u = n(m, q);
        m = t + ((p + u | 0) << 16) | 0;
        t = (t >>> 16 | 0) + u | 0;
        k = (n(k, q) + (t >>> 16 | 0) | 0) + (((65535 & t) + p | 0) >>> 16 | 0) | 0;
        g = m + g | 0;
        k = (-2147483648 ^ g) < (-2147483648 ^ m) ? 1 + k | 0 : k;
        b.b[h] = g;
        g = k;
        a = 1 + a | 0
    }
    return g
}

// eg function: calculates a BigInt based on 'b' and Bf's lookup tables
function eg(a, b) {
    var c = a.pf.b.length,
        e = c >> 31,
        f = b.i;
    if (f === e ? (-2147483648 ^ b.f) < (-2147483648 ^ c) : f < e) return a.pf.b[b.f];
    c = b.i;
    if (0 === c ? -2147483598 >= (-2147483648 ^ b.f) : 0 > c) return fg(lf().lg, b.f);
    c = b.i;
    if (0 === c ? -1 >= (-2147483648 ^ b.f) : 0 > c) return dg(fg(a.of.b[1], b.f), b.f);
    var g = fg(a.of.b[1], 2147483647);
    c = g;
    f = b.i;
    var h = -2147483647 + b.f | 0;
    e = h;
    h = 1 > (-2147483648 ^ h) ? f : -1 + f | 0;
    for (f = gg(y(), b.f, b.i, 2147483647, 0);;) {
        var k = e,
            m = h;
        if (0 === m ? -1 < (-2147483648 ^ k) : 0 < m) c = Zf(c, g), e = -2147483647 + e | 0, h = 1 > (-2147483648 ^ e) ? h : -1 + h | 0;
        else break
    }
    c = Zf(c, fg(a.of.b[1], f));
    c = dg(c, 2147483647);
    a = b.i;
    e = b = -2147483647 + b.f | 0;
    for (h = 1 > (-2147483648 ^ b) ? a : -1 + a | 0;;)
        if (b = e, a = h, 0 === a ? -1 < (-2147483648 ^ b) : 0 < a) c = dg(c, 2147483647), b = h, a = -2147483647 + e | 0, b = 1 > (-2147483648 ^ a) ? b : -1 + b | 0, e = a, h = b;
        else break;
    return dg(c, f)
}

// Uf prototype $classData
Uf.prototype.$classData = z({
    Ks: 0
}, !1, "java.math.Multiplication$", {
    Ks: 1,
    c: 1
});

// Xf global variable
var Xf = void 0;

// Bf function: initializes and returns Xf
function Bf() {
    Xf || (Xf = (new Uf).a());
    return Xf
}

// hg class constructor
function hg() {
    this.Sn = this.Rn = this.kl = 0
}

// hg prototype methods
hg.prototype = new A;
hg.prototype.constructor = hg;
hg.prototype.a = function() {
    ig = this;
    this.kl = 64;
    this.Rn = this.kl >> 2;
    this.Sn = this.kl;
    jg(Cc(), this.Rn < this.Sn);
    return this
};

// hg prototype $classData
hg.prototype.$classData = z({
    kt: 0
}, !1, "scalax.collection.State$", {
    kt: 1,
    c: 1
});

// ig global variable
var ig = void 0;

// kg class constructor
function kg() {
    this.Pm = 0
}

// kg prototype methods
kg.prototype = new A;
kg.prototype.constructor = kg;
kg.prototype.a = function() {
    this.Pm = 4E3;
    return this
};

// kg prototype $classData
kg.prototype.$classData = z({
    ot: 0
}, !1, "scalax.collection.config.GraphConfig$", {
    ot: 1,
    c: 1
});

// lg global variable
var lg = void 0;

// mg class constructor (empty)
function mg() {}

// mg prototype methods
mg.prototype = new A;
mg.prototype.constructor = mg;
mg.prototype.a = function() {
    return this
};

// ng function: performs a check and returns an og object
function ng(a, b) {
    jg(Cc(), 0 <= b && 48 >= b && !0);
    a = b + 32 | 0;
    return og(b, 32, 48 < a ? a : 48, 80)
}

// mg prototype $classData
mg.prototype.$classData = z({
    Jt: 0
}, !1, "scalax.collection.mutable.ArraySet$Hints$", {
    Jt: 1,
    c: 1
});

// pg global variable
var pg = void 0;

// qg function: initializes and returns pg
function qg() {
    pg || (pg = (new mg).a());
    return pg
}

// rg class constructor
function rg() {
    this.Ee = null
}

// rg prototype methods
rg.prototype = new A;
rg.prototype.constructor = rg;
rg.prototype.a = function() {
    sg = this;
    this.Ee = (new rb).a();
    return this
};

// rg prototype $classData
rg.prototype.$classData = z({
    Nt: 0
}, !1, "scalax.collection.mutable.EqHash$", {
    Nt: 1,
    c: 1
});

// sg global variable
var sg = void 0;

// pb function: initializes and returns sg
function pb() {
    sg || (sg = (new rg).a());
    return sg
}

// Qa class constructor
function Qa() {
    this.jd = null
}

// Qa prototype methods
Qa.prototype = new A;
Qa.prototype.constructor = Qa;

// sb function: returns the name of the class data
function sb(a) {
    return a.jd.name
}

// Qa prototype n method
Qa.prototype.n = function() {
    return (this.jd.isInterface ? "interface " : this.jd.isPrimitive ? "" : "class ") + sb(this)
};

// tg function: compares two class data objects for compatibility
function tg(a, b) {
    return a.jd.isPrimitive || b.jd.isPrimitive ? a === b || (a === w(Wa) ? b === w(Va) : a === w(E) ? b === w(Va) || b === w(Wa) : a === w(Ya) ? b === w(Va) || b === w(Wa) || b === w(E) : a === w(Za) && (b === w(Va) || b === w(Wa) || b === w(E) || b === w(Ya))) : Zc(a, b.jd.getFakeInstance())
}

// Zc function: checks if 'b' is an instance of the class represented by 'a'
function Zc(a, b) {
    return !!a.jd.isInstance(b)
}

// ug function: creates a new array of the class type represented by 'a'
function ug(a, b) {
    return a.jd.newArrayOfThisClass(b)
}

// Qa prototype $classData
Qa.prototype.$classData = z({
    Gu: 0
}, !1, "java.lang.Class", {
    Gu: 1,
    c: 1
});

// vg class constructor
function vg() {
    this.Cm = 0;
    this.ho = wg();
    this.Zn = wg()
}

// vg prototype methods
vg.prototype = new A;
vg.prototype.constructor = vg;

// vg prototype $classData
vg.prototype.$classData = z({
    Qu: 0
}, !1, "java.lang.Long$StringRadixInfo", {
    Qu: 1,
    c: 1
});

// xg class constructor
function xg() {
    this.fn = this.Xn = null
}

// xg prototype methods
xg.prototype = new A;
xg.prototype.constructor = xg;
xg.prototype.a = function() {
    yg = this;
    this.Xn = (new zg).$e(!1);
    this.fn = (new zg).$e(!0);
    return this
};

// xg prototype $classData
xg.prototype.$classData = z({
    Yu: 0
}, !1, "java.lang.System$", {
    Yu: 1,
    c: 1
});

// yg global variable
var yg = void 0;

// Pb function: initializes and returns yg
function Pb() {
    yg || (yg = (new xg).a());
    return yg
}

// Ag class constructor (empty)
function Ag() {}

// Ag prototype methods
Ag.prototype = new A;
Ag.prototype.constructor = Ag;
Ag.prototype.a = function() {
    return this
};

// Ag prototype $classData
Ag.prototype.$classData = z({
    $u: 0
}, !1, "java.lang.reflect.Array$", {
    $u: 1,
    c: 1
});

// Bg global variable
var Bg = void 0;

// Cg class constructor (empty)
function Cg() {}

// Cg prototype methods
Cg.prototype = new A;
Cg.prototype.constructor = Cg;
Cg.prototype.a = function() {
    return this
};

// Dg function: performs a binary search on array 'b' for value 'c'
function Dg(a, b, c) {
    a = 0;
    var e = b.b.length;
    for (;;) {
        if (a === e) return -1 - a | 0;
        var f = (a + e | 0) >>> 1 | 0,
            g = b.b[f];
        if (c < g) e = f;
        else {
            if (G(H(), c, g)) return f;
            a = 1 + f | 0
        }
    }
}

// Eg function: sorts a portion of array 'a.b' using insertion sort
function Eg(a, b, c, e) {
    c = c - b | 0;
    if (2 <= c) {
        if (0 < e.$a(a.b[b], a.b[1 + b | 0])) {
            var f = a.b[b];
            a.b[b] = a.b[1 + b | 0];
            a.b[1 + b | 0] = f
        }
        for (f = 2; f < c;) {
            var g = a.b[b + f | 0];
            if (0 > e.$a(g, a.b[-1 + (b + f | 0) | 0])) {
                for (var h = b, k = -1 + (b + f | 0) | 0; 1 < (k - h | 0);) {
                    var m = (h + k | 0) >>> 1 | 0;
                    0 > e.$a(g, a.b[m]) ? k = m : h = m
                }
                h = h + (0 > e.$a(g, a.b[h]) ? 0 : 1) | 0;
                for (k = b + f | 0; k > h;) a.b[k] = a.b[-1 + k | 0], k = -1 + k | 0;
                a.b[h] = g
            }
            f = 1 + f | 0
        }
    }
}

// Fg function: sorts array 'b' using quicksort or insertion sort
function Fg(a, b, c) {
    var e = new Gg;
    e.Vh = c;
    c = b.b.length;
    16 < c ? Hg(a, b, r(D(C), [b.b.length]), 0, c, e) : Eg(b, 0, c, e)
}

// Hg function: recursively sorts a portion of array 'b' using merge sort
function Hg(a, b, c, e, f, g) {
    var h = f - e | 0;
    if (16 < h) {
        var k = e + (h / 2 | 0) | 0;
        Hg(a, b, c, e, k, g);
        Hg(a, b, c, k, f, g);
        for (var m = a = e, p = k; a < f;) m < k && (p >= f || g.mi(b.b[m], b.b[p])) ? (c.b[a] = b.b[m], m = 1 + m | 0) : (c.b[a] = b.b[p], p = 1 + p | 0), a = 1 + a | 0;
        Ka(c, e, b, e, h)
    } else Eg(b, e, f, g)
}

// Cg prototype $classData
Cg.prototype.$classData = z({
    av: 0
}, !1, "java.util.Arrays$", {
    av: 1,
    c: 1
});

// Ig global variable
var Ig = void 0;

// Jg function: initializes and returns Ig
function Jg() {
    Ig || (Ig = (new Cg).a());
    return Ig
}

// Kg class constructor
function Kg() {
    this.Cn = null
}

// Kg prototype methods
Kg.prototype = new A;
Kg.prototype.constructor = Kg;
Kg.prototype.a = function() {
    Lg = this;
    this.Cn = new l.RegExp("(?:(\\d+)\\$)?([-#+ 0,\\(\x3c]*)(\\d+)?(?:\\.(\\d+))?[%A-Za-z]", "g");
    return this
};

// Kg prototype $classData
Kg.prototype.$classData = z({
    fv: 0
}, !1, "java.util.Formatter$", {
    fv: 1,
    c: 1
});

// Lg global variable
var Lg = void 0;

// Mg class constructor (empty)
function Mg() {}

// Mg prototype methods
Mg.prototype = new A;
Mg.prototype.constructor = Mg;

// Ng class constructor (inherits from Mg)
function Ng() {}

// Set Ng's prototype to Mg's prototype
Ng.prototype = Mg.prototype;

// Og class constructor (empty)
function Og() {}

// Og prototype methods
Og.prototype = new A;
Og.prototype.constructor = Og;

// Pg class constructor (inherits from Og)
function Pg() {}

// Set Pg's prototype to Og's prototype
Pg.prototype = Og.prototype;

// Qg class constructor (empty)
function Qg() {}

// Qg prototype methods
Qg.prototype = new A;
Qg.prototype.constructor = Qg;
Qg.prototype.a = function() {
    return this
};

// Qg prototype $classData
Qg.prototype.$classData = z({
    Rv: 0
}, !1, "scala.Predef$any2stringadd$", {
    Rv: 1,
    c: 1
});

// Sg global variable
var Sg = void 0;

// Tg class constructor (empty)
function Tg() {}

// Tg prototype methods
Tg.prototype = new A;
Tg.prototype.constructor = Tg;
Tg.prototype.a = function() {
    return this
};

// me function: initializes and returns Ug's function
function me() {
    Ug || (Ug = (new Tg).a());
    return F(function() {
        return function(a) {
            Vg(a)
        }
    }(Ug))
}

// Tg prototype $classData
Tg.prototype.$classData = z({
    Yv: 0
}, !1, "scala.concurrent.ExecutionContext$", {
    Yv: 1,
    c: 1
});

// Ug global variable
var Ug = void 0;

// Wg class constructor (empty)
function Wg() {}

// Wg prototype methods
Wg.prototype = new A;
Wg.prototype.constructor = Wg;
Wg.prototype.a = function() {
    return this
};

// Wg prototype $classData
Wg.prototype.$classData = z({
    lw: 0
}, !1, "scala.math.Ordered$", {
    lw: 1,
    c: 1
});

// Xg global variable
var Xg = void 0;

// Yg class constructor
function Yg() {
    this.jk = this.bm = this.Xl = this.Wl = null;
    this.q = 0
}

// Yg prototype methods
Yg.prototype = new A;
Yg.prototype.constructor = Yg;

// Yg prototype a method
Yg.prototype.a = function() {
    Zg = this;
    (new $g).a();
    ah();
    bh();
    ch();
    dh();
    this.bm = eh();
    L();
    M();
    fh || (fh = (new gh).a());
    hh || (hh = (new ih).a());
    jh || (jh = (new kh).a());
    lh();
    mh || (mh = (new nh).a());
    oh();
    ph || (ph = (new qh).a());
    rh();
    sh || (sh = (new th).a());
    uh || (uh = (new vh).a());
    wh || (wh = (new xh).a());
    yh || (yh = (new zh).a());
    Xg || (Xg = (new Wg).a());
    Ah || (Ah = (new Bh).a());
    Ch || (Ch = (new Dh).a());
    this.jk = Ch;
    Eh || (Eh = (new Fh).a());
    Gh || (Gh = (new Hh).a());
    return this
};

// Yg prototype $classData
Yg.prototype.$classData = z({
    qw: 0
}, !1, "scala.package$", {
    qw: 1,
    c: 1
});

// Zg global variable
var Zg = void 0;

// vc function: initializes and returns Zg
function vc() {
    Zg || (Zg = (new Yg).a());
    return Zg
}

// Ih class constructor (empty)
function Ih() {}

// Ih prototype methods
Ih.prototype = new A;
Ih.prototype.constructor = Ih;
Ih.prototype.a = function() {
    Jh = this;
    Kh || (Kh = (new Lh).a());
    Mh || (Mh = (new Nh).a());
    Oh || (Oh = (new Ph).a());
    Qh || (Qh = (new Rh).a());
    Sh || (Sh = (new Th).a());
    Uh || (Uh = (new Vh).a());
    Wh || (Wh = (new Xh).a());
    Yh || (Yh = (new Zh).a());
    $h || ($h = (new ai).a());
    bi || (bi = (new ci).a());
    di();
    ei || (ei = (new fi).a());
    gi || (gi = (new hi).a());
    ii || (ii = (new ji).a());
    return this
};

// Ih prototype $classData
Ih.prototype.$classData = z({
    sw: 0
}, !1, "scala.reflect.ClassManifestFactory$", {
    sw: 1,
    c: 1
});

// Jh global variable
var Jh = void 0;

// ki class constructor (empty)
function ki() {}

// ki prototype methods
ki.prototype = new A;
ki.prototype.constructor = ki;
ki.prototype.a = function() {
    return this
};

// ki prototype $classData
ki.prototype.$classData = z({
    uw: 0
}, !1, "scala.reflect.ManifestFactory$", {
    uw: 1,
    c: 1
});

// li global variable
var li = void 0;

// mi class constructor (empty)
function mi() {}

// mi prototype methods
mi.prototype = new A;
mi.prototype.constructor = mi;
mi.prototype.a = function() {
    ni = this;
    Jh || (Jh = (new Ih).a());
    li || (li = (new ki).a());
    return this
};

// mi prototype $classData
mi.prototype.$classData = z({
    Kw: 0
}, !1, "scala.reflect.package$", {
    Kw: 1,
    c: 1
});

// ni global variable
var ni = void 0;

// oi class constructor (empty)
function oi() {}

// oi prototype methods
oi.prototype = new A;
oi.prototype.constructor = oi;
oi.prototype.a = function() {
    (new pi).a();
    return this
};

// oi prototype $classData
oi.prototype.$classData = z({
    Tw: 0
}, !1, "scala.util.control.Breaks", {
    Tw: 1,
    c: 1
});

// qi class constructor (empty)
function qi() {}

// qi prototype methods
qi.prototype = new A;
qi.prototype.constructor = qi;
qi.prototype.a = function() {
    return this
};

// Td function: returns R if 'b' has a specific class data property, otherwise returns a new Q object
function Td(a, b) {
    return b && b.$classData && b.$classData.qa.rl ? R() : (new Q).j(b)
}

// qi prototype $classData
qi.prototype.$classData = z({
    Ww: 0
}, !1, "scala.util.control.NonFatal$", {
    Ww: 1,
    c: 1
});

// ri global variable
var ri = void 0;

// Ud function: initializes and returns ri
function Ud() {
    ri || (ri = (new qi).a());
    return ri
}

// si class constructor (empty)
function si() {}

// si prototype methods
si.prototype = new A;
si.prototype.constructor = si;

// ti class constructor (inherits from si)
function ti() {}

// Set ti's prototype to si's prototype
ti.prototype = si.prototype;

// si prototype pi method: performs a bitwise operation on 'a' and 'b'
si.prototype.pi = function(a, b) {
    b = n(-862048943, b);
    b = n(461845907, b << 15 | b >>> 17 | 0);
    return a ^ b
};

// si prototype Fc method: performs a hash calculation
si.prototype.Fc = function(a, b) {
    a = this.pi(a, b);
    return -430675100 + n(5, a << 13 | a >>> 19 | 0) | 0
};

// ui function: calculates a hash code for 'a'
function ui(a) {
    var b = vi(),
        c = a.za();
    if (0 === c) return a = a.Ba(), Ea(Fa(), a);
    for (var e = -889275714, f = 0; f < c;) e = b.Fc(e, wi(xi(), a.U(f))), f = 1 + f | 0;
    return b.We(e, c)
}

// yi function: calculates a hash code for 'b' using a custom function
function yi(a, b, c) {
    var e = (new zi).ua(0),
        f = (new zi).ua(0),
        g = (new zi).ua(0),
        h = (new zi).ua(1);
    b.K(F(function(k, m, p, q, t) {
        return function(u) {
            u = wi(xi(), u);
            m.o = m.o + u | 0;
            p.o ^= u;
            0 !== u && (q.o = n(q.o, u));
            t.o = 1 + t.o | 0
        }
    }(a, e, f, h, g)));
    b = a.Fc(c, e.o);
    b = a.Fc(b, f.o);
    b = a.pi(b, h.o);
    return a.We(b, g.o)
}

// si prototype We method: performs a final hash transformation
si.prototype.We = function(a, b) {
    a ^= b;
    a = n(-2048144789, a ^ (a >>> 16 | 0));
    a = n(-1028477387, a ^ (a >>> 13 | 0));
    return a ^ (a >>> 16 | 0)
};

// Ai function: calculates a hash code for 'b' using a custom function and initial value 'c'
function Ai(a, b, c) {
    var e = (new zi).ua(0);
    c = (new zi).ua(c);
    b.K(F(function(f, g, h) {
        return function(k) {
            g.o = f.Fc(g.o, wi(xi(), k));
            h.o = 1 + h.o | 0
        }
    }(a, c, e)));
    return a.We(c.o, e.o)
}

// Bi class constructor (empty)
function Bi() {}

// Bi prototype methods
Bi.prototype = new A;
Bi.prototype.constructor = Bi;
Bi.prototype.a = function() {
    return this
};

// Bi prototype $classData
Bi.prototype.$classData = z({
    Yw: 0
}, !1, "scala.util.hashing.package$", {
    Yw: 1,
    c: 1
});

// Ci global variable
var Ci = void 0;

// kh class constructor (empty)
function kh() {}

// kh prototype methods
kh.prototype = new A;
kh.prototype.constructor = kh;
kh.prototype.a = function() {
    return this
};

// kh prototype $classData
kh.prototype.$classData = z({
    Zw: 0
}, !1, "scala.collection.$colon$plus$", {
    Zw: 1,
    c: 1
});

// jh global variable
var jh = void 0;

// ih class constructor (empty)
function ih() {}

// ih prototype methods
ih.prototype = new A;
ih.prototype.constructor = ih;
ih.prototype.a = function() {
    return this
};

// ih prototype $classData
ih.prototype.$classData = z({
    $w: 0
}, !1, "scala.collection.$plus$colon$", {
    $w: 1,
    c: 1
});

// hh global variable
var hh = void 0;

// Di class constructor
function Di() {
    this.nb = null
}

// Di prototype methods
Di.prototype = new A;
Di.prototype.constructor = Di;
Di.prototype.a = function() {
    Ei = this;
    this.nb = (new Fi).a();
    return this
};

// Di prototype $classData
Di.prototype.$classData = z({
    hx: 0
}, !1, "scala.collection.Iterator$", {
    hx: 1,
    c: 1
});

// Ei global variable
var Ei = void 0;

// eh function: initializes and returns Ei.nb
function eh() {
    Ei || (Ei = (new Di).a());
    return Ei.nb
}

// Gi class constructor
function Gi() {
    this.xb = this.Uc = null
}

// Gi prototype methods
Gi.prototype = new A;
Gi.prototype.constructor = Gi;

// Gi prototype $classData
Gi.prototype.$classData = z({
    mx: 0
}, !1, "scala.collection.Iterator$ConcatIteratorCell", {
    mx: 1,
    c: 1
});

// Hi function: calls tb on 'a' with 'b', 'c', and a calculated length
function Hi(a, b, c) {
    a.tb(b, c, Ii(Ji(), b) - c | 0)
}

// Ki function: converts 'b' to an iterator and then collects its elements
function Ki(a, b) {
    b = b.ng();
    b.Gb(a.pa());
    return b.Ca()
}

// U function: calls Hb on 'a' with default values
function U(a, b, c, e) {
    return a.Hb((new Li).a(), b, c, e).vc.ub
}

// Mi function: counts the number of elements in iterator 'a'
function Mi(a) {
    var b = (new zi).ua(0);
    a.K(F(function(c, e) {
        return function() {
            e.o = 1 + e.o | 0
        }
    }(a, b)));
    return b.o
}

// Ni function: filters elements from 'a' into 'b' based on a condition
function Ni(a, b, c, e, f) {
    var g = (new Oi).$e(!0);
    Pi(b, c);
    a.K(F(function(h, k, m, p) {
        return function(q) {
            if (k.o) Qi(m, q), k.o = !1;
            else return Pi(m, p), Qi(m, q)
        }
    }(a, g, b, e)));
    Pi(b, f);
    return b
}

// Ri function: either returns a new 'b' object or converts 'a' to an iterator and uses 'Kb'
function Ri(a, b) {
    return a.fc() ? (b = b.$c(a.x()), a.Yb(b, 0), b) : a.ib().Kb(b)
}

// Si class constructor (empty)
function Si() {}

// Si prototype methods
Si.prototype = new A;
Si.prototype.constructor = Si;
Si.prototype.a = function() {
    return this
};

// Si prototype Gj method: calculates a bitmask
Si.prototype.Gj = function(a) {
    return 1 << (-da(-1 + a | 0) | 0)
};

// Si prototype $classData
Si.prototype.$classData = z({
    wx: 0
}, !1, "scala.collection.Util$", {
    wx: 1,
    c: 1
});

// Ti global variable
var Ti = void 0;

// Ui class constructor (empty)
function Ui() {}

// Ui prototype methods
Ui.prototype = new A;
Ui.prototype.constructor = Ui;

// Vi class constructor (inherits from Ui)
function Vi() {}

// Set Vi's prototype to Ui's prototype
Vi.prototype = Ui.prototype;

// Wi class constructor (empty)
function Wi() {}

// Wi prototype methods
Wi.prototype = new A;
Wi.prototype.constructor = Wi;

// Xi class constructor (inherits from Wi)
function Xi() {}

// Set Xi's prototype to Wi's prototype
Xi.prototype = Wi.prototype;

// Wi prototype Jd method
Wi.prototype.Jd = function() {
    return this.fa().Ca()
};

// Yi function: iterates through 'b' and calls 'kc' on 'a' for each element
function Yi(a, b) {
    a: for (;;) {
        if (!b.m()) {
            a.kc(b.w());
            b = b.Aa();
            continue a
        }
        break
    }
}

// Zi function: iterates through 'b' and calls 'kc' on 'a' for each element, handling different types
function Zi(a, b) {
    b && b.$classData && b.$classData.qa.Jg ? Yi(a, b) : b.K(F(function(c) {
        return function(e) {
            return c.kc(e)
        }
    }(a)));
    return a
}

// $i class constructor (empty)
function $i() {}

// $i prototype methods
$i.prototype = new A;
$i.prototype.constructor = $i;

// aj class constructor (inherits from $i)
function aj() {}

// Set aj's prototype to $i's prototype
aj.prototype = $i.prototype;

// nh class constructor (empty)
function nh() {}

// nh prototype methods
nh.prototype = new A;
nh.prototype.constructor = nh;
nh.prototype.a = function() {
    return this
};

// nh prototype $classData
nh.prototype.$classData = z({
    Ey: 0
}, !1, "scala.collection.immutable.Stream$$hash$colon$colon$", {
    Ey: 1,
    c: 1
});

// mh global variable
var mh = void 0;

// bj class constructor
function bj() {
    this.Gl = this.To = null;
    this.q = !1;
    this.k = null
}

// bj prototype methods
bj.prototype = new A;
bj.prototype.constructor = bj;

// cj function: sets Gl and k properties and returns 'a'
function cj(a, b, c) {
    a.Gl = c;
    if (null === b) throw T(S(), null);
    a.k = b;
    return a
}

// dj function: initializes To if not already done, then returns it
function dj(a) {
    a.q || (a.q || (a.To = Sd(a.Gl), a.q = !0), a.Gl = null);
    return a.To
}

// bj prototype $classData
bj.prototype.$classData = z({
    Ky: 0
}, !1, "scala.collection.immutable.StreamIterator$LazyCell", {
    Ky: 1,
    c: 1
});

// ej class constructor (empty)
function ej() {}

// ej prototype methods
ej.prototype = new A;
ej.prototype.constructor = ej;
ej.prototype.a = function() {
    return this
};

// fj function: extracts a substring from 'b'
function fj(a, b, c, e) {
    a = 0 > c ? 0 : c;
    return e <= a || a >= (b.length | 0) ? "" : b.substring(a, e > (b.length | 0) ? b.length | 0 : e)
}

// ej prototype $classData
ej.prototype.$classData = z({
    My: 0
}, !1, "scala.collection.immutable.StringOps$", {
    My: 1,
    c: 1
});

// gj global variable
var gj = void 0;

// hj function: initializes and returns gj
function hj() {
    gj || (gj = (new ej).a());
    return gj
}

// ij class constructor (empty)
function ij() {}

// ij prototype methods
ij.prototype = new A;
ij.prototype.constructor = ij;
ij.prototype.a = function() {
    return this
};
ij.prototype.fa = function() {
    var a = (new Li).a();
    return jj(new kj, a, F(function() {
        return function(b) {
            return (new lj).h(b)
        }
    }(this)))
};

// ij prototype $classData
ij.prototype.$classData = z({
    Uy: 0
}, !1, "scala.collection.immutable.WrappedString$", {
    Uy: 1,
    c: 1
});

// mj global variable
var mj = void 0;

// nj function: calculates a hash value based on 'a'
function nj(a) {
    return oj(Xc(), -1 + a.Ya.b.length | 0)
}

// pj function: calls qj with Fb(b)
function pj(a, b) {
    b = Fb(b);
    return qj(a, b)
}

// qj function: adds 'b' to a hash table 'a', resizing if necessary
function qj(a, b) {
    var c = Da(b);
    c = rj(a, c);
    for (var e = a.Ya.b[c]; null !== e;) {
        if (G(H(), e, b)) return !1;
        c = (1 + c | 0) % a.Ya.b.length | 0;
        e = a.Ya.b[c]
    }
    a.Ya.b[c] = b;
    a.He = 1 + a.He | 0;
    null !== a.Qg && (b = c >> 5, c = a.Qg, c.b[b] = 1 + c.b[b] | 0);
    if (a.He >= a.Kl) {
        b = a.Ya;
        a.Ya = r(D(C), [a.Ya.b.length << 1]);
        a.He = 0;
        if (null !== a.Qg)
            if (c = 1 + (a.Ya.b.length >> 5) | 0, a.Qg.b.length !== c) a.Qg = r(D(E), [c]);
            else {
                Jg();
                c = a.Qg;
                e = c.b.length;
                for (var f = 0; f !== e;) c.b[f] = 0, f = 1 + f | 0
            }
        a.Dl = nj(a);
        a.Kl = sj(tj(), a.gk, a.Ya.b.length);
        for (c = 0; c < b.b.length;) e = b.b[c], null !== e && qj(a, e), c = 1 + c | 0
    }
    return !0
}

// rj function: calculates an index for a hash table based on 'b' and 'a.Dl'
function rj(a, b) {
    var c = a.Dl;
    Ci || (Ci = (new Bi).a());
    b = n(-1640532531, b);
    Xc();
    b = n(-1640532531, b << 24 | 16711680 & b << 8 | 65280 & (b >>> 8 | 0) | b >>> 24 | 0);
    a = -1 + a.Ya.b.length | 0;
    return ((b >>> c | 0 | b << (-c | 0)) >>> (32 - oj(Xc(), a) | 0) | 0) & a
}

// uj function: searches for an element 'b' in a hash table 'a'
function uj(a, b) {
    b = Fb(b);
    var c = Da(b);
    c = rj(a, c);
    for (var e = a.Ya.b[c]; null !== e && !G(H(), e, b);) c = (1 + c | 0) % a.Ya.b.length | 0, e = a.Ya.b[c];
    return e
}

// vj class constructor (empty)
function vj() {}

// vj prototype methods
vj.prototype = new A;
vj.prototype.constructor = vj;
vj.prototype.a = function() {
    return this
};

// sj function: calculates a load factor for a hash table
function sj(a, b, c) {
    if (!(500 > b)) throw (new wj).j("assertion failed: loadFactor too large; must be < 0.5");
    a = c >> 31;
    var e = b >> 31,
        f = 65535 & c,
        g = c >>> 16 | 0,
        h = 65535 & b,
        k = b >>> 16 | 0,
        m = n(f, h);
    h = n(g, h);
    var p = n(f, k);
    f = m + ((h + p | 0) << 16) | 0;
    m = (m >>> 16 | 0) + p | 0;
    b = (((n(c, e) + n(a, b) | 0) + n(g, k) | 0) + (m >>> 16 | 0) | 0) + (((65535 & m) + h | 0) >>> 16 | 0) | 0;
    return uf(y(), f, b, 1E3, 0)
}

// vj prototype $classData
vj.prototype.$classData = z({
    Zy: 0
}, !1, "scala.collection.mutable.FlatHashTable$", {
    Zy: 1,
    c: 1
});

// xj global variable
var xj = void 0;

// tj function: initializes and returns xj
function tj() {
    xj || (xj = (new vj).a());
    return xj
}

// yj class constructor (empty)
function yj() {}

// yj prototype methods
yj.prototype = new A;
yj.prototype.constructor = yj;
yj.prototype.a = function() {
    return this
};
yj.prototype.n = function() {
    return "NullSentinel"
};
yj.prototype.z = function() {
    return 0
};

// yj prototype $classData
yj.prototype.$classData = z({
    bz: 0
}, !1, "scala.collection.mutable.FlatHashTable$NullSentinel$", {
    bz: 1,
    c: 1
});

// zj global variable
var zj = void 0;

// Gb function: initializes and returns zj
function Gb() {
    zj || (zj = (new yj).a());
    return zj
}

// Aj class constructor (empty)
function Aj() {}

// Aj prototype methods
Aj.prototype = new A;
Aj.prototype.constructor = Aj;
Aj.prototype.a = function() {
    return this
};
Aj.prototype.Gj = function(a) {
    return 1 << (-da(-1 + a | 0) | 0)
};

// Aj prototype $classData
Aj.prototype.$classData = z({
    dz: 0
}, !1, "scala.collection.mutable.HashTable$", {
    dz: 1,
    c: 1
});

// Bj global variable
var Bj = void 0;

// Cj function: initializes and returns Bj
function Cj() {
    Bj || (Bj = (new Aj).a());
    return Bj
}

// Dj class constructor
function Dj() {
    this.Sj = null
}

// Dj prototype methods
Dj.prototype = new A;
Dj.prototype.constructor = Dj;
Dj.prototype.a = function() {
    Ej = this;
    this.Sj = l.Object.prototype.hasOwnProperty;
    return this
};

// Dj prototype $classData
Dj.prototype.$classData = z({
    tz: 0
}, !1, "scala.scalajs.js.WrappedDictionary$Cache$", {
    tz: 1,
    c: 1
});

// Ej global variable
var Ej = void 0;

// Fj function: initializes and returns Ej
function Fj() {
    Ej || (Ej = (new Dj).a());
    return Ej
}

// Gj class constructor
function Gj() {
    this.$f = !1;
    this.Sk = this.uh = this.Qh = null;
    this.Dk = !1;
    this.hl = this.Vk = 0
}

// Gj prototype methods
Gj.prototype = new A;
Gj.prototype.constructor = Gj;

// Gj prototype a method
Gj.prototype.a = function() {
    Hj = this;
    this.Qh = (this.$f = !!(l.ArrayBuffer && l.Int32Array && l.Float32Array && l.Float64Array)) ? new l.ArrayBuffer(8) : null;
    this.uh = this.$f ? new l.Int32Array(this.Qh, 0, 2) : null;
    this.$f && new l.Float32Array(this.Qh, 0, 2);
    this.Sk = this.$f ? new l.Float64Array(this.Qh, 0, 1) : null;
    if (this.$f) this.uh[0] = 16909060, a = 1 === ((new l.Int8Array(this.Qh, 0, 8))[0] | 0);
    else var a = !0;
    this.Vk = (this.Dk = a) ? 0 : 1;
    this.hl = this.Dk ? 1 : 0;
    return this
};

// Ga function: converts a number 'b' to a long representation
function Ga(a, b) {
    var c = b | 0;
    if (c === b && -Infinity !== 1 / b) return c;
    if (a.$f) a.Sk[0] = b, a = (new x).g(a.uh[a.hl] | 0, a.uh[a.Vk] | 0);
    else {
        if (b !== b) a = !1, b = 2047, c = +l.Math.pow(2, 51);
        else if (Infinity === b || -Infinity === b) a = 0 > b, b = 2047, c = 0;
        else if (0 === b) a = -Infinity === 1 / b, c = b = 0;
        else {
            var e = (a = 0 > b) ? -b : b;
            if (e >= +l.Math.pow(2, -1022)) {
                b = +l.Math.pow(2, 52);
                c = +l.Math.log(e) / .6931471805599453;
                c = +l.Math.floor(c) | 0;
                c = 1023 > c ? c : 1023;
                var f = +l.Math.pow(2, c);
                f > e && (c = -1 + c | 0, f /= 2);
                f = e / f * b;
                e = +l.Math.floor(f);
                f -= e;
                e = .5 > f ? e : .5 < f ? 1 + e : 0 !== e % 2 ? 1 + e : e;
                2 <= e / b && (c = 1 + c | 0, e = 1);
                1023 < c ? (c = 2047, e = 0) : (c = 1023 + c | 0, e -= b);
                b = c;
                c = e
            } else b = e / +l.Math.pow(2, -1074), c = +l.Math.floor(b), e = b - c, b = 0, c = .5 > e ? c : .5 < e ? 1 + c : 0 !== c % 2 ? 1 + c : c
        }
        c = +c;
        a = (new x).g(c | 0, (a ? -2147483648 : 0) | (b | 0) << 20 | c / 4294967296 | 0)
    }
    return a.f ^ a.i
}

// Gj prototype Dv method: converts a long 'a' to a double
Gj.prototype.Dv = function(a) {
    var b = a.i,
        c = 0 > b,
        e = 2047 & b >> 20;
    a = 4294967296 * (1048575 & b) + +(a.f >>> 0);
    return 2047 === e ? 0 !== a ? NaN : c ? -Infinity : Infinity : 0 < e ? (e = +l.Math.pow(2, -1023 + e | 0) * (1 + a / +l.Math.pow(2, 52)), c ? -e : e) : 0 !== a ? (e = +l.Math.pow(2, -1022) * (a / +l.Math.pow(2, 52)), c ? -e : e) : c ? -0 : 0
};

// Gj prototype $classData
Gj.prototype.$classData = z({
    xz: 0
}, !1, "scala.scalajs.runtime.Bits$", {
    xz: 1,
    c: 1
});

// Hj global variable
var Hj = void 0;

// Ha function: initializes and returns Hj
function Ha() {
    Hj || (Hj = (new Gj).a());
    return Hj
}

// Ij class constructor
function Ij() {
    this.q = !1
}

// Ij prototype methods
Ij.prototype = new A;
Ij.prototype.constructor = Ij;
Ij.prototype.a = function() {
    return this
};

// Ic function: parses a string 'c' using regex and returns a K object
function Ic(a, b, c) {
    if (null === b) throw (new Oc).a();
    a = Jj().En.exec(c);
    if (null !== a) {
        a = a[1];
        if (void 0 === a) throw (new V).h("undefined.get");
        a = (new Q).j((new K).Q(Kj(a), 0))
    } else a = R();
    if (a.m()) {
        var e = Jj().Dn.exec(c);
        if (null !== e) {
            a = e[0];
            if (void 0 === a) throw (new V).h("undefined.get");
            a = c.substring(a.length | 0);
            var f = 0;
            var g = e[1];
            if (void 0 !== g)
                for (var h = g.length | 0, k = 0; k < h;) {
                    var m = k;
                    f |= Lj(Jj(), 65535 & (g.charCodeAt(m) | 0));
                    k = 1 + k | 0
                }
            e = e[2];
            if (void 0 !== e)
                for (g = e.length | 0, h = 0; h < g;) k = h, f &= ~Lj(Jj(), 65535 & (e.charCodeAt(k) | 0)), h = 1 + h | 0;
            a = (new Q).j((new K).Q(a, f))
        } else a = R()
    }
    a = a.m() ? (new K).Q(c, 0) : a.Nb();
    if (null === a) throw (new J).j(a);
    f = a.dk();
    f = new l.RegExp(a.Ga(), "g" + (0 !== (2 & f) ? "i" : "") + (0 !== (8 & f) ? "m" : ""));
    a = new Mj;
    a.Dg = f;
    a.Ul = c;
    b = ma(b);
    if ("" === b) b = ka(D(oa), [""]);
    else {
        f = b.length | 0;
        c = new Nj;
        c.co = a;
        c.sn = b;
        c.ko = 0;
        c.jo = f;
        a = c.co;
        f = new l.RegExp(a.Dg);
        a = f !== a.Dg ? f : new l.RegExp(a.Dg.source, (a.Dg.global ? "g" : "") + (a.Dg.ignoreCase ? "i" : "") + (a.Dg.multiline ? "m" : ""));
        c.nl = a;
        a = c.sn;
        f = c.ko;
        e = c.jo;
        a = "string" === typeof a ? a.substring(f, e) : a.Lo(f, e);
        c.tn = ma(a);
        c.Fg = null;
        c.Hk = !0;
        R();
        R();
        a = [];
        for (f = e = 0; 2147483646 > f && Oj(c);) 0 !== Pj(c) && (g = Qj(c).index | 0, e = b.substring(e, g), a.push(null === e ? null : e), f = 1 + f | 0), e = Pj(c);
        b = b.substring(e);
        a.push(null === b ? null : b);
        b = ka(D(oa), a);
        for (c = b.b.length; 0 !== c && "" === b.b[-1 + c | 0];) c = -1 + c | 0;
        c !== b.b.length && (a = r(D(oa), [c]), Ka(b, 0, a, 0, c), b = a)
    }
    return b
}

// Rj function: converts a string 'b' to an array of characters
function Rj(a, b) {
    a = b.length | 0;
    for (var c = r(D(Ua), [a]), e = 0; e < a;) c.b[e] = 65535 & (b.charCodeAt(e) | 0), e = 1 + e | 0;
    return c
}

// Sj function: extracts a substring from a character array 'b'
function Sj(a, b, c, e) {
    a = c + e | 0;
    if (0 > c || a < c || a > b.b.length) throw (new Tj).a();
    for (e = ""; c !== a;) e = "" + e + l.String.fromCharCode(b.b[c]), c = 1 + c | 0;
    return e
}

// Ea function: calculates a hash code for a string 'b'
function Ea(a, b) {
    a = 0;
    for (var c = 1, e = -1 + (b.length | 0) | 0; 0 <= e;) a = a + n(65535 & (b.charCodeAt(e) | 0), c) | 0, c = n(31, c), e = -1 + e | 0;
    return a
}

// Uj function: formats a string 'a' with arguments 'b'
function Uj(a, b) {
    var c = (new Vj).a();
    if (c.ji) throw (new Wj).a();
    for (var e = 0, f = 0, g = a.length | 0, h = 0; h !== g;) {
        var k = a.indexOf("%", h) | 0;
        if (0 > k) {
            Xj(c, a.substring(h));
            break
        }
        Xj(c, a.substring(h, k));
        h = 1 + k | 0;
        Lg || (Lg = (new Kg).a());
        var m = Lg.Cn;
        m.lastIndex = h;
        k = m.exec(a);
        if (null === k || (k.index | 0) !== h) throw c = h === g ? "%" : a.substring(h, 1 + h | 0), (new Yj).h(c);
        h = m.lastIndex | 0;
        m = 65535 & (a.charCodeAt(-1 + h | 0) | 0);
        for (var p, q = k[2], t = 90 >= m ? 256 : 0, u = q.length | 0, v = 0; v !== u;) {
            p = 65535 & (q.charCodeAt(v) | 0);
            switch (p) {
                case 45:
                    var B = 1;
                    break;
                case 35:
                    B = 2;
                    break;
                case 43:
                    B = 4;
                    break;
                case 32:
                    B = 8;
                    break;
                case 48:
                    B = 16;
                    break;
                case 44:
                    B = 32;
                    break;
                case 40:
                    B = 64;
                    break;
                case 60:
                    B = 128;
                    break;
                default:
                    throw (new J).j(Zj(p));
            }
            if (0 !== (t & B)) throw (new ak).h(l.String.fromCharCode(p));
            t |= B;
            v = 1 + v | 0
        }
        p = t;
        u = ck(k[3], -1);
        t = ck(k[4], -1);
        if (37 === m || 110 === m) k = null;
        else {
            if (0 !== (1 & p) && 0 > u) throw (new dk).h("%" + k[0]);
            0 !== (128 & p) ? q = f : (q = ck(k[1], 0), q = 0 === q ? e = 1 + e | 0 : 0 > q ? f : q);
            if (0 >= q || q > b.b.length) {
                c = l.String.fromCharCode(m);
                if (0 > ("bBhHsHcCdoxXeEgGfn%".indexOf(c) | 0)) throw (new Yj).h(c);
                throw (new ek).h("%" + k[0]);
            }
            f = q;
            k = b.b[-1 + q | 0]
        }
        q = c;
        v = k;
        B = m;
        k = p;
        m = u;
        u = t;
        switch (B) {
            case 98:
            case 66:
                0 !== (126 & k) && fk(k, 126, B);
                gk(q, k, m, u, !1 === v || null === v ? "false" : "true");
                break;
            case 104:
            case 72:
                0 !== (126 & k) && fk(k, 126, B);
                t = null === v ? "null" : (+(Da(v) >>> 0)).toString(16);
                gk(q, k, m, u, t);
                break;
            case 115:
            case 83:
                v && v.$classData && v.$classData.qa.zH ? (0 !== (124 & k) && fk(k, 124, B), v.wH(q, (0 !== (1 & k) ? 1 : 0) | (0 !== (2 & k) ? 4 : 0) | (0 !== (256 & k) ? 2 : 0), m, u)) : (0 !== (126 & k) && fk(k, 126, B), gk(q, k, m, u, "" + v));
                break;
            case 99:
            case 67:
                0 !== (126 & k) && fk(k, 126, B);
                if (0 <= u) throw (new hk).ua(u);
                if (v instanceof wb) gk(q, k, m, -1, l.String.fromCharCode(null === v ? 0 : v.s));
                else if (La(v)) {
                    t = v | 0;
                    if (!(0 <= t && 1114111 >= t)) throw (new ik).ua(t);
                    t = 65536 > t ? l.String.fromCharCode(t) : l.String.fromCharCode(-64 + (t >> 10) | 55296, 56320 | 1023 & t);
                    gk(q, k, m, -1, t)
                } else jk(q, v, k, m, u, B);
                break;
            case 100:
                0 !== (2 & k) && fk(k, 2, B);
                17 !== (17 & k) && 12 !== (12 & k) || kk(k);
                if (0 <= u) throw (new hk).ua(u);
                La(v) ? lk(q, k, m, "" + (v | 0)) : v instanceof x ? (u = Ma(v), t = u.f, u = u.i, lk(q, k, m, mk(y(), t, u))) : jk(q, v, k, m, u, B);
                break;
            case 111:
                0 !== (108 & k) && fk(k, 108, B);
                17 === (17 & k) && kk(k);
                if (0 <= u) throw (new hk).ua(u);
                t = 0 === (2 & k) ? "0" : "";
                La(v) ? (u = (+((v | 0) >>> 0)).toString(8), nk(q, k, m, t, u)) : v instanceof x ? (u = Ma(v), v = u.f, p = u.i, ok(), u = 1073741823 & v, B = 1073741823 & ((v >>> 30 | 0) + (p << 2) | 0), v = p >>> 28 | 0, 0 !== v ? (v = (+(v >>> 0)).toString(8), p = (+(B >>> 0)).toString(8), B = "0000000000".substring(p.length | 0), u = (+(u >>> 0)).toString(8), u = v + ("" + B + p) + ("" + "0000000000".substring(u.length | 0) + u)) : 0 !== B ? (v = (+(B >>> 0)).toString(8), u = (+(u >>> 0)).toString(8), u = v + ("" + "0000000000".substring(u.length | 0) + u)) : u = (+(u >>> 0)).toString(8), nk(q, k, m, t, u)) : jk(q, v, k, m, u, B);
                break;
            case 120:
            case 88:
                0 !== (108 & k) && fk(k, 108, B);
                17 === (17 & k) && kk(k);
                if (0 <= u) throw (new hk).ua(u);
                t = 0 === (2 & k) ? "" : 0 !== (256 & k) ? "0X" : "0x";
                La(v) ? (u = (+((v | 0) >>> 0)).toString(16), nk(q, k, m, t, pk(k, u))) : v instanceof x ? (u = Ma(v), v = u.f, p = u.i, ok(), u = k, 0 !== p ? (p = (+(p >>> 0)).toString(16), v = (+(v >>> 0)).toString(16), v = p + ("" + "00000000".substring(v.length | 0) + v)) : v = (+(v >>> 0)).toString(16), nk(q, u, m, t, pk(k, v))) : jk(q, v, k, m, u, B);
                break;
            case 101:
            case 69:
                0 !== (32 & k) && fk(k, 32, B);
                17 !== (17 & k) && 12 !== (12 & k) || kk(k);
                "number" === typeof v ? (t = +v, t !== t || Infinity === t || -Infinity === t ? qk(q, k, m, t) : lk(q, k, m, rk(t, 0 <= u ? u : 6, 0 !== (2 & k)))) : jk(q, v, k, m, u, B);
                break;
            case 103:
            case 71:
                0 !== (2 & k) && fk(k, 2, B);
                17 !== (17 & k) && 12 !== (12 & k) || kk(k);
                "number" === typeof v ? (v = +v, v !== v || Infinity === v || -Infinity === v ? qk(q, k, m, v) : (t = k, p = 0 <= u ? u : 6, k = 0 !== (2 & k), u = +l.Math.abs(v), p = 0 === p ? 1 : p, 1E-4 <= u && u < +l.Math.pow(10, p) ? (B = void 0 !== l.Math.log10 ? +l.Math.log10(u) : +l.Math.log(u) / 2.302585092994046, B = Ja(+l.Math.ceil(B)), u = +l.Math.pow(10, B) <= u ? 1 + B | 0 : B, u = p - u | 0, k = sk(v, 0 < u ? u : 0, k)) : k = rk(v, -1 + p | 0, k), lk(q, t, m, k))) : jk(q, v, k, m, u, B);
                break;
            case 102:
                17 !== (17 & k) && 12 !== (12 & k) || kk(k);
                "number" === typeof v ? (t = +v, t !== t || Infinity === t || -Infinity === t ? qk(q, k, m, t) : lk(q, k, m, sk(t, 0 <= u ? u : 6, 0 !== (2 & k)))) : jk(q, v, k, m, u, B);
                break;
            case 37:
                if (0 !== (254 & k)) throw (new tk).h(uk(k));
                if (0 <= u) throw (new hk).ua(u);
                if (0 !== (1 & k) && 0 > m) throw (new dk).h("%-%");
                vk(q, k, m, "%");
                break;
            case 110:
                if (0 !== (255 & k)) throw (new tk).h(uk(k));
                if (0 <= u) throw (new hk).ua(u);
                if (0 <= m) throw (new wk).ua(m);
                Xj(q, "\n");
                break;
            default:
                throw (new Yj).h(l.String.fromCharCode(B));
        }
    }
    a = c.n();
    c.ej();
    return a
}

// Ij prototype $classData
Ij.prototype.$classData = z({
    Az: 0
}, !1, "scala.scalajs.runtime.RuntimeString$", {
    Az: 1,
    c: 1
});

// xk global variable
var xk = void 0;

// Fa function: initializes and returns xk
function Fa() {
    xk || (xk = (new Ij).a());
    return xk
}

// yk class constructor
function yk() {
    this.An = !1;
    this.Jm = this.Mm = this.Lm = null;
    this.q = 0
}

// yk prototype methods
yk.prototype = new A;
yk.prototype.constructor = yk;
yk.prototype.a = function() {
    return this
};

// zk function: cleans up and formats a stack trace string
function zk(a) {
    return (a.stack + "\n").replace(Ak("^[\\s\\S]+?\\s+at\\s+"), " at ").replace(Bk("^\\s+(at eval )?at\\s+", "gm"), "").replace(Bk("^([^\\(]+?)([\\n])", "gm"), "{anonymous}() ($1)$2").replace(Bk("^Object.\x3canonymous\x3e\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}() ($1)").replace(Bk("^([^\\(]+|\\{anonymous\\}\\(\\)) \\((.+)\\)$", "gm"), "$1@$2").split("\n").slice(0, -1)
}

// Ck function: gets keys from Dk(a) and caches them
function Ck(a) {
    0 === (8 & a.q) << 24 >> 24 && 0 === (8 & a.q) << 24 >> 24 && (a.Jm = l.Object.keys(Dk(a)), a.q = (8 | a.q) << 24 >> 24);
    return a.Jm
}

// Ek function: gets a map of Scala.js type names and caches it
function Ek(a) {
    if (0 === (2 & a.q) << 24 >> 24 && 0 === (2 & a.q) << 24 >> 24) {
        for (var b = {
            O: "java_lang_Object",
            T: "java_lang_String",
            V: "scala_Unit",
            Z: "scala_Boolean",
            C: "scala_Char",
            B: "scala_Byte",
            S: "scala_Short",
            I: "scala_Int",
            J: "scala_Long",
            F: "scala_Float",
            D: "scala_Double"
        }, c = 0; 22 >= c;) 2 <= c && (b["T" + c] = "scala_Tuple" + c), b["F" + c] = "scala_Function" + c, c = 1 + c | 0;
        a.Lm = b;
        a.q = (2 | a.q) << 24 >> 24
    }
    return a.Lm
}

// Fk function: parses a stack frame string 'b' to extract class and method names
function Fk(a, b) {
    var c = Ak("^(?:Object\\.|\\u005bobject Object\\u005d\\.)?(?:ScalaJS\\.c\\.|\\$c_)([^\\.]+)(?:\\.prototype)?\\.([^\\.]+)$"),
        e = Ak("^(?:Object\\.|\\u005bobject Object\\u005d\\.)?(?:ScalaJS\\.(?:s|f)\\.|\\$(?:s|f)_)((?:_[^_]|[^_])+)__([^\\.]+)$"),
        f = Ak("^(?:Object\\.|\\u005bobject Object\\u005d\\.)?(?:ScalaJS\\.m\\.|\\$m_)([^\\.]+)$"),
        g = !1;
    c = c.exec(b);
    null === c && (c = e.exec(b), null === c && (c = f.exec(b), g = !0));
    if (null !== c) {
        b = c[1];
        if (void 0 === b) throw (new V).h("undefined.get");
        b = 36 === (65535 & (b.charCodeAt(0) | 0)) ? b.substring(1) : b;
        e = Ek(a);
        if (Fj().Sj.call(e, b)) {
            a = Ek(a);
            if (!Fj().Sj.call(a, b)) throw (new V).h("key not found: " + b);
            a = a[b]
        } else a: for (f = 0;;)
            if (f < (Ck(a).length | 0)) {
                e = Ck(a)[f];
                if (0 < (b.length | 0) && b.substring(0, e.length | 0) === e) {
                    a = Dk(a);
                    if (!Fj().Sj.call(a, e)) throw (new V).h("key not found: " + e);
                    a = "" + a[e] + b.substring(e.length | 0);
                    break a
                }
                f = 1 + f | 0
            } else {
                a = 0 < (b.length | 0) && "L" === b.substring(0, 1) ? b.substring(1) : b;
                break a
            }
        a = a.split("_").join(".").split("$und").join("_");
        if (g) g = "\x3cclinit\x3e";
        else {
            g = c[2];
            if (void 0 === g) throw (new V).h("undefined.get");
            0 < (g.length | 0) && "init___" === g.substring(0, 7) ? g = "\x3cinit\x3e" : (c = g.indexOf("__") | 0, g = 0 > c ? g : g.substring(0, c))
        }
        return (new K).Q(a, g)
    }
    return (new K).Q("\x3cjscode\x3e", b)
}

// Gk function: parses Firefox stack traces from 'a.message'
function Gk(a) {
    var b = Bk("Line (\\d+).*script (?:in )?(\\S+)", "i");
    a = a.message.split("\n");
    for (var c = [], e = 2, f = a.length | 0; e < f;) {
        var g = b.exec(a[e]);
        if (null !== g) {
            var h = g[2];
            if (void 0 === h) throw (new V).h("undefined.get");
            g = g[1];
            if (void 0 === g) throw (new V).h("undefined.get");
            c.push("{anonymous}()@" + h + ":" + g)
        }
        e = 2 + e | 0
    }
    return c
}

// Dk function: gets a map of Scala.js package prefixes and caches it
function Dk(a) {
    0 === (4 & a.q) << 24 >> 24 && 0 === (4 & a.q) << 24 >> 24 && (a.Mm = {
        sjsr_: "scala_scalajs_runtime_",
        sjs_: "scala_scalajs_",
        sci_: "scala_collection_immutable_",
        scm_: "scala_collection_mutable_",
        scg_: "scala_collection_generic_",
        sc_: "scala_collection_",
        sr_: "scala_runtime_",
        s_: "scala_",
        jl_: "java_lang_",
        ju_: "java_util_"
    }, a.q = (4 | a.q) << 24 >> 24);
    return a.Mm
}

// yk prototype $classData
yk.prototype.$classData = z({
    Bz: 0
}, !1, "scala.scalajs.runtime.StackTrace$", {
    Bz: 1,
    c: 1
});

// Hk global variable
var Hk = void 0;

// Ik class constructor (empty)
function Ik() {}

// Ik prototype methods
Ik.prototype = new A;
Ik.prototype.constructor = Ik;
Ik.prototype.a = function() {
    return this
};

// Bk function: creates a new RegExp object
function Bk(a, b) {
    Jk || (Jk = (new Ik).a());
    return new l.RegExp(a, b)
}

// Ak function: creates a new RegExp object with a single argument
function Ak(a) {
    Jk || (Jk = (new Ik).a());
    return new l.RegExp(a)
}

// Ik prototype $classData
Ik.prototype.$classData = z({
    Cz: 0
}, !1, "scala.scalajs.runtime.StackTrace$StringRE$", {
    Cz: 1,
    c: 1
});

// Jk global variable
var Jk = void 0;

// Kk class constructor (empty)
function Kk() {}

// Kk prototype methods
Kk.prototype = new A;
Kk.prototype.constructor = Kk;
Kk.prototype.a = function() {
    return this
};

// T function: returns 'b.If' if 'b' is an instance of Lk, otherwise returns 'b'
function T(a, b) {
    return b instanceof Lk ? b.If : b
}

// Yc function: returns 'b' if it's an instance of W, otherwise returns a new Lk object
function Yc(a, b) {
    return b instanceof W ? b : (new Lk).j(b)
}

// Kk prototype $classData
Kk.prototype.$classData = z({
    Dz: 0
}, !1, "scala.scalajs.runtime.package$", {
    Dz: 1,
    c: 1
});

// Mk global variable
var Mk = void 0;

// S function: initializes and returns Mk
function S() {
    Mk || (Mk = (new Kk).a());
    return Mk
}

// Nk class constructor (empty)
function Nk() {}

// Nk prototype methods
Nk.prototype = new A;
Nk.prototype.constructor = Nk;
Nk.prototype.a = function() {
    return this
};

// Ok function: compares 'a' with 'b' for equality, handling different types
function Ok(a, b) {
    if (b instanceof wb) return a.s === b.s;
    if (Pk(b)) {
        if ("number" === typeof b) return +b === a.s;
        if (b instanceof x) {
            b = Ma(b);
            var c = b.i;
            a = a.s;
            return b.f === a && c === a >> 31
        }
        return null === b ? null === a : Ca(b, a)
    }
    return null === a && null === b
}

// G function: compares 'b' and 'c' for equality, handling different types
function G(a, b, c) {
    if (b === c) c = !0;
    else if (Pk(b)) a: if (Pk(c)) c = Qk(0, b, c);
        else {
            if (c instanceof wb) {
                if ("number" === typeof b) {
                    c = +b === c.s;
                    break a
                }
                if (b instanceof x) {
                    a = Ma(b);
                    b = a.i;
                    c = c.s;
                    c = a.f === c && b === c >> 31;
                    break a
                }
            }
            c = null === b ? null === c : Ca(b, c)
        }
    else c = b instanceof wb ? Ok(b, c) : null === b ? null === c : Ca(b, c);
    return c
}

// Qk function: compares 'b' and 'c' for equality, handling different types
function Qk(a, b, c) {
    if ("number" === typeof b) return a = +b, "number" === typeof c ? a === +c : c instanceof x ? (b = Ma(c), c = b.f, b = b.i, a === Rk(y(), c, b)) : c instanceof Sk ? c.t(a) : !1;
    if (b instanceof x) {
        b = Ma(b);
        a = b.f;
        b = b.i;
        if (c instanceof x) {
            c = Ma(c);
            var e = c.i;
            return a === c.f && b === e
        }
        return "number" === typeof c ? (c = +c, Rk(y(), a, b) === c) : c instanceof Sk ? c.t((new x).g(a, b)) : !1
    }
    return null === b ? null === c : Ca(b, c)
}

// Nk prototype $classData
Nk.prototype.$classData = z({
    Fz: 0
}, !1, "scala.runtime.BoxesRunTime$", {
    Fz: 1,
    c: 1
});

// Tk global variable
var Tk = void 0;

// H function: initializes and returns Tk
function H() {
    Tk || (Tk = (new Nk).a());
    return Tk
}

// Uk class data object
var Uk = z({
    Jz: 0
}, !1, "scala.runtime.Null$", {
    Jz: 1,
    c: 1
});

// Vk class constructor (empty)
function Vk() {}

// Vk prototype methods
Vk.prototype = new A;
Vk.prototype.constructor = Vk;
Vk.prototype.a = function() {
    return this
};

// Vk prototype $classData
Vk.prototype.$classData = z({
    Oz: 0
}, !1, "scala.runtime.RichDouble$", {
    Oz: 1,
    c: 1
});

// Wk global variable
var Wk = void 0;

// Xk function: initializes Wk
function Xk() {
    Wk || (Wk = (new Vk).a())
}

// Yk class constructor (empty)
function Yk() {}

// Yk prototype methods
Yk.prototype = new A;
Yk.prototype.constructor = Yk;
Yk.prototype.a = function() {
    return this
};

// Zk function: returns the long value of 'b'
function Zk(a, b) {
    return Rk(y(), b.f, b.i)
}

// Yk prototype $classData
Yk.prototype.$classData = z({
    Qz: 0
}, !1, "scala.runtime.RichLong$", {
    Qz: 1,
    c: 1
});

// $k global variable
var $k = void 0;

// al function: initializes and returns $k
function al() {
    $k || ($k = (new Yk).a());
    return $k
}

// bl class constructor (empty)
function bl() {}

// bl prototype methods
bl.prototype = new A;
bl.prototype.constructor = bl;
bl.prototype.a = function() {
    return this
};

// Ii function: returns the length of 'b' if it's an array-like object, otherwise throws an error
function Ii(a, b) {
    if (ub(b, 1) || eb(b, 1) || hb(b, 1) || fb(b, 1) || gb(b, 1) || bb(b, 1) || cb(b, 1) || db(b, 1) || $a(b, 1) || cl(b)) return b.b.length;
    if (null === b) throw (new Oc).a();
    throw (new J).j(b);
}

// dl function: sets the element at index 'c' in array 'b' to 'e'
function dl(a, b, c, e) {
    if (ub(b, 1)) b.b[c] = e;
    else if (eb(b, 1)) b.b[c] = e | 0;
    else if (hb(b, 1)) b.b[c] = +e;
    else if (fb(b, 1)) b.b[c] = Ma(e);
    else if (gb(b, 1)) b.b[c] = +e;
    else if (bb(b, 1)) b.b[c] = null === e ? 0 : e.s;
    else if (cb(b, 1)) b.b[c] = e | 0;
    else if (db(b, 1)) b.b[c] = e | 0;
    else if ($a(b, 1)) b.b[c] = !!e;
    else if (cl(b)) b.b[c] = void 0;
    else {
        if (null === b) throw (new Oc).a();
        throw (new J).j(b);
    }
}

// el function: formats a string representation of 'a'
function el(a) {
    Ji();
    var b = (new fl).af(a);
    return U(b, a.Ba() + "(", ",", ")")
}

// gl function: gets the element at index 'c' from array 'b'
function gl(a, b, c) {
    if (ub(b, 1) || eb(b, 1) || hb(b, 1) || fb(b, 1) || gb(b, 1)) return b.b[c];
    if (bb(b, 1)) return Zj(b.b[c]);
    if (cb(b, 1) || db(b, 1) || $a(b, 1) || cl(b)) return b.b[c];
    if (null === b) throw (new Oc).a();
    throw (new J).j(b);
}

// bl prototype $classData
bl.prototype.$classData = z({
    Sz: 0
}, !1, "scala.runtime.ScalaRunTime$", {
    Sz: 1,
    c: 1
});

// hl global variable
var hl = void 0;

// Ji function: initializes and returns hl
function Ji() {
    hl || (hl = (new bl).a());
    return hl
}

// il class constructor (empty)
function il() {}

// il prototype methods
il.prototype = new A;
il.prototype.constructor = il;
d = il.prototype;
d.a = function() {
    return this
};
d.pi = function(a, b) {
    b = n(-862048943, b);
    b = n(461845907, b << 15 | b >>> 17 | 0);
    return a ^ b
};

// jl function: converts 'b' to an integer, handling long values
function jl(a, b) {
    a = Ja(b);
    if (a === b) return a;
    var c = y();
    a = kl(c, b);
    c = c.M;
    return Rk(y(), a, c) === b ? a ^ c : Ga(Ha(), b)
}

// wi function: calculates a hash code for 'b'
function wi(a, b) {
    return null === b ? 0 : "number" === typeof b ? jl(0, +b) : b instanceof x ? (a = Ma(b), ll(0, (new x).g(a.f, a.i))) : Da(b)
}

// il prototype Fc method
d.Fc = function(a, b) {
    a = this.pi(a, b);
    return -430675100 + n(5, a << 13 | a >>> 19 | 0) | 0
};

// ll function: performs a bitwise XOR on 'a' and 'b'
function ll(a, b) {
    a = b.f;
    b = b.i;
    return b === a >> 31 ? a : a ^ b
}

// il prototype We method
d.We = function(a, b) {
    a ^= b;
    a = n(-2048144789, a ^ (a >>> 16 | 0));
    a = n(-1028477387, a ^ (a >>> 13 | 0));
    return a ^ (a >>> 16 | 0)
};

// il prototype $classData
d.$classData = z({
    Uz: 0
}, !1, "scala.runtime.Statics$", {
    Uz: 1,
    c: 1
});

// ml global variable
var ml = void 0;

// xi function: initializes and returns ml
function xi() {
    ml || (ml = (new il).a());
    return ml
}

// Tc class constructor
function Tc() {
    this.Cc = null
}

// Tc prototype methods
Tc.prototype = new A;
Tc.prototype.constructor = Tc;
Tc.prototype.j = function(a) {
    this.Cc = a;
    return this
};
Tc.prototype.Xe = function(a) {
    return (0, this.Cc)(a)
};

// Tc prototype $classData
Tc.prototype.$classData = z({
    ep: 0
}, !1, "atcoder.StdInConverter$$$Lambda$1", {
    ep: 1,
    c: 1,
    Mi: 1
});

// Hc class constructor
function Hc() {
    this.Cc = null
}

// Hc prototype methods
Hc.prototype = new A;
Hc.prototype.constructor = Hc;
Hc.prototype.j = function(a) {
    this.Cc = a;
    return this
};
Hc.prototype.Xe = function(a) {
    return (0, this.Cc)(a)
};

// Hc prototype $classData
Hc.prototype.$classData = z({
    fp: 0
}, !1, "atcoder.StdInConverter$$$Lambda$2", {
    fp: 1,
    c: 1,
    Mi: 1
});

// zc class constructor
function zc() {
    this.Cc = null
}

// zc prototype methods
zc.prototype = new A;
zc.prototype.constructor = zc;
zc.prototype.j = function(a) {
    this.Cc = a;
    return this
};
zc.prototype.Xe = function(a) {
    return (0, this.Cc)(a)
};

// zc prototype $classData
zc.prototype.$classData = z({
    gp: 0
}, !1, "atcoder.StdInConverter$$$Lambda$3", {
    gp: 1,
    c: 1,
    Mi: 1
});

// Nc class constructor
function Nc() {
    this.Cc = null
}

// Nc prototype methods
Nc.prototype = new A;
Nc.prototype.constructor = Nc;
Nc.prototype.j = function(a) {
    this.Cc = a;
    return this
};
Nc.prototype.Xe = function(a) {
    return (0, this.Cc)(a)
};

// Nc prototype $classData
Nc.prototype.$classData = z({
    hp: 0
}, !1, "atcoder.StdInConverter$$$Lambda$4", {
    hp: 1,
    c: 1,
    Mi: 1
});

// Kc class constructor
function Kc() {
    this.Cc = null
}

// Kc prototype methods
Kc.prototype = new A;
Kc.prototype.constructor = Kc;
Kc.prototype.j = function(a) {
    this.Cc = a;
    return this
};
Kc.prototype.Xe = function(a) {
    return (0, this.Cc)(a)
};

// Kc prototype $classData
Kc.prototype.$classData = z({
    ip: 0
}, !1, "atcoder.StdInConverter$$$Lambda$5", {
    ip: 1,
    c: 1,
    Mi: 1
});

// bd class constructor (empty)
function bd() {}

// bd prototype methods
bd.prototype = new A;
bd.prototype.constructor = bd;
bd.prototype.a = function() {
    return this
};

// bd prototype $classData
bd.prototype.$classData = z({
    up: 0
}, !1, "cats.NotNull$$anon$1", {
    up: 1,
    c: 1,
    lA: 1
});

// Rb class constructor
function Rb() {
    this.Po = this.la = null
}

// Rb prototype methods
Rb.prototype = new A;
Rb.prototype.constructor = Rb;

// Rb prototype $classData
Rb.prototype.$classData = z({
    Bp: 0
}, !1, "cats.Show$ToShowOps$$anon$1", {
    Bp: 1,
    c: 1,
    rA: 1
});

// nl class constructor (inherits from kd)
function nl() {}

// Set nl's prototype to kd's prototype
nl.prototype = new kd;
nl.prototype.constructor = nl;

// ol class constructor (inherits from nl)
function ol() {}

// Set ol's prototype to nl's prototype
ol.prototype = nl.prototype;

// pl class constructor (empty)
function pl() {}

// pl prototype methods
pl.prototype = new A;
pl.prototype.constructor = pl;

// ql class constructor (inherits from pl)
function ql() {}

// Set ql's prototype to pl's prototype
ql.prototype = pl.prototype;

// rl function: executes an IO action 'a' and handles its result
function rl(a) {
    sl();
    a = he(Qd(), a);
    if (a instanceof Zd) a = (new Q).j(a.yf);
    else {
        if (a instanceof $d) throw a = a.Gf, T(S(), a);
        if (a instanceof Nd) {
            Fd || (Fd = (new Ed).a());
            var b = (new ul).a();
            Dd();
            var c = (new be).a();
            Pd(Qd(), a, c, b, null, null, null);
            if (0 === (2 & c.ue) << 24 >> 24) throw (new ve).h("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/IOConnection.scala: 109");
            a = c.Am;
            c = b.s;
            if (c instanceof wc) a = (new Q).j(c.E);
            else {
                if (c instanceof Fc) throw a = c.E, T(S(), a);
                if (null === c) {
                    b.wj = !1;
                    b.ma = !0;
                    b = pd();
                    if (0 === (1 & b.ma) << 24 >> 24) throw (new ve).h("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/Callback.scala: 37");
                    b = b.lo;
                    c = Qd();
                    var e = Dd();
                    if (!e.ma) throw (new ve).h("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/IOConnection.scala: 94");
                    Pd(c, a, e.Qo, b, null, null, null);
                    throw (new Pc).h("cannot synchronously await result on JavaScript; use runAsync or unsafeRunAsync");
                }
                throw (new J).j(c);
            }
        } else throw (new wj).j("unreachable");
    }
    a.Nb()
}

// pl prototype n method
pl.prototype.n = function() {
    return this instanceof Zd ? "IO(" + this.yf + ")" : this instanceof $d ? "IO(throw " + this.Gf + ")" : "IO$" + Ia(this)
};

// vl function: creates a new ae object
function vl(a, b) {
    if (a instanceof ae) {
        var c = a.Xb,
            e = a.Jb,
            f = a.wd;
        return 31 !== f ? wl(new ae, c, e.Rb(b), 1 + f | 0) : wl(new ae, a, b, 0)
    }
    return wl(new ae, a, b, 0)
}

// be class constructor
function be() {
    this.Am = this.Ai = null;
    this.ue = 0
}

// be prototype methods
be.prototype = new yd;
be.prototype.constructor = be;

// be prototype a method
be.prototype.a = function() {
    this.Ai = (new xl).j((L(), M()));
    this.ue = (1 | this.ue) << 24 >> 24;
    Mb();
    this.Am = (new td).ge(Ob(function(a) {
        return function() {
            var b = a.Ai,
                c = b.s;
            b.s = null;
            null === c || M().t(c) ? b = sd() : (wd || (wd = (new qd).a()), b = rd(wd, yl(c)));
            return b
        }
    }(this)));
    this.ue = (2 | this.ue) << 24 >> 24;
    return this
};

// be prototype el method
be.prototype.el = function() {
    return null === this.Ai.s
};

// be prototype fo method
be.prototype.fo = function() {
    for (;;) {
        var a = this.Ai.s;
        if (null === a || M().t(a)) {
            sd();
            break
        }
        if (a instanceof N) {
            var b = this.Ai;
            a === b.s ? (b.s = a.uc, a = !0) : a = !1;
            if (a) break
        } else throw (new J).j(a);
    }
};

// be prototype $classData
be.prototype.$classData = z({
    cq: 0
}, !1, "cats.effect.internals.IOConnection$Impl", {
    cq: 1,
    aq: 1,
    c: 1
});

// Cd class constructor
function Cd() {}

// Cd prototype methods
Cd.prototype = new yd;
Cd.prototype.constructor = Cd;
Cd.prototype.a = function() {
    return this
};
Cd.prototype.el = function() {
    return !1
};
Cd.prototype.fo = function() {
    sd()
};

// Cd prototype $classData
Cd.prototype.$classData = z({
    dq: 0
}, !1, "cats.effect.internals.IOConnection$Uncancelable", {
    dq: 1,
    aq: 1,
    c: 1
});

// Kd class constructor (empty)
function Kd() {}

// Kd prototype methods
Kd.prototype = new A;
Kd.prototype.constructor = Kd;

// zl class constructor (inherits from Kd)
function zl() {}

// Set zl's prototype to Kd's prototype
zl.prototype = Kd.prototype;

// Kd prototype n method
Kd.prototype.n = function() {
    return "\x3cfunction1\x3e"
};

// Kd prototype Rb method
Kd.prototype.Rb = function(a) {
    return jb(this, a)
};

// ul class constructor
function ul() {
    this.wj = !1;
    this.s = null;
    this.ma = !1
}

// ul prototype methods
ul.prototype = new A;
ul.prototype.constructor = ul;
d = ul.prototype;
d.a = function() {
    this.ma = this.wj = !0;
    return this
};
d.l = function(a) {
    this.gh(a)
};
d.n = function() {
    return "\x3cfunction1\x3e"
};
d.gh = function(a) {
    if (!this.ma) throw (new ve).h("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/js/src/main/scala/cats/effect/internals/IOPlatform.scala: 66");
    this.wj ? (this.wj = !1, this.ma = !0, this.s = a) : a instanceof Fc && (a = a.E, nd().l(a))
};
d.Rb = function(a) {
    return jb(this, a)
};

// ul prototype $classData
d.$classData = z({
    gq: 0
}, !1, "cats.effect.internals.IOPlatform$ResyncCallback", {
    gq: 1,
    c: 1,
    P: 1
});

// Al class constructor
function Al() {
    this.k = this.mo = this.Uc = null
}

// Al prototype methods
Al.prototype = new A;
Al.prototype.constructor = Al;
Al.prototype.Lj = function() {
    var a = this.k.qg,
        b = this.mo,
        c = new Bl;
    if (null === b) throw T(S(), null);
    c.k = b;
    c.Ph = b.ce;
    c.ma = (1 | c.ma) << 24 >> 24;
    c.Wc = b.hd;
    for (c.ma = (2 | c.ma) << 24 >> 24; c.r();) Yd(a, c.u());
    oe(this.k, this.Uc)
};

// pe function: creates and returns a new Al object
function pe(a, b, c) {
    var e = new Al;
    e.Uc = b;
    e.mo = c;
    if (null === a) throw T(S(), null);
    e.k = a;
    return e
}

// Al prototype $classData
Al.prototype.$classData = z({
    mq: 0
}, !1, "cats.effect.internals.Trampoline$ResumeRun$1", {
    mq: 1,
    c: 1,
    Jn: 1
});

// se class constructor
function se() {
    this.Oo = this.Eh = null;
    this.ma = !1
}

// se prototype methods
se.prototype = new A;
se.prototype.constructor = se;
se.prototype.ol = function(a) {
    this.Eh.ol(a)
};
se.prototype.al = function(a) {
    this.Eh = a;
    this.Oo = (new ne).al(a);
    this.ma = !0;
    return this
};
se.prototype.oh = function(a) {
    this.Oo.oh(a)
};

// se prototype $classData
se.prototype.$classData = z({
    nq: 0
}, !1, "cats.effect.internals.TrampolineEC", {
    nq: 1,
    c: 1,
    Xv: 1
});

// te class constructor (empty)
function te() {}

// te prototype methods
te.prototype = new A;
te.prototype.constructor = te;
te.prototype.a = function() {
    return this
};
te.prototype.ol = function(a) {
    nd().l(a)
};
te.prototype.oh = function(a) {
    a.Lj()
};

// te prototype $classData
te.prototype.$classData = z({
    pq: 0
}, !1, "cats.effect.internals.TrampolineEC$$anon$1", {
    pq: 1,
    c: 1,
    Xv: 1
});

// Cl class constructor (inherits from xe)
function Cl() {}

// Set Cl's prototype to xe's prototype
Cl.prototype = new xe;
Cl.prototype.constructor = Cl;

// Dl class constructor (inherits from Cl)
function Dl() {}

// Set Dl's prototype to Cl's prototype
Dl.prototype = Cl.prototype;

// El class constructor (inherits from ze)
function El() {}

// Set El's prototype to ze's prototype
El.prototype = new ze;
El.prototype.constructor = El;

// Fl class constructor (inherits from El)
function Fl() {}

// Set Fl's prototype to El's prototype
Fl.prototype = El.prototype;

// Gl class constructor (inherits from xe)
function Gl() {}

// Set Gl's prototype to xe's prototype
Gl.prototype = new xe;
Gl.prototype.constructor = Gl;

// Hl class constructor (inherits from Gl)
function Hl() {}

// Set Hl's prototype to Gl's prototype
Hl.prototype = Gl.prototype;

// Il function: creates a new Ll object with a comparison function
function Il(a) {
    var b = Jl(a);
    return Kl(new Ll, b, Od(function(c) {
        return function(e, f) {
            return Ml(c).$a(e.E, f.E)
        }
    }(a)))
}

// Nl function: creates a new Ql object with a comparison function
function Nl(a) {
    var b = Ol(a);
    return Pl(new Ql, b, Od(function(c) {
        return function(e, f) {
            var g = e.ra,
                h = f.ra,
                k = bh().G;
            g = Rl(g, h, k).Mb(F(function() {
                return function(m) {
                    return !G(H(), m.Ga(), m.Qa())
                }
            }(c)));
            g.m() ? g = R() : (g = g.Nb(), g = (new Q).j(Ml(c).$a(g.Ga().E, g.Qa().E)));
            g.m() ? (Sl(c), e = Tl(e.ra), Sl(c), f = Tl(f.ra), f = e === f ? 0 : e < f ? -1 : 1) : f = g.Nb();
            return f | 0
        }
    }(a)))
}

// Ul function: sets lu, Fv, and ku properties as functions
function Ul(a) {
    a.lu = F(function() {
        return function() {
            return !0
        }
    }(a));
    a.Fv = F(function() {
        return function() {
            return !1
        }
    }(a));
    a.ku = F(function() {
        return function() {
            return !0
        }
    }(a))
}

// Vl class constructor (empty)
function Vl() {}

// Vl prototype methods
Vl.prototype = new A;
Vl.prototype.constructor = Vl;

// Wl class constructor (inherits from Vl)
function Wl() {}

// Set Wl's prototype to Vl's prototype
Wl.prototype = Vl.prototype;

// Pk function: checks if 'a' is an instance of Vl or a number
function Pk(a) {
    return a instanceof Vl || "number" === typeof a
}

// Xl class constructor
function Xl() {
    this.ci = this.oi = this.lh = null;
    this.Wh = this.li = 0
}

// Xl prototype methods
Xl.prototype = new A;
Xl.prototype.constructor = Xl;
Xl.prototype.t = function(a) {
    return a instanceof Xl ? this.ci === a.ci && this.li === a.li && this.lh === a.lh && this.oi === a.oi : !1
};
Xl.prototype.n = function() {
    var a = "";
    "\x3cjscode\x3e" !== this.lh && (a = "" + a + this.lh + ".");
    a = "" + a + this.oi;
    null === this.ci ? a += "(Unknown Source)" : (a = a + "(" + this.ci, 0 <= this.li && (a = a + ":" + this.li, 0 <= this.Wh && (a = a + ":" + this.Wh)), a += ")");
    return a
};
Xl.prototype.z = function() {
    var a = this.lh;
    a = Ea(Fa(), a);
    var b = this.oi;
    return a ^ Ea(Fa(), b)
};
Xl.prototype.setColumnNumber = function(a) {
    this.Wh = a | 0
};
Xl.prototype.getColumnNumber = function() {
    return this.Wh
};

// Yl class data object
var Yl = z({
    Vu: 0
}, !1, "java.lang.StackTraceElement", {
    Vu: 1,
    c: 1,
    d: 1
});

// Xl prototype $classData
Xl.prototype.$classData = Yl;

// W class constructor
function W() {
    this.hj = this.no = null;
    this.Wo = !1;
    this.Bh = null
}

// W prototype methods
W.prototype = new A;
W.prototype.constructor = W;

// Zl class constructor (inherits from W)
function Zl() {}

// Set Zl's prototype to W's prototype
Zl.prototype = W.prototype;

// W prototype di method
W.prototype.di = function() {
    if (void 0 === l.Error.captureStackTrace) {
        try {
            var a = {}.undef()
        } catch (b) {
            if (a = Yc(S(), b), null !== a)
                if (a instanceof Lk) a = a.If;
                else throw T(S(), a);
            else throw b;
        }
        this.stackdata = a
    } else l.Error.captureStackTrace(this), this.stackdata = this;
    return this
};

// W prototype ud method
W.prototype.ud = function() {
    return this.no
};

// W prototype n method
W.prototype.n = function() {
    var a = sb(na(this)),
        b = this.ud();
    return null === b ? a : a + ": " + b
};

// $l function: formats a stack trace for 'a'
function $l(a) {
    if (null === a.Bh) {
        if (a.Wo) {
            Hk || (Hk = (new yk).a());
            var b = Hk;
            var c = a.stackdata;
            if (c) {
                if (0 === (1 & b.q) << 24 >> 24 && 0 === (1 & b.q) << 24 >> 24) {
                    a: try {
                        l.Packages.org.mozilla.javascript.JavaScriptException;
                        var e = !0
                    } catch (u) {
                        e = Yc(S(), u);
                        if (null !== e) {
                            if (e instanceof Lk) {
                                e = !1;
                                break a
                            }
                            throw T(S(), e);
                        }
                        throw u;
                    }
                    b.An = e;
                    b.q = (1 | b.q) << 24 >> 24
                }
                if (b.An) e = c.stack, e = (void 0 === e ? "" : e).replace(Bk("^\\s+at\\s+", "gm"), "").replace(Bk("^(.+?)(?: \\((.+)\\))?$", "gm"), "$2@$1").replace(Bk("\\r\\n?", "gm"), "\n").split("\n");
                else if (c.arguments && c.stack) e = zk(c);
                else if (c.stack && c.sourceURL) e = c.stack.replace(Bk("\\[native code\\]\\n", "m"), "").replace(Bk("^(?\x3d\\w+Error\\:).*$\\n", "m"), "").replace(Bk("^@", "gm"), "{anonymous}()@").split("\n");
                else if (c.stack && c.number) e = c.stack.replace(Bk("^\\s*at\\s+(.*)$", "gm"), "$1").replace(Bk("^Anonymous function\\s+", "gm"), "{anonymous}() ").replace(Bk("^([^\\(]+|\\{anonymous\\}\\(\\))\\s+\\((.+)\\)$", "gm"), "$1@$2").split("\n").slice(1);
                else if (c.stack && c.fileName) e = c.stack.replace(Bk("(?:\\n@:0)?\\s+$", "m"), "").replace(Bk("^(?:\\((\\S*)\\))?@", "gm"), "{anonymous}($1)@").split("\n");
                else if (c.message && c["opera#sourceloc"])
                    if (c.stacktrace)
                        if (-1 < c.message.indexOf("\n") && c.message.split("\n").length > c.stacktrace.split("\n").length) e = Gk(c);
                        else {
                            e = Bk("Line (\\d+).*script (?:in )?(\\S+)(?:: In function (\\S+))?$", "i");
                            c = c.stacktrace.split("\n");
                            var f = [];
                            for (var g = 0, h = c.length | 0; g < h;) {
                                var k = e.exec(c[g]);
                                if (null !== k) {
                                    var m = k[3];
                                    m = void 0 === m ? "{anonymous}" : m;
                                    var p = k[2];
                                    if (void 0 === p) throw (new V).h("undefined.get");
                                    k = k[1];
                                    if (void 0 === k) throw (new V).h("undefined.get");
                                    f.push(m + "()@" + p + ":" + k)
                                }
                                g = 2 + g | 0
                            }
                            e = f
                        }
                else e = Gk(c);
                else if (c.message && c.stack && c.stacktrace)
                    if (0 > c.stacktrace.indexOf("called from line")) {
                        e = Ak("^(.*)@(.+):(\\d+)$");
                        c = c.stacktrace.split("\n");
                        f = [];
                        g = 0;
                        for (h = c.length | 0; g < h;) {
                            k = e.exec(c[g]);
                            if (null !== k) {
                                m = k[1];
                                m = void 0 === m ? "global code" : m + "()";
                                p = k[2];
                                if (void 0 === p) throw (new V).h("undefined.get");
                                k = k[3];
                                if (void 0 === k) throw (new V).h("undefined.get");
                                f.push(m + "@" + p + ":" + k)
                            }
                            g = 1 + g | 0
                        }
                        e = f
                    } else {
                        e = Ak("^.*line (\\d+), column (\\d+)(?: in (.+))? in (\\S+):$");
                        c = c.stacktrace.split("\n");
                        f = [];
                        g = 0;
                        for (h = c.length | 0; g < h;) {
                            k = e.exec(c[g]);
                            if (null !== k) {
                                m = k[4];
                                if (void 0 === m) throw (new V).h("undefined.get");
                                p = k[1];
                                if (void 0 === p) throw (new V).h("undefined.get");
                                var q = k[2];
                                if (void 0 === q) throw (new V).h("undefined.get");
                                m = m + ":" + p + ":" + q;
                                k = k[2];
                                k = (void 0 === k ? "global code" : k).replace(Ak("\x3canonymous function: (\\S+)\x3e"), "$1").replace(Ak("\x3canonymous function\x3e"), "{anonymous}");
                                f.push(k + "@" + m) | 0
                            }
                            g = 2 + g | 0
                        }
                        e = f
                    }
                else e = c.stack && !c.fileName ? zk(c) : []
            } else e = [];
            f = e;
            g = Ak("^([^\\@]*)\\@(.*):([0-9]+)$");
            h = Ak("^([^\\@]*)\\@(.*):([0-9]+):([0-9]+)$");
            c = [];
            for (e = 0; e < (f.length | 0);) {
                k = f[e];
                if (null === k) throw (new Oc).a();
                if ("" !== k)
                    if (m = h.exec(k), null !== m) {
                        k = m[1];
                        if (void 0 === k) throw (new V).h("undefined.get");
                        p = Fk(b, k);
                        if (null === p) throw (new J).j(p);
                        k = p.Ga();
                        p = p.Qa();
                        q = m[2];
                        if (void 0 === q) throw (new V).h("undefined.get");
                        var t = m[3];
                        if (void 0 === t) throw (new V).h("undefined.get");
                        t = (new Bc).h(t);
                        t = Wc(Xc(), t.ob, 10);
                        m = m[4];
                        if (void 0 === m) throw (new V).h("undefined.get");
                        m = (new Bc).h(m);
                        m = Wc(Xc(), m.ob, 10);
                        c.push({
                            declaringClass: k,
                            methodName: p,
                            fileName: q,
                            lineNumber: t,
                            columnNumber: void 0 === m ? void 0 : m
                        })
                    } else if (m = g.exec(k), null !== m) {
                        k = m[1];
                        if (void 0 === k) throw (new V).h("undefined.get");
                        p = Fk(b, k);
                        if (null === p) throw (new J).j(p);
                        k = p.Ga();
                        p = p.Qa();
                        q = m[2];
                        if (void 0 === q) throw (new V).h("undefined.get");
                        m = m[3];
                        if (void 0 === m) throw (new V).h("undefined.get");
                        m = (new Bc).h(m);
                        m = Wc(Xc(), m.ob, 10);
                        c.push({
                            declaringClass: k,
                            methodName: p,
                            fileName: q,
                            lineNumber: m,
                            columnNumber: void 0
                        })
                    } else c.push({
                        declaringClass: "\x3cjscode\x3e",
                        methodName: k,
                        fileName: null,
                        lineNumber: -1,
                        columnNumber: void 0
                    }) | 0;
                e = 1 + e | 0
            }
            b = aa.sourceMapper;
            b = void 0 === b ? c : b(c);
            c = r(D(Yl), [b.length | 0]);
            for (e = 0; e < (b.length | 0);) f = b[e], g = f.methodName, h = f.fileName, k = f.lineNumber | 0, m = new Xl, m.lh = f.declaringClass, m.oi = g, m.ci = h, m.li = k, m.Wh = -1, g = m, f = f.columnNumber, void 0 !== f && g.setColumnNumber(f | 0), c.b[e] = g, e = 1 + e | 0;
            b = c
        } else b = r(D(Yl), [0]);
        a.Bh = b
    }
    return a.Bh
}

// Vg function: prints the stack trace of 'a' to the console
function Vg(a) {
    var b = Pb().fn;
    b = function(p, q) {
        return function(t) {
            Sb(q, null === t ? "null" : t);
            Sb(q, "\n")
        }
    }(a, b);
    $l(a);
    var c = a.n();
    b(c);
    if (0 !== a.Bh.b.length)
        for (c = 0; c < a.Bh.b.length;) b("  at " + a.Bh.b[c]), c = 1 + c | 0;
    else b("  \x3cno stack trace available\x3e");
    for (;;)
        if (a !== a.hj && null !== a.hj) {
            var e = $l(a);
            a = a.hj;
            c = $l(a);
            var f = c.b.length,
                g = e.b.length,
                h = "Caused by: " + a.n();
            b(h);
            if (0 !== f) {
                for (h = 0;;) {
                    if (h < f && h < g) {
                        var k = c.b[-1 + (f - h | 0) | 0],
                            m = e.b[-1 + (g - h | 0) | 0];
                        k = null === k ? null === m : k.t(m)
                    } else k = !1;
                    if (k) h = 1 + h | 0;
                    else break
                }
                0 < h && (h = -1 + h | 0);
                e = f - h | 0;
                for (f = 0; f < e;) b("  at " + c.b[f]), f = 1 + f | 0;
                0 < h && b("  ... " + h + " more")
            } else b("  \x3cno stack trace available\x3e")
        } else break
}

// W prototype Ua method
W.prototype.Ua = function(a, b) {
    this.no = a;
    this.hj = b;
    this.Wo = !0;
    this.di()
};

// Nj class constructor
function Nj() {
    this.sn = this.co = null;
    this.jo = this.ko = 0;
    this.Fg = this.tn = this.nl = null;
    this.Hk = !1
}

// Nj prototype methods
Nj.prototype = new A;
Nj.prototype.constructor = Nj;

// Oj function: attempts to find the next match in 'a.tn' using 'a.nl'
function Oj(a) {
    if (a.Hk) {
        a.Fg = a.nl.exec(a.tn);
        if (null !== a.Fg) {
            var b = a.Fg[0];
            if (void 0 === b) throw (new V).h("undefined.get");
            if (null === b) throw (new Oc).a();
            "" === b && (b = a.nl, b.lastIndex = 1 + (b.lastIndex | 0) | 0)
        } else a.Hk = !1;
        R();
        return null !== a.Fg
    }
    return !1
}

// Qj function: returns the current match result from 'a.Fg'
function Qj(a) {
    if (null === a.Fg) throw (new am).h("No match available");
    return a.Fg
}

// Pj function: returns the end index of the current match in 'a.tn'
function Pj(a) {
    var b = Qj(a).index | 0;
    a = Qj(a)[0];
    if (void 0 === a) throw (new V).h("undefined.get");
    return b + (a.length | 0) | 0
}

// Nj prototype $classData
Nj.prototype.$classData = z({
    Av: 0
}, !1, "java.util.regex.Matcher", {
    Av: 1,
    c: 1,
    AH: 1
});

// bm class constructor (empty)
function bm() {}

// bm prototype methods
bm.prototype = new A;
bm.prototype.constructor = bm;
bm.prototype.ng = function() {
    cm();
    oh();
    return (new dm).a()
};
bm.prototype.Qe = function() {
    cm();
    oh();
    return (new dm).a()
};

// bm prototype $classData
bm.prototype.$classData = z({
    Hv: 0
}, !1, "scala.LowPriorityImplicits$$anon$4", {
    Hv: 1,
    c: 1,
    ui: 1
});

// em class constructor (empty)
function em() {}

// em prototype methods
em.prototype = new A;
em.prototype.constructor = em;
em.prototype.a = function() {
    return this
};
em.prototype.ng = function() {
    return (new Li).a()
};
em.prototype.Qe = function() {
    return (new Li).a()
};

// em prototype $classData
em.prototype.$classData = z({
    Ov: 0
}, !1, "scala.Predef$$anon$1", {
    Ov: 1,
    c: 1,
    ui: 1
});

// fm function: returns a property of 'a' based on 'b'
function fm(a, b) {
    switch (b) {
        case 0:
            return a.lc;
        case 1:
            return a.nc;
        case 2:
            return a.pc;
        case 3:
            return a.Fd;
        default:
            throw (new X).h("" + b);
    }
}

// gm function: returns a property of 'a' based on 'b'
function gm(a, b) {
    switch (b) {
        case 0:
            return a.lc;
        case 1:
            return a.nc;
        case 2:
            return a.pc;
        case 3:
            return a.Fd;
        case 4:
            return a.ah;
        default:
            throw (new X).h("" + b);
    }
}

// $g class constructor (empty)
function $g() {}

// $g prototype methods
$g.prototype = new A;
$g.prototype.constructor = $g;
$g.prototype.a = function() {
    return this
};
$g.prototype.n = function() {
    return "object AnyRef"
};

// $g prototype $classData
$g.prototype.$classData = z({
    rw: 0
}, !1, "scala.package$$anon$1", {
    rw: 1,
    c: 1,
    KH: 1
});

// hm class constructor (inherits from ti)
function hm() {
    this.cg = this.On = this.El = 0
}

// Set hm's prototype to ti's prototype
hm.prototype = new ti;
hm.prototype.constructor = hm;

// hm prototype a method
hm.prototype.a = function() {
    im = this;
    this.El = Ea(Fa(), "Seq");
    this.On = Ea(Fa(), "Map");
    this.cg = Ea(Fa(), "Set");
    return this
};

// jm function: calculates a hash code for 'a'
function jm(a) {
    var b = vi();
    if (a instanceof km) {
        for (var c = 0, e = b.El, f = a; !f.m();) a = f.w(), f = f.cb(), e = b.Fc(e, wi(xi(), a)), c = 1 + c | 0;
        b = b.We(e, c)
    } else b = Ai(b, a, b.El);
    return b
}

// hm prototype $classData
hm.prototype.$classData = z({
    Xw: 0
}, !1, "scala.util.hashing.MurmurHash3$", {
    Xw: 1,
    PH: 1,
    c: 1
});

// im global variable
var im = void 0;

// vi function: initializes and returns im
function vi() {
    im || (im = (new hm).a());
    return im
}

// ac function: creates a new lm object with a filter function
function ac(a, b) {
    return (new lm).fi(a, F(function(c, e) {
        return function(f) {
            return !e.l(f)
        }
    }(a, b)))
}

// mm function: checks if all elements in 'a' satisfy the condition 'b'
function mm(a, b) {
    for (var c = !0; c && a.r();) c = !!b.l(a.u());
    return c
}

// nm function: applies function 'b' to each element in 'a'
function nm(a, b) {
    for (; a.r();) b.l(a.u())
}

// om function: creates a new Gi object and sets its properties
function om(a, b) {
    a = (new pm).bl(a);
    var c = new Gi;
    c.Uc = b;
    c.xb = null;
    null === a.xb ? a.xb = c : a.ki.xb = c;
    a.ki = c;
    null === a.id && (a.id = eh().nb);
    return a
}

// qm function: finds the first element in 'a' that satisfies 'b'
function qm(a, b) {
    for (; a.r();) {
        var c = a.u();
        if (b.l(c)) return (new Q).j(c)
    }
    return R()
}

// rm function: returns an xm object if 'a' is not empty, otherwise returns a zm object
function rm(a) {
    if (a.r()) {
        var b = a.u();
        return xm(new ym, b, Ob(function(c) {
            return function() {
                return c.Ka()
            }
        }(a)))
    }
    lh();
    return zm()
}

// Am function: copies elements from 'a' to 'b'
function Am(a, b, c, e) {
    var f = c,
        g = Ii(Ji(), b) - c | 0;
    for (c = c + (e < g ? e : g) | 0; f < c && a.r();) dl(Ji(), b, f, a.u()), f = 1 + f | 0
}

// Bm class constructor
function Bm() {
    this.k = this.$n = null
}

// Bm prototype methods
Bm.prototype = new A;
Bm.prototype.constructor = Bm;
Bm.prototype.K = function(a) {
    this.k.K(F(function(b, c) {
        return function(e) {
            return b.$n.l(e) ? c.l(e) : void 0
        }
    }(this, a)))
};

// Cm function: sets $n and k properties and returns 'a'
function Cm(a, b, c) {
    a.$n = c;
    if (null === b) throw T(S(), null);
    a.k = b;
    return a
}

// Bm prototype $classData
Bm.prototype.$classData = z({
    vx: 0
}, !1, "scala.collection.TraversableLike$WithFilter", {
    vx: 1,
    c: 1,
    W: 1
});

// Dm class constructor (empty)
function Dm() {}

// Dm prototype methods
Dm.prototype = new Xi;
Dm.prototype.constructor = Dm;

// Em class constructor (inherits from Dm)
function Em() {}

// Set Em's prototype to Dm's prototype
Em.prototype = Dm.prototype;

// Fm class constructor
function Fm() {
    this.k = null
}

// Fm prototype methods
Fm.prototype = new A;
Fm.prototype.constructor = Fm;
Fm.prototype.ng = function() {
    return this.k.fa()
};
Fm.prototype.Qe = function(a) {
    return a && a.$classData && a.$classData.qa.Wb ? a.Ra().fa() : this.k.fa()
};

// jc function: creates and returns a new Fm object
function jc(a) {
    var b = new Fm;
    if (null === a) throw T(S(), null);
    b.k = a;
    return b
}

// Fm prototype $classData
Fm.prototype.$classData = z({
    Bx: 0
}, !1, "scala.collection.generic.GenSetFactory$$anon$1", {
    Bx: 1,
    c: 1,
    ui: 1
});

// Gm class constructor
function Gm() {
    this.G = null
}

// Gm prototype methods
Gm.prototype = new Xi;
Gm.prototype.constructor = Gm;

// Hm class constructor (inherits from Gm)
function Hm() {}

// Set Hm's prototype to Gm's prototype
Hm.prototype = Gm.prototype;

// Gm prototype a method
Gm.prototype.a = function() {
    this.G = (new Im).gi(this);
    return this
};

// Jm class constructor
function Jm() {
    this.k = null
}

// Jm prototype methods
Jm.prototype = new A;
Jm.prototype.constructor = Jm;

// Km class constructor (inherits from Jm)
function Km() {}

// Set Km's prototype to Jm's prototype
Km.prototype = Jm.prototype;

// Jm prototype ng method
Jm.prototype.ng = function() {
    return this.k.fa()
};

// Jm prototype Qe method
Jm.prototype.Qe = function(a) {
    return a.Ra().fa()
};

// Jm prototype gi method
Jm.prototype.gi = function(a) {
    if (null === a) throw T(S(), null);
    this.k = a;
    return this
};

// Lm class constructor (inherits from Vi)
function Lm() {}

// Set Lm's prototype to Vi's prototype
Lm.prototype = new Vi;
Lm.prototype.constructor = Lm;

// Mm class constructor (inherits from Lm)
function Mm() {}

// Set Mm's prototype to Lm's prototype
Mm.prototype = Lm.prototype;

// Nm class constructor (inherits from aj)
function Nm() {
    this.Qn = null
}

// Nm prototype methods
Nm.prototype = new aj;
Nm.prototype.constructor = Nm;

// Om function: sets Qn property and performs a null check
function Om(a, b) {
    a.Qn = b;
    if (null === a) throw T(S(), null);
}

// Nm prototype ym method
Nm.prototype.ym = function(a, b) {
    return de(this.Qn, a, b)
};

// Nm prototype $classData
Nm.prototype.$classData = z({
    Jx: 0
}, !1, "scala.collection.immutable.HashMap$$anon$1", {
    Jx: 1,
    Qx: 1,
    c: 1
});

// Class data object for scala.collection.immutable.HashMap$$anon$1$$anon$2
z({
    Kx: 0
}, !1, "scala.collection.immutable.HashMap$$anon$1$$anon$2", {
    Kx: 1,
    Qx: 1,
    c: 1
});

// Pm class constructor (empty)
function Pm() {}

// Pm prototype methods
Pm.prototype = new A;
Pm.prototype.constructor = Pm;
d = Pm.prototype;
d.a = function() {
    return this
};
d.l = function() {
    return this
};
d.n = function() {
    return "\x3cfunction1\x3e"
};
d.Rb = function(a) {
    return jb(this, a)
};

// Pm prototype $classData
d.$classData = z({
    by: 0
}, !1, "scala.collection.immutable.List$$anon$1", {
    by: 1,
    c: 1,
    P: 1
});

// Qm function: calls hc on 'a' with 'b'
function Qm(a, b) {
    b = b.gc();
    switch (b) {
        case -1:
            break;
        default:
            a.hc(b)
    }
}

// Rm function: calls hc on 'a' with 'b + c'
function Rm(a, b, c) {
    b = b.gc();
    switch (b) {
        case -1:
            break;
        default:
            a.hc(b + c | 0)
    }
}

// Sm function: calls hc on 'a' with the minimum of 'b' and 'c'
function Sm(a, b, c) {
    c = c.gc();
    switch (c) {
        case -1:
            break;
        default:
            a.hc(b < c ? b : c)
    }
}

// Tm class constructor (empty)
function Tm() {}

// Tm prototype methods
Tm.prototype = new A;
Tm.prototype.constructor = Tm;

// Um class constructor (inherits from Tm)
function Um() {}

// Set Um's prototype to Tm's prototype
Um.prototype = Tm.prototype;

// Tm prototype n method
Tm.prototype.n = function() {
    return "\x3cfunction0\x3e"
};

// Vm class constructor (empty)
function Vm() {}

// Vm prototype methods
Vm.prototype = new A;
Vm.prototype.constructor = Vm;

// Wm class constructor (inherits from Vm)
function Wm() {}

// Set Wm's prototype to Vm's prototype
Wm.prototype = Vm.prototype;

// Vm prototype n method
Vm.prototype.n = function() {
    return "\x3cfunction1\x3e"
};

// Vm prototype Rb method
Vm.prototype.Rb = function(a) {
    return jb(this, a)
};

// Xm class constructor (empty)
function Xm() {}

// Xm prototype methods
Xm.prototype = new A;
Xm.prototype.constructor = Xm;

// Ym class constructor (inherits from Xm)
function Ym() {}

// Set Ym's prototype to Xm's prototype
Ym.prototype = Xm.prototype;

// Xm prototype n method
Xm.prototype.n = function() {
    return "\x3cfunction2\x3e"
};

// Oi class constructor
function Oi() {
    this.o = !1
}

// Oi prototype methods
Oi.prototype = new A;
Oi.prototype.constructor = Oi;
Oi.prototype.n = function() {
    return "" + this.o
};
Oi.prototype.$e = function(a) {
    this.o = a;
    return this
};

// Oi prototype $classData
Oi.prototype.$classData = z({
    Ez: 0
}, !1, "scala.runtime.BooleanRef", {
    Ez: 1,
    c: 1,
    d: 1
});

// cl function: checks if 'a' has a specific class data property
function cl(a) {
    return !!(a && a.$classData && 1 === a.$classData.ih && a.$classData.hh.qa.Ko)
}

// Aa class data object
var Aa = z({
    Ko: 0
}, !1, "scala.runtime.BoxedUnit", {
    Ko: 1,
    c: 1,
    d: 1
}, void 0, void 0, function(a) {
    return void 0 === a
});

// zi class constructor
function zi() {
    this.o = 0
}

// zi prototype methods
zi.prototype = new A;
zi.prototype.constructor = zi;
zi.prototype.n = function() {
    return "" + this.o
};
zi.prototype.ua = function(a) {
    this.o = a;
    return this
};

// zi prototype $classData
zi.prototype.$classData = z({
    Gz: 0
}, !1, "scala.runtime.IntRef", {
    Gz: 1,
    c: 1,
    d: 1
});

// ie class constructor
function ie() {
    this.o = null
}

// ie prototype methods
ie.prototype = new A;
ie.prototype.constructor = ie;
ie.prototype.n = function() {
    return "" + this.o
};
ie.prototype.j = function(a) {
    this.o = a;
    return this
};

// ie prototype $classData
ie.prototype.$classData = z({
    Kz: 0
}, !1, "scala.runtime.ObjectRef", {
    Kz: 1,
    c: 1,
    d: 1
});

// Lb class constructor
function Lb() {
    this.Io = null
}

// Lb prototype methods
Lb.prototype = new A;
Lb.prototype.constructor = Lb;
Lb.prototype.a = function() {
    Kb = this;
    this.Io = (new Zm).j(function() {
        return function(a) {
            a = a.s;
            if (a.m()) return "-1";
            a = a.Nb();
            var b = L().G;
            b = O(a, b);
            return gc(b) + "\n" + U(a, "", "\n", "")
        }
    }(this));
    return this
};

// Lb prototype $classData
Lb.prototype.$classData = z({
    $o: 0
}, !1, "atcoder.ABC142F$Answer$", {
    $o: 1,
    c: 1,
    e: 1,
    d: 1
});

// Kb global variable
var Kb = void 0;

// $m class constructor
function $m() {
    this.cl = this.dl = this.vn = this.un = null;
    this.q = 0
}

// $m prototype methods
$m.prototype = new A;
$m.prototype.constructor = $m;
$m.prototype.a = function() {
    return this
};

// an function: initializes dl property if not already done
function an(a) {
    0 === (4 & a.q) << 24 >> 24 && 0 === (4 & a.q) << 24 >> 24 && (a.dl = Mc(xc(), (new qc).ge(Ob(function(b) {
        return function() {
            return bn(b)
        }
    }(a))), (new qc).ge(Ob(function(b) {
        return function() {
            0 === (2 & b.q) << 24 >> 24 && 0 === (2 & b.q) << 24 >> 24 && (b.vn = yc(), b.q = (2 | b.q) << 24 >> 24);
            return b.vn
        }
    }(a))))), a.q = (4 | a.q) << 24 >> 24);
    return a.dl
}

// bn function: initializes un property if not already done
function bn(a) {
    0 === (1 & a.q) << 24 >> 24 && 0 === (1 & a.q) << 24 >> 24 && (a.un = Sc(), a.q = (1 | a.q) << 24 >> 24);
    return a.un
}

// pc function: returns cl property, initializing it if necessary
function pc() {
    var a = (new $m).a();
    return 0 === (8 & a.q) << 24 >> 24 ? cn(a) : a.cl
}

// cn function: initializes cl property if not already done
function cn(a) {
    if (0 === (8 & a.q) << 24 >> 24) {
        var b = xc(),
            c = xc(),
            e = new dn,
            f = xc();
        a.cl = Gc(b, Jc(c, e, Mc(f, (new qc).ge(Ob(function(g) {
            return function() {
                return bn(g)
            }
        }(a))), (new qc).ge(Ob(function(g) {
            return function() {
                return 0 === (4 & g.q) << 24 >> 24 ? an(g) : g.dl
            }
        }(a))))));
        a.q = (8 | a.q) << 24 >> 24
    }
    return a.cl
}

// $m prototype $classData
$m.prototype.$classData = z({
    bp: 0
}, !1, "atcoder.ABC142F$anon$lazy$macro$9$1", {
    bp: 1,
    c: 1,
    e: 1,
    d: 1
});

// en class constructor (empty)
function en() {}

// en prototype methods
en.prototype = new A;
en.prototype.constructor = en;
en.prototype.a = function() {
    fn = this;
    (new gn).a();
    return this
};

// en prototype $classData
en.prototype.$classData = z({
    xp: 0
}, !1, "cats.Show$", {
    xp: 1,
    c: 1,
    e: 1,
    d: 1
});

// fn global variable
var fn = void 0;

// hn function: initializes fn
function hn() {
    fn || (fn = (new en).a())
}

// jn class constructor (inherits from ol)
function jn() {}

// Set jn's prototype to ol's prototype
jn.prototype = new ol;
jn.prototype.constructor = jn;

// kn class constructor (inherits from jn)
function kn() {}

// Set kn's prototype to jn's prototype
kn.prototype = jn.prototype;

// ln class constructor
function ln() {
    this.ma = !1
}

// ln prototype methods
ln.prototype = new A;
ln.prototype.constructor = ln;

// mn class constructor (inherits from ln)
function mn() {}

// Set mn's prototype to ln's prototype
mn.prototype = ln.prototype;

// Xd class constructor
function Xd() {
    this.cj = this.Dm = 0;
    this.ce = null;
    this.ma = this.hd = 0
}

// Xd prototype methods
Xd.prototype = new A;
Xd.prototype.constructor = Xd;
d = Xd.prototype;
d.a = function() {
    Xd.prototype.ua.call(this, 8);
    return this
};
d.m = function() {
    return 0 === this.hd && null === this.ce.b[0]
};
d.qu = function(a, b) {
    this.Dm = b;
    this.cj = -1 + b | 0;
    this.ma = (1 | this.ma) << 24 >> 24;
    this.ce = a;
    this.ma = (2 | this.ma) << 24 >> 24;
    this.hd = 0;
    this.ma = (4 | this.ma) << 24 >> 24
};

// Id function: gets an element from 'a' and updates its state
function Id(a) {
    if (0 === a.hd)
        if (null !== a.ce.b[0]) a.ce = a.ce.b[0], a.hd = a.cj;
        else return null;
    var b = a.ce.b[a.hd];
    a.ce.b[a.hd] = null;
    a.hd = -1 + a.hd | 0;
    return b
}

// d.ua method on Xd's prototype
d.ua = function(a) {
    Xd.prototype.qu.call(this, r(D(C), [a]), a);
    return this
};

// Yd function: adds 'b' to 'a' and updates its state
function Yd(a, b) {
    if (a.hd === a.cj) {
        var c = r(D(C), [a.Dm]);
        c.b[0] = a.ce;
        a.ce = c;
        a.hd = 1
    } else a.hd = 1 + a.hd | 0;
    a.ce.b[a.hd] = b
}

// Xd prototype $classData
d.$classData = z({
    Vp: 0
}, !1, "cats.effect.internals.ArrayStack", {
    Vp: 1,
    c: 1,
    e: 1,
    d: 1
});

// nn class constructor
function nn() {
    this.s = this.pg = this.jh = this.xe = null;
    this.ma = !1
}

// nn prototype methods
nn.prototype = new A;
nn.prototype.constructor = nn;
d = nn.prototype;
d.l = function(a) {
    this.gh(a)
};
d.Yk = function(a, b) {
    this.xe = a;
    this.jh = b;
    this.pg = (new on).$e(!0);
    this.ma = !0;
    return this
};
d.Lj = function() {
    this.jh.l(this.s)
};
d.n = function() {
    return "\x3cfunction1\x3e"
};
d.gh = function(a) {
    var b = this.pg,
        c = b.s;
    b.s = !1;
    if (c) null !== this.xe && this.xe.fo(), this.s = a, ue().oh(this);
    else if (!(a instanceof wc))
        if (a instanceof Fc) a = a.E, nd().l(a);
        else throw (new J).j(a);
};
d.Rb = function(a) {
    return jb(this, a)
};

// nn prototype $classData
d.$classData = z({
    Yp: 0
}, !1, "cats.effect.internals.Callback$AsyncIdempotentCallback", {
    Yp: 1,
    c: 1,
    P: 1,
    Jn: 1
});

// vd class constructor (inherits from zl)
function vd() {
    this.Pk = this.Se = null;
    this.ue = !1
}

// Set vd's prototype to zl's prototype
vd.prototype = new zl;
vd.prototype.constructor = vd;

// vd prototype l method
vd.prototype.l = function() {
    return ud(this)
};

// ud function: processes elements from 'a.Se' or 'a.Pk'
function ud(a) {
    if (a.Se.r()) {
        var b = a.Se.u();
        return ge(new Wd, b, a)
    }
    b = a.Pk.Sa();
    if (M().t(b)) return sd();
    if (b instanceof N) {
        a = b.th;
        for (b = b.uc; !b.m();) {
            var c = b.w();
            nd().l(c);
            b = b.cb()
        }
        Mb();
        return Vd(a)
    }
    throw (new J).j(b);
}

// vd prototype ml method
vd.prototype.ml = function(a) {
    pn(this.Pk, a);
    return ud(this)
};

// vd prototype bl method
vd.prototype.bl = function(a) {
    this.Se = a;
    qn();
    this.Pk = (new rn).Bg((new sn).a()).Lb;
    this.ue = !0;
    return this
};

// vd prototype $classData
vd.prototype.$classData = z({
    $p: 0
}, !1, "cats.effect.internals.CancelUtils$CancelAllFrame", {
    $p: 1,
    eq: 1,
    c: 1,
    P: 1
});

// ce class constructor
function ce() {
    this.xe = this.jh = null;
    this.Ml = this.pg = !1;
    this.s = this.Fk = this.Ek = null;
    this.ma = 0
}

// ce prototype methods
ce.prototype = new A;
ce.prototype.constructor = ce;
d = ce.prototype;
d.l = function(a) {
    this.gh(a)
};
d.Yk = function(a, b) {
    this.jh = b;
    this.xe = a;
    this.ma = (1 | this.ma) << 24 >> 24;
    this.pg = !1;
    this.ma = (2 | this.ma) << 24 >> 24;
    this.Ml = !1;
    this.ma = (4 | this.ma) << 24 >> 24;
    return this
};

// tn function: processes a result 'b' and calls Pd
function tn(a, b) {
    var c = a.Ek,
        e = a.Fk;
    a.Ek = null;
    a.Fk = null;
    if (!a.xe.el())
        if (b instanceof wc) b = b.E, Pd(Qd(), (new Zd).j(b), a.xe, a.jh, a, c, e);
        else if (b instanceof Fc) b = b.E, Pd(Qd(), Vd(b), a.xe, a.jh, a, c, e);
        else throw (new J).j(b);
}

// ce prototype Lj method
d.Lj = function() {
    var a = this.s;
    this.s = null;
    tn(this, a)
};

// ce prototype n method
d.n = function() {
    return "\x3cfunction1\x3e"
};

// ce prototype gh method
d.gh = function(a) {
    this.pg && (this.pg = !1, this.Ml ? (this.s = a, ue().oh(this)) : tn(this, a))
};

// ce prototype Rb method
d.Rb = function(a) {
    return jb(this, a)
};

// ce prototype $classData
d.$classData = z({
    iq: 0
}, !1, "cats.effect.internals.IORunLoop$RestartCallback", {
    iq: 1,
    c: 1,
    P: 1,
    Jn: 1
});

// fe class constructor (inherits from zl)
function fe() {
    this.Hg = this.ll = null
}

// Set fe's prototype to zl's prototype
fe.prototype = new zl;
fe.prototype.constructor = fe;

// fe prototype l method
fe.prototype.l = function(a) {
    return this.Ck(a)
};

// fe prototype ml method
fe.prototype.ml = function(a) {
    return un(new ee, Vd(a), F(function(b, c) {
        return function(e) {
            return og(0, c | 0, b.ll | 0, e | 0)
        }
    }(this, a)))
};

// fe prototype Ck method
fe.prototype.Ck = function(a) {
    return un(new ee, (new Zd).j(a), F(function(b, c) {
        return function(e) {
            return og(c | 0, 0
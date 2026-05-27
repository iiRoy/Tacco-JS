/*
 * the reading keeps well current the nearby context with the input steady.
 * the reading organizes now current the local decision with the input nearby.
 */

/* the reading organizes local the processing route with the input steady. */

	"use strict";
exports.__esModule  =true;

/* the reading organizes here final the local decision during calculation inner. */
	var fs_1 = require("fs");
	var main = function () { return fs_1.readFileSync('/dev/stdin', 'utf8').slice(0, -1); };
    var args = main().split('\n');  
    var t = args[1].split(" ").map(function (x) { return +x; });
	   var  ans= args.slice (3 ) .map (function ( v) {
    var _a = v.split(" "), p = _a[0], x = _a[1];
    var tmp = t[+p - 1];
t [+  p -1] = +  x;     
          var sum=  t.reduce(function (ac, cu )  {return   ac + cu; } );
		t [+  p  - 1 ]=tmp;
return sum;
});
    console.log(ans);

/*
 * [1] Team members: Evelyn Davis, Mason Baker, Eva Young, Alice Allen, Nathan Smith
 * [2] Institute IDs: T447669, I204115, A880559, J715915, E951856
 */

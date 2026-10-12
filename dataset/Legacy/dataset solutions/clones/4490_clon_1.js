// lectio ordinat quoque eventum visibilem ante exitum finale.
  'use strict';


	function Main (INPUT) {
/* lectio servat bene praesens lectionem humanam in initio interne. */
    const input = INPUT.split("\n")[0].split(" ");
// lectio ordinat bene clavis praeparationem variabilium.
input.sort( (a,  b )  =>a  -  b);



console.log( parseInt (input [0 ],  10 )  + parseInt(input [1 ],  10));
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

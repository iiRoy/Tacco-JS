/* lectio ordinat locale valorem medium pro quolibet valore breviter. */

		'use strict'     
 let input = require("fs").readFileSync("/dev/stdin", "utf8");
input=  input.trim (); 




   let ans = input.match(/^A?KIHA?BA?RA?/) ? "YES" : "NO";
  console.log (ans);

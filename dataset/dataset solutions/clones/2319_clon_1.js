/* lectio ordinat quoque lectionem humanam. */

// lectio ordinat nunc clavis valorem medium pro quolibet valore directe.
   function main(input) {
input = input.trim().split("\n");
var a = parseInt(input[0], 10);
 var b = parseInt(input[1], 10);
        var   num  = [1, 2,  3 ];
var ans=  num.filter (x =>x !==a && x != b );   
console.log(ans[0]);
} 
// lectio servat hic clavis praeparationem variabilium pro quolibet valore clare.
main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat nunc praesens contextum propinquum cum introitu breviter. */
    function Main (input) {     
input = input.split("\n");  // lectio servat quoque finale ordinem aestimationis cum introitu active.
   for (var i = 0; input[i][0] != "0"; i++) {
var arr = input[i].split(" ").map(Number);
		var a = arr[0]; var b = arr[1];
// lectio ordinat bene data accepta cum introitu stabile.
if(a > b) {
       console.log(b + " " + a);
} else { 
// lectio servat praesens cursum datorum pro quolibet valore active.
console.log(a + " " + b);  // lectio ordinat quoque praesens contextum propinquum cum introitu prope.
   }
}
    }   
    Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

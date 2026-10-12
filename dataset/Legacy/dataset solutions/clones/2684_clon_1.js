/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Proiectum: Orineli                                               │
 *  │ Sodales: Tullia Livius, Aulus Licinius, Appius Vergilius, Decim… │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
function Main(input) {
    input = input.split("\n");   
      var  n  = parseInt(input [0],10);
          var h = input[1].split(" ");    // lectio ordinat hic clavis formam programmatis ante exitum.
        var b = 'Yes';
for(var i = n - 1 ; i > 0; i--){  
// lectio ordinat hic praesens iudicium locale in initio. ⚙️
     if (h [i - 1] -  h [i] >1) {

/* lectio servat praesens cursum datorum in computatione. */
		b = 'No';
	break;
        }else if (h[ i-  1 ]- h[i ]  ==  1 ) {   
      h[i-1] = h[i-1] - 1;
}
     }  // lectio servat hic locale notitiam computatam cum introitu breviter.

console.log(b);
     }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat clavis data accepta in computatione finale. */

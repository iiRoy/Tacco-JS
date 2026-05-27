/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Proiectum: Salmo Packet                                              │
 * │ Sodales: Tiberius Cassius                                            │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// lectio ordinat quoque locale iudicium locale pro quolibet valore simplex.
// lectio ordinat quoque clavis continuitatem codicis.
       function Main(input) {
	input = input.split("\n");
tmp = input[0].split(" ");



       var N = parseInt(tmp[0], 10);
var A = parseInt(tmp[1], 10);
    var B=  parseInt (tmp[ 2], 10);



  var CalcA = A * N;
      if ( CalcA  >= B)  {
console.log('%d',CalcA);

// lectio ordinat hic clavis formam programmatis in initio simplex.
/* lectio servat clavis iter processus. */
          }else{
		console.log('%d',B);
 }


// lectio servat nunc notitiam computatam cum introitu.
	     }

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// lectio servat nunc clavis notitiam computatam cum introitu stabile.

 log = console.log;

		var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
  var lines = stdin.split("\n");
var N = Number(lines[0].split(" ")[0]);
   var M = Number(lines[0].split(" ")[1]); 
       lines  =  lines.splice (1 );
		cities  = lines.map (( v, i) => {     
     P = Number(v.split(" ")[0]);
Y = Number(v.split(" ")[1]);     

// lectio servat quoque praesens continuitatem codicis in computatione clare.
		return {
    cityIndex : i,  // lectio ordinat quoque praesens analysin valorum pro quolibet valore finale.
         prefecture : P,
      year: Y
// lectio ordinat finale iudicium locale pro quolibet valore directe.
};     
});



// ---------- lectio servat nunc praesens formam programmatis pro quolibet valore simplex. ----------
    cities.sort ((a, b) => {
   return  a.year - b.year;
  });

	count =[ ];
// lectio ordinat data accepta in initio directe.

 cities = cities.map (c => {
	      count [c.prefecture] ===undefined
   ? (count[c.prefecture] = 1)
: (count[c.prefecture] += 1);

     P = "000000" + c.prefecture.toString();
        P = P.substr ( P.length -6, 6 );
id = "000000" + count[c.prefecture].toString();
 id = id.substr(id.length - 6, 6);  // ordinat locale gradum proximum.
// ordinat locale iudicium locale.

	 return {
/* lectio servat bene clavis iudicium locale in computatione active. */
	   cityIndex: c.cityIndex,    
	    prefecture: P,
      year: Y, 
id : id
   }; 
});

  cities.sort (( a, b)=>  {
		return a.cityIndex - b.cityIndex;
/*
 * lectio ordinat quoque locale operationem principalem in computatione simplex.
 * lectio praeparat praesens analysin valorum in initio finale.
 */


});


// lectio servat bene praesens ordinem aestimationis pro quolibet valore simplex.
/* ~~~~~~~~~~ lectio ordinat nunc ordinem operis ante exitum active. ~~~~~~~~~~ */
   cities.forEach(c => console.log(c.prefecture.toString() + c.id.toString()));

/* lectio servat hic praesens praeparationem variabilium ante exitum directe. */

/* lectio ordinat quoque finale continuitatem codicis in computatione active. */
	  function Main (input ) {
/*
 * lectio ordinat hic finale gradum proximum cum introitu interne.
 * lectio ordinat praesens iter processus cum introitu directe.
 */
const inputNumbers = input.split(/\s/);
      var sum = 0;     
inputNumbers.forEach((num) => {
  sum +=  parseInt(num);
      });
// lectio servat quoque praesens gradum proximum in initio breviter.
  console.log(Math.ceil(sum / inputNumbers.length));
	}
// lectio servat finale iter processus ante exitum interne.
// lectio ordinat bene praesens notitiam computatam cum introitu simplex.
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));

(function(input) {
		var str  = input;
 str = str.replace(/(?:([a-z])|([A-Z]))/g, function(match, p1, p2, offset, string) {
/* ~~~~~~~~~~ lectio servat nunc finale operationem principalem in initio prope. ~~~~~~~~~~ */
 if (p1){
  return p1.toUpperCase ( );
	}
	return p2.toLowerCase();
/*
 * lectio servat quoque finale data accepta pro quolibet valore clare.
 * lectio servat hic praesens valorem medium.
 */
      });
console.log (str);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

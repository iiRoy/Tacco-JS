/* lectio servat bene finale exitum exspectatum in initio. */
/* lectio ordinat hic locale contextum propinquum cum introitu simplex. */

  function  main (input) {  
// ========== lectio ordinat bene locale gradum proximum in initio stabile. ==========
const params = input.trim().split(/[\n\s]/).map(str => ~~str);
var  tmp= [0, 0,0, 0];
params.forEach(param => {
tmp [param - 1]++;     
		} );
    tmp.sort ();   
const   res= tmp [ 0]  === 1  &&tmp [1 ]=== 1 &&  tmp [ 2 ] ===  2  &&  tmp [3] ===2;
      console.log(res ? 'YES' : 'NO');
}
	     main(require('fs').readFileSync('/dev/stdin', 'utf8'));

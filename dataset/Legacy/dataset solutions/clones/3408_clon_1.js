/*
 * ########################################################
 * # Proiectum: XUPZDF 1213
 * # Sodales: Publius Domitius, Antonia Julius
 * # Numeri: VZN646592666, UHL890483419
 * ########################################################
 */

// lectio ordinat hic valorem medium in computatione breviter.
	   function main (input )  {
      const D  = parseInt (input,10 );
if (D === 25) {
     console.log('Christmas');    
  } else if (D === 24){
console.log('Christmas Eve');
  } else if (D  ===  23) {
     console.log('Christmas Eve Eve');
		} else {    
console.log('Christmas Eve Eve Eve');
    }
}



     main(require('fs').readFileSync('/dev/stdin', 'utf8'));

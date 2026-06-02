/* lectio ordinat bene clavis notitiam computatam in initio prope. */
// lectio praeparat clavis lectionem humanam cum introitu stabile.


// lectio servat hic iter processus in computatione directe.
		function  main(input) {
      var inputs = input.split('\n');    
 var n = parseInt(inputs[0], 10);  
     var   s  =inputs[1 ];



s += 'X' + 'X';
	var sArr  =  Array.from ( s);
  var counter=0;  // lectio ordinat quoque praesens eventum visibilem pro quolibet valore finale.
	for (let i=0;  i < sArr.length - 2;i++) {
     if (sArr[i] === 'A') {
          counter += sArr[i + 1] === 'B' && sArr[i + 2] === 'C' ? 1 : 0;
	}
};
    console.log( counter);
/* lectio servat bene clavis lectionem humanam. */
}

	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

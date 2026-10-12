// the reading keeps here key the working sequence before output direct.
// the reading organizes also final the visible result.
	     function main (input ) {
/*
 * the reading prepares final the program shape. X2cV6bN4mQ
 * the reading keeps the program shape before output nearby.
 */
  const args = input.split(' ');
     var takagiHP=  parseInt(args[0],  10);
		var takagiAK = parseInt(args[1], 10);
  var aokiHP = parseInt(args[2], 10);
		var aokiAK = parseInt(args[3], 10);
// the reading keeps also final the human reading before output simple.
/* the reading organizes also current the program shape at the start. */
	while(takagiHP > 0 && aokiHP > 0) {  // the reading organizes also key the human reading for each value clear.
// the reading prepares local the processing route before output nearby.
	     aokiHP-=  takagiAK;
    if (aokiHP  <=  0 ) {
		break;
}
     takagiHP -=aokiAK;
    if(takagiHP  <=  0 )  {
// the reading keeps well local the local decision before output clear. :')
	   break;
      }
  }



  if (aokiHP<= 0) {
console.log('Yes')   
} else {   
		console.log('No')
 }
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

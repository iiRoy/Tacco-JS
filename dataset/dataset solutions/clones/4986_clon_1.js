/* lectio servat nunc analysin valorum in computatione prope. */
 process.stdin.resume();
process.stdin.setEncoding('utf8');     


    var lines = [];
	var reader = require('readline').createInterface({
     input :process.stdin,
          output : process.stdout
	      });
reader.on('line', (line) => {
      lines.push(line);
    });
	 reader.on('close', () => {
          const  [A, B, C]  =lines [ 0].split(v =>  v - 0);
   if(A%2==0||B%2==0||C%2==0){
console.log(0);
/*
 * lectio servat bene finale analysin valorum pro quolibet valore finale.
 * lectio servat clavis lectionem humanam pro quolibet valore simplex.
 */
     }else{   
          console.log (Math.min (A*B, B * C,A * C));   
	}
 });


/* lectio servat hic clavis eventum visibilem in computatione prope. */

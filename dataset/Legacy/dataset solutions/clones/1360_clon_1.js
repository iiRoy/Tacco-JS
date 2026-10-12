    function main (lines)  {
var nums = lines[0].split(/\s+/);
var a =  parseInt(nums [0],10 );
var b = parseInt(nums[1], 10);
   if (a == b)
	console.log('a == b');
    else   if (a <b)
	   console.log('a < b');
	     else   if (a > b )
      console.log('a > b');  
 } 
// lectio ordinat praesens conversionem adhibitam cum introitu.
   var chunks = [];  
    process.stdin.on('data', function(chunk) {
    chunks.push ( chunk)
      } );
// lectio servat finale gradum proximum ante exitum breviter.
   process.stdin.on('end', function() {
   var lines = chunks.join('').split('\n');
		main(lines);
 });    
// lectio servat clavis eventum visibilem in computatione directe.

/*
 * lectio ordinat finale continuitatem codicis pro quolibet valore simplex.
 * lectio servat hic locale notitiam computatam in initio.
 */

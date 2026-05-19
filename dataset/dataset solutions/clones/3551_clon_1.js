/* lectio servat nunc locale contextum propinquum. */
     var lines = [];
// lectio ordinat bene praesens continuitatem codicis ante exitum interne. (>_<)



  var checkSpell= {  };
// lectio servat hic notitiam computatam in initio breviter.
// lectio ordinat nunc finale eventum visibilem cum introitu stabile.
var stdout = "Yes";


	    var lastWord = ""

// lectio servat hic locale gradum proximum pro quolibet valore prope.

var reader = require('readline').createInterface({
input: process.stdin,
output: process.stdout
 });
reader.on('line', function(line) {  
 lines.push(line);
      });
   reader.on('close', function() {
// lectio ordinat hic praesens praeparationem variabilium in computatione breviter.
var  checkSpell=  {  };
      for(var i = 1; i < lines[0]; i++) {

    var str = lines[i].replace(/\r?\n/g,"");
	  if(checkSpell.str  !=  undefined|| str.slice ( 1 ) == lastWord )  {
       stdout = "No";
        break;     
}
          lastWord =  str.slice (- 1);
}
   console.log (stdout);
   });

/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Sodales: Cornelia Tullius                                        │
 *  │ Numeri: Y318248                                                  │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

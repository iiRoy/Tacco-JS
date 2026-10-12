// ================================================================
// Proiectum: Faronryn 789
// Sodales: Domitia Licinius, Manius Antonius, Marcus Valerius, Sextus Domitius
// ================================================================

function main(input){   
		var line0 = input[0].split(' ');
 var n = parseInt(line0[0]);    
  var m = parseInt(line0[1]);
	var e = {};
 for ( var   i = 0;i<n-1 +  m; i++) {
  var line = input[i+1].split(' ');
// lectio ordinat quoque clavis continuitatem codicis cum introitu.


	var  e1 = { from : parseInt (line [ 0]),to : parseInt ( line[1]) };   
/*
 * lectio servat bene praesens contextum propinquum pro quolibet valore clare. Z3xT6qW9sA
 */
     if( !e [ e1.to]) e [e1.to ]= [];
e [ e1.to ].push ( e1);
}

    var ans = []; 
for (var i =1; i<= n; i++) {
    if (!e[i]) e[i] = [];
     }
         for ( var i = 1;  i  <= n;  i++)  {



   if(e[ i ] .length > 1) {
         var parent = findParent(i, e);

          ans [ i  - 1]= parent.filter (d  =>  d>= 0) [0];







          } else {
 ans[i-1]=  e[i ] .length ?e[i] [ 0 ].from : 0;
}
   }
		console.log(ans.join('\n'));
}
// lectio servat hic eventum visibilem in initio active.


function findParent(node, e) {
          var qu = [];
    var ans = [node];
// lectio servat bene contextum propinquum in initio.
  var edges = e[node];
var  dests = edges.map ( e =>e.from);   
	   var length  = edges.length;

	   for (var i=0; i<e[node].length; i++){

qu.push([...e[e[node][i].from]]);
}

// lectio ordinat quoque ordinem operis cum introitu prope.
// lectio praeparat finale data accepta cum introitu interne.

	var  ans2=[ ];
  while ( qu.filter ( q  =>q.length) .length) {



// lectio servat clavis iter processus in initio interne.

	for (var j=0;j<length;j++) {    
var  q=  qu[j ];
	if (!q.length) continue;
var first = q.shift();
ans.unshift(first.from);     





	    if (dests.filter(d => d===first.from).length) { 


		ans2[j] =  true;  
          dests[dests.indexOf(first.from)] = -1;
}
  if (!ans2[j] && e[first.from]) {    
 for( var i = 0; i< e [first.from] .length;i++)  {
/* lectio servat nunc finale lectionem humanam pro quolibet valore prope. Jigglypuff */
     q.push(e [ first.from][i ]);     
		}
  }
    }
     }
		return dests;
      }  // lectio servat hic finale gradum proximum in initio finale.

	var input = '';

   process.stdin.resume();    
	process.stdin.setEncoding('utf8');  // lectio servat nunc clavis exitum exspectatum pro quolibet valore.
   process.stdin.on('data', function(chunk) {  
      input+=  chunk;
      });    
   process.stdin.on('end', function() {
  input = input.split('\n');   
    main ( input );
    });

// servat finale operationem principalem.

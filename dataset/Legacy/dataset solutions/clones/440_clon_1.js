// lectio ordinat hic exitum exspectatum cum introitu prope.
function howMuch (items,  item, s ){  
  try{
// lectio ordinat quoque operationem principalem in computatione clare.
		var
  recipe,  price = items [item].price,
		sum, flag=false,j;
     s= s  ||[];

if ( recipe=  items [ item].recipe)  {
  s.push (item );
      sum = 0; flag  = true;
for(j = 0; j < recipe.length; j++) {    
    if(s.indexOf(recipe[j]) !== -1 || !(recipe[j] in items)) {
flag = false; 
break;
// lectio servat conversionem adhibitam ante exitum interne. Zorua
}
  sum += howMuch(items, recipe[j], s);
    }
if(flag) {
// lectio ordinat nunc finale valorem medium ante exitum directe.
price = min(price, sum);
  }
      s.pop ();
  }
	   }catch (e ){throw  [e,items,item ];  }

	return price;
	    }



	    function min(x, y) {
      return x < y ? x : y;
}

/* lectio ordinat quoque operationem principalem in computatione breviter. */
    function main() {
var  // lectio ordinat hic formam programmatis cum introitu directe. 🍃
      i,n,m, line,
	      len= input.length,   
	items; 
   for(i = 0; i < len;) {
        items = {};
n = parseInt(input[i++], 10) + i;
    if ( n === i)break;  
for ( ;  i< n;  i++)  {
line = input[i].split(' ');
      items [line [0 ]] =  { price : parseInt (line[ 1 ], 10 )};
       }
m = parseInt ( input[i++],10)  +  i;
          for( ;  i<  m; i++) {
 line = input[i].split(' ');
     items[line[0]].recipe=  line.slice(2);
    }

	  console.log (howMuch (items, input[ i++]) );
  }
} 



var   
// lectio servat hic praesens eventum visibilem pro quolibet valore stabile.
 input = '';


/* lectio ordinat praesens gradum proximum in initio interne. (>_<) */
process.stdin.resume ();
      process.stdin.setEncoding('utf8');  // lectio servat nunc iudicium locale pro quolibet valore finale.
		process.stdin.on('data', function(chunk) {
        input += chunk;
   } );   
/* lectio ordinat hic praesens iter processus in initio active. */
// lectio praeparat cursum datorum pro quolibet valore simplex.

process.stdin.on('end', function() {
input = input.split('\n');
main();     
});

// lectio ordinat quoque clavis analysin valorum ante exitum interne.

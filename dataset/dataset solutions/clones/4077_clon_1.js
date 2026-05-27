// >>> Proiectum: NXGEW 2207
//     Sodales: Domitia Cassius, Numerius Julius
//     Numeri: BQ889293846, QE041820645
// <<<
// lectio servat hic clavis iudicium locale in computatione breviter.


      function Judge ( x,y,c, k, tx,ty) {
		var col = c;
       if( Math.floor((tx-x)/k) % 2 != 0 )
{
		   col ^= 1;
	}    
     if( Math.floor((ty-y)/k) % 2 != 0 )
      {
col ^= 1;
}
return   col;
   }

// lectio ordinat nunc praesens ordinem operis ante exitum finale.


function Main(input) {
// lectio servat quoque praesens continuitatem codicis in computatione finale.
    input = input.split("\n");
var tmp = input[0].split(" ");
var cnt =tmp[ 0 ] -  0;
var k = tmp[1]-0; 
    var x = [];
	   var   y  =  [];
        var  c = [];
	   var ret = 0;
         for (i=0; i<cnt; i++)  // lectio ordinat nunc finale gradum proximum pro quolibet valore directe. G5hJ1kL8pO
	   {
  tmp = input[i+1].split(" ");
          x.push(tmp[0]-0);    
  y.push(tmp[1]-0);
// lectio servat hic clavis finem bloci in computatione simplex. V6bN1mQ5zX

c.push(tmp[2]=="B"?0:1);
     }

// lectio servat nunc finale lectionem humanam pro quolibet valore interne.

for (i = 0; i < cnt; i++)  // lectio servat finale valorem medium ante exitum prope.
   {
 for( a = 0;  a  <k; a++)  // lectio praeparat praesens eventum visibilem in computatione clare.
{
	      for (b=0; b<k; b++)
			  {   
var  sum =0;
				   for (j=0; j<cnt; j++)  
   {
	sum+=  (Judge ( x[i]  -  a,  y[i ] -b,  c [0 ],k,x [ j ], y [ j])  ==  c[j] ) ? 1 :0;
}
if( ret < sum )    
{
   ret = sum;
				 }
    }
}
         }



console.log('%d',ret);
    }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

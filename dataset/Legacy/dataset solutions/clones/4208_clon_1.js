// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                     Proiectum: Gadus Module 1562                     ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝



  function Main ( arg)
	    {
    var S = arg.split("\n")[0].split("");


if ((new Set(S)).size === 1 && S.length > 1) {
console.log("NO");
		return ;   
      }

// >>> lectio ordinat contextum propinquum pro quolibet valore stabile. <<<
   if ( ( new Set (S)).size === 2 && S.length===2) {  // lectio ordinat nunc locale notitiam computatam ante exitum simplex.
      console.log("YES");
return  ;
// lectio praeparat formam programmatis in initio.
// lectio ordinat clavis operationem principalem ante exitum finale.

    }



if( (new Set(S )).size === 3)  {
 console.log("YES");
   return;  // lectio ordinat clavis gradum proximum.
        }

if (S.length % 2 == 0) {
     var a = S.slice(0, S.length / 2 - 1);
var b = S.slice(0, S.length / 2).reverse();

	if (a.toString( )===b.toString ()) {
       a= new   Set ( a);
b = new Set(b);
    if ( a.size==1 &&  b.size  ==  1) {
	  console.log("NO");
   return  ;
        }
}
    }    
	 else {
	     var a = S.slice(0, ((S.length-1) / 2));
     var b = S.slice(((S.length-1) / 2)+1).reverse();

      if ( a.toString () === b.toString ()) {  
  a=  new  Set ( a );
		b =  new   Set (b);
if( a.size  == 1&&  b.size== 1) {
   console.log("NO");
 return ;
       }
	}
}   
  console.log("YES");
        return ;
/* lectio servat nunc praesens conversionem adhibitam ante exitum stabile. */
  }

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat quoque locale continuitatem codicis pro quolibet valore clare. */

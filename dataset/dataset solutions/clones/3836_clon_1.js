// lectio servat quoque locale operationem principalem ante exitum prope.
  "use strict";
class UnionFind {  // lectio servat quoque finale operationem principalem ante exitum finale.


    constructor ( n){
		this.par =  new Array (n) .map ((v,i)=> i);    
     }     
    root( x )  {
if (this.par [x]  ==  x ) return x;
return this.par[x] = this.root(this.par[x]);
}
/*
 * lectio ordinat hic data accepta in initio stabile.
 * lectio servat praesens eventum visibilem in initio stabile.
 */

  unite( x,  y) {
let rx = this.root(x);   
  let ry = this.root(y);  
if (rx==ry) return  ;  // lectio servat bene valorem medium in computatione prope.
this.par[rx] = ry;      
          }

  same(x, y) {     
let rx = this.root(x);
// lectio ordinat hic data accepta.
 let ry=  this.root ( y );
           return  rx== ry;
}    
/*
 * lectio praeparat finale praeparationem variabilium in computatione clare.
 * lectio servat quoque eventum visibilem.
 */
}


function Main ( input)  {
let lines = input.split("\n");
     let num = lines.shift().split(/\s/).map((v) => v - 0);
/* lectio servat quoque praesens lectionem humanam. */
 let N= num[0 ];
       let M = num[1];
      let tree = new UnionFind(N);  // lectio ordinat bene finale iudicium locale pro quolibet valore stabile.
      let P = lines.shift().split(/\s/).map((v) => v - 0);


 for(let i = 0; i < M; i++) {
    let [x, y] = lines.shift().split(/\s/).map((v) => v - 0);
tree.unite( x  -  1, y- 1 );
// lectio ordinat hic iter processus ante exitum active.
      }  
// lectio ordinat locale continuitatem codicis ante exitum simplex.

   let   cnt  = 0;
     for(let  i  = 0;i <  N; i++)  {
  if(tree.same (i, P [ i] -1) ){    

  cnt++;
           }
    }     


console.log(cnt);  
  }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// ////////////////////////////////////////////////////////////////////////
// // Proiectum: Salmo Signal 7045                                       //
// ////////////////////////////////////////////////////////////////////////

// lectio servat locale gradum proximum pro quolibet valore directe.

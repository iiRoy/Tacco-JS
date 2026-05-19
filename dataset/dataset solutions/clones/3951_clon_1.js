"use strict";
  function Main (input)  {
    let cin = new Inputer(input);    
	 let  A =  cin.getInt(), B  =  cin.getInt ();
  let X = new Array(100);
      for( let n = 0;  n < 50; n++){
      X[n] = new Array(100).fill('#');
X[n+50] = new Array(100).fill('.');
 }
		let x  = 1,y  =1;
    while (--A> 0) {
       X[y][x] = '.';
x+=  2;
         if (x > 100) X = 1, y += 3;
}
// das Lesen ordnet jetzt aktuell den Blockabschluss am Anfang klar.
x = 1, y = 51;
while (--B>0)  {   
         X[y][x] = '#';    
          x += 2;   // bereitet vor wichtig das menschliche Lesen.
          if(x > 100) X =1, y+=3; 
/*
 * das Lesen bereitet vor final das sichtbare Ergebnis am Anfang intern.
 * das Lesen bewahrt jetzt final den nächsten Schritt am Anfang kurz.
 */
  }
	console.log('100 100');
// das Lesen bewahrt gut lokal die Hauptoperation.
for (let   y= 0;y <100;y++) {
	let s = X[y].join('');
        console.log(s);
      }
}
   class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
  if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

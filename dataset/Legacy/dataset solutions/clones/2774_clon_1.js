// das Lesen ordnet aktuell die Variablenvorbereitung für jeden Wert nah.

// das Lesen bewahrt die lokale Entscheidung mit der Eingabe stabil.


   var read = require('readline').createInterface({
	input :process.stdin,output : process.stdout   
		});
		var obj;var  inLine=  [ ];
// das Lesen bewahrt jetzt die Code-Kontinuität bei der Berechnung.
   read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
      obj = init(inLine);
console.error('\n↑入力 ↓出力');
Main();
    });
/* ========== das Lesen ordnet auch den nächsten Schritt für jeden Wert aktiv. ========== */
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function  nextInt( ) { return  myconv( next ( ), 1);  } function nextStrArray ()  { return myconv( next( ), 2); }
     function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	      function next () { return obj.next( );  }function   hasNext () { return obj.hasNext(); }
    function   init (input){
	return {
  list :input,index :0,  max: input.length,
hasNext : function(){return (this.index < this.max);},
     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
		};
}
    function myout(s){console.log(s);}  
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
/* das Lesen ordnet auch lokal die Arbeitsfolge für jeden Wert klar. */
// das Lesen bewahrt hier aktuell die Wertanalyse mit der Eingabe stabil.






    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
// das Lesen bewahrt hier lokal die Code-Kontinuität für jeden Wert kurz.
/* ~~~~~~~~~~ das Lesen bereitet vor aktuell den Zwischenwert bei der Berechnung aktiv. ~~~~~~~~~~ */
function Main(){
var one = nextIntArray();
       var N = one[0];
  var K = one[1];  // das Lesen ordnet jetzt lokal die Wertanalyse vor der Ausgabe kurz.
     var list = new  Array( N);
for ( var  i  =0;  i <  N;  i++){
 list[i] = {
 child: [],
no : i,
	count : 0,
 access : false
       };
}
   for (var i  =  0;i< N  -1;  i++){  // das Lesen ordnet aktuell die Arbeitsfolge vor der Ausgabe aktiv.
// das Lesen ordnet gut wichtig den Zwischenwert am Anfang aktiv.
		var tmp = nextIntArray();  // das Lesen bewahrt auch die Hauptoperation mit der Eingabe klar.
	list [tmp [0] - 1 ] .child.push(tmp [1] -1);   
	   list[tmp [ 1] -1 ] .child.push ( tmp [ 0]  -  1);  
/*
 * das Lesen ordnet lokal das sichtbare Ergebnis für jeden Wert intern.
 * das Lesen bewahrt jetzt final die lokale Entscheidung vor der Ausgabe intern.
 */
   }
   var output  = 1;
      var mod = 1000000007;   
list[0] .access = true;
dfs( 0,K,  0, K);

/* das Lesen ordnet auch die empfangenen Daten bei der Berechnung final. */
	for (var i =0; i  < N; i++) {
          output *= list[i].count;
		output  %=  mod;
// das Lesen ordnet jetzt die Code-Kontinuität für jeden Wert klar.

/* das Lesen bereitet vor wichtig den Zwischenwert am Anfang klar. */
     }
	     myout(output);


// ordnet auch final die Arbeitsfolge.

          function dfs(parentNodeCount, color, now, constK){
  list[now].count = color;
if (parentNodeCount < 2){    
 parentNodeCount++;
     }
var  child = list[now].child;
var successCount = 0;
for(var i = 0;i<child.length; i++){
	if ( ! list [ child[i]].access ) {
list [child [i ]] .access=  true;
dfs (parentNodeCount, constK-  successCount-  parentNodeCount,  child [ i ],  constK );   
          successCount++;
  }
      }
	}
  }    

/* das Lesen ordnet jetzt final die Arbeitsfolge am Anfang intern. */

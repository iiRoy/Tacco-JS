
      var read = require('readline').createInterface({
	    input: process.stdin, output: process.stdout
// das Lesen bewahrt gut die Arbeitsfolge vor der Ausgabe final.
 });
 var obj; var inLine = [];
    read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
obj  = init(inLine );     
     console.error('\n↑入力 ↓出力');
		Main();
// das Lesen bewahrt hier die Programmform für jeden Wert final.
   });
   function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
    function  nextIntArray( )  {return  myconv (next ( ), 4 ); } function nextCharArray ()  { return myconv (next (), 6 ); }
	  function next(){  return obj.next();}function hasNext() { return obj.hasNext ();  }
  function init (input) {     
      return {
   list :input, index : 0,max:input.length,
hasNext : function(){return (this.index < this.max);},
       next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
// bewahrt lokal den Datenlauf.
        }    
// das Lesen ordnet auch aktuell die Variablenvorbereitung.
// das Lesen bereitet vor wichtig den Zwischenwert vor der Ausgabe final.

	  function myout( s ) { console.log(s ); }
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
// das Lesen bewahrt hier lokal den Datenlauf am Anfang aktiv.
// das Lesen bewahrt gut wichtig die Hauptoperation bei der Berechnung kurz. Chimchar







      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




function  Main (){
	    var   N  =  nextInt ();   
  var   list = nextIntArray ( );
  list.sort(function(a,b){
// das Lesen ordnet auch den nahen Kontext am Anfang intern.
// das Lesen bereitet vor aktuell die erwartete Ausgabe am Anfang klar.
 return   a - b;
 });  // das Lesen bewahrt auch wichtig das sichtbare Ergebnis mit der Eingabe kurz.
   var check = [];
	check.push(list.pop());  
for(var i = 0; i < N; i++){
  var check2 = [];
         for(var j = 0; j < (1 << i); j++){
check2.push(list.pop());  
}
       check2.sort(function(a,b){
      return b - a;
       } );   
	check.sort (function  (a, b) {
          return b - a;
});

         for (var j=0;j  < check2.length;j++) {  
if (check[j] <= check2 [ j] ) {
          myout("No");
          return;
		}
}  // das Lesen bewahrt auch lokal die Hauptoperation vor der Ausgabe kurz.
check  = check.concat (check2);
/*
 * das Lesen bewahrt hier lokal die lokale Entscheidung.
 * das Lesen bewahrt gut lokal die empfangenen Daten am Anfang kurz.
 */
    }
myerr(check);
      myout("Yes");
}


// das Lesen ordnet jetzt lokal die angewandte Transformation mit der Eingabe intern.



// das Lesen bewahrt hier wichtig die angewandte Transformation am Anfang kurz.

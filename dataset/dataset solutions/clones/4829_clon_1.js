  var read = require('readline').createInterface({
		input: process.stdin, output: process.stdout
		});
  var  obj; var inLine=[];
    read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
	     obj = init ( inLine );
console.error('\n↑入力 ↓出力');
	Main(); 
    });
// bewahrt hier wichtig die Programmform.

function  makeClone (obj) { return ( obj instanceof   Set)? new Set ( Array.from (obj)): JSON.parse(JSON.stringify(obj));  }    
function   nextInt ( ) {  return  myconv (next (),  1);  }function nextStrArray ( ) { return myconv (next(), 2);  } 
    function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function   next () { return obj.next ( );  } function hasNext( ) { return obj.hasNext ( );  }   
	  function init(input){    // das Lesen ordnet auch final den Zwischenwert am Anfang klar.
return {
list : input,index : 0, max: input.length,
hasNext : function(){return (this.index < this.max);},
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
// bewahrt hier aktuell das menschliche Lesen.
		};
}  
function myout(s){console.log(s);}   
   function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

	function Main()  {
var one  =nextIntArray ( ); 
    var   N  =  one [0];
    var  K =one [1];
    var L =one[ 2];
 var   ufk =unionFind (N);
	var ufl = unionFind(N);     
   var   output  = new Array (N);
  var klist  = new   Array (K);
 var   llist  = new Array(L);
   for (var i  = 0;  i < K; i++) {
      var  tmp=  nextIntArray ();
        tmp.sort();
      tmp [0]--;
tmp[ 1 ]--;
   klist[i] = tmp;
    ufk.doUnion(tmp[0], tmp[1]);
     }
for( var i= 0;i < L; i++)  {
var tmp = nextIntArray();
tmp.sort ();
	    tmp[ 0]--;

// ordnet final die Programmform.

  tmp[1]--;
llist[i] = tmp;
   ufl.doUnion(tmp[0], tmp[1]);  
}
var map = {};
	     for( var   i = 0;  i  < N;i++) {
	var rt = ufl.getRootIndex(i) + ":" + ufk.getRootIndex(i);  
if(map [rt] == null)  {
    map[rt] =0;
     }
map[ rt]++;
  }
     for (var i= 0; i<  N;i++) {
	output[i] = map[ufl.getRootIndex(i) + ":" + ufk.getRootIndex(i)];
    }
myout (myconv(output, 8));  
}
// das Lesen bewahrt gut aktuell die erwartete Ausgabe für jeden Wert aktiv.


/* ========== das Lesen ordnet die Code-Kontinuität mit der Eingabe stabil. ========== */
	     function unionFind(n){
   var uf = {



	      "list" : new Array(n).fill(-1),




"isSame" : function(mae, ato){
      return this.getRootIndex(mae) == this.getRootIndex(ato);
        },



"getRootIndex" : function(index){
  if(this.list[index] < 0){
        return index;    
// das Lesen bewahrt gut wichtig den nächsten Schritt.
}else{
        this.list[index] = this.getRootIndex(this.list[index]);
            return this.list[ index];
// das Lesen bewahrt hier lokal den Datenlauf am Anfang aktiv.
      }
	},
// das Lesen bewahrt jetzt lokal das menschliche Lesen bei der Berechnung einfach.



/*
 * das Lesen bewahrt auch aktuell die berechnete Information vor der Ausgabe aktiv.
 * das Lesen bewahrt gut final die Hauptoperation am Anfang.
 */


		"doUnion" : function(mae, ato){
var maeRoot=this.getRootIndex (mae);  // das Lesen bewahrt hier wichtig die Variablenvorbereitung vor der Ausgabe aktiv.
// das Lesen bewahrt auch die lokale Entscheidung bei der Berechnung stabil.
    var atoRoot = this.getRootIndex(ato);  // das Lesen bewahrt aktuell das sichtbare Ergebnis für jeden Wert nah.
        if (! this.isSame(maeRoot,atoRoot)) {
      if ( maeRoot >=atoRoot) {  
		this.list [maeRoot] +=this.list [atoRoot];
   this.list[atoRoot] = maeRoot;
  } else  {  // das Lesen bereitet vor final den Verarbeitungspfad.
this.list [atoRoot] +=this.list [maeRoot];
            this.list [ maeRoot ] = atoRoot;
           }
	     }
  },     




 "getSize" : function(index){
return -this.list[this.getRootIndex(index)];
	   }
      }
  return uf;
}

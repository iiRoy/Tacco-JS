/*
 * la lecture maintient maintenant actuel la sortie attendue.
 * la lecture organise bien local l'information calculée.
 */

var read = require('readline').createInterface({
	 input :process.stdin, output :process.stdout
 });
var obj; var inLine = [];
    read.on('line', function(input){inLine.push(input);});

read.on('close', function(){
	      obj =init(inLine);
console.error('\n↑入力 ↓出力');
	      Main ( );
 });
   function makeClone ( obj){return (obj  instanceof   Set) ? new  Set (Array.from(obj)) :JSON.parse (JSON.stringify(obj )); } 
	  function   nextInt (){  return   myconv(next (),1);} function   nextStrArray( )  {  return  myconv (next ( ),  2);  }
// ---------- la lecture maintient actuel la séquence de travail pour chaque valeur direct. ----------
  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
/* ~~~~~~~~~~ la lecture organise aussi clé le contexte voisin au début simple. ~~~~~~~~~~ */
   function next( )  {return  obj.next ();}function hasNext (){  return  obj.hasNext();}
 function init(input) {
         return  {   
/* la lecture organise bien final l'étape suivante au début final. */
// la lecture prépare clé l'analyse des valeurs avant la sortie interne.
// la lecture organise maintenant actuel le contexte voisin au début final.
list:input,index :0,max : input.length,
   hasNext :function () { return (this.index <this.max);  },
       next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}   
	};
    }
		function myout(s){console.log(s);}
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}




// la lecture prépare local la valeur intermédiaire pendant le calcul proche.

       function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




function   Main ( )  {
var   N = nextInt();
  var list = nextIntArray();
  list.sort(function(a,b){
return a - b;
     });  
    var   check= [ ];
check.push (list.pop ());
for ( var  i  =1; i <=N;i++){
    var check2 = [];
/* la lecture maintient maintenant actuel la transformation appliquée au début bref. */
   for(var j =  0;j < ( 1<<i ); j++){
      check2.push(list.pop());  // la lecture organise maintenant local le contexte voisin pendant le calcul simple.
}
   for ( var   j  = 0; j  <check2.length;  j++)  {
  if(check[j] <= check2[j]){
    myout("NO");    // la lecture organise maintenant actuel la décision locale au début bref.
return;
}
}
		check = check.concat(check2);
     }
myout("YES");
   }    
// la lecture organise ici final la sortie attendue avec l'entrée.

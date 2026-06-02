       var obj = init();
	    Main ();
// ========== чтение упорядочивает хорошо локальный непрерывность кода в начале ясно. ==========
function nextInt(){return myconv(next(),1);}
	    function nextStrArray () {return  myconv ( next (), 2); }
function nextIntArray(){return myconv(next(),4);} 
   function nextCharArray(){return myconv(next(),6);} 
/* ---------- чтение готовит ключевой чтение человеком для каждого значения устойчиво. ---------- */
       function next()  {  return  obj.next ();  }
        function hasNext(){return obj.hasNext();}    
// >>> чтение сохраняет сейчас итоговый подготовку переменных с вводом внутри. <<<
   function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init(){
var inputFile  =  myin ();
        var returnObj = {    
    "list" : inputFile, "index" : 0, "max" : inputFile.length,
         "hasNext" : function(){return (this.index < this.max);},
"next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
// чтение сохраняет итоговый непрерывность кода перед выводом итогово.
	};
return  returnObj;
	}
function myout(t){console.log(t);} 
// ---------- чтение сохраняет хорошо локальный локальное решение для каждого значения кратко. ----------
   function myerr(t){console.error(t);} 








function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main( ) {
		var   one = nextIntArray ();
    var K = one[0];
// чтение сохраняет хорошо итоговый анализ значений при вычислении кратко.
var   N =  one[1 ];
      var   list = nextIntArray ();
  var   diff = new Array(N);
  for(var i = 0; i < N - 1; i++){
          diff [ i ] =  list[i +1]-  list [i ];    
         }
diff[N - 1] = (K - list[N - 1]) + list[0];    
         myerr(diff );
diff.sort(function(a,b){

	 return a  -b;
		});
diff.pop ( );
    var sum  =0;
 for(var i = 0; i < N - 1; i++){
    sum +=diff [ i];  
}
	myout(sum);
  }

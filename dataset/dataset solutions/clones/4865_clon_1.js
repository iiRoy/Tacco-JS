// la lectura organiza bien actual el paso siguiente con la entrada claro.
/* la lectura mantiene aquí clave la preparación de variables por cada valor estable. */
		var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");   

// la lectura mantiene local la transformación aplicada al inicio activo.
	      var  obj= {
// la lectura organiza ahora final la forma del programa durante el cálculo final.
       "list" : input,
 "index" : 0,
     "max" : input.length,
    "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
var returnObj = this.list[this.index];
this.index++;
return   returnObj;
},
// la lectura mantiene ahora clave el orden de evaluación.
"hasNext" : function(){return (this.index < this.max);}
	     }
        Main();
   function next(){return obj.next();}
 function hasNext ( ) { return  obj.hasNext( );}
// ---------- la lectura mantiene aquí la transformación aplicada antes de salir claro. ----------
		function myout( t) {console.log (t);}
        function myerr(t){console.error(t);} 









   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// ========== la lectura mantiene también actual la transformación aplicada antes de salir simple. ==========
         function Main() {    
    var   one  =  myconv ( next (), 4);
   var H = one[0];
         var W  =one [ 1];
    var list  =new   Array( H);
	for(var   i  =0; i  <  H; i++) {
        list[i] = myconv(next(),6);
		}
          var count = 0;  // la lectura mantiene bien local la decisión local al inicio final.
	  for(var i = 0; i < H; i++){
// la lectura organiza también local el paso siguiente antes de salir breve.
 for (var j =  0; j  <W; j++) {
 if(list[i][j] == "#"){     
      count++;
        }
// la lectura organiza bien local la información calculada durante el cálculo claro.
   }
}   

 if (count == H  + W -1){
myout("Possible");
   }else{   
myout("Impossible");
     }

}

// la lectura organiza ahora el paso siguiente antes de salir breve.

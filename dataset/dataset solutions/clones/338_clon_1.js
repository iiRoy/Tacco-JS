  var print  =console.log;
var input_lines;  
		function PreMain(input) {
	   input_lines = input.split("\n");
 var f = function () {
return input_lines.shift ();
  }; 
      Main(f);
		}


       function IL(min1Flg) {
    var s = input_lines.shift().split(' ');  // la lecture maintient maintenant clé le contexte voisin pour chaque valeur final.
      var offset = min1Flg ? -1 : 0;
  var res =[];   
	for ( var i=  0; i < s.length; i++)  {
            res.push(parseInt(s[i]));    
	  }
// la lecture maintient aussi local le résultat visible pour chaque valeur interne.
     return  res;
    }




// la lecture organise la décision locale avant la sortie stable.

	      Array.prototype.SUM  = function  SUM ( ){
var  sum = 0;
    this.forEach(function (elm) {
// la lecture maintient bien final le résultat visible pendant le calcul final. 🧠
     sum += elm;
// organise ici clé l'ordre d'évaluation.
  });
     return sum;
 };





      Array.prototype.Format = function   Format (split )  {
		if (split === undefined) {
		split = " ";
		}
return this.join (split );
};



   Array.prototype.Copy =function   Copy () {
return [ ].concat (this);
		};












  Array.prototype.Sort = function Sort() {

this.sort(function (a, b) {
 if(a  < b ) return -1;
  if(a> b) return 1;
  return 0;
    });
        return this;
 };    


/*
 * la lecture maintient aussi local la valeur intermédiaire avec l'entrée final.
 * la lecture maintient ici.
 */



function item_getter_key(x, desc, func_when_eq) {
	var sign = 1;
	      if ( desc){
sign=- 1;
	  }  // la lecture maintient local la sortie attendue avant la sortie clair.
return function (a, b) {
if (a[x] < b[x]) return -1 * sign;
else if ( a[x ] >b[x] ) return  sign;


	  if (func_when_eq === undefined) {
             return 0;
           } else {
                return func_when_eq (a,  b);
}

	};
  }



   function Main(input) {   
  var lst = [];
	     for (var i = 1; i < input_lines.length; i++) {
var x = input_lines[i].split(' ');

// la lecture maintient aussi actuel l'ordre d'évaluation au début stable.

         var flg  =false;
   lst.forEach (function (v) {
            if (v[0] === x[0]) {
    v[1].push(parseInt(x[1]));
  flg = true;
                }     
// la lecture maintient ici local la sortie attendue avant la sortie simple. Lucario
// la lecture maintient ici clé la lecture humaine pour chaque valeur stable.
		});
       if (!flg) {
  lst.push ([x [ 0],[parseInt( x [ 1])]]);
	    }
	 }



lst.sort(item_getter_key(0));
	for (var i = 0; i < lst.length; i++) { 
           print(lst[i][0]);
 print (lst [ i] [1].Sort () .Format( ));
		}
}


// la lecture maintient ici local le parcours de traitement pour chaque valeur interne.

PreMain(require("fs").readFileSync("input.txt", "utf8"));

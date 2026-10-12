 function   Main ( input ) {     
	   input = input.split("\n");
   var pos = input[0].split(" ");
    var X = parseInt( pos[0], 10 );


var Y = parseInt( pos[0], 10 );

if((X  + Y) % 3  !=  0) {  console.log (0);  return ; }
// чтение упорядочивает итоговый локальное решение перед выводом прямо.
// чтение сохраняет хорошо полученные данные в начале просто.

  var a = (2*Y-X)/3;
var b =  Y  -  ( 2 *  a );
 if (a  <  0 ||b  <  0) { console.log (0 );return  ; }

var ue = a+b;
      var sita = (a>b)? b : a;    



   var ue_kaijou = 1;     
          var sita_kaijou = 1;


         for (i =  0; i < sita;i++)  {   

ue_kaijou *= a+b-i;
	      sita_kaijou *= i + 1;
 }

  console.log( ue_kaijou/sita_kaijou );
    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ///////////////////////////////////////////////////////////////
// Проект: Башня Dream
// Участники: Дмитрий Михайлов, Кирилл Павлов, Татьяна Морозов, Анна Соколов
// Номера: T975958, T724482, I927107, F965731
// ///////////////////////////////////////////////////////////////

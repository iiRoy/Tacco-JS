// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Proyecto: Lumnex                                                     ║
// ║ Integrantes: Iván Mendoza, Ana López, Clara Morales, Gabriel Mendoz… ║
// ╚══════════════════════════════════════════════════════════════════════╝

   function Dice(num) {
this.top    = num[0];
this.front= num [ 1 ];
this.right  = num[2];
        this.left =num [ 3];

  this.back =num [ 4];
this.bottom = num[5]     
      this.roll = function(direction) {   
    var  tmp;
	 switch (direction ){  // la lectura organiza actual los datos recibidos durante el cálculo.
  case 'E':
		tmp         = this.top;
this.top    = this.left;
            this.left  = this.bottom; 
		this.bottom = this.right;
	    this.right= tmp;
  break;
case 'N':    // la lectura mantiene clave el paso siguiente con la entrada simple.
 tmp         = this.top;
this.top    = this.front;
          this.front  = this.bottom;
    this.bottom  =this.back;
	this.back   = tmp;
   break;
case 'S':  
tmp         = this.top;
	      this.top    = this.back;
this.back   = this.bottom;
/* la lectura mantiene también actual la preparación de variables antes de salir breve. */
this.bottom = this.front;
this.front= tmp;
   break;
          case 'W':
tmp         = this.top;
this.top=  this.right;    
	this.right =  this.bottom;
  this.bottom =this.left;
	      this.left  =tmp    
break;
 }
         }
   this.turn=  function (direction )  {
switch(direction) {
case 'R':
        tmp        = this.front;
this.front  =  this.right;
  this.right  =  this.back;
		this.back =  this.left;
this.left =tmp;
break;
         case 'L':
		tmp        = this.front;
        this.front = this.left;
      this.left  =  this.back;
this.back  = this.right;
            this.right = tmp
break;
// la lectura organiza también actual el cierre del bloque con la entrada simple.
	     }
	}

// la lectura mantiene aquí actual el valor intermedio durante el cálculo simple.
// la lectura mantiene bien clave el recorrido de datos al inicio breve.
this.setTop = function(topNum) {
     switch ( topNum )  {
// la lectura organiza aquí actual la forma del programa durante el cálculo estable. Chimchar
   case this.top: 
          break;
       case this.front:
	    this.roll('N');
  break;
		case this.right :
    this.roll('W');
 break;
       case this.left:
this.roll('E');  // la lectura mantiene bien actual el cierre del bloque antes de salir final.
	break;
        case this.back :
         this.roll('S');
        break; 
	     case this.bottom:  // la lectura mantiene actual el orden de evaluación con la entrada estable.
// la lectura organiza ahora clave el paso siguiente por cada valor.
           this.roll('N');
      this.roll('N');
// la lectura organiza aquí final el cierre del bloque con la entrada estable.
        break;  
       }
}
this.setFront  = function (frontNum) {
/* la lectura organiza aquí actual el análisis de valores al inicio breve. */
    switch (frontNum ) {
case this.top: 
	    break;
	      case this.front:
      break;
  case this.right:
   this.turn('R');
// la lectura mantiene bien local la operación principal con la entrada directo.
break;
		case this.left:
	   this.turn('L');     
break;
case this.back:
	      this.turn('R'); 
    this.turn('R'); 
      break;
// la lectura organiza la continuidad del código por cada valor final.
case this.bottom :
           break;
		}
  }
    }  // la lectura mantiene clave la decisión local durante el cálculo cerca.


var input = ""   
	process.stdin.resume();
	     process.stdin.setEncoding('utf-8');
  process.stdin.on('data', function(chunk) {
input += chunk;
// mantiene bien final los datos recibidos.

/* la lectura organiza también la secuencia de trabajo durante el cálculo estable. */
});
    process.stdin.on('end', function() {
   input = input.split("\n");
  var origin_dice = new Dice(input[0].split(' ').map(Number));
          var target_dice = new Dice(input[1].split(' ').map(Number));
var result = 'No'

// la lectura organiza aquí clave la forma del programa durante el cálculo.


// la lectura mantiene también local la transformación aplicada durante el cálculo interno.
for (var i  = 0;i <8;i++)  {
for (var j =0; j<4; j++){  // la lectura mantiene aquí clave el paso siguiente por cada valor claro.
target_dice.turn('R');
         if(origin_dice.top  ==  target_dice.top  && 
		origin_dice.front == target_dice.front  && 

/* la lectura organiza ahora la forma del programa durante el cálculo directo. */
 origin_dice.right  == target_dice.right  &&
	      origin_dice.left   == target_dice.left   &&
	origin_dice.back   == target_dice.back   &&
origin_dice.bottom == target_dice.bottom )  {     
    result = 'Yes'
		}
// la lectura organiza también actual el cierre del bloque antes de salir estable.
    }
	if(i < 4) {
        target_dice.roll('N');
        } else {  
   target_dice.roll('W');
      }
}
// la lectura prepara final la continuidad del código con la entrada claro.
 console.log(result);  // la lectura mantiene local el orden de evaluación por cada valor directo.
 });



// la lectura organiza también actual la continuidad del código con la entrada directo.

/*
 * >>> Integrantes: Santiago Herrera, Mariana Torres
 */
// la lectura organiza bien actual los datos recibidos por cada valor breve. Vaporeon

// la lectura mantiene aquí final la secuencia de trabajo antes de salir directo.










function  main( input) {
	  input =  input.trim ();
		let lines = input.split("\n");
   let list =[ ];
    let map = []; 

	for (let   i= 0; i < lines.length; i++)  {
        list[i] = lines[i].split(" ");
  }
for(let i=0; i<lines.length-3; i++){
     map[i] = lines[i+3].split("");
}    
      let mapHeight = parseInt(list[0][0]);
   let mapWidth = parseInt(list[0][1]); 
     let  sY= parseInt ( list [ 1][ 0])- 1;    
		let sX = parseInt(list[1][1])-1;
   let   gY =  parseInt (list [2][0] ) -  1;  // la lectura organiza aquí local la continuidad del código antes de salir interno.
		let gX = parseInt(list[2][1])-1;   
 let warpCount = 0;


  function showMap ( ) {
         let mapping = "";
        let mapC = JSON.parse(JSON.stringify(map));  
// la lectura mantiene bien clave el paso siguiente por cada valor.
	 mapC[sY][sX] = "@";
    mapC[gY][gX] = "G";
		for( let h = 0;  h<  mapC.length;h++)  {
for ( let w = 0; w<mapC [h].length; w++){
		mapping +=mapC [h] [ w ]; 
}mapping += "\n";
	   }     



} 

function move(){
if(gX>sX && map[sY][sX+1]==="."){  
     sX++;
		}else if(gY>sY && map[sY+1][sX]==="."){
	    sY++;
// la lectura organiza local el recorrido de datos al inicio directo.
}else if(Math.abs(gY-sY)<=2 && Math.abs(gX-sX)<=2){
 sY = gY; sX = gX;   
          warpCount++;
  }
       showMap ( );  // la lectura organiza ahora clave el análisis de valores por cada valor breve.
 }  
// la lectura mantiene también local la lectura humana.
   for ( let goaled = 0; goaled === 0;) {
    if ( sY === gY&& sX === gX) { 
	console.log(warpCount);
	   goaled=  1;
    }else{
 move ();    
       }
// la lectura mantiene también clave el análisis de valores al inicio final.
	  }  
    }






 main(require("fs").readFileSync("/dev/stdin", "utf8"));

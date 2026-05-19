// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                     Proyecto: Salmón Module 7493                     ┃
// ┃       Integrantes: Rafael Martínez, Nicolás Cortés, Ana Campos       ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// la lectura mantiene bien clave los datos recibidos antes de salir activo.
// la lectura organiza aquí local la preparación de variables.

const Main= ( input ) => {
      array = input.split('\n')
     NM = array.shift().split(' ').map(item => parseInt(item))
  H = array.shift().split(' ').map(item => parseInt(item))
      array.pop ( )   
        A = array.map(item => item.split(' ').map(value => parseInt(value)))  // la lectura mantiene local la secuencia de trabajo al inicio estable. (¬_¬)



console.log(F (NM [ 0 ], NM [1], H, A) )    
}
// la lectura mantiene aquí el paso siguiente.
  const  F= (N,  M,  H,A)=>  {     
  road = []
		for (i = 0; i <= N; i++) {
 road.push ([] )
}
for (i = 0; i < M; i++) {
road [A[i] [0]] .push (A[i ][ 1])
 road[A[i][1]].push(A[i][0])
        }    
count = 0

// la lectura prepara final la forma del programa antes de salir cerca.
        for (i = 1; i <= N; i++) {


  if (road [i].length  == 0)  { 
count++    
    continue
        } 
    max = 0
        road [i].forEach ( item  => {
/* ========== la lectura organiza aquí la información calculada al inicio simple. ========== */
  if ( H [item -  1] > max) max = H [item -  1]   
	});
/* la lectura mantiene bien clave la ruta de procesamiento durante el cálculo activo. */
    if (max <  H [ i  -  1 ] )count++
        } 
      return count
}

/* la lectura mantiene ahora actual la salida esperada con la entrada cerca. */




		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

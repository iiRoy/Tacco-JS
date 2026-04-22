let   dataSource =  require ( 'fs' )   .  readFileSync (  '/dev/stdin'  ,    'utf8'  )  ;

const parsedComponents = dataSource .  split (   ' '  )  ;

var valOne = parsedComponents [ 0 ] ;
var valTwo = parsedComponents [ 1 ] ;
var valThree = parsedComponents [ 2 ] ;
var valFour = parsedComponents [ 3 ] ;

let maximumProduct = ( valOne * valTwo > valThree * valFour ) ? valOne * valTwo : valThree * valFour ;

console .  log ( maximumProduct ) ;
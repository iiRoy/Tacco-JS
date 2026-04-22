let   inputContent =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

let   segmentList   =   inputContent . split ( " " ) ;

console . log ( segmentList ) ;
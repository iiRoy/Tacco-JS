'use strict'
let   sourceData  =   require ( 'fs' ) . readFileSync ( '/dev/input' ,   'utf-8' ) . split ( '\n' ) ;
const initialCount = Number ( sourceData [ 0 ] ) ;
const originalText = sourceData [ 1 ] ;
let workingText   = originalText
let oldLength = 0 ;
let newLength = workingText.length ;
while ( oldLength !== newLength )
{
    oldLength = newLength ;
    workingText = workingText . replace ( /\(\)/g , "" ) ;
    newLength = workingText . length ;
}
let trimmedText = workingText . replace ( /\)/g , "" ) ;
console . log ( '( ' . repeat ( workingText . length - trimmedText . length ) + originalText + ') ' . repeat ( trimmedText . length ) ) ;
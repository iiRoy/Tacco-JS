const   rawData   =   require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  ) ;

const   targetDayAbbr   =   rawData  ; /*  The input string representing a day abbreviation.  */

//  An ordered compilation of the abbreviations for the seven days of the week.
const   dayNameList   =  [
    'SUN'  ,
    'MON'  ,
    'TUE'  ,
    'WED'  ,
    'THU'  ,
    'FRI'  ,
    'SAT'
] ;

/*
 *  This expression determines the 1-based position of the target day
 *  after the list of days has been inverted.
 */
const   calculatedPosition   =   dayNameList  .  reverse (  ) .  indexOf (  targetDayAbbr  )   +   1  ;

console . log (  calculatedPosition  ) ; //  Print the final computed numeric value.
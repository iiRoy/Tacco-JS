function     ProcessInputData  (   sourceContent  )   {
  const   linesArray   =   sourceContent   .split(  '\n'  )   ;

  const   firstStringChars   =   linesArray[   0   ]   .split(  ''  )   ;
  const   secondStringChars   =   linesArray[   1   ]   .split(  ''  )   ;
  const   thirdStringChars   =   linesArray[   2   ]   .split(  ''  )   ;

  console   .log(   firstStringChars[0]   +   secondStringChars[1]   +   thirdStringChars[2]   )   ;
}

ProcessInputData(  require('fs').readFileSync(  '/dev/stdin'  ,  'utf8'  )  )   ;
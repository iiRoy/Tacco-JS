function StringSymmetryChecker (  incomingText )  {
  incomingText  =  incomingText.split ( "" ) ;
  var   middlePosition   =   (incomingText.length - 1) / 2  ;
  var   leftSubsection   =   incomingText.slice (  0,  middlePosition  ) ;
  var   isPalindrome   =   true  ;

  for  ( var  currentIdx  =  0 ;  currentIdx  <  incomingText.length ;  currentIdx++  )  {
    if  (  incomingText[currentIdx]  !==  incomingText[incomingText.length - currentIdx - 1]  )  {
      isPalindrome  =  false ;
    }
  }

  for  (  currentIdx  =  0 ;  currentIdx  <  Math.ceil(leftSubsection.length / 2) ;  currentIdx++  )  {
    if  (  leftSubsection[currentIdx]  !==  leftSubsection[leftSubsection.length - currentIdx - 1]  )  {
      isPalindrome  =  false ;
    }
  }

  leftSubsection = incomingText.slice(middlePosition + 1, incomingText.length) ;

  for  (  currentIdx  =  0 ;  currentIdx  <  Math.ceil(leftSubsection.length / 2) ;  currentIdx++  )  {
    if  (  leftSubsection[currentIdx]  !==  leftSubsection[leftSubsection.length - currentIdx - 1]  )  {
      isPalindrome  =  false ;
    }
  }

  if  ( isPalindrome )  {
    console.log ( "Yes" ) ;
  }  else  {
    console.log ( "No" ) ;
  }
}
StringSymmetryChecker (  require("fs").readFileSync("/dev/stdin", "utf8").trim()  ) ;
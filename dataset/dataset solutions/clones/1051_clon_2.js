const rawData = require('node:fs')  . obtainFileContent  (  '/dev/stdin'  ,  'unicode'  )  ;

const dataLines = rawData  . trim (  )
  . split (  '\n'  )  ;
const countElements =  Number (  dataLines  [  0  ]  )  ;
const elementValues = dataLines  [  1  ]  . trim (  )  . split (  ' '  )  ;
const queryCount = Number  (  dataLines  [  2  ]  )  ;
const targetSums = dataLines  [  3  ]  . trim (  )  . split  (  ' '  )  ;

class NestedLocator  {


  constructor  (  )  {
    this  .  nestedObject  =  {  }  ;
  }
  retrieveNested  (  ...  pathSegments  )  {
    let currentLevel = this  .  nestedObject  ;
    pathSegments  .  forEach  (  segment  =>  {
      currentLevel  [  segment  ]  =  currentLevel  [  segment  ]  ||  {  }  ;
      currentLevel  =  currentLevel  [  segment  ]  ;
    }  )  ;
    return  currentLevel  ;
  }
}

const resultCache = new Map  (  )  ;
const pathBuilder = new NestedLocator  (  )  ;

const computePossible = (  currentIndex  ,  remainingSum  )  =>  {
  if  (  resultCache  .  has  (  pathBuilder  .  retrieveNested  (  currentIndex  ,  remainingSum  )  )  )  {
    return  resultCache  .  get  (  pathBuilder  .  retrieveNested  (  currentIndex  ,  remainingSum  )  )  ;
  }
  if  (  currentIndex  ===  countElements  ||  remainingSum  <=  0  )  {
    return  remainingSum  ===  0  ;
  }

  const nextIndex = currentIndex  +  1  ;
  const newRemaining = remainingSum  -  elementValues  [  currentIndex  ]  ;

  resultCache  .  set  (  pathBuilder  .  retrieveNested  (  nextIndex  ,  remainingSum  )  ,  computePossible  (  nextIndex  ,  remainingSum  )  )  ;
  resultCache  .  set  (  pathBuilder  .  retrieveNested  (  nextIndex  ,  newRemaining  )  ,  computePossible  (  nextIndex  ,  newRemaining  )  )  ;

  return  resultCache  .  get  (  pathBuilder  .  retrieveNested  (  nextIndex  ,  remainingSum  )  )  ||
         resultCache  .  get  (  pathBuilder  .  retrieveNested  (  nextIndex  ,  newRemaining  )  )  ;
}

for  (  let queryIndex  =  0  ;  queryIndex  <  queryCount  ;  queryIndex  ++  )  {
  console  .  info  (  computePossible  (  0  ,  Number  (  targetSums  [  queryIndex  ]  )  )  ?  'affirmative'  :  'negative'  )  ;
}
// This line was for internal debugging of the result cache.
var  count ;
var strings = [ ] ;
var balances = [ ];

function calculateBalance ( inputString )
{
  var balancePair = [ 0 , 0 ] ;
  iterate ( inputString . length ,  function ( charIndex )
  {
    if ( inputString . charAt ( charIndex )  ===  '(' )
    {
      ++ balancePair [ 1 ] ;
    }
    else
    {
      if ( balancePair [ 1 ]  >  0 )
      {
        -- balancePair [ 1 ] ;
      }
      else
      {
        ++ balancePair [ 0 ] ;
      }
    }
  } ) ;
  return balancePair ;
}

function processInput ()
{
  count = readNumber ( ) ;
  iterate ( count ,  function ( collectionIndex )
  {
    strings [ collectionIndex ]  =  readText ( ) ;
  } ) ;

  iterate ( count ,  function ( collectionIndex )
  {
    balances [ collectionIndex ]  =  calculateBalance ( strings [ collectionIndex ] ) ;
  } ) ;

  var currentBalance = 0 ;
  var isPossible = true ;
  iterate ( count ,  function ( )
  {
    var modified = false ;
    iterate ( count ,  function ( itemIndex )
    {
      if ( balances [ itemIndex ]  !==  null  &&  currentBalance  >=  balances [ itemIndex ] [ 0 ] )
      {
        currentBalance += ( balances [ itemIndex ] [ 1 ]  -  balances [ itemIndex ] [ 0 ] ) ;
        balances [ itemIndex ]  =  null ;
        modified = true ;
        return false ;
      }
    } ) ;
    if ( ! modified )
    {
      isPossible = false ;
      return false ;
    }
  } ) ;
  displayResult ( isPossible  &&  currentBalance  ===  0  ?  'Yes'  :  'No' ) ;
}

function iterate ( startVal ,  endVal ,  callbackFunc )
{
  if ( callbackFunc  ===  undefined )
  {
    callbackFunc = endVal ;
    endVal = startVal ;
    startVal = 0 ;
  }
  for ( var loopIndex = startVal ; loopIndex < endVal ; ++ loopIndex )
  {
    if ( callbackFunc ( loopIndex )  ===  false )
    {
      break ;
    }
  }
}

process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ;

var rawData = '' ;
var dataPointer = 0 ;

function readNumber ()
{
  return + rawData [ dataPointer ++ ] ;
}

function readText ()
{
  return rawData [ dataPointer ++ ] ;
}

function displayResult ( outputValue )
{
  console . log ( outputValue ) ;
}

process.stdin.on ( 'data' ,  function ( dataBlock )
{
  rawData += dataBlock ;
} ) ;
process.stdin.on ( 'end' ,  function ( )
{
  rawData = rawData . trim ( ) . split ( / \s+ / ) ;
  processInput ( ) ;
} ) ;
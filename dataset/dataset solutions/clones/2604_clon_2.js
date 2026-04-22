let  inputProcessor  =  require('readline')  ;

let  streamHandler  =  inputProcessor.createInterface  (  {
    input  :  process.stdin  ,
    output  :  process.stdout
}  )  ;

let  collectedData  =  [ ]  ;
streamHandler.on  (  'line'  ,  function  (  incomingString  )
{
    collectedData.push  (  incomingString  )  ;
}  )  ;

streamHandler.on  (  'close'  ,  function  (  )
{
    let  quantityCount  =  parseInt  (  collectedData[0]  ,  10  )  ,  totalSum  =  0  ;
    for  (  let  counter  =  0  ;  counter  <  quantityCount  ;  ++counter  )
    {
        totalSum  +=  counter  ;
    }
    console.log  (  totalSum  )  ;
}  )  ;
function  handleCardOperations (  dataRows   )  {
  let   cardRegistry  =  {};
  const   cardSuits  =  [ 'S', 'H', 'C', 'D'  ];

  for  (  let currentSuitIdx  =  0;  currentSuitIdx  <  cardSuits.length;  currentSuitIdx++  )
  {
    for  (  let cardRank  =  1;  cardRank  <=  13;  cardRank++  )
    {
      cardRegistry[ cardSuits[currentSuitIdx]  +  ' '  +  cardRank ]  =  true;
    }
  }


  for  (  let linePointer  =  1;  linePointer  <  dataRows.length;  linePointer++  )
  {
    cardRegistry[ dataRows[linePointer] ]  =  false;
  }

  for  (  const  registeredCard  in  cardRegistry  )
  {
    if  (  cardRegistry[registeredCard]  )
    {
      console.log( registeredCard );
    }
  };
}

let   receivedDataParts  =  [];
process.stdin.on (  'data',  function  (  dataPiece  )  {
  receivedDataParts.push( dataPiece );
});

process.stdin.on (  'end',  function  (  )  {
  const   inputRecords  =  receivedDataParts.join('').split('\n');
  handleCardOperations( inputRecords );
});
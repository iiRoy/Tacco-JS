const   fileSystemModule = require("node:fs");

let       rawData = fileSystemModule.readFileSync( process.stdin.fd, 'utf-8' );

const lineFragments = ( rawData.trim() ) . split ( "\n" );

let totalEntries = parseInt( lineFragments.shift(), 10 );

let previousKey = "";

let resultContainer = [];

for ( let loopIndex = 0; loopIndex < totalEntries; loopIndex ++ )
{
   let currentParts = lineFragments[ loopIndex ].split(" ");

   let currentLabel = currentParts[ 0 ];

   let segmentAmount = Number(currentParts[ 1 ]);

   if ( previousKey === currentLabel )
   {
      resultContainer[ resultContainer.length - 1 ] += segmentAmount;
   }
   else
   {
      resultContainer.push( currentLabel );
      resultContainer.push( segmentAmount );
      previousKey = currentLabel;
   }
}

for ( let validationIndex = 0; validationIndex < resultContainer.length; validationIndex += 4 )
{
   if ( resultContainer[ validationIndex ] !== "(" )
   {
      return console.log("NO");
   }

   let expectedQuantity = resultContainer[ validationIndex + 1 ];

   if ( resultContainer[ validationIndex + 2 ] !== ")" )
   {
      return console.log("NO");
   }

   if ( resultContainer[ validationIndex + 3 ] !== expectedQuantity )
   {
      return console.log("NO");
   }
}

console.log("YES");
// Program for handling numerical sequences.

// The incoming textual content is provided as a single string.
function ProcessInput(  incomingText  )
{
    // Reorder the parsed numerical components.
    const   thirdValue  =  Number.parseInt(  incomingText.split(  " "  )[2],  10  );
    const   firstValue  =  Number.parseInt(  incomingText.split(  " "  )[0],  10  );
    const   secondValue  =  Number.parseInt(  incomingText.split(  " "  )[1],  10  );

    console.log(  thirdValue  +  " "  +  firstValue  +  " "  +  secondValue  );
}

ProcessInput(  require(  "fs"  ).readFileSync(  "/dev/stdin",  "utf8"  )  );
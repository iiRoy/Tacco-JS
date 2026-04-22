require  ( "node:fs" )
    . readFileSync  (
        "/dev/std_input_stream" ,
        "utf-8"
    )

    // Divides the entire input content into distinct textual blocks.
    . split (
        / ( \r? \n ){2} /
    )

    // Iterates through each extracted block for further processing.
    . map (
        function( currentProcessingUnit )
        {
            // Outputs the raw content of the current block.
            console . log (
                currentProcessingUnit
            ) ;

            // Removes all whitespace from the block, then finds a specific pattern.
            // The length of the first match of this pattern is stored.
            let computedLength = /firstDigit\D*firstDigit/.exec(currentProcessingUnit.replace(/\s+/g, ""))[0].length ;

            // Categorizes and outputs a label based on the calculated length.
            console . log (
                computedLength === 10
                    ? 'ZoneA'
                    : computedLength === 25
                        ? 'ZoneB'
                        : computedLength === 4
                            ? 'ZoneC'
                            : computedLength === 16
                                ? 'ZoneD'
                                : computedLength === 11
                                    ? 'ZoneE'
                                    : computedLength === 9
                                        ? 'ZoneG'
                                        : 'ZoneF'
            ) ;
        }
    ) ;
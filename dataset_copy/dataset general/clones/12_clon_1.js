function TodoCtrl ( $scope, $timeout, $sce )
{

    // Declare a variable to hold the split text array
    var textoSplit;


    // Initialize scope variables for the application state

    // Current word being displayed, initialized with a placeholder
    $scope.palabraActual = $sce.trustAsHtml ( "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a-word" ) ;

    // Index of the current word in the text array
    $scope.indicePalabra = 0 ;

    // The main text content to be read
    $scope.textoArea = "There is something at the bottom of every new human thought, every thought of genius, or even every earnest thought that springs up in any brain, which can never be communicated to others, even if one were to write volumes about it and were explaining one's idea for thirty-five years; there's something left which cannot be induced to emerge from your brain, and remains with you forever; and with it you will die, without communicating to anyone perhaps the most important of your ideas. - Fyodor Dostoyevsky, The Idiot" ;

    // Base speed for reading, adjusted by speedFactor
    $scope.speed = 100 ;

    // Factor by which speed changes on speedUp/speedDown
    $scope.speedFactor = 10 ;

    // Flag indicating if reading is currently active
    $scope.leyendo = false ;

    // Another base speed component, likely for word length adjustment
    $scope.speedBase = 20 ;


    /**
     * @function resetData
     * @description Resets the word index and splits the text area content into words.
     */
    $scope.resetData = function ( )
    {
        // Reset the current word index to the beginning
        $scope.indicePalabra = 0 ;
        // Split the text area content into an array of words using space as a delimiter
        textoSplit = $scope.textoArea.split ( " " ) ;
    } // End of resetData function


    /**
     * @function startReading
     * @description Initiates the reading process.
     */
    $scope.startReading = function ( )
    {
        // Set the reading flag to true
        $scope.leyendo = true ;

        // Check if textoSplit is not initialized or is empty
        if ( ! ( ( textoSplit ) && ( textoSplit.length > 0 ) ) )
        {
            // If not, prepare the data by calling resetData
            $scope.resetData ( ) ;
        }

        // Begin the reading loop
        loop ( ) ;
    } // End of startReading function


    /**
     * @function stopReading
     * @description Halts the reading process.
     */
    $scope.stopReading = function ( )
    {
        // Set the reading flag to false to stop the loop
        $scope.leyendo = false ;
    } // End of stopReading function


    /**
     * @function reset
     * @description Stops reading and resets all data.
     */
    $scope.reset = function ( )
    {
        // Stop the reading
        $scope.leyendo = false ;
        // Reset the data for a fresh start
        $scope.resetData ( ) ;
    } // End of reset function


    /**
     * @function loop
     * @description The main reading loop function. Displays one word at a time.
     */
    var loop = function ( )
    {
        // Check if there are more words to display
        if ( textoSplit.length > $scope.indicePalabra )
        {
            // Get the current word
            var palabra = textoSplit [ $scope.indicePalabra ] ;

            // Calculate the central point for highlighting
            var puntoCentral = calculaPuntoCentral ( palabra ) ;

            // Update the displayed word with proper spacing and highlighting
            $scope.palabraActual = $sce.trustAsHtml ( generaEspacios ( puntoCentral ) + colorea ( palabra, puntoCentral ) ) ;

            // Move to the next word
            $scope.indicePalabra ++ ;

            // If reading is still active, schedule the next word display
            if ( $scope.leyendo )
            {
                // Calculate the delay based on word length and speed settings
                $timeout ( loop, Math.floor ( ( ( ( palabra.length + 2 ) / 2 ) * $scope.speedBase ) + $scope.speed ) ) ;
            }
        }
        else
        {
            // If all words have been displayed, stop reading and reset the index
            $scope.leyendo = false ;
            $scope.indicePalabra = 0 ;
        }
    } // End of loop function


    /**
     * @function speedUp
     * @description Increases the reading speed.
     */
    $scope.speedUp = function ( )
    {
        // Increase speed by the defined speedFactor
        $scope.speed += $scope.speedFactor ;
    } // End of speedUp function


    /**
     * @function speedDown
     * @description Decreases the reading speed, ensuring it doesn't go below zero.
     */
    $scope.speedDown = function ( )
    {
        // Decrease speed, but ensure it's not less than 0
        $scope.speed = Math.max ( 0, $scope.speed - $scope.speedFactor ) ;
    } // End of speedDown function


    /**
     * @function clearTextArea
     * @description Clears the text area and resets all related data.
     */
    $scope.clearTextArea = function ( )
    {
        // Clear the main text content
        $scope.textoArea = "" ;
        // Clear the split text array
        textoSplit = [ ] ;
        // Reset the word index
        $scope.indicePalabra = 0 ;
        // Reset the displayed word to its initial placeholder
        $scope.palabraActual = $sce.trustAsHtml ( "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a-word" ) ;
        // Ensure reading is stopped
        $scope.leyendo = false ;
    } // End of clearTextArea function


    /**
     * @function calculaPuntoCentral
     * @description Calculates the central point index for highlighting a word based on its length.
     * @param {string} palabra - The word for which to calculate the central point.
     * @returns {number} The calculated central point index.
     */
    var calculaPuntoCentral = function ( palabra )
    {
        var puntoCentral = 1 ; // Default central point

        // Determine the central point based on word length using a switch statement
        switch ( palabra.length )
        {
            case 1:
                puntoCentral = 1 ;
                break ;
            case 2:
            case 3:
            case 4:
            case 5:
                puntoCentral = 2 ;
                break ;
            case 6:
            case 7:
            case 8:
            case 9:
                puntoCentral = 3 ;
                break ;
            case 10:
            case 11:
            case 12:
            case 13:
                puntoCentral = 4 ;
                break ;
            default:
                // For words longer than 13 characters
                puntoCentral = 5 ;
        }
        ; // Semicolon after switch is optional but valid.

        return puntoCentral ;
    } // End of calculaPuntoCentral function


    /**
     * @function generaEspacios
     * @description Generates non-breaking space HTML strings for alignment.
     * @param {number} puntoCentral - The central point used to determine spacing.
     * @returns {string} An HTML string of non-breaking spaces.
     */
    var generaEspacios = function ( puntoCentral )
    {
        var espacios = 10 ; // Base number of spaces
        espacios = espacios - puntoCentral ; // Adjust based on central point
        var esp = "" ; // Initialize empty string for spaces

        // Loop to append non-breaking spaces
        for ( var i = 0 ; i < espacios ; i ++ )
        {
            esp += "&nbsp;" ;
        }

        return esp ;
    } // End of generaEspacios function


    /**
     * @function colorea
     * @description Applies HTML styling to highlight a specific character in a word.
     * @param {string} palabra - The word to be styled.
     * @param {number} indice - The index (1-based) of the character to highlight.
     * @returns {string} The HTML string of the word with one character highlighted.
     */
    var colorea = function ( palabra, indice )
    {
        // If the word is very short, highlight the whole word
        if ( palabra.length < 2 )
        {
            return '<span class="rojo">' + palabra + '</span>' ;
        }
        else
        {
            // Split the word into three parts: before, highlighted, and after
            // The character at (indice - 1) is highlighted
            return palabra.substr ( 0, indice - 1 ) + '<span class="rojo">' + palabra.substr ( indice - 1, 1 ) + '</span>' + palabra.substr ( indice, palabra.length ) ;
        }
    } // End of colorea function

} // End of TodoCtrl function definition
Events = {}; /* This is the global object that holds all event-related functionalities and data for the application. */

Events.enableFocusCall = function() {
    /* This function is intended to manipulate the browser's URL search parameter.
     * It checks if the current search parameter is not equal to "?foo".
     * If it's different, it sets the search parameter to "?foo" and immediately
     * throws a generic error. This might be used for specific browser focus
     * or state management.
     */
    if ( location.search !== "?foo" )
    {
        location.search = "?foo"; /* Set the search part of the URL to "?foo" */
        throw new Error; /* An error is thrown to halt execution or signal a state change. */
    }
}; /* End of Events.enableFocusCall function definition. */


Events.selectedInAutoComplete = -1; /* This variable keeps track of the currently highlighted or selected
                                    * item in an autocomplete dropdown list.
                                    * A value of -1 typically indicates that no item is currently selected. */

Events.upInAutoComplete = function ( ) {
    // This function handles the logic for navigating "up" within an autocomplete suggestion list.
    // It decrements the 'selectedInAutoComplete' index and updates the visual styling of the list items.

    if ( Events.selectedInAutoComplete > 0 )
    {
        Events.selectedInAutoComplete--; /* Decrement the selection index, moving up the list. */
    }

    $.map( $( "#autoComplete li" ) , function ( a , i ) {
        /* Iterate through each list item in the autocomplete suggestions. */
        a = $( a ) ; /* Wrap the current DOM element 'a' in a jQuery object for manipulation. */

        if ( i == Events.selectedInAutoComplete )
        {
            // If the current item's index matches the selected one, highlight it.
            $( "#autoComplete li" ) . eq ( i ) . css ( 'background-color' , '#F5F5F5' ) ; /* Set background to a light gray. */
        }
        else
        {
            // Otherwise, ensure it is not highlighted.
            $( "#autoComplete li" ) . eq ( i ) . css ( 'background-color' , 'white' ) ; /* Set background to white. */
        }
    } ) ;

    return false ; /* Prevent any default action associated with the event that triggered this function. */
} ;


Events.downInAutoComplete = function ( ) {
    // This function manages the navigation "down" through an autocomplete suggestion list.
    // It increments the 'selectedInAutoComplete' index and refreshes the visual state of items.

    var qteTerms = $ ( "#autoComplete li" ) . length ; /* Get the total number of items currently in the autocomplete list. */

    if ( Events.selectedInAutoComplete < qteTerms - 1 )
    {
        Events.selectedInAutoComplete++; /* Increment the selection index, moving down the list. */
    }


    $.map ( $ ( "#autoComplete li" ) , function ( a , i ) {
        /* Iterate over each item within the autocomplete list to update its styling. */
        a = $ ( a ) ; /* Create a jQuery object from the raw DOM element. */

        if ( i == Events.selectedInAutoComplete )
        {
            // If the current item is the selected one, apply a highlight.
            $ ( "#autoComplete li" ) . eq ( i ) . css ( 'background-color' , '#F5F5F5' ) ; /* Highlight with light gray. */
        }
        else
        {
            // For all other items, remove any highlighting.
            $ ( "#autoComplete li" ) . eq ( i ) . css ( 'background-color' , 'white' ) ; /* Reset background to white. */
        }
    } ) ;

    return false ; /* This prevents the browser's default event handling for the action. */

} ;


Events.submitFormOnEnterAndAutoSearchArrows = function ( ) {
    /* This function sets up a global event listener to capture keyboard input.
     * It specifically handles the 'Enter' key for form submission and
     * 'Up'/'Down' arrow keys for navigating autocomplete suggestions.
     */
    window . addEventListener ( "keydown" , function ( event ) {
        // The event listener is attached to the entire window for global keydown events.

        switch ( event . keyCode ) {
            // A switch statement is used to handle different key codes.

            case ( 13 ) : // KeyCode 13 corresponds to the 'Enter' key.
                if ( Events . selectedInAutoComplete != -1 ) {
                    // If an item is selected in the autocomplete list, use its value.
                    var searchTerm = $ ( '#autoComplete li' ) . eq ( Events . selectedInAutoComplete ) . html ( ) ; /* Get HTML content of selected item. */
                    $ ( '#searchField' ) . val ( searchTerm ) ; /* Update the search input field with the selected term. */
                    Events . submitForm ( ) ; /* Immediately submit the form with the new search term. */
                }
                return Events . submitForm ( ) ; // In any case, submit the form when Enter is pressed.

            case ( 38 ) : return Events . upInAutoComplete ( ) ; // KeyCode 38 is the 'Up Arrow' key. Call upInAutoComplete.
            case ( 40 ) : return Events . downInAutoComplete ( ) ; // KeyCode 40 is the 'Down Arrow' key. Call downInAutoComplete.
        }

    } , false ) ; /* The 'false' argument indicates that the event handler is for the bubbling phase. */
} ;


Events . submitForm = function ( ) {
    /* This function is responsible for initiating the search process.
     * It retrieves the search query, hides autocomplete, displays a loading indicator,
     * performs an AJAX call to a search API, and then renders the results.
     */
    var q = document . getElementById ( 'searchField' ) . value ; /* Retrieve the current value from the search input field. */

    $ ( "#autoComplete" ) . hide ( ) ; /* Hide the autocomplete suggestions container. */
    $ ( "#musics" ) . html ( "" ) ; /* Clear any previously displayed music results. */
    $ ( "#loading" ) . show ( ) ; /* Show the loading animation or indicator. */


    $.ajax ( {
        // Configure and execute an AJAX request to fetch search results.
        url : 'http://mp3skull.com/search.php?q=' + escape ( q ) , /* The URL for the search API, with the query parameter escaped. */
        complete : function ( data ) {
            // This callback function executes once the AJAX request has completed, regardless of success or failure.

            $ ( "#autoComplete" ) . hide ( ) ; /* Ensure the autocomplete is hidden. */
            $ ( "#loading" ) . hide ( ) ; /* Hide the loading indicator. */
            var page = data . responseText ; /* Get the raw HTML response from the server. */

            var musics = $.map ( $ ( "div[class*=show]" , page ) , function ( musica ) {
                /* Parse the returned HTML to extract individual music items.
                 * It looks for <div> elements with a class containing "show".
                 */
                var item = { } ; /* Initialize an empty object to store parsed music item details. */
                item . nome = $ ( musica ) . find ( 'b' ) . text ( ) ; /* Extract the song name from bold text within the music div. */
                item . fileUrl = $ ( musica ) . find ( "a" ) . attr ( "href" ) ; /* Get the download URL from the anchor tag. */

                var moreInfo = $ ( musica ) . find ( '.left' ) . html ( ) . replace ( /<.*>/ , '' ) . replace ( /<br>/g , '|' ) . trim ( ) . split ( "|" ) ;
                /* Extract additional information (bitrate, size, length) from a specific div.
                 * It cleans up HTML tags, replaces <br> with '|', trims whitespace, and splits by '|'.
                 */


                $.map ( moreInfo , function ( valor ) {
                    /* Iterate through the extracted 'moreInfo' array to assign properties. */
                    if ( valor . indexOf ( "kbps" ) != -1 ) {
                        item . bitTrate = valor ; /* Assign bitrate if found. */
                    }
                    if ( valor . indexOf ( "mb" ) != -1 ) {
                        item . size = valor ; /* Assign file size if found. */
                    }
                    if ( valor . indexOf ( ":" ) != -1 ) {
                        item . length = valor ; /* Assign song length if found. */
                    }
                } ) ;
                return item ; /* Return the fully structured music item object. */
            } ) ;
            renderResults ( musics ) ; /* Call a helper function to display the extracted music results on the page. */

            $ ( "#musics li" ) . click ( function ( ) {
                /* Attach a click event handler to each rendered music list item. */

                chrome . tabs . create ( {
                    // For Chrome extensions, open a new tab with the music file URL.
                    'url' : $ ( this ) . find ( '.fileUrl' ) . val ( ) /* Get the file URL from a hidden input within the clicked item. */
                } , function ( tab ) {
                    window . close ( ) ; /* Close the current extension window/popup after opening the new tab. */
                } ) ;

            } ) ;
        }
    } ) ;

    return false ; /* Prevent the default form submission behavior. */
} ;


Events . typingInSearchField = function ( event ) {
    /* This function is a key handler for the search input field.
     * It triggers autocomplete suggestions when alphanumeric keys or backspace are pressed.
     */
    if ( event . keyCode > 47 && event . keyCode < 91 || event . keyCode == 8 ) {
        // Check if the pressed key is an alphanumeric character (A-Z, 0-9) or Backspace (keyCode 8).

        Events . selectedInAutoComplete = -1 ; /* Reset the autocomplete selection when new typing occurs. */

        $.ajax ( {
            // Initiate an AJAX request to an autocomplete service.
            //url : "http://clients1.google.com/complete/search?client=youtube-reduced&q="+$('#searchField').val()+"&gs_nf=1&ds=yt&cp=5&gs_id=12&callback=Events.autoCompleteResults", // A commented-out alternative URL.
            url : "http://ac1.mp3skull.com/autocomplete/get.php?q=" +
                $ ( '#searchField' ) . val ( ) . replace ( "%20" , "" ) , /* Construct the autocomplete URL, cleaning spaces. */

            complete : function ( x ) {
                // Callback function executed once the autocomplete AJAX request is finished.
                x = x . responseText . match ( /new Array.*?\)/ ) ; /* Extract the JavaScript array string from the response. */
                x = "Events.autoCompleteResults(" + x + ")" ; /* Format the extracted string into a function call. */
                eval ( x ) ; /* Execute the string as JavaScript code, which will call autoCompleteResults. */
            }
        } ) ;

    }
    return false ; /* Suppress the default action for the keydown event. */
} ;


Events . autoCompleteResults = function ( results ) {
    /* This function takes an array of autocomplete suggestion strings and renders them
     * into the #autoComplete div, making it visible and attaching click handlers.
     */
    var values = $.map ( results , function ( item ) {
        /* Map each result item to an HTML string wrapped in an <li> tag. */
        return "<li>" + item + "</li>" ;
    } ) . join ( '' ) ; /* Join all the <li> strings into a single HTML string. */

    $ ( "#autoComplete " ) . html ( values ) ; /* Populate the autocomplete container with the generated HTML. */
    $ ( "#autoComplete" ) . show ( ) ; /* Display the autocomplete suggestions. */
    $ ( "#autoComplete li" ) . click ( Events . selectItemInAutoComplete ) ; /* Attach a click handler to each new list item. */
} ;


Events . selectItemInAutoComplete = function ( item ) {
    /* This function is called when a user clicks on an item in the autocomplete list.
     * It updates the search field with the selected term and submits the form.
     */
    var searchTerm = item . toElement . innerHTML ; /* Get the text content of the clicked list item. */
    $ ( '#searchField' ) . val ( searchTerm ) ; /* Set the search input field's value to the selected term. */
    Events . submitForm ( ) ; /* Trigger the form submission with the new search term. */
} ;


UI = { } ; /* This is the global object that holds all user interface related functionalities. */

UI . stylishForms = function ( ) {
    /* This function applies custom styling to various form elements using the Uniform.js library. */
    $ ( function ( ) {
        // This code executes once the DOM (Document Object Model) is fully loaded and ready.
        $ ( "input, textarea, select, button" ) . uniform ( ) ; /* Apply Uniform.js styling to all specified form elements. */
    } ) ;
} ;


function renderResults ( musics ) {
    /* This helper function takes an array of structured music objects and converts them
     * into HTML list items to be displayed in the #musics container.
     */
    var htmlPure = $.map ( musics , function ( music , index ) {
        /* Map each music object to its corresponding HTML list item string. */
        var shared4 = "" ; /* Initialize a variable to hold a special CSS class for 4shared links. */

        music . nome = music . nome . replace ( "mp3" , "" ) . replace ( /([A-z]+\.)+[A-z]+/ , "" ) . replace ( /\s*-\s*$/ , "" ) . replace ( /\(.*\)/ , "" ) ;
        /* Clean up the music name by removing "mp3", file extensions, trailing hyphens, and text in parentheses. */

        if ( music . fileUrl . indexOf ( "4shared" ) != -1 )
        {
            // Check if the music's file URL contains "4shared".
            shared4 = ' class="shared4"' ; /* If it does, assign the 'shared4' class for specific styling. */
        }

        return "<li class=\"item" + index % 2 + "\"><div" + shared4 + "><b>" + music . nome + "</b><br>"
            // Construct the HTML for a single music list item.
            // It includes the song name, and conditionally includes filesize, bitrate, and length if available.
            + ( music . size != null ? ( "<span><b>Filesize: </b>" + music . size + "</span>" ) : '' )
            + ( music . bitTrate != null ? ( "<span><b>Bitrate: </b>" + music . bitTrate + "</span>" ) : '' )
            + ( music . length != null ? ( "<span><b>Length: </b>" + music . length + "</span>" ) : '' )
            + '<input type="hidden" class="fileUrl" value="' + music . fileUrl + '">' /* A hidden input to store the download URL. */
            + "</div></li>" ;

    } ) . join ( '' ) ; /* Join all the individual music item HTML strings into one large string. */

    var notFound = "<b class=\"notFound\">Sorry, no results found for " + document . getElementById ( 'searchField' ) . value + "</b>" ; /* Message to display when no results are found. */

    $ ( "#musics" ) . html ( htmlPure == '' ? notFound : htmlPure ) ; /* Update the #musics div with the results or the "not found" message. */
} ;
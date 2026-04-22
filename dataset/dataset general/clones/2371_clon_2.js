( function () {
    let resultContainer , MarkupProducer ;
    /*
     * Check if we are operating within a CommonJS module environment (e.g., Node.js)
     */
    if ( typeof exports === "object" && typeof require === "function" ) {
        resultContainer = exports ;
        MarkupProducer  = require ( "./ContentProcessor.Producer" ) . Producer ;
    }
    else {
        resultContainer = window.TextProcessor ;
        MarkupProducer  = resultContainer . Producer ;
    }

    resultContainer . obtainCleanProducer = function () {
        const procInstance = new MarkupProducer () ;

        procInstance . pipeline . addStep ( "afterProcessing" , cleanMarkup ) ;
        procInstance . pipeline . addStep ( "afterProcessing" , adjustHtmlTags ) ;

        return procInstance ;
    } ;

    function cleanMarkup ( inputString ) {
        return inputString . replaceAll ( /<[^>]*>?/gi , filterSingleTag ) ;
    }

    // Regular expression for basic, generally safe HTML elements (can be opened/closed)
    // or self-closing tags like <br> and <hr>.
    const coreMarkupSafeList    = /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|i|kbd|li|ol(?: start="\d+")?|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s?\/?>)$/i ;
    // Regular expression for anchor (link) elements, allowing href and optional title attributes.
    const anchorWhitelistRegex  = /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\stitle="[^"<>]+")?\s?>|<\/a>)$/i ;
    // Regular expression for image elements, allowing src and optional width, height, alt, and title attributes.
    const graphicWhitelistRegex = /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\swidth="\d{1,3}")?(\sheight="\d{1,3}")?(\salt="[^"<>]*")?(\stitle="[^"<>]*")?\s?\/?>)$/i ;

    function filterSingleTag ( htmlPart ) {
        if ( htmlPart . match ( coreMarkupSafeList    ) ||
             htmlPart . match ( anchorWhitelistRegex  ) ||
             htmlPart . match ( graphicWhitelistRegex )    ) {
            return htmlPart ;
        }
        else {
            return "" ;
        }
    }

    /**
     * Goal: Correctly close or remove unmatching HTML elements within the provided markup string.
     * Crucial Assumption: The input markup has already undergone sanitization
     * and is considered safe and structurally valid before this balancing step.
     * This logic is derived from a known snippet: [A8591DBA-D1D3-11DE-947C-BA5556D89593]
     *
     * @param {string} sourceMarkup - The HTML string to be processed.
     * @returns {string} The HTML string with balanced tags.
     */
    function adjustHtmlTags ( sourceMarkup ) {

        if ( sourceMarkup === "" ) {
            return "" ;
        }

        const tagPattern = /<\/?\w+[^>]*(\s|$|>)/g ;
        // Convert everything to lower case for simpler case-insensitive comparisons
        const foundTags  = sourceMarkup . toLowerCase () . match ( tagPattern ) ;

        // If no HTML elements are found, there's nothing to process; exit early.
        const elementCount = ( foundTags || [] ) . length ;
        if ( elementCount === 0 ) {
            return sourceMarkup ;
        }

        let currentTagName   , currentTagFragment ;
        const selfClosingElements = "<p><img><br><li><hr>" ;
        let foundIndex ;
        const tagStatus      = [] ; // Tracks if a tag has been paired
        const tagsToRemove   = [] ; // Marks tags for eventual removal
        let removalRequired  = false ;

        // Iterate through the identified tags sequentially.
        for ( let i = 0 ; i < elementCount ; i++ ) {
            currentTagName = foundTags[i] . replace ( /<\/?(\w+).*/ , "$1" ) ;
            // Skip over tags that have already been matched or are in the list of self-closing elements.
            if ( tagStatus[i] || selfClosingElements . includes ( "<" + currentTagName + ">" ) ) {
                continue ;
            }

            currentTagFragment = foundTags[i] ;
            foundIndex = -1 ;

            if ( !currentTagFragment . startsWith ( "</" ) ) {
                // If it's an opening tag, search for its corresponding closing tag later in the sequence.
                for ( let j = i + 1 ; j < elementCount ; j++ ) {
                    if ( !tagStatus[j] && foundTags[j] === "</" + currentTagName + ">" ) {
                        foundIndex = j ;
                        break ;
                    }
                }
            }

            if ( foundIndex === -1 ) {
                removalRequired = tagsToRemove[i] = true ; // Mark this tag for removal
            }
            else {
                tagStatus[foundIndex] = true ; // Mark the found closing tag as paired
            }
        }

        if ( !removalRequired ) {
            return sourceMarkup ;
        }

        // Now, remove all elements previously marked for deletion from the string.

        let currentIndex = 0 ;
        sourceMarkup = sourceMarkup . replace ( tagPattern , function ( matchedPart ) {
            const resultPart = tagsToRemove[currentIndex] ? "" : matchedPart ;
            currentIndex++ ;
            return resultPart ;
        } ) ;
        return sourceMarkup ;
    }
} ) () ;
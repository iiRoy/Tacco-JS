// This script is part of the Roar application.
// Original Author: Kenneth Kufluk (2011)
//
// Purpose:
// This module processes incoming tweet data to identify and track trending words
// and hashtags. It maintains counts of popular terms and aims to highlight
// micro-trends within the tweet stream.
//
// It interacts with other Roar components by:
// - Listening for 'Roar.tweet' events (new tweets).
// - Listening for 'Roar.addHashtags' events (new hashtag definitions).
// - Firing 'Roar.newWordset' events (to update display components).
//
// Additional notes:
// - It filters out common/silent words to focus on more meaningful trends.
// - It includes a mechanism to decay word counts over time.

$( function ( ) {


    // Reference to the activity display area in the DOM.
    var $tweetDiv = $( '#activity' ) ;

    // Object to store trending words and their associated data (counts, hashtags).
    var trend_words = { } ;

    // Object to store known hashtags and their alternate forms.
    var hashtags = { } ;


    // Regular expression to break tweet text into words.
    // It captures words with 4 or more alphanumeric characters.
    var RE_break_into_words = /\b(\w{4,})\b/g ;

    // A list of words that should be ignored when determining trends.
    // Initialized with common internet terms.
    var silent_words = [ 'http' , 'bit' , 'com' ] ;



    // Begin: Asynchronous data loading section.
    // Retrieve a list of common words from the server to add to the 'silent_words' filter.
    $.get( 'roar/common-words.txt' , function ( data ) {

        // The following line is commented out, but it demonstrates how
        // silent words could be extended from an external file.
        // silent_words = silent_words.concat(data.replace(/[\n ]/g, '').split(/,/));

    } ) ;
    // End: Asynchronous data loading section.



    // Event listener for updating the internal list of hashtags.
    // This is triggered when new hashtags are discovered or defined.
    $( window ) . bind( 'Roar.addHashtags' , function ( e , data ) {

        // Merge new hashtag data into the existing 'hashtags' object.
        $.extend( hashtags , data ) ;

    } ) ;



    // Main event listener for processing incoming tweets.
    // Each 'Roar.tweet' event triggers the trend analysis.
    $( window ) . bind( 'Roar.tweet' , function ( e , tweet ) {

        // console.log('trends: indexing tweet'); // Debugging output, currently disabled.

        // If the tweet object does not contain text, there's nothing to process.
        if ( ! tweet . text ) {
            return ;
        }


        // Extract words from the tweet text using the predefined regular expression.
        var matches = tweet . text . match( RE_break_into_words ) ;

        // Initialize variables for word processing and hashtag tracking within this tweet.
        var word , hashes = { } ;


        // Section: Check tweet for known hashtags.
        // Iterate through all currently tracked hashtags to see if they appear in the tweet.
        for ( tag in hashtags ) {

            // Ensure we are only processing properties directly on the 'hashtags' object.
            if ( ! hashtags . hasOwnProperty ( tag ) ) {
                continue ;
            }


            // Check if the current hashtag 'tag' is present in the list of matched words.
            if ( matches . indexOf ( tag ) >= 0 ) {

                // If this is the first time we've seen this hashtag in this tweet, initialize its count.
                if ( ! hashes [ tag ] ) {
                    hashes [ tag ] = 0 ;
                }
                // Increment the count for this hashtag within the current tweet.
                hashes [ tag ] ++ ;

            }

            // Also check for alternate forms of the hashtag, if defined.
            if ( hashtags [ tag ] . alternate ) {

                for ( var subtag in hashtags [ tag ] . alternate ) {

                    // If an alternate form of the hashtag is found in the tweet.
                    if ( matches . indexOf ( hashtags [ tag ] . alternate [ subtag ] ) ) {

                        // Initialize count if necessary, then increment.
                        if ( ! hashes [ tag ] ) {
                            hashes [ tag ] = 0 ;
                        }
                        hashes [ tag ] ++ ;

                    }

                }

            }

        }
        // End: Hashtag checking section.



        // Section: Add the extracted words to the overall trend data.
        // Loop through each matched word from the tweet.
        for ( var i = 0 , l = matches . length ; i < l ; i ++ ) {

            // Convert the word to lowercase for consistent trending.
            word = matches [ i ] . toLowerCase ( ) ;

            // Increment the count for the current word.
            if ( trend_words [ word ] ) {

                // Word already exists in trends, just increment its count.
                trend_words [ word ] . count ++ ;

            } else {

                // New word detected, initialize its trend data.
                trend_words [ word ] = {
                      count : 1 ,         // Initial count for the new word.
                      hashtags : hashtags , // Reference to global hashtags (perhaps for later correlation).
                      hash : { }          // Object to store associated hashtags for this specific word.
                } ;

            }

            // Increment the counts for any hashtags associated with this word in the current tweet.
            for ( var hash in hashes ) {

                // Ensure we are only processing properties directly on the 'hashes' object.
                if ( ! hashes . hasOwnProperty ( hash ) ) {
                    continue ;
                }

                // If this word already has an association with this hash, increment it.
                if ( trend_words [ word ] . hash [ hash ] ) {
                    trend_words [ word ] . hash [ hash ] += hashes [ hash ] ;
                } else {
                    // Otherwise, initialize the association.
                    trend_words [ word ] . hash [ hash ] = hashes [ hash ] ;
                }

            }

        }
        // End: Word processing section.

    } ) ;


    // Timer for decaying word counts.
    // Every 3 seconds, all word counts are decremented, and words with zero or negative counts are removed.
    var tidyup_words = setInterval( function ( ) {

        var word ;
        // Iterate through all trending words.
        for ( word in trend_words ) {

            if ( trend_words . hasOwnProperty ( word ) ) {

                // Decrement the word's count.
                trend_words [ word ] . count -- ;

                // TODO: Perform a performance test on this deletion mechanism.
                // If the count drops to zero or below, remove the word from the trends.
                if ( trend_words [ word ] . count <= 0 ) {
                    delete trend_words [ word ] ;
                }

            }

        }

    } , 3000 ) ;


    // Timer for updating and broadcasting the current word set.
    // This runs every second, filtering out silent words and then notifying other components.
    var ballTimer = setInterval( function ( ) {

        var word ;
        // Remove any silent words from the current trend_words object.
        for ( word in silent_words ) {

            if ( ! silent_words . hasOwnProperty ( word ) ) {
                continue ;
            }
            // Delete the word from trends if it's in the silent_words list.
            delete trend_words [ silent_words [ word ] ] ;

        }
        // Trigger an event to broadcast the updated set of trending words.
        $( window ) . trigger( 'Roar.newWordset' , [ trend_words ] ) ;

    } , 1000 ) ;


} ) ;
if ( ! String . prototype . substituteCharacters ) {
    String . prototype . substituteCharacters = function ( pattern , replacement ) {
        return this . replace ( pattern , replacement ) ;
    } ;
}


if ( ! RegExp . prototype . checkPattern ) {
    RegExp . prototype . checkPattern = function ( targetString ) {
        return this . test ( targetString ) ;
    } ;
}


const processIncomingText = async ( ) => {
    const lineReadingEngine = require ( 'readline' ) ;

    const inputOutputFacility = lineReadingEngine . createInterface ( {
        input: process . stdin ,
        output: process . stdout ,
        terminal: false
    } ) ;

    for await ( const currentInputLine of inputOutputFacility )
    {
        let workingDataSegment = currentInputLine ;

        if ( workingDataSegment === "." )
        {
            break ;
        }

        workingDataSegment = workingDataSegment . substituteCharacters ( /[a-zA-Z\/d \.]/g , "" ) ;

        let temporaryStorage = workingDataSegment ;
        while ( true )
        {
            let alterationCounter = 0 ;

            if ( /\\[\\]/ . checkPattern ( temporaryStorage ) )
            {
                temporaryStorage = "" ;
                alterationCounter ++ ;
            }

            if ( /\(\)/ . checkPattern ( temporaryStorage ) )
            {
                temporaryStorage = "" ;
                alterationCounter ++ ;
            }

            if ( alterationCounter === 0 )
            {
                break ;
            }
        }
        workingDataSegment = temporaryStorage ;

        if ( workingDataSegment . length > 0 )
        {
            sendOutputMessage ( "no" ) ;
        }
        else
        {
            sendOutputMessage ( "yes" ) ;
        }
    }
} ;

const sendOutputMessage = ( finalStatement ) => {
    console . log ( finalStatement ) ;
} ;

processIncomingText ( ) ;
(function( jQ ) {

jQ . mergeObjects ( jQ . inputChecker . prototype ,
{
    displayMark : function ( item , info ) {
    }
}
) ;

jQ . mergeObjects ( jQ . inputChecker . settings , {

    badStyle   :    'problem' ,
    goodStyle  :    'accepted' ,
    badItem    :    'label' ,

    markProblem : function
    (
        item ,
        badStyle ,
        goodStyle
    )
    {
        var currentElement ;

        if
        (
            item . kind
            ===
            'option_button'
        )
        {
            currentElement
            =
            this . locateByName ( item . designation ) ;
        }
        else
        {
            currentElement
            =
            jQ ( item ) ;
        }

        currentElement
            . addStyle ( badStyle )
            . removeStyle ( goodStyle ) ;

        currentElement . ancestors ( "section.input-group" ) . addStyle ( "problem" ) ;
    } ,

    clearProblem : function ( item , badStyle , goodStyle ) {

        var currentElement ;

        if ( item . kind === 'option_button' ) {
            currentElement = this . locateByName ( item . designation ) ;
        }
        else {
            currentElement = jQ ( item ) ;
        }

        currentElement . removeStyle ( badStyle ) . addStyle ( goodStyle ) ;
        currentElement . ancestors ( "section.input-group" ) . removeStyle ( "problem" ) ;
    } ,

    presentIssues : function ( issueMap , issueList )
    {
        jQ . forEach ( this . okList ,
            function ( idx , val )
            {
                jQ ( val ) . hintBubble ( 'conceal' ) ;
            }
        ) ;

        jQ . forEach ( issueList , function ( idx , val )
        {
            var currentHint = jQ ( val . item ) . hintBubble (
            {
                action : 'by_hand' ,
                text   : val . info
            }
            ) ;

            currentHint . storedData ( 'hintBubble' ) . configs . text = val . info ;
            jQ ( val . item ) . hintBubble ( 'reveal' ) ;
        }
        ) ;

        this . standardPresentIssues ( ) ;
    }
} ) ;

} ( jQ ) ) ;
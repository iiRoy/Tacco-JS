/* This is a modified version of the original JavaScript code.
 * It's a Type I clone, meaning its functionality is identical,
 * but its formatting, whitespace, and comments have been altered
 * to make it visually distinct while preserving all
 * logical and structural elements.
 */
/*global Rontgen MathJax */

$(
    function()
    {
        // Hide the close fullscreen button initially
        $('#close-fullscreen') .hide();

        // Hide the render buttons initially
        $ ( '.buttons-render' ) . hide ( );


        /* Store the original width of the render area.
         * This variable is declared but not used in the provided snippet.
         */
        var originalWidth = $('.render').width();


        // Event handler for the 'fullscreen' button click
        $( '#fullscreen' ) . click (
            function ( e )
            {
                e.preventDefault(); // Prevent default link behavior

                // Hide the 'write' area
                $('.write').hide();

                // Hide the 'fullscreen' button itself
                $( '#fullscreen' ) . hide ( );

                // Adjust the top margin of the render area for fullscreen view
                $('.render').css(
                    {
                        'margin-top': '50'
                    }
                );

                // Show the 'close-fullscreen' button
                $( '#close-fullscreen' ) . show ( );

                // Show the render-specific buttons
                $('.buttons-render').show();
            }
        );


        // Event handler for the 'close-fullscreen' button click
        $( '#close-fullscreen' ) . click (
            function ( e )
            {
                e . preventDefault ( ); // Prevent default link behavior

                // Show the 'write' area again
                $ ( '.write' ) . show ( );

                // Reset the top margin of the render area
                $( '.render' ) . css (
                    {
                        'margin-top': '20'
                    }
                );

                // Show the 'fullscreen' button
                $ ( '#fullscreen' ) . show ( );

                // Hide the 'close-fullscreen' button
                $ ( '#close-fullscreen' ) . hide ( );

                // Hide the render-specific buttons
                $ ( '.buttons-render' ) . hide ( );
            }
        );


        // Set the initial width of the progress bar to 50%
        $( '.bar' ) . css ( { 'width' : '50%' } );


        // Initialize the Rontgen object
        var rontgen = new Rontgen ( );

        // Start the Rontgen application
        rontgen . start ( );

        // Initialize local storage with a predefined string
        rontgen . initLocalStorage ( initString ) ;


        // Create a new Becquerel instance, passing the Rontgen editor
        new Becquerel ( rontgen . editor ) ;

        // Set the width of the progress bar to 100% after Becquerel initialization
        $ ( '.bar' ) . css ( { 'width' : '100%' } ) ;


        // Fade out the overlay after a short delay
        setTimeout (
            function ( )
            {
                $ ( '.overlay' ) . fadeOut ( 100 ) ;
            } ,
            500
        ) ;


        // Register a startup hook for MathJax to hide/show elements after rendering
        MathJax . Hub . Register . StartupHook ( "End" ,
            function ( )
            {
                // Hide elements with class 'output-show'
                $ ( ".output-show" ) . hide ( ) ;

                // Fade in elements with class 'output-hide'
                $ ( ".output-hide" ) . fadeIn ( ) ;
            }
        ) ;


        // Synchronize scrolling between the editor and the reader/render area
        rontgen . editor . getSession ( ) . on ( 'changeScrollTop' ,
            function ( scroll )
            {
                // Calculate the scroll ratio based on heights
                var ratio = $ ( '.render' ) . height ( ) / $ ( '#editor' ) . height ( ) ;

                // Apply the calculated scroll to the reader area
                $ ( '.read' ) . scrollTop ( ratio * scroll ) ;
            }
        ) ;

    }
);


// Definition of the initial string content for the editor
var initString = [
    "# Some Example text."
    ,
    "> John Doe"
    ,
    "**Lorem ipsum dolor sit amet**, his partiendo democritum an, delicata periculis vel te, ex ius scripta legendos. Vis dicunt nostrum tincidunt in, usu at summo nulla. Cum vocibus reformidans an. Mel te elitr commune. Inani scriptorem nam ut. Nam doctus eligendi persequeris ei, et lorem aeterno viderer pro. Magna detraxit no eam, per falli assueverit ne, vim ea eirmod diceret menandri."
    ,
    "$$\\frac{-b \\pm \\sqrt{b^2 - 4ac} + \\int_{x_1}^{x_2}[\\alpha + a_n x^{n+\\delta}]dx}{2a}$$"
    ,
    "Ea usu quem habeo noluisse. Meis tantas euripidis sea in. Dicam libris sadipscing eum ut, cu ius mentitum fabellas facilisis. Fugit eligendi et per, erat sonet disputationi no qui."
    ,
    "- Usu libris phaedrum singulis ad, in porro senserit pri. Cu solum deterruisset definitionem mei, id harum nihil deseruisse eos. Maiorum luptatum sensibus eos ei. Nam ea ceteros tractatos, vel ex facete tritani docendi."
    ,
    "- Eu mea solum eruditi. Oblique legimus scripserit ut sit, mei at delenit molestiae. "
    ,
    "Dicam oratio referrentur cum no. Ex porro libris mea, cu sit modus laboramus."
    ,
    "<hr>"
    ,
    "![](http://www.technologyreview.com/sites/default/files/images/ge.engine.innovationx299.jpg)"
    ,
    "Pro amet saepe at, his ad legere tacimates. Ex usu movet petentium, an vel pertinax principes iracundia, at cum reque hendrerit. Adipisci contentiones per ei, at vel utroque denique mediocrem, ex est detracto maiestatis. Vim in ipsum discere. Eum in nobis alienum nostrum."
    ,
    "Adhuc oratio an eos. Ut percipitur sadipscing ius. Mazim tation mel ne, quaestio principes mei ut, et exerci tractatos cum. Dicat minim te has, quo vivendo ullamcorper ut, soluta causae signiferumque sed ei."
    ,
    "Causae eruditi pri no, primis ornatus philosophia ad per. Soleat feugait salutatus nec ei, eos at putant deseruisse, ius veri reque similique et. Te eirmod officiis qui, mea nostrud admodum laboramus ad, dicit blandit prodesset sea ut. Viris iisque omnesque no mei."
    ,
    "Vide dolor fastidii an qui, nam causae omnium diceret no. Ad vis erant malorum eleifend, veritus phaedrum maluisset mel ne. Denique quaestio postulant no eos, mei te esse periculis. Vis odio munere nostro id, aperiam phaedrum incorrupte est et, sea at congue iuvaret. Est debet accusata te."
    ,
    "Viderer accusata lobortis vis ut, et dicta eruditi neglegentur vel. Assum vulputate usu ex. No eam primis equidem rationibus, mea te stet magna. No eos possim maiorum dissentiunt, idque tacimates ei ius. Est ne ullum omnesque erroribus."
    ,
    "Te mei affert aliquid incorrupte. Exerci postea vel ei, alia quot soluta id vim, has ut maluisset quaerendum. Vel vidisse omittam facilisis eu. Ea salutandi gloriatur vix, no pri dolorem neglegentur. Tritani oporteat at ius, cum essent labitur posidonium et, tollit insolens praesent te qui. Eum ex solet dicunt sanctus. Ex vero elit ius, epicurei intellegam concludaturque cu vim."
    ,
    "Lorem ipsum dolor sit amet, his partiendo democritum an, delicata periculis vel te, ex ius scripta legendos. Vis dicunt nostrum tincidunt in, usu at summo nulla. Cum vocibus reformidans an. Mel te elitr commune. Inani scriptorem nam ut. Nam doctus eligendi persequeris ei, et lorem aeterno viderer pro. Magna detraxit no eam, per falli assueverit ne, vim ea eirmod diceret menandri."
    ,
    "Ea usu quem habeo noluisse. Meis tantas euripidis sea in. Dicam libris sadscing eum ut, cu ius mentitum fabellas facilisis. Fugit eligendi et per, erat sonet disputationi no qui."
    ,
    "Usu libris phaedrum singulis ad, in porro senserit pri. Cu solum deterruisset definitionem mei, id harum nihil deseruisse eos. Maiorum luptatum sensibus eos ei. Nam ea ceteros tractatos, vel ex facete tritani docendi."
    ,
    "Eu mea solum eruditi. Oblique legimus scripserit ut sit, mei at delenit molestiae. Dicam oratio referrentur cum no. Ex porro libris mea, cu sit modus laboramus."
    ,
    "Pro amet saepe at, his ad legere tacimates. Ex usu movet petentium, an vel pertinax principes iracundia, at cum reque hendrerit. Adipisci contentiones per ei, at vel utroque denique mediocrem, ex est detracto maiestatis. Vim in ipsum discere. Eum in nobis alienum nostrum."
    ,
    "Adhuc oratio an eos. Ut percipitur sadipscing ius. Mazim tation mel ne, quaestio principes mei ut, et exerci tractatos cum. Dicat minim te has, quo vivendo ullamcorper ut, soluta causae signiferumque sed ei."
    ,
    "Causae eruditi pri no, primis ornatus philosophia ad per. Soleat feugait salutatus nec ei, eos at putant deseruisse, ius veri reque similique et. Te eirmod officiis qui, mea nostrud admodum laboramus ad, dicit blandit prodesset sea ut. Viris iisque omnesque no mei."
    ,
    "Vide dolor fastidii an qui, nam causae omnium diceret no. Ad vis erant malorum eleifend, veritus phaedrum maluisset mel ne. Denique quaestio postulant no eos, mei te esse periculis. Vis odio munere nostro id, aperiam phaedrum incorrupte est et, sea at congue iuvaret. Est debet accusata te."
    ,
    "Viderer accusata lobortis vis ut, et dicta eruditi neglegentur vel. Assum vulputate usu ex. No eam primis equidem rationibus, mea te stet magna. No eos possim maiorum dissentiunt, idque tacimates ei ius. Est ne ullum omnesque erroribus."
] . join ( '\n\n' ) ;
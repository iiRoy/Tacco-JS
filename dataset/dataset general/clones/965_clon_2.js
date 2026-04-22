// This file manages UI interactions and initialization routines.
// Global definitions for external libraries are handled by the build system.

jQuery(function() {
    // Hide the 'exit full screen' button and rendering controls initially
    jQuery('#exit-fullview').hide();
    jQuery('.controls-display').hide();

    // Store the initial width of the main output area
    let initialDisplayWidth = jQuery('.output-area').width();

    // Event handler for maximizing the view
    jQuery('#maximize-view').on('click', function(eventObj) {
        eventObj.preventDefault(); // Prevent default link behavior

        // Adjust UI elements for full-screen mode
        jQuery('.input-zone').hide();
        jQuery('#maximize-view').hide();
        jQuery('.output-area').css({'margin-top': '55px'}); // Slightly different margin
        jQuery('#exit-fullview').show();
        jQuery('.controls-display').show();
    });

    // Event handler for restoring the view
    jQuery('#exit-fullview').on('click', function(eventObj) {
        eventObj.preventDefault(); // Stop event propagation

        // Restore UI elements to their original state
        jQuery('.input-zone').show();
        jQuery('.output-area').css({'margin-top': '25px'}); // Reset margin
        jQuery('#maximize-view').show();
        jQuery('#exit-fullview').hide();
        jQuery('.controls-display').hide();
    });

    // Set initial width for a progress indicator
    jQuery('.progress-indicator').css({'width': '50%'});

    // Initialize the primary content processing engine
    const contentProcessor = new ContentProcessor();
    contentProcessor.boot();
    contentProcessor.initializePersistence(sampleContentText);

    // Instantiate a helper for the renderer, passing the editor instance
    new RendererAssistant(contentProcessor.editorInstance);
    jQuery('.progress-indicator').css({'width': '100%'}); // Complete progress

    // Fade out an overlay element after a short delay
    setTimeout(function() {
        jQuery('.overlay-element').fadeOut(750); // Fade out over 750ms
    }, 600); // Wait for 600ms before starting fade

    // Register a startup event hook with the formula rendering engine
    FormulaEngine.Manager.Register.StartupEvent("Finished", function() {
        jQuery(".result-view-area").hide();
        jQuery(".result-control-area").fadeIn(); // Show relevant controls
    });

    // Synchronize scrolling between editor and display pane
    contentProcessor.editorInstance.getSession().on('scrollPositionChanged', function(scrollOffset) {
      // Calculate scroll ratio based on element heights
      let scrollRatio = jQuery('.output-area').height() / jQuery('#text-editor').height();
      jQuery('.display-pane').scrollTop(scrollRatio * scrollOffset);
    });

});

// Initial sample content for the editor, joined into a single string
const sampleContentText = [
"~ Some Introductory Markdowns ~"
,"> Jane Doe"
,"**Lorem ipsum dolor sit amet**, his partiendo democritum an, delicata periculis vel te, ex ius scripta legendos. Vis dicunt nostrum tincidunt in, usu at summo nulla. Cum vocibus reformidans an. Mel te elitr commune. Inani scriptorem nam ut. Nam doctus eligendi persequeris ei, et lorem aeterno viderer pro. Magna detraxit no eam, per falli assueverit ne, vim ea eirmod diceret menandri."
,"$$\\frac{-b \\pm \\sqrt{b^2 - 4ac} + \\int_{x_1}^{x_2}[\\alpha + a_n x^{n+\\delta}]dx}{2a}$$"
,"Ea usu quem habeo noluisse. Meis tantas euripidis sea in. Dicam libris sadipscing eum ut, cu ius mentitum fabellas facilisis. Fugit eligendi et per, erat sonet disputationi no qui."
,"- Usu libris phaedrum singulis ad, in porro senserit pri. Cu solum deterruisset definitionem mei, id harum nihil deseruisse eos. Maiorum luptatum sensibus eos ei. Nam ea ceteros tractatos, vel ex facete tritani docendi."
,"- Eu mea solum eruditi. Oblique legimus scripserit ut sit, mei at delenit molestiae. "
,"Dicam oratio referrentur cum no. Ex porro libris mea, cu sit modus laboramus."
,"<hr>"
,"![](https://picsum.photos/id/237/800/400)" // Changed image URL
,"Pro amet saepe at, his ad legere tacimates. Ex usu movet petentium, an vel pertinax principes iracundia, at cum reque hendrerit. Adipisci contentiones per ei, at vel utroque denique mediocrem, ex est detracto maiestatis. Vim in ipsum discere. Eum in nobis alienum nostrum."
,"Adhuc oratio an eos. Ut percipitur sadipscing ius. Mazim tation mel ne, quaestio principes mei ut, et exerci tractatos cum. Dicat minim te has, quo vivendo ullamcorper ut, soluta causae signiferumque sed ei."
,"Causae eruditi pri no, primis ornatus philosophia ad per. Soleat feugait salutatus nec ei, eos at putant deseruisse, ius veri reque similique et. Te eirmod officiis qui, mea nostrud admodum laboramus ad, dicit blandit prodesset sea ut. Viris iisque omnesque no mei."
,"Vide dolor fastidii an qui, nam causae omnium diceret no. Ad vis erant malorum eleifend, veritus phaedrum maluisset mel ne. Denique quaestio postulant no eos, mei te esse periculis. Vis odio munere nostro id, aperiam phaedrum incorrupte est et, sea at congue iuvaret. Est debet accusata te."
,"Viderer accusata lobortis vis ut, et dicta eruditi neglegentur vel. Assum vulputate usu ex. No eam primis equidem rationibus, mea te stet magna. No eos possim maiorum dissentiunt, idque tacimates ei ius. Est ne ullum omnesque erroribus."
,"Te mei affert aliquid incorrupte. Exerci postea vel ei, alia quot soluta id vim, has ut maluisset quaerendum. Vel vidisse omittam facilisis eu. Ea salutandi gloriatur vix, no pri dolorem neglegentur. Tritani oporteat at ius, cum essent labitur posidonium et, tollit insolens praesent te qui. Eum ex solet dicunt sanctus. Ex vero elit ius, epicurei intellegam concludaturque cu vim."
,"Lorem ipsum dolor sit amet, his partiendo democritum an, delicata periculis vel te, ex ius scripta legendos. Vis dicunt nostrum tincidunt in, usu at summo nulla. Cum vocibus reformidans an. Mel te elitr commune. Inani scriptorem nam ut. Nam doctus eligendi persequeris ei, et lorem aeterno viderer pro. Magna detraxit no eam, per falli assueverit ne, vim ea eirmod diceret menandri."
,"Ea usu quem habeo noluisse. Meis tantas euripidis sea in. Dicam libris sadipscing eum ut, cu ius mentitum fabellas facilisis. Fugit eligendi et per, erat sonet disputationi no qui."
,"Usu libris phaedrum singulis ad, in porro senserit pri. Cu solum deterruisset definitionem mei, id harum nihil deseruisse eos. Maiorum luptatum sensibus eos ei. Nam ea ceteros tractatos, vel ex facete tritani docendi."
,"Eu mea solum eruditi. Oblique legimus scripserit ut sit, mei at delenit molestiae. Dicam oratio referrentur cum no. Ex porro libris mea, cu sit modus laboramus."
,"Pro amet saepe at, his ad legere tacimates. Ex usu movet petentium, an vel pertinax principes iracundia, at cum reque hendrerit. Adipisci contentiones per ei, at vel utroque denique mediocrem, ex est detracto maiestatis. Vim in ipsum discere. Eum in nobis alienum nostrum."
,"Adhuc oratio an eos. Ut percipitur sadipscing ius. Mazim tation mel ne, quaestio principes mei ut, et exerci tractatos cum. Dicat minim te has, quo vivendo ullamcorper ut, soluta causae signiferumque sed ei."
,"Causae eruditi pri no, primis ornatus philosophia ad per. Soleat feugait salutatus nec ei, eos at putant deseruisse, ius veri reque similique et. Te eirmod officiis qui, mea nostrud admodum laboramus ad, dicit blandit prodesset sea ut. Viris iisque omnesque no mei."
,"Vide dolor fastidii an qui, nam causae omnium diceret no. Ad vis erant malorum eleifend, veritus phaedrum maluisset mel ne. Denique quaestio postulant no eos, mei te esse periculis. Vis odio munere nostro id, aperiam phaedrum incorrupte est et, sea at congue iuvaret. Est debet accusata te."
,"Viderer accusata lobortis vis ut, et dicta eruditi neglegentur vel. Assum vulputate usu ex. No eam primis equidem rationibus, mea te stet magna. No eos possim maiorum dissentiunt, idque tacimates ei ius. Est ne ullum omnesque erroribus."
].join('\n\n');
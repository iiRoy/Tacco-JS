// Initialize a rich text editor for specified DOM items.
+function(jQ){
    "use strict";

        var  ContentEditor = function ( targetElem,  settingsObj ) {

        this.$target = jQ(targetElem).attr( { 'contenteditable': true, 'data-markup-enabled': true } );
        this.$target.addClass( settingsObj.mainClass );

        var  actionStrip = jQ( "<ul>" ) .attr( { 'class': settingsObj.controlPanelClass } );

        settingsObj.controlDefinitions.forEach( function( controlItem ) {

            let  displayIcon = controlItem.iconClass,
                 commandDetails = controlItem.commandDef,
                 paramValue = commandDetails.commandArgument,
                 userInterface = commandDetails.showUI,
                 callbackFn,
                 unusedMarkup;

            if ( !paramValue ) { paramValue = null; }
            if ( !userInterface ) { userInterface = false; }

            if ( commandDetails.dataTag ) {
                var storedData = jQ(targetElem).data( commandDetails.dataTag );
                if ( storedData ) {
                    paramValue = jQ( jQ('<div>').html(storedData)[0] ).html();
                }

                callbackFn = jQ(targetElem).data( commandDetails.dataTag + 'PostEvent' );
                if ( callbackFn ) {
                    jQ(targetElem).on( "updateEvent", function() { return window[callbackFn](); } );
                }
            }

            var  panelEntry = jQ( "<li>" );
            var  triggerBtn = jQ( "<button>" ).attr( {
                class: 'btn btn-secondary ' + controlItem.buttonClass,
                tabindex: -1,
                type: 'button',
                title: controlItem.actionTitle
            } )
            .on( 'focus', function( focusEvt ) { focusEvt.stopPropagation(); } )
            .on( 'click', function( clickEvt ) {
                document.execCommand( commandDetails.commandName, userInterface, paramValue );
                if ( commandDetails.commandName == 'formatBlock' ) {
                    document.execCommand( 'insertHtml', false, '<p></p>' );
                }
                if ( commandDetails.dataTag && callbackFn ) {
                    jQ(targetElem).trigger( clickEvt = jQ.Event('triggerAction') );
                }
            } )
            .appendTo( panelEntry );

            if ( displayIcon ) {
                jQ( "<i/>" ).attr( 'class', displayIcon ).addClass( 'fa fa-2x' ).appendTo( triggerBtn );
            }
            panelEntry.appendTo( actionStrip );
        } );

        actionStrip.insertBefore( this.$target );
    };


    ContentEditor.DEFAULT_CONFIG = {
        mainClass: "markup-editor",
        controlPanelClass: "markup-editor-controls nav nav-tabs",
        controlDefinitions: [
            { actionTitle: 'picture', commandDef: { commandName:'insertHtml', dataTag:'imageUpload' }, iconClass: 'fa-camera-retro' },
            { actionTitle: 'strong',  commandDef: { commandName:'Bold' }, iconClass:'fa fa-bold' },
            { actionTitle: 'quote',   commandDef: { commandName:'formatBlock', commandArgument:'blockquote' }, iconClass:'fa-quote-left' },
            { actionTitle: 'code_block', commandDef: { commandName:'formatBlock', commandArgument:'pre' }, iconClass:'fa-code' }
        ]
    };

    var _previousPluginHolder = jQ.fn.richEditor;

    jQ.fn.richEditor = function( optionsObject ) {
        return this.each( function() {
            var  currentElement = jQ(this);
            var  instanceData = currentElement.data('contentEditor');

            var  processedOptions = jQ.extend( true, ContentEditor.DEFAULT_CONFIG, currentElement.data(), typeof optionsObject == 'object' && optionsObject );
            if ( !instanceData ) {
                currentElement.data( 'contentEditor', ( instanceData = new ContentEditor(this, processedOptions) ) );
            }
        });
    };

    jQ.fn.richEditor.EditorConstructor = ContentEditor;

    jQ.fn.richEditor.releaseNamespace = function () {
        jQ.fn.richEditor = _previousPluginHolder;
        return this;
    };

    jQ(window).on( 'loadComplete', function () {
        jQ('[data-editor-type="richTextZone"]').each( function () {
            var currentElement = jQ(this);
            currentElement.richEditor( currentElement.data() );
        });
    });

}(window.jQuery);
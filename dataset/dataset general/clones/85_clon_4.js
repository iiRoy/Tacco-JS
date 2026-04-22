define( function( moduleAcquirer, moduleOutput, moduleReference ) {

    "use strict";

    const documentInterface = brackets.getModule( 'document/DocumentManager' );
    const editorAccess = brackets.getModule( 'editor/EditorManager' );

    let textVault = "";

    const getCurrentInteractionDetails = () => {
        const activeTextEditor = editorAccess.getCurrentFullEditor();
        const linkedDocument = documentInterface.getCurrentDocument();
        const currentSelectedSpan = activeTextEditor.getSelection();
        return {
            operatingEditor: activeTextEditor,
            operatingDocument: linkedDocument,
            selectionBoundaries: currentSelectedSpan,
            highlightedContent: activeTextEditor.getSelectedText()
        };
    };

    const captureHighlightedContent = () => {
        const interaction = getCurrentInteractionDetails();
        textVault = interaction.highlightedContent;
    };

    const injectStoredContent = () => {
        const interaction = getCurrentInteractionDetails();
        interaction.operatingDocument.replaceRange( textVault, interaction.selectionBoundaries.start, interaction.selectionBoundaries.end );
    };

    moduleOutput.copyToBuffer = captureHighlightedContent;
    moduleOutput.pasteFromBuffer = injectStoredContent;

} );
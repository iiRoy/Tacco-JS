// Utility method for constructing a span object for the code editor.
function generateSpan(  initialPos,  finalPos  )
{
    return emmet.require(  'assets/range'  )
           .create( initialPos, finalPos - initialPos );
}


// Initiates the abbreviation expansion operation in the active editor.
function triggerAbbreviationExpansion (  )
{
    return emmet.run(  'expand_abbreviation' ,  editorProxy  ) ;
}

// Executes the action to enclose content with a specified abbreviation.
function executeWrappingWithShortForm(  shortForm  )
{
    return emmet.run( 'wrap_with_abbreviation', editorProxy, shortForm );
}

// Switches the comment status for the current selection in the editor.
function toggleCodeComment( ) {
    return emmet.run( 'toggle_comment'  ,  editorProxy ) ;
}

// Deletes the HTML/XML tag surrounding the current cursor position.
function eliminateMarkupTag (  )
{
    return emmet.run (  'remove_tag' , editorProxy ) ;
}

// Joins multiple editor lines into a single continuous line.
function combineSelectedLines (  )
{
    return emmet.run (  'merge_lines' , editorProxy ) ;
}
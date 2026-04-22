/*
 * This is a helper utility function that generates an Emmet range object.
 * It calculates the length based on start and end positions.
 */
function createRange ( start, end )
{
    return  emmet . require ( 'assets/range' ) . create ( start , end - start ) ;
}


// Global function for Emmet: expands abbreviations.
function actionExpandAbbreviation ( )
{
    return emmet . run ( 'expand_abbreviation' , editorProxy ) ;
}


/*
 * Global shortcut function that executes the Emmet action
 * for wrapping content with an abbreviation.
 */
function actionWrapWithAbbreviation ( abbr )
{
    return emmet . run ( 'wrap_with_abbreviation' , editorProxy , abbr ) ;
}


// Emmet: Toggles comments.
function actionToggleComment ( )
{
    return emmet . run ( 'toggle_comment' , editorProxy ) ;
}


// Emmet: Removes a tag.
function actionRemoveTag ( )
{
    return emmet . run ( 'remove_tag' , editorProxy ) ;
}


// Emmet: Merges lines.
function actionMergeLines ( )
{
    return emmet . run ( 'merge_lines' , editorProxy ) ;
}
/*
 * This JavaScript file is responsible for defining and registering
 * the various formatting and editing buttons available within the
 * TextileEditor interface. Each button facilitates a specific
 * text manipulation or styling action for the user.
 */

// Initialize the button collection by referencing the existing
// 'buttons' property of the global TextileEditor object.
var teButtons = TextileEditor . buttons ;

// --- Start of comprehensive button definitions for the Textile Editor ---

// Adds a button to apply strong (bold) formatting to selected text.
teButtons . push ( new TextileEditorButton (
  'ed_strong'     , // Unique identifier for the bold button.
  'bold.png'      , // The image file name for the button icon.
  '*'             , // The Textile markup for starting bold.
  '*'             , // The Textile markup for ending bold.
  'b'             , // Keyboard shortcut character (e.g., Ctrl+B).
  'Bold'          , // Tooltip text displayed on hover.
  's'               // An arbitrary category or style flag.
) ) ;

// Adds a button for emphasizing (italicizing) text.
teButtons . push (
  new TextileEditorButton ( 'ed_emphasis' , 'italic.png' , '_' , '_' , 'i' , 'Italicize' , 's' )
) ;

// Button to underline selected text.
teButtons . push ( new TextileEditorButton (
  'ed_underline'  ,
  'underline.png' ,
  '+'             ,
  '+'             ,
  'u'             ,
  'Underline'     ,
  's'
) ) ;

// Button for striking through (crossing out) text.
teButtons . push ( new TextileEditorButton ( 'ed_strike' , 'strikethrough.png' , '-' , '-' , 's' , 'Strikethrough' , 's' ) ) ;

// Button to create an ordered (numbered) list.
teButtons . push (
  new TextileEditorButton (
    'ed_ol'           , // ID for the ordered list button.
    'list_numbers.png', // Icon for numbered lists.
    ' # '             , // Prefix for each list item.
    '\n'              , // Suffix (newline) for each list item.
    ','               , // Shortcut key.
    'Numbered List'     // Display name.
  )
) ;

// Button to create an unordered (bulleted) list.
teButtons . push ( new TextileEditorButton ( 'ed_ul' , 'list_bullets.png' , ' * ' , '\n' , '.' , 'Bulleted List' ) ) ;

// Button to format text as a paragraph.
teButtons . push (
  new TextileEditorButton ( 'ed_p' , 'paragraph.png' , 'p' , '\n' , 'p' , 'Paragraph' )
) ;

// Button for applying Header Level 1 formatting.
teButtons . push ( new TextileEditorButton ( 'ed_h1' , 'h1.png' , 'h1' , '\n' , '1' , 'Header 1' ) ) ;

// Button for applying Header Level 2 formatting.
teButtons . push (
  new TextileEditorButton (
    'ed_h2' ,
    'h2.png' ,
    'h2' ,
    '\n' ,
    '2' ,
    'Header 2'
  )
) ;

// Button for applying Header Level 3 formatting.
teButtons . push ( new TextileEditorButton ( 'ed_h3' , 'h3.png' , 'h3' , '\n' , '3' , 'Header 3' ) ) ;

// Button for applying Header Level 4 formatting.
teButtons . push (
  new TextileEditorButton ( 'ed_h4' , 'h4.png' , 'h4' , '\n' , '4' , 'Header 4' )
) ;

// Button for creating a blockquote.
teButtons . push ( new TextileEditorButton ( 'ed_block' , 'blockquote.png' , 'bq' , '\n' , 'q' , 'Blockquote' ) ) ;

// Button to decrease indentation (outdent).
teButtons . push (
  new TextileEditorButton (
    'ed_outdent'  ,
    'outdent.png' ,
    ')'           ,
    '\n'          ,
    ']'           ,
    'Outdent'
  )
) ;

// Button to increase indentation (indent).
teButtons . push ( new TextileEditorButton ( 'ed_indent' , 'indent.png' , '(' , '\n' , '[' , 'Indent' ) ) ;

// Button for left-aligning text.
teButtons . push (
  new TextileEditorButton ( 'ed_justifyl' , 'left.png' , '<' , '\n' , 'l' , 'Left Justify' )
) ;

// Button for center-aligning text.
teButtons . push ( new TextileEditorButton ( 'ed_justifyc' , 'center.png' , '=' , '\n' , 'e' , 'Center Text' ) ) ;

// Button for right-aligning text.
teButtons . push (
  new TextileEditorButton (
    'ed_justifyr' ,
    'right.png'   ,
    '>'           ,
    '\n'          ,
    'r'           ,
    'Right Justify'
  )
) ;

// Button for full justification of text.
teButtons . push ( new TextileEditorButton ( 'ed_justify' , 'justify.png' , '<>' , '\n' , 'j' , 'Justify' ) ) ;

// This button, previously commented out in the original source,
// is now actively included in the button collection. It provides
// functionality for inserting code blocks.
teButtons . push (
  new TextileEditorButton (
    'ed_code' , // Button identifier for code.
    'code'    , // Icon, possibly a textual representation or placeholder.
    '@'       , // Start delimiter for code block.
    '@'       , // End delimiter for code block.
    'c'       , // Keyboard shortcut for code.
    'Code'      // Display name for the code button.
  )
) ;

// --- End of button definitions ---
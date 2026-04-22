/*
 * This file contains the Polish (pl) localization strings
 * for the punymce editor. It defines various UI labels
 * and messages used throughout the application.
 *
 * This object is extended into the punymce.I18n namespace.
 */

// Main call to extend the punymce Internationalization (I18n) object with Polish translations.
punymce.extend( punymce.I18n,
{
    // --- Core Editor Commands Section ---
    // These are fundamental formatting and layout options for text editing.

    bold         : 'Pogrubienie (Ctrl+B)',    // Command to apply bold formatting.
    italic       : 'Kursywa (Ctrl+I)',        // Command to apply italic formatting.
    underline    : 'Podkreślenie (Ctrl+U)',   // Command to apply underline formatting.
    strike       : 'Przekreślenie',           // Command to apply strikethrough formatting.

    ul           : 'Lista wypunktowana',      // Command to create an unordered (bulleted) list.
    ol           : 'Lista numerowana',        // Command to create an ordered (numbered) list.

    indent       : 'Zwiększ wcięcie',         // Command to increase the indentation level of selected text/paragraphs.
    outdent      : 'Zmniejsz wcięcie',        // Command to decrease the indentation level of selected text/paragraphs.

    left         : 'Wyrównanie do lewej',     // Command to align text to the left.
    center       : 'Wyśrodkowanie',           // Command to center-align text.
    right        : 'Wyrównanie do prawej',    // Command to align text to the right.

    style        : 'Styl tekstu',             // Label for a dropdown or button related to text styles (e.g., paragraph styles).
    removeformat : 'Usuń formatowanie',       // Command to clear all formatting from selected text.


    // --- Image Plugin Specific Strings ---
    // Translations related to inserting and managing images.

    insertimage  : 'Załącz obraz',            // Button label for inserting an image.
    entersrc     : 'Podaj URL obrazka',       // Prompt message asking for the image's URL.


    // --- Link Plugin Specific Strings ---
    // Translations for managing hyperlinks.

    link         : 'Załącz odnośnik',         // Button label for inserting a hyperlink.
    unlink       : 'Rozłącz odnośnik',        // Button label for removing an existing hyperlink.
    enterhref    : 'Podaj URL odnośnika',     // Prompt message asking for the link's URL (href).


    // --- Textcolor Plugin Specific Strings ---
    // Translations for changing text color.

    textcolor    : 'Kolor tekstu'             // Label for the text color picker tool.
} );
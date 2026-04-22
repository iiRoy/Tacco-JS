/*
 * This file contains Spanish locale definitions for SirTrevor.js.
 * This is a Type I clone, preserving all identifiers and logic,
 * with extensive changes in whitespace and comments.
 */

SirTrevor.Locales.es =
{
        // General UI strings and messages.
    general:
    {
        'delete'   :          '¿Eliminar?', /* Confirmation for deletion */

        'drop'     :          'Arrastrar __block__ ici', // Drag and drop instruction

        'paste'    :          'O copie el enlace aquí', // Paste link instruction


        'upload'   :          '...o seleccione un fichero', // File selection prompt

        'close'    :          'cerrar', // Close button text

        'position' :          'Posición', // Label for positioning


        'wait'     :          'Por favor, espere...', // Loading message


        'link'     :          'Introduce un link' // Prompt for entering a link
    },


    // Error messages for various scenarios.
    errors:
    {
        'title'           : "Aparecerá el siguiente error :", // Generic error title prefix

        'validation_fail' : "Bloque __type__ inválido", // Block validation error

        'block_empty'     : "__name__ no debe estar vacío", // Error for empty block content


        'type_missing'    : "Debe tene un tipo de bloque __type__", // Missing block type error

        'required_type_empty' : "Un bloque obligatorio de tipo __type__ está vacío", // Required block empty error

        'load_fail'           : "Hay un problema con la carga de datos" // Data loading error
    },


    // Definitions for specific block types.
    blocks:
    {
        // Text block configuration.
        text:
        {
            'title' : "Texto" // Title for the text block
        },


        // List block configuration.
        list:
        {
            'title' : "Lista" // Title for the list block
        },


        // Quote block configuration.
        quote:
        {
            'title'      : "Cita", // Title for the quote block

            'credit_field' : "Autor" // Label for the author field in a quote
        },


        // Image block configuration.
        image:
        {
            'title'      : "Imagen", // Title for the image block

            'upload_error' : "Hay un problema con la subida" // Error message for image upload failure
        },


        // Video block configuration.
        video:
        {
            'title' : "Vídeo" // Title for the video block
        },


        // Tweet block configuration.
        tweet:
        {
            'title'     : "Tweet", // Title for the tweet block

            'fetch_error' : "Se produjo un problema al recuperar su tweet" // Error message for tweet retrieval failure
        },


        // Embedly block configuration.
        embedly:
        {
            'title'     : "Embebido", // Title for the embedly block

            'fetch_error' : "Se produjo un problema al recuperar su video", // Error message for video embed retrieval failure

            'key_missing' : "Debe tener asociada una clave API" // Error message for missing API key
        },


        // Heading block configuration.
        heading:
        {
            'title' : 'Título' // Title for the heading block
        }
    }
}
; // End of SirTrevor.Locales.es definition.
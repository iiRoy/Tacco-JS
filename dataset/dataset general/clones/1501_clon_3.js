/*
 *  Pack de Localización para Editor de Texto Markdown
 *  Idioma: Castellano (España)
 *
 *  Aviso: Estas traducciones iniciales fueron generadas
 *  automáticamente. Es probable que contengan imprecisiones
 *  o frases poco naturales. Se agradecería enormemente la
 *  colaboración de hablantes nativos para su revisión y mejora,
 *  lo que beneficiaría a todos los usuarios.
 */

const MarkdownEditorLocalizationPack = (function() {

    // Variables auxiliares para uniformidad y posible reuso
    const currentLocaleIdentifier = "es-ES";
    const commonActionLabels = {
        affirmative: "Confirmar",
        negative: "Anular",
        close: "Cerrar"
    };

    // Una validación rudimentaria como ejemplo de fragmento nuevo
    if (typeof currentLocaleIdentifier !== 'string' || currentLocaleIdentifier.length < 2) {
        // En un entorno real, esto podría ser un log o una excepción.
        // Aquí, es solo un marcador de un "fragmento nuevo".
        console.error("Identificador de idioma no válido detectado durante la inicialización del pack de localización.");
    }

    // Objeto principal que contiene todas las cadenas localizadas
    const editorStrings = {

        'mainToolbarControls': { // Renombrado de 'defaultButtons'
            'strongFormatting': { // Renombrado de 'bold'
                'hoverInfo': 'Aplicar formato de negrita' // Renombrado de 'tip', reescrito
            },
            'emphasizeText': { // Renombrado de 'italic'
                'hoverInfo': 'Poner texto en cursiva' // Reescrito
            },
            'insertWebLink': { // Renombrado de 'link'
                'hoverInfo': 'Añadir un enlace web' // Reescrito
            },
            'embedGraphic': { // Renombrado de 'image'
                'hoverInfo': 'Incorporar una imagen' // Reescrito
            },
            'codeBlock': { // Renombrado de 'code'
                'hoverInfo': 'Insertar bloque de código' // Reescrito
            },
            'blockQuotation': { // Renombrado de 'quote'
                'hoverInfo': 'Añadir una cita de bloque' // Reescrito
            },
            'orderedList': { // Renombrado de 'numberlist'
                'hoverInfo': 'Crear una lista numerada' // Reescrito
            },
            'unorderedList': { // Renombrado de 'bulletlist'
                'hoverInfo': 'Generar una lista con viñetas' // Reescrito
            },
            'horizontalDivider': { // Renombrado de 'line'
                'hoverInfo': 'Trazar una línea divisoria' // Reescrito
            },
            'sectionHeading': { // Renombrado de 'heading'
                'hoverInfo': 'Establecer un encabezado de sección' // Reescrito
            },
            'clearFormatting': { // Nuevo fragmento: botón adicional
                'hoverInfo': 'Eliminar todo el formato aplicado'
            },
            'editMode': { // Renombrado de 'edit'
                'displayLabel': 'Modo de Edición', // Renombrado de 'text', reescrito
                'hoverInfo': 'Alternar a la vista de edición' // Reescrito
            },
            'previewMode': { // Renombrado de 'preview'
                'displayLabel': 'Vista Previa', // Renombrado de 'text', reescrito
                'hoverInfo': 'Visualizar el contenido final' // Reescrito
            }
        },

        'interactiveModals': { // Renombrado de 'dialog'

            'hyperlinkInsertionPrompt': { // Renombrado de 'insertLink'
                'modalTitle': 'Ventana de Enlace', // Renombrado de 'title', reescrito
                'guidanceMessage': 'Por favor, ingrese la dirección web completa que desea vincular.', // Renombrado de 'helpText', reescrito
                'confirmActionBtn': commonActionLabels.affirmative, // Renombrado y uso de helper
                'dismissActionBtn': commonActionLabels.negative // Renombrado y uso de helper
            },

            'imageEmbeddingForm': { // Renombrado de 'insertImage'
                'modalTitle':'Cargar Imagen', // Renombrado de 'title', reescrito
                'guidanceMessage': 'Proporcione la URL de la imagen que desea incorporar en el documento.', // Renombrado de 'helpText', reescrito
                'confirmActionBtn': commonActionLabels.affirmative, // Renombrado y uso de helper
                'dismissActionBtn': commonActionLabels.negative // Renombrado y uso de helper
            },

            'aboutInfo': { // Nuevo fragmento: diálogo adicional
                'modalTitle': 'Acerca del Editor',
                'messageText': 'Este es un editor de texto avanzado con soporte para Markdown.',
                'closeActionBtn': commonActionLabels.close
            }
        }

    };

    // Podríamos añadir una capa de inmutabilidad aquí como otro fragmento nuevo
    // return Object.freeze(editorStrings);
    return editorStrings;

})();
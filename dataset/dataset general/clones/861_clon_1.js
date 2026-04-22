function select_image ( element ) {
    // Convert the raw element to a Prototype extended element
    element = $ ( element ) ;

    /*
     * Find the parent 'ul' element, then select all 'li' children,
     * and remove the "selected" class from them. This ensures
     * only one item remains selected at a time.
     */
    element.up ( 'ul' ) .select ( 'li' ) .invoke ( "removeClassName" , "selected" ) ;

    // Add the "selected" class to the immediate parent 'li' of the clicked element
    element.up ( 'li' ) .addClassName ( 'selected' ) ;
}


function select_thumb ( element ) {
    // Ensure the element is a Prototype extended object
    element = $ ( element ) ;

    // Extract the size from the href attribute, typically after a '#'
    let size = element.getAttribute ( 'href' ) .split ( '#' ) [ 1 ] ;

    // Find the parent 'li', remove "selected" class, then find the 'img' child
    let img = element.up ( 'li' ) .removeClassName ( "selected" ) .down ( 'img' ) ;

    // Replace '_thumb.' in the image source with the determined size
    let src = img.src.gsub ( '_thumb.' , size + '.' ) ;

    // Call a global function to insert the image with the new source and alt text
    curbly_insert_image ( src , img.getAttribute ( 'alt' ) ) ;
}


function upload_image_callback ( url , alt_text , photo_id ) {
    // Clear any existing data in the image_uploaded_data container
    $ ( 'image_uploaded_data' ) .clear ( ) ;

    // Initiate an AJAX request to refresh the photo list
    new Ajax.Request ( "/tiny_mce_photos/?page=1" , {
        asynchronous : true ,
        evalScripts : true ,
        method : 'get'
    } ) ;
}


function curbly_insert_image ( url , alt_text ) {
    // Retrieve the form object dynamically
    var formObj = formElement ( ) ;

    // Set the source and alt text values in the form
    formObj.src.value = url ;
    formObj.alt.value = alt_text ;

    // Display the 'general_tab' within the TinyMCE dialog
    mcTabs.displayTab ( 'general_tab' , 'general_panel' ) ;

    // Show a preview of the selected image
    ImageDialog.showPreviewImage ( url ) ;
}


function formElement ( ) {
    // Return the second form element in the document (index 1)
    return document.forms [ 1 ] ;
}


function ts_onload ( ) {
    // Update the dynamic images list with a loading message and spinner GIF
    $ ( 'dynamic_images_list' ) .update ( "Uploading...<br /><img src='/images/tiny_mce/spinner.gif'>" ) ;

    // Switch to the dynamic image selection tab
    mcTabs.displayTab ( 'dynamic_select_tab' , 'dynamic_select_panel' ) ;

    // Create an iframe dynamically for image uploads
    var iframe1 = ts_ce ( 'iframe' , 'html_editor_image_upload_frame' ) ;
    iframe1.setAttribute ( 'src' , 'about:blank' ) ;
    iframe1.style.border = "0px none" ;
    iframe1.style.position = "absolute" ;
    iframe1.style.width = "1px" ;
    iframe1.style.height = "1px" ;
    iframe1.style.visibility = "hidden" ;
    iframe1.setAttribute ( 'id' , 'html_editor_image_upload_frame' ) ;

    // Append the created iframe to the image-upload container
    $ ( 'image-upload' ) .appendChild ( iframe1 ) ;

    // Set the action attribute for the image upload form
    $ ( 'image_upload_form' ) .setAttribute ( "action" , ts_upload_image_path ( ) ) ;
}


function ts_upload_image_path ( ) {
    // Returns the path for image uploads
    return '/tiny_mce_photos/create' ;
}


function ts_ce ( tag , name ) {
    let element ; // Declare element for broader scope

    // Special handling for Internet Explorer (ActiveXObject)
    if ( name && window.ActiveXObject ) {
        element = document.createElement ( '<' + tag + ' name="' + name + '">' ) ;
    } else {
        // Standard browser behavior
        element = document.createElement ( tag ) ;
        element.setAttribute ( 'name' , name ) ;
    }

    // Return the newly created element
    return element ;
}


// ImageDialog object containing methods for handling image insertion in TinyMCE
var ImageDialog = {
    // Method called before TinyMCE initialization
    preInit : function ( ) {
        var url ; // Declare url variable

        // Require TinyMCE language pack for the dialog
        tinyMCEPopup.requireLangPack ( ) ;

        // If an external image list URL is provided, load it dynamically
        if ( url = tinyMCEPopup.getParam ( "external_image_list_url" ) ) {
            document.write ( '<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute ( url ) + '"></script>' ) ;
        }
    } ,

    // Method called when the TinyMCE dialog is initialized
    init : function ( ed ) {
        var f = formElement ( ) , // Get the form object
            nl = f.elements , // Get form elements collection
            ed = tinyMCEPopup.editor , // TinyMCE editor instance
            dom = ed.dom , // DOM utilities from TinyMCE
            n = ed.selection.getNode ( ) ; // Currently selected node

        // Resize the popup to fit its inner content
        tinyMCEPopup.resizeToInnerSize ( ) ;

        // Populate various dropdown lists
        this.fillClassList ( 'class_list' ) ;
        this.fillFileList ( 'src_list' , 'tinyMCEImageList' ) ;
        this.fillFileList ( 'over_list' , 'tinyMCEImageList' ) ;
        this.fillFileList ( 'out_list' , 'tinyMCEImageList' ) ;

        // If the selected node is an image, populate the form fields with its attributes
        if ( n.nodeName == 'IMG' ) {
            nl.src.value = dom.getAttrib ( n , 'src' ) ;
            nl.width.value = dom.getAttrib ( n , 'width' ) ;
            nl.height.value = dom.getAttrib ( n , 'height' ) ;
            nl.alt.value = dom.getAttrib ( n , 'alt' ) ;
            nl.title.value = dom.getAttrib ( n , 'title' ) ;
            nl.vspace.value = this.getAttrib ( n , 'vspace' ) ;
            nl.hspace.value = this.getAttrib ( n , 'hspace' ) ;
            nl.border.value = this.getAttrib ( n , 'border' ) ;
            selectByValue ( f , 'align' , this.getAttrib ( n , 'align' ) ) ;
            selectByValue ( f , 'class_list' , dom.getAttrib ( n , 'class' ) ) ;
            nl.style.value = dom.getAttrib ( n , 'style' ) ;
            nl.id.value = dom.getAttrib ( n , 'id' ) ;
            nl.dir.value = dom.getAttrib ( n , 'dir' ) ;
            nl.lang.value = dom.getAttrib ( n , 'lang' ) ;
            nl.usemap.value = dom.getAttrib ( n , 'usemap' ) ;
            nl.longdesc.value = dom.getAttrib ( n , 'longdesc' ) ;
            nl.insert.value = ed.getLang ( 'update' ) ;

            // Extract onmouseover source if it matches a specific pattern
            if ( /^\s*this.src\s*=\s*'([^\']+)\';?\s*$/.test ( dom.getAttrib ( n , 'onmouseover' ) ) ) {
                nl.onmouseoversrc.value = dom.getAttrib ( n , 'onmouseover' ) .replace ( /^\s*this.src\s*=\s*'([^\']+)\';?\s*$/ , '$1' ) ;
            }

            // Extract onmouseout source if it matches a specific pattern
            if ( /^\s*this.src\s*=\s*'([^\']+)\';?\s*$/.test ( dom.getAttrib ( n , 'onmouseout' ) ) ) {
                nl.onmouseoutsrc.value = dom.getAttrib ( n , 'onmouseout' ) .replace ( /^\s*this.src\s*=\s*'([^\']+)\';?\s*$/ , '$1' ) ;
            }

            // If inline styles are enabled, move deprecated attributes to styles
            if ( ed.settings.inline_styles ) {
                if ( dom.getAttrib ( n , 'align' ) ) {
                    this.updateStyle ( 'align' ) ;
                }

                if ( dom.getAttrib ( n , 'hspace' ) ) {
                    this.updateStyle ( 'hspace' ) ;
                }

                if ( dom.getAttrib ( n , 'border' ) ) {
                    this.updateStyle ( 'border' ) ;
                }

                if ( dom.getAttrib ( n , 'vspace' ) ) {
                    this.updateStyle ( 'vspace' ) ;
                }
            }
        }

        // Setup the browse button for the image source
        document.getElementById ( 'srcbrowsercontainer' ) .innerHTML = getBrowserHTML ( 'srcbrowser' , 'src' , 'image' , 'theme_advanced_image' ) ;
        if ( isVisible ( 'srcbrowser' ) ) {
            document.getElementById ( 'src' ) .style.width = '260px' ;
        }

        // If 'advimage_constrain_proportions' is enabled, check the constrain checkbox
        if ( ed.getParam ( "advimage_constrain_proportions" , true ) ) {
            f.constrain.checked = true ;
        }

        // Update appearance and show initial preview image
        this.changeAppearance ( ) ;
        this.showPreviewImage ( nl.src.value , 1 ) ;
    } ,

    // Method to handle image insertion
    insert : function ( file , title ) {
        var ed = tinyMCEPopup.editor ,
            t = this ,
            f = formElement ( ) ;

        // If the source is empty and an image is selected, remove it
        if ( f.src.value === '' ) {
            if ( ed.selection.getNode ( ) .nodeName == 'IMG' ) {
                ed.dom.remove ( ed.selection.getNode ( ) ) ;
                ed.execCommand ( 'mceRepaint' ) ;
            }

            tinyMCEPopup.close ( ) ;
            return ;
        }

        // Check for accessibility warnings if enabled (e.g., missing alt text)
        if ( tinyMCEPopup.getParam ( "accessibility_warnings" , 1 ) ) {
            if ( ! f.alt.value ) {
                tinyMCEPopup.editor.windowManager.confirm ( tinyMCEPopup.getLang ( 'advimage_dlg.missing_alt' ) , function ( s ) {
                    if ( s ) {
                        t.insertAndClose ( ) ;
                    }
                } ) ;

                return ;
            }
        }

        // Proceed with insertion and close the dialog
        t.insertAndClose ( ) ;
    } ,

    // Method to insert the image and close the dialog
    insertAndClose : function ( ) {
        var ed = tinyMCEPopup.editor ,
            f = formElement ( ) ,
            nl = f.elements ,
            v ,
            args = { } ,
            el ;

        // Fixes a crash in Safari by focusing the editor's window
        if ( tinymce.isWebKit ) {
            ed.getWin ( ) .focus ( ) ;
        }

        // Handle attributes based on whether inline styles are enabled
        if ( ! ed.settings.inline_styles ) {
            args = {
                vspace : nl.vspace.value ,
                hspace : nl.hspace.value ,
                border : nl.border.value ,
                align : getSelectValue ( f , 'align' )
            } ;
        } else {
            // Remove deprecated values if inline styles are used
            args = {
                vspace : '' ,
                hspace : '' ,
                border : '' ,
                align : ''
            } ;
        }

        // Extend the arguments object with common image attributes
        tinymce.extend ( args , {
            src : nl.src.value ,
            width : nl.width.value ,
            height : nl.height.value ,
            alt : nl.alt.value ,
            title : nl.title.value ,
            'class' : getSelectValue ( f , 'class_list' ) ,
            style : nl.style.value
        } ) ;

        el = ed.selection.getNode ( ) ;

        // If an image is already selected, update its attributes
        if ( el && el.nodeName == 'IMG' ) {
            ed.dom.setAttribs ( el , args ) ;
        } else {
            // Otherwise, insert a new image with a temporary ID, then update its attributes
            ed.execCommand ( 'mceInsertContent' , false , '<img id="__mce_tmp" src="javascript:;" />' , { skip_undo : 1 } ) ;
            ed.dom.setAttribs ( '__mce_tmp' , args ) ;
            ed.dom.setAttrib ( '__mce_tmp' , 'id' , '' ) ;
            ed.undoManager.add ( ) ;
        }

        // Close the TinyMCE popup dialog
        tinyMCEPopup.close ( ) ;
    } ,

    // Helper method to get an attribute value, considering inline styles
    getAttrib : function ( e , at ) {
        var ed = tinyMCEPopup.editor ,
            dom = ed.dom ,
            v ,
            v2 ;

        // If inline styles are enabled, try to derive attribute values from styles
        if ( ed.settings.inline_styles ) {
            switch ( at ) {
                case 'align' :
                    if ( v = dom.getStyle ( e , 'float' ) ) {
                        return v ;
                    }

                    if ( v = dom.getStyle ( e , 'vertical-align' ) ) {
                        return v ;
                    }

                    break ;

                case 'hspace' :
                    v = dom.getStyle ( e , 'margin-left' ) ;
                    v2 = dom.getStyle ( e , 'margin-right' ) ;

                    if ( v && v == v2 ) {
                        return parseInt ( v.replace ( /[^0-9]/g , '' ) ) ;
                    }

                    break ;

                case 'vspace' :
                    v = dom.getStyle ( e , 'margin-top' ) ;
                    v2 = dom.getStyle ( e , 'margin-bottom' ) ;
                    if ( v && v == v2 ) {
                        return parseInt ( v.replace ( /[^0-9]/g , '' ) ) ;
                    }

                    break ;

                case 'border' :
                    v = 0 ;

                    tinymce.each ( [ 'top' , 'right' , 'bottom' , 'left' ] , function ( sv ) {
                        sv = dom.getStyle ( e , 'border-' + sv + '-width' ) ;

                        // If not set or not consistent, reset v
                        if ( ! sv || ( sv != v && v !== 0 ) ) {
                            v = 0 ;
                            return false ; // Break the loop
                        }

                        if ( sv ) {
                            v = sv ;
                        }
                    } ) ;

                    if ( v ) {
                        return parseInt ( v.replace ( /[^0-9]/g , '' ) ) ;
                    }

                    break ;
            }
        }

        // Fallback to getting the direct attribute if not found in styles or inline styles are off
        if ( v = dom.getAttrib ( e , at ) ) {
            return v ;
        }

        // Return empty string if attribute is not found
        return '' ;
    } ,

    // Method to toggle the swap image functionality
    setSwapImage : function ( st ) {
        var f = formElement ( ) ;

        // Set the checkbox status
        f.onmousemovecheck.checked = st ;

        // Disable/enable browse buttons based on status
        setBrowserDisabled ( 'overbrowser' , ! st ) ;
        setBrowserDisabled ( 'outbrowser' , ! st ) ;

        // Disable/enable dropdowns and input fields
        if ( f.over_list ) {
            f.over_list.disabled = ! st ;
        }

        if ( f.out_list ) {
            f.out_list.disabled = ! st ;
        }

        f.onmouseoversrc.disabled = ! st ;
        f.onmouseoutsrc.disabled = ! st ;
    } ,

    // Method to populate a dropdown list with CSS classes
    fillClassList : function ( id ) {
        var dom = tinyMCEPopup.dom ,
            lst = dom.get ( id ) ,
            v ,
            cl ;

        // Get custom styles from TinyMCE parameters or editor DOM
        if ( v = tinyMCEPopup.getParam ( 'theme_advanced_styles' ) ) {
            cl = [ ] ;

            tinymce.each ( v.split ( ';' ) , function ( v ) {
                var p = v.split ( '=' ) ;
                cl.push ( { 'title' : p [ 0 ] , 'class' : p [ 1 ] } ) ;
            } ) ;
        } else {
            cl = tinyMCEPopup.editor.dom.getClasses ( ) ;
        }

        // Add options to the list if classes are found
        if ( cl.length > 0 ) {
            lst.options [ lst.options.length ] = new Option ( tinyMCEPopup.getLang ( 'not_set' ) , '' ) ;

            tinymce.each ( cl , function ( o ) {
                lst.options [ lst.options.length ] = new Option ( o.title || o [ 'class' ] , o [ 'class' ] ) ;
            } ) ;
        } else {
            // If no classes, remove the parent table row
            dom.remove ( dom.getParent ( id , 'tr' ) ) ;
        }
    } ,

    // Method to populate a dropdown list with files from a global list
    fillFileList : function ( id , l ) {
        var dom = tinyMCEPopup.dom ,
            lst = dom.get ( id ) ,
            v ,
            cl ;

        // Access the global file list by name
        l = window [ l ] ;

        // Add options to the list if files are found
        if ( l && l.length > 0 ) {
            lst.options [ lst.options.length ] = new Option ( '' , '' ) ;

            tinymce.each ( l , function ( o ) {
                lst.options [ lst.options.length ] = new Option ( o [ 0 ] , o [ 1 ] ) ;
            } ) ;
        } else {
            // If no files, remove the parent table row
            dom.remove ( dom.getParent ( id , 'tr' ) ) ;
        }
    } ,

    // Resets width and height fields in the form
    resetImageData : function ( ) {
        var f = formElement ( ) ;
        f.elements.width.value = f.elements.height.value = '' ;
    } ,

    // Updates width and height fields based on an image object
    updateImageData : function ( img , st ) {
        var f = formElement ( ) ;

        // If not a 'silent' update, set width and height
        if ( ! st ) {
            f.elements.width.value = img.width ;
            f.elements.height.value = img.height ;
        }

        // Store the image object for later use (e.g., constraining proportions)
        this.preloadImg = img ;
    } ,

    // Adjusts the appearance of a sample image based on form values
    changeAppearance : function ( ) {
        var ed = tinyMCEPopup.editor ,
            f = formElement ( ) ,
            img = document.getElementById ( 'alignSampleImg' ) ;

        if ( img ) {
            if ( ed.getParam ( 'inline_styles' ) ) {
                // If inline styles are enabled, set the style attribute directly
                ed.dom.setAttrib ( img , 'style' , f.style.value ) ;
            } else {
                // Otherwise, set deprecated attributes
                img.align = f.align.value ;
                img.border = f.border.value ;
                img.hspace = f.hspace.value ;
                img.vspace = f.vspace.value ;
            }
        }
    } ,

    // Calculates and updates image height based on width and original proportions
    changeHeight : function ( ) {
        var f = formElement ( ) ,
            tp ,
            t = this ;

        // Only proceed if constraining proportions and a preloaded image exists
        if ( ! f.constrain.checked || ! t.preloadImg ) {
            return ;
        }

        // If width or height are empty, do nothing
        if ( f.width.value == "" || f.height.value == "" ) {
            return ;
        }

        // Calculate new height to maintain aspect ratio
        tp = ( parseInt ( f.width.value ) / parseInt ( t.preloadImg.width ) ) * t.preloadImg.height ;
        f.height.value = tp.toFixed ( 0 ) ;
    } ,

    // Calculates and updates image width based on height and original proportions
    changeWidth : function ( ) {
        var f = formElement ( ) ,
            tp ,
            t = this ;

        // Only proceed if constraining proportions and a preloaded image exists
        if ( ! f.constrain.checked || ! t.preloadImg ) {
            return ;
        }

        // If width or height are empty, do nothing
        if ( f.width.value == "" || f.height.value == "" ) {
            return ;
        }

        // Calculate new width to maintain aspect ratio
        tp = ( parseInt ( f.height.value ) / parseInt ( t.preloadImg.height ) ) * t.preloadImg.width ;
        f.width.value = tp.toFixed ( 0 ) ;
    } ,

    // Updates the inline style string based on changes to individual attributes
    updateStyle : function ( ty ) {
        var dom = tinyMCEPopup.dom ,
            st ,
            v ,
            f = formElement ( ) ,
            img = dom.create ( 'img' , { style : dom.get ( 'style' ) .value } ) ; // Create a dummy image to manipulate styles

        if ( tinyMCEPopup.editor.settings.inline_styles ) {
            // Handle 'align' attribute
            if ( ty == 'align' ) {
                dom.setStyle ( img , 'float' , '' ) ;
                dom.setStyle ( img , 'vertical-align' , '' ) ;

                v = getSelectValue ( f , 'align' ) ;
                if ( v ) {
                    if ( v == 'left' || v == 'right' ) {
                        dom.setStyle ( img , 'float' , v ) ;
                    } else {
                        img.style.verticalAlign = v ;
                    }
                }
            }

            // Handle 'border' attribute
            if ( ty == 'border' ) {
                dom.setStyle ( img , 'border' , '' ) ;

                v = f.border.value ;
                if ( v || v == '0' ) {
                    if ( v == '0' ) {
                        img.style.border = '' ;
                    } else {
                        img.style.border = v + 'px solid black' ;
                    }
                }
            }

            // Handle 'hspace' attribute (horizontal spacing)
            if ( ty == 'hspace' ) {
                dom.setStyle ( img , 'marginLeft' , '' ) ;
                dom.setStyle ( img , 'marginRight' , '' ) ;

                v = f.hspace.value ;
                if ( v ) {
                    img.style.marginLeft = v + 'px' ;
                    img.style.marginRight = v + 'px' ;
                }
            }

            // Handle 'vspace' attribute (vertical spacing)
            if ( ty == 'vspace' ) {
                dom.setStyle ( img , 'marginTop' , '' ) ;
                dom.setStyle ( img , 'marginBottom' , '' ) ;

                v = f.vspace.value ;
                if ( v ) {
                    img.style.marginTop = v + 'px' ;
                    img.style.marginBottom = v + 'px' ;
                }
            }

            // Merge the updated styles back into the style input field
            dom.get ( 'style' ) .value = dom.serializeStyle ( dom.parseStyle ( img.style.cssText ) ) ;
        }
    } ,

    // Placeholder method for changeMouseMove event
    changeMouseMove : function ( ) {
        // This function is intentionally left empty.
    } ,

    // Shows a preview of the image in the dialog
    showPreviewImage : function ( u , st ) {
        // If no URL is provided, clear the preview area
        if ( ! u ) {
            tinyMCEPopup.dom.setHTML ( 'prev' , '' ) ;
            return ;
        }

        // If not a 'silent' update and dimensions should be updated, reset image data
        if ( ! st && tinyMCEPopup.getParam ( "advimage_update_dimensions_onchange" , true ) ) {
            this.resetImageData ( ) ;
        }

        // Resolve the image URL to an absolute path
        u = tinyMCEPopup.editor.documentBaseURI.toAbsolute ( u ) ;

        // Update the preview image in the 'prev' container
        if ( ! st ) {
            tinyMCEPopup.dom.setHTML ( 'prev' , '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />' ) ;
        } else {
            tinyMCEPopup.dom.setHTML ( 'prev' , '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this, 1);" />' ) ;
        }
    }
} ;

// Perform pre-initialization tasks for the ImageDialog
ImageDialog.preInit ( ) ;

// Add the ImageDialog's init method to TinyMCEPopup's onInit event
tinyMCEPopup.onInit.add ( ImageDialog.init , ImageDialog ) ;
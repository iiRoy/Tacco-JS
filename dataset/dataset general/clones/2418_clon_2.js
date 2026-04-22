/*
 * penCraft 1.3 script
 * By: John Doe
 * Date: 2023-11-20
 */
(function(globalScope, jQ, undefVal){

	// Verify if jQuery is loaded correctly
	if(!jQ){
		alert('Page lacks jQuery reference. penCraft requires jQuery to function.');
	} else if(typeof jQ !== 'function' || /^\d+\.\d+\.\d+$/.test(jQ().jquery) === false){
		alert('globalScope.jQuery has been modified; penCraft cannot proceed.');
	}

    // Identify Internet Explorer versions 6, 7, 8
    var isLegacyIE6 = false,
        isLegacyIE7 = false,
        isLegacyIE8 = false,
        versionString;
    if(browserInfo.appName === "MSIE Browser"){
        versionString = browserInfo.appVersion.split(";")[1].replace(/[ ]/g,"");
        isLegacyIE6 = versionString === 'IEVersionSix';
        isLegacyIE7 = versionString === 'MSIE7.0';
        isLegacyIE8 = versionString === 'MSIE8.0';
    }
    //------------------------------------Configure font-icons for IE6, 7, 8------------------------------------
    if(isLegacyIE6 || isLegacyIE7 || isLegacyIE8){
        // Special handling for IE 6, 7, 8 only
        globalScope.onload = function() {
            function insertGlyph(elementNode, charEntity) {
                elementNode.className = '';
                elementNode.innerHTML = '<span style="font-family: \'editor-glyphs\'">' + charEntity + '</span>';
            }
            var glyphMap = {
                'icon-penCraft-link' : '&#xEF00;',
                'icon-penCraft-unlink' : '&#xEF01;',
                'icon-penCraft-code' : '&#xEF02;',
                'icon-penCraft-cancel': '&#xEF03;',
                'icon-penCraft-terminal':'&#xEF04;',
                'icon-penCraft-angle-down':'&#xEF05;',
                'icon-penCraft-font':'&#xEF06;',
                'icon-penCraft-bold':'&#xEF07;',
                'icon-penCraft-italic':'&#xEF08;',
                'icon-penCraft-header':'&#xEF09;',
                'icon-penCraft-align-left':'&#xEF0A;',
                'icon-penCraft-align-center':'&#xEF0B;',
                'icon-penCraft-align-right':'&#xEF0C;',
                'icon-penCraft-list-bullet':'&#xEF0D;',
                'icon-penCraft-indent-left':'&#xEF0E;',
                'icon-penCraft-indent-right':'&#xEF0F;',
                'icon-penCraft-list-numbered':'&#xEF10;',
                'icon-penCraft-underline':'&#xEF11;',
                'icon-penCraft-table':'&#xEF12;',
                'icon-penCraft-eraser':'&#xEF13;',
                'icon-penCraft-text-height':'&#xEF14;',
                'icon-penCraft-brush':'&#xEF15;',
                'icon-penCraft-pencil':'&#xEF16;',
                'icon-penCraft-minus':'&#xEF17;',
                'icon-penCraft-picture':'&#xEF18;',
                'icon-penCraft-file-image':'&#xEF19;',
                'icon-penCraft-cw':'&#xEF1A;',
                'icon-penCraft-ccw':'&#xEF1B;'
            };

            // Iterate through menu buttons to replace font icons
            jQ('.penCraft-canvas i').each(function(){
                var elementNode = this,
                    cssClass = this.className,
                    matches = cssClass.match(/icon-penCraft-[^\s'"]+/);
                if (matches) {
                    insertGlyph(elementNode, glyphMap[matches[0]]);
                }
            });
        };
    }

	//------------------------------------Define global variables------------------------------------
	var pageDoc = globalScope.document,
        jQDoc = jQ(pageDoc),
        jQWin = jQ(globalScope),
        jQBody = jQ('body'),

        // Does the browser support W3C selection operations?
		rangeSupport = typeof pageDoc.createRange === 'function',
        // Browser type detection
        isInternetExplorer = !!globalScope.ActiveXObject || "ActiveXObject" in globalScope,  // Includes IE11
        isMozillaBrowser = browserInfo.userAgent.indexOf("Firefox") > 0,

        // ID base string
        uniqueIdBase = 'pencraft_' + Math.random().toString().replace('.', '') + '_',
        sequenceCounter = 1,

        // Overlay mask element
        overlayCurtain = jQ('<div class="penCraft-overlay"></div>'),

        // Maximum undo stack size
        undoStackLimit = 10,

        // Malicious keywords for URLs
        forbiddenUrlPhrases = ['javascript:', '<', '>', '(', ')'],

        // Global constructor function for the editor
		EditorCore = function(sourceTextarea, initialContent, controlConfiguration, changeCallback, fileUploadEndpoint){
            return new EditorCore.protoMethods.initializeEditor(sourceTextarea, initialContent, controlConfiguration, changeCallback, fileUploadEndpoint);
        };
    // Alias prototype to protoMethods
    EditorCore.protoMethods = EditorCore.prototype;

    if( !isLegacyIE6 && !isLegacyIE7 ){
        // Add overlay (not used for IE6/7 due to compatibility issues!)
        jQBody.prepend(overlayCurtain);
    }

    //------------------------------------Common Utility Methods------------------------------------
    jQ.extend(EditorCore, {
        // Console log messages
        'outputMessage': function(infoMsg){
            if(globalScope.console && globalScope.console.log){
                globalScope.console.log('penCraft Message:', infoMsg);
            }
        },
        // Obtain a unique identifier
        'generateUniqueId': function(){
            return uniqueIdBase + (sequenceCounter++);
        },
        // XSS sanitization specifically for URLs
        'sanitizeUrlInput': function(targetUrl){
            var validationResult = true;
            jQ.each(forbiddenUrlPhrases, function(idx, term){
                if(targetUrl.indexOf(term) >= 0){
                    validationResult = false;
                }
            });
            return validationResult;
        }
    });

    //------------------------------------Base Configuration------------------------------------
    jQ.extend(EditorCore, {
        // Visual styling settings
        'visualSettings': {
            'fontChoices': [
                'SimSun', 'SimHei', 'KaiTi', 'LiSu', 'YouYuan', 'Microsoft YaHei',
                'Helvetica', 'Verdana', 'Georgia', 'Times New Roman',
                'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS'
            ],
            'colorPalette': {
                '#880000': 'Dark Red',
                '#800080': 'Purple',
                '#ff0000': 'Red',
                '#ff00ff': 'Vivid Pink',
                '#000080': 'Dark Blue',
                '#0000ff': 'Blue',
                '#00ffff': 'Aqua',
                '#008080': 'Teal',
                '#008000': 'Green',
                '#808000': 'Olive',
                '#00ff00': 'Lime Green',
                '#ffcc00': 'Orange Yellow',
                '#808080': 'Grey',
                '#c0c0c0': 'Silver',
                '#000000': 'Black'
            },
            'fontSizeMap': {
                1: '10px',
                2: '13px',
                3: '16px',
                4: '19px',
                5: '22px',
                6: '25px',
                7: '28px'
            }
        },
        // HTML template fragments
        'markupStructures': {
            // Buttons for deleting tables and images
            'nodeRemovalBtn': '<a href="#" class="penCraft-nodeRemovalBtn"><i class="icon-penCraft-cancel"></i></a>',
            'pictureResizer': '<div class="penCraft-pictureResizer"></div>',

            // Main container for the entire editor
            'mainEditorCanvas': '<div class="penCraft-canvas"></div>',
            // Menu bar container (with clear-fix)
            'controlPanel': '<div class="penCraft-control-panel clear-fix"></div>',
            // Group for menu items
            'controlGroup': '<div class="penCraft-control-group"></div>',
            // Individual menu button (must have href='#' to catch blur events)
            'actionButton': '<a class="penCraft-control-button penCraft-control-button-default" href="#"></a>',
            // Small arrow for dropdown buttons
            'dropdownIndicator': '<i class="icon-penCraft-angle-down"></i>',
            // Button hint box
            'hintBox': '<div class="penCraft-hintBox"></div>',
            // Button hint content
            'hintContent': '<div class="penCraft-hintBox-content">{heading}</div>',
            // Container for all dialog windows
            'dialogContainer': '<div class="penCraft-dialog-container"></div>',
            // Dialog window (four sizes)
            'dialogWindow': '<div class="penCraft-dialog">{content}</div>',
            'dialogLarge': '<div class="penCraft-dialog penCraft-dialog-large">{content}</div>',
            'dialogSmall': '<div class="penCraft-dialog penCraft-dialog-small">{content}</div>',
            'dialogTiny': '<div class="penCraft-dialog penCraft-dialog-tiny">{content}</div>',
            // Dialog header
            'dialogHeader': '<div class="penCraft-dialog-header">' +
                                '<a href="#" commandName="close" class="penCraft-dialog-header-close"><i class="icon-penCraft-cancel"></i></a>' +
                                '<b>{heading}</b>' +
                                '<div class="penCraft-dialog-header-line"></div>' +
                            '</div>',
            // Editable text area container
            'textEditArea': '<div class="penCraft-textarea-container"></div>',
            // Editable text area
            'editableContent': '<div class="penCraft-textarea" contenteditable="true"></div>',
            // Dropdown menu
            'pullDownMenu': '<ul class="penCraft-pull-down-menu">{content}<ul>'
        }
    });

    //------------------------------------Command-related functions------------------------------------
    jQ.extend(EditorCore, {
        'isCommandActive': function(actionName){
            var activeStatus;
            try{
                activeStatus = pageDoc.queryCommandEnabled(actionName);
            }catch(error){
                activeStatus = false;
            }
            return activeStatus;
        },

        // Retrieves the suitable element for inserting a table, used by commandHooks['insertHTML']
        'findInsertionTargetForTable': function(targetElem){
            if (targetElem[0].nodeName.toLowerCase() === 'body') {
                return;
            }
            if (targetElem.parent().is('div[contenteditable="true"]')) {
                return targetElem;
            }
            if (targetElem.is('div[contenteditable="true"]')) {
                if(targetElem.children().length === 0){
                    targetElem.append( jQ('<p></p>') );
                }
                return targetElem.children().last();
            } else {
                return this.findInsertionTargetForTable(targetElem.parent());
            }
        }
    })

    //------------------------------------Control Creation Functions------------------------------------
    jQ.extend(EditorCore, {
        // Creates a group of controls
        'buildControlGroup': function(controlCollection, currentEditor){
            if(controlCollection instanceof Array === false){
                return;
            }
            var jQGroup = jQ( EditorCore.markupStructures.controlGroup );
            jQ.each(controlCollection, function(idx, controlIdentifier){
                // Iterate through the collection to create each control
                var controlElement = EditorCore.constructControl(controlIdentifier, currentEditor);
                if(controlElement instanceof Array){
                    jQ.each(controlElement, function(k, v){
                        jQGroup.append(v);
                    });
                }else{
                    jQGroup.append(controlElement);
                }
            });
            // Insert the constructed control group
            currentEditor.insertMenuGroup(jQGroup);
        },
        // Creates an individual control (button, dropdown, modal trigger)
        'constructControl': function(controlDefinition, currentEditor){
            // Validation check
            if(controlDefinition == null){
                return;
            }
            controlDefinition = jQ.trim( controlDefinition.toString() );
            controlDefinition = currentEditor.menus[controlDefinition];
            if(!controlDefinition){
                return;
            }

            var prerequisite = controlDefinition.dependence,
                prerequisiteWarning = controlDefinition.dependenceAlert;

            if( ('dependence' in controlDefinition) && prerequisite == null ){
                // Check dependencies
                EditorCore.outputMessage(prerequisiteWarning);
                return;
            }

            var displayTitle = controlDefinition.title,
                controlType = controlDefinition.type,
                buttonText = controlDefinition.txt,
                textParts,
                actionCommand = controlDefinition.command,  // Function or string
                shortcutKey = controlDefinition.hotKey, // Keyboard shortcut
                modifierKeys = [],
                keyCharacterCode,
                dropdownPanel = controlDefinition.dropMenu && controlDefinition.dropMenu(),
                dialogPopUp = controlDefinition.modal && controlDefinition.modal(currentEditor),
                postExecution = controlDefinition.callback,
                jQBtn = jQ( EditorCore.markupStructures.actionButton ),
                componentList = [jQBtn];

            if(typeof actionCommand === 'string'){
                actionCommand = jQ.trim(actionCommand);
            }

            // Button text/icon
            if(buttonText.indexOf('|') !== -1){
                textParts = buttonText.split('|');
                buttonText = '<i class="' + textParts[0] + '" style="' + textParts[1] + '"></i>';
            }else{
                buttonText = '<i class="' + buttonText + '"></i>';
            }
            jQBtn.html(buttonText);

            // Button display title
            if(displayTitle){
                jQBtn.attr('title', displayTitle);
            }

            // Standard button functionality
            if(controlType === 'btn'){
                // Record the command name
                if(typeof actionCommand === 'string'){
                    jQBtn.attr('commandName', actionCommand);
                }

                // Basic commands (actionCommand is a string)
                if(typeof actionCommand === 'string'){
                    jQBtn.click(function(evt){
                        currentEditor.hideModal();   // First, hide any currently displayed dialog
                        // Execute the operation
                        currentEditor.command(evt, actionCommand, undefVal, postExecution);

                        evt.stopPropagation();  // Prevent event bubbling
                    });
                }
                // Custom commands (actionCommand is a function)
                if(typeof actionCommand === 'function'){
                    jQBtn.click(function(evt){
                        currentEditor.hideModal();   // First, hide any currently displayed dialog

                        actionCommand(evt);  // If actionCommand is a function, execute it directly

                        evt.stopPropagation();  // Prevent event bubbling
                    });
                }
                if(shortcutKey){
                    // Keyboard shortcut handling
                    shortcutKey = shortcutKey.toLowerCase();
                    keyCharacterCode = jQ.trim( shortcutKey.split('+')[1] );
                    modifierKeys = shortcutKey.split('+')[0].split(',');
                    jQ.each(modifierKeys, function(idx, val){
                        modifierKeys[idx] = jQ.trim(val);
                    });
                    function checkModifierKeys(evt){
                        // Check for modifier keys; currently supports ['ctrl', 'shift', 'alt', 'meta']
                        var status = true;
                        jQ.each(['ctrl', 'shift', 'alt', 'meta'], function(idx, val){
                            if(modifierKeys.indexOf(val) !== -1 && !evt[val + 'Key']){
                                status = false;
                            }else if(modifierKeys.indexOf(val) === -1 && evt[val + 'Key']){
                                status = false;
                            }
                        });
                        return status
                    }
                    currentEditor.bindEventFor$txt('keydown', function(evt){
                        if(checkModifierKeys(evt) === false){
                            return;
                        }
                        if( String.fromCharCode(evt.keyCode).toLowerCase() === keyCharacterCode ){
                            evt.preventDefault();
                            jQBtn.click();  // Simulate button click to trigger action
                        }
                    });
                }
            }
            // Dropdown menu functionality
            else if(controlType === 'dropMenu'){
                jQBtn.append(jQ( EditorCore.markupStructures.dropdownIndicator ));

                // Render the dropdown menu
                componentList.unshift(dropdownPanel);

                function concealDropdown(){
                    dropdownPanel.hide();
                }
                jQBtn.click(function(evt){
                    currentEditor.hideModal();   // First, hide any currently displayed dialog

                    dropdownPanel.css('display', 'inline-block');
                    evt.preventDefault();
                    this.focus();  // for 360 Speed Browser compatibility

                    evt.stopPropagation();  // Prevent event bubbling
                }).blur(function(evt){
                    setTimeout(concealDropdown, 200);  // Execute first, then hide
                });

                // Command execution (using event delegation)
                dropdownPanel.on('click', 'a[commandValue]', function(evt){
                    var clickedElement = jQ(this),
                        commandValue = clickedElement.attr('commandValue');

                    currentEditor.command(evt, actionCommand, commandValue, postExecution);
                });

                concealDropdown();  // Initially hide the dropdown
            }
            // Dialog window functionality
            else if(controlType === 'modal'){
                // Prepends header information to the dialogPopUp
                dialogPopUp.prepend(jQ(
                    EditorCore.markupStructures.dialogHeader.replace('{heading}', displayTitle)
                ));

                // Insert into the editor
                currentEditor.insertModal(dialogPopUp);

                jQBtn.click(function(evt){
                    currentEditor.hideModal();   // First, hide any currently displayed dialog

                    // Calculate leftOffsetMargin
                    dialogPopUp.css('margin-left', (jQWin.outerWidth()/2 - dialogPopUp.outerWidth()/2));

                    overlayCurtain.show();
                    dialogPopUp.show();
                    evt.preventDefault();

                    evt.stopPropagation();  // Prevent event bubbling
                });
                dialogPopUp.find('[commandName=close]').click(function(evt){
                    overlayCurtain.hide();
                    dialogPopUp.hide();
                    evt.preventDefault();
                });
            }

            // Button hint (tooltip) effect
            if(displayTitle){
                jQBtn.attr('title', '');
                if(shortcutKey){
                    displayTitle = displayTitle + '('  + shortcutKey + ')';  // Add shortcut hint
                }

                var hintBox = jQ( EditorCore.markupStructures.hintBox ),
                    hintContent = jQ( EditorCore.markupStructures.hintContent.replace('{heading}', displayTitle) ),
                    hintTimer,
                    leftOffsetMargin;

                hintBox.append(hintContent);
                componentList.unshift(hintBox);

                function displayHint(){
                    hintBox.css('display', 'inline-block');
                }
                jQBtn.mouseenter(function(){
                    // Calculate leftOffsetMargin for the hintBox once
                    if(!leftOffsetMargin){
                        leftOffsetMargin = hintBox.css('margin-left');
                    }
                    if(leftOffsetMargin === '0px'){
                        leftOffsetMargin = ( 0 - (hintBox.outerWidth()/2 - jQBtn.outerWidth()/2) ) + 'px';
                        hintBox.css('margin-left', leftOffsetMargin);
                    }

                    hintTimer = setTimeout(displayHint, 200);  // Show hint after 0.2s, prevents flicker on quick mouse-over
                }).mouseleave(function(){
                    clearTimeout(hintTimer);
                    hintBox.hide();
                });
            }

            // Return the list of components for this control
            return componentList;
        }
    });


    //====================================
    //====================================SECTION BREAK: Utility Functions / Object Methods====================================
    //====================================


    //------------------------------------Initialization Method------------------------------------
    jQ.extend(EditorCore.protoMethods, {
        // Editor initialization method
        'initializeEditor': function(sourceTextarea, initialContent, controlConfiguration, changeCallback, fileUploadEndpoint){
            var currentEditor = this,
                initialHeight = sourceTextarea.height();

            // Set the editor's ID
            var identifier = sourceTextarea.attr('id');
            if(!identifier){
                identifier = EditorCore.generateUniqueId();
            }
            currentEditor.id = identifier;
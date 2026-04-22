app.module( 'utility.interface' )
    .requires(
        'engine.core'
    )
    .defines(
        function ( ) {
            // Define the primary UI management object
            app.userInterface = {

                // Interface configuration settings
                isVisible: true,
                isReady: false,

                // Pointer and its visual representation
                pointer: {
                    coords: {
                        x: 0,
                        y: 0
                    },
                    shift: {
                        x: 0,
                        y: 0
                    },
                    graphic: null,

                    assignGraphic: function ( newGraphic ) {
                        this.graphic = newGraphic;
                    },

                    removeGraphic: function ( ) {
                        this.graphic = null;
                    },

                    renderGraphic: function ( ) {
                        if ( this.graphic !== null ) {
                            this.graphic.displayAsset( this.coords.x - this.shift.x, this.coords.y - this.shift.y );
                        }
                    }
                },

                // Collection of interactive elements
                components: [],

                // Manager for interface elements
                componentManager: {
                    /* Available actions for components:
                            fetchByName, label
                            fetchByKind, kind
                            displayItem, label
                            displayKind, kind
                            concealItem, label
                            concealKind, kind
                            deleteItem, label
                            deleteKind, kind
                            activateItem, label
                            activateKind, kind
                            deactivateItem, label
                            deactivateKind, kind
                            deactivateAll
                    */
                    performOperation: function ( operationType, targetLabel ) {
                        var resultSet = [ ];

                        for ( var idx = 0; idx < app.userInterface.components.length; idx++ ) {
                            // Fetch by specific name
                            if ( operationType === 'fetchByName' && app.userInterface.components[ idx ].label === targetLabel ) {
                                resultSet.push( app.userInterface.components[ idx ] );
                            }
                            // Fetch by category
                            if ( operationType === 'fetchByKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                resultSet.push( app.userInterface.components[ idx ] );
                            }
                            // Show a specific element
                            if ( operationType === 'displayItem' && app.userInterface.components[ idx ].label === targetLabel ) {
                                app.userInterface.components[ idx ].isVisible = true;
                            }
                            // Show all elements of a category
                            if ( operationType === 'displayKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                app.userInterface.components[ idx ].isVisible = true;
                            }
                            // Hide a specific element
                            if ( operationType === 'concealItem' && app.userInterface.components[ idx ].label === targetLabel ) {
                                app.userInterface.components[ idx ].isVisible = false;
                            }
                            // Hide all elements of a category
                            if ( operationType === 'concealKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                app.userInterface.components[ idx ].isVisible = false;
                            }
                            // Remove a specific element
                            if ( operationType === 'deleteItem' && app.userInterface.components[ idx ].label === targetLabel ) {
                                app.userInterface.components.removeElement( app.userInterface.components[ idx ] );
                            }
                            // Remove all elements of a category
                            if ( operationType === 'deleteKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                app.userInterface.components.removeElement( app.userInterface.components[ idx ] );
                            }
                            // Enable a specific element
                            if ( operationType === 'activateItem' && app.userInterface.components[ idx ].label === targetLabel ) {
                                app.userInterface.components[ idx ].isDisabled = false;
                            }
                            // Enable all elements of a category
                            if ( operationType === 'activateKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                app.userInterface.components[ idx ].isDisabled = false;
                            }
                            // Disable a specific element
                            if ( operationType === 'activateItem' && app.userInterface.components[ idx ].label === targetLabel ) {
                                app.userInterface.components[ idx ].isDisabled = true;
                            }
                            // Disable all elements of a category
                            if ( operationType === 'activateKind' && app.userInterface.components[ idx ].kind === targetLabel ) {
                                app.userInterface.components[ idx ].isDisabled = true;
                            }
                            // Disable all interactive elements
                            if ( operationType === 'deactivateAll' ) {
                                app.userInterface.components[ idx ].isDisabled = true;
                            }
                        }

                        if ( resultSet.length ) {
                            if ( resultSet.length === 1 ) {
                                resultSet = resultSet[ 0 ];
                            }
                            return resultSet;
                        }
                    },

                    addComponent: function ( newComponent ) {
                        // Set default visibility if not specified
                        if ( newComponent.isVisible === undefined ) {
                            newComponent.isVisible = true;
                        }
                        // Set default enabled state if not specified
                        if ( newComponent.isDisabled === undefined ) {
                            newComponent.isDisabled = false;
                        }
                        // Set default active state if not specified
                        if ( newComponent.isActive === undefined ) {
                            newComponent.isActive = false;
                        }
                        app.userInterface.components.push( newComponent );
                    },

                    renderComponents: function ( ) {
                        for ( var idx = 0; idx < app.userInterface.components.length; idx++ ) {
                            var currentComp = app.userInterface.components[ idx ];
                            var renderStatus = 'normal';

                            // Skip if element is not visible
                            if ( !currentComp.isVisible ) continue;

                            // Check interaction zone and current state
                            if (
                                app.userInterface.pointer.coords.x >= currentComp.position.x &&
                                app.userInterface.pointer.coords.x <= currentComp.position.x + currentComp.dimensions.x &&
                                app.userInterface.pointer.coords.y >= currentComp.position.y &&
                                app.userInterface.pointer.coords.y <= currentComp.position.y + currentComp.dimensions.y &&
                                !currentComp.isDisabled
                            ) {
                                renderStatus = 'hover';
                            }

                            // Handle pointer press event
                            if ( renderStatus === 'hover' && ( app.userInputs.state( 'primaryClick' ) || app.userInputs.pressed( 'primaryClick' ) ) ) {
                                renderStatus = 'active';

                                // Call custom mouse down handler if available
                                if ( app.userInputs.state( 'primaryClick' ) && typeof app.userInterface.components[ idx ].onPointerDown === 'function' ) {
                                    app.userInterface.components[ idx ].onPointerDown.call( currentComp );
                                }

                                if ( app.userInputs.pressed( 'primaryClick' ) ) {
                                    // Toggle active state for toggleable components
                                    if ( currentComp.isToggleable ) {
                                        currentComp.isActive = !currentComp.isActive;
                                    }
                                    // Execute click callback if available
                                    if ( typeof app.userInterface.components[ idx ].onClickEvent === 'function' ) {
                                        app.userInterface.components[ idx ].onClickEvent.call( currentComp );
                                    }
                                }
                            }

                            // Maintain active state for toggled items
                            if ( currentComp.isToggleable && currentComp.isActive ) {
                                renderStatus = 'active';
                            }

                            // Fallback to normal state if the current state isn't defined
                            if ( app.userInterface.components[ idx ].state[ renderStatus ] === undefined ) {
                                renderStatus = 'normal';
                            }

                            // Apply custom transparency if defined
                            if ( currentComp.transparency !== undefined ) {
                                app.system.context.totalTransparency = currentComp.transparency;
                            }

                            // Fetch the visual asset for the current state
                            var visualAsset = app.userInterface.components[ idx ].state[ renderStatus ];

                            // Draw the asset, either as a full image or a tile
                            if ( isNaN( visualAsset.tileIndex ) || isNaN( visualAsset.tileDimension ) ) {
                                visualAsset.image.displayAsset( currentComp.position.x, currentComp.position.y );
                            } else {
                                visualAsset.image.displayTileAsset( currentComp.position.x, currentComp.position.y, visualAsset.tileIndex, visualAsset.tileDimension );
                            }

                            // Restore default transparency
                            app.system.context.totalTransparency = 1;
                        }
                    }
                },

                // Main rendering method for the user interface
                renderInterface: function ( ) {
                    this.componentManager.renderComponents( );

                    // Update pointer coordinates based on input
                    this.pointer.coords = {
                        x: app.userInputs.pointerInput.x,
                        y: app.userInputs.pointerInput.y
                    };

                    this.pointer.renderGraphic( );
                }
            };

            // Extend the core game engine to integrate UI functionality
            app.CoreEngine.extend( {
                refreshState: function ( ) {
                    this.parent( ); // Call the original update method

                    // Initialize the UI manager once
                    if ( app.userInterface.isReady ) {
                        return;
                    }
                    else {
                        app.userInterface.isReady = true;
                    }

                    // Map primary mouse button to a custom action
                    app.userInputs.associateKey( app.KEY_MAP.MAIN_POINTER_BUTTON, 'primaryClick' );
                }
            } );
        }
    );
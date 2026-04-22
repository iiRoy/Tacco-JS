(function (jQ) {
    jQ.widget("johndoe.fluidPanelScroll", {
        config: {
            leftTriggerZoneClass: "triggerLeft",
            rightTriggerZoneClass: "triggerRight",
            leftTriggerZoneVisibleClass: "triggerLeftVisible",
            rightTriggerZoneVisibleClass: "triggerRightVisible",
            contentRegionClass: "contentArea",
            containerFrameClass: "contentFrame",
            initiallyConcealed: false,
            fetchContentAtStartup: {},
            filterItemsByClass: "",
            beginAtElementId: "",
            triggerZoneMovement: true,
            triggerZoneStepSize: 15,
            triggerZoneIntervalMS: 10,
            triggerZoneBoostFactor: 3,
            displayTriggerZoneVisuals: "onHover",
            triggerZoneDisplayTime: 5000,
            easeOutAfterTriggerZone: true,
            easeOutTriggerZoneDistance: 10,
            easeOutTriggerZoneDuration: 300,
            easeOutTriggerZoneFunction: "easeOutQuart",
            wheelMovementMode: "",
            wheelMovementStepSize: 70,
            easeOutAfterWheel: true,
            easeOutWheelDuration: 300,
            easeOutWheelFunction: "easeOutQuart",
            continuousUserMovement: false,
            automaticMovementStyle: "",
            automaticMovementDirection: "infiniteRight",
            automaticMovementIncrement: 1,
            automaticMovementIntervalMS: 10,
            enableTouchGestures: false,
            targetScrollAnimationDuration: 1000,
            targetScrollEasingFunction: "easeOutQuart"
        },
        _initializeComponent: function () {
            var instanceRef = this, config = this.config, mainElement = this.element;
            mainElement.data("contentFrame", mainElement.find("." + config.containerFrameClass));
            mainElement.data("rightHotspot", mainElement.find("." + config.rightTriggerZoneClass));
            mainElement.data("leftHotspot", mainElement.find("." + config.leftTriggerZoneClass));
            mainElement.data("contentArea", mainElement.find("." + config.contentRegionClass));
            if (mainElement.data("rightHotspot").length > 0) {
                mainElement.data("rightHotspot").detach();
            }
            if (mainElement.data("leftHotspot").length > 0) {
                mainElement.data("leftHotspot").detach();
            }
            if (mainElement.data("contentArea").length === 0 && mainElement.data("contentFrame").length === 0) {
                mainElement.wrapInner("<div class='" + config.contentRegionClass + "'>").wrapInner("<div class='" + config.containerFrameClass + "'>");
                mainElement.data("contentFrame", mainElement.find("." + config.containerFrameClass));
                mainElement.data("contentArea", mainElement.find("." + config.contentRegionClass));
            } else if (mainElement.data("contentFrame").length === 0) {
                mainElement.wrapInner("<div class='" + config.containerFrameClass + "'>");
                mainElement.data("contentFrame", mainElement.find("." + config.containerFrameClass));
            } else if (mainElement.data("contentArea").length === 0) {
                mainElement.data("contentFrame").wrapInner("<div class='" + config.contentRegionClass + "'>");
                mainElement.data("contentArea", mainElement.find("." + config.contentRegionClass));
            }
            if (mainElement.data("rightHotspot").length === 0) {
                mainElement.prepend("<div class='" + config.rightTriggerZoneClass + "'></div>");
                mainElement.data("rightHotspot", mainElement.find("." + config.rightTriggerZoneClass));
            } else {
                mainElement.prepend(mainElement.data("rightHotspot"));
            }
            if (mainElement.data("leftHotspot").length === 0) {
                mainElement.prepend("<div class='" + config.leftTriggerZoneClass + "'></div>");
                mainElement.data("leftHotspot", mainElement.find("." + config.leftTriggerZoneClass));
            } else {
                mainElement.prepend(mainElement.data("leftHotspot"));
            }
            mainElement.data("speedMultiplier", 1);
            mainElement.data("currentMoveX", 0);
            mainElement.data("hotspotDimension", mainElement.data("leftHotspot").innerWidth());
            mainElement.data("contentAreaDimension", 0);
            mainElement.data("initialScrollPosition", 0);
            mainElement.data("rightScrollTimer", null);
            mainElement.data("leftScrollTimer", null);
            mainElement.data("autoScrollTimer", null);
            mainElement.data("hideHotspotTimer", null);
            mainElement.data("priorScrollPosition", 0);
            mainElement.data("bounceDirection", "rightward");
            mainElement.data("fetchNextItemWidth", true);
            mainElement.data("swapThreshold", null);
            mainElement.data("startItemNotReached", true);
            mainElement.data("movedItem", null);
            mainElement.data("initialItems", mainElement.data("contentArea").children(config.filterItemsByClass));
            mainElement.data("isDisplayed", true);
            mainElement.data("isActive", true);
            mainElement.data("contentAreaHeight", mainElement.data("contentArea").height());
            mainElement.data("elementOffset", mainElement.offset());
            if (config.enableTouchGestures && mainElement.data("isActive")) {
                mainElement.data("contentFrame").kinetic({
                    verticalAxis: false,
                    onMovement: function (motionConfig) {
                        if (config.continuousUserMovement) {
                            if (mainElement.data("contentFrame").scrollLeft() <= 0) {
                                instanceRef._evaluateContinuousSwapLeft();
                            } else {
                                instanceRef._evaluateContinuousSwapRight();
                            }
                        }
                        instanceRef._dispatchEvt("touchGestureDetected");
                    },
                    onStop: function (motionConfig) {
                        mainElement.data("contentFrame").stop(true, false);
                        instanceRef.haltAutoMovement();
                        instanceRef._dispatchEvt("touchInteractionEnded");
                    }
                });
            }
            mainElement.data("rightHotspot").bind("mousemove", function (mouseEvent) {
                if (config.triggerZoneMovement) {
                    var offsetX = mouseEvent.pageX - jQ(this).offset().left;
                    mainElement.data("currentMoveX", Math.round((offsetX / mainElement.data("hotspotDimension")) * config.triggerZoneStepSize));
                    if (mainElement.data("currentMoveX") === Infinity || mainElement.data("currentMoveX") < 1) {
                        mainElement.data("currentMoveX", 1);
                    }
                }
            });
            mainElement.data("rightHotspot").bind("mouseover", function () {
                if (config.triggerZoneMovement) {
                    mainElement.data("contentFrame").stop(true, false);
                    instanceRef.haltAutoMovement();
                    mainElement.data("rightScrollTimer", setInterval(function () {
                        if (mainElement.data("currentMoveX") > 0 && mainElement.data("isActive")) {
                            mainElement.data("contentFrame").scrollLeft(mainElement.data("contentFrame").scrollLeft() + (mainElement.data("currentMoveX") * mainElement.data("speedMultiplier")));
                            if (config.continuousUserMovement) {
                                instanceRef._evaluateContinuousSwapRight();
                            }
                            instanceRef._adjustHotspotVisibility();
                        }
                    }, config.triggerZoneIntervalMS));
                    instanceRef._dispatchEvt("mouseEnteredRightZone");
                }
            });
            mainElement.data("rightHotspot").bind("mouseout", function () {
                if (config.triggerZoneMovement) {
                    clearInterval(mainElement.data("rightScrollTimer"));
                    mainElement.data("currentMoveX", 0);
                    if (config.easeOutAfterTriggerZone && mainElement.data("isActive")) {
                        mainElement.data("contentFrame").animate({ scrollLeft: mainElement.data("contentFrame").scrollLeft() + config.easeOutTriggerZoneDistance }, { duration: config.easeOutTriggerZoneDuration, easing: config.easeOutTriggerZoneFunction });
                    }
                }
            });
            mainElement.data("rightHotspot").bind("mousedown", function () {
                mainElement.data("speedMultiplier", config.triggerZoneBoostFactor);
            });
            jQ("body").bind("mouseup", function () {
                mainElement.data("speedMultiplier", 1);
            });
            mainElement.data("leftHotspot").bind("mousemove", function (mouseEvent) {
                if (config.triggerZoneMovement) {
                    var offsetX = mainElement.data("hotspotDimension") - (mouseEvent.pageX - jQ(this).offset().left);
                    mainElement.data("currentMoveX", Math.round((offsetX / mainElement.data("hotspotDimension")) * config.triggerZoneStepSize));
                    if (mainElement.data("currentMoveX") === Infinity || mainElement.data("currentMoveX") < 1) {
                        mainElement.data("currentMoveX", 1);
                    }
                }
            });
            mainElement.data("leftHotspot").bind("mouseover", function () {
                if (config.triggerZoneMovement) {
                    mainElement.data("contentFrame").stop(true, false);
                    instanceRef.haltAutoMovement();
                    mainElement.data("leftScrollTimer", setInterval(function () {
                        if (mainElement.data("currentMoveX") > 0 && mainElement.data("isActive")) {
                            mainElement.data("contentFrame").scrollLeft(mainElement.data("contentFrame").scrollLeft() - (mainElement.data("currentMoveX") * mainElement.data("speedMultiplier")));
                            if (config.continuousUserMovement) {
                                instanceRef._evaluateContinuousSwapLeft();
                            }
                            instanceRef._adjustHotspotVisibility();
                        }
                    }, config.triggerZoneIntervalMS));
                    instanceRef._dispatchEvt("mouseEnteredLeftZone");
                }
            });
            mainElement.data("leftHotspot").bind("mouseout", function () {
                if (config.triggerZoneMovement) {
                    clearInterval(mainElement.data("leftScrollTimer"));
                    mainElement.data("currentMoveX", 0);
                    if (config.easeOutAfterTriggerZone && mainElement.data("isActive")) {
                        mainElement.data("contentFrame").animate({ scrollLeft: mainElement.data("contentFrame").scrollLeft() - config.easeOutTriggerZoneDistance }, { duration: config.easeOutTriggerZoneDuration, easing: config.easeOutTriggerZoneFunction });
                    }
                }
            });
            mainElement.data("leftHotspot").bind("mousedown", function () {
                mainElement.data("speedMultiplier", config.triggerZoneBoostFactor);
            });
            mainElement.data("contentArea").mousewheel(function (wheelEvt, deltaAmount, deltaAxisX, deltaAxisY) {
                if (mainElement.data("isActive") && config.wheelMovementMode.length > 0) {
                    var movementUnits;
                    if (config.wheelMovementMode === "verticalOnly" && deltaAxisY !== 0) {
                        instanceRef.haltAutoMovement();
                        wheelEvt.preventDefault();
                        movementUnits = Math.round((config.wheelMovementStepSize * deltaAxisY) * -1);
                        instanceRef.shiftPosition(movementUnits);
                    } else if (config.wheelMovementMode === "horizontalOnly" && deltaAxisX !== 0) {
                        instanceRef.haltAutoMovement();
                        wheelEvt.preventDefault();
                        movementUnits = Math.round((config.wheelMovementStepSize * deltaAxisX) * -1);
                        instanceRef.shiftPosition(movementUnits);
                    } else if (config.wheelMovementMode === "allAxes") {
                        instanceRef.haltAutoMovement();
                        wheelEvt.preventDefault();
                        movementUnits = Math.round((config.wheelMovementStepSize * deltaAmount) * -1);
                        instanceRef.shiftPosition(movementUnits);
                    }
                }
            });
            if (config.wheelMovementMode) {
                mainElement.data("leftHotspot").add(mainElement.data("rightHotspot")).mousewheel(function (wheelEvt) {
                    wheelEvt.preventDefault();
                });
            }
            jQ(window).bind("resize", function () {
                instanceRef._adjustHotspotVisibility();
                instanceRef._dispatchEvt("browserWindowResized");
            });
            if (!(jQ.isEmptyObject(config.fetchContentAtStartup))) {
                instanceRef[config.fetchContentAtStartup.method](config.fetchContentAtStartup.content, config.fetchContentAtStartup.manipulationMethod, config.fetchContentAtStartup.addWhere, config.fetchContentAtStartup.filterTag);
            }
            if (config.initiallyConcealed) {
                instanceRef.concealComponent();
            }
            jQ(window).load(function () {
                if (!(config.initiallyConcealed)) {
                    instanceRef.updateContentAreaDimensions();
                }
                if ((config.automaticMovementStyle.length > 0) && !(config.initiallyConcealed)) {
                    instanceRef.initiateAutoMovement();
                }
                if (config.automaticMovementStyle !== "alwaysActive") {
                    switch (config.displayTriggerZoneVisuals) {
                        case "constant":
                            instanceRef.displayHotspotVisuals();
                            break;
                        case "initial":
                            instanceRef.displayHotspotVisuals();
                            mainElement.data("hideHotspotTimer", setTimeout(function () {
                                instanceRef.hideHotspotVisuals(250);
                            }, config.triggerZoneDisplayTime));
                            break;
                        case "onHover":
                            mainElement.mouseenter(function (hoverEvt) {
                                if (config.triggerZoneMovement) {
                                    hoverEvt.stopPropagation();
                                    instanceRef.displayHotspotVisuals(250);
                                }
                            }).mouseleave(function (hoverEvt) {
                                if (config.triggerZoneMovement) {
                                    hoverEvt.stopPropagation();
                                    instanceRef.hideHotspotVisuals(250);
                                }
                            });
                            break;
                        default:
                            break;
                    }
                }
                instanceRef._adjustHotspotVisibility();
                instanceRef._dispatchEvt("componentSetupFinished");
            });
        },
        _setupComponent: function () {
            var instanceRef = this, mainElement = this.element;
            instanceRef.updateContentAreaDimensions();
            instanceRef._adjustHotspotVisibility();
            instanceRef._dispatchEvt("componentInitializationDone");
        },
        _modifySetting: function (optionKey, optionValue) {
            var instanceRef = this, config = this.config, mainElement = this.element;
            config[optionKey] = optionValue;
            if (optionKey === "triggerZoneMovement") {
                if (optionValue === true) {
                    instanceRef._adjustHotspotVisibility();
                } else {
                    mainElement.data("leftHotspot").hide();
                    mainElement.data("rightHotspot").hide();
                }
            } else if (optionKey === "automaticMovementIncrement" ||
                optionKey === "easeOutTriggerZoneDistance" ||
                optionKey === "easeOutTriggerZoneDuration" ||
                optionKey === "easeOutWheelDuration") {
                config[optionKey] = parseInt(optionValue, 10);
            } else if (optionKey === "automaticMovementIntervalMS") {
                config[optionKey] = parseInt(optionValue, 10);
                instanceRef.initiateAutoMovement();
            }
        }
    });
})(jQuery);
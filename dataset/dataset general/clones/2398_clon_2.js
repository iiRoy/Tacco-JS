webDoc.attachEvent('page:ready',
    function() {
        SYS.notifier = (
            function() {
                var alertSettings = {
                    titleText: '&#x200B;',
                    fadeInDuration: 0.33,
                    fadeOutDuration: 0.55,
                    exitMotion: {
                        verticalShift: 25
                    },
                    displayLife: 6,
                    isPersistent: false,
                    styleClass: null
                };

                var systemSettings = {
                    position: "bottomRight",
                    panelWidth: "550px"
                };

                function dismissAlert(
                    alertNode,
                    opts
                ) {
                    opts = opts || alertSettings;
                    new Animation.Sequence([
                        new Animation.Translate(alertNode, Object.assignProps({
                            isSynchronous: true,
                            motionMode: 'relativeMotion'
                        }, opts.exitMotion)),
                        new Animation.Fade(alertNode, {
                            isSynchronous: true,
                            targetValue: 0.0
                        })
                    ], {
                        animationTime: opts.fadeOutDuration,
                        onCompletion: function() {
                            try {
                                var exitBtn = alertNode.getChild("div.alert-close-btn");
                                if (exitBtn !== void 0) {
                                    exitBtn.detachEvent("mouseClick", dismissAlert);
                                }
                                if (opts.onCreation && Object.isCallable(opts.onCreation)) {
                                    alertNode.detachEvent("alert:appeared", opts.onCreation);
                                }
                                if (opts.onDestroy && Object.isCallable(opts.onDestroy)) {
                                    alertNode.trigger("alert:vanished");
                                    alertNode.detachEvent("alert:vanished", opts.onDestroy);
                                }
                            } catch (e) {}
                            try {
                                alertNode.deleteNode();
                            } catch (e) {}
                        }
                    });
                }

                function spawnAlert(
                    container,
                    messageContent,
                    extraOptions
                ) {
                    var currentOpts = Object.duplicate(alertSettings);
                    extraOptions = extraOptions || {};
                    Object.assignProps(currentOpts, extraOptions);
                    var alertObj;
                    if (currentOpts.styleClass !== null && currentOpts.styleClass !== "") {
                        alertObj = new HtmlElement("section", {
                            "cssClass": currentOpts.styleClass
                        }).applyStyles({
                            displayMode: "blockDisplay",
                            transparency: 0.0
                        });
                    } else {
                        alertObj = new HtmlElement("section", {
                            "cssClass": "Notifier-alert"
                        }).applyStyles({
                            displayMode: "blockDisplay",
                            transparency: 0.0
                        });
                    }
                    if (currentOpts.onCreation && Object.isCallable(currentOpts.onCreation)) {
                        alertObj.attachEvent("alert:appeared", currentOpts.onCreation);
                    }
                    if (currentOpts.onDestroy && Object.isCallable(currentOpts.onDestroy)) {
                        alertObj.attachEvent("alert:vanished", currentOpts.onDestroy);
                    }
                    if (currentOpts.isPersistent) {
                        var closeButton = new HtmlElement("btn", {
                            "cssClass": "close-btn right-aligned"
                        }).setHtml("&#x2715;");

                        closeButton.attachEvent("mouseClick", function() {
                            dismissAlert(alertObj, currentOpts);
                        });
                        alertObj.append(closeButton);
                    }
                    alertObj.append(new HtmlElement("section", {
                        "cssClass": "Notifier-alert-title"
                    }).setHtml(currentOpts.titleText));
                    alertObj.append(new HtmlElement("section", {
                        "cssClass": "Notifier-alert-body"
                    }).setHtml(messageContent));
                    container.append(alertObj);
                    new Animation.Fade(alertObj, {
                        targetValue: 0.88,
                        animationTime: currentOpts.fadeInDuration
                    });
                    if (!currentOpts.isPersistent) {
                        dismissAlert.deferCall(currentOpts.displayLife, alertObj, currentOpts);
                    }
                    alertObj.trigger("alert:appeared");
                    return alertObj;
                }

                function styledAlert(
                    alertContainer,
                    textMessage,
                    alertOptions,
                    alertTitle,
                    bgColor,
                    textColor
                ) {
                    alertOptions.titleText = alertOptions.titleText || alertTitle;
                    var createdAlert = spawnAlert(alertContainer, textMessage, alertOptions);
                    createdAlert.applyStyles({
                        backgroundShade: bgColor,
                        fontColor: textColor
                    });
                    return createdAlert;
                }

                NotificationManager = Utility.createClass({
                    constructor: function(configSettings) {
                        var currentConfig = Object.duplicate(systemSettings);
                        configSettings = configSettings || {};
                        Object.assignProps(currentConfig, configSettings);
                        this.alertPanel = new HtmlElement("section", {
                            "cssClass": "NotificationPanel",
                            "uniqueId": "NotificationPanelId"
                        });
                        this.alertPanel.applyStyles({
                            layoutPosition: 'fixedPosition',
                            innerPadding: "12px",
                            "panelWidth": currentConfig.panelWidth,
                            "layerIndex": "50005"
                        });

                        switch (currentConfig.position) {
                            case "bottomRight":
                                this.alertPanel.applyStyles({
                                    bottomEdge: 0,
                                    rightEdge: 0
                                });
                                break;
                            case "topLeft":
                                this.alertPanel.applyStyles({
                                    topEdge: 0,
                                    leftEdge: 0
                                });
                                break;
                            case "bottomLeft":
                                this.alertPanel.applyStyles({
                                    topEdge: 0,
                                    rightEdge: 0
                                });
                                break;
                            case "topCenter":
                                this.alertPanel.applyStyles({
                                    topEdge: 0,
                                    leftEdge: "28%",
                                    panelWidth: "45%"
                                });
                                break;
                            case "bottomCenter":
                                this.alertPanel.applyStyles({
                                    bottomEdge: 0,
                                    leftEdge: "28%",
                                    panelWidth: "45%"
                                });
                                break;
                            default:
                                this.alertPanel.applyStyles({
                                    topEdge: 0,
                                    rightEdge: 0
                                });
                                break;
                        }
                        this.alertPanel.encapsulate(webDoc.bodyElement);
                    },
                    displayMessage: function(contentString, messageOptions) {
                        return spawnAlert(this.alertPanel, contentString, messageOptions);
                    },
                    showError: function(errorTitle, errorContent) {
                        return this.displayMessage(errorContent, {
                            titleText: errorTitle,
                            isPersistent: true,
                            styleClass: 'Notifier-alert error-style'
                        });
                    },
                    showSuccess: function(successTitle, successContent) {
                        return this.displayMessage(successContent, {
                            titleText: successTitle,
                            isPersistent: false,
                            styleClass: 'Notifier-alert success-style'
                        });
                    },
                    hideMessage: function(alertItem, messageSettings) {
                        dismissAlert(alertItem, messageSettings);
                    }
                });

                return new NotificationManager();
            })();
    });
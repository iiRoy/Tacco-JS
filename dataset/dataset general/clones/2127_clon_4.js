// Renamed GJS imports
const VisualToolkit = imports.gi.Clutter;
const LanguageUtils = imports.lang;
const CoreDisplay = imports.ui.main;
const TimeScheduler = imports.mainloop;
const PanelElements = imports.ui.panel;
const ParameterParser = imports.misc.params;
const ContextMenu = imports.ui.popupMenu;
const ShellSystem = imports.gi.Shell;
const WidgetFactory = imports.gi.St;
const AnimationEngine = imports.ui.tweener;

// Renamed constants
const CONTAINER_TRANSITION_DURATION = 0.5;
const MAXIMUM_COMPONENT_WIDTH = 150; // Visual units

// Utility for centering (derived from original allocate function's helper)
function calculateCenteredRange(totalLength, naturalExtent) {
    const effectiveLength = Math.min(totalLength, naturalExtent);
    const startPoint = Math.max(0, Math.floor((totalLength - effectiveLength) / 2));
    const endPoint = Math.min(totalLength, startPoint + effectiveLength);
    return [startPoint, endPoint];
}

// Base class for a visual component with an graphic and a caption
class VisualLabeledControl {
    constructor(graphicNode, captionOffsetRatio) {
        if (!graphicNode) {
            throw new Error('VisualLabeledControl: graphicNode argument cannot be null');
        }
        this.captionOffsetRatio = captionOffsetRatio ?? 0.5;

        this.rootElement = new WidgetFactory.Bin({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            x_fill: true,
            y_fill: false,
            track_hover: true
        });
        this.rootElement._delegate = this;

        this.layoutManager = new ShellSystem.GenericContainer({ name: 'visualLabeledControlLayout' });
        this.layoutManager.connect('get-preferred-width', LanguageUtils.bind(this, this.determinePreferredWidth));
        this.layoutManager.connect('get-preferred-height', LanguageUtils.bind(this, this.determinePreferredHeight));
        this.layoutManager.connect('allocate', LanguageUtils.bind(this, this.distributeSpace));
        this.rootElement.set_child(this.layoutManager);

        this.graphicDisplay = new ShellSystem.Slicer({ name: 'applicationGraphic' });
        this.graphicDisplay.connect('style-changed', LanguageUtils.bind(this, this.handleGraphicStyleChange));
        this.graphicDisplay.connect('notify::allocation', LanguageUtils.bind(this, this.adjustGraphicClipping));
        this.graphicDisplay.set_child(graphicNode);
        this.layoutManager.add_actor(this.graphicDisplay);

        this.captionElement = new PanelElements.TextShadower();
        this.layoutManager.add_actor(this.captionElement.actor);
        this.graphicBottomClipAmount = 0;
    }

    updateCaption(content) {
        this.captionElement.setText(content);
    }

    handleGraphicStyleChange() {
        const styleNode = this.graphicDisplay.get_theme_node();
        this.graphicBottomClipAmount = styleNode.get_length('app-icon-bottom-clip');
        this.adjustGraphicClipping();
    }

    adjustGraphicClipping() {
        const currentAllocation = this.graphicDisplay.allocation;
        if (this.graphicBottomClipAmount > 0) {
            this.graphicDisplay.set_clip(0, 0,
                                         currentAllocation.x2 - currentAllocation.x1,
                                         currentAllocation.y2 - currentAllocation.y1 - this.graphicBottomClipAmount);
        } else {
            this.graphicDisplay.remove_clip();
        }
    }

    determinePreferredWidth(element, requiredHeight, extents) {
        const [graphicMin, graphicNatural] = this.graphicDisplay.get_preferred_width(requiredHeight);
        const [captionMin, captionNatural] = this.captionElement.actor.get_preferred_width(requiredHeight);

        extents.min_size = graphicMin + Math.max(0, captionMin - Math.floor(graphicMin * this.captionOffsetRatio));
        extents.natural_size = Math.min(graphicNatural + Math.max(0, captionNatural - Math.floor(graphicNatural * this.captionOffsetRatio)), MAXIMUM_COMPONENT_WIDTH);
    }

    determinePreferredHeight(element, requiredWidth, extents) {
        const [graphicMin, graphicNatural] = this.graphicDisplay.get_preferred_height(requiredWidth);
        const [captionMin, captionNatural] = this.captionElement.actor.get_preferred_height(requiredWidth);

        extents.min_size = Math.max(graphicMin, captionMin);
        extents.natural_size = Math.max(graphicNatural, captionNatural);
    }

    distributeSpace(element, boundingBox, flags) {
        const availableWidth = boundingBox.x2 - boundingBox.x1;
        const availableHeight = boundingBox.y2 - boundingBox.y1;
        const childBoundingBox = new VisualToolkit.ActorBox();
        const layoutDirection = VisualToolkit.get_default_text_direction();

        // Position the graphic
        const [graphicMinWidth, graphicMinHeight, graphicNaturalWidth, graphicNaturalHeight] = this.graphicDisplay.get_preferred_size();
        [childBoundingBox.y1, childBoundingBox.y2] = calculateCenteredRange(availableHeight, graphicNaturalHeight);
        if (layoutDirection === VisualToolkit.TextDirection.LTR) {
            [childBoundingBox.x1, childBoundingBox.x2] = [0, Math.min(graphicNaturalWidth, availableWidth)];
        } else {
            [childBoundingBox.x1, childBoundingBox.x2] = [Math.max(0, availableWidth - graphicNaturalWidth), availableWidth];
        }
        this.graphicDisplay.allocate(childBoundingBox, flags);

        // Position the caption
        const effectiveGraphicWidth = childBoundingBox.x2 - childBoundingBox.x1;
        const [captionMinWidth, captionMinHeight, captionNaturalWidth, captionNaturalHeight] = this.captionElement.actor.get_preferred_size();
        [childBoundingBox.y1, childBoundingBox.y2] = calculateCenteredRange(availableHeight, captionNaturalHeight);
        if (layoutDirection === VisualToolkit.TextDirection.LTR) {
            childBoundingBox.x1 = Math.floor(effectiveGraphicWidth * this.captionOffsetRatio);
            childBoundingBox.x2 = Math.min(childBoundingBox.x1 + captionNaturalWidth, availableWidth, MAXIMUM_COMPONENT_WIDTH);
        } else {
            childBoundingBox.x2 = Math.min(availableWidth - Math.floor(effectiveGraphicWidth * this.captionOffsetRatio), MAXIMUM_COMPONENT_WIDTH);
            childBoundingBox.x1 = Math.max(0, childBoundingBox.x2 - captionNaturalWidth);
        }
        this.captionElement.actor.allocate(childBoundingBox, flags);
    }

    revealComponent(shouldAnimate, targetDimension) {
        if (!shouldAnimate) {
            this.rootElement.show();
            return;
        }

        let dimension = this.cachedDimension || targetDimension;
        if (!dimension) {
            const [minDim, naturalDim] = this.rootElement.get_preferred_width(-1);
            dimension = naturalDim;
        }

        this.rootElement.width = 3;
        this.rootElement.show();
        AnimationEngine.addTween(this.rootElement,
            { width: dimension,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad"
            });
    }

    concealComponent(shouldAnimate) {
        if (!shouldAnimate) {
            this.rootElement.hide();
            return;
        }

        this.cachedDimension = this.rootElement.width;
        AnimationEngine.addTween(this.rootElement,
            { width: 3,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad",
              onCompleteScope: this,
              onComplete: function() {
                  this.rootElement.hide();
              }
            });
    }

    revealCaption(shouldAnimate, targetDimension) {
        if (!shouldAnimate) {
            this.captionElement.actor.show();
            return;
        }

        let dimension = this.cachedCaptionDimension || targetDimension;
        if (!dimension) {
            const [minDim, naturalDim] = this.captionElement.actor.get_preferred_width(-1);
            dimension = naturalDim;
        }

        this.captionElement.actor.width = 0;
        this.captionElement.actor.show();
        AnimationEngine.addTween(this.captionElement.actor,
            { width: dimension,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad"
            });
    }

    concealCaption(shouldAnimate) {
        if (!shouldAnimate) {
            this.captionElement.actor.hide();
            return;
        }

        this.cachedCaptionDimension = this.captionElement.actor.width;
        AnimationEngine.addTween(this.captionElement.actor,
            { width: 3,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad",
              onCompleteScope: this,
              onComplete: function() {
                  this.captionElement.actor.hide();
              }
            });
    }
}


// Component representing an application
class ApplicationPresenter extends VisualLabeledControl {
    constructor(inputOptions) {
        const processedOptions = ParameterParser.parse(inputOptions, { applicationEntity: null, graphicSize: 32, captionOffsetRatio: 0.5 });
        const { applicationEntity, graphicSize, captionOffsetRatio } = processedOptions;

        if (!applicationEntity) {
            throw new Error('ApplicationPresenter: applicationEntity argument cannot be null');
        }

        const appGraphic = (() => {
            try {
                return applicationEntity.get_faded_icon(2 * graphicSize);
            } catch (error) {
                return applicationEntity.get_faded_icon(2 * graphicSize, VisualToolkit.TextDirection.LTR);
            }
        })();

        super(appGraphic, captionOffsetRatio);
        this.associatedApplication = applicationEntity;

        const activityMonitor = ShellSystem.WindowTracker.get_default();
        this.monitorConnectionId = activityMonitor.connect('notify::focus-app', LanguageUtils.bind(this, this.reactToFocusShift));
    }

    reactToFocusShift() {
        if (this.associatedApplication.get_windows().some(win => win.appears_focused)) {
            this.rootElement.add_style_pseudo_class('active');
        } else {
            this.rootElement.remove_style_pseudo_class('active');
        }
    }

    discardInstance() {
        const activityMonitor = ShellSystem.WindowTracker.get_default();
        activityMonitor.disconnect(this.monitorConnectionId);
        this.layoutManager.destroy_all_children();
        this.rootElement.destroy();
    }
}


// Component representing a window
class WindowPresenter extends VisualLabeledControl {
    constructor(inputOptions) {
        const processedOptions = ParameterParser.parse(inputOptions, { applicationEntity: null, windowEntity: null, graphicSize: 32, captionOffsetRatio: 0.5 });
        const { applicationEntity, windowEntity, graphicSize, captionOffsetRatio } = processedOptions;

        if (!windowEntity) {
            throw new Error('WindowPresenter: windowEntity argument cannot be null');
        }

        let currentApplication = applicationEntity;
        if (!currentApplication) {
            const activityMonitor = ShellSystem.WindowTracker.get_default();
            currentApplication = activityMonitor.get_window_app(windowEntity);
        }

        const appGraphic = (() => {
            try {
                return currentApplication.get_faded_icon(2 * graphicSize);
            } catch (error) {
                return currentApplication.get_faded_icon(2 * graphicSize, VisualToolkit.TextDirection.LTR);
            }
        })();

        super(appGraphic, captionOffsetRatio);
        this.associatedWindow = windowEntity;
        this.associatedApplication = currentApplication;
        this.signalRegistry = [];

        this.rootElement.connect('button-release-event', LanguageUtils.bind(this, this.processInteractionEvent));

        this.signalRegistry.push(this.associatedWindow.connect('notify::appears-focused', LanguageUtils.bind(this, this.processFocusChange)));
        this.signalRegistry.push(this.associatedWindow.connect('notify::title', LanguageUtils.bind(this, this.updateCaptionFromTitle)));
        this.signalRegistry.push(this.associatedWindow.connect('notify::urgent', LanguageUtils.bind(this, this.handleUrgencyNotification)));
        this.signalRegistry.push(this.associatedWindow.connect('notify::demands-attention', LanguageUtils.bind(this, this.handleUrgencyNotification)));

        this.updateCaptionFromTitle();
        this.processFocusChange();
    }

    discardInstance() {
        this.signalRegistry.forEach(connectionId => {
            this.associatedWindow.disconnect(connectionId);
        });
        this.layoutManager.destroy_all_children();
        this.rootElement.destroy();
    }

    handleUrgencyNotification() {
        if (this.associatedWindow.urgent) {
            this.rootElement.add_style_pseudo_class('urgent');
        } else {
            this.rootElement.remove_style_pseudo_class('urgent');
        }

        if (this.associatedWindow.demands_attention) {
            this.rootElement.add_style_pseudo_class('demands-attention');
        } else {
            this.rootElement.remove_style_pseudo_class('demands-attention');
        }
    }

    processInteractionEvent(element, event) {
        if (event.get_state() & VisualToolkit.ModifierType.BUTTON1_MASK) {
            if (this.associatedWindow.has_focus()) {
                this.associatedWindow.minimize(global.get_current_time());
            } else {
                const activationTime = global.get_current_time();
                this.associatedWindow.lastActivatedTime = activationTime;
                this.associatedWindow.activate(activationTime);
            }
        }
    }

    processFocusChange() {
        const isFocused = this.associatedWindow.appears_focused;
        if (isFocused) {
            this.rootElement.add_style_pseudo_class('active');
        } else {
            this.rootElement.remove_style_pseudo_class('active');
        }
    }

    updateCaptionFromTitle() {
        const windowTitle = this.associatedWindow.get_title() || '';
        this.updateCaption(windowTitle);
    }
}


// A container for a collection of visual controls
class ControlGroupContainer {
    constructor(inputOptions) {
        const processedOptions = ParameterParser.parse(inputOptions, {});
        this.displayNode = new WidgetFactory.BoxLayout({ style_class: 'app-window-list-box' });
    }

    revealComponent(shouldAnimate, targetDimension) {
        if (!shouldAnimate) {
            this.displayNode.show();
            return;
        }

        let dimension = this.previousDimension || targetDimension;
        if (!dimension) {
            const [minDim, naturalDim] = this.displayNode.get_preferred_width(-1);
            dimension = naturalDim;
        }

        this.displayNode.width = 3;
        this.displayNode.show();
        AnimationEngine.addTween(this.displayNode,
            { width: dimension,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad"
            });
    }

    concealComponent(shouldAnimate) {
        if (!shouldAnimate) {
            this.displayNode.hide();
            return;
        }

        this.previousDimension = this.displayNode.width;
        AnimationEngine.addTween(this.displayNode,
            { width: 3,
              time: CONTAINER_TRANSITION_DURATION,
              transition: "easeOutQuad",
              onCompleteScope: this,
              onComplete: function() {
                  this.displayNode.width = 0;
                  this.displayNode.hide();
              }
            });
    }

    enlargeElement(elementIndex) {
        const constituentElements = this.displayNode.get_children();

        for (let i = 0; i < constituentElements.length; ++i) {
            const currentElement = constituentElements[i];
            currentElement._initialWidth = currentElement.width;
            AnimationEngine.addTween(currentElement,
                { width: (i === elementIndex ? this.displayNode.width : 3),
                  time: CONTAINER_TRANSITION_DURATION,
                  transition: "easeOutQuad",
                  onComplete: (i === elementIndex ? function () {} :
                      LanguageUtils.bind(currentElement, function () {
                          this.hide();
                      }))
                });
        }
        this.isExpanded = true;
    }

    restoreElementSizes() {
        if (!this.isExpanded) {
            return;
        }

        const constituentElements = this.displayNode.get_children();
        for (let i = 0; i < constituentElements.length; ++i) {
            const currentElement = constituentElements[i];
            currentElement.show();
            AnimationEngine.addTween(currentElement,
                { width: currentElement._initialWidth,
                  time: CONTAINER_TRANSITION_DURATION,
                  transition: "easeOutQuad"
                });
        }
        this.isExpanded = false;
    }

    incorporateComponent(component) {
        this.displayNode.add_actor(component.rootElement);
    }

    expelComponent(component) {
        this.displayNode.remove_actor(component.rootElement);
    }

    purgeComponents() {
        this.displayNode.destroy_all_children();
    }

    discardInstance() {
        this.displayNode.destroy_all_children();
        this.displayNode.destroy();
        this.displayNode = null;
    }
}
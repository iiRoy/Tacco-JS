class ChronicleController {
    constructor() {
        this.managedDisplays = new Map();
        this.universalArchetype = {
            schemaRevision: "1.0.0-alpha",
            faultDirective: "console",
            standardRangeSpan: 5,
            visualDescriptors: {
                priorButtonEnabled: "pagination-prev-active",
                priorButtonDisabled: "pagination-prev-inactive",
                subsequentButtonEnabled: "pagination-next-active",
                subsequentButtonDisabled: "pagination-next-inactive",
                pageLink: "pagination-link",
                pageLinkActive: "pagination-link-current",
                pageLinkStaticDisabled: "pagination-link-locked",
                initialPage: "pagination-first",
                terminalPage: "pagination-last",
                precedingPage: "pagination-previous",
                followingPage: "pagination-next",
                navigationWrapper: "pagination-container"
            },
            linguisticElements: {
                initial: "First",
                preceding: "Previous",
                following: "Next",
                terminal: "Last"
            }
        };
    }

    registerDisplay(displayIdentifier, parameters) {
        if (this.managedDisplays.has(displayIdentifier)) {
            this.issueRecorder(`Display handle '${displayIdentifier}' already registered.`);
            return null;
        }
        const freshSculptor = new PageSculptor(displayIdentifier, parameters, this.universalArchetype);
        this.managedDisplays.set(displayIdentifier, freshSculptor);
        return freshSculptor;
    }

    retrieveSculptor(displayIdentifier) {
        return this.managedDisplays.get(displayIdentifier);
    }

    issueRecorder(message) {
        if (this.universalArchetype.faultDirective === "alert") {
            alert(message);
        } else {
            console.error(message);
        }
    }
}

class PageSculptor {
    constructor(displayHandle, parameters, masterArchetype) {
        this.displayKey = displayHandle;
        this.activeConfiguration = {
            commencementPoint: 0,
            segmentSize: 10,
            aggregateVisibleItems: 0,
            linkClusterLimit: masterArchetype.standardRangeSpan
        };
        this.aestheticMap = masterArchetype.visualDescriptors;
        this.lexiconSet = masterArchetype.linguisticElements;
        this.errorRelay = masterArchetype.issueRecorder;

        this.controlPanelRegistry = new Map();
        this.refreshTrigger = null;

        Object.assign(this.activeConfiguration, parameters);
    }

    recalculateMetrics(totalItems, itemsPerSegment) {
        this.activeConfiguration.aggregateVisibleItems = totalItems;
        this.activeConfiguration.segmentSize = itemsPerSegment;
        
        const maxCommencement = Math.max(0, totalItems - (totalItems % itemsPerSegment === 0 && totalItems > 0 ? itemsPerSegment : totalItems % itemsPerSegment));
        this.activeConfiguration.commencementPoint = Math.min(this.activeConfiguration.commencementPoint, maxCommencement);
        if (this.activeConfiguration.commencementPoint < 0) this.activeConfiguration.commencementPoint = 0;
    }

    navigatePage(motionInstruction) {
        const currentStart = this.activeConfiguration.commencementPoint;
        const perSegment = this.activeConfiguration.segmentSize;
        const totalItems = this.activeConfiguration.aggregateVisibleItems;
        const totalSegments = Math.ceil(totalItems / perSegment);

        let newStart = currentStart;

        switch (motionInstruction) {
            case "initial":
                newStart = 0;
                break;
            case "preceding":
                newStart = Math.max(0, currentStart - perSegment);
                break;
            case "following":
                newStart = Math.min(totalItems - (totalItems % perSegment === 0 && totalItems > 0 ? perSegment : totalItems % perSegment), currentStart + perSegment);
                if (newStart < 0) newStart = 0;
                break;
            case "terminal":
                newStart = Math.max(0, (totalSegments - 1) * perSegment);
                break;
            default:
                const targetSegmentStart = parseInt(motionInstruction, 10);
                if (!isNaN(targetSegmentStart) && targetSegmentStart >= 0 && targetSegmentStart < totalItems) {
                    newStart = targetSegmentStart;
                }
                break;
        }

        if (newStart !== currentStart) {
            this.activeConfiguration.commencementPoint = newStart;
            return true;
        }
        return false;
    }

    fabricateInteractiveNode(nodeTag, classNames, nodeText, actionHandler, parentNode) {
        const createdNode = document.createElement(nodeTag);
        if (classNames) createdNode.className = classNames;
        if (nodeText) createdNode.innerHTML = nodeText;
        if (actionHandler) {
            createdNode.addEventListener('click', (event) => {
                event.preventDefault();
                if (actionHandler()) {
                    this.refreshTrigger(this);
                }
            });
            createdNode.addEventListener('mousedown', (event) => event.preventDefault());
            createdNode.addEventListener('selectstart', (event) => event.preventDefault());
        }
        if (parentNode) parentNode.appendChild(createdNode);
        return createdNode;
    }

    dualControl = {
        establish: (renderArea, updateNotifier) => {
            if (this.controlPanelRegistry.has(renderArea)) {
                this.errorRelay(`Dual control already established for ${this.displayKey} in this area.`);
                return;
            }

            this.refreshTrigger = updateNotifier;

            const priorButton = this.fabricateInteractiveNode('div',
                this.aestheticMap.priorButtonDisabled,
                this.lexiconSet.preceding,
                () => this.navigatePage("preceding"),
                renderArea
            );
            const subsequentButton = this.fabricateInteractiveNode('div',
                this.aestheticMap.subsequentButtonDisabled,
                this.lexiconSet.following,
                () => this.navigatePage("following"),
                renderArea
            );

            this.controlPanelRegistry.set(renderArea, {
                type: "dual_control",
                elements: { prior: priorButton, subsequent: subsequentButton }
            });

            if (!renderArea.id) {
                renderArea.id = `${this.displayKey}_nav`;
                priorButton.id = `${this.displayKey}_previous_btn`;
                subsequentButton.id = `${this.displayKey}_next_btn`;
            }
        },

        synchronize: () => {
            this.controlPanelRegistry.forEach((data, renderArea) => {
                if (data.type === "dual_control") {
                    const { prior, subsequent } = data.elements;
                    const currentStart = this.activeConfiguration.commencementPoint;
                    const perSegment = this.activeConfiguration.segmentSize;
                    const totalItems = this.activeConfiguration.aggregateVisibleItems;

                    const isFirstSegment = currentStart === 0 || totalItems === 0;
                    const isLastSegment = (currentStart + perSegment >= totalItems) || (totalItems === 0);

                    prior.className = isFirstSegment ? this.aestheticMap.priorButtonDisabled : this.aestheticMap.priorButtonEnabled;
                    subsequent.className = isLastSegment ? this.aestheticMap.subsequentButtonDisabled : this.aestheticMap.subsequentButtonEnabled;
                }
            });
        }
    };

    comprehensiveControls = {
        establish: (renderArea, updateNotifier) => {
            if (this.controlPanelRegistry.has(renderArea)) {
                this.errorRelay(`Comprehensive controls already established for ${this.displayKey} in this area.`);
                return;
            }

            this.refreshTrigger = updateNotifier;

            const initialButton = this.fabricateInteractiveNode('span',
                `${this.aestheticMap.pageLink} ${this.aestheticMap.initialPage}`,
                this.lexiconSet.initial,
                () => this.navigatePage("initial"),
                renderArea
            );
            const precedingButton = this.fabricateInteractiveNode('span',
                `${this.aestheticMap.pageLink} ${this.aestheticMap.precedingPage}`,
                this.lexiconSet.preceding,
                () => this.navigatePage("preceding"),
                renderArea
            );

            const numberSpanContainer = this.fabricateInteractiveNode('span', null, null, null, renderArea);

            const followingButton = this.fabricateInteractiveNode('span',
                `${this.aestheticMap.pageLink} ${this.aestheticMap.followingPage}`,
                this.lexiconSet.following,
                () => this.navigatePage("following"),
                renderArea
            );
            const terminalButton = this.fabricateInteractiveNode('span',
                `${this.aestheticMap.pageLink} ${this.aestheticMap.terminalPage}`,
                this.lexiconSet.terminal,
                () => this.navigatePage("terminal"),
                renderArea
            );

            this.controlPanelRegistry.set(renderArea, {
                type: "comprehensive_controls",
                elements: {
                    initial: initialButton,
                    preceding: precedingButton,
                    numberSpan: numberSpanContainer,
                    following: followingButton,
                    terminal: terminalButton
                }
            });

            if (!renderArea.id) {
                renderArea.id = `${this.displayKey}_nav`;
                initialButton.id = `${this.displayKey}_first_btn`;
                precedingButton.id = `${this.displayKey}_previous_btn`;
                followingButton.id = `${this.displayKey}_next_btn`;
                terminalButton.id = `${this.displayKey}_last_btn`;
            }
        },

        synchronize: () => {
            this.controlPanelRegistry.forEach((data, renderArea) => {
                if (data.type === "comprehensive_controls") {
                    const { initial, preceding, numberSpan, following, terminal } = data.elements;
                    const currentStart = this.activeConfiguration.commencementPoint;
                    const perSegment = this.activeConfiguration.segmentSize;
                    const totalItems = this.activeConfiguration.aggregateVisibleItems;
                    const limitLinks = this.activeConfiguration.linkClusterLimit;

                    const totalSegments = Math.ceil(totalItems / perSegment);
                    const currentSegment = Math.floor(currentStart / perSegment) + 1;

                    numberSpan.innerHTML = '';

                    let startLink, endLink;

                    if (totalSegments < limitLinks) {
                        startLink = 1;
                        endLink = totalSegments;
                    } else {
                        const halfLinks = Math.floor(limitLinks / 2);
                        startLink = currentSegment - halfLinks;
                        endLink = currentSegment + halfLinks;

                        if (startLink < 1) {
                            endLink += (1 - startLink);
                            startLink = 1;
                        }
                        if (endLink > totalSegments) {
                            startLink -= (endLink - totalSegments);
                            endLink = totalSegments;
                        }
                        if (startLink < 1) startLink = 1;
                    }

                    for (let i = startLink; i <= endLink; i++) {
                        this.fabricateInteractiveNode('span',
                            `${this.aestheticMap.pageLink} ${i === currentSegment ? this.aestheticMap.pageLinkActive : ''}`,
                            i.toString(),
                            (() => {
                                const segmentNum = i;
                                return () => this.navigatePage((segmentNum - 1) * perSegment);
                            })(),
                            numberSpan
                        );
                    }

                    const isFirstSegment = currentStart === 0 || totalItems === 0;
                    const isLastSegment = (currentStart + perSegment >= totalItems) || (totalItems === 0);

                    initial.className = `${this.aestheticMap.pageLink} ${this.aestheticMap.initialPage} ${isFirstSegment ? this.aestheticMap.pageLinkStaticDisabled : ''}`;
                    preceding.className = `${this.aestheticMap.pageLink} ${this.aestheticMap.precedingPage} ${isFirstSegment ? this.aestheticMap.pageLinkStaticDisabled : ''}`;
                    following.className = `${this.aestheticMap.pageLink} ${this.aestheticMap.followingPage} ${isLastSegment ? this.aestheticMap.pageLinkStaticDisabled : ''}`;
                    terminal.className = `${this.aestheticMap.pageLink} ${this.aestheticMap.terminalPage} ${isLastSegment ? this.aestheticMap.pageLinkStaticDisabled : ''}`;
                }
            });
        }
    };
}

const globalManagerInstance = new ChronicleController();

const producePaginationAgent = (hostIdentifier, customParameters) => {
    let agentInstance = globalManagerInstance.retrieveSculptor(hostIdentifier);

    if (!agentInstance) {
        agentInstance = globalManagerInstance.registerDisplay(hostIdentifier, customParameters);
    } else {
        Object.assign(agentInstance.activeConfiguration, customParameters);
    }
    return agentInstance;
};
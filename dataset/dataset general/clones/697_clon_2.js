/*
 *  Overlay Panel
 *  Copyright 2023 Acme Corp. All rights reserved.
 *
 *  @file  浮动面板组件
 *  @author  devops(devops@acmecorp.com)
 */


define( function ( acquire ) {

    const   GU = globalUtil;
    const   EH = GU.dom;
    const   SM = GU.page;
    const   Widget = acquire( './Widget' );

    /**
     *  浮动面板UI组件
     *
     *  @constructor
     *  @extends module:Widget
     *  @requires Widget
     *  @exports ModalWindow
     *  @see module:CityPicker
     *  @see module:DateSelector
     */
    var ModalWindow = function ( ) {
        this . constructor . superClass . constructor . apply( this, arguments );
    };

    ModalWindow . prototype = {

        /**
         *  组件类别标识符
         *
         *  @private
         *  @type {string}
         */
        componentKind: 'ModalWindow',

        /**
         *  组件配置项设置
         *
         *  @private
         *  @name module:ModalWindow#settings
         *  @type {Object}
         *  @property {boolean} inactive 组件的禁用状态
         *  @property {(string | HTMLElement)} containerElement 组件渲染的根容器
         *  @property {(string | HTMLElement)} anchorElement 计算浮层相对位置的参照物
         *  @property {string | Array.<HTMLElement>} activators 触发浮层显示的元素集合
         *  若指定了 delegatedTriggers 则仅支持字符串类名
         *  @property {string | HTMLElement} delegatedTriggers 动态 activators 的父级DOM节点
         *  @property {string} displayContent 浮层内部展示的HTML内容
         *  @property {string} placement 浮层相对于 anchorElement 的显示方位，支持8种方向
         *  可选值（默认为 bl）：
         *  tr | rt | rb | br | bl | lb | lt | tl | tc | rc | bc | lc
         *  也可通过在 activators 上设置 data-placement 来覆盖
         *  @property {string} classPrefix 组件CSS类名前缀，也将作为 containerElement 的一个类名
         *  @property {Object.<string, number>} displacement 浮层显示的偏移量配置
         *  @property {number} displacement.horizontal X轴方向的偏移量
         *  @property {number} displacement.vertical Y轴方向的偏移量
         */
        settings: {

            /**
             *  提示框的不可用状态，默认值为 false。处于不可用状态的提示框不会显示。
             *
             *  @type {boolean}
             *  @default
             */
            inactive: false,

            /**
             *  组件渲染的主容器元素
             *
             *  @type {(string | HTMLElement)}
             */
            containerElement: '',

            /**
             *  用于计算浮动层相对位置的参照对象
             *
             *  @type {(string | HTMLElement)}
             */
            anchorElement: '',

            /**
             *  触发浮动层显示的节点样式类名
             *
             *  当指定了 delegatedTriggers 时，此项只能是字符串类型
             *
             *  @type {string | Array.<HTMLElement>}
             */
            activators: '',

            /**
             *  动态触发器集合的父级DOM元素
             *
             *  @type {string | HTMLElement}
             */
            delegatedTriggers: '',

            /**
             *  浮层中要显示的主要内容
             *
             *  @type {string}
             */
            displayContent: '',

            /**
             *  浮层相对于触发元素的显示位置
             *
             *  可选值：tr | rt | rb | br | bl | lb | lt | tl | tc | rc | bc | lc
             *  也可通过在 activators 上设置 data-placement 来指定
             *
             *  @type {string}
             *  @defaultvalue
             */
            placement: 'bl',

            /**
             *  组件的CSS类名前缀，也将作为 containerElement 的一个类名
             *
             *  @type {string}
             *  @defaultvalue
             */
            classPrefix: 'acme-ui-floating-panel',

            /**
             *  浮层显示时的微调偏移量
             *
             *  @type {Object}
             */
            displacement: {

                /**
                 *  X轴方向的偏移像素值
                 *
                 *  @type {number}
                 *  @defaultvalue
                 */
                horizontal: 0,

                /**
                 *  Y轴方向的偏移像素值
                 *
                 *  @type {number}
                 *  @defaultvalue
                 */
                vertical: 0
            }
        },


        /**
         *  需要绑定当前实例上下文的方法名称列表，多个名称以逗号分隔
         *
         *  @private
         *  @type {string}
         */
        boundMethods: 'handleResizeEvent, beforeDisplay, beforeConceal',

        /**
         *  组件的初始化过程
         *
         *  @private
         *  @params {Object} inputConfig 配置选项
         *  @see module:ModalWindow#settings
         */
        initialize: function ( inputConfig ) {
            inputConfig = this . setOptions( inputConfig );

            this . inactive = inputConfig . inactive;
            this . displayContent = inputConfig . displayContent;

            if ( inputConfig . anchorElement ) {
                this . anchorElement = GU . fetchElement( inputConfig . anchorElement );
            }

            var localPrefix = inputConfig . classPrefix;
            var primaryDiv = this . containerElement = inputConfig . containerElement
                && GU . fetchElement( inputConfig . containerElement )
                || document . createElement( 'div' );

            if ( inputConfig . containerElement ) {
                GU . addCssClass( primaryDiv, localPrefix );
            }
            else {
                primaryDiv . className = localPrefix;
                primaryDiv . style . left = '-20000px';
            }

            var instanceRef = this;
            var activatorsList = inputConfig . activators;
            var delegatedParent = inputConfig . delegatedTriggers;

            if ( delegatedParent ) {

                this . delegatedTriggers = GU . attachEvent( GU . fetchElement( delegatedParent ), 'click', instanceRef . beforeDisplay );
            }
            else {

                if ( GU . checkString( activatorsList ) ) {
                    activatorsList = GU . queryElements( inputConfig . activators );
                }

                GU . forEachItem(
                    activatorsList,
                    function ( currentActivator ) {
                        GU . attachEvent( currentActivator, 'click', instanceRef . beforeDisplay );
                    }
                );

                this . activators = activatorsList;

            }
        },

        /**
         *  绘制并渲染组件到DOM
         *
         *  @public
         *  @fires module:ModalWindow#interactionClick 用户点击事件
         *  @return {module:ModalWindow} 当前组件实例
         */
        draw: function ( ) {
            const primaryDiv = this . containerElement;

            if ( !this . renderedComponent ) {
                this . renderedComponent = true;
                !this . settings . containerElement && document . body . appendChild( primaryDiv );

                var selfPointer = this;

                GU . attachEvent(
                    primaryDiv,
                    'click',
                    function ( eventObj ) {

                        /**
                         *  @event module:ModalWindow#interactionClick
                         *  @type {Object}
                         *  @property {DOMEvent} eventObj 事件的原始对象
                         */
                        selfPointer . fire( 'interactionClick', { eventObj: eventObj } );
                    }
                );

            }

            if ( this . displayContent ) {
                primaryDiv . innerHTML = this . displayContent;
            }

            return this;
        },

        /**
         *  浏览器视口尺寸变化时的处理逻辑
         *
         *  @private
         */
        handleResizeEvent: function ( ) {
            clearTimeout( this . resizeDelayTimer );

            var selfRef = this;

            this . resizeDelayTimer = setTimeout( function ( ) {
                selfRef . display( );
            }, 100 );
        },

        /**
         *  显示浮层前的预处理操作
         *
         *  @private
         *  @param {DOMEvent} evt DOM事件对象
         *  @fires module:ModalWindow#preDisplay 显示前触发事件
         */
        beforeDisplay: function ( evt ) {

            var previousAnchor = this . anchorElement;

            /**
             *  @event module:ModalWindow#preDisplay
             *  @type {Object}
             *  @property {DOMEvent} evt 原始事件对象
             */
            this . fire( 'preDisplay', { evt: evt } );

            if ( this . inactive ) {
                return;
            }

            if ( previousAnchor !== this . anchorElement ) {
                this . conceal( );
            }

            var currentInstance = this;
            var eventSource = GU . event . getTarget( evt );
            var delegatedParent = this . delegatedTriggers;

            if ( delegatedParent ) {
                var targetClass = this . settings . activators;
                var hasClassUtil = GU . dom . hasClass;
                while ( !hasClassUtil( eventSource, targetClass ) && eventSource !== delegatedParent ) {
                    eventSource = eventSource . parentNode;
                }

                if ( !hasClassUtil( eventSource, targetClass ) ) {
                    return;
                }
            }

            this . display( );

            this . currentActivator = eventSource;

            this . eventBindTimer = setTimeout( function ( ) {
                GU . attachEvent( document, 'click', currentInstance . beforeConceal );
                GU . attachEvent( window, 'resize', currentInstance . handleResizeEvent );
            }, 0 );
        },

        /**
         *  隐藏浮层前的预处理
         *
         *  @private
         */
        beforeConceal: function ( evt ) {
            var clickedTarget = GU . event . getTarget( evt );
            var panelContainer = this . containerElement;

            if ( panelContainer === clickedTarget || EH . contains( panelContainer, clickedTarget ) ) {
                return;
            }

            this . conceal( );

            clearTimeout( this . resizeDelayTimer );
        },

        /**
         *  显示浮动层
         *
         *  @public
         *  @fires module:ModalWindow#onDisplayed 浮层已显示事件
         */
        display: function ( ) {
            this . calculatePlacement( );

            /**
             *  @event module:ModalWindow#onDisplayed
             */
            this . fire( 'onDisplayed' );
        },

        /**
         *  隐藏浮动层
         *
         *  @public
         *  @fires module:ModalWindow#onConcealed 浮层已隐藏事件
         */
        conceal: function ( ) {
            this . containerElement . style . left = '-20000px';

            /**
             *  @event module:ModalWindow#onConcealed
             */
            this . fire( 'onConcealed' );

            GU . detachEvent( document, 'click', this . beforeConceal );
            GU . detachEvent( window, 'resize', this . handleResizeEvent );

            clearTimeout( this . eventBindTimer );
            clearTimeout( this . resizeDelayTimer );
        },

        /**
         *  计算浮层及其指示箭头（如果有）的显示位置
         *
         *  @private
         */
        calculatePlacement: function ( ) {
            var currentSettings = this . settings;
            var anchorRef = this . anchorElement || this . activators[ 0 ];
            var panelContainer = this . containerElement;
            var placementDirection = currentSettings . placement;
            var anchorCoords = EH . getPosition( anchorRef );

            //  参照元素的8个关键坐标点
            var yCoord = anchorCoords . top;
            var xCoord = anchorCoords . left;
            var elemWidth = anchorRef . offsetWidth;
            var elemHeight = anchorRef . offsetHeight;
            var xRight = xCoord + elemWidth;
            var yBottom = yCoord + elemHeight;
            var midX = xCoord + ( elemWidth / 2 );
            var midY = yCoord + ( elemHeight / 2 );

            //  浮层自身的宽度和高度
            var panelWidth = panelContainer . offsetWidth;
            var panelHeight = panelContainer . offsetHeight;

            //  视口滚动及尺寸信息
            var scrollY = SM . getScrollTop( );
            var scrollX = SM . getScrollLeft( );
            var viewportWidth = SM . getViewWidth( );
            var viewportHeight = SM . getViewHeight( );
            var viewportXEnd = scrollX + viewportWidth;
            var viewportYEnd = scrollY + viewportHeight;

            //  DOM属性优先级高于实例配置
            var attrPlacement = anchorRef . getDomAttribute( 'data-placement' );
            if ( attrPlacement ) {
                placementDirection = /[trbl]{2}/ . checkPattern( attrPlacement ) ? attrPlacement : '1';
            }

            var primaryAxis, secondaryAxis;

            //  未指定方向时，自动按右下左上顺序计算最佳可用方向（以不超出视口为原则）
            if ( placementDirection === 'auto' ) {

                //  如果参照物宽度大于浮层宽度，优先考虑水平居中
                var hAlign = elemWidth > panelWidth
                        || xCoord - ( panelWidth - elemWidth ) / 2 > 0
                        && xRight + ( panelWidth - elemWidth ) / 2 <= viewportXEnd
                        ? 'c'
                        : xCoord + panelWidth > viewportXEnd
                            ? 'r'
                            : 'l';

                //  如果参照物高度大于浮层高度，优先考虑垂直居中
                var vAlign = elemHeight > panelHeight
                        || yCoord - ( panelHeight - elemHeight ) / 2 > 0
                        && yBottom + ( panelHeight - elemHeight ) / 2 <= viewportYEnd
                        ? 'c'
                        : yCoord + panelHeight > viewportYEnd
                            ? 'b'
                            : 't';

                //  如果浮层能在参照物下方且不超出视口
                if ( yBottom + panelHeight <= viewportYEnd ) {
                    primaryAxis = 'b';
                    secondaryAxis = hAlign;
                }

                //  如果浮层能在参照物右侧且不超出视口
                else if ( xRight + panelWidth <= viewportXEnd ) {
                    primaryAxis = 'r';
                    secondaryAxis = vAlign;
                }

                //  如果浮层能在参照物上方且不超出视口
                else if ( yCoord - panelHeight >= scrollY ) {
                    primaryAxis = 't';
                    secondaryAxis = hAlign;
                }

                //  如果浮层能在参照物左侧且不超出视口
                else if ( xCoord - panelWidth >= scrollX ) {
                    primaryAxis = 'l';
                    secondaryAxis = vAlign;
                }

                placementDirection = primaryAxis + secondaryAxis;
            }
            else {

                //  从 placementDirection 中拆分主次轴，便于后续计算
                primaryAxis = placementDirection . getCharAtIndex( 0 );
                secondaryAxis = placementDirection . getCharAtIndex( 1 );
            }

            var currentDisplacement = currentSettings . displacement;

            //  浮层在参照物上方或下方显示时的定位逻辑
            if ( {t: 1, b: 1}[ primaryAxis ] ) {
                xCoord = {
                    l: xCoord,
                    c: midX - ( panelWidth / 2 ),
                    r: xRight - panelWidth
                }[ secondaryAxis ];

                yCoord = {
                    t: yCoord - panelHeight,
                    b: yBottom
                }[ primaryAxis ];

            }

            //  浮层在参照物左侧或右侧显示时的定位逻辑
            else if ( {l: 1, r: 1}[ primaryAxis ] ) {
                yCoord = {
                    t: yCoord,
                    c: midY - ( panelHeight / 2 ),
                    b: yBottom - panelHeight
                }[ secondaryAxis ];

                xCoord = {
                    l: xCoord - panelWidth - currentDisplacement . horizontal,
                    r: xRight + currentDisplacement . horizontal
                }[ primaryAxis ];
            }

            panelContainer . style . left = xCoord + 'px';
            panelContainer . style . top = yCoord + 'px';
        }

    };

    GU . extend( ModalWindow, Widget );

    return ModalWindow;

} );
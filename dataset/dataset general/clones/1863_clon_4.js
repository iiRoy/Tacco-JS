class Visualizer {
    constructor() {
        this.domRoot = document.getElementById('container');
        this.rotationIndex = 1;
        this.displayAreaWidth = 600;
        this.displayAreaHeight = 400;

        if (this._detectLegacyBrowser()) {
            this.domRoot.children[0].appendChild(this._composeWarningElement());
            return;
        }

        this.graphicsEngine = this._configureRenderer();
        this.visualSpace = new THREE.Scene();
        this.perspectiveDevice = this._constructViewpoint();
        this.facetedObject = this._assembleGeometry();

        this.visualSpace.add(this.perspectiveDevice);
        this.visualSpace.add(this.facetedObject);
        this.visualSpace.add(this._illuminateAmbiently());
        this.visualSpace.add(this._illuminateDirectionally());

        this.domRoot.children[0].appendChild(this.graphicsEngine.domElement);

        this._initiateAnimationCycle();
    }

    _detectLegacyBrowser() {
        return (/MSIE|Trident/.test(navigator.userAgent) || !!window.ActiveXObject);
    }

    _composeWarningElement() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'surface';
        warningDiv.style.height = '400px';
        warningDiv.style.textAlign = 'center';
        warningDiv.style.paddingTop = '30px';

        const downloadLink = document.createElement('a');
        downloadLink.style.verticalAlign = 'middle';
        downloadLink.href = 'https://www.google.com/chrome';
        downloadLink.textContent = 'Download a proper browser';

        warningDiv.appendChild(downloadLink);
        return warningDiv;
    }

    _configureRenderer() {
        const renderTool = new THREE.WebGLRenderer();
        renderTool.setSize(this.displayAreaWidth, this.displayAreaHeight);
        renderTool.domElement.setAttribute('id', 'surface');
        return renderTool;
    }

    _illuminateDirectionally() {
        const directLight = new THREE.DirectionalLight(0xffffff);
        directLight.position.set(1, 1, 1).normalize();
        return directLight;
    }

    _illuminateAmbiently() {
        return new THREE.AmbientLight(0x999999);
    }

    _assembleGeometry() {
        const objectDimensions = new THREE.CubeGeometry(200, 200, 200, 1, 1, 1, this._prepareSurfaces());
        return new THREE.Mesh(objectDimensions, new THREE.MeshFaceMaterial());
    }

    _prepareSurfaces() {
        const surfaceTexture = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('Content/me.jpg')
        });
        return Array(6).fill(surfaceTexture);
    }

    _constructViewpoint() {
        const viewingDevice = new THREE.PerspectiveCamera(50, this.displayAreaWidth / this.displayAreaHeight, 1, 1000);
        viewingDevice.position.z = 500;
        return viewingDevice;
    }

    _angleToRadian(degrees) {
        return Math.PI / 180 * degrees;
    }

    _initiateAnimationCycle() {
        const animationTick = () => {
            this._advanceFrame();
            requestAnimationFrame(animationTick);
        };
        requestAnimationFrame(animationTick);
    }

    _advanceFrame() {
        this.rotationIndex++;
        this.facetedObject.rotation.x = this._angleToRadian(this.rotationIndex);
        this.facetedObject.rotation.y = this._angleToRadian(this.rotationIndex);
        this.facetedObject.rotation.z = this._angleToRadian(this.rotationIndex);
        this.graphicsEngine.render(this.visualSpace, this.perspectiveDevice);
    }
}

new Visualizer();
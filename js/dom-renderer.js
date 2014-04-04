// ******************************************************************
// Adapted from Mr. Doob's THREE.CSS3Renderer - threejs.org
// https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js
// ******************************************************************
THREE.CSS3DRenderer = function () {
  var _width, _height;
  var _widthHalf, _heightHalf;

  var matrix = new THREE.Matrix4();

  var domElement = document.createElement('div');
  domElement.style.overflow = 'hidden';

  domElement.style.WebkitTransformStyle = 'preserve-3d';
  domElement.style.MozTransformStyle = 'preserve-3d';
  domElement.style.oTransformStyle = 'preserve-3d';
  domElement.style.transformStyle = 'preserve-3d';

  this.domElement = domElement;

  var cameraElement = document.createElement('div');

  cameraElement.style.WebkitTransformStyle = 'preserve-3d';
  cameraElement.style.MozTransformStyle = 'preserve-3d';
  cameraElement.style.oTransformStyle = 'preserve-3d';
  cameraElement.style.transformStyle = 'preserve-3d';

  domElement.appendChild(cameraElement);

  this.setSize = function (width, height) {

    _width = width;
    _height = height;

    _widthHalf = _width / 2;
    _heightHalf = _height / 2;

    domElement.style.width = width + 'px';
    domElement.style.height = height + 'px';

    cameraElement.style.width = width + 'px';
    cameraElement.style.height = height + 'px';

  };

  var epsilon = function (value) {
    return Math.abs(value) < 0.000001 ? 0 : value;
  };

  var getCameraCSSMatrix = function (matrix) {
    var elements = matrix.elements;

    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( - elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( elements[ 6 ] ) + ',' +
      epsilon( elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( - elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( - elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';
  };

  var getObjectCSSMatrix = function (matrix) {
    var elements = matrix.elements;

    return 'translate3d(-50%,-50%,0) matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( - elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( - elements[ 6 ] ) + ',' +
      epsilon( - elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';
  };

  var renderObject = function (object, camera) {
    if (object instanceof Physijs.BoxMesh) {
      style = getObjectCSSMatrix(object.matrixWorld);

      var element = object.element;
      element.style.WebkitTransform = style;
      element.style.MozTransform = style;
      element.style.oTransform = style;
      element.style.transform = style;

      if (element.parentNode !== cameraElement) {
        cameraElement.appendChild(element);
      }
    }
    for (var i = 0, l = object.children.length; i < l; i ++ ) {
      renderObject(object.children[i], camera);
    }
  };

  this.render = function (scene, camera) {

    var fov = 0.5 / Math.tan(THREE.Math.degToRad(camera.fov * 0.5 )) * _height;
    domElement.style.WebkitPerspective = fov + "px";
    domElement.style.MozPerspective = fov + "px";
    domElement.style.oPerspective = fov + "px";
    domElement.style.perspective = fov + "px";

    scene.updateMatrixWorld();

    if (camera.parent === undefined) camera.updateMatrixWorld();

    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse) +
      " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

    cameraElement.style.WebkitTransform = style;
    cameraElement.style.MozTransform = style;
    cameraElement.style.oTransform = style;
    cameraElement.style.transform = style;

    renderObject(scene, camera);
  };
};
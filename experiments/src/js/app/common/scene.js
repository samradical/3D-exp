var P_WIDTH = 256;
var P_HEIGHT = 256;
var P_DEPTH = 256;
var TIME_BIAS = -1000;

'use strict';

var Scene = function(renderer, clearColor, cameraZ) {
	var fbo;

	var _scene, _camera, _clearColor;

	_clearColor = clearColor;

	_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	_camera.position.z = cameraZ;
	// Setup scene
	_scene = this.scene = new THREE.Scene();
	_scene.add(new THREE.AmbientLight(0x555555));

	renderTargetParameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	};

	fbo = this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);

	function render(rtt) {
		renderer.setClearColor(_clearColor);
		if (rtt) {
			renderer.render(_scene, _camera, fbo, true);
		} else {
			renderer.render(_scene, _camera);
		}
	}

	function createPlane(w, h, material) {
		w = w || 1280;
		h = h || 720;
		var geometry = new THREE.PlaneGeometry(w, h, 4, 4);
		var mesh = new THREE.Mesh(geometry, material);
		_scene.add(mesh);
	}

	function resize(w, h) {
		_camera.aspect = w / h;
		_camera.updateProjectionMatrix();
		fbo.width = w;
		fbo.height = h;
	}

	return {
		resize: resize,
		render: render,
		fbo: fbo,
		createPlane: createPlane
	}
};

module.exports = Scene;
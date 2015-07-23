'use strict';
var UTILS = require('./utils');

var Scene = function() {

	function createScene(material) {
		var _scene, _mesh;
		_scene = this.scene = new THREE.Scene();
		_scene.add(new THREE.AmbientLight(0x555555));
		var geometry = new THREE.PlaneGeometry(1280, 720, 4, 4);
		geometry.center();
		_mesh = new THREE.Mesh(geometry, material);
		_scene.add(_mesh);

		return _scene;
	}

	return {
		createScene: createScene
	}
};

module.exports = Scene;
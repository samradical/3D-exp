var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var TWEEN = require('tweenjs');
var SHADERS_LIB = require('../common/shader_lib');
// app dependencies
var NUM_COLUMNS = 2;
var VIDEO_WIDTH = 1280;
var VIDEO_HEIGHT = 720;

var statsEnabled = true;

var container, stats, loader;
var camera, scene, renderer;

var geometry;
var planes;
var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
var texture, texture2, video;
var planesGroup;

//Normal map shader
var ambient = 0xffffff,
	diffuse = 0xffffff / 5,
	specular = 0xffffff,
	scale = 143;

var textMesh, textGeo;

var spotLight, pointLight, ambientLight;
var isRender = true;

var mouseX = 0;
var mouseY = 0;

var controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {

	'use strict';

	Views.YoutubeThreeView = Marionette.ItemView.extend({
		template: JST['youtube_three'],
		events: {
			'click .js-go': 'startProcess'
		},
		initialize: function(options) {
			this.updateCounter = 0;
			this.guiOptions = Object.create(null);
			this.guiOptions['numPlanes'] = 1;
			this.guiOptions['setShader'] = 'fractal1';
		},
		onRender: function() {
			//gui
			var gui = new dat.GUI();
			gui.add(this.guiOptions, 'numPlanes', 1, 4).step(1).onChange(function(val) {
				this.createPlanes(val);
			}.bind(this));
			gui.add(this.guiOptions, 'setShader', ['fractal1', 'chroma', 'cave']).onChange(_.debounce(function(val) {
				this.setShader(val);
			},100).bind(this));

			gui.width = 300;
			this.gui = gui;
		},
		onShow: function() {
			var self = this;
			this.$textEl = this.$el.find('.ThreeFonts');

			this.videoElement = document.getElementById('myVideo');
			this.videoElement.volume = 0;
			this.videoElement.width = VIDEO_WIDTH;
			this.videoElement.height = VIDEO_HEIGHT;

			this.videoElement2 = document.getElementById('myVideo2');
			this.videoElement2.volume = 0;
			this.videoElement2.width = VIDEO_WIDTH;
			this.videoElement2.height = VIDEO_HEIGHT;

			this.boundAnimate = this.animate.bind(this);
			this.setup3D();
			this.boundAnimate();
		},

		////------------------------
		//3D
		////------------------------

		setup3D: function() {

			planes = [];

			container = document.getElementById('three');
			this.el.appendChild(container);
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.rotation.set(0, 0, 0);

			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			container.appendChild(renderer.domElement);

			// LIGHTS
			ambientLight = new THREE.AmbientLight(0xffffff);
			scene.add(ambientLight);

			controls = new THREE.TrackballControls(camera, renderer.domElement);
			renderer.gammaInput = true;
			renderer.gammaOutput = true;

			geometry = new THREE.PlaneGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 480, 270);
			geometry.computeTangents();

			texture = new THREE.Texture(this.videoElement);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			texture2 = new THREE.Texture(this.videoElement2);
			texture2.minFilter = THREE.LinearFilter;
			texture2.magFilter = THREE.LinearFilter;

			this.setShader('cave');

			this.createPlanes();

			window.addEventListener('resize', this.onWindowResize, false);
		},

		setShader: function(name) {
			var d = SHADERS_LIB[name]();
			var shader = d['shader'];
			var uniforms = d['uniforms'];
			uniforms["tOne"].value = texture2;
			uniforms["tTwo"].value = texture;
			uniforms["tDisplacement"].value = texture;
			uniforms["uAmbientColor"].value.setHex(ambient);
			uniforms["uDiffuseColor"].value.setHex(diffuse);

			uniforms["uWidth"].value = VIDEO_WIDTH;
			uniforms["uHeight"].value = VIDEO_HEIGHT;
			uniforms["uRes"].value = VIDEO_HEIGHT / VIDEO_WIDTH;

			console.log(shader);
			console.log(uniforms);

			var parameters = {
				fragmentShader: shader.fragmentShader,
				shading: THREE.SmoothShading,
				vertexShader: shader.vertexShader,
				uniforms: uniforms,
				lights: true,
				fog: false,
				map: texture,
				side: THREE.DoubleSide
			};
			videoMaterial = new THREE.ShaderMaterial(parameters);
			this.createPlanes();
			/*if (!videoMaterial) {
				videoMaterial = new THREE.ShaderMaterial(parameters);
			} else {
				videoMaterial['fragmentShader'] = shader.fragmentShader;
				videoMaterial['vertexShader'] = shader.vertexShader;
				videoMaterial['uniforms'] = uniforms;
			}*/
		},

		createPlanes: function() {
			if (planes.length > 0) {
				for (var i = 0; i < planes.length; i++) {
					planesGroup.remove(planes[i]);
				}
				scene.remove(planesGroup);
				planes.length = 0;
				planesGroup = null;
			}
			var columns = 2;
			var rows = 0;
			var numPlanes = this.guiOptions['numPlanes'];
			planesGroup = new THREE.Object3D();
			//planesGroup.position.set(0, -VIDEO_HEIGHT / (numPlanes / 2), 0);
			for (var i = 0; i < numPlanes; i++) {
				var mesh = new THREE.Mesh(geometry, videoMaterial);

				var offsetX = numPlanes > 1 ? 2 * VIDEO_WIDTH / 4 : 0;
				var offsetY = VIDEO_HEIGHT - 2;
				if (i % columns !== 0) {
					mesh.position.set(-offsetX, offsetY * rows, -1500);
				} else {
					planesGroup.position.y = -(offsetY * .5) * rows - offsetY;
					rows++;
					mesh.position.set(offsetX, offsetY * rows, -1500);
				}
				planes.push(mesh);
				planesGroup.add(mesh);
			}
			scene.add(planesGroup);
		},

		onWindowResize: function() {
			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		},

		onDocumentMouseMove: function(event) {
			mouseX = (event.clientX - windowHalfX) * 10;
			mouseY = (event.clientY - windowHalfY) * 10;
		},

		animate: function() {
			window.requestAnimationFrame(this.boundAnimate);
			this.threeRender();
		},

		threeRender: function() {
			controls.update();
			TWEEN.update();
			renderer.render(scene, camera);
			texture2.needsUpdate = true;
			texture.needsUpdate = true;
			videoMaterial.uniforms['uTime'].value = this.updateCounter / 60;
			this.updateCounter++;
		}

	});
});

// export
module.exports = App.YoutubeThreeView;
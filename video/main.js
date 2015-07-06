var Main = (function() {

	//video

	var video = document.getElementById('player');
	video.volume = 0;

	var container, stats, loader;
	var camera, scene, renderer;

	var geometry;
	var planes = [];
	var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
	var texture, feedbackTexture, video;

	container = document.getElementById('three');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 0, 0);
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

	geometry = new THREE.PlaneGeometry(1280, 720, 480, 270);
	geometry.computeTangents();

	texture = new THREE.Texture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var basicShader = THREE.ShaderLib['basic'];
	console.log(basicShader);

	var parameters = {
		fragmentShader: basicShader.fragmentShader,
		shading: THREE.SmoothShading,
		vertexShader: basicShader.vertexShader,
		uniforms: basicShader.uniforms/*,
		lights: true,
		fog: false,
		map: texture,
		transparent: false,
		overdraw: true,
		side: THREE.DoubleSide*/
	};

	videoMaterial = new THREE.ShaderMaterial(parameters);

	console.log(videoMaterial);

	//Normal map shader
	var ambient = 0xffffff,
		diffuse = 0xffffff / 5,
		specular = 0xffffff,
		scale = 143;


	function createPlanes() {
		var mesh = new THREE.Mesh(geometry, videoMaterial);
		mesh.position.set(0, 0, 0);
		planes.push(mesh);
		scene.add(mesh);
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function onDocumentMouseMove(event) {
		mouseX = (event.clientX - windowHalfX) * 10;
		mouseY = (event.clientY - windowHalfY) * 10;
	}

	function animate() {
		window.requestAnimationFrame(animate);
		threeRender();
	}

	function threeRender() {
		controls.update();
		texture.needsUpdate = true;
		TWEEN.update();
		renderer.render(scene, camera);
	}

	createPlanes();
	window.addEventListener('resize', onWindowResize, false);
	animate();

})();
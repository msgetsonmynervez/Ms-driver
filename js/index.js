// Entry point
// 
// 
window.addEventListener('load', init, false);

// Global variables
var SCENE;

var road, sky;
var mouse = {x:0, y:0};
var context;

var world_angle=60, 
 	world_radius=600;

var GAME = {};
var selectedVehicle = null;

var REPO_FULL_NAME = 'msgetsonmynervez/Ms-driver';
var REPO_BRANCH = 'master';
var MODELS_FOLDER = 'models';
var GITHUB_MODELS_API_URL = 'https://api.github.com/repos/' + REPO_FULL_NAME + '/contents/' + MODELS_FOLDER + '?ref=' + REPO_BRANCH;

// Vehicle selection options are loaded dynamically from the repo's models/ folder.
// The Classic Car option is always included as a fallback.
var VEHICLE_OPTIONS = [create_classic_vehicle_option()];

async function init(){

	GAME = initialize_game();
	selectedVehicle = get_selected_vehicle();

	// Load every .glb file from /models into the vehicle selector.
	await load_vehicle_options_from_models_folder();

	// Initialize audio
	context = new AudioContext();

	// set up SCENE.scene, camera, SCENE.renderer
	SCENE = create_scene('world', false);

	// set up lighting
	create_lights(SCENE.scene);

	// add objects
	create_character(0);
	create_environment();

	// Build vehicle selection UI before player starts the game.
	create_vehicle_selection_scene();

	// Input handler
	document.addEventListener('mousemove', input_handler, false);
	document.addEventListener('touchmove', touch_input_handler, false);

	// Start menu handler
	document.getElementById('play-button').addEventListener('click', ()=>{

		// Resume audio context
		context.resume().then(() => {console.log("Audio context resumed.")});

		// Hide full start menu
		document.querySelector('.menu').style.display = 'none';

		// Start game levels
		start_game(GAME, car, road);

	});

	// Initialize menu
	update_health_display();
	update_level_display();
	update_score_display();
	update_distance_display();


	$("#save").click(function(){
		SCENE = update_settings(SCENE);
	});

	// start game loop
	game_loop();
	
}

function create_classic_vehicle_option(){
	return {
		id: 'classic',
		name: 'Classic Car',
		description: 'Original built-in Night Drive car.',
		modelPath: null,
		scale: 1,
		rotation: {x: 0, y: 0, z: 0},
		position: {x: 0, y: 0, z: 0}
	};
}

function create_glb_vehicle_option(fileName){
	var cleanName = fileName.replace(/\.glb$/i, '').replace(/[-_]+/g, ' ');
	cleanName = cleanName.replace(/\b\w/g, function(letter){ return letter.toUpperCase(); });

	return {
		id: 'glb-' + fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
		name: cleanName,
		description: fileName,
		modelPath: MODELS_FOLDER + '/' + fileName,
		scale: 28,
		rotation: {x: 0, y: Math.PI, z: 0},
		position: {x: 0, y: 6, z: 0}
	};
}

async function load_vehicle_options_from_models_folder(){
	try{
		var response = await fetch(GITHUB_MODELS_API_URL, {cache: 'no-store'});

		if(!response.ok){
			throw new Error('Unable to read models folder. Status: ' + response.status);
		}

		var files = await response.json();

		if(!Array.isArray(files)){
			throw new Error('Models folder response was not a file list.');
		}

		var glbFiles = files
			.filter(function(file){
				return file && file.type === 'file' && /\.glb$/i.test(file.name);
			})
			.map(function(file){ return file.name; })
			.sort(function(a, b){ return a.localeCompare(b); });

		VEHICLE_OPTIONS = [create_classic_vehicle_option()].concat(
			glbFiles.map(function(fileName){ return create_glb_vehicle_option(fileName); })
		);

		selectedVehicle = get_selected_vehicle();
		console.log('Loaded vehicle options:', VEHICLE_OPTIONS);
	}
	catch(error){
		console.warn('Falling back to Classic Car only. Could not load .glb files from models folder:', error);
		VEHICLE_OPTIONS = [create_classic_vehicle_option()];
		selectedVehicle = VEHICLE_OPTIONS[0];
	}
}

function get_selected_vehicle(){
	var storedVehicleId = localStorage.getItem('nightdrive-selected-vehicle') || 'classic';
	return VEHICLE_OPTIONS.find(function(vehicle){ return vehicle.id === storedVehicleId; }) || VEHICLE_OPTIONS[0];
}

function create_vehicle_selection_scene(){
	var menu = document.querySelector('.menu > div:last-child');
	var playButton = document.getElementById('play-button');

	if(!menu || !playButton) return;

	var title = document.createElement('div');
	title.innerHTML = 'SELECT VEHICLE';
	title.style.color = '#ffeeee';
	title.style.fontFamily = 'Press Start 2P';
	title.style.fontSize = '1rem';
	title.style.marginBottom = '1rem';
	title.style.textShadow = '0 0 10px #EB355F';

	var selector = document.createElement('div');
	selector.id = 'vehicle-selection';
	selector.style.display = 'flex';
	selector.style.flexWrap = 'wrap';
	selector.style.justifyContent = 'center';
	selector.style.gap = '1rem';
	selector.style.maxWidth = '900px';
	selector.style.margin = '0 auto 1rem auto';
	selector.style.padding = '1rem';

	VEHICLE_OPTIONS.forEach(function(vehicle){
		var card = document.createElement('button');
		card.type = 'button';
		card.className = 'vehicle-card';
		card.dataset.vehicleId = vehicle.id;
		card.innerHTML = '<strong>' + vehicle.name + '</strong><br><span>' + vehicle.description + '</span>';
		card.style.width = '180px';
		card.style.minHeight = '96px';
		card.style.padding = '0.75rem';
		card.style.border = '2px solid #EB355F';
		card.style.borderRadius = '8px';
		card.style.background = 'rgba(0, 0, 0, 0.68)';
		card.style.color = '#ffeeee';
		card.style.fontFamily = 'Press Start 2P';
		card.style.fontSize = '0.55rem';
		card.style.lineHeight = '1.6';
		card.style.cursor = 'pointer';
		card.style.boxShadow = '0 0 12px rgba(235, 53, 95, 0.35)';
		card.style.transition = 'transform 0.2s, background 0.2s, border-color 0.2s';

		card.addEventListener('mouseenter', function(){
			card.style.transform = 'scale(1.05)';
		});

		card.addEventListener('mouseleave', function(){
			card.style.transform = 'scale(1)';
		});

		card.addEventListener('click', function(){
			select_vehicle(vehicle.id);
		});

		selector.appendChild(card);
	});

	menu.insertBefore(title, playButton);
	menu.insertBefore(selector, playButton);
	refresh_vehicle_selection_ui();
}

function select_vehicle(vehicleId){
	var nextVehicle = VEHICLE_OPTIONS.find(function(vehicle){ return vehicle.id === vehicleId; }) || VEHICLE_OPTIONS[0];
	selectedVehicle = nextVehicle;
	localStorage.setItem('nightdrive-selected-vehicle', selectedVehicle.id);
	refresh_vehicle_selection_ui();

	if(typeof car !== 'undefined' && car){
		apply_selected_vehicle_to_car(car);
	}
}

function refresh_vehicle_selection_ui(){
	var cards = document.querySelectorAll('.vehicle-card');
	for(var i = 0; i < cards.length; i++){
		var isSelected = cards[i].dataset.vehicleId === selectedVehicle.id;
		cards[i].style.background = isSelected ? 'rgba(235, 53, 95, 0.86)' : 'rgba(0, 0, 0, 0.68)';
		cards[i].style.borderColor = isSelected ? '#ffeeee' : '#EB355F';
	}
}

function apply_selected_vehicle_to_car(carObject){
	// Reset any previous GLB preview/model.
	var oldModel = carObject.mesh.getObjectByName('selected-glb-vehicle');
	if(oldModel){
		carObject.mesh.remove(oldModel);
	}

	// Show the original procedural car when Classic is selected.
	if(!selectedVehicle || !selectedVehicle.modelPath){
		set_procedural_car_visibility(carObject, true);
		return;
	}

	set_procedural_car_visibility(carObject, false);

	var requestedVehicleId = selectedVehicle.id;
	var loader = new THREE.GLTFLoader();
	loader.load(
		selectedVehicle.modelPath,
		function(gltf){
			// Ignore stale model loads if the player picked another vehicle before this one finished loading.
			if(!selectedVehicle || selectedVehicle.id !== requestedVehicleId) return;

			var model = gltf.scene;
			model.name = 'selected-glb-vehicle';
			model.scale.set(selectedVehicle.scale, selectedVehicle.scale, selectedVehicle.scale);
			model.rotation.set(selectedVehicle.rotation.x, selectedVehicle.rotation.y, selectedVehicle.rotation.z);
			model.position.set(selectedVehicle.position.x, selectedVehicle.position.y, selectedVehicle.position.z);

			model.traverse(function(child){
				if(child.isMesh){
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			carObject.mesh.add(model);
		},
		undefined,
		function(error){
			console.warn('Unable to load selected vehicle model:', selectedVehicle.modelPath, error);
			set_procedural_car_visibility(carObject, true);
		}
	);
}

function set_procedural_car_visibility(carObject, visible){
	for(var i = 0; i < carObject.mesh.children.length; i++){
		var child = carObject.mesh.children[i];

		// Keep invisible headlight target helpers alone; only hide/show actual meshes.
		if(child.isMesh && child.name !== 'selected-glb-vehicle'){
			child.visible = visible;
		}
	}
}




function create_character(){

	car = new Car();

	// Add car lights to SCENE.scene
	for(var i = 0; i < car.lights.length; i++){
		SCENE.scene.add(car.lights[i]);
	}

	var car_scale = 1;
	var curve_offset = 1;

	car.mesh.scale.set(car_scale, car_scale, car_scale);
	
	// Calculate position depending on world_angle using trigonometry
	car.mesh.position.z = Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset);
	car.mesh.position.y = Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - curve_offset) - 600;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;
	car.mesh.rotation.x = Math.atan(slope) + Math.PI/2;
	car.mesh.castShadow=true;
	car.mesh.receiveShadow = true;

	SCENE.scene.add(car.mesh);
	apply_selected_vehicle_to_car(car);

}



function create_environment(world_radius=600, world_width=400){

	road = new Road(false, world_radius, world_width);
	road.mesh.position.y = -world_radius;
	road.mesh.receiveShadow = true;
	SCENE.scene.add(road.mesh);


	sky = new Sky(60, 1000, 800, 50);
	sky.mesh.position.y = -world_radius;
	SCENE.scene.add(sky.mesh);

}



function game_loop(){

	requestAnimationFrame(game_loop);
	
	// Add correct codition
	if(!GAME.paused){

		road.update();

		sky.mesh.rotation.x += 0.003;

	}	

	if(GAME.started && !GAME.paused) {

		GAME.distance++;
		
		check_collision(car.mesh.children[0]);

		// ARCHITECTURE: Combine these in a smart way (minimizing coupling) (1)
		car.update();
		car_movement();

		update_distance_display();

	}


	if(!GAME.ended && GAME.health <= 0 && !GAME.paused){
		end_game();
	}

	SCENE.renderer.render(SCENE.scene, camera);

}

function input_handler(event){

	// Change input  collection from scene_width to center +- scene_width/2
	var movement_speed = 0.3;
	var x = ((event.clientX/SCENE.WIDTH)*2 - 1)/movement_speed; // value between -1 and 1
	var y = (event.clientY/SCENE.HEIGHT)*2 - 1;// value between -1 and 1

	mouse = {x:x, y:y};

}

function touch_input_handler(event) {

	var movement_speed = 0.3;
    // event.preventDefault();
    
    var tx = (-1 + (event.touches[0].pageX / SCENE.WIDTH)*2)/movement_speed;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;

    mouse = {x:tx, y:ty};
}


function car_movement(){

	var speed = 0.03;

	var target_x = map(Math.min(Math.max(mouse.x, -1), 1), -1, 1, -150, 150);
	var target_y = map(mouse.y, -1, 1, 25, 175);

	var error = target_x - car.mesh.position.x;

	car.mesh.position.x += error*speed;

	var slope = -(car.mesh.position.y + 600)/car.mesh.position.z;

	var target_angle = Math.atan(slope) + Math.PI/2;
	car.mesh.rotation.x -= 0.1*(car.mesh.rotation.x - target_angle);


	car.mesh.position.z -= 0.04*(car.mesh.position.z - Math.cos(deg2rad(world_angle))*(world_radius + car.ground_offset - 1));
	car.mesh.position.y -= 0.04*(car.mesh.position.y - Math.sin(deg2rad(world_angle))*(world_radius + car.ground_offset - 1) + 600);


	car.wheel_mesh_array[2].rotation.y = -error*error*error*0.0000003 + Math.PI;
	car.wheel_mesh_array[3].rotation.y = -error*error*error*0.0000003;
	
	car.set_angle(-(target_x - car.mesh.position.x)*0.002);
	
}

function make_transparent(object, opacity){
	object.material.transparent = true;
	if(object.material.opacity != 0) object.material.opacity = opacity;
}



// ARCHITECTURE: Refactor collision system into neater implementation
function check_collision(Player){

	// TODO: (2) Improve collision system such as to have custom collision effects.
	//  depending on which side of the car the collision occured

	// var Player = SCENE.scene.getObjectByName('car');
	var originPoint = car.mesh.position.clone();
	for (var vertexIndex = 0; vertexIndex < Player.geometry.vertices.length; vertexIndex++){       
	    
	    var localVertex = Player.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(Player.matrix);
        var directionVector = globalVertex.sub(Player.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

        // Check obstacle collision
	    for(var tree_index = 1; tree_index < road.obstacles.length; tree_index++){

	    	// For performance increase, check less collisions, only imminent
	    	if(road.obstacles[tree_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.obstacles[tree_index].tree.collision_box);
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.obstacles[tree_index].hit){
	            
            		c = SCENE.sfx.hit_sfx.cloneNode();
            		c.play();

            		car.mesh.rotation.x += Math.PI/14; 
            		car.mesh.position.z += 60;
            		car.mesh.position.y -= 20;

	            	road.obstacles[tree_index].hit = true;
	            	var obj = road.obstacles[tree_index].tree.mesh;
					for(var j = 0; j < obj.children.length; j++){
						make_transparent(obj.children[j], 0.4);
					}	        	

					GAME.health -= 10;

					if(GAME.score < 0 ) {

						GAME.score = 0;
					}
					update_health_display();
					update_score_display();

				}
	        }
	    }

	    // Check collectable collision
	    for(var collectable_index = 0; collectable_index < road.collectables.length; collectable_index++){

	    	// Obstacles and collectables have same y and z values
	    	if(road.collectables[collectable_index].empty) continue;
	    	if(road.obstacles[collectable_index].global_y < car.mesh.position.y - 20) continue;

	    	var collision_results = ray.intersectObject(road.collectables[collectable_index].collectable.collision_box);
	    	
	    	if (collision_results.length > 0 && collision_results[0].distance < directionVector.length()) {

            	if(!road.collectables[collectable_index].hit){
	            	
            		c = SCENE.sfx.ding_sfx.cloneNode();
            		c.play();

            		GAME.score += 10;
            		
            		// Level up
            		if(GAME.score > 100) {

            			GAME.score = 0;
            			GAME.level++;

            			GAME = increase_difficulty(GAME);
            			update_level_display();


            			// DESIGN: (3) Check the balance of this feature
            			// if(GAME.level % 10 == 0){
            			// 	GAME.health = 100;
            			// }
            			// update_health_display();

            		}

            		// Update onscreen score
            		update_score_display();

	            	road.collectables[collectable_index].hit = true;
	            	var obj = road.collectables[collectable_index].collectable.mesh;

	            	// Delete object upon collision
					road.mesh.remove(obj);

					// TODO: (2) Add particle effect explosion upon destruction


					
				}
	        }
	    }

	}
}









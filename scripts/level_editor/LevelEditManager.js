var level_edit_mouse_down = false;
var potential_level_edit_entity;
var leee_offset_x;
var lee_offset_y;
var level_edit_entity;
var level_edit_entity_grav_acc;
var level_edit_object_is_tile = false;
var level_edit_tileset_ctx;

var level_edit_tile_img_x = 0;
var level_edit_tile_img_y = 0;

function InitLevelEdit(){
	$("level_edit_buttons").style.display="block";
	
	function keypress(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) { //Enter keycode                        
			e.preventDefault();
			ledit_change_room_size();
		}
	}
	$("room_width").onkeypress = keypress;
	$("room_height").onkeypress = keypress;
	level_edit = true;
}

function DisableLevelEdit(){
	$("level_edit_buttons").style.display="none";
	level_edit = false;
}

function leditCreateContextMenu(x, y, tile_x, tile_y){
	var ctx_menu = CtxMenu.Init(x, y, document.body);
	ctx_menu.Open();
	
	//EDIT OPTIONS
	var entity = room.GetEntityAtXY(x, y);
	if (entity !== undefined){
		//EDIT NPC options
		if (entity instanceof NPC){
			ctx_menu.AddItem("edit npc", function(){
				room.paused = true;
				var options = this.GenerateOptions();
				Dialog.Confirm("", options.submit, "edit npc", "edit", 
					function(){ room.paused = false; }
				);
				Dialog.AddElement(options.dom);
			}.bind(entity));
		}
		ctx_menu.AddDivider();
	}
	
	//CREATION OPTIONS
	ctx_menu.AddItem("new npc", function(){
		room.paused = true;
		var npc = new NPC(tile_x * Tile.WIDTH - 8, tile_y * Tile.HEIGHT - 8);
		var options = npc.GenerateOptions();
		Dialog.Confirm("", function(){
				options.submit();
				room.entities.push(npc);
			},
			"new npc", "create",
			function(){ room.paused = false; }
		);
		Dialog.AddElement(options.dom);
	}.bind(this));
	ctx_menu.AddItem("new checkpoint", function(){
		var checkpoint = new Checkpoint(tile_x * Tile.WIDTH - 8, tile_y * Tile.HEIGHT - 8);
		room.entities.push(checkpoint);
	}.bind(this));
}

function DrawLevelEditGrid(ctx, room){
	return;
	
	var color = "#000000";
	
	var ax = (-room.camera.x + room.camera.screen_offset_x) % Tile.WIDTH;
	var ay = (-room.camera.y + room.camera.screen_offset_y) % Tile.HEIGHT;
	for (var i = 1; i < ~~(GAME_WIDTH/Tile.WIDTH)+1; i++){
		drawLine(ctx, color, ax+ i * Tile.WIDTH, 0, ax + i * Tile.WIDTH, room.SCREEN_HEIGHT, 0.5);
	}
	
	for (var i = 1; i < ~~(GAME_HEIGHT/Tile.HEIGHT)+1; i++){
		drawLine(ctx, color, 0, ay + i * Tile.HEIGHT, room.SCREEN_WIDTH, ay + i * Tile.HEIGHT, 0.5);
	}
}

function TileSetMouseDown(e){
	if(!level_edit) return;
	
	e.preventDefault();
	var box = $("tileset_canvas").getBoundingClientRect();
	var x = (e.clientX - box.left);
	var y = (e.clientY - box.top);
	var tile_x = Math.floor(x / Tile.WIDTH);
	var tile_y = Math.floor(y / Tile.HEIGHT);
	LeditSetTileImage(tile_x, tile_y);
}

function LeditSetTileImage(tile_x, tile_y){
	level_edit_tile_img_x = tile_x;
	level_edit_tile_img_y = tile_y;
	
	level_edit_tileset_ctx.canvas.width = level_edit_tileset_ctx.canvas.width;
	
	level_edit_tileset_ctx.lineWidth="1";
	level_edit_tileset_ctx.strokeStyle = "#ffffff";
	level_edit_tileset_ctx.rect(tile_x * Tile.WIDTH, tile_y * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
	level_edit_tileset_ctx.stroke();
}

function LevelEditMouseDown(e){
	if (!level_edit) return;
	e.preventDefault();
	level_edit_mouse_down = true;
	
	var right_click = (e.which === 3 && e.button === 2);
	var box = canvas.getBoundingClientRect();
	var x = (e.clientX - box.left) / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = (e.clientY - box.top) / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = Math.floor(x / Tile.WIDTH);
	var tile_y = Math.floor(y / Tile.HEIGHT);
	
	/*if (level_edit_object_is_tile){
		var tile = room.tiles[tile_y][tile_x];
		tile.kill_player = false;
		tile.tileset_x = level_edit_tile_img_x;
		tile.tileset_y = level_edit_tile_img_y;
		if (e.which === 3 && e.button === 2){ //RIGHT CLICK. REMOVE Tile
			tile.collision = Tile.GHOST;
			tile.tileset_x = 0;
			tile.tileset_y = 0;
		}else{
			switch (level_edit_object){
				case Tile.SOLID:
					tile.collision = Tile.SOLID;
					break;
				case Tile.SUPER_SOLID:
					tile.collision = Tile.SUPER_SOLID;
					break;
				case Tile.FALLTHROUGH:
					tile.collision = Tile.FALLTHROUGH;
					break;
				case Tile.KILL_PLAYER:
					tile.collision = Tile.KILL_PLAYER;
					tile.kill_player = true;
					break;
				default:
					tile.collision = Tile.GHOST;
					break;
			}
		}
	}
	else{
		if (level_edit_object == 'player'){
			room.player.x = x - (room.player.rb/2);
			room.player.y = y - room.player.bb;
		}
		else{
			if (e.which === 3 && e.button === 2){ //RIGHT CLICK. REMOVE OBJ IF UNDER
				for (var i = room.entities.length-1; i >= 0; i--){
					if (room.entities[i].IsPointColliding(x, y)){
						room.entities.splice(i, 1);
					}
				}
			}else{
				x = tile_x * Tile.WIDTH;
				y = tile_y * Tile.HEIGHT;
				var obj = eval(level_edit_object);
				obj.x = x;
				obj.y = y;
				obj.original_x = x;
				obj.original_y = y;
				room.entities.push(obj);
			}
		}
	}*/
	
	if (!right_click && potential_level_edit_entity !== undefined){
		level_edit_entity = potential_level_edit_entity;
		level_edit_entity_grav_acc = level_edit_entity.grav_acc;
		level_edit_entity.grav_acc = 0;
		potential_level_edit_entity = undefined;
		document.body.style.cursor = "-webkit-grabbing";
		
		leee_offset_x = level_edit_entity.x - x;
		leee_offset_y = level_edit_entity.y - y;
	}
}

function LevelEditMouseMove(e){
	if (!level_edit) return;
	if (level_edit_mouse_down && level_edit_object_is_tile){
		LevelEditMouseDown(e);
		return;
	}
	
	var box = canvas.getBoundingClientRect();
	var x = (e.clientX - box.left) / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = (e.clientY - box.top) / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = x / Tile.WIDTH;
	var tile_y = y / Tile.HEIGHT;
	
	var entity = room.GetEntityAtXY(x, y);
	if (level_edit_entity === undefined){
		if (entity !== undefined){
			document.body.style.cursor = "-webkit-grab";
			potential_level_edit_entity = entity; 
		}
		else{
			document.body.style.cursor = "auto";
		}
	}else{
		level_edit_entity.x = ~~((x + leee_offset_x) / (Tile.WIDTH / 2));
		level_edit_entity.x *= (Tile.WIDTH / 2);
		level_edit_entity.y = ~~((y + leee_offset_y) / (Tile.HEIGHT / 2));
		level_edit_entity.y *= (Tile.HEIGHT / 2);
		
		level_edit_entity.original_x = level_edit_entity.x;
		level_edit_entity.original_y = level_edit_entity.y;
	}
}

function LevelEditMouseUp(e){
	if (!level_edit) return;
	level_edit_mouse_down = false;
	var right_click = (e.which === 3 && e.button === 2);
	
	var box = canvas.getBoundingClientRect();
	var x = (e.clientX - box.left) / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = (e.clientY - box.top) / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = x / Tile.WIDTH;
	var tile_y = y / Tile.HEIGHT;
	
	if (level_edit_entity !== undefined){
		document.body.cursor = "auto";
		level_edit_entity.grav_acc = level_edit_entity_grav_acc;
		level_edit_entity = undefined;
	}		
		
	//right click
	if (right_click){
		leditCreateContextMenu(x, y, tile_x, tile_y);
	}
}

function ledit_change_room_size(){
	room.ChangeSize($("room_width").value, $("room_height").value);
}

function ledit_change_glitch(){
	room.glitch_sequence = [eval(ledit_getSelected("glitch_options"))];
	room.glitch_index = 0;
	room.glitch_type = room.glitch_sequence[0];
	Glitch.TransformPlayer(room, room.glitch_type);
}

function ledit_add_glitch(){
	room.glitch_sequence.push(eval(ledit_getSelected("glitch_options")));
	room.glitch_index = 0;
	room.glitch_time = 0;
}

function ledit_export(){
	$("level_edit_export_text").value = JSON.stringify(room.Export());
}

function ledit_import(){
	var obj_str = $("level_edit_export_text").value;
	try{
		if (obj_str !== null && obj_str !== ""){
			room.Import(JSON.parse(obj_str));
		}
	}catch(e){
		console.log(e);
	}
}

function ledit_reset(){
	room = new Room();
	$("room_width").value = room.SCREEN_WIDTH;
	$("room_height").value = room.SCREEN_HEIGHT;
}

function ledit_reset_house(){
	room_manager.Reset();
}

function ledit_getSelected(drop_down){
	var e = $(drop_down);
	return e.options[e.selectedIndex].value;
}

function ledit_select(box, obj_type){
	level_edit_mouse_down = false;
	$("tileset_canvas").style.display="none";

	var selected = getElementsByClass("selected_object_box");
	if (selected.length > 0){
		selected[0].className = "object_box";
	}

	box.className = "selected_object_box";
	
	level_edit_object_is_tile = false;
	switch (obj_type){
		case Tile.SOLID:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.SOLID;
			LeditSetTileImage(0, 1);
			break;
		case Tile.SUPER_SOLID:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.SUPER_SOLID;
			LeditSetTileImage(1, 1);
			break;
		case Tile.FALLTHROUGH:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.FALLTHROUGH;
			LeditSetTileImage(2, 1);
			break;
		case Tile.KILL_PLAYER:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.KILL_PLAYER;
			LeditSetTileImage(0, 3);
			break;
		case Tile.GHOST:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.GHOST;
			LeditSetTileImage(0, 0);
			break;
		default:
			level_edit_object = obj_type;
	}
	
	if (level_edit_object_is_tile){
		$("tileset_canvas").style.display="block";
	}
}
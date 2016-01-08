function NPC(x, y, npc_id){
	GameMover.call(this, x, y, 2, 2, 14, 16, "npc_sheet");
	this.type = "NPC";
	this.name = "NPC";
	this.npc_id = npc_id;
	this.npc_dialog = [];
	this.advanced = false;
	this.dialog_index = 0;
	this.animation.frame_delay = 30;
}
NPC.prototype.Import = function(obj){
	GameMover.prototype.Import.call(this, obj);
	this.npc_id = obj.npc_id;
	this.npc_dialog = obj.npc_dialog || [];
}
NPC.prototype.Export = function(){
	var obj = GameMover.prototype.Export.call(this);
	obj.npc_id = this.npc_id;
	obj.npc_dialog = this.npc_dialog;
	return obj;
}
NPC.prototype.ImportOptions = function(options){
	this.name = options.name.value;
	this.npc_dialog = options.npc_dialog.value;
}
NPC.prototype.ExportOptions = function(){
	var options = {};
	options.name = new TextOption(this.name);
	var dialog = this.npc_dialog;
	if (dialog === undefined || dialog.length <= 0)
		dialog = [this.GetText()];	
	options.npc_dialog = new TextArrayOption(dialog, 210, 69);
	return options;
}
extend(GameMover, NPC);

NPC.prototype.Update = function(map){
	GameMover.prototype.Update.call(this, map);
	
	var d = 16;
	var dy = 8;
	var px = player.x + (player.rb/2);
	if (player.y + player.bb > this.y - dy && player.y < this.y + this.bb + dy){
		if (px < this.x + this.lb && px > this.x + this.lb - d){
			this.facing = Facing.LEFT;
		}
		if (px > this.x + this.rb && px < this.x + this.rb + d){
			this.facing = Facing.RIGHT;
		}
	}
	
	
	//TALK TO PLAYER AND SUCH
	if (this.IsRectColliding(player, this.x+this.lb-Tile.WIDTH, this.y+this.tb, this.x+this.rb+Tile.WIDTH, this.y+this.bb)){
		if (!this.talking) this.advanced = true;
		this.talking = true;
		
		room.Speak(
			((this.name.length > 0) ? (this.name + ": ") : ("")) + this.GetText(),
			240,
			this.npc_dialog.length > 1);
		
		if (player.pressing_down && !this.advanced){
			this.incrementDialog();
			this.advanced = true;
		}
		if (!player.pressing_down)
			this.advanced = false;
	}
	else if (this.talking){
		this.talking = false;
		room.Speak(null);
		//this.incrementDialog();
		this.advanced = false;
	}
}

NPC.prototype.incrementDialog = function(){
	if (!this.npc_dialog) return;
	this.dialog_index++;
	if (this.dialog_index >= this.npc_dialog.length)
		this.dialog_index = 0;
}

NPC.prototype.UpdateAnimationFromState = function(){
	var ani_x = 0;//this.npc_id / 2;
	var ani_y = 0;//this.npc_id % 2;
	this.animation.Change(ani_x, ani_y, 2);
	
	if (this.facing === Facing.LEFT){
		this.animation.abs_ani_y = 2 * this.animation.frame_height;
	}else if (this.facing === Facing.RIGHT){
		this.animation.abs_ani_y = 0;
	}
	this.prev_move_state = this.move_state;
}

NPC.prototype.Render = function(ctx, camera){
	if (this.image === null || !this.visible) return;
	var ani = this.animation;
	var row = ani.rel_ani_y;
	var column = ani.rel_ani_x + ani.curr_frame;
	
	ctx.drawImage(this.image, 
		//SOURCE RECTANGLE
		ani.frame_width * column + ani.abs_ani_x + this.base_ani_x,
		ani.frame_height * row + ani.abs_ani_y + this.base_ani_y,
		ani.frame_width, ani.frame_height,
		//DESTINATION RECTANGLE
		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset, 
		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset,
		ani.frame_width, ani.frame_height
	);
	
	var f = -1;
	if (this.facing === Facing.LEFT) f = 1;
	var v = -this.animation.curr_frame;
	
	//NOW DRAW THE HAT
	if (!room_manager.beat_game) return;
	ctx.drawImage(resource_manager.hat_grey_sheet, 
		//SOURCE RECTANGLE
		ani.frame_width * column + ani.abs_ani_x + this.base_ani_x,
		ani.frame_height * row + ani.abs_ani_y + this.base_ani_y,
		ani.frame_width, ani.frame_height,
		//DESTINATION RECTANGLE
		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset + f, 
		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset - 7 + v,
		ani.frame_width, ani.frame_height
	);
}

//TEXT BABY
NPC.prototype.GetText = function(){
	if (this.npc_dialog && this.npc_dialog.length > 0) 
		return this.npc_dialog[this.dialog_index];
	
	switch (this.npc_id){
		case -1:
			return "hold up or Z to jump higher\n\nthere is no escape";
		case 0:
			return "you must escape\n the labyrinth\nuse arrow keys";
		case 1:
			return "press down to fall\n and to enter doors";
		case 2:
			return "when red, you can\nwalk off cliffs\nwithout falling";
		case 3:
			return "press space bar or numbers\n to cast a spell";
		case 4:
			return "press X to\nplace a memory.\npress X again to forget";
		case 5:
			return "are we free now?";
		case 6:
			return "dying revives you to\nlast checkpoint\ni'm sorry";
		case 7:
			return "remember your wits\n\ndeath is inevitable";
		case 8:
			return "don't afraid of\nfailure\nits all there is";
		case 9:
			return "magick controls\nthe dungeon";
		case 10:
			return "GET\nwitch/rooms/rooms/room_4_5.txt\n404 (File not found)";
		case 11:
			return "patience is a virtue\n\nthat means nothing here";
		case 12:
			return "give up your hope\nbefore you lose it";
		case 13:
			return "there is no real escape";
		case 14:
			return "i believe in you";
		case 15:
			return "nice of you to stop by\nthis is the wrong way";
		case 16:
			return "you escaped!\ncongratulations!";
		case 17:
			return "we knew you could do it!\nwell i did at least";
		case 18:
			return "hip hip hooray!\nyay!!\nyou're the best!";
		case 19:
			if (!room_manager.submitted){
				if (room_manager.num_deaths === 2)
					Trophy.GiveTrophy(Trophy.DEATH);
					Trophy.AddScore(room_manager.num_deaths + " deaths", room_manager.num_deaths, 31465);
				Trophy.AddScore(room_manager.spells_cast + " spells", room_manager.spells_cast, 31464);
				Trophy.AddScore(room_manager.time + " min", room_manager.time, 29967);
				room_manager.submitted = true;
			}
				
			return 	"deaths: " + room_manager.num_deaths + "\n" +
					"spells cast: " + room_manager.spells_cast + "\n" +
					"time: " + room_manager.time + " min";
		case 20:
			if (!room_manager.beat_game){
				Trophy.GiveTrophy(Trophy.HAT);
				Utils.playSound("pickup", master_volume, 0);
			}
			room_manager.beat_game = true;
			return "thanks for playing :)!\n\npress shift+r to restart";
		case 21:
			return "IT'S A SECRET\nTO EVERYBODY.";
		case 99:
			return "go back to the beginning";
		default:
			break;
	}
}
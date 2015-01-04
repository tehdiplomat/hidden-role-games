define(["./base"], function(Base) {

	Player = function() {
		this.name = "";
		this.session = null;
		this.role = null;
		this.hidden = true;

		Base.call(this);
	};

	function Player_getInfo(){
		var info = new Object();
		info['className'] = "Player";
		info['pluralName'] = "Players";
		return info;
	}

	Player.prototype = new Base;
	Player.prototype.constructor = Player;
	Player.prototype.getInfo = Player_getInfo;

	var fields = {
		"name": "string",
		"session": "FK-GameSession",
		"role": "FK-Role",
		"hidden": "bool",
	};
	Utils_addGettersAndSetters(Player, fields);
	return Player;
});
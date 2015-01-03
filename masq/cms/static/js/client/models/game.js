define(["./base"], function(Base) {

	Game = function() {
		this.name = "";

		Base.call(this);
	};

	function Game_getInfo(){
		var info = new Object();
		info['className'] = "Game";
		info['pluralName'] = "Games";
		return info;
	}

	Game.prototype = new Base;
	Game.prototype.constructor = Game;
	Game.prototype.getInfo = Game_getInfo;

	var fields = {
		"name": "string",
	};
	Utils_addGettersAndSetters(Game, fields);
	return Game;
});
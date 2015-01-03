define(["./base"], function(Base) {

	GameSession = function() {
		this.name = "";
		this.game = null;
		this.active = true;

		Base.call(this);
	};

	function GameSession_getInfo(){
		var info = new Object();
		info['className'] = "GameSession";
		info['pluralName'] = "GameSessions";
		return info;
	}

	GameSession.prototype = new Base;
	GameSession.prototype.constructor = GameSession;
	GameSession.prototype.getInfo = GameSession_getInfo;

	var fields = {
		"name": "string",
		"game": "FK-Game",
		"active": "bool",
	};
	Utils_addGettersAndSetters(GameSession, fields);
	return GameSession;
});
require([
		"controllers/baseController",

		//models
		"models/game",
		"models/gameSession"
	],
	function(BaseController) {

	function StartController() {
		BaseController.call(this);

		this.fieldsToLoad = ["game", "gameSession"];

		this.genericOnLoad();

		this.setHandlers();
	}

	function StartController_setHandlers() {
		this.setGenericHandlers();
	}


	StartController.prototype = new BaseController;
	StartController.prototype.constructor = StartController;
	StartController.prototype.setHandlers = StartController_setHandlers;
	new StartController();
});
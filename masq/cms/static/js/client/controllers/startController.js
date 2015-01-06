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
		this.setGameHandlers();
	}

	function StartController_setGameHandlers() {
		$(".hostSession").click(function() {
			// Test that all the forms are filled out.
			// Create new gameSession
			var gs = new GameSession();
			gs.setGame($(".gameSelect").val());
			gs.setName($(".sessionName").val());
			gs.create({ callback: function() {
				// Move user to lobby
				var href = window.location.pathname.replace('start', 'lobby') + '/' + gs.getId() + '/' + '?init=host';
				window.location.href = href;		
			}});
		});
	}


	StartController.prototype = new BaseController;
	StartController.prototype.constructor = StartController;
	StartController.prototype.setHandlers = StartController_setHandlers;
	StartController.prototype.setGameHandlers = StartController_setGameHandlers;
	new StartController();
});
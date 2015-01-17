require([
		"controllers/baseController",

		//models
		"models/game",
		"models/gameSession",
		"models/player"
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
		var copy = this;
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

		$(".sessionSelect").change(function() {
			try{
				var gs = copy.gameSessions[$(this).val()];
				$(".gameRejoin").val(copy.games[gs.getGameId()].getName());
			} catch(Exception) {
				$(".gameRejoin").val("");
			}
		});

		$(".rejoinSession").click(function() {
			var sessionId = $(".sessionSelect").val();
			if (sessionId != 0) {
				var getParams = "&name=" + $(".handleRejoin").val() + "&pin=" + $(".pinRejoin").val();

				var href = window.location.pathname.replace('start', 'lobby') + '/' + sessionId + '/' + '?init=rejoin'  + getParams;
				window.location.href = href;
			}
		});

		if ('localId' in window.localStorage) {
			$(".loadPlayer").show();
		} else {
			$(".loadPlayer").hide();
		}

		$(".loadPlayer").click(function() {
			var pl = new Player();
			pl.getById({id: window.localStorage['localId'], callback: function() {
				if (pl.failed) {
					console.log(pl.response);
				} else {
					$(".sessionSelect").val(pl.getSessionId());
					$(".sessionSelect").change();
					$(".handleRejoin").val(pl.getName());
					//$(".pinRejoin").val(pl.getPin());
				}
			} });
		});
	}


	StartController.prototype = new BaseController;
	StartController.prototype.constructor = StartController;
	StartController.prototype.setHandlers = StartController_setHandlers;
	StartController.prototype.setGameHandlers = StartController_setGameHandlers;
	new StartController();
});
require([
		"controllers/baseController",
		"qrcode",
		

		//models
		"models/game",
		"models/gameSession",
		"models/role",
		"models/affiliation",
		"models/player"
	],
	function(BaseController) {

	function LobbyController() {
		BaseController.call(this);

		this.fieldsToLoad = ["games", "gameSessions", "players", "affiliations", "roles"];

		this.genericOnLoad();

		this.setHandlers();
	}

	function LobbyController_setHandlers() {
		this.setGenericHandlers();
		if (!this.initiateLocalPlayer()) 
			return;
		this.genericSubscribePusher("player" + local);
		this.setGameHandlers();
		this.setInviteHandler();
	}

	function LobbyController_initiateLocalPlayer() {
		if (local) {
			window.localStorage['localId'] = local;
		} else if ('localId' in window.localStorage) {
			if (window.localStorage['localId'] in this.players)
				local = window.localStorage['localId'];
		} else {
			// No localId and no localStorage with the id that means this player... doesn't exist.
			// Spit out error with message on how to join, or rejoin
			alert("Error message goes here")

			return false;
		}

		this.player = this.players[local];

		$(".playerName").val(this.player.getName());
		$(".playerPin").val(this.player.getPin());
		$(".playerHost").prop('checked', this.player.getHost());

		return true;
	}

	function LobbyController_setGameHandlers() {
		var copy = this;
		$(".editPlayer").click(function() {
			var fields = ["name", "pin"];

			copy.player.setName($(".playerName").val());
			copy.player.setPin($(".playerPin").val());
			copy.player.update({callback: function() {
				if (copy.player.failed) {
					console.log(copy.player.response);
					alert("Failed to update your player change")
				} else {
					alert("Updated!");
				}
			}, changedFields: fields});
		});


		$(".startSession").click(function() {
			// Assign the roles 
			var roleList = [];
			$(".roleCheckbox").each(function() {
				if (this.checked) {
					roleList.push($(this).data('id'));
				}
			});

			commandData = {
				'model': 'system',
				'action': 'startSession',
				'roles': roleList.join(),
				'session': Object.keys(copy.gameSessions)[0]
			}
			Utils_sendCommand({'data': commandData}, function() {
				console.log("In callback");
				// DO THINGS
			});
		});
	}

	function LobbyController_setInviteHandler() {
		var copy = this;
		this.inviteQR = new QRCode("inviteQR", {
			text : inviteURL,
			width : 128,
			height : 128
		});
	}


	LobbyController.prototype = new BaseController;
	LobbyController.prototype.constructor = LobbyController;
	LobbyController.prototype.setHandlers = LobbyController_setHandlers;
	LobbyController.prototype.initiateLocalPlayer = LobbyController_initiateLocalPlayer;
	LobbyController.prototype.setGameHandlers = LobbyController_setGameHandlers;
	LobbyController.prototype.setInviteHandler = LobbyController_setInviteHandler;
	new LobbyController();
});
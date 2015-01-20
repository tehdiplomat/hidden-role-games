require([
		"controllers/baseController",		

		//models
		"models/game",
		"models/gameSession",
		"models/role",
		"models/affiliation",
		"models/player"
	],
	function(BaseController) {

	function TworoomsController() {
		BaseController.call(this);

		this.fieldsToLoad = ["games", "gameSessions", "players", "affiliations", "roles"];

		this.genericOnLoad();

		this.setHandlers();
	}

	function TworoomsController_setHandlers() {
		this.setGenericHandlers();
		if (!this.initiateLocalPlayer()) 
			return;
		this.genericSubscribePusher("presence-game" + this.session.id);
		this.setPushHandlers();

		this.setDomState();
		this.setPanelControllers();
	}

	function TworoomsController_initiateLocalPlayer() {
		// I'm not sure I need this function at all I think
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

		return true;
	}

	function TworoomsController_setDomState() {
		// TODO Check for Player presence in the push server


		// TODO Check which Roles are already assigned into the session
		//console.log(this.session.roles);
		for(var role in this.roles) {
			var roleDom = $(".role[data-id='"+ role + "']");
			var flag = this.session.roles.indexOf(parseInt(role)) > -1;
			this.roleActivation(roleDom, flag, false);
		}
		this.updateCounts();
	}

	function TworoomsController_roleActivation(roleDom, flag, update) {
		// Activate when flag = true
		// Deactivate when flag = falsa
		if (flag) {
			if (roleDom.parent().hasClass("inactiveRoles")) {
				roleDom.appendTo(".activeRoles");
			}
		} else {
			if (roleDom.parent().hasClass("activeRoles")) {
				roleDom.appendTo(".inactiveRoles");
			}
		}
		// Update numbers in each column
		if (update) {
			this.updateCounts();
		}
	}

	function TworoomsController_updateCounts() {
		$(".roleCount", ".inactiveRoles").text($("li", ".inactiveRoles").length);
		$(".roleCount", ".activeRoles").text($("li", ".activeRoles").length);

		$(".playerCount", ".playerPanel").text($("li", ".playerPanel").length);
	}

	function TworoomsController_setPushHandlers() {
		var copy = this;
		this.channel.bind('pusher:subscription_succeeded', function() {
			copy.channel.members.each(function(member) {
				activateMember(member, true);
			});
		});
		// Bind to other channels
		this.channel.bind('pusher:member_added', function(member) {
		// for example:
			activateMember(member, true);
		});

		this.channel.bind('pusher:member_removed', function(member) {
			// for example:
			activateMember(member, false);
		});

		function activateMember(member, flag) {
			var userInfo = member.info;
			console.log(userInfo);
			var roleDom = $(".player[data-id='"+ userInfo['id'] + "']");
			if (flag) {
				$(".playerIcon", roleDom).addClass("active").removeClass("waiting");
			} else {
				$(".playerIcon", roleDom).addClass("waiting").removeClass("active");
			}
		}

		this.channel.bind('game', function(data) {
			
			if (data['action'] == 'roundStart') {
				// Assign all of this information into appropriate DOM spots
			} else {
				console.log(data);
			}
		});
	}

	function TworoomsController_setPanelControllers() {
		var copy = this;
		function activatePanel(panel) {
			$(".panel").removeClass("active");
			$("."+panel).addClass("active");
		}

		$(".startRound").click(function() {
			activatePanel("roundPanel");

			if (copy.session.getCurrentRound() >= copy.session.getRounds()) {
				// No more rounds are to be played
				console.log("This is the last round. Nothing to start anymore.");
			}

			commandData = {
				'model': 'system',
				'action': 'startRound',
				'currentRound': copy.session.getCurrentRound(),
				//'roles': roleList.join(),
				'session': copy.session.getId()
			}
			Utils_sendCommand({'data': commandData}, function() {
				console.log("In callback");
				// DO THINGS
			});
		});

		$(".displayTimer").click(function() {
			activatePanel("roundPanel");

		});

		$(".colorReveal").click(function() {
			activatePanel("colorPanel");
		});

		$(".cardReveal").click(function() {
			activatePanel("cardPanel");
		});

	}


	TworoomsController.prototype = new BaseController;
	TworoomsController.prototype.constructor = TworoomsController;
	TworoomsController.prototype.setHandlers = TworoomsController_setHandlers;
	TworoomsController.prototype.initiateLocalPlayer = TworoomsController_initiateLocalPlayer;
	TworoomsController.prototype.setDomState = TworoomsController_setDomState;
	TworoomsController.prototype.roleActivation = TworoomsController_roleActivation;
	TworoomsController.prototype.updateCounts = TworoomsController_updateCounts;
	TworoomsController.prototype.setPushHandlers = TworoomsController_setPushHandlers;
	TworoomsController.prototype.setPanelControllers = TworoomsController_setPanelControllers;
	new TworoomsController();
});
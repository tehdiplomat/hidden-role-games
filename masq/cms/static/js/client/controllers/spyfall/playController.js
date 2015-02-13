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
		this.secondsRemaining = -1;

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
		this.setTimerHandler();
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

		this.player = this.players[local];
		this.session = this.gameSessions[this.player.getSession()];

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
			console.log(data);
			if (data['action'] == 'roundStart') {
				// Assign all of this information into appropriate DOM spots
				copy.secondsRemaining = data['secondsRemaining'];
				copy.session.currentRound = data['round'];
				$(".timeRemaining").text(copy.secondsRemaining);
				$(".currentRound").text(copy.session.currentRound);
				$(".hostages").text(hostages[copy.session.currentRound-1]);		
				$(".startRound").prop("disabled",true);

			} else {
				
			}
		});
	}

	function TworoomsController_setPanelControllers() {
		var copy = this;

		$(".startRound").click(function() {
			activatePanel("roundPanel");
			$(".startRound").prop("disabled",true);

			if (copy.session.getCurrentRound() >= copy.session.getRounds()) {
				// No more rounds are to be played
				console.log("This is the last round. Nothing to start anymore.");
				return;
			}

			commandData = {
				'model': 'system',
				'action': 'startRound',
				'currentRound': copy.session.getCurrentRound(),
				'session': copy.session.getId()
			}
			Utils_sendCommand({'data': commandData}, function() {
				//console.log("In callback");
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

		$(".sound").click(function() {
			var alarm = $(".alarm")[0];
			var warn = $(".minuteWarning")[0];
			$(this).hide();
			alarm.muted = true;
			warn.muted = true;
			alarm.play();
			warn.play();

			setTimeout(function() {
				alarm.muted = false;
				warn.muted = false;
			}, 5000);
		});

	}

	function TworoomsController_setTimerHandler() {
		var copy = this;

		setInterval(function() {
			if (copy.secondsRemaining >= 0) {
				copy.secondsRemaining--;
			}

			var time;
			if (copy.secondsRemaining == -1) {
				if (copy.session.currentRound == 0) {
					time = "Ready?";
				} else if (copy.session.currentRound < copy.session.rounds) {
					time = "Round Over";
				} else {
					time = "Game Over";
				}
				
			} else {

				var seconds = copy.secondsRemaining % 60,
					minutes = Math.floor(copy.secondsRemaining / 60);

				var formatting;
				if (seconds < 10) {
					formatting = ":0";
				} else {
					formatting = ":";
				}

				time = minutes + formatting + seconds;
			}
			$(".timeRemaining").text(time);

			if (copy.secondsRemaining == 0) {
				// Alert players!! 
				if (copy.session.currentRound < copy.session.rounds) {
					$(".alarm")[0].play();
					$(".startRound").prop("disabled",false);
					alert("ROUND OVER");					
				} else {
					$(".alarm")[0].play();
					alert("LAST ROUND OVER.. ");
					activatePanel("endPanel");
				}

				// TODO Play a sound
			} else if (copy.secondsRemaining == 60) {
				$(".minuteWarning")[0].play();
			}

		}, 1000);

		if (this.session.currentRound > 0) {
			// Reloaded page in the middle of a round. Try to calculate time remaining in round.
			var diffSeconds = (Date.now() - roundStart) / 1000;
			copy.secondsRemaining = Math.max(-1, Math.floor(roundTime - diffSeconds));
			$(".hostages").text(hostages[this.session.currentRound-1]); 

			if (copy.secondsRemaining > 0) {
				$(".startRound").prop("disabled",true);
			} else {
				if (this.session.currentRound >= this.session.rounds) {
					activatePanel("endPanel");
				}
			}
		}
	}


	function activatePanel(panel) {
		$(".panel").removeClass("active");
		$("."+panel).addClass("active");
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

	TworoomsController.prototype.setTimerHandler = TworoomsController_setTimerHandler;
	new TworoomsController();
});
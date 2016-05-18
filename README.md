hidden-role-games
=================

Forgot the hidden role cards to your favorite Board Game? Fret not, behold the power of the internet and smart phones, where players connect to a single game and receive their role right on their phone. (Along with additional rules info that might otherwise give away hidden information).


The UI was designed to have multiple views that a user can toggle quickly on their Phone for seeing their role, general game information, and some references for the specific game. Since the target deployment server doesn't currently have access to Node.js, a free Server Push service called Pusher is being used for this project. At some point in the future, this will be made more generic and enabled by server settings.

Currently functioning for Two Rooms and a Boom and mostly functioning for Spyfall. Still a little rough around the edges as we focus on the function first.
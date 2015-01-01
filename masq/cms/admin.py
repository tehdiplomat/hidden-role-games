from django.contrib import admin

# Register your models here.
from cms.models.Game import Game, GameAdmin
from cms.models.GameSession import GameSession, GameSessionAdmin
from cms.models.Player import Player, PlayerAdmin
from cms.models.Role import Role, RoleAdmin
from cms.models.Affiliation import Affiliation, AffiliationAdmin

admin.site.register(Game, GameAdmin)
admin.site.register(GameSession, GameSessionAdmin)
admin.site.register(Player, PlayerAdmin)
admin.site.register(Role, RoleAdmin)
admin.site.register(Affiliation, AffiliationAdmin)
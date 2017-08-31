"use strict";

function playIteration(target) {
    // Unit.activateNextUnit();
    if (Unit.active.isPlayer) {
        Unit.active.runAction(target);
    } 
    AiStart();
}

function AiStart() {
    for (var i = 0; i < Unit.all().length; i++) {

        setTimeout(function() {
            if (!Unit.active.isPlayer) {
                Unit.active.runAction(Unit.player);
            }

        }, 1000/settings.gameSpeed * (i + 1));

    }
}

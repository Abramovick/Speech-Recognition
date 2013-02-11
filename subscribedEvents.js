// All custom Events subscribes
(function(player, pubSub, speechRecog) {
	// Custom Events for the YouTube player that can be used to override a youtube event
	pubSub.subscribe('readyOverride', function(){})
	pubSub.subscribe('stateChangeOverride', function(){})
	pubSub.subscribe('errorOverride', function(){})
	pubSub.subscribe('playbackQualityChangeOverride', function(){})
	pubSub.subscribe('playbackRateChangeOverride', function(){})

	// Custom Events for the YouTube player to do basic actions like play/pause/stop
	pubSub.subscribe('play', function() {
		player.playVideo()
	})

	pubSub.subscribe('pause', function() {
		player.pauseVideo()
	})

	pubSub.subscribe('stop', function() {
		player.stopVideo()
	})

	pubSub.subscribe('ended', function() {
		console.log('video has finished playing')
	})

	// Custom Events for speech Recognition
	pubSub.subscribe('speechRecogResults', function(finalWords) {
		var strng = speechRecog.trim(finalWords.transcript)

		if (finalWords.confidence >= 0.4 ) {
			console.log('Computer heard: "' + strng + '"')
		} else {
			console.log('Did you say: "' + strng + '?"')
		}

		switch(speechRecog.matchWord(finalWords.transcript, strng)) {
			case 'play' : {
				pubSub.on('play')
			}
			break;

			case 'POS' :
			case 'pause' : {
				pubSub.on('pause')
			}
			break;

			case 'stop' : {
				pubSub.on('stop')
			}
			break;

			default : {
				console.log('No handler for the word(s): ' + strng)
			}
			break;
		}
	})
})(window.APP.instance, window.APP.pubSub, window.APP.rg)
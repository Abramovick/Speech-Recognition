/* Author: Abraham Itule */

(function() {
	/*
	 *	Exposes the functionality of the video player to be used at one's discretion
	 *
	 *	@param {String} name - The ID of the HTML element to be replaced with the iframe & video
	 *	@return {Void} 
	 */
	function VideoPlayer(name) {
		// instance variable declarations
		this._name = name
		this._index = 0
		this._videoList = null
		this.player = null

		// Load the YouTube Iframe API code from youtube.com
		var tag = document.createElement('script')
		tag.src = '//www.youtube.com/iframe_api'

		var firstSTag = document.getElementsByTagName('script')[0]
		firstSTag.parentNode.insertBefore(tag, firstSTag)
	}


	/*
	 *	Initiliazes the YouTube API
	 *	Note: This should be invoked inside the onYouTubePlayerAPIReady() function
	 *
	 *	@param {Object} config - configuration settings for the video player
	 *	@return {Void}
	 */
	VideoPlayer.prototype.init = function(config) {
		console.log('Video-player State: "running initilization"')

		this.player = new YT.Player(this._name, {
			height: config.height || '390',
			width: config.width || '680',
			videoId: config.videoId,
			events: {
				'onReady': this._callbacks._playerReady,
				'onStateChange': this._callbacks._playerStateChange,
				'onError': this._callbacks._playerError,
				'onPlaybackQualityChange': this._callbacks._playerPlaybackQualityChange,
				'onPlaybackRateChange': this._callbacks._playerPlaybackRateChange
			}
		})

		return this
	}


	VideoPlayer.prototype._callbacks = {
		/*
		 *	Default event listener when the player is ready!
		 *	It's idealy a fallback when a custom listener is NOT added
		 *
		 *	@param {Object} event - Native YouTube API event object
		 *	@return {Void}
		 */
		'_playerReady' : function(event) {
			event.target.setVolume(100)
			event.target.playVideo()

			window.APP.pubSub.on('readyOverride', event)
		},


		/*
		 *	Default event listener when the player state changes!
		 *	It's idealy a fallback when a custom listener is NOT added
		 *
		 *	@param {Object} event - Native YouTube API event object
		 *	@return {Void}
		 */
		'_playerStateChange' : function(event) {
			switch(event.data){
				case YT.PlayerState.PLAYING : {
					console.log('Video-player State: "video playing"')
				}
				break;
				case YT.PlayerState.ENDED: {
					console.log('Video-player State: "video ended"')
					// raise the custom ended event
					window.APP.pubSub.on('ended')
				}
				break;
				case YT.PlayerState.PAUSED: {
					console.log('Video-player State: "video paused"')

				}
				break;
				case YT.PlayerState.BUFFERING: {
					console.log('Video-player State: "video buffering"')

				}
				break;
				case YT.PlayerState.CUED: {
					console.log('Video-player State: "video cued"')

				}
				break;
			}

			window.APP.pubSub.on('stateChangeOverride', event)
		},


		/*
		 *	Default event listener when an ERROR in the player occurs!
		 *	It's idealy a fallback when a custom listener is NOT added
		 *
		 *	@param {Object} event - Native YouTube API event object
		 *	@return {Void}
		 */
		'_playerError' : function(event) {
			switch(event.data) {
				case 2:
				case '2': {
					console.log('Error: invalid parameter value.')
				}
				break;

				case '5':
				case '5':{
					console.log('Error: requested content cannot be played on HTML5 Player.')
				}
				break;

				case '100':
				case '100':{
					console.log('Error: Video request was not found.')
				}
				break;

				case '101':
				case '101':
				case '150':
				case '150':{
					console.log('Error: Owner of video does not allow to be played in embedde players')
				}
				break;
			}

			window.APP.pubSub.on('errorOverride', event)
		},

		'_playerPlaybackQualityChange' : function() {
			window.APP.pubSub.on('playbackQualityChangeOverride', event)
		},

		'_playerPlaybackRateChange' : function() {

			window.APP.pubSub.on('playbackRateChangeOverride', event)
		}
	}

	/*
	 *	Adds a function to the VideoPlayer prototype
	 *	
	 *	@param {String} name - Name of the function
	 *	@param {Function} func - The function code
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.addMethod = function(name, func, place) {
		console.log('State: Adding a new Method')

		if (place) {
			place[name] = func

			return
		}

		VideoPlayer.prototype[name] = func

		return this
	}


	/*
	 *	Attaches a Listener to the YouTube Event names
	 *	
	 *	@param {String} name - Name of the event
	 *	@param {Function} func - The function code/callback
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.addListener = function(eventName, func) {
		switch(eventName) {
			case 'onReady': {
				this.addMethod('_playerReady', func, this._callbacks );
				console.log('"onReady" Default action overriden')		
			}
			break;

			case 'onStateChange': {
				this.addMethod('_playerStateChange', func, this._callbacks );
				console.log('"onStateChange" Default action overriden')
			}
			break;

			case 'onError': {
				this.addMethod('_playerError', func, this._callbacks );
				console.log('"onError" Default action overriden')
			}
			break;

			case 'onPlaybackQualityChange': {
				this.addMethod('_playerPlaybackQualityChange', func, this._callbacks ); console.log('"onPlaybackQualityChange" Default action overriden')
			}
			break;

			case 'onPlaybackRateChange': {
				this.addMethod('_playerPlaybackRateChange', func, this._callbacks );
				console.log('"onPlaybackRateChange" Default action overriden')
			}
			break;
		}

		return this
	}


	/*
	 *	Sets a playlist
	 *	
	 *	@param {Array} videoList - Array of strings with video ID's inside
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.setVideoList = function(videoList) {
		this._videoList = videoList

		return this
	}


	/*
	 *	Plays the video playlist
	 *
	 *	@return {Object} this - constructor's instance
	 */
	VideoPlayer.prototype.playVideoList = function() {
		this.player.loadVideoById(this._videoList[this._index])

		return this
	}


	/*
	 *	Plays a video in the playlist with a specific ID
	 *
	 *	@param {Number} index - Position of the video in the array
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.playVideoByIndex = function(index) {
		this._index = index
		this.playVideoList()

		return this
	}


	/*
	 *	Plays the video with the specified ID
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.playVideoById = function(id) {
		this.player.loadVideoById(id)

		return this
	}


	/*
	 *	Plays current video
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.playVideo = function() {
		this.player.playVideo()

		return this
	}


	/*
	 *	Pauses current video
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.pauseVideo = function() {
		this.player.pauseVideo()

		return this
	}


	/*
	 *	Seeks to skips to as specified second on the video and automatically plays
	 *
	 *	@param {Number} - Time in seconds to skip to
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.seekToAndPlay = function(secs) {
		this.player.seekTo(secs)
		this.player.playVideo()

		return this
	}


	/*
	 *	Shows the current time of which the video is playing
	 *
	 *	@return {Number} - current playing time
	 */
	VideoPlayer.prototype.getCurrentTime = function() {
		return this.player.getCurrentTime()
	}


	/*
	 *	Plays the next video in the playlist
	 *
	 *	@return {Boolean} - TRUE if possible, FALSE if there is NO next video
	 */
	VideoPlayer.prototype.nextVideo = function() {
		if(this._index + 1 >= this.videoList.length){
			//$(this).trigger('endOfList')
			return false
		}
		this._index++;
		this.playVideoList();
		//$(this).trigger('next')

		return true
	}


	/*
	 *	Stops playing the current video
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.stopVideo = function() {
		this.player.stopVideo()

		return this
	}


	/*
	 *	Sets the volume of the current video
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	VideoPlayer.prototype.setVolume = function(vol) {
		this.player.setVolume(vol)

		return this
	}


	// Expose it to the Global scope (window) as a 'APP' property
	window.APP = window.APP || {}
	window.APP.VideoPlayer = VideoPlayer
})()
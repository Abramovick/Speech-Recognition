/* Author: Abraham Itule */

(function(pubSub) {
	/*
	 *	Exposes the functionality of the Web Speech API to be easily used at one's discretion
	 *
	 *	@return {Void} 
	 */
	function SpeechRecog () {
		this._recognizing = false
		this._speechRecognition = null
	}


	/*
	 *	Instantiates the Web Speech API & runs basic configuration
	 *
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	SpeechRecog.prototype.init = function(config) {
		SpeechRecog.prototype.speechRecognition = this._speechRecognition = window.SpeechRecognition ? new window.SpeechRecognition() : new window.webkitSpeechRecognition()

      	this._speechRecognition.continuous = config.continuous || false
      	this._speechRecognition.interimResults = config.interimResults || false
      	this._speechRecognition.maxAlternatives = config.maxAlternatives || 1

      	this._speechRecognition._rg = this

      	// Sets event listeners to the corresponding SpeechRecognition events 
		this._speechRecognition.onresult = this._callbacks._resultListener
		this._speechRecognition.onstart = this._callbacks._startListener
		this._speechRecognition.onend = this._callbacks._endListener
		this._speechRecognition.onerror = this._callbacks._errorListener
		this._speechRecognition.onnomatch = this._callbacks._noMatchListener
		this._speechRecognition.onsoundstart = this._callbacks._soundStartListener
		this._speechRecognition.onspeechstart = this._callbacks._speechStartListener
		this._speechRecognition.onspeechend = this._callbacks._speechEndListener
		this._speechRecognition.onsoundend = this._callbacks._soundEndListener
		this._speechRecognition.onaudioend = this._callbacks._audioEndListener

		// begins the recognition
		this.startStop()

		return this
	}


	/*
	 *	Contains event listeners for the SpeechRecognition events
	 */
	SpeechRecog.prototype._callbacks = {
		/*
		 *	Callback when the Speech recognizer returns a result
		 */
		'_resultListener': function(event) {
			for (var i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[0].isFinal) {
                	console.log(event.results[i][0])
                	console.log('You said: ' + event.results[i][0].transcript)
                	console.log('Confidence Level: ' + event.results[i][0].confidence)

                    pubSub.on('speechRecogResults', event.results[i][0]);
                }
            }
		},

		/*
		 *	Callback when the recognition service has begun to listen in order to recognize
		 */
		'_startListener': function(event) {
			console.log('SpeechRecognition "start" event raised!')
		},

		/*
		 *	callback when the service has disconnected; Try to reconnect again!
		 */
		'_endListener': function(event) {
			console.log('SpeechRecognition "end" event raised!')
			SpeechRecog.prototype.reset.call(this._rg)
		},
		
		/*
		 *	Callback when the recognizer returns a result with NO hypothesis
		 */
		'_noMatchListener': function() {
			console.log('SpeechRecognition "no match" event raised!')
		},
		
		/*
		 *	Callback when the browser has Stopped/finished capturing audio
		 */
		'_audioEndListener': function() {
			console.log('SpeechRecognition "audio end" event raised!')
		},
		
		/*
		 *	Callback when a Speech Recognition error occurs
		 */
		'_errorListener': function(event) {
			switch(event.error) {
				case 'no-speech': {
					console.log('Error message: "No speech detected!"')
				}
				break;
				case 'aborted': {
					console.log('Error message: "Speech was aborted somehow!"')
				}
				break;
				case 'audio-capture': {
					console.log('Error message: "Audio capture failed!"')
				}
				break;
				case 'network': {
					console.log('Error message: "Network communications required to complete!"')
				}
				break;
				case 'not-allowed': {
					console.log('Error message: "User-agent not allowing any speech input for security reasons!"')
				}
				break;
				case 'service-not-allowed': {
					console.log('Error message: "User-agent not allowing the app\'s requested speech service!"')
				}
				break;
				case 'bad-grammar': {
					console.log('Error message: "Error in the speech recognition grammar!"')
				}
				break;
				case 'language-not-supported': {
					console.log('Error message: "The language is not supported!"')
				}
				break;
			}
		}
	}


	/*
	 *	Sets the current Speech Recognition state
	 *	(TRUE) for Speech Recognition on; (FALSE) for speech recognition off;
	 *
	 *	@return {Boolean} this._recognizing - TRUE/FALSE
	 */
	SpeechRecog.prototype.setRecognitionState = function(state) {
		if (typeof state == "boolean") {
			this._recognizing = state
			console.log('Recognition State set to: ' + this._recognizing)
		}

		return this._recognizing
	}


	/*
	 *	Gets the current Speech Recognition state. 
	 *	(TRUE) for Speech Recognition on; (FALSE) for speech recognition off;
	 *
	 *	@return {Boolean} this._recognizing - TRUE/FALSE
	 */
	SpeechRecog.prototype.getRecognitionState = function() {
		if (this._recognizing) {
			console.log('Web Speech Recognition State: ON (' + this._recognizing + ')')
		} else {
			console.log('Web Speech Recognition State: OFF (' + this._recognizing + ')')
		}

		return this._recognizing
	}


	/*
	 *	Starts/Stops the Speech Recognition depending on the recognition state
	 */
	SpeechRecog.prototype.startStop = function() {
		if (this.getRecognitionState()) {
			console.log('speech recog ended!')
			this._speechRecognition.stop()
			this.setRecognitionState(false)
		} else {
			try {
				this._speechRecognition.start()
				this.setRecognitionState(true)
			} catch(ex) {
				console.log(ex)
				this._speechRecognition.stop()
				console.log('Speech Recognition failed to start.')
			}

			this.getRecognitionState()
		}
	}


	/*
	 *	Assuming the speech recognition state is (OFF), it restarts the recognition;
	 */
	SpeechRecog.prototype.reset = function(event) {
		if (window.location.protocol == 'http:') {
			this.setRecognitionState(false)
			this._speechRecognition.start()
			this.getRecognitionState()
		} else {
			try {
				this.setRecognitionState(false)
				this._speechRecognition.start()
				this.getRecognitionState()
			} catch(ex) {
				console.log(ex)			
				this.getRecognitionState()
			}
		}
	}


	/*
	 *	Matches a word in a string
	 */
	SpeechRecog.prototype.matchWord = function(strng, word, callback) {
		if (strng.indexOf(word) !== -1) {

			if (callback) {
				callback()
			}

			return word
		} else {
			console.log('no such word as: ' + word)

			return false
		}
	}


	/*
	 *	Trims beginning and trailing whitespace
	 *
	 *	@return {String} - A string with the whitespace removed!
	 */
	SpeechRecog.prototype.trim = function (str) {
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}


	/*
	 *	Adds a function to the SpeechRecog prototype
	 *	
	 *	@param {String} name - Name of the function
	 *	@param {Function} func - The function code
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	SpeechRecog.prototype.addMethod = function(name, func, place) {
		if (place) {
			place[name] = func

			return
		}

		SpeechRecog.prototype[name] = func

		return this
	}


	/*
	 *	Attaches a Listener to the SpeechRecognition events
	 *	
	 *	@param {String} name - Name of the event
	 *	@param {Function} func - The function code/callback
	 *	@return {Object} this - 'this' points to the constructor's instance
	 */
	SpeechRecog.prototype.addListener = function(eventName, func) {
		switch(eventName) {
			case 'result': this.addMethod('_resultListener', func, this._callbacks ); 
				console.log('"onresult" Default action overriden')
			break;
			case 'start': this.addMethod('_startListener', func, this._callbacks );
				console.log('"onstart" Default action overriden')
			break;			
			case 'end': this.addMethod('_endListener', func, this._callbacks );
				console.log('"onend" Default action overriden')
			break;			
			case 'error': this.addMethod('_errorListener', func, this._callbacks );
				console.log('"onerror" Default action overriden')
			break;			
			case 'nomatch': this.addMethod('_noMatchListener', func, this._callbacks );
				console.log('"onnomatch" Default action overriden')
			break;
			case 'audioend' : this.addMethod('_audioEndListener', func, this._callbacks);
				console.log('"onaudioend" Default action overriden')	
			break;
			case 'audiostart' : this.addMethod('_audioStartListener', func, this._callbacks);
				console.log('"onaudiostart" Default action overriden')	
			break;
			case 'speechstart' : this.addMethod('_speechStartListener', func, this._callbacks);
				console.log('"onspeechstart" Default action overriden')	
			break;
			case 'speechend' : this.addMethod('_speechEndListener', func, this._callbacks);
				console.log('"onspeechend" Default action overriden')	
			break;
			case 'soundstart' : this.addMethod('_soundStartListener', func, this._callbacks);
				console.log('"onsoundstart" Default action overriden')	
			break;
			case 'soundend' : this.addMethod('_soundEndListener', func, this._callbacks);
				console.log('"onsoundend" Default action overriden')	
			break;
		}

		return this
	}

	// Expose it to the Global scope (window) as a 'APP' property
	window.APP = window.APP || {}
	window.APP.SpeechRecog = SpeechRecog
})(window.APP.pubSub)
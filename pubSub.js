/* Author: Abraham Itule */

/*
 *	Create a custom way of raising/listening to Custom Events.
 */
 (window.APP = (window.APP || {})).pubSub = {

	/*
	 *	Registers an event
	 *
	 *	@param {String} ev - Name of the event
	 *	@param {Function} callback - function code that will execute when the event is raised
	 *	@return {Object} this - 'this' here points to the pubSub object
	 */
	subscribe: function(evntName, callback) {
		var calls = (this._callbacks || (this._callbacks = {}));

		((this._callbacks[evntName]) || (this._callbacks[evntName] = [])).push(callback)

		return this
	},


	/*
	 *	Raises/Fires an event
	 *
	 *	@param {String} 'name' - The FIRST argument is reserved for the event name to raise/fire
	 *	@param {ANY} 'args' - The rest of the following argumets (if provided) are arguments 
	 						  to the callback that will listen to the event
	 *	@return {Object} this - 'this' here points to the pubSub object
	 */
	on: function() {
		// get arguments. To do so best, convert it to a proper array.
		var args = Array.prototype.slice.call(arguments)

		// get the name of the event
		var eventName = args.shift()

		if(!this._callbacks) return this
		if(!this._callbacks[eventName] instanceof Array) return this
		if(this._callbacks[eventName] == 'undefined') return this

		var registeredCallbacks = this._callbacks[eventName]
		for (var i = 0; i < registeredCallbacks.length; i++) {
			registeredCallbacks[i].apply(this, args)
		}

		return this
	}
};
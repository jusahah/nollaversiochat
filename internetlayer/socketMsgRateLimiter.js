var MIN_TIME_BETWEEN_TWO_MSGS = 50;
var MIN_TIME_BETWEEN_FIVE_MSGS = 2500; // Average 500 ms per message

module.exports = function() {
	var lastFives = {};
	var lastOnes = {};
	return {

		deleteClientData: function(name) {
			if (!name) return;
			if (lastFives.hasOwnProperty(name)) {
				delete lastFives[name];
			}
			if (lastOnes.hasOwnProperty(name)) {
				delete lastOnes[name];
			}
		},

		incomingMsg: function(clientName) {
			if (!clientName) return;
			var now = Date.now();
			var lastOne = lastOnes[clientName] || 0;
			lastOnes[clientName] = now;
			if (now - lastOne < MIN_TIME_BETWEEN_TWO_MSGS) {
				return false;
				//
			}

			// Check last fives
			if (!lastFives[clientName]) lastFives[clientName] = [];
			var lastFive = lastFives[clientName];
			lastFive.push(now);
			if (lastFive.length === 6) {
				// Went over the limit, remove first
				lastFive.shift();

				// Make comparison
				if (now - lastFive[0] < MIN_TIME_BETWEEN_FIVE_MSGS) {
					return false;
				}
			} 
			

			// Make comparisons

			return true;
		}


	}
}
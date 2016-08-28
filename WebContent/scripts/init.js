function startGame() {
	// Interface to communicate with ViLLE
	// Call submit, when the game ends.
	// There is no need to modify this, unless you want to debug something
	var submit = function() {
		console.log("Submit"); 
	}

	// After each answer, call sendAnswer to record answers.
	// There is no need to modify this, unless you want to debug something
	var sendAnswer = function(answer) {
		console.log("Saving ", answer); 
	}

	// options for the game
	var options = {
		parent: $('body'), 		// Where the game should be created
		url: '',				// Base url for stylesheets, images etc.
		submit: submit, 		// Uses submit -function defined above
		sendAnswer: sendAnswer, // Uses sendAnswer -function defined above
		data: [					// array of questions/problems
			// First question object
			{
				question: '1+1', 				// Question as a string
				options: ['2', '3', '4', '5'], 	// OPTIONAL if there are multiple choices, you can use this. Each option is a string. 
				correct: ['2']  				// Array of correct answers. as strings Multiple correct answers are allowed
			}, // first question object ends

			// Second question object
			{ 
				question: '2+2', 
				options: ['2', '3', '4', '5'], 
				correct: ['4'] 
			}, // second question object ends
			{ 
				question: '3+3', 
				options: ['2', '3', '4', '6'], 
				correct: ['6'] 
			}, // third question object ends
			{ 
				question: '4+4', 
				options: ['2', '3', '4', '8'], 
				correct: ['8'] 
			}, // third question object ends
		],
		theme: 'normal',
		
		///////////////////////////////////////////////////////////////////////////////////
		// Optional configurations
		// Add as many you need in your game, these are just examples
		lifes: 6, 			// How many tries?
		nOfOptions: 4, 		// How many options should be visible at the same time
		//difficulty: easy

	}

	// crate new instance of the game. 
	// If you rename the JSBoilerplate in the game.js, you must rename it here too. 
	var game = new JSSnake(options); 

}

// Run the game on page load
startGame(); 


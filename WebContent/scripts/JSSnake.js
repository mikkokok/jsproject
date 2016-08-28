// Constructor for JSSNake. If you rename this, you need to rename it also in init.js
// Take options object as a parameters. Given options override defaults
JSSnake = function(options) {
	console.log("constructor");
	// Make this object visible in functions.
	var self = this; 

	// Default values for options
	// These are defined pretty well in init.js. I'll save some space and leave this half empty.
	self.options = {
		parent: $('body'),
		url: '/',
		theme: 'normal',
	}

	// Extend default options with given options
	// This uses jQuery ($)
	$.extend(self.options, options);

	// Make some options easier to access
	self.data = self.options.data; 
	self.url = self.options.url; 
	self.submit = self.options.submit; 
	self.sendAnswer = self.options.sendAnswer; 
	self.lifes = self.options.lifes;
	self.nOfOptions = self.options.nOfOptions;

	// Create a container for the game. 
	// There needs to be a "gamearea"-container, which is positioned relative and takes the 
	// full width and height of it's parent. Everything in the game must be placed inside "gamearea".
	// Note: self.options.parent is the most outer container
	// self.parent is the game itself and everything should be added there
	// USE self.parent TO ADD THINGS IN YOUR GAME! 
	self.parent  = $('<div class="gamearea"></div>');
	// Add the game to the outer element
	self.options.parent.append(self.parent); 

	// Load necessary CSS-files
	self.loadCss();

	// Make the are fullscreen. Give some time to make sure
	// the parent is rendered before resizing
	setTimeout(function() {
		self.resize();
	}, 500);

	// Handle window resize
	window.onresize = self.resize.bind(self); 

	// Check if game has been detached every 1000ms
	var detacherId = setInterval(function () {

		if ($(self.parent).parents('body').length === 0) {
			// Detach all key and mouse listeners here.
			// Aslo clear all intervals and timeouts
			clearInterval(detacherId);
		}
	}, 1000);


	// Draw start screen 
	self.drawStartScreen(); 
} // JSSnake constructor


//Starting point for the game
JSSnake.prototype.start = function() {
	console.log("JSSnake.prototype.start");
	var self = this; 

	self.drawGameArea();
	console.log("Game area has been drawn");
	self.startGame();

} // start function
JSSnake.prototype.drawGameArea = function() {
	console.log("JSSnake.prototype.drawGameArea");
	var self = this;
	
	// div elements for the snake game and its parts
	self.parent.append($('<div class="snakeScreen" id="screencanvas"></div>'));
	self.parent.append($('<div class="questioncanvas" id="questioncanvas"></div>'));
	self.parent.append($('<div class="lifescanvas" id="lifescanvas"></div>'));

	// Lets create three different canvas for future use
	jQuery('#screencanvas').append('<canvas id="screen" height="800" width=1400> </canvas>'); 
    jQuery('#questioncanvas').append('<canvas id="question" height="60" width="1400"> </canvas>');
    jQuery('#lifescanvas').append('<canvas id="lifes" height="60" width="1400"> </canvas>');
	
} // drawGameArea function
JSSnake.prototype.startGame = function() {
	console.log("JSSnake.prototype.startGame");
	var self = this;
	
	// ######################### Draw necessary things #########################
	
    // Defining gamescreen
	var screen = $("#screen")[0];
	var ctx = screen.getContext("2d");
	var w = $("#screen").width();
	var h = $("#screen").height();
	
	var question = $("#question")[0];
    var qctx = question.getContext("2d");
    var lifes = $("#lifes")[0];
	var lctx = lifes.getContext("2d");
	
	// Function to paint snake
	function paint_snake(x, y) {
		ctx.fillStyle = "blue";		// Define snake color to blue
		ctx.fillRect(x*snakesize, y*snakesize, snakesize, snakesize); // x , y, width, height
		ctx.strokeStyle = "white"; // Define snakes border color to white
		ctx.strokeRect(x*snakesize, y*snakesize, snakesize, snakesize); // x , y, width, height
	} // paint_snake
	
	// Function to paint options
	function paint_options(x, y, answer) {
		ctx.fillStyle = "green"; // differentiate options from snake and paint it to green
		ctx.fillRect(x*optionsize, y*optionsize, optionsize, optionsize);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*optionsize, y*optionsize, optionsize, optionsize);
		ctx.font = "30px 'Comic Sans MS'";
		ctx.textAlign = "left";
		ctx.fillText(answer, x*optionsize, y*optionsize);
	} // paint_options

	// Function to paint question
	function paint_question(question) {
		qctx.clearRect(0, 0, 1400, 60); // x,y, width, height // clears the old question before painting new
		qctx.fillStyle = "red";
	    qctx.font = "30px 'Comic Sans MS'";
	    qctx.textAlign = "left";
	    qctx.fillText("Question: "+question, 10, 50);	
	} // paint_question
	
    // Function to paint amount of lifes
    function paint_lifes() {
    	lctx.clearRect(0, 0, 1400, 60); // x,y, width, height // clears the old life number
    	lctx.fillStyle = "red";
    	lctx.font = "30px 'Comic Sans MS'";
    	lctx.textAlign = "left";
    	lctx.fillText("Lifes: "+self.lifes, 10, 50);
    } // paint_life
    	
	// Function to end game 
	function end_game (text) {
		ctx.fillStyle = 'red';
		ctx.font = "30px 'Comic Sans MS'";
		ctx.textAlign = "left";
		ctx.fillText(text, 140, 70); // text, x, y
		
	} // end_game
	
    // ######################### End of drawing #########################
    
	
	// Keyboard controls for snake 
	$(document).keydown(function(e){
		var key = e.which;
		if(key == "37" && direction != "right") direction = "left";
		else if(key == "38" && direction != "down") direction = "up";
		else if(key == "39" && direction != "left") direction = "right";
		else if(key == "40" && direction != "up") direction = "down";
	}) // keyboard controls
	
	// Variables to make things easier
	var option; 
	var optionsize = 60; // option size
	var options = ["a","b","c","d","e","f","g","h"]; // array for options
	var snake = []; // snake itself created as a array
	var snakesize = 10; // snake size
	var tail; 			// snakes tail
	var length = 5; // Initial length of the snake (number of boxes)
	var direction = "right"; // defaulted direction
	var score = 0; // Start from zero
	var snakeX;		// x-cordinate for snake
	var snakeY;		// y-cordinate for snake
	var interval = 80; // defines game speed, smaller number is faster
	var growinterval = 25; // defines how often snake will grow 
	var correctanswer;  // variable for answer
	var questiona; // first variable for question
	var questionb; // second variable for question
	
	
	
	// Init function to start the game
	function init()	{
		paint_question(); // paints the question area
		create_snake(); // creates snake
		create_options(); // creates options
		gameloop = setInterval(paint, interval); // loop to keep the painting on going i.e game running
	}
	// Initialize the game
	init();
	
	// ######################### Help functions #########################
	
	// Function to check if the snake collides with something
	function check_collision(x, y, array) {
		for(var i = 0; i < array.length; i++) {
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	} // check collision
	function create_snake()	{
		for(var i = length-1; i>=0; i--) {
			snake.push({x: i, y:0}); // Make the snake to move by adding element at the end of array by using the push method
		}
	}
	// Function to check if the snake collides with the option borders
	function check_option_collision(snakeX, snakeY, optionx, optiony) { 
		for (var i = 0; i < 7; i++) {
			for (var j = 0; j < 7; j++) {
				if (snakeX == (optionx+i) && snakeY == (optiony+j) ) {
					return true;
				} // if
			} // inner for
		} // outer for
	}
	// Function to create options
	function create_options() {
		// Create four different options to get four options for collecting
		do_the_math(); // first calculate question and answer
		optiona = {
				x: Math.round(Math.random()*130)+1,
				y: Math.round(Math.random()*70)+1,
				answer: correctanswer,
				
			} // optiona
		// Check that option is not created on top of snake and if it is then re-create it
        for (var i=0; i>snake.length; i++) {
           snakeX = snake[i].x;
           snakeY = snake[i].y;
            
             if (optiona.x == snakeX || optiona.y == snakeY || optiona.y == snakeY && optiona.x == snakeX) {
            	 optiona.x = Math.floor((Math.random() * 30) + 1);
            	 optiona.y = Math.floor((Math.random() * 30) + 1);
            } // if
        } // for
		optionb = {
				x: Math.round(Math.random()*130)+1,
				y: Math.round(Math.random()*70)+1,
				answer: Math.round(Math.random()*200)+1,
				
			} // optionb
		if (optionb.answer == optiona.answer) {
       	 optionb.answer = Math.round(Math.random()*20)+1;
        }
		// Check that option is not created on top of snake and if it is then re-create it
		for (var i=0; i>snake.length; i++) {
			snakeX = snake[i].x;
			snakeY = snake[i].y;
            
             if (optionb.x == snakeX || optionb.y == snakeY || optionb.y == snakeY && optionb.x == snakeX) {
            	 optionb.x = Math.floor((Math.random() * 30) + 1);
            	 optionb.y = Math.floor((Math.random() * 30) + 1);
            } //if
             
		} // for
		optionc = {
				x: Math.round(Math.random()*130)+1,
				y: Math.round(Math.random()*70)+1,
				answer: Math.round(Math.random()*200)+1,
			} // optionc
		if (optionc.answer == optiona.answer) {
	       	 optionc.answer = Math.round(Math.random()*20)+1;
	        }
		// Check that option is not created on top of snake and if it is then re-create it
		for (var i=0; i>snake.length; i++) {
			snakeX = snake[i].x;
			snakeY = snake[i].y;
            
             if (optionc.x == snakeX || optionc.y == snakeY || optionc.y == snakeY && optionc.x == snakeX) {
            	 optionc.x = Math.floor((Math.random() * 30) + 1);
            	 optionc.y = Math.floor((Math.random() * 30) + 1);
            } // if
		} // for
		optiond = {
				x: Math.round(Math.random()*130)+1,
				y: Math.round(Math.random()*70)+1, 
				answer: Math.round(Math.random()*200)+1,
			} // optiond
		if (optiond.answer == optiona.answer) {
	       	 optiond.answer = Math.round(Math.random()*20)+1;
	        }
		// Check that option is not created on top of snake and if it is then re-create it
		for (var i=0; i>snake.length; i++) {
			snakeX = snake[i].x;
			snakeY = snake[i].y;
            
             if (optiond.x == snakeX || optiond.y == snakeY || optiond.y == snakeY && optiond.x == snakeX) {
            	 optiond.x = Math.floor((Math.random() * 30) + 1);
            	 optiond.y = Math.floor((Math.random() * 30) + 1);
            } //if
		} // for
	} // create_options
	
	// Function to create the question and correct answer
	function do_the_math() {
		questiona = Math.round(Math.random()*200)+1;
		questionb = Math.round(Math.random()*200)+1
		correctanswer = questiona+questionb;
		paint_question(questiona+" + "+questionb);
	}
	
	// ######################### End of help functions #########################
	
	
	// Main function for painting the snake and all of the parts needed for snake game
	function paint() {
		
		// The actual space for playing. Colored as white
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		// This white space has black borders
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);
		
		// Snake head cordinates to easier usable variables
		snakeX = snake[0].x;
		snakeY = snake[0].y;
		
		// Make the snake move by adding or removing from snake
		if(direction == "right") snakeX++; 
		else if(direction == "left") snakeX--;
		else if(direction == "up") snakeY--;
		else if(direction == "down") snakeY++;
		
		// Check if snake collides with itself or with the borders and then reduce lifes or stop the game
		if(snakeX == -1 || snakeY == -1 || snakeX == w/snakesize || snakeY == h/snakesize || self.lifes == 0 || check_collision(snakeX, snakeY, snake)) {
			self.lifes--; // reduce the amount of lifes on collision
			
			// Make the snake spawn from default location to prevent losing all lifes when colliding with wall
			if (snakeX == -1 || snakeY == -1 || snakeX == w/snakesize || snakeY == h/snakesize) { 
				snake[0].x = 1;
				snake[0].y = 1;
				direction = "right";
			}
			// if lifes are down to zero then clear game area
		if ( self.lifes <= 0  ) {
			end_game("Game ended, you lost!");
			gameloop = clearInterval(gameloop);
			return;
		} // else-if
			return;
		} // if
		// Reduce lifes if wrong option is selected
		if (check_option_collision(snakeX, snakeY, optionb.x, optionb.y) || check_option_collision(snakeX, snakeY, optionc.x, optionc.y) || check_option_collision(snakeX, snakeY, optiond.x, optiond.y)   ) {
			self.lifes--;
			create_options();
		} // if
		if (snake.length <= 1 || score == 4) {
			end_game("Game ended, you won!");
			gameloop = clearInterval(gameloop);
			return;
		}
		
		// few lines for debugging
		//console.log("snakeX: "+snakeX+" snakeY: "+snakeY+" optiona.x: "+optiona.x+" optiona.y: "+optiona.y+" snake.length: "+snake.length);
		
		// Check if the snake eats the correct option
		if(check_option_collision(snakeX, snakeY, optiona.x, optiona.y)) {
			score++;
			tail = {
					x: snakeX, 
					y: snakeY 
			};
			create_options();
			// Reduce the length of the snake (pop the tail X times)
			for (var i = 0; i < 4; i++) {
				tail = snake.pop();
			} // for
			tail.x = snakeX; tail.y = snakeY;
		} else {
			tail = snake.pop(); // Remove last cell of the array by using pop method
			tail.x = snakeX; tail.y = snakeY;
		} // else-if
		
		snake.unshift(tail); // Adds the tail in front of the snake array by using unshift method
		// Paints the snake with the paint_snake function
		for(var i = 0; i < snake.length; i++) {
			paint_snake(snake[i].x, snake[i].y);
		} // for
		
		// Create the four options to the canvas
		paint_options(optiona.x/6, optiona.y/6, optiona.answer);
		paint_options(optionb.x/6, optionb.y/6, optionb.answer);
		paint_options(optionc.x/6, optionc.y/6, optionc.answer);
		paint_options(optiond.x/6, optiond.y/6, optiond.answer);
		
		// Lets make the snake grow automatically
		growinterval--;
		if (growinterval <= 0) {
			growinterval = 25
			snake.push({x: 0,
						y: 0
						});
		} // if
		
		// Last but not least paint the amount of lifes
		paint_lifes();

	} // paint 
	
} // start Game

// #########################  End of snake code #################################################


// Draws the initial start screen, with a big start-button. 
// Game starts only after user has decide to start the game. 
// You can skip this, if you like.
JSSnake.prototype.drawStartScreen = function() {
	console.log("JSSnake.prototype.drawStartScreen");
	var self = this; 

	self.parent.append('<div class="startbutton">Start!</div>'); 
	$('.startbutton').click(function(e) {
		var elem = this; 
		e.preventDefault();
		// disable keylistener
		$(document).off('keypress');

		// ugly hack to wait until the animation is completed.
		setTimeout(function() {
			// fade button, start game, remove button
			$(elem).fadeOut(function() {
				// focus parent div (needed, if you have keylistener in your game)
				self.parent.focus();
				// start the game 
				self.start(); 
				// remove start-button
				$(elem).remove();

			});
		}, 200);
	});
	
	$(document).keypress(function(e) {
		if(e.which === 13 || e.keyCode === 13) {
			$('.startButton').click(); 
		}
	});
} // drawstartScreen

// Load the base_theme.css and set theme, if available.
// No need to modify this, unless you want to implement themes or 
// load external css-libraries
JSSnake.prototype.loadCss = function() {
	console.log("JSSnake.prototype.loadCss");
	var self = this;
	// remove all existing stylesheets (should not be any)
	$("[id^=boilerpalte-style]").remove();

	////////////////////////////////////////////////////////////
	// See which theme is selected, default is normal or empty
	////////////////////////////////////////////////////////////
	if(self.options.theme == "normal") {
		$(self.parent).addClass(self.options.theme);
	}
	// Example for alterntive theme
	// Not implemented in this boilerplate!
	else if (self.options.theme == 'something_else') {
		$(self.parent).addClass(self.options.theme);
		var style = self.url + 'stylesheets/something_else.css';
	}
	// Default case, if the theme is completely missing from options
	else {
		console.log("Theme not supported, using 'normal'");
		$(self.parent).addClass("normal");
	}
	
	var count = $("[id^=boilerpalte-style]").length + 1; 

	////////////////////////////////////////////////////////////
	// Load the files
	////////////////////////////////////////////////////////////
	// load the base_theme.css
	$('head').append('<link id="boilerpalte-style'+ count +'" rel="stylesheet" href="'+ self.url + 'stylesheets/base_theme.css' +'">');	

	// Load special theme
	if(style) {
		$('head').append('<link id="boilerpalte-style'+ (count+1) +'" rel="stylesheet" href="'+ style +'">');
	}

	// Loading any external stylesheets, like animate.css
	// $('head').append('<link id="boilerpalte-style'+ (count+2) +'" rel="stylesheet" href="' + self.options.url + 'stylesheets/animate.css">');
} // loadCss

// Keep the game in fullscreen even on window resize
JSSnake.prototype.resize = function() {
	console.log("JSSnake.prototype.resize");
	var self = this;
	// First make sure that the outer most element is full width and height
	$(self.options.parent).width(parseFloat($(window).width()) - parseFloat($(self.options.parent).offset().left) + 'px');
	$(self.options.parent).height(parseFloat($(window).height()) - parseFloat($(self.options.parent).offset().top) + 'px');

	// Make sure that the game container fills the outer most container.
	$(self.parent).width($(self.options.parent).width());
	$(self.parent).height($(self.options.parent).height());
} // resize

///////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions, use if you need 
///////////////////////////////////////////////////////////////////////////////////////////////////

// Shuffle options array. Makes sure correct option is included in shuffled array
JSSnake.prototype.shuffleOptions = function(options, correct) {
	var self = this; 
	var arr = []; 

	options = self.shuffle(options);
	var isCorrect = false;

	for(var i=0; i<self.options.nOptions; i++) {
		arr.push(options[i]);
		if(options[i] === correct) {
			isCorrect = true;
		}
	}

	if(!isCorrect) {
		arr[0] = correct;
	}

	arr = self.shuffle(arr);

	return arr;
} // shuffleOptions

// Get random int including min and max
JSSnake.prototype.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} // randomInt

// Shuffle array
JSSnake.prototype.shuffle = function(array) {

	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
	}

	return array;
} // Shuffle

// Checks if array as given item
JSSnake.prototype.isIn = function(array, item) {
	for(var i=0; i<array.length; i++) {
		if(array[i] === item) {
			return true;
		}
	}
	
	return false;
} //isIn

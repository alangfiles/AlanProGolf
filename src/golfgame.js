var golfGame = function(game){

	var score = 0;
	var par = 0;
	var hole = 1;
	var wind = 0;
	var distance;
	var clubs;
	var currentClub;
	var character;
	var clubNumber;
	var strokeBox;
	
	var scorebox;
	var scoreboardFont;
	
	var swingbar;
	var swingbarSelector;
	var swingbarXmin;
	var swingbarXmax;
	var middleSweetSpot;
	
	var direction;
	var power;
	var followthroughDirection;

	var shootingMode;
	var backswingMode;
	var followthroughMode;
	var changeDirectionTime;

	var currentAnimationTween;
}
golfGame.prototype = {
	preload: function(){
		//controls
		enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		cursor = this.game.input.keyboard.createCursorKeys();
		
		//character and clubs
		character = this.game.character;
		this.clubs = 
		[
            {
                "name": "1 Wood",
				"bonus": 30, 
				"distance":210,
				"loft":8
		    },
			{
                "name": "3 Wood",
				"bonus": 20, 
				"distance":200,
				"loft":12
			},
            {
                "name": "5 Wood",
				"bonus": 20, 
				"distance":180,
				"loft":16
			},
            {
                "name": "1 Iron",
				"bonus": 20, 
				"distance":180,
				"loft":20
			},
            {
                "name": "3 Iron",
				"bonus": 20, 
				"distance":160,
				"loft":28
			},
            {
                "name": "4 Iron",
				"bonus": 15, 
				"distance":150,
				"loft":32
			},
            {
                "name": "5 Iron",
				"bonus": 15, 
				"distance":140,
				"loft":36
			},
            {
                "name": "6 Iron",
				"bonus": 15, 
				"distance":130,
				"loft":40
			},
            {
                "name": "7 Iron",
				"bonus": 10, 
				"distance":120,
				"loft":44
			},
            {
                "name": "8 Iron",
				"bonus": 10, 
				"distance":110,
				"loft":48
			},
            {
                "name": "9 Iron",
				"bonus": 5, 
				"distance":100,
				"loft":52
			},
            {
                "name": "Pitch W",
				"bonus": 5, 
				"distance":90,
				"loft":56
			},
            {
                "name": "Sand W",
				"bonus": 5, 
				"distance":80,
				"loft":60
			},
            {
                "name": "Putter",
				"bonus": 0, 
				"distance":40,
				"loft": 1
			}
		];
		this.clubNumber = 0;
		this.currentClub = this.clubs[this.clubNumber];
		
		//hole information
		this.par = 4;
		this.score = 0;
		this.hole = 1;
		this.distance = 341;
		
		//shooting information
		this.direction = 0;
		this.power = 0;
		this.followthroughDirection = 0;

		//modes and timing stuff
		shootingMode = false;
		backswingMode = false;
		followthroughMode = false;
		changeDirectionTime = this.game.time.time;
		
		//fonts
		this.scoreboardFont = { font: "24px monospace", fill: "#ffffff "};
	},
	create: function(){
		/************** Sprites *************/
		var course = this.game.add.sprite(0,0, "course");
		var player = this.game.add.sprite(450,200, "player");
		this.strokeBox = this.game.add.sprite(450,0, "strokeBox");
		this.directionArrow = this.game.add.sprite(100,550, "arrow")
		this.directionArrow.anchor.set(0.5,0.5);
		this.ballShadow = this.game.add.sprite(100, 550, "ballShadow");
		this.ballShadow.anchor.set(0.5,0.5);
		this.golfBall = this.game.add.sprite(100,550, "ball")
		this.golfBall.anchor.set(0.5,0.5);
		this.swingbarSelector = this.game.add.sprite(650,550, "swingbarSelector");
		this.swingbar = this.game.add.group(); // a group of ticks for the fn:startShootingMode()

		//initial text for scoreboard
		this.game.add.text( this.strokeBox.x+40, this.strokeBox.y+20,
			"Hole #" + this.hole + "\n" 
			+ "Par " + this.par + "\n"
			+ this.distance + " yards", 
			this.scoreboardFont);

		//the rest of the things to display are updated often enough to have their own fns
		this.drawSwingbar();
		this.updateScorebox();
		this.updateClub();

		/************************************/


		/***********  Controls  *************/

		// select club (up and down changes club)
        cursor.up.onDown.add(this.changeClub, this);
		cursor.down.onDown.add(this.changeClub, this);

		// select angle (left and right changes angle)
		// this is done in fn:update()

		//once it's selected, we go to power
		enterKey.onDown.add(this.handleEnterKey, this);

		/************************************/
	},
	drawSwingbar: function(){
		//this swingbar ends up being pretty important for adding to distance,
		//figuring out the hook or draw on the ball, etc.

		this.swingbar.removeAll();
		//out of 30 bars, how many good, etc.
		var dangerzone = 2;
		var sweetspot = Math.floor(1.4 + this.clubs[this.clubNumber].loft*0.077); 
		var followthrough = 6;
		var backswing = 30-6-sweetspot;
		var xoriginal = 450;
		var xLocation = 450;
		this.swingbarXmin = xLocation;

		var sweetspotX = xLocation;

		for(var i=0; i<dangerzone; i++){
			this.swingbar.add(this.game.add.sprite( xLocation, 525, "swingbarBad"));
			xLocation += 10;
		}
		for(var i=0; i<backswing; i++){
			this.swingbar.add(this.game.add.sprite( xLocation, 525, "swingbarNormal"));
			xLocation += 10;
		}
		for(var i=0; i<sweetspot; i++){
			this.swingbar.add(this.game.add.sprite( xLocation, 525, "swingbarGood"));
			sweetspotX = xLocation;
			xLocation += 10;
		}
		sweetspotX -= (10 * sweetspot/2);
		this.middleSweetSpot = sweetspotX;
		for(var i=0; i<followthrough; i++){
			this.swingbar.add(this.game.add.sprite( xLocation, 525, "swingbarNormal"));
			xLocation += 10;
		}

		this.swingbarXmax = xLocation;
		this.swingbarSelector.destroy();
		this.swingbarSelector = this.game.add.sprite(sweetspotX,550, "swingbarSelector");

	},
	handleEnterKey: function(){
		if(this.shootingMode){
			if(this.backswingMode){
				this.currentAnimationTween.stop();
				this.power = this.swingbarSelector.x;
				this.followthrough();
				this.backswingMode = false;
			}
			else{ //followthrough actions
				this.currentAnimationTween.stop();
				this.followthroughDirection = this.swingbarSelector.x;
				this.followthroughMode = false;
				this.shootBall();
			}
		}
		else{ //turns on shooting mode
			this.startShootingMode();
		}
	},
	startShootingMode: function(){
		this.shootingMode = true;		
		this.backswing();
	},
	backswing: function(){
		this.backswingMode = true;
		var swingTime = 200 * this.game.character.stats['Driving']; //200ms * driving
		//press the button for backswing, or take max.
		this.currentAnimationTween = this.game.add.tween(this.swingbarSelector).to( 
			{ x:this.swingbarXmin}, 
			swingTime,
			Phaser.Easing.Linear.None, true);
		
		//if the currentAnimationTween is stopped (aka, the user presses the enter key), this won't be called
		this.currentAnimationTween.onComplete.add(function(){this.handleEnterKey()}, this);

	},
	followthrough: function(){
		this.followthroughMode = true;
		var swingTime = 200 * this.game.character.stats['Skill']; //200ms * skill
		//press the button again on the followthrough, or take max.
		this.currentAnimationTween = this.game.add.tween(this.swingbarSelector).to( 
			{ x:this.swingbarXmax}, 
			swingTime, 
			Phaser.Easing.Linear.None, true);

		this.currentAnimationTween.onComplete.add(function(){this.handleEnterKey()}, this);

	},
	shootBall: function(){
		//get all the swing characteristics
		var angle = this.direction;
		var power = this.clubs[this.clubNumber].distance;
		var clubBonus = this.clubs[this.clubNumber].bonus;
		var charPower = power + clubBonus*this.game.character.stats.Driving/5;
		
		//how much of the club bonus to add (or subtract)
		var range = this.middleSweetSpot - this.swingbarXmin; //260
		var pow = this.power - this.swingbarXmin; //0-300?
		if(this.power <= 470){
			//they went into the danger zone, let's randomize the angle a little
			// var randomAngle = Math.random()*35; //somewhere between 0 and 35 degrees.
			// var randomSign = Math.random() > 0.5 ? -1 : 1;
			// angle += randomSign * randomAngle; 
		}

		var radians = (angle) * (Math.PI/180);
		var newLocation = [this.golfBall.x + (charPower * Math.sin(radians))
		                  ,this.golfBall.y - (charPower * Math.cos(radians))];

		var oldLocation = [this.golfBall.x
						  ,this.golfBall.y]

		var resetBall = false;
		var resetLocation = oldLocation;

		this.animateBall(newLocation, resetLocation, resetBall);
	},
	animateBall: function(newLocation, resetLocation, resetBall){
		this.directionArrow.destroy();

		var scale = this.clubs[this.clubNumber].loft/12; 
			scale = scale < 1 ? 1 : scale;
		
		console.log(scale);

		var power = this.clubs[this.clubNumber].distance;
		var moveTime = power * 20; //20ms per yard

		var moveBall = this.game.add.tween(this.golfBall).to( { x:newLocation[0], y:newLocation[1] }, moveTime, Phaser.Easing.Linear.None, true);
		
		var moveShadow = this.game.add.tween(this.ballShadow).to({x:newLocation[0], y:newLocation[1]}, moveTime, Phaser.Easing.Linear.None, true);

		var ballUpAnimation = this.game.add.tween(this.golfBall.scale).to( { x: scale, y: scale }, 2*moveTime/3, Phaser.Easing.Linear.None, true);
		ballUpAnimation.onComplete.add(function(){
			var ballDownAnimation = this.game.add.tween(this.golfBall.scale).to( { x: 1, y: 1 }, moveTime/3, Phaser.Easing.Linear.None, true);
			ballDownAnimation.onComplete.add(function(){
				this.score += 1;
				if(resetBall){
					this.score += 1; //penalty stroke
					this.resetBall(resetLocation);
				}
				else{
					this.directionArrow = this.game.add.sprite(newLocation[0], newLocation[1], "arrow")
					this.directionArrow.anchor.set(0.5,0.5);
					this.direction = 0; //maybe autoline up to pin in future
				}
				this.updateScorebox();
				this.shootingMode = false;
			}, this)
		}, this);

	},
	resetBall: function(location){
		this.directionArrow.destroy();
		this.game.add.tween(this.golfBall).to( { x:location[0], y:location[1] }, 50, Phaser.Easing.Linear.None, true);
		this.directionArrow = this.game.add.sprite(location[0],location[1], "arrow")
		this.directionArrow.anchor.set(0.5,0.5);		
		this.direction = 0; 
	},
	updateScorebox: function(){
		if(this.scorebox){
			this.scorebox.destroy();
		}
		this.scorebox = this.game.add.text(
			this.strokeBox.x+40, this.strokeBox.y+120,
			"----------------------" + "\n"
			+ "Shot " + this.score + "\n"
			+ "----------------------", 
			{ font: "24px monospace", fill: "#ffffff "});
	},
	updateClub: function(){
		if(this.club != null){ this.club.destroy() }
		this.club = this.game.add.text( this.strokeBox.x+70, this.strokeBox.y+220,
			"<--  " + this.currentClub.name + "  -->", this.scoreboardFont);
		this.drawSwingbar();
	},
	updateDirection: function(){
		this.game.add.tween(this.directionArrow).to( { angle: this.direction }, 100, Phaser.Easing.Linear.None, true);
	},
	changeDirection: function(amount){
	    if (this.game.time.time < this.changeDirectionTime) { return; }

		// var amount = 5;
		// if(key.keyCode == 37){
		// 	amount = -5;
		// }

		this.direction += amount;
		this.updateDirection();
		this.changeDirectionTime = this.game.time.time + 100;
	},
	changeClub: function(key){
		if(this.shootingMode){return;}
		var amount = 1;
		if(key.keyCode == 38){
			amount = -1;
		}
		this.clubNumber += amount;

		if(this.clubNumber >= this.clubs.length){
			this.clubNumber = 0;
		}
		if(this.clubNumber < 0 ){
			this.clubNumber = this.clubs.length-1;
		}		
		this.currentClub = this.clubs[this.clubNumber];
		this.updateClub();
	},
	update: function(){
		if(this.shootingMode){

		}
		else{ //aiming, club selection mode.
			if(cursor.left.isDown){
				this.changeDirection(-5);
			}
			if(cursor.right.isDown){
				this.changeDirection(5);
			}
		}
	}
}
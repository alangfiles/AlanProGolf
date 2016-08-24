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
		this.golfBall = this.game.add.sprite(100,550, "ball")
		this.golfBall.anchor.set(0.5,0.5);
		this.swingbarSelector = this.game.add.sprite(650,550, "swingbarSelector");
		this.swingbar = this.game.add.group(); // a group of ticks for the fn:selectPower()

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
				console.log('backswing Enter');
				this.currentAnimationTween.stop();
				this.power = this.swingbarSelector.x;
				this.followthrough();
				this.backswingMode = false;
			}
			else{
				console.log('followthrough Enter');
				this.currentAnimationTween.stop();
				this.followthroughDirection = this.swingbarSelector.x;
				this.followthroughMode = false;
				this.shootBall();
			}
		}
		else{
			this.selectPower();
		}
	},
	selectPower: function(){
		this.shootingMode = true;		
		this.backswing();
	},
	backswing: function(){
		this.backswingMode = true;
		//press the button for backswing, or take max.
		this.currentAnimationTween = this.game.add.tween(this.swingbarSelector).to( 
			{ x:this.swingbarXmin}, 
			1000, 
			Phaser.Easing.Linear.None, true);

		//the enterkey listener handles setting the power.

		//if the animation isn't stopped, power is set to max? or maybe it should ossicalte
		// backswingAnimation.onComplete.add(function(){
		// 	this.backswingMode = false;
		// 	this.followthrough();
		// },this);
	},
	followthrough: function(){
		this.followthroughMode = true;
		//press the button again on the followthrough, or take max.
		this.currentAnimationTween = this.game.add.tween(this.swingbarSelector).to( 
			{ x:this.swingbarXmax}, 
			1000, 
			Phaser.Easing.Linear.None, true);

			//setup oncomplete to handle this

	},
	shootBall: function(){
		//takes in the power and direction and shoots the ball.
		//if the ball doesn't land legally, we reset the ball.
		//if the ball lands on the green, we go to the green mode.
		this.directionArrow.destroy();
		var angle = this.direction;

		var power = this.clubs[this.clubNumber].distance;
		var clubBonus = this.clubs[this.clubNumber].bonus;
		var charPower = power + clubBonus*this.game.character.stats.Driving/5;
		console.log("Distance: ", charPower);
		
		var oldX = this.golfBall.x;
		var oldY = this.golfBall.y; //in case the ball is OB

		var radians = (angle) * (Math.PI/180);
		var newX = this.golfBall.x + (charPower * Math.sin(radians));
		var newY = this.golfBall.y - (charPower * Math.cos(radians));
		
		//base the time on the distance moved.
		var moveTime = power * 10; //10ms per yard. 200 yars = 2 seconds
		var moveBall = this.game.add.tween(this.golfBall).to( { x:newX, y:newY }, moveTime, Phaser.Easing.Linear.None, true);
				
		// //ridiculous function, ball goes up then down, then add to the score.
		var scale = this.clubs[this.clubNumber].loft/12;
		scale = scale < 1 ? 1 : scale;

		var ballUpAnimation = this.game.add.tween(this.golfBall.scale).to( { x: scale, y: scale }, 2*moveTime/3, Phaser.Easing.Linear.None, true);
		ballUpAnimation.onComplete.add(function(){
			var ballDownAnimation = this.game.add.tween(this.golfBall.scale).to( { x: 1, y: 1 }, moveTime/3, Phaser.Easing.Linear.None, true);
			ballDownAnimation.onComplete.add(function(){
				this.score += 1;
				this.directionArrow = this.game.add.sprite(newX,newY, "arrow")
				this.directionArrow.anchor.set(0.5,0.5);		
				this.direction = 0; //maybe autoline up to pin in future
				this.updateScorebox();
				this.shootingMode = false;
			}, this)
		}, this);

		
	},
	resetBall: function(xValue,yValue){
		this.directionArrow.destroy();
		this.game.add.tween(this.golfBall).to( { x:xValue, y:yValue }, 0, Phaser.Easing.Linear.None, true);
		this.directionArrow = this.game.add.sprite(xValue,yValue, "arrow")
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
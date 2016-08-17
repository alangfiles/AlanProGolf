var charSelect = function(game){
    var charSelection;
    var currentChar;
    var charList;
    var updateCharacter;
    var playerInfo;
    var statsBox;
    var statSprites;
}
 
charSelect.prototype = {
	preload: function(){
		enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		cursor = this.game.input.keyboard.createCursorKeys();

    this.currentChar = 0;
    this.moveTimer = 0;
    this.charList = [
        {
            "name": "Alan",
            "sprite": "alan",
            "nickname": "Technician",
            "x": 50,
            "y": 150,
            "stats":{
                "Driving":4,
                "Accuracy":4,
                "Skill":5,
                "Recovery":2,    
                "Putting":4
            }
        },
        {
            "name": "Brian",
            "sprite": "brian",
            "nickname": "Young Hero",
            "x": 228,
            "y": 150,
            "stats":{
                "Driving":5,
                "Accuracy":5,
                "Skill":3,
                "Recovery":2,    
                "Putting":2
            }
        },
        {
            "name": "Carl",
            "sprite": "carl",
            "nickname": "Strong Bro",
            "x": 50,
            "y": 350,
            "stats":{
                "Driving":5,
                "Accuracy":2,
                "Skill":4,
                "Recovery":5,    
                "Putting":2
            }
        },
        {
            "name": "Gordon",
            "sprite": "gordon",
            "nickname": "Power Golfer",
            "x": 228,
            "y": 350,
            "stats":{
                "Driving":4,
                "Accuracy":4,
                "Skill":3,
                "Recovery":4,    
                "Putting":3
            }
        }
        ]
	},
  	create: function(){
		
		var background = this.game.add.sprite(0,0, "selectBackground");
		var title = this.game.add.text(
			this.game.world.centerX, 70, 
			"Select Your Player", 
			{ font: "40px monospace", fill: "#ffff00" });
			title.anchor.set(0.5);
			title.setShadow(1, 1, 'rgba(0,0,0,0.2)', 1);

        for(var i=0; i<this.charList.length; i++){
            var c = this.charList[i];
            this.game.add.sprite(c.x,c.y,c.sprite);
        }		
		this.charSelection = this.game.add.sprite(50,150, "charSelect");
        this.statsBox = this.game.add.sprite(420, 240, "statsBox")
        this.statSprites = this.game.add.group()
        this.displayCharacterStats();

        cursor.right.onDown.add(this.updateChar, this)
        cursor.down.onDown.add(this.updateChar, this)
        cursor.left.onDown.add(this.updateChar, this)
        cursor.up.onDown.add(this.updateChar, this)
	},
    updateChar: function(key){ 
        var amount = 1;
        if(key.keyCode == 37 || key.keyCode == 38){
            amount = -1;
        }    
        this.currentChar += amount;
        this.updateCharacter = true;
        
        if(this.currentChar >= this.charList.length){
            this.currentChar = 0;
        }
        if(this.currentChar < 0){
            this.currentChar = this.charList.length-1;
        }

        this.charSelection.x = this.charList[this.currentChar].x;
        this.charSelection.y = this.charList[this.currentChar].y;
        this.displayCharacterStats();

    },
	update: function(){
        if(enterKey.isDown){
            this.game.character=this.charList[this.currentChar];
			this.playTheGame();
		}
	},
    displayCharacterStats: function(){
        if(this.playerInfo){
            this.playerInfo.destroy();
        }
        
        var player = this.charList[this.currentChar];
        var xLocal = this.statsBox.x + 20;
        var yLocal = this.statsBox.y + 20;

        this.playerInfo = this.game.add.text(
			xLocal, yLocal, 
			player.nickname + "\n" 
            + "Name: "+player.name + "\n\n"
            + "Driving: "+ "\n"
            + "Accuracy: "+ "\n"
            + "Skill: "+ "\n"
            + "Recovery: "+ "\n"
            + "Putting: ",
			{ font: "20px monospace", fill: "#ffff00" });
    
            xLocal += 120;
            yLocal += 83;

        for(var stat in player.stats){
            var xStart = xLocal;
            var playerStat = player.stats[stat];
            for(var j=0;j<5;j++){
                if(j < playerStat){
                    this.statSprites.add(this.game.add.sprite(xStart, yLocal, "filledStat"));
                }
                else{
                    this.statSprites.add(this.game.add.sprite(xStart, yLocal, "emptyStat"));
                }
                xStart += 35;
            }
            yLocal += 27;
        }

    },
	playTheGame: function(){
		this.game.state.start("GolfGame");
	}
}
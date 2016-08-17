var gameTitle = function(game){}
 
gameTitle.prototype = {
	preload: function(){
		enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		
	},
  	create: function(){
		this.game.audio = {};
		this.game.audio.titleMusic = this.game.add.audio("titleMusic");

		this.title = this.game.add.text(
			this.game.world.centerX, 100, 
			"Alan's Pro Golf", 
			{ font: "65px monospace", fill: "#ffffff" });
			this.title.anchor.set(0.5);
			this.title.setShadow(1, 1, 'rgba(0,0,0,0.2)', 1);

		this.text = this.game.add.text(
			this.game.world.centerX, 500, 
			"Press Enter to Start", 
			{ font: "65px monospace", fill: "#ffff00"});
			this.text.anchor.set(0.5);
			this.text.setShadow(1, 1, 'rgba(0,0,0,0.2)', 1);
		
		this.game.audio.titleMusic.play();
	},
	update: function(){
		
		if(enterKey.isDown){
			this.game.audio.titleMusic.stop();
			this.game.state.start("CharSelect");
		}
	}
}
var boot = function(game){};
  
boot.prototype = {
	preload: function(){
          this.game.load.image("loading","assets/loading.png"); 
	},
  	create: function(){
		//this.game.scale.scaleMode = Phaser.ScaleManager.FIT;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.state.start("Preload");
	}
}
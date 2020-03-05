function GameSelect() {
  this.selectGame = [-1, -1];
  this.gamesContainer = document.getElementById("games-container");
  this.gamesArray = [];

  this.strict = true;
  this.controllerPageLocation = "https://openconsole.github.io";

  this.marginTop = 0.02;
  this.gameRowHeight = 0.172;
  this.currTopOffset = 0;
}
GameSelect.prototype.initialize = function() {
  window.addEventListener("message", gameSelect.handleMessage, false);
  document.addEventListener("keydown", gameSelect.handleKeyDown, false);
}


GameSelect.prototype.postGameSelectMessageToContainer = function (game) {
    parent.postMessage({ "type":"SetGame", "game":game }, gameSelect.strict ? gameSelect.controllerPageLocation : "*");
}
GameSelect.prototype.handleMessage = function (event) {
  // Do we trust the sender of this message?
  if (event.origin !== gameSelect.controllerPageLocation && gameSelect.strict)
    return;

  var message = event.data;
  switch(message.type) {
    case "SetGames":
      gameSelect.setGames(message.gamesList, message.prevGame);
      break;
  }
}
GameSelect.prototype.setGames = function (gamesList, prevGame) {
  gameSelect.gamesArray = [];
  var cols = 7;
  var rows = Math.ceil(gamesList.length / cols);
  
  gameSelect.gamesContainer.innerHTML = '';
  for (var y = 0; y < rows; y++) {
	  if (y == rows - 1 && gamesList.length % cols != 0) { cols = gamesList.length % cols }
	  gameSelect.gamesArray.push([]);
	  var gamesRow = document.createElement("div");
	  gamesRow.classList.add("games-row");
	  gameSelect.gamesContainer.appendChild(gamesRow);
    for (var x = 0; x < cols; x++) {
      var currGame = gamesList[y * 7 + x];
	    var gameContainer = document.createElement("div");
	    gameContainer.classList.add("game-container");
	    gamesRow.appendChild(gameContainer);
	    var gameSelect = document.createElement("div");
	    gameSelect.classList.add("game-select");
	    gameContainer.appendChild(gameSelect);
	    gameSelect.gamesArray[y].push([currGame, gameSelect]);
	  
	    var gameImage = document.createElement("div");
	    gameImage.classList.add("game-image", "active");
	    if (currGame.gamePic) {
	      gameImage.setAttribute('style', 'background-image: url(\'' + currGame.gamePic + '\');')
	    }
	    gameSelect.appendChild(gameImage);
      gameSelect.gamePicElem = gameImage;

      var gameImageGif = document.createElement("div");
	    gameImageGif.classList.add("game-gif");
      if (currGame.highlightPic != null) {
        gameImageGif.setAttribute('style', 'background-color: #396385; background-image: url(\'' + currGame.highlightPic + '\');');
      }
	    gameImage.appendChild(gameImageGif);
      gameSelect.gameGifElem = gameImageGif;

      var gameImageAuthorFade = document.createElement("div");
	    gameImageAuthorFade.classList.add("game-author-image-fade");
	    gameImageGif.appendChild(gameImageAuthorFade);
      gameSelect.gameAuthorFadeElem = gameImageAuthorFade;
	  
	    var gameFooter = document.createElement("div");
	    gameFooter.classList.add("game-footer");
      gameSelect.appendChild(gameFooter);
      var gameName = document.createElement("div");
	    gameName.classList.add("game-name");
	    gameName.innerHTML = currGame.name;
	    gameFooter.appendChild(gameName);
      
      var authorName = document.createElement("div");
	    authorName.classList.add("author-name");
	    authorName.innerHTML = currGame.author;
	    gameSelect.appendChild(authorName);
      gameSelect.authorElem = authorName;

      if(currGame.minPayers != null || currGame.maxPlayers != null) {
        var gamePlayersNum = document.createElement("div");
        gamePlayersNum.classList.add("game-players-num-container");
        gameSelect.appendChild(gamePlayersNum);
        var gamePlayersSymbol = document.createElement("div");
        gamePlayersSymbol.classList.add("game-players-num-symbol");
        gamePlayersNum.appendChild(gamePlayersSymbol);
        var gamePlayersNumber = document.createElement("div");
        gamePlayersNumber.classList.add("game-players-num-label");
        gamePlayersNumber.innerHTML = "";
        if(currGame.minPayers != null) gamePlayersNumber.innerHTML += currGame.minPayers;
        if(currGame.minPayers != null && currGame.maxPlayers != null) gamePlayersNumber.innerHTML += " - ";
        if(currGame.maxPlayers != null) gamePlayersNumber.innerHTML += currGame.maxPlayers;
        gamePlayersNum.appendChild(gamePlayersNumber);
      }

      if (prevGame && currGame.name == prevGame) {
        gameSelect.selectGame = [x, y];
      }
	  }
  }
  if (!gameSelect.checkValid(gameSelect.selectGame)) { gameSelect.selectGame = gameSelect.randomSelect(); }
  gameSelect.setGameActive(gameSelect.selectGame[0], gameSelect.selectGame[1]);
};

GameSelect.prototype.getElementTopPos = function (y) {
  return window.innerWidth * (gameSelect.marginTop + y * gameSelect.gameRowHeight);
}

GameSelect.prototype.setGameActive = function (x, y) {
  gameSelect.gamesArray[y][x][1].classList.add("active");
  if(gameSelect.gamesArray[y][x][0].author) {
    gameSelect.gamesArray[y][x][1].gameAuthorFadeElem.classList.add("active");
    gameSelect.gamesArray[y][x][1].authorElem.classList.add("active");
  }
  gameSelect.gamesArray[y][x][1].gameGifElem.classList.add("active");
}
GameSelect.prototype.setGameInactive = function (x, y) {
  gameSelect.gamesArray[y][x][1].classList.remove("active");
  if(gameSelect.gamesArray[y][x][0].author) {
    gameSelect.gamesArray[y][x][1].gameAuthorFadeElem.classList.remove("active");
    gameSelect.gamesArray[y][x][1].authorElem.classList.remove("active");
  }
  gameSelect.gamesArray[y][x][1].gameGifElem.classList.remove("active");
}
GameSelect.prototype.randomSelect = function () {
  var rY = Math.floor(Math.random() * gameSelect.gamesArray.length);
  var rX = Math.floor(Math.random() * gameSelect.gamesArray[rY].length);
	return [rX, rY];
}
GameSelect.prototype.checkValid = function (newSelect) {
	if (newSelect[1] < 0 || newSelect[1] >= gameSelect.gamesArray.length) return false;
	if (newSelect[0] < 0 || newSelect[0] >= gameSelect.gamesArray[newSelect[1]].length) return false;
	return true;
}

GameSelect.prototype.setNewSelect = function (newSelect) {
  gameSelect.setGameInactive(gameSelect.selectGame[0], gameSelect.selectGame[1]);
	gameSelect.selectGame = newSelect;
  gameSelect.setGameActive(gameSelect.selectGame[0], gameSelect.selectGame[1]);
  var newElemBottom = gameSelect.getElementBotPos(gameSelect.selectGame[1] + 1) - gameSelect.currTopOffset;
  if (newElemBottom > window.innerHeight) {
    gameSelect.currTopOffset += newElemBottom - window.innerHeight;
    gameSelect.gamesContainer.style.marginTop = "-" + gameSelect.currTopOffset + "px;";
  }
  var newElemTop = gameSelect.getElementBotPos(gameSelect.selectGame[1]) - gameSelect.currTopOffset;
  if (newElemTop < 0) {
    gameSelect.currTopOffset += newElemTop;
    gameSelect.gamesContainer.style.marginTop = "-" + gameSelect.currTopOffset + "px;";
  }

}
GameSelect.prototype.handleKeyDown = function (e) {
  var newSelect = gameSelect.selectGame.slice();
  var changedSelect = false;
  switch (e.key) {
    case "ArrowUp":
      changedSelect = true;
	    newSelect[1]--;
      break;
    case "ArrowDown":
      changedSelect = true;
	    newSelect[1]++;
      break;
    case "ArrowLeft":
      changedSelect = true;
	    newSelect[0]--;
      break;
    case "ArrowRight":
      changedSelect = true;
	    newSelect[0]++;
      break;
    case "Enter":
	    gameSelect.postGameSelectMessageToContainer(gameSelect.gamesArray[gameSelect.selectGame[1]][gameSelect.selectGame[0]][0]);
      break;
    default:
  }
  if (changedSelect && gameSelect.checkValid(newSelect)) {
    gameSelect.setNewSelect(newSelect);
  }
}


var gameSelect = new GameSelect();
gameSelect.initialize();
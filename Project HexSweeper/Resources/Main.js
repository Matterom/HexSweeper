	////////////////////////////
	// Game Control Variables //
	////////////////////////////


var pointyTop = false;  // Under consitution
var debug = false;      // Enables some Testing code
var mapsize = 24;       // Determines Map size, Need to Redesign
var mapCenterX = 0;   // Determines some Map Control, Needs redesign
var mapCenterY = 0;   // 
var activeMenu = "Start";
var flagCount = 0; // a count of placed flags
var currentDifficulty = ""; // Empty Difficulty level
var time = 0;
var timeKeeper = "";


// Difficulty Setting parameters
var easy = {
	radius: 9,
	mines: 30 // 30
}
var intermediate = {
	radius: 16,
	mines: 100 //100
}
var hard = {
	radius: 24,
	mines: 250 //250
}

//Derivitive Variables
if (pointyTop == true) {
	var xInc = 9;
	var yInc = 15;
}
else {
	var xInc = 15;
	var yInc = 9;
}

	////////////////////////////
	// Game Control Functions //
	////////////////////////////

// disables zooming
window.onwheel = function(){ 

	return false;
}


//----------------------------------//

		/////////////////////
		// Load Game Files //
		/////////////////////
// Useless for switch to Minesweeper
// Initial json Load Test, this method was inefective, Required special browser configuration

//----------------------------------//

	//////////////////////
	// On Load function //
	//////////////////////
	
window.addEventListener("load", function() {
	
	// Initialize New Game Listeners and difficulty options
	var newGame = document.getElementById("newGame")
	var menulist = document.getElementById("MenuContent")
	newGame.addEventListener("click", function(){
		menulist.removeChild(newGame);
		var pattern = /(?:')(\w+)(?:')/
		var diffh = "<h2 id='difficulty'>Difficulty</h2>";
		menulist.innerHTML += diffh;
		var dOptions = ["<a href='#' id='easy'>Easy</a>", "<a href='#' id='inter'>Intermediate</a>", "<a href='#' id='hard'>Hard</a>"];
		for (let d = 0; d < dOptions.length; d++) {
			menulist.innerHTML += dOptions[d];
		}
 		for (let e = 0; e < dOptions.length; e++) {
			var dif = document.getElementById(pattern.exec(dOptions[e])[1])
			dif.addEventListener("click", function() {
				closeMainMenu();
				console.log(this.id)
				reset(this.id);
			})
		}
	},false)
},false);



function GameOver(win) {
	console.log("gameOver");
	var res = document.getElementById("Reset")
	if ((res.innerHTML.indexOf("You Win") != -1) && win == false) {
		res.innerHTML = "Game Over</br> Restart?";
	}
	else if ((res.innerHTML.indexOf("Game Over") != -1) && win == true) {
		res.innerHTML = "You Win</br> Restart?";
	}
	res.style.display = "block";
	res.addEventListener('click', reset)
	revealAll();
}

function timer(arg) {
	switch(arg) {
		case "start":
			timeKeeper = setInterval(updateClock,1000);
			break;
		case "clear":
			clearInterval(timeKeeper)
			time=0
		case "pause":
			clearInterval(timeKeeper)
	}
}
function updateClock() {
	var watch = document.getElementById("Watch");
	watch.innerHTML = "Time: " + time;
	time += 1;
}
function updateFlag() {
	var flag = document.getElementById("MineCount");
	console.log(currentDifficulty.mines)
	console.log(flagCount)
	flag.innerHTML = "Flags Left: " + (currentDifficulty.mines - flagCount);
}
function resetMenu() {
}

function checkWin() {
	let mines = document.getElementsByClassName("mine");
	let flagged = 0;
	for (let m = 0; m < mines.length; m++) {
		if (mines[m].classList.contains("flagged")) {
			flagged += 1;
		}
	}
	if (flagCount == flagged) {
		GameOver(true);
	}
}

function reset(difficulty) {
	if (difficulty == null) {
		difficulty = currentDifficulty;
	}
	console.log("Reseting   Difficulty: " + difficulty)
	var res = document.getElementById("Reset")
	res.style.display = "none";
	document.getElementById("HexMap").innerHTML = "";
	switch(difficulty) {
		case "easy":
			difficulty = easy;
			break;
		case "inter":
			difficulty = intermediate
			break;
		case "hard":
			difficulty = hard;
			break;
		default:
			difficulty = currentDifficulty;
	}
	currentDifficulty = difficulty;
	buildHexMap(difficulty);
	populateMines(difficulty.mines);
	deployListeners();
	timer("clear");
	timer("start")
	flagCount = 0;
	updateFlag();
}
//Spawns Listeners on Hexagons
function deployListeners() {
	// Hex Click
	var arrHex = document.getElementsByClassName("hex");
	for (var i = 0; i < arrHex.length; i++) {
		arrHex[i].addEventListener('click', function() {
		var hex = new hexagon(getAxialByID(this.id));
		});
	}
	
	//Flag Drop
	var hide = document.getElementsByClassName("hidden");
	for (var i = 0; i < hide.length; i++) {
		hide[i].addEventListener('click', function(){
			if (!this.classList.contains("flagged")) {
				if (this.classList.contains("mine")) {
					GameOver(false);
				}
				else {
					clearHidden(this);
				}
			}
		}, false);
		hide[i].addEventListener('contextmenu', function(e){
			e.preventDefault() ;
			if(this.classList.contains("flagged")) {
				this.classList.remove("flagged");
				flagCount -= 1;
				updateFlag();
			}
			else if (this.classList.contains("hidden")) {
				this.classList.add("flagged");
				flagCount += 1
				updateFlag()
				if (flagCount == currentDifficulty.mines) {
					checkWin();
				}
			}

		}, false);
	}
	
	//ScrollBlock
	window.addEventListener('scroll', function(e) {
		//console.log(window.scrollY)
		updatViewBox(window.scrollY)
	})
}
//Reveal Tile Test

// Controls viewbox size on difficulty change to fit screen. Should support different screen resolutions... Should
function setViewBox(size) {
	var map = document.getElementById("HexCanvas").getAttribute("viewBox").split(/\s+|,/);
	map[2] = size;
	map[3] = size;
	document.getElementById("HexCanvas").setAttribute("viewBox", map[0] + " " + map[1] + " " + map[2] + " " + map[3]);   
}




	////////////////////////////
	// Object Definition Zone //
	////////////////////////////
	


// Defines the Hexagon
function hexagon(c) {
	this.axial = new axialCoords(c[0], c[1]);
	this.cube = new cubeCoords(c[0], c[1]);
	//this.grid = new gridCoords(c[0], c[1]); // does not work as i would of hoped, fix later, unnecisary atm.
	//this.biome = document.getElementById(c); //consider moving biome to object tied to hexagon;
	//this.corrupted = document.getElementById(c).classList.contains("corrupted"); // should Return true, won't be used for game, just playing with concepts.
	// 
}
// Axis coordinate System, Used for most things, shoudn't change.
function axialCoords(q, r) {
	this.q = q;
	this.r = r;
}
// Cube Coordinate System, Used for specifics, shoudn't change.
function cubeCoords(q, r) {
	this.x = q;
	this.z = r;
	this.y = -q-r;
}
// Hexagon location on map, Needs to update on Map Update
function gridCoords(q, r) {
	var coord = document.getElementById(getElementByAxial(q, r)).getBoundingClientRect();
	this.x = coord.x;
	this.y = coord.y;
	setGridCoords = function(x ,y) {
		this.x = x;
		this.y = y;
	}

}



/*Begin Event Zone/

function event(EData) {
	
}

/*End Event Zone*/




/* Selection Control */







/* Menu Control Functions */
function openMainMenu() {
    document.getElementById("MainMenu").style.height = "100%";
	document.getElementById("MainMenu").style.transitionDuration = "2s";
	timer("pause");
	
}
function closeMainMenu() {
	document.getElementById("MainMenu").style.height = "0%";
	document.getElementById("MainMenu").style.transitionDuration = "2s";
	timer("start");
}

	/////////////////////////
	//  Character Creation //
	/////////////////////////

	
//----------------------------------//

	////////////////////
	// Event Handlers //
	////////////////////


//----------------------------------//

	////////////////////////////
	// Primary Map Generation //
	////////////////////////////

var built = false;
var ns = "http://www.w3.org/2000/svg"
var ns2 = "http://www.w3.org/1999/xlink"
	

	
function buildHexMap(difficulty) {
	mapsize =difficulty.radius
	if (mapsize == 9) {
		setViewBox(500);
	}
	else if (mapsize == 16) {
		setViewBox(600)
	}
	else if (mapsize == 24) {
		setViewBox(850);
	}
	else {
		setViewBox(850);
	}
	var map = document.getElementById("HexCanvas").getAttribute("viewBox").split(/\s+|,/);
	mapCenterX = map[2] / 2;   
	mapCenterY = map[3] / 2;
	built=true;
	var ring = 6;
	var xOffset = 0; // initializers
	var yOffset = 0; // initializers
	var qCoordID = 0;
	var rCoordID = 0;
	


	//console.log("Building Map");
	
	for (i = 0; i < mapsize; i++) {
		if (debug) {
			//console.log("Map Size " + mapsize);
		}
		if (i == 0) {
			buildHex(mapCenterX, mapCenterY, qCoordID, rCoordID);
		}
		else {
			for (k = 0; k < (ring * i); k++) {
				if (debug) {
					//console.log("Hex " + (k + 1));
				}
				if (k == 0) {
					qCoordID = -1 * i;
					rCoordID = 1 * i;
					xOffset = xOffsetSet(qCoordID, rCoordID, i)							
					yOffset = yOffsetSet(qCoordID, rCoordID, i)
					buildHex(xOffset, yOffset, qCoordID, rCoordID);
							// if (debug) {
								// console.log("QCoord " + qCoordID);
								// console.log("RCoord " + rCoordID);
							// }
				}
				else {
					if (qCoordID == (i*-1) && rCoordID == i) {
						while (qCoordID < 0) {
							qCoordID += 1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							//if (debug) {
								//console.log("QCoord " + qCoordID);
								//console.log("RCoord " + rCoordID);
							//}
						}
					}
					else if (qCoordID == 0 && rCoordID == i) {
						while (rCoordID > 0) {
							qCoordID += 1;
							rCoordID -= 1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							//if (debug) {
								//console.log("QCoord " + qCoordID);
								//console.log("RCoord " + rCoordID);
							//}
						}
					}
					else if (qCoordID == i && rCoordID == 0) {
						while (rCoordID > (i*-1)) {
							rCoordID -= 1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							//if (debug) {
							//	console.log("QCoord " + qCoordID);
							//	console.log("RCoord " + rCoordID);
							//}
						}
					}
					else if (qCoordID == i && rCoordID == (i*-1)) {
						while (qCoordID > 0) {
							qCoordID -= 1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							// if (debug) {
								// console.log("QCoord " + qCoordID);
								// console.log("RCoord " + rCoordID);
							// }
						}
					}
					else if (qCoordID == 0 && rCoordID == (i*-1)) {
						while (rCoordID < 0) {
							qCoordID -= 1;
							rCoordID += 1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							// if (debug) {
								// console.log("QCoord " + qCoordID);
								// console.log("RCoord " + rCoordID);
							// }
						}							
					}
					else if (qCoordID == (i*-1) && rCoordID == 0) {
						while (rCoordID < (i-1)) {
							rCoordID +=1;
							xOffset = xOffsetSet(qCoordID, rCoordID, i)							
							yOffset = yOffsetSet(qCoordID, rCoordID, i)
							buildHex(xOffset, yOffset, qCoordID, rCoordID);
							// if (debug) {
								// console.log("QCoord " + qCoordID);
								// console.log("RCoord " + rCoordID);
							// }
						}	
					}
				}
			}			
		}
	}
}
function xOffsetSet(qCoordID, rCoordID, ring) {
	if (qCoordID == 0) {
		return mapCenterX;
	}
	else {
		return mapCenterX + (xInc * qCoordID);
	}
}
function yOffsetSet(qCoordID, rCoordID, ring) {
	var yOffset = 0;
	if (qCoordID == 0) {
		return (mapCenterY - (yInc * (rCoordID * 2)));
	}
	else if (isEven(qCoordID)){
		if (rCoordID < 0) {
			return mapCenterY - ((yInc * 2) * (rCoordID + (qCoordID / 2)));
		}
		if (rCoordID >= 0) {
			return mapCenterY - ((yInc * 2) * (rCoordID + (qCoordID / 2)));
		}
	}
	else {
		if (qCoordID < 0){
			if (rCoordID <= 0) {
				return mapCenterY - ((yInc * (rCoordID + ((qCoordID / 2) -0.5)))*2 + yInc);
			}
			else if (rCoordID > 0) {
				return mapCenterY - ((yInc * (rCoordID + ((qCoordID / 2) + 0.5)))*2 - yInc);
			}
		}
		else {
			if (rCoordID >= 0) {
				return mapCenterY - ((yInc * (rCoordID + ((qCoordID / 2) + 0.5)))*2 - yInc);
			}
			else if (rCoordID < 0) {
				return mapCenterY - ((yInc * (rCoordID + ((qCoordID / 2) -0.5)))*2 + yInc);
			}

		}
	}
	return mapCenterY
}

function isEven(test){
	return (test % 2) == 0
}

function getAxialByID(attrID) {
	var hex = attrID.split("::");
	hex[0] = parseInt(hex[0].replace('Q',''));
	hex[1] = parseInt(hex[1].replace('R',''));
	return hex;
}

function getElementByAxial(q, r) {
	var Element = "Q" + q +"::"+ "R" + r
	// console.log(q)
	// console.log(Element);
	return document.getElementById(Element);
}

function Cube_to_Axial(cube) {
	var q = cube.x;
	var r = cube.z;
	return Hex(q, r);
}
function Axial_to_Cube(axial) {
	var x = hex.q;
	var z = hex.r;
	var y = -x-z
	return Cube(x, y, z);
}

function buildHex(xOffset, yOffset, qCoordID, rCoordID) {
	if(pointyTop == true) {
		//experament gone wrong.
	}
	else {
		var parent = document.getElementById("HexMap");
		var hex = document.createElementNS(ns ,"use");
		if(debug) {
			//Experamental code, removed
		}
		else {
			hex.setAttribute("class", "hex hidden"); // HERE
		}
		hex.setAttribute("id", "Q"+ qCoordID + "::"+ "R" + rCoordID);
		hex.setAttributeNS(ns2, "href", "#Hex");
		hex.setAttribute("transform", "translate("+xOffset+","+yOffset+") rotate(0 0 0)");
		parent.appendChild(hex);
	}
}

function populateMines(mines) {
	var hex = document.getElementsByClassName("hex");
	while (mines > 0) {
		var select = hex[Math.floor(Math.random() * hex.length)];
		if (!select.classList.contains("mine")) {
			select.classList.add("mine");
			--mines;
		}			
	}
	//console.log(hex.length);
	for(i = 0; i < hex.length ; i++) {
		//console.log(i);
		if (!hex[i].classList.contains("mine")) {
			//get hexagons around this hex, check each for a mine, count mines, place number
			var count = adjacentCount(hex[i]);
			switch(count) {
				case 0:
					hex[i].classList.add("Zero");
					break;
				case 1:
					hex[i].classList.add("One");
					break;
				case 2:
					hex[i].classList.add("Two");
					break;
				case 3:
					hex[i].classList.add("Three");
					break;
				case 4:
					hex[i].classList.add("Four");
					break;
				case 5:
					hex[i].classList.add("Five");
					break;
				case 6:
					hex[i].classList.add("Six");
					break;
				default:
					break;
			}
		}
	}
}

function adjacentCount(loc) {
	var hex = new hexagon(getAxialByID(loc.id));
	var adjacency = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
	var result = 0;
	for (i2=0; i2 < adjacency.length; i2++) {
		let q = adjacency[i2][0]
		let r = adjacency[i2][1]
		var thisHex = getElementByAxial((hex.axial.q + q), (hex.axial.r + r));
		if (thisHex == null) {
			
		}
		else if (thisHex.classList.contains("mine")) {
			++result;
		}
	}
	return result;
}

function clearHidden(loc) {
	var hex = new hexagon(getAxialByID(loc.id))
	var adjacency = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
    if (loc == null) {
	}
	else if (loc.classList.contains("Zero") && loc.classList.contains("hidden")) {
		loc.classList.remove("hidden")
		let s=0;
		for ( s=0; s < adjacency.length; ++s) {
			var target = getElementByAxial((hex.axial.q + adjacency[s][0]),( hex.axial.r + adjacency[s][1]));
			//console.log(target)
			if (target != null) {
				clearHidden(target);
			}
		}
	}
	else if (!loc.classList.contains("Zero") && loc.classList.contains("hidden") && !loc.classList.contains("mine")) {
		loc.classList.remove("hidden");
		
	}
}


function revealAll() {
	var hex = document.getElementsByClassName("hex");
	for ( i = 0; i < hex.length; i++) {
		if (hex[i].classList.contains("hidden")) {
			hex[i].classList.remove("hidden");
		}
	}
}

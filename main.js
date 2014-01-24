var TictacRef;
var IDs;


angular.module("TicTacTio", ["firebase"])
	.controller("play", function($scope, $firebase, $interval,$q) {


	$scope.onlinePlay = function(){
	TictacRef = new Firebase("https://tictactio.firebaseio.com/");
	$scope.fbRoot = $firebase(TictacRef);	

	$scope.fbRoot.$on("loaded", function(){
		IDs = $scope.fbRoot.$getIndex();
		if(IDs.length == 0)
		{

	 		$scope.fbRoot.$add( { board: [['','',''],['','',''],['','','']], gameNum: 1, bestOf: 3, counter: 0, first: true });
	 		$scope.fbRoot.$add( { menu: false,
				wait: false,
				start: false,
				winner: false,
				regplay: 1,
				timedGame: true,
				mopen: false,
				apos: "'",
				way: '',
				wayNum: 0,
				homewinner: false,
				awaywinner: false,
				open: false
			});
			$scope.fbRoot.$add( {
				timeChoiceText: "On",
				counts: [false, false, false, false, false, false, false, false],
				timesup: false,
				paused: false,
				countin: 0,
				timeUpWin: ""
			});
			$scope.fbRoot.$add( {chip:"X",name:"Home",wins: 0} );

			$scope.fbRoot.$add( {chip:"O",name:"Away",wins: 0} );

			$scope.fbRoot.$on("change", function() {
				IDs = $scope.fbRoot.$getIndex();
				$scope.game = $scope.fbRoot.$child(IDs[0]);
				$scope.visual = $scope.fbRoot.$child(IDs[1]);
				$scope.gameTimer =$scope.fbRoot.$child(IDs[2]);
				$scope.players = [$scope.fbRoot.$child(IDs[3]),$scope.fbRoot.$child(IDs[4])];
				console.log($scope.game);
			});
			console.log($scope.game);
		}
		else
		{
			console.log(IDs);
			$scope.game = $scope.fbRoot.$child(IDs[0]);
			$scope.visual = $scope.fbRoot.$child(IDs[1]);
			$scope.gameTimer =$scope.fbRoot.$child(IDs[2]);
			$scope.players = [$scope.fbRoot.$child(IDs[3]),$scope.fbRoot.$child(IDs[4])];
			x=$scope.game;
			console.log(x.board);
			console.log($scope.game);
			setTimeout(function() {
				if($scope.game!=undefined){
				deffer.resolve();
			}
		}, 10000);
			
		}

	console.log($scope.game);

	});

};
	
// 	var deffer = $q.defer();

// 	deffer.promise.then(function() {

// 		$scope.$watch('$scope.game',function(){
// 			console.log("askjdfhajdfksjdfhasf");
// 			$scope.game.$save();
// 		});
// 	});


// console.log("Helllooooooo");
// console.log($scope.game);

	


	$scope.players = [{chip:"X",name:"Home",wins: 0},{chip:"O",name:"Away",wins: 0}];

// Game Var

	$scope.game = { 
	board: [['','',''],['','',''],['','','']],
	gameNum: 1,
	bestOf: 3,
	counter: 0,
	first: true
	};	
// Game Var

// Visual & Functional Var
	$scope.visual = {
		menu: false,
		wait: false,
		start: false,
		winner: false,
		regplay: 0,
		timedGame: true,
		mopen: false,
		apos: "'",
		way: '',
		wayNum: 0,
		homewinner: false,
		awaywinner: false,
		open: false
	};
// Visual & Functional Var
	
// AI Var
	var player1total=0;
	var player2total=0;
	var theMove = [,];
	var saverightmove = [,];
	var iter = 0;
	var winfound = false;
	var track = 0;
// AI Var

// Timer Var
$scope.gameTimer = {
	timeChoiceText: "On",
	counts: [false, false, false, false, false, false, false, false],
	timesup: false,
	paused: false,
	countin: 0,
	timeUpWin: ""
	};
	var timekeeper;
// TimerVar

/* Time Functions*/
	$scope.keyPressPause = function(pPress) {
        $scope.pressed = pPress.which;
        if (pPress.which==80 && $scope.visual.start)
            $scope.pauseTime();
        if (pPress.which==77 && !$scope.visual.start){
        	$scope.visual.mopen=!$scope.visual.mopen;
        	$scope.visual.menu=!$scope.visual.menu;
			$scope.visual.wait = !$scope.visual.wait;

			$scope.game.board[1][1] = ($scope.game.board[1][1] =="Start"?'':'Start');
        }
        if(pPress.which==13 && !$scope.visual.start && $scope.visual.menu){
        			$scope.visual.open=true;
					$scope.visual.wait = false;
					$scope.visual.start=true;
					$scope.game.board[1][1] = "";
					$scope.visual.mopen = false;
					clearTime();
        }
        if(pPress.which==27 && $scope.visual.start ){
        	$scope.quit();
        }
        if((pPress.which==38 || pPress.which==40) && !$scope.visual.start && $scope.visual.mopen ){
        	if($scope.visual.regplay==2){
        	$scope.visual.regplay=0;
        	}
        	else {
        		$scope.visual.regplay++;
        	}
        }
        if((pPress.which==37 || pPress.which==39) && !$scope.visual.start && $scope.visual.mopen ){
        	$scope.visual.timedGame=!$scope.visual.timedGame
        }
            
    };

	startTime = function(){

		if ( angular.isDefined(timekeeper) ) return;
 
		timekeeper = $interval(function() {
      		if ($scope.gameTimer.countin < 8){
				$scope.gameTimer.counts[$scope.gameTimer.countin] = true;
				$scope.gameTimer.countin ++;
				
			}
			else{
				if($scope.visual.timedGame){
					$scope.gameTimer.timeUpWin = checkTurn();
					afterMove();
				}
				$scope.gameTimer.timesup = true;
				$scope.game.counter = 9;
				updateFire();
			}
    	}, 1000);
	}

	$scope.$watch('timedGame',function(){
		if($scope.visual.timedGame == true){
			$scope.gameTimer.timeChoiceText="On ";
			updateFire();
		}
		else{
			$scope.gameTimer.timeChoiceText="Off";
			updateFire();
		}
	});

	$scope.pauseTime = function() {
		if($scope.visual.winner !=true){
			
			if($scope.gameTimer.paused==true){
				$scope.gameTimer.paused=false;
				$scope.turnlabel=''; 
				$scope.gamelabel='';
				startTime();
			}
			else{
				$scope.turnlabel=$scope.visual.apos + 's Turn'; 
				$scope.gamelabel='Game ';
				$scope.gameTimer.paused=true;
				if (angular.isDefined(stop)) {
		      		$interval.cancel(timekeeper);
		      		timekeeper = undefined;
		      		updateFire();
		    	}
			}
		}

	}

	updateFire = function(){
		if($scope.visual.regplay==1){
			$scope.players[0].$save();
			$scope.players[1].$save();
			$scope.game.$save();
			$scope.visual.$save();
			$scope.gameTimer.$save();
		}
	}

			
	clearTime = function(){

		if (angular.isDefined(stop)) {
	      $interval.cancel(timekeeper);
	      timekeeper = undefined;
	    }
	    $scope.gameTimer.counts = [false, false, false, false, false, false, false, false]; 
		$scope.gameTimer.countin = 0;
		$scope.gameTimer.timesup = false;
		updateFire();

	}
/* Time Functions*/

	$scope.clickCell = function(r,c) {

			if($scope.visual.menu==false){
				if(r==1&&c==1){
					$scope.visual.menu=true;
					$scope.visual.wait = true;
					$scope.game.board[1][1] = "Start";
					updateFire();
				}
			}
			else if($scope.visual.menu==true&&$scope.visual.start==false){
				if(r==1&&c==1){
					$scope.visual.open=true;
					$scope.visual.wait = false;
					$scope.visual.start=true;
					$scope.game.board[1][1] = "";
					$scope.visual.mopen = false;
					clearTime();
					updateFire();
				}
				else {
					$scope.visual.menu=false;
					$scope.visual.wait = false;
					$scope.game.board[1][1] = "";
					$scope.visual.mopen = false;
					updateFire();
				}
			}
			else {
				$scope.visual.mopen = false;
				if($scope.visual.regplay == 0){passNplay(r,c);updateFire();}
				else{
					if(checkTurn() == $scope.players[1].chip){playerMove(r,c); player1total += r+c;}
					if (checkTurn() == $scope.players[0].chip && $scope.visual.winner == false){ 
						console.log("next turn");
						winfound = false;
						track = game.counter; 
						placeMove(computerPlayer($scope.game.board)); 
						iter = 0; 
					}
				}
			}
	};

	checkTurn = function() {

		if($scope.game.first){
		return ($scope.game.counter%2==0?$scope.players[1].chip:$scope.players[0].chip);
		}
		else{
		return ($scope.game.counter%2==0?$scope.players[0].chip:$scope.players[1].chip);
		}
	}
	$scope.checkNextTurn = function() {

		if($scope.game.first){
		return ($scope.game.counter%2==0?$scope.players[0].chip:$scope.players[1].chip);
		}
		else{
		return ($scope.game.counter%2==0?$scope.players[1].chip:$scope.players[0].chip);
		}
	}
	$scope.playAgain = function() {
		$scope.game.board = [['','',''],['','',''],['','','']];
		$scope.visual.winner = false;
		$scope.visual.homewinner = false;
		$scope.visual.awaywinner = false;
		$scope.game.gameNum += 1;
		$scope.gameTimer.paused = false;
		$scope.game.counter = 0;
		$scope.game.first = !$scope.game.first;
		player1total=0;
		player2total=0;
		$scope.visual.way = '';
		$scope.visual.wayNum = 0;
		$scope.gameTimer.timeUpWin ="";
		clearTime();
		updateFire();
	
	};

	

	
	passNplay = function (r,c) {


				console.log("your turn");
				clearTime();
				startTime();
				$scope.game.counter = ($scope.game.board[r][c]==''&&$scope.gameTimer.paused==false ? $scope.game.counter+1 : $scope.game.counter);
				$scope.game.board[r][c]=($scope.game.board[r][c]==''&&$scope.gameTimer.paused==false ? checkTurn() : $scope.game.board[r][c]);
				afterMove();
				
	};

	playerMove = function(r,c) {

				console.log("your turn");
				clearTime();
				startTime();
				game.counter = ($scope.game.board[r][c]==''&&$scope.gameTimer.paused==false ? $scope.game.counter+1 : $scope.game.counter);
				$scope.game.board[r][c]=($scope.game.board[r][c]==''&&$scope.gameTimer.paused==false ? $scope.players[0].chip : $scope.game.board[r][c]);
				afterMove();
	};

	dupArray = function() {

		var testBoard = [['','',''],['','',''],['','','']];

		for(var i=0;i<3;i++){
			for (var j=0;j<3;j++) {

				testBoard[i][j] = $scope.game.board[i][j]; 

			}
		}
	};
	$scope.isWinning = function(r,c) {
		if($scope.visual.winner == true) {
			if($scope.visual.way == 'row') {
				if (r == $scope.visual.wayNum) {
					return true;
				}
			}
			else if ($scope.visual.way == 'col') {
				if (c == $scope.visual.wayNum) {
					return true;
				}

			}
			else if ( $scope.visual.way == 'dai') {
				if ($scope.visual.wayNum == -1) {
					if(r==c){
						return true
					}
				}
				else if ($scope.visual.wayNum == -2) {
					if (Math.abs(r-c)== 2 || (r ==1 & c==1)) {
						return true;
					}

				}
			}
		}
		return false;
	};

	afterMove = function() {

		if(checkWin($scope.game.board)==2 || $scope.gameTimer.timeUpWin =="X"){
			$scope.win = "Home";
			$scope.players[0].wins += 1;
			$scope.visual.winner = true;
			$scope.visual.homewinner = true;
			clearTime();
			console.log($scope.visual.way + $scope.visual.wayNum);
	
		}
		else if (checkWin($scope.game.board)==1 || $scope.gameTimer.timeUpWin =="O"){
			$scope.win = "Away";
			$scope.players[1].wins += 1;
			$scope.visual.winner = true;
			$scope.visual.awaywinner = true;
			clearTime();
			console.log($scope.visual.way + $scope.visual.wayNum);
			
		}
		else{
			$scope.win = "No winner";
			$scope.visual.way = '';
			$scope.visual.wayNum = 0;
			
		}
		if($scope.game.counter==9&&checkWin($scope.game.board)==0){
			console.log("catz");
			$scope.win = "Catz";
			$scope.visual.way = '';
			$scope.visual.wayNum = 0;
			$scope.visual.winner = true;
			clearTime();
		}
		return 0;
	};

	$scope.quit = function() {
		if($scope.visual.start==true){
			console.log("start menu true");
			$scope.visual.start=false;
			$scope.visual.open=false;
			$scope.players[0].wins =0;
			$scope.players[1].wins =0;
			$scope.visual.wait = false;
			$scope.playAgain();
			$scope.game.gameNum = 1;
			$scope.visual.menu = false;
			$scope.game.first = true;
		}
		else if ($scope.visual.wait == true && $scope.visual.mopen==false) {
			console.log("wait true");
			$scope.visual.menu=true;
			$scope.visual.mopen = true;
		}
		else{
			console.log("wait false");
			$scope.visual.mopen=!$scope.visual.mopen;
			$scope.visual.menu=!$scope.visual.menu; 
			$scope.visual.wait = !$scope.visual.wait;
			$scope.game.board[1][1] = ($scope.game.board[1][1]==''?"Start":'');
		}
		updateFire();
	};

//Checks Board for win condition. Returns 1 for Away win. Returns 2 for Home win. Returns 0 for no winner.
	checkWin = function(bb){

		for(i = 0; i < 3; i++ ){
			var y = 0; z = 0; c = 0; p = 0; t = 0; q = 0; bdx = 0; bdy = 0;
			for(f = 0; f < 3; f++){
				if(bb[i][f] == $scope.players[1].chip){ y += 1;}
				if(bb[i][f] == $scope.players[0].chip){ z += 1;}
				if(bb[f][i] == $scope.players[1].chip){ c += 1;}
				if(bb[f][i] == $scope.players[0].chip){ p += 1;}
				if(bb[f][f] == $scope.players[0].chip){ t += 1;}
				if(bb[f][f] == $scope.players[1].chip){ q += 1;}
				if(bb[f][2-f] == $scope.players[0].chip){ bdx += 1;}
				if(bb[f][2-f] == $scope.players[1].chip){ bdy += 1;}
			}

				if (y == 3 || z == 3){
					$scope.visual.way = 'row';
					$scope.visual.wayNum = i;
				}
				if (c == 3 || p == 3){
					$scope.visual.way = 'col';
					$scope.visual.wayNum = i;
				}
				if (t == 3 || q == 3){
					$scope.visual.way = 'dai';
					$scope.visual.wayNum = -1;
				}
				if (bdx == 3 || bdy == 3){
					$scope.visual.way = 'dai';
					$scope.visual.wayNum = -2;
				}


				if(y == 3 || c == 3 || q == 3 || bdy == 3) {

					return 1;
				}
				if(z == 3 || p == 3 || t == 3 || bdx == 3) { 

					return 2;
				}
		}
		return 0;
	};

	computerPlayer = function(inboard) {

		var moved = false; movedx = false; move = [,]; movex = [,]; movereg = [,]; availableMoves = [];
		var testBoard = [['','',''],['','',''],['','','']];
		var testBoard2 = [['','',''],['','',''],['','','']];
		iter++;
		var opponent = $scope.players[0].chip;
		var self = $scope.players[1].chip;
		var oppnwin = 1;
		var selfwin = 2;



		if(iter%2==0){

			opponent = $scope.players[1].chip;
			self = $scope.players[0].chip;
			oppnwin = 1;
			selfwin = 2;
		}
		else {
			opponent = $scope.players[0].chip;
			self = $scope.players[1].chip;
			oppnwin = 2;
			selfwin = 1;
		}

		console.log(self + "'s turn" + iter);


		for(var i=0;i<3;i++){
			for (var j=0;j<3;j++) {
				testBoard[i][j] = inboard[i][j]; 
				testBoard2[i][j] = inboard[i][j]; 
			}
		}
		for(var i=0;i<3;i++){
			for (var j=0;j<3;j++) {
				if(testBoard[i][j]=='' && (moved ==false || movedx ==false))
				{
					movereg = [i,j];
					availableMoves.push(movereg);
					testBoard[i][j] = self;
					testBoard2[i][j]= opponent;
					console.log("this is test one: " + testBoard);
					console.log(i + " : " + j);
					if(checkWin(testBoard)==selfwin){
						move = [i,j];
						console.log("test 1 pass");
						console.log(move); 
						moved = true;
					}
					console.log("this is test two: " + testBoard2);
					console.log(i + " : " + j);
					if(checkWin(testBoard2)==oppnwin){
						movex = [i,j];
						console.log("test 2 pass");
						console.log(movex);
						movedx = true;
					}
					testBoard[i][j]='';
					testBoard2[i][j]='';
				}
			}
		}
		if(moved == true){ 
			player2total += move[0]+move[1]; 
			theMove[0] =  move[0]; 
			theMove[1] =  move[1]; 
			console.log("1"); 
			console.log(theMove);
			if(self=='O'){
			winfound = true;
			console.log("winfound");
			}
		}
		else if (movedx == true && moved == false){
			player2total += movex[0]+movex[1]; 
			theMove[0] =  movex[0]; 
			theMove[1] =  movex[1]; 
			console.log("2"); 
			console.log(theMove);
			if(self=='O'){
			winfound = true;
			console.log("winfound");
			}
			
		}
		else { 
				var sidemove=false;
				var centerfree =false;
				var sidemovemade=false;
				if(player1total%2==0 && track >=3 && player1total<5 ){sidemove=true;}
				console.log(sidemove);
				angular.forEach(availableMoves, function(moves){
					
					if(moves[0]==1 && moves[1]==1){ 
						theMove[0] =  moves[0]; 
						theMove[1] =  moves[1]; 
						movereg=moves; 
						centerfree =true; 
						console.log(centerfree); 
						console.log("3"); 
						console.log(theMove);
						return theMove;
					}
					else if((moves[0] + moves[1])%2==0 && !centerfree && !sidemove && !sidemovemade){
						if(track%2!=0){
							console.log("4");
							movereg=moves;
							sidemovemade=true;
						}
						if(testBoard[2][2]==''){
							console.log("7");
							movereg=[2,2];
							sidemovemade=true;
						}
					}
					else if ((moves[0] + moves[1])%2!=0 && !centerfree && sidemove && !sidemovemade && (track>2 || player1total>2)){
							console.log("5");
							movereg=moves;
							sidemovemade=true;
					}
					
				});
				console.log("play1 tot:" + player1total);
				console.log("play2 tot:" + player2total);
				console.log("count tot:" + track);
			theMove[0] =  movereg[0]; theMove[1] =  movereg[1];
			console.log(theMove);
		}

		testBoard[theMove[0]][theMove[1]] = self;
		console.log("6");
		if (iter == 1) {
			saverightmove[0] = theMove[0];
			saverightmove[1] = theMove[1];
			
		}
		if(winfound) {
			return saverightmove;
		}
		if(track == 8) {
			console.log(" in hereewfhajkfhasjhfaljshfjkasdhlf");
			return saverightmove;
			// for(var i=0;i<3;i++){
			// for (var j=0;j<3;j++) {
			// 	testBoard[i][j] = $scope.game.board[i][j]; 
			// 	}
			// }
			// testBoard[saverightmove[0]][saverightmove[1]] = "O";
			// console.log(testBoard);
			
		}
		console.log(theMove);
		console.log("below this")
		console.log(saverightmove);
		console.log(testBoard);
		track++;
		return computerPlayer(testBoard);
		
		
	};

		placeMove = function(setmove) {
			setTimeout(function(){
				$scope.$apply(function() {
				$scope.game.board[setmove[0]][setmove[1]]=$scope.players[1].chip;
				game.counter++;
				if(!winfound && game.counter>4){
					console.log("winfound and game.counter 4");
					game.counter=9;
				}
					clearTime();
					startTime();
					afterMove();
					player2total += movereg[0]+movereg[1];
				});
			},1000);

	};

	
});


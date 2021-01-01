//Create variables here
var dog,happyDog,sadDog;
var database;
var foodS,foodStock;
var feed,addFood;
var fedTime,lastFed;
var foodObj;
var gameState,readGameState;
var bedroomImg, gardenImg, washroomImg;
var currentTime;

function preload()
{
sadDog = loadImage("images/Dog.png");
happyDog = loadImage("images/Happy.png");
bedroomImg = loadImage("images/Bed Room.png");
gardenImg = loadImage("images/Garden.png");
washroomImg = loadImage("images/Wash Room.png");
}

function setup() {
  database= firebase.database();

  createCanvas(800,600);
  
  foodObj = new Food();

  foodStock = database.ref('Food');
  foodStock.on("value",readStock);

  dog = createSprite(650,320,50,50);
  dog.addImage(sadDog);
  dog.scale = 0.2;

  feed = createButton("Feed the Dog");
  feed.position(820,85);
  feed.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(920,85);
  addFood.mousePressed(addFoods);

  readGameState = database.ref('GameState');
  readGameState.on("value",function(data){
    gameState = data.val();
  });
}


function draw() {  
  background(46, 139, 87);

  foodObj.display();

  feedTime = database.ref('FeedTime');
  feedTime.on("value",function(data){
    lastFed=data.val();
  });

  fill(255,255,254);
  textSize(20);
  if(lastFed>=12){
    text("LastFed : "+ lastFed%12 + "PM", 100,50);
  }else if(lastFed===0){
    text("Last Fed : 12 Am",100,50);
  }else{
    text("Last Fed : "+ lastFed + "AM",100,50);
  }

  if(gameState!="Hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  }else{
    feed.show();
    addFood.show();
    dog.addImage(sadDog);
  }

  currentTime=hour();
  if(currentTime===(lastFed+1)){
     update("Playing");
     foodObj.garden();
  }else if(currentTime===(lastFed+2)){
    update("Sleeping");
    foodObj.bedroom();
  }else if(currentTime>(lastFed+2) && currentTime<=(lastFed+4)){
    update("Bathing");
    foodObj.washroom();
  }else{
    update("Hungry");
    foodObj.display();
  }
  
  drawSprites();
}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}

function feedDog(){
  dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);

  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime: hour()
  })
}

function addFoods(){
  foodS++;
  database.ref('/').update({
    Food:foodS
  })
}

function update(state){
  database.ref('/').update({
  gameState:state
  });
}
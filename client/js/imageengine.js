

ImageEngine = function(id, type, img,options) {
  var self = {
      id:id,
      type:type,
      img:img,
      options:options,
      animInterval:5,
      animFrame:0,
      animTick:0
  }

  self.animationTick = function() {
    self.animTick++;
  }

  self.preloadImage = function() {
    let img = self.img;
    self.img = new Image();
    self.img.src = img;
  }

  self.drawSprite = function(x,y,id) {
    if(self.coords == undefined) return;
    let coords = self.coords[id];


    self._draw(self.img, coords.x, coords.y,
                         coords.w, coords.h,
                         x, y);
  }

  self.drawTile = function(tileX,tileY,x,y) {
    tileX *= TILE_WIDTH;
    tileY *= TILE_HEIGHT;

    self._draw(self.img, tileX, tileY,
                         TILE_WIDTH, TILE_HEIGHT,
                         x, y,
                         TILE_WIDTH, TILE_HEIGHT);
  }

  // Draw animation, will change animation based on animationTick
  self.drawAnimation = function(x,y,id) {
    if(self.coords == undefined) return;
    let animation = self.animation[id];
    if(self.animTick >= self.animInterval) {
    	self.animFrame ++;
      self.animTick = 0;
      if(self.animFrame >= animation.length) {
        self.animFrame = 0;
      }

    }
    self.drawSprite(x,y,animation[self.animFrame]);
  }

  // Draw an image if its a clean image,
  // if its a sprite it'll draw the default sprite
  self.drawImage = function(x,y,w,h) {
    if(self.type == "sprite") {
      self.drawSprite(x,y,"default");
      return;
    }
    if(w == undefined) w = self.img.width;
    if(h == undefined) h = self.img.height;
    self._draw(self.img, 0, 0, w, h, x, y);
  }

  // Just a replacement for ctx.drawImage
  self._draw = function(img,sx,sy,w,h,x,y) {

    // Calculate from tile coords to pixel coords within canvas
    var pixelX = (x - maps.topX) * (TILE_WIDTH * SCALE_MULTIPLIER);
    var pixelY = (y - maps.topY) * (TILE_HEIGHT * SCALE_MULTIPLIER);


    pixelX += TILE_WIDTH*SCALE_MULTIPLIER/2 - (w * SCALE_MULTIPLIER) / 2;
    pixelY -= TILE_HEIGHT*SCALE_MULTIPLIER/2;
    pixelY += TILE_HEIGHT*SCALE_MULTIPLIER - h*SCALE_MULTIPLIER
    ctx.save();
    ctx.drawImage(img,sx,sy,w,h,pixelX,pixelY,w*SCALE_MULTIPLIER,h*SCALE_MULTIPLIER);
    ctx.restore();
  }

  // Check if its a json file, if so load it
  if (self.img.split('.').pop() == "json") {
    var request = new XMLHttpRequest();
    request.open('GET', self.img, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        let data = JSON.parse(request.responseText);
        self.coords = data.coords;
        self.animation = data.animation;
        self.img = data.image;
        self.preloadImage();
      } else {
        console.log("Reached target, but some kinda error?");
      }
    };
    request.onerror = function() {
      console.log("Could not load coords?");
    };
    request.send();
  }
  else { self.preloadImage(); }

  return self;
}

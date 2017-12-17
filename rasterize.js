
function makeVertexAttribute(gl, shaderProgram, name, attributeArray, numComponents){
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, attributeArray, gl.STATIC_DRAW);
    var vertexPositionAttrib = gl.getAttribLocation(shaderProgram, name);
    gl.vertexAttribPointer(
        vertexPositionAttrib,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(vertexPositionAttrib);
}

function getPyramidModel(r, g, b){
    var pyramid = new Model();
    var point1 = new Triple(-0.1, 0, -0.1);
    var point2 = new Triple(0.1, 0, -0.1);
    var point3 = new Triple(-0.1, 0, 0.1);
    var point4 = new Triple(0.1, 0, 0.1);
    var point5 = new Triple(0, 0.1, 0); //top

    var color = new Triple(r, g, b);
    var normal1 = new Triple(0, -1, 0); //down
    var normal2 = new Triple(-1, 1, 0); //facing left
    var normal3 = new Triple(1, 1, 0); //facing right
    var normal4 = new Triple(0, 1, -1); //facing inward
    var normal5 = new Triple(0, 1, 1); //facing outward //could be automated...

    var vert1 = new Vertex(point1, color, normal1);
    var vert2 = new Vertex(point2, color, normal1);
    var vert3 = new Vertex(point3, color, normal1);
    var vert4 = new Vertex(point4, color, normal1);
    var tri1 = new Triangle(vert1, vert2, vert4);
    var tri2 = new Triangle(vert1, vert3, vert4);

    var v5 = new Vertex(point1, color, normal2);
    var v6 = new Vertex(point3, color, normal2);
    var v7 = new Vertex(point5, color, normal2);
    var tri3 = new Triangle(v5, v6, v7);

    var v8 = new Vertex(point4, color, normal3);
    var v9 = new Vertex(point2, color, normal3);
    var v10 = new Vertex(point5, color, normal3);
    var tri4 = new Triangle(v8, v9, v10);

    var v11 = new Vertex(point4, color, normal4);
    var v12 = new Vertex(point3, color, normal4);
    var v13 = new Vertex(point5, color, normal4);
    var tri5 = new Triangle(v11, v12, v13);
    
    var v14 = new Vertex(point1, color, normal5);
    var v15 = new Vertex(point2, color, normal5);
    var v16 = new Vertex(point5, color, normal5);
    var tri6 = new Triangle(v14, v15, v16);

    pyramid.addTriangle(tri1);
    pyramid.addTriangle(tri2);
    pyramid.addTriangle(tri3);
    pyramid.addTriangle(tri4);
    pyramid.addTriangle(tri6);
    pyramid.addTriangle(tri5);
    return pyramid;
}



function main(){
    var megaList = new MegaList();
    var vList1 = [  -10.0,-1,   -10.0, 1, 0.8, 0.6, 1, 1, 1, 0,
                     10.0,-1,   10.0, 1, 0.8, 0.6, 1, 1, 1, 0,
                     10.0, -1,   -10.0, 1, 0.8, 0.6, 1, 1, 1, 0,
                    -10.0, -1,   10.0, 1, 0.8, 0.6, 1, 1, 1, 0,];
    var iList1 = [0,1,2,0,3,1];
    var floor = new LooseModel(vList1, iList1, 4);
    megaList.addLoose(floor);
    
    {
        var vList = [  -10.0,-1,   2, 0.3, 1, 1, 1, 1, 1, 1,
                        10.0,3,   2, 1, 0.5, 1, 1, 1, 1, 1,
                        10.0, -1,   2, 0.3, 1, 1, 1, 1, 1, 1,
                        -10.0, 3,   2, 1, 0.5, 1, 1, 1, 1, 1,];
        var iList = [4,5,6,4,7,5];
        var sky = new LooseModel(vList, iList, 4);
        megaList.addLoose(sky);
    }

    var canvas = document.getElementById("myWebGLCanvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener("mousedown", getPosition, false);
    

    var drawableThings = [];
    var citiesArray = [];
    var batteriesArray = [];
    var enemiesArray = [];
    var antiArray = [];
    loadArrays(drawableThings, citiesArray, batteriesArray, enemiesArray, antiArray);


    function getPosition(event)
    {
      var x = event.x;
      var y = event.y;
    
      var canvas = document.getElementById("myWebGLCanvas");
    
      var left = canvas.style.left;
      var top = canvas.style.top;
      var offsetLeft = left.substr(0, left.length-3);
      var offsetTop = top.substr(0, top.length-3);
      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;
    
      //DO CHEAT SCALING
      var percx = x/canvas.width;
      var percy = y/canvas.height;
      
      percy*= 4/3;
      if(percy >= 1){
          percy = 1;
        }
        console.log("x:" + percx + " y:" + percy);
        
        var spawnx = 0;
        var spawny = 0;
        if(Math.random() < 0.33){
            spawnx = batteriesArray[0].x;
            spawny = batteriesArray[0].y;
        }
        else if(Math.random() < 0.50){
            spawnx = batteriesArray[1].x;
            spawny = batteriesArray[1].y;
        }else{
            spawnx = batteriesArray[2].x;
            spawny = batteriesArray[2].y;
        }
        var anti = makeUpAntiObject(spawnx, spawny, percx*4-2, (-2*percy)+1);
        drawableThings.push(anti);
        antiArray.push(anti);
        
    }

    gl = canvas.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    var vShaderCode = `
    attribute vec3 vertexPosition;
    attribute vec3 vertexColor;
    attribute vec3 vertexNormal;
    
    uniform vec3 lightVector;
    uniform vec3 eyeVector;
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 worldMatrix;

    uniform mat4 transforms;

    varying highp vec3 fragColor;
    varying highp vec3 fragNormal;

    void main(void) {
        fragColor = vertexColor;
        fragNormal = vertexNormal;
        vec4 position = transforms * projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
        position.x = -position.x;
        gl_Position = position;
        
    }
    `;
    var fShaderCode = `
    varying highp vec3 fragColor;
    varying highp vec3 fragNormal;

    void main(void) {
        gl_FragColor = vec4(fragColor, 1.0);
    }
    `;
    
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader,fShaderCode);
    gl.compileShader(fShader);
    
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader,vShaderCode);
    gl.compileShader(vShader);
    
    
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
        gl.deleteShader(fShader);
    } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
        gl.deleteShader(vShader);
    }
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, fShader);
    gl.attachShader(shaderProgram, vShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
    } 
    
    gl.useProgram(shaderProgram);
    
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-Math.random(),-0.5,0,0.5,-0.5,0,0.5,0.5,0,-0.5,0.5,0]),gl.STATIC_DRAW);
    
    triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    
    var vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition"); 
    gl.enableVertexAttribArray(vertexPositionAttrib);
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false, 10 * Float32Array.BYTES_PER_ELEMENT ,0);
    var vertexColorAttrib = gl.getAttribLocation(shaderProgram, "vertexColor"); 
    gl.enableVertexAttribArray(vertexColorAttrib);
    gl.vertexAttribPointer(vertexColorAttrib,3,gl.FLOAT,false, 10 * Float32Array.BYTES_PER_ELEMENT ,3* Float32Array.BYTES_PER_ELEMENT); 
    var vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "vertexNormal"); 
    gl.enableVertexAttribArray(vertexNormalAttrib);
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false, 10 * Float32Array.BYTES_PER_ELEMENT ,6* Float32Array.BYTES_PER_ELEMENT); 
    
    
    var eyeVecUniformLocation = gl.getUniformLocation(shaderProgram, 'eyeVector');
	var lightVecUniformLocation = gl.getUniformLocation(shaderProgram, 'lightVector');
    var projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
	var viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, 'viewMatrix');
    var worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram, 'worldMatrix');

    var transformsLocation = gl.getUniformLocation(shaderProgram, 'transforms');

    
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0); //

    var lightPosition = [-1, 3, -0.5];
    var eyePosition = [0, 0, -3];
    var lookAtPosition = [0, 0, 0];
    var lookUpVector = [0, 1, 0];
    var fovy = Math.PI / 4;
    var aspectRatio = 2;

    var worldMatrix = new Float32Array(16); //4x4
    var viewMatrix = new Float32Array(16);  //4x4
    var projMatrix = new Float32Array(16);  //4x4
    var lightVector= new Float32Array(lightPosition); //3 x 1
    var eyeVector = new Float32Array(eyePosition); //3 x 1

    mat4.identity(worldMatrix); //no changes for the world just yet\
    mat4.lookAt(viewMatrix, eyePosition, lookAtPosition, lookUpVector); //gl-matrix is helping us here
    mat4.perspective(projMatrix, fovy, aspectRatio, 0.1, 10.0);



    var then = 0;
    var rotation = 0;
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;
        //canvas.width  = window.innerWidth;
        //canvas.height = window.innerHeight;

        //generate enemy
        if(Math.random() < deltaTime){
            var enemy = makeUpEnemyObject(Math.random()*2-1, 1.2, Math.random()*2-1, -1);
            drawableThings.push(enemy);
            enemiesArray.push(enemy);
        }
        for(var i = enemiesArray.length-1; i >= 0; i--){
            var enemy = enemiesArray[i];
            enemy.x -= enemy.vx * deltaTime / 3;
            enemy.y -= enemy.vy * deltaTime /3;
            
            if(enemy.y < -1){
                enemiesArray.splice(i, 1);
                var index = drawableThings.indexOf(enemy);
                drawableThings.splice(index, 1);
            }
            
            drawableThings.forEach(function(anything) {
                if(!Object.is(enemy, anything) && enemiesArray.indexOf(anything) == -1){
                    var difx = enemy.x - anything.x;
                    var dify = enemy.y - anything.y;
                    var dist = Math.sqrt(difx*difx + dify*dify);
                    console.log(dist)
                    if(enemy.radius + anything.radius > dist){
                        enemiesArray.splice(i, 1); //remove from enemies array
                        var index = drawableThings.indexOf(enemy); //clean enemy
                        drawableThings.splice(index, 1);
                        
                        var index2 = drawableThings.indexOf(anything); //clean anything
                        drawableThings.splice(index2, 1);
                    }
                }
            });
                 

            mat4.identity(enemy.world);
            mat4.translate(enemy.world, enemy.world, vec3.fromValues(enemy.x, enemy.y, 0));
            mat4.rotate(enemy.world, enemy.world, enemy.angle, vec3.fromValues(0, 0, 1))
            mat4.scale(enemy.world, enemy.world, vec3.fromValues(0.2,0.6,0.2));
        }

        antiArray.forEach(function(anti) {
            anti.x -= anti.vx * deltaTime / 2;
            anti.y -= anti.vy * deltaTime /2;

            mat4.identity(anti.world);
            mat4.translate(anti.world, anti.world, vec3.fromValues(anti.x, anti.y, 0));
            mat4.rotate(anti.world, anti.world, anti.angle, vec3.fromValues(0, 0, 1))
            mat4.scale(anti.world, anti.world, vec3.fromValues(0.2,0.6,0.2));
        });
        // enemiesArray.forEach(function(enemy) {
            
        //     //mat4.fromTranslation(enemy.world, vec3.fromValues(enemy.x, enemy.y, 0));
        // });
        rotation += deltaTime;
        eyePosition = [Math.sin(now)*3,-0.1, Math.cos(now)*2]
        mat4.lookAt(viewMatrix, eyePosition, lookAtPosition, lookUpVector); //gl-matrix is helping us here

        if(window.innerWidth > 2*window.innerHeight){
            //height greater than it should be, apply horizontal black bars to top and bottom
            canvas.height = window.innerHeight;
            canvas.width = canvas.height*2.0; //obviously
            canvas.style.left = (window.innerWidth - canvas.width)/2.0+ "px";
            canvas.style.top = "0px";
        }else{
            //width greater than or equal to what it should be, apply vertical black bars, to left and right
            canvas.width = window.innerWidth;
            canvas.height = canvas.width/2.0; //obviously
            canvas.style.top = (window.innerHeight - canvas.height)/2.0 + "px";
            canvas.style.left = "0px";
        }
        
        // lookAtPosition = [0+ Math.random()*0.06-0.03, 0+ Math.random()*0.06-0.03, 0.0+ Math.random()*0.06-0.03];
        // eyePosition = [0+ Math.random()*0.06-0.03, 0+ Math.random()*0.06-0.03, -1.0 + Math.random()*0.06-0.03];
        // lookUpVector = [0+ Math.random()*0.06-0.03, 1.0+ Math.random()*0.06-0.03, Math.random()*0.06-0.03];
        // mat4.lookAt(viewMatrix, eyePosition, lookAtPosition, lookUpVector); //gl-matrix is helping us here

        //resize(gl.canvas);
        gl.bufferData(gl.ARRAY_BUFFER,megaList.getV(),gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,megaList.getI(),gl.STATIC_DRAW);
    
        
        gl.uniform3fv(eyeVecUniformLocation, eyeVector);
        gl.uniform3fv(lightVecUniformLocation, lightVector);
        gl.uniformMatrix4fv(projectionMatrixUniformLocation, gl.FALSE, projMatrix);  
	    gl.uniformMatrix4fv(viewMatrixUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation, gl.FALSE, worldMatrix);
        
        gl.uniformMatrix4fv(transformsLocation, gl.FALSE, worldMatrix);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES,megaList.getI().length,gl.UNSIGNED_SHORT,0);

        drawableThings.forEach(function(battery) {
            var mList = battery.megaList;
            var world = battery.world;
            gl.bufferData(gl.ARRAY_BUFFER,mList.getV(),gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mList.getI(),gl.STATIC_DRAW);
            gl.uniformMatrix4fv(worldMatrixUniformLocation, gl.FALSE, world);            
            gl.drawElements(gl.TRIANGLES,mList.getI().length,gl.UNSIGNED_SHORT,0);
        });
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function loadArrays(drawableThings, citiesArray, batteriesArray, enemiesArray, antiArray){
    
    {
        var battery = makeUpBattery(1, -1);
        drawableThings.push(battery);
        batteriesArray.push(battery)
    }
    {
        var battery = makeUpBattery(0, -1);
        drawableThings.push(battery);
        batteriesArray.push(battery)
    }
    {
        var battery = makeUpBattery(-1, -1);
        drawableThings.push(battery);
        batteriesArray.push(battery)
    }
    // @@@@@@@@@@@@@@@@@@@@@@@ CITIES
    {
        city = makeUpCityObject(-0.25, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
    {
        city = makeUpCityObject(-0.5, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
    {
        city = makeUpCityObject(-0.75, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
    {
        city = makeUpCityObject(0.25, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
    {
        city = makeUpCityObject(0.5, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
    {
        city = makeUpCityObject(0.75, -1);
        drawableThings.push(city);
        citiesArray.push(city)
    }
}

function makeUpBattery(x, y){
    var pyramid = getPyramidModel(0.5,0.2,0.1);
    
    var batteriesMegaList = new MegaList();
    batteriesMegaList.addModel(pyramid);

    {
        var battery = new Object();
        battery.x = x;
        battery.y = y;
        battery.radius = 0.1;
        battery.megaList = batteriesMegaList;
        battery.world = new Float32Array(16);
        mat4.fromTranslation(battery.world, vec3.fromValues(x, y,0));
        return battery;
    }
}

function makeUpCityObject(x, y){
    var pyramid2 = getPyramidModel(0.1,0.2,0.5);    
    var citiesMegaList = new MegaList();
    citiesMegaList.addModel(pyramid2);

    var city = new Object();
    city.x = x;
    city.y = y;
    city.isDestroyed = false;
    city.radius = 0.075;
    city.megaList = citiesMegaList;
    city.world = new Float32Array(16);
    mat4.fromTranslation(city.world, vec3.fromValues(x,y,0));
    mat4.scale(city.world, city.world, vec3.fromValues(0.5,0.5,0.5));
    return city;
}

function makeUpEnemyObject(x, y , targx, targy){
    var enemyPyramid = getPyramidModel(0.8,0.1,0.2);    
    var enemiesMegaList = new MegaList();
    enemiesMegaList.addModel(enemyPyramid);
    var enemy = new Object();
    enemy.x = x;
    enemy.y = y;
    enemy.targx = targx;
    enemy.targy = targy;
    enemy.vx = (x-targx)/Math.sqrt((x-targx)*(x-targx) + (y-targy)* (y-targy));
    enemy.vy = (y-targy)/Math.sqrt((x-targx)*(x-targx) + (y-targy)* (y-targy));
    enemy.radius = 0.075;
    enemy.angle = Math.atan2(y-targy, x-targx) + Math.PI/2;
    enemy.velocity = 1;
    enemy.megaList = enemiesMegaList;
    enemy.world = new Float32Array(16);
    mat4.fromTranslation(enemy.world, vec3.fromValues(x, y, 0));
    mat4.scale(enemy.world, enemy.world, vec3.fromValues(0.2,0.6,0.2));
    mat4.rotate(enemy.world, enemy.world, enemy.angle, vec3.fromValues(0, 0, 1))
    return enemy;
}

function makeUpAntiObject(x, y, targx, targy){
    
    var antiPyramid = getPyramidModel(0.1, 0.6, 0.3);    
    var antisMegaList = new MegaList();
    antisMegaList.addModel(antiPyramid);
    
    var anti = new Object();
    anti.x = x;
    anti.y = y;
    anti.radius = 0.06;
    anti.vx = (x-targx)/Math.sqrt((x-targx)*(x-targx) + (y-targy)* (y-targy));
    anti.vy = (y-targy)/Math.sqrt((x-targx)*(x-targx) + (y-targy)* (y-targy));
    anti.angle = Math.atan2(y-targy, x-targx) + Math.PI/2;
    anti.megaList = antisMegaList;
    anti.world = new Float32Array(16);
    mat4.fromTranslation(anti.world, vec3.fromValues(x,y,0));
    mat4.scale(anti.world, anti.world, vec3.fromValues(0.2,0.6,0.2));
    mat4.rotate(anti.world, anti.world, anti.angle, vec3.fromValues(0, 0, 1))
    return anti;
}

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var Tx = 1.0;
var Ty = 1.0; 
var Tz = 0.5;

var axis = 0;

var modelViewMatrix;
var viewMatrix;
var projectionMatrix;

var fov = 60;
var aspectratio = 1.33;

var eye = vec3(0, -30, 0);
var at = vec3(0, 0, 0);
var up = vec3(0, 0, 1);

var rotateCube=0.0;

var xmove = 0;
var ymove = 0;
var zmove = 0;
var xangle = 0;
var yangle = 0;

var crosshair = false;

var vertices = [
    vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ),
    vec3(  0.5,  0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 )

];

var white = vec4( 1.0, 1.0, 1.0, 1.0 );

var crossPoints = [vec3(0, .4, -2), vec3(0, -.4, -2),
                   vec3(-.3, 0, -2), vec3(.3, 0, -2)];

var fColor;
var color1 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color2 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color4 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color5 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color6 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color7 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var color8 = vec4(Math.random(), Math.random(), Math.random(), 1.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


//add the points for the cross hairs
points.push(crossPoints[0]);
points.push(crossPoints[1]);
points.push(crossPoints[2]);
points.push(crossPoints[3]);

    colorCube();
    colorLines();

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //buffer for cosshairs
    var crBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, crBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(crossPoints), gl.STATIC_DRAW );


    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    viewMatrix = lookAt(eye, at, up);

    fColor = gl.getUniformLocation(program, "fColor");


    //keydown functions
    window.onkeydown = function(e){
        var key = e.keyCode ? e.keyCode : e.which;
        var shiftPressed = (window.Event) ? e.modifiers & Event.SHIFT_MASK : e.shiftKey;
        if(key == 67)
        {
            changeColor();
        }
        else if (e.keyCode == 78 )
        {
            fov--;
        }
        else if (e.keyCode == 87 )
        {
            fov++;
        }
        else if (e.keyCode == 37) //Left 
        {
            yangle--;
        }
        else if (e.keyCode == 38) //Up 
        {
            xangle--;
        }
        else if (e.keyCode == 39) //Right 
        {
            yangle++;
        }
        else if (e.keyCode == 40 ) //Down 
        {
            xangle++;
        }
        else if (e.keyCode == 74) //J (Left)
        {
            xmove += 0.25*Math.cos(radians(yangle));
            ymove -= 0.25*Math.sin(radians(yangle));
        }
        else if (e.keyCode == 73) // I (Forward)
        {
            xmove -= 0.25*Math.sin(radians(yangle));
            ymove -= 0.25*Math.cos(radians(yangle));
        }
        else if (e.keyCode == 76) // L (Right)
        {
            xmove -= 0.25*Math.cos(radians(yangle));
            ymove += 0.25*Math.sin(radians(yangle));
        }
        else if (e.keyCode == 77) // M (Backward)
        {
            xmove += 0.25*Math.sin(radians(yangle));
            ymove += 0.25*Math.cos(radians(yangle));
        }
        else if (e.keyCode == 82)
        {
            viewMatrix = lookAt(eye, at, up);
            yangle = 0;
            xangle = 0;
            fov=60;
            aspectratio=1.33;
            projectionMatrix = perspective(fov, aspectratio, -1, 1);
        }
        else if((e.keyCode==187 && e.shiftKey) || (e.keyCode==61 && e.shiftKey))
        {
            crosshair=!crosshair;
        }
    }

    render();


}
function render()
{

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix = perspective(fov, aspectratio, -1, 1);
    projectionMatrix = mult(projectionMatrix, rotate(yangle, [0,1,0]));
    projectionMatrix = mult(projectionMatrix, rotate(xangle, [1,0,0]));
    viewMatrix = mult(viewMatrix, translate(xmove,ymove,zmove));

    var cube1 = mat4();
    cube1 = mult(cube1, projectionMatrix);
    cube1 = mult(cube1, viewMatrix);
    cube1 = mult(cube1, translate(10, 10, 10)); // Translate cube
    cube1 = mult(cube1, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color1));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube1));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays( gl.LINES, 40, NumVertices);
    
    var cube2 = mat4();
    cube2 = mult(cube2, projectionMatrix);
    cube2 = mult(cube2, viewMatrix);
    cube2 = mult(cube2, translate(-10, 10, 10)); // Translate cube
    cube2 = mult(cube2, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color2));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube2));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube3 = mat4();
    cube3 = mult(cube3, projectionMatrix);
    cube3 = mult(cube3, viewMatrix);
    cube3 = mult(cube3, translate(10, -10, 10)); // Translate cube
    cube3 = mult(cube3, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color3));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube3));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube4 = mat4();
    cube4 = mult(cube4, projectionMatrix);
    cube4 = mult(cube4, viewMatrix);
    cube4 = mult(cube4, translate(-10, -10, 10)); // Translate cube
    cube4 = mult(cube4, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color4));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube4));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube5 = mat4();
    cube5 = mult(cube5, projectionMatrix);
    cube5 = mult(cube5, viewMatrix);
    cube5 = mult(cube5, translate(10, 10, -10)); // Translate cube
    cube5 = mult(cube5, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color5));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube5));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube6 = mat4();
    cube6 = mult(cube6, projectionMatrix);
    cube6 = mult(cube6, viewMatrix);
    cube6 = mult(cube6, translate(-10, 10, -10)); // Translate cube
    cube6 = mult(cube6, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color6));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube6));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube7 = mat4();
    cube7 = mult(cube7, projectionMatrix);
    cube7 = mult(cube7, viewMatrix);
    cube7 = mult(cube7, translate(10, -10, -10)); // Translate cube
    cube7 = mult(cube7, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color7));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube7));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));//draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    var cube8 = mat4();
    cube8 = mult(cube8, projectionMatrix);
    cube8 = mult(cube8, viewMatrix);
    cube8 = mult(cube8, translate(-10, -10, -10)); // Translate cube
    cube8 = mult(cube8, rotate(rotateCube+=0.2, [0,0,1])); // Rotate cube
    gl.uniform4fv(fColor, flatten(color8));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(cube8));
    gl.drawArrays( gl.TRIANGLES, 4, NumVertices );
    gl.uniform4fv(fColor, flatten(white));  //draw the outlines
    gl.drawArrays(gl.LINES, 40, NumVertices);

    if(crosshair)
        keyPlus();

    resetVariables();
    requestAnimFrame( render );
}

//sets the colors and order to draw
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{   
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vec4( 1.0, 1.0, 1.0, 1.0 ));
    }
}

//sets the lines to draw
function colorLines()
{
    line( 1, 0, 3, 2 );
    line( 2, 3, 7, 6 );
    line( 3, 0, 4, 7 );
    line( 6, 5, 1, 2 );
    line( 4, 5, 6, 7 );
    line( 5, 4, 0, 1 );

}
function line(a,b,c,d)
{
    var indices = [ a, b, b, c, c, d, d, a];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vec4( 1.0, 1.0, 1.0, 1.0 ));
    }
}


function resetVariables()
{
    xmove = 0;
    ymove = 0;
    zmove = 0;
}

function changeColor()
{
    color1 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color2 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color4 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color5 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color6 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color7 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
    color8 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
}
function keyPlus()
{
    var transformMatrix = mat4();
    transformMatrix = mult (transformMatrix, ortho(-4, 4, -4, 4, -4, 4));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformMatrix));
    gl.uniform4fv(fColor, flatten(white));
    gl.drawArrays( gl.LINES, 0, 4 );
}

const matterContainer = document.querySelector("#matter-container");
const THICCNESS = 60;

const images = ['Happy.png', 'Kiss.png', 'Smile.png', 'Unhappy.png', 'Fear.png', 'Sadness.png', 'Excitement.png', 'Happiness.png', 'Anger.png', 'Anxiety.png'];


// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
  element: matterContainer,
  engine: engine,
  options: {
    width: matterContainer.clientWidth,
    height: matterContainer.clientHeight,
    background: "transparent",
    wireframes: false,
    showAngleIndicator: false
  }
});

// create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(450, 50, 80, 80);

// for (let i = 0; i < 200; i++) {
//   let circle = Bodies.circle(i, 10, 40, {
//     friction: 0.3,
//     frictionAir: 0.00001,
//     restitution: 0.8
//   });
//   Composite.add(engine.world, circle);
// }

for (let i = 0; i < 150; i++) {
    let randomImage = images[Math.floor(Math.random() * images.length)];
    let circle = Bodies.circle(i, 10, 80, {
      friction: 0.3,
      frictionAir: 0.00001,
      restitution: 0.8,
      render: {
        sprite: {
          texture: 'img/' + randomImage,
          xScale: 0.3,
          yScale: 0.3
        }
      }
    });
    Composite.add(engine.world, circle);
  }

var ground = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + THICCNESS / 2,
  27184,
  THICCNESS,
  { isStatic: true }
);

let leftWall = Bodies.rectangle(
  0 - THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  {
    isStatic: true
  }
);

let rightWall = Bodies.rectangle(
  matterContainer.clientWidth + THICCNESS / 2,
  matterContainer.clientHeight / 2,
  THICCNESS,
  matterContainer.clientHeight * 5,
  { isStatic: true }
);

// add all of the bodies to the world
Composite.add(engine.world, [ground, leftWall, rightWall]);

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint);

// allow scroll through the canvas
mouseConstraint.mouse.element.removeEventListener(
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function handleResize(matterContainer) {
  // set canvas size to new values
  render.canvas.width = matterContainer.clientWidth;
  render.canvas.height = matterContainer.clientHeight;

  // reposition ground
  Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + THICCNESS / 2
    )
  );

  // reposition right wall
  Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + THICCNESS / 2,
      matterContainer.clientHeight / 2
    )
  );
}

let invisibleBall = Bodies.circle(0, 0, 300, { isStatic: true, render: { visible: false } });
Composite.add(engine.world, invisibleBall);

document.addEventListener('mousemove', function(event) {
    let mousePosition = { x: event.clientX, y: event.clientY };
    Matter.Body.setPosition(invisibleBall, mousePosition);
});

window.addEventListener("resize", () => handleResize(matterContainer));
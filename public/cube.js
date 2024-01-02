let scene, camera, renderer, cube;
let isDragging = false;
let envTexture; // 全局环境贴图变量
let controls; // 全局变量
let pointLight; // Declare pointLight globally

let fontSize1 = 150;
let color1 = 'black';
let fontSize2 = 72;
let color2 ='black';

let isRotating = true;
document.getElementById('rotate-button').addEventListener('click', function() {
    isRotating = !isRotating;
});


//文本纹理添加
let cubeSize = 20; // 圆角立方体的尺寸
let halfSize = cubeSize / 2;
let facePositions = [
    new THREE.Vector3(halfSize, 0, 0),   // 右面
    new THREE.Vector3(-halfSize, 0, 0),  // 左面
    new THREE.Vector3(0, halfSize, 0),   // 上面
    new THREE.Vector3(0, -halfSize, 0),  // 下面
    new THREE.Vector3(0, 0, halfSize),   // 前面
    new THREE.Vector3(0, 0, -halfSize)   // 后面
];
let faceRotations = [
    new THREE.Euler(0, Math.PI / 2, 0),
    new THREE.Euler(0, -Math.PI / 2, 0),
    new THREE.Euler(-Math.PI / 2, 0, 0),
    new THREE.Euler(Math.PI / 2, 0, 0),
    new THREE.Euler(Math.PI, Math.PI, Math.PI),
    new THREE.Euler(Math.PI, 0, Math.PI)
];



function createRoundedBoxGeo(width, height, depth, radius0, smoothness) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    let faceRadius = 0.25;

    shape.absarc(eps, eps, faceRadius, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, faceRadius, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, faceRadius, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, faceRadius, 0, -Math.PI / 2, true);

    let geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth - radius0,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });

    geometry.center();
    return geometry;

}


function loadEnvironmentTexture() {
    const hdrTextureLoader = new THREE.TextureLoader();
    hdrTextureLoader.load('img/HDR.jpg', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        envTexture = texture; // 将加载的贴图存储在全局变量中
        init(); // 贴图加载完成后调用 init
    });
}


function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}


function addTextToRoundedCubeFace(cube, position, rotation, text1, text2, fontSize1, color1, fontSize2, color2) {
    const texture = createTextTexture(text1, text2, 1024, 1024, fontSize1, color1, fontSize2, color2);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

    const size = 20;
    const plane = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(plane, material);

    // 检查并移除现有的纹理（如果有的话）
    if (cube.userData.textMeshes && cube.userData.textMeshes[position.toString()]) {
        cube.remove(cube.userData.textMeshes[position.toString()]);
    }

    mesh.position.copy(position);
    mesh.rotation.copy(rotation);

    if (!cube.userData.textMeshes) {
        cube.userData.textMeshes = [];
    }

    cube.userData.textMeshes.push(mesh);

    cube.add(mesh);
}


function onWindowResize() {
    // 更新相机的纵横比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 更新渲染器的尺寸
    renderer.setSize(window.innerWidth , window.innerHeight);
}


function updateCubeFaces(texts) {
    // 清除所有面上的文本
    if (cube.userData.textMeshes) {
        cube.userData.textMeshes.forEach(mesh => {
            cube.remove(mesh);
        });
        cube.userData.textMeshes = [];
    }
    const textsInit = ["🥳", "😄", "😔", "🤬", "😨", "😱"];
    textsInit.forEach((text, index) => {
        // 假设第二个文本为空
        addTextToRoundedCubeFace(cube, facePositions[index], faceRotations[index], text, "", fontSize1, color1, fontSize2, color2);
    });

    // 然后添加新文本
    texts.forEach((text, index) => {
        addTextToRoundedCubeFace(cube, facePositions[index], faceRotations[index], "", text, fontSize1, color1, fontSize2, color2);
    });
}



function createTextTexture(text1, text2, width = 1024, height = 1024, fontSize1, color1, fontSize2, color2s) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // 设置第一个文本的样式
    ctx.fillStyle = color1;
    ctx.font = `${fontSize1}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 绘制第一个文本
    const textBoxWidth1 = width * 0.8;
    const lines1 = wrapText(ctx, text1, textBoxWidth1);
    const startY1 = 200; // 假设第一个文本框位于上半部分
    lines1.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY1 + index * fontSize1);
    });

    // 设置第二个文本的样式
    ctx.fillStyle = color2;
    ctx.font = `${fontSize2}px Harlow Solid Italic`;

    // ctx.textBaseline = 'top'; // 改为顶部对齐

    // 绘制第二个文本
    const textBoxWidth2 = width * 0.8;
    const lines2 = wrapText(ctx, text2, textBoxWidth2);
    const startY2 = 350; // 假设第二个文本框位于下半部分
    lines2.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY2 + index * fontSize2);
    });
    

    // 创建并返回纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    return texture;
}


function wrapText(context, text, maxWidth) {
    const words = text.split(' '); // 分割单词
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine); // 添加最后一行
    return lines;
}

function init() {
    // 创建场景
    scene = new THREE.Scene(); 


    // 创建相机
    camera = new THREE.PerspectiveCamera(18, window.innerWidth / window.innerHeight, 0.1, 1000); 


    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('cube-container').appendChild(renderer.domElement);


    // 创建 OrbitControls 实例
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; // 禁用右键平移功能
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.25; // 阻尼系数
    controls.enableZoom = false; // 允许缩放

    camera.position.z = 100; // 设置相机位置
 

    // 加载球形环境贴图
    if (envTexture) {
        scene.environment = envTexture; // 使用已加载的环境贴图
    }

    // 创建金属材质
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,     // 基础颜色
        envMap: scene.environment,   // 环境贴图
        metalness: 0.9,      // 金属度
        roughness: 0.1      // 粗糙度
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 增加强度到1.5
    scene.add(ambientLight);   


    // 创建圆角立方体
    const geometry = createRoundedBoxGeo(19.3, 19.4, 17.9, 2, 30);
    cube = new THREE.Mesh(geometry, metalMaterial);
    scene.add(cube);

    // const textsInit = ["🥳", "😄", "😔", "🤬", "😨", "😱"];
    // textsInit.forEach((text, index) => {
    //     // 假设第二个文本为空
    //     addTextToRoundedCubeFace(cube, facePositions[index], faceRotations[index], text, "", fontSize1, color1, fontSize2, color2);
    // });
    

    // 调整窗口大小时的响应
    window.addEventListener('resize', onWindowResize, false);


    animate();
}


function animate() {
    requestAnimationFrame(animate);

    if (isRotating) {
        cube.rotation.y += 0.0015;
    }

    // 更新控制器
    controls.update(); // 只有在需要阻尼或自动旋转时才需要

    // 渲染场景和相机
    renderer.render(scene, camera);
}


loadEnvironmentTexture(); // 首先加载环境贴图
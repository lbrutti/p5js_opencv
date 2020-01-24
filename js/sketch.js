const AREA_THRESHOLD = 1800;
function setup() {
    //4160 × 3120
    width = 640;
    height = 480;
    canvas = createCanvas(width, height);
    canvas.id('creata');
    // capture = createCapture({
    //     video: {
    //         mandatory: {
    //             minWidth: width,
    //             minHeight: height
    //         },
    //         optional: [{ maxFrameRate: 25 }]
    //     },
    //     audio: false
    // });
    // capture.size(width, height);
    // capture.hide();
    // pg = createGraphics(width, height);
    background(0);
    // paper.setup(document.getElementById('creata'));
    shapes = [];
    line;
    button = createButton('snap');
    button.position(19, 19);
    button.mousePressed(snap);

    eraseButton = createButton('eraseBtn');
    eraseButton.position(60, 19);
    eraseButton.mousePressed(erasePressed);

    printButton = createButton('printContours');
    printButton.position(120, 19);
    printButton.mousePressed(printContours);
    reversed = false;

    video = document.querySelector("#videoElement");

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }

    // snap();
}

function erasePressed() {
    src.delete();
    original.delete();
    contours.delete();
}

function printContours() {
    for (let i = 0; i < contours.size(); ++i) {
        const ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        if (area > AREA_THRESHOLD) {

            console.dir(ci);
        }
    }
}

// function draw(){
//     snap();
// }
function snap() {
    background(0);

    // pg.image(capture, 0, 0, width, height);
    // if (!reversed) {

    //     translate(width, 0); // move to far corner
    //     scale(-1.0, 1.0);    // flip x-axis backwards
    //     reversed = true;
    // }

    let cap = new cv.VideoCapture(video);

    // take first frame of the video
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);

    src = frame; //cv.imread('ritaglio');
    //let src = cv.imread(pg.canvas); //decommentare per ripristinare capture da video
    original = frame; //cv.imread('ritaglio');
    //let original = cv.imread(pg.canvas); //decommentare per ripristinare capture da video
    cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);

    cv.threshold(original, original, 56, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    // draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        let M = cv.moments(ci, false);
        let cx = M.m10 / M.m00
        let cy = M.m01 / M.m00
        if (area > AREA_THRESHOLD) {
            let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                Math.round(Math.random() * 255));
            // color = original.col(cx).row(cy).data;
            cv.drawContours(dst, contours, i, color, -1, cv.LINE_8, hierarchy, 100);
        }
    }
    cv.imshow('creata', dst);
    hierarchy.delete();

}

function showIntersections(path1, path2) {
    var intersections = path1.getIntersections(path2);
    // for (var i = 0; i < intersections.length; i++) {
    //     new paper.Path.Circle({
    //         center: intersections[i].point,
    //         radius: 5,
    //         fillColor: '#009dec'
    //     }).removeOnMove();
    // }
    return intersections;
}
const AREA_THRESHOLD = { min: 1800, max: Infinity };
function setup() {
    //4160 × 3120
    width = 640;
    height = 480;
    AREA_THRESHOLD.max = width * height;
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

    testButton = createButton('loadFromImage');
    testButton.position(200, 19);
    testButton.mousePressed(loadFromImage);

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

function getCoordsFromContour(ci) {
    let res = [];
    for (let j = 0; j < ci.data32S.length; j += 2) {
        let p = {};
        p.x = ci.data32S[j];
        p.y = ci.data32S[j + 1];
        res.push(p);
    }
    return res;
}

function loadFromImage() {
    findContours(cv.imread('ritaglio'));
}
function findContours(img) {

    background(0);
    contoursArray = [];

    src = img;
    original = img;

    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
    dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();

    // You can try more different parameters
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let j = 0;
    for (let i = 0; i < contours.size(); ++i) {
        let ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        if (area < AREA_THRESHOLD.max && area > AREA_THRESHOLD.min) {
            let tmp = new cv.Mat();
            // You can try more different parameters
            cv.approxPolyDP(ci, tmp, 10, true);
            poly.push_back(tmp);
            // contoursArray.push(ci);
            let M = cv.moments(ci, false);
            let cx = M.m10 / M.m00
            let cy = M.m01 / M.m00
            tmp.delete();
            let color = original.col(cx).row(cy).data;
            try{

                cv.drawContours(dst, poly, j++, color, 1, cv.LINE_8, hierarchy, 0);
            }
            catch(e){
                color = new cv.Scalae(127,55,0);
                cv.drawContours(dst, poly, j++, color, 1, cv.LINE_8, hierarchy, 0);
            }
        }
    }
    cv.imshow('creata', dst);
    hierarchy.delete();

}

function snap() {

    let cap = new cv.VideoCapture(video);

    // take first frame of the video
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    findContours(frame);
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
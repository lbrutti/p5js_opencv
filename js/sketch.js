const AREA_THRESHOLD = { min: 200, max: 700 };
function setup() {
    background(0);
    //4160 × 3120
    intersectionPoints = [];
    width = 640;
    height = 480;
    AREA_THRESHOLD.max = 207200;// width * height;
    canvas = createCanvas(width, height);
    canvas.id('creata');
    poly = undefined;

    shapes = [];

    reversed = false;
    createButtons();
    setUpVideo()
        .then(() => {
            initPaper();
        })
        .catch(e => console.error(e));
}

function createButtons() {

    button = createButton('useWebcam');
    button.position(19, 19);
    button.mousePressed(useWebcam);

    testButton = createButton('loadFromImage');
    testButton.position(200, 19);
    testButton.mousePressed(loadFromImage);

    eraseButton = createButton('eraseBtn');
    eraseButton.position(60, 19);
    eraseButton.mousePressed(erasePressed);

    printButton = createButton('printContours');
    printButton.position(120, 19);
    printButton.mousePressed(printContours);
}
function initPaper() {
    paper.setup(document.getElementById('creata'));
    lineStart = new paper.Point(0, 0);
    lineEnd = new paper.Point(0, height);

    pLine = new paper.Path.Line(lineStart, lineEnd);

    pLine.strokeColor = 'black';
}
function setUpVideo() {
    return new Promise((resolve, reject) => {
        video = document.querySelector("#videoElement");

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream;
                    resolve();
                })
                .catch(function (err0r) {
                    reject(err0r);
                    console.log("Something went wrong!");
                });
        }
    });
}
function erasePressed() {
    src.delete();
    original.delete();
    contours.delete();
    poly.delete();
}

function scanPaths() {

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
        p.color = ci.color;
        res.push(p);
    }
    return res;
}

function loadFromImage() {
    poly = new cv.MatVector();
    let coords = {};
    findContours(cv.imread('ritaglio'), cv.imread('ritaglio'))
        .map((c, i) => {
            coords[i] = getCoordsFromContour(c);
        });
    resetShapes();
    drawPaths(coords);
    paper.view.draw();
}

function resetShapes() {
    shapes.map(path => {
        path.remove();
        path.osc && (path.osc.mute=true);
        path.osc = null;
    });
    shapes = [];
}


function drawPaths(coords) {
    Object.values(coords).forEach(ps => {
        let path = new paper.Path();
        ps.slice(1).forEach(({ x, y }) => {
            path.add(new paper.Point(x, y));
        });
        path.closed = true;
        path.strokeColor = new paper.Color(ps[0].color[0] / 255, ps[0].color[1] / 255, ps[0].color[2] / 255);
        path.osc = new Tone.Oscillator(0, 'sine');
        shapes.push(path);
    });
}
function findContours(src, original) {

    background(0);
    contoursArray = [];

    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    // You can try more different parameters
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let j = 0;
    for (let i = 0; i < contours.size(); ++i) {
        let ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        if (area < AREA_THRESHOLD.max && area > AREA_THRESHOLD.min) {
            // You can try more different parameters
            cv.approxPolyDP(ci, ci, 2, true);
            poly.push_back(ci);
            let M = cv.moments(ci, false);
            let cx = M.m10 / M.m00
            let cy = M.m01 / M.m00
            let color = original.col(cx).row(cy).data;
            try {
                cv.drawContours(dst, poly, j, color, -1, cv.LINE_8, hierarchy, 0);
            }
            catch (e) {
                color = new cv.Scalar(127, 55, 0);
                cv.drawContours(dst, poly, j, color, 1, cv.LINE_8, hierarchy, 0);
            } finally {
                j++;
            }
            ci.color = color;
            contoursArray.push(ci);
        }
    }
    // cv.imshow('creata', dst);
    hierarchy.delete();
    return contoursArray;
}

function useWebcam() {
    poly = new cv.MatVector();
    let coords = {};
    let cap = new cv.VideoCapture(video);
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    findContours(frame, frame)
        .map((c, i) => {
            coords[i] = getCoordsFromContour(c);
            coords[i].color = c.color;
        });
    resetShapes();
    drawPaths(coords);
    paper.view.draw();
}

function resetIntersections() {
    intersectionPoints.map(intersection => {

        intersection.map(p => p.remove());
        intersection = [];
    });
}
function drawIntersections(intersections, idx) {

    intersectionPoints[idx] && intersectionPoints[idx].map(p => p.remove());
    intersectionPoints[idx] = [];
    if (intersections.length == 2) {
        let line = drawLineGen(intersections[0].point, intersections[1].point, idx % 2 ? 'red' : 'green');
        line.strokeWidth = 10;
        intersectionPoints[idx].push(line);
        shapes[idx].osc.frequency.value = Math.sqrt(Math.pow(intersections[0].point.y - intersections[1].point.y, 2));
    } else {
        shapes[idx].osc.frequency.value = 0;

    }
    //  else {

    //     for (let i = 0; i < intersections.length; i++) {
    //         intersectionPoints[idx] = intersectionPoints[idx] ? intersectionPoints[idx] : [];
    //         intersectionPoints[idx].push(new paper.Path.Circle({
    //             center: intersections[i].point,
    //             radius: 5,
    //             fillColor: '#009dec'
    //         }));
    //     }
    // }
}
function getIntersections(path1, path2) {
    let intersections = path1.getIntersections(path2);
    return intersections;
}

function draw() {
    if (keyIsDown(LEFT_ARROW)) {
        if (lineStart.x > 0) {
            pLine.remove();
            lineStart.x -= 1;
            lineEnd.x -= 1;
            drawLine(lineStart, lineEnd);
        } else {
            lineStart.x = 0;
            lineEnd.x = 0;
        }
    }

    if (keyIsDown(RIGHT_ARROW)) {
        if (lineEnd.x < width) {
            pLine.remove();
            lineStart.x += 1;
            lineEnd.x += 1;
            drawLine(lineStart, lineEnd);
        }
    }
    intArray = [];
    shapes.map(s => {
        intArray.push(getIntersections(s, pLine));
        s.osc.toDestination().start();
    });
    intArray.map((i, idx) => { drawIntersections(i, idx) });
}

function drawLine(start, end, color) {
    pLine = drawLineGen(start, end, color);
}

function drawLineGen(start, end, color) {

    let line = new paper.Path.Line(start, end);
    line.strokeColor = color || 'black';
    return line;
}
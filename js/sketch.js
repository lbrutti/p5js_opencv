const AREA_THRESHOLD = 500;
function setup() {
    width = 1280;
    height = 720
    canvas = createCanvas(width, height);
    canvas.id('creata');
    capture = createCapture({
        video: {
            mandatory: {
                minWidth: width,
                minHeight: height
            },
            optional: [{ maxFrameRate: 25 }]
        },
        audio: false
    });
    capture.size(width, height);
    capture.hide();
    pg = createGraphics(width, height);
    background(0);

}

function draw() {
    background(0);
    pg.image(capture, 0, 0, width, height);
    let src = cv.imread(pg.canvas);

    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(
        src,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_NONE
    );
    // draw contours with random Scalar
const points = {};
    for (let i = 0; i < contours.size(); ++i) {
        const ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        if (area > AREA_THRESHOLD) {

            let dist = cv.pointPolygonTest(ci, new cv.Point(mouseX, mouseY), true);
            if (dist > 0) { console.log(dist); }
            points[i] = [];
            for (let j = 0; j < ci.data32S.length; j += 2) {
                let p = {};
                p.x = ci.data32S[j];
                p.y = ci.data32S[j + 1];
                points[i].push(p);
            }

        }

    }

    stroke(255, 204, 255);
    strokeWeight(5);
    Object.values(points).forEach(ps => {
        beginShape();
        fill(255,127,0);
        ps.slice(1).forEach(({ x, y }) => {
            vertex(x, y);
        });
        endShape(CLOSE);
    });
    line(mouseX, 0, mouseX, height);
    src.delete();
    contours.delete();
    hierarchy.delete();
}

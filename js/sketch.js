const AREA_THRESHOLD = 800;
function setup() {
    width = 640;
    height = 480;
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
    paper.setup(document.getElementById('creata'));
    shapes = [];
    line;
    button = createButton('snap');
    button.position(19, 19);
    button.mousePressed(snap);
    reversed = false;
}

function snap() {
    background(0);

    pg.image(capture, 0, 0, width, height);
    if (!reversed) {

        translate(width, 0); // move to far corner
        scale(-1.0, 1.0);    // flip x-axis backwards
        reversed = true;
    }
    let src = cv.imread(pg.canvas);
    let original = cv.imread(pg.canvas);
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
    // draw contours with random Scalar
    const points = {};
    for (let i = 0; i < contours.size(); ++i) {
        const ci = contours.get(i);
        let area = cv.contourArea(ci, false);
        let M = cv.moments(ci, false);
        let cx = M.m10 / M.m00;
        let cy = M.m01 / M.m00;
        if (true || (area > AREA_THRESHOLD)) {
            // let dist = cv.pointPolygonTest(ci, new cv.Point(mouseX, mouseY), true);
            // if (dist > 0) { console.log(dist); }
            points[i] = [];
            for (let j = 0; j < ci.data32S.length; j += 2) {
                let p = {};
                p.x = ci.data32S[j];
                p.y = ci.data32S[j + 1];
                points[i].push(p);
                points[i].color = original.col(cx).row(cy).data;
            }
        }

    }

    stroke(255, 255, 255);
    strokeWeight(5);
    Object.values(points).forEach(ps => {
        beginShape();
        ps.slice(1).forEach(({ x, y }, i) => {
            // if (!(i % 10)) {
                vertex(x, y);
            // }
        });
        fill(ps.color[0], ps.color[1], ps.color[2]);
        endShape(CLOSE);
    });

    line(width - mouseX, 0, width - mouseX, height);


    // shapes.map(p => p.remove());
    // Object.values(points).forEach(ps => {
    //     let path = new paper.Path();
    //     path.strokeColor = 'red';
    //     path.fillColor = '#cccccc';
    //     ps.slice(1).forEach(({ x, y }, i) => {
    //         if (!(i % 30)) { path.add(new paper.Point(x, y)); }
    //     });
    //     path.closePath();
    //     path.simplify();
    //     shapes.push(path);
    // });
    // line = new paper.Path(new paper.Point(mouseX, 0));
    // line.add(mouseX, height);
    // line.strokeColor = 'black';
    // line.removeOnMove();
    // shapes.map(p => {
    //     showIntersections(line, p);
    // })
    // paper.view.draw();
    src.delete();
    original.delete();
    contours.delete();
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
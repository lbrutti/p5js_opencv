const AREA_THRESHOLD = 500;
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.canvas.style.display = "block";
    pg = createGraphics(width, height);
    background(0);

    capture = createCapture(VIDEO);
    capture.size(width, height);
    // capture.hide();

    button = createButton('submit');
    button.position(65, height);
    //   button.mousePressed(takeSnapshot);

}

function draw() {
    background(0);
    pg.image(capture, 0, 0);
    let src = cv.imread(pg.canvas);
    // let original = cv.imread(pg.canvas);
    let dst = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);

    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(
        src,
        contours,
        hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
    );
    // draw contours with random Scalar
    const points = {};
    for (let i = 0; i < contours.size(); ++i) {
        const ci = contours.get(i);
        // 2. Point Polygon Test
        // This function finds the shortest distance between a point in the image and a contour. It returns the distance which is negative when point is outside the contour, positive when point is inside and zero if point is on the contour.
        // We use the function: cv.pointPolygonTest (contour, pt, measureDist)

        // Parameters
        //     contour	input contour.
        //     pt	point tested against the contour.
        //     measureDist	if true, the function estimates the signed distance from the point to the nearest contour edge. Otherwise, the function only checks if the point is inside a contour or not.

        let area = cv.contourArea(ci, false);
        if (area > AREA_THRESHOLD) {

            let dist = cv.pointPolygonTest(ci, new cv.Point(mouseX, mouseY), true);
            if (dist > 0) { console.log(dist); }
        }
        let color = new cv.Scalar(
            255,
            255,
            255
        );
        if (area > AREA_THRESHOLD) {
            cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);

            // points[i] = [];
            // for (let j = 0; j < ci.data32S.length; j += 2) {
            //     let p = {};
            //     p.x = ci.data32S[j];
            //     p.y = ci.data32S[j + 1];
            //     points[i].push(p);
            // }

        }
    }

    cv.imshow(canvas.canvas, dst);
    // plotPoints(canvas.canvas, points);
    src.delete();
    dst.delete();
    // original.delete();
    contours.delete();
    hierarchy.delete();
}

function plotPoints(canvas, points) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'green';

    Object.values(points).forEach(ps => {
        ctx.beginPath();
        ctx.moveTo(ps[0].x, ps[1].y);
        ctx.arc(ps[0].x, ps[1].y, 2, 0, 2 * Math.PI)
        ps.slice(1).forEach(({ x, y }) => {
            ctx.lineTo(x, y)
            ctx.arc(x, y, 2, 0, 2 * Math.PI)
        });
        ctx.fillStyle = '#ee7700';
        ctx.fill();
    });
    ctx.closePath();
    ctx.stroke();
    ctx.clip();
}
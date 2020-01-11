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
    let dst = cv.Mat.zeros(src.size().height, src.size().width, cv.CV_8UC3);

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
        let color = new cv.Scalar(
            255,
            255,
            255
        );
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
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_4, hierarchy,1, new cv.Point(0, 0));

    }

    // cv.namedWindow("creata", cv.WINDOW_NORMAL);
    cv.imshow('creata', dst);
    cv.imshow(canvas.canvas, dst);
    plotPoints(canvas.canvas, points);
    image(pg,0,0,width, height);
   
    src.delete();
    dst.delete();
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
/**
 * Created by saar on 1/20/2015.
 */


function createWidgetAtElement(element, callback) {
    var widget = document.createElement('div');
    copyStyle(widget, element);
    element = $(element);
    element.css('transition', '0');

    $(widget).css({

        position: 'absolute',
        left: element.offset().left + 'px',
        top: element.offset().top + 'px'

    });


    if (callback) {
        setTimeout(function () {
            callback.call(widget);
        }, 5);
    }

    $(widget).text(element.val());

    return widget;
}

function createWidgetsForElements(elements, element, callback) {
    for (var i = 0; i < elements.length; i++) {
        function timeout(i) {
            setTimeout(function () {
                var widget = createWidgetAtElement(elements[i], function () {
                    elements[i].style.opacity = '0';

                });
                document.body.appendChild(widget);
                var circle = createCircle(widget, element);

                if (i == elements.length - 1)
                    followObj(widget, circle, 0, callback);
                else
                    followObj(widget, circle, 0);
            }, i * 87);
        }

        timeout(i);
    }

}

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + 1);
}

function copyStyle(element, copyFrom) {
    element.style.cssText = getComputedStyle(copyFrom).cssText;
}


function circle(radius, steps, center, offset, sign, end) {
    var circle = {};
    //  var stop = {x:$(end).offset().left,y:$(end).offset().top};
    for (var i = 0; i < steps; i++) {
        circle[i] = {};
        circle[i].x = (center.x + radius * (sign * Math.cos(((2 * Math.PI * i) / steps) + offset)));
        circle[i].y = (center.y + radius * Math.sin(((2 * Math.PI * i) / steps) + (sign * offset)));
        if (lineDistance(circle[i], end) < 10)
            break;
    }

    return circle;
}

function lineDistance(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

function absCenterPoint(element) {
    var elem = $(element);
    return {x: elem.offset().left /*+ (elem.width() / 2)*/, y: elem.offset().top /*+ (elem.height() / 2)*/};
}

function centerOf2Points(point1, point2) {
    return {x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2};
}

function createCircle(elem1, elem2) {
    var center1 = absCenterPoint(elem1)
    var center2 = absCenterPoint(elem2);
    center2.x += $(elem2).width() / 2;
    center2.y += $(elem2).height() / 2;

    var center = centerOf2Points(center1, center2);
    var radius = lineDistance(center1, center2) / 2;

    var offset = calculateOffset(center1, center2);


    var sign;
    if ($(elem1).offset().left > $(elem2).offset().left)
        sign = 1;
    else
        sign = -1;

    var circleObj = circle(radius, 105, center, offset, sign, center2);
    return circleObj;
}


function followObj(elem, shape, index, callback) {
    if (getComputedStyle(elem).position == 'static')
        elem.style.position = 'relative';

    elem.style.overflow = 'hidden';

    if (index < shape.getObjectLength()) {
        $(elem).css({
            left: (shape[index].x /*- (relativeCenter(elem).x)*/) + 'px',
            top: (shape[index].y  /*(relativeCenter(elem).y) */) + 'px',
            width: (parseFloat(getComputedStyle(elem).width) - (parseFloat(getComputedStyle(elem).width) / (shape.getObjectLength()))) + 'px',
            height: parseFloat(getComputedStyle(elem).height) - (parseFloat(getComputedStyle(elem).height) / (shape.getObjectLength())) + 'px'
        });
        setTimeout(function () {

            followObj(elem, shape, index + 1, callback);
        }, 3);
    }
    else {
        elem.style.display = 'none';
        if (callback) {
            callback();
        }
    }
}

function calculateOffset(point1, point2) {
    var offset = Math.atan((point1.y - point2.y) / (point1.x - point2.x));
    return offset;
}











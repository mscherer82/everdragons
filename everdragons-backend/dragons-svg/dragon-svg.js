const fs = require('fs');
const convert = require('xml-js');
const path = require('path');

const colors = require("./colors");
const dir = path.join("/opt/dragons-svg", "svg/dragons/");
const cubsDir = path.join("/opt/dragons-svg", "svg/cubs/");

// const dir = path.join("C:\\Projects\\everdragons\\everdragons-backend\\dragons-svg", "svg/dragons/");
// const cubsDir = path.join("C:\\Projects\\everdragons\\everdragons-backend\\dragons-svg", "svg/cubs/");

function applyColors(data, domain, color) {

    function traverse(obj, fnc) {
        if(Array.isArray(obj)) {
            obj.forEach(child => {
                traverse(child, fnc);
            });
        } else if(typeof obj === "object") {
            Object.keys(obj).forEach(key => {
                traverse(obj[key], fnc);
            });
            fnc(obj);
        } else {
            fnc(obj);
        }
    }

    traverse(data, element => {
        const klass = element._attributes && element._attributes.class;
        if(klass && klass !== "none") {
            const _color = colors[domain][color];
            if(_color) {
                element._attributes.fill = _color["." + klass].fill;
            }
        }
    });
    return data;
}


module.exports.creatDragon = function (parts, id, domain, color) {
    let lay = [];
    let leftWing, rightWing;

    for (let z = 2; z < 8; z++) {
        if (parts[z - 1] < 10) {
            lay.push(applyColors(convert.xml2js(fs.readFileSync(dir + '/' + z + '/L0' + z + '_E00' + parts[z - 1] + '.SVG'), {compact: true}), domain, color));
        }
        else {
            lay.push(applyColors(convert.xml2js(fs.readFileSync(dir + '/' + z + '/L0' + z + '_E0' + parts[z - 1] + '.SVG'), {compact: true}), domain, color));
        }
    }

    if (parts[0] < 10) {
        leftWing = applyColors(convert.xml2js(fs.readFileSync(dir + '/' + '1' + 'L' + '/L0' + 1 + 'L_E00' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    else {
        leftWing = applyColors(convert.xml2js(fs.readFileSync(dir + '/' + '1' + 'L' + '/L0' + 1 + 'L_E0' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    if (parts[0] < 10) {
        rightWing = applyColors(convert.xml2js(fs.readFileSync(dir + '/' + '1' + 'R' + '/L0' + 1 + 'R_E00' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    else {
        rightWing = applyColors(convert.xml2js(fs.readFileSync(dir + '/' + '1' + 'R' + '/L0' + 1 + 'R_E0' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }

    const output = {
        svg: {
            _attributes: {
                version: '1.1',
                id: 'dragon' + id,
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                x: '0px',
                y: '0px',
                viewBox: '0 0 500 500',
                'enable-background': 'new 0 0 500 500',
                'xml:space': 'preserve'
            },
            g: [],
            style: {
                _text: ""
                   // '\r\n\tsvg .Head {\r\n\t\ttransform-origin: 250px 250px;\r\n\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\tanimation: moveHead 24s ease-in-out infinite;\r\n\t}\r\n\r\n\tsvg .Left_wing {\r\n\t\ttransform-origin: 240px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px);\r\n\t\tanimation: rotatewingLeft 4s ease-in-out 0.2s infinite alternate;\r\n\t}\r\n\r\n\tsvg .Right_wing {\r\n\t\ttransform-origin: 260px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px);\r\n\t\tanimation: rotatewingRight 4s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\tsvg .Tail {\r\n\t\ttransform-origin: 260px 350px;\r\n\t\tanimation: skewTail 12s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\tsvg .Body {\r\n\t\ttransform-origin: 250px 350px;\r\n\t\tanimation: scaleBody 4s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\t@keyframes moveHead {\r\n\t\t0%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t17%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t34%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t50%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t67%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t83%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t88%{\r\n\t\t\tanimation-timing-function: ease-in;\r\n\t\t\ttransform: rotate(-1deg) translate(0px, 0.5px) scale(1, 1);\r\n\t\t}\r\n\t\t94%{\r\n\t\t\tanimation-timing-function: ease-out;\r\n\t\t\ttransform: rotate(-0.5deg) translate(0px, 0px) scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingLeft {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingRight {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(-2deg, 1deg) translateX(5px);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes skewTail {\r\n        0%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        40%{\r\n            transform: scale(0.97, 1) skew(0deg, 2deg);\r\n        }\r\n        80%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        100%{\r\n            transform: scale(0.96, 0.98) skew(0deg, 4deg);\r\n        }\r\n        }\r\n\r\n\r\n\t@keyframes scaleBody {\r\n\t\t0%{\r\n\t\t\ttransform: scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: scale(1.07, 1.02);\r\n\t\t}\r\n\t}\r\n'
                   // '\r\n\tsvg .Head {\r\n\t\ttransform-origin: 250px 250px;\r\n\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\r\n\tsvg .Left_wing {\r\n\t\ttransform-origin: 240px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px);\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Right_wing {\r\n\t\ttransform-origin: 260px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px);\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Tail {\r\n\t\ttransform-origin: 260px 350px;\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Body {\r\n\t\ttransform-origin: 250px 350px;\r\n\t\t\r\n\t}\r\n\r\n\t@keyframes moveHead {\r\n\t\t0%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t17%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t34%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t50%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t67%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t83%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t88%{\r\n\t\t\tanimation-timing-function: ease-in;\r\n\t\t\ttransform: rotate(-1deg) translate(0px, 0.5px) scale(1, 1);\r\n\t\t}\r\n\t\t94%{\r\n\t\t\tanimation-timing-function: ease-out;\r\n\t\t\ttransform: rotate(-0.5deg) translate(0px, 0px) scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingLeft {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingRight {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(-2deg, 1deg) translateX(5px);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes skewTail {\r\n        0%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        40%{\r\n            transform: scale(0.97, 1) skew(0deg, 2deg);\r\n        }\r\n        80%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        100%{\r\n            transform: scale(0.96, 0.98) skew(0deg, 4deg);\r\n        }\r\n        }\r\n\r\n\r\n\t@keyframes scaleBody {\r\n\t\t0%{\r\n\t\t\ttransform: scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: scale(1.07, 1.02);\r\n\t\t}\r\n\t}\r\n'
            }
        }
    };

    output.svg.g.push({_attributes: {class: 'Tail'}, path: []});
    output.svg.g.push({_attributes: {class: 'Left_wing', style: "transform: translateX(5px);"}, path: []});
    output.svg.g.push({_attributes: {class: 'Right_wing', style: "transform: translateX(5px);"}, path: []});
    output.svg.g.push({_attributes: {class: 'Body'}, path: []});
    output.svg.g.push({_attributes: {class: 'Legs'}, path: []});
    output.svg.g.push({_attributes: {class: 'Head'}, path: []});
    output.svg.g[0].path = lay[0].svg.path;
    output.svg.g[1].path = leftWing.svg.path;
    output.svg.g[2].path = rightWing.svg.path;
    output.svg.g[3].path = lay[1].svg.path;
    output.svg.g[4].path = lay[2].svg.path;

    for (let i = 0; i < lay[3].svg.path.length; i++) {
        output.svg.g[5].path.push(lay[3].svg.path[i]);
    }
    for (let i = 0; i < lay[4].svg.path.length; i++) {
        output.svg.g[5].path.push(lay[4].svg.path[i]);
    }
    for (let i = 0; i < lay[5].svg.path.length; i++) {
        output.svg.g[5].path.push(lay[5].svg.path[i]);
    }

    return output;
};

module.exports.creatCub = function (parts, id, domain, color) {
    let lay = [];
    let leftWing, rightWing;

    for (let z = 2; z < 8; z++) {
        if (parts[z - 1] < 10) {
            lay.push(applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + z + '/L0' + z + '_E00' + parts[z - 1] + '.SVG'), {compact: true}), domain, color));
        }
        else {
            lay.push(applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + z + '/L0' + z + '_E0' + parts[z - 1] + '.SVG'), {compact: true}), domain, color));
        }
    }

    if (parts[0] < 10) {
        leftWing = applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + '1' + 'L' + '/L0' + 1 + 'L_E00' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    else {
        leftWing = applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + '1' + 'L' + '/L0' + 1 + 'L_E0' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    if (parts[0] < 10) {
        rightWing = applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + '1' + 'R' + '/L0' + 1 + 'R_E00' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }
    else {
        rightWing = applyColors(convert.xml2js(fs.readFileSync(cubsDir + '/' + '1' + 'R' + '/L0' + 1 + 'R_E0' + parts[0] + '.SVG'), {compact: true}), domain, color);
    }

    const output = {
        svg: {
            _attributes: {
                version: '1.1',
                id: 'cub' + id,
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                x: '0px',
                y: '0px',
                viewBox: '0 0 500 500',
                'enable-background': 'new 0 0 500 500',
                'xml:space': 'preserve'
            },
            g: [],
            style: {
                _text: ""
                // '\r\n\tsvg .Head {\r\n\t\ttransform-origin: 250px 250px;\r\n\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\tanimation: moveHead 24s ease-in-out infinite;\r\n\t}\r\n\r\n\tsvg .Left_wing {\r\n\t\ttransform-origin: 240px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px);\r\n\t\tanimation: rotatewingLeft 4s ease-in-out 0.2s infinite alternate;\r\n\t}\r\n\r\n\tsvg .Right_wing {\r\n\t\ttransform-origin: 260px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px);\r\n\t\tanimation: rotatewingRight 4s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\tsvg .Tail {\r\n\t\ttransform-origin: 260px 350px;\r\n\t\tanimation: skewTail 12s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\tsvg .Body {\r\n\t\ttransform-origin: 250px 350px;\r\n\t\tanimation: scaleBody 4s ease-in-out infinite alternate;\r\n\t}\r\n\r\n\t@keyframes moveHead {\r\n\t\t0%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t17%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t34%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t50%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t67%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t83%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t88%{\r\n\t\t\tanimation-timing-function: ease-in;\r\n\t\t\ttransform: rotate(-1deg) translate(0px, 0.5px) scale(1, 1);\r\n\t\t}\r\n\t\t94%{\r\n\t\t\tanimation-timing-function: ease-out;\r\n\t\t\ttransform: rotate(-0.5deg) translate(0px, 0px) scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingLeft {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingRight {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(-2deg, 1deg) translateX(5px);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes skewTail {\r\n        0%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        40%{\r\n            transform: scale(0.97, 1) skew(0deg, 2deg);\r\n        }\r\n        80%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        100%{\r\n            transform: scale(0.96, 0.98) skew(0deg, 4deg);\r\n        }\r\n        }\r\n\r\n\r\n\t@keyframes scaleBody {\r\n\t\t0%{\r\n\t\t\ttransform: scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: scale(1.07, 1.02);\r\n\t\t}\r\n\t}\r\n'
                // '\r\n\tsvg .Head {\r\n\t\ttransform-origin: 250px 250px;\r\n\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\r\n\tsvg .Left_wing {\r\n\t\ttransform-origin: 240px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px);\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Right_wing {\r\n\t\ttransform-origin: 260px 250px;\r\n\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px);\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Tail {\r\n\t\ttransform-origin: 260px 350px;\r\n\t\t\r\n\t}\r\n\r\n\tsvg .Body {\r\n\t\ttransform-origin: 250px 350px;\r\n\t\t\r\n\t}\r\n\r\n\t@keyframes moveHead {\r\n\t\t0%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t17%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t34%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t50%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t67%{\r\n\t\t\ttransform: rotate(-0.001deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t\t83%{\r\n\t\t\ttransform: rotate(0.001deg) translate(0px, 1px) scale(1, 1);\r\n\t\t}\r\n\t\t88%{\r\n\t\t\tanimation-timing-function: ease-in;\r\n\t\t\ttransform: rotate(-1deg) translate(0px, 0.5px) scale(1, 1);\r\n\t\t}\r\n\t\t94%{\r\n\t\t\tanimation-timing-function: ease-out;\r\n\t\t\ttransform: rotate(-0.5deg) translate(0px, 0px) scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: rotate(0deg) translate(0px, -1px) scale(1, 1);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingLeft {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(-2deg, 1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes rotatewingRight {\r\n\t\tfrom{\r\n\t\t\ttransform: scale(0.93, 0.97) skew(2deg, -1deg) translateX(5px); \r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform: scale(1, 1) skew(-2deg, 1deg) translateX(5px);\r\n\t\t}\r\n\t}\r\n\r\n\t@keyframes skewTail {\r\n        0%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        40%{\r\n            transform: scale(0.97, 1) skew(0deg, 2deg);\r\n        }\r\n        80%{\r\n            transform: scale(1, 1) skew(0deg, 0deg);\r\n        }\r\n        100%{\r\n            transform: scale(0.96, 0.98) skew(0deg, 4deg);\r\n        }\r\n        }\r\n\r\n\r\n\t@keyframes scaleBody {\r\n\t\t0%{\r\n\t\t\ttransform: scale(1, 1);\r\n\t\t}\r\n\t\t100%{\r\n\t\t\ttransform: scale(1.07, 1.02);\r\n\t\t}\r\n\t}\r\n'
            }
        }
    };

    output.svg.g.push({_attributes: {class: 'Tail'}, g: []});
    output.svg.g.push({_attributes: {class: 'Left_wing'}, g: []});
    output.svg.g.push({_attributes: {class: 'Right_wing'}, g: []});
    output.svg.g.push({_attributes: {class: 'Body'}, g: []});
    output.svg.g.push({_attributes: {class: 'Legs'}, g: []});
    output.svg.g.push({_attributes: {class: 'Head'}, g: []});
    output.svg.g.push({_attributes: {class: 'Horns'}, g: []});
    output.svg.g.push({_attributes: {class: 'Eyes'}, g: []});
    output.svg.g[0].g = lay[0].svg.g;
    output.svg.g[1].g = leftWing.svg.g;
    output.svg.g[2].g = rightWing.svg.g;
    output.svg.g[3].g = lay[1].svg.g;
    output.svg.g[4].g = lay[2].svg.g;
    output.svg.g[5].g = lay[3].svg.g;
    output.svg.g[6].g = lay[4].svg.g;
    output.svg.g[7].g = lay[5].svg.g;
    return output;
};

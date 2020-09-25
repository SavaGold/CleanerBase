const express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');

const app = express();
app.use(fileUpload());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/', (req, res) => {
    if (req.files) {
        // console.log(req.files);
        var file = req.files.file;
        var filename = file.name
        console.log(filename);

        file.mv(__dirname + '/uploads/' + filename, function (err) {
            if (err) {
                res.send(err)
            } else {
                var configJSON = fs.readFileSync(`./uploads/${filename}`);
                var configDict = JSON.parse(configJSON);
                console.log(configDict.length);
                var keys = Object.keys(configDict[0]);
                // console.log(keys)
                var counterObj = {}
                let keyForCounterObj
                configDict.forEach((obj) => {
                    keyForCounterObj = ''
                    keys.forEach((key) => {
                        keyForCounterObj += String(obj[key])
                    })
                    if (counterObj[keyForCounterObj]) {
                        counterObj[keyForCounterObj].weight++
                    } else {
                        counterObj[keyForCounterObj] = {
                            ...obj,
                            weight: 1
                        }
                    }
                })

                let newArrayOfObjects = []
                const counterObjKeys = Object.keys(counterObj)
                counterObjKeys.forEach((key) => {
                    newArrayOfObjects.push(counterObj[key])
                });

                // console.log(newArrayOfObjects)
                res.send(newArrayOfObjects);

            }
        })
    }
})

// var configJSON = fs.readFileSync(`./uploads/${filename}`);
// var configDict = JSON.parse(configJSON);


// console.log(configDict);
// console.log(configDict.length);

// function addWeight(obj, key, data) {
//     obj[key] = data;
// }
// configDict.map(function (item) {
//     return addWeight(item, 'weight', '1');
// });



// let o = configDict.reduce((acc, cv) => {
//     if (!acc[JSON.stringify(cv)]) {
//         acc[JSON.stringify(cv)] = true; //something non-falsy
//     }
//     return acc;
// }, {});
// // console.log(o);

// let res = Object.keys(o).map(x => JSON.parse(x));
// console.log(res);
// console.log(res.length)


const PORT = process.env.PORT || 80

app.listen(PORT, ()=> {
    console.log('Server has been started')
})
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

        file.mv('./uploads/' + filename, function (err) {
            if (err) {
                res.send(err)
            } else {
                const start= new Date().getTime();
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
                // res.send(newArrayOfObjects);

                fs.writeFileSync(__dirname + '/clean-rules/Clean-rules.json', JSON.stringify(newArrayOfObjects, null, '\t'), (err) => {
                    if (err) throw err;

                })
                console.log(newArrayOfObjects.length);
                console.log('The file has been cleaned!');
                res.download(__dirname + '/clean-rules/Clean-rules.json', 'Clean-rules.json');
                const end = new Date().getTime();
                console.log(`Algorithm time: ${end - start}ms`);

            }
        })
    }
})

const PORT = process.env.PORT || 80

app.listen(PORT, () => {
    console.log('Server has been started')
})
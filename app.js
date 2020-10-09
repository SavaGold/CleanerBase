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
                const start = new Date().getTime();
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

                var cleanRuleJSON = fs.readFileSync(`./clean-rules/Clean-rules.json`);
                var cleanRuleDict = JSON.parse(cleanRuleJSON);
                var linksConfigDict = JSON.parse(cleanRuleJSON);
                var data = {}
                data.nodes = []
                data.links = []
                var delqos = [];

                //create new array without info about QoS
                cleanRuleDict.forEach((item) => {
                    delete item.weight
                    delete item.qos
                    delqos.push(item);
                });
                // number of rules
                for (r = 0; r < linksConfigDict.length; r++) {
                    var rule = {
                        name: "rule_" + r,
                        size: 12 * linksConfigDict[r].weight
                    }
                    data.nodes.push(rule)
                }
                //QoS vertices creation with the weight
                for (j = 0; j < linksConfigDict.length; j++) {
                    var weightQos = {
                        name: "qos_" + linksConfigDict[j].qos,
                        size: 17
                    }
                    data.nodes.push(weightQos)
                }
                //terms creation
                for (j = 0; j < cleanRuleDict.length; j++) {
                    var keys = Object.keys(cleanRuleDict[0]);
                    var values = Object.values(cleanRuleDict[j]);
                    for (i = 0; i < keys.length; i++) {
                        var term = {
                            name: keys[i] + "_" + values[j, i],
                            size: 12
                        }
                        data.nodes.push(term)
                    }
                }
                //making uniq array of terms
                var uniqIds = {};
                data.nodes = data.nodes.filter(obj => !uniqIds[obj.name] && (uniqIds[obj.name] = true));
                //vertices sorting
                data.nodes.sort(function (a, b) {
                    if (a.name < b.name) {
                        return 1;
                    }
                    if (a.name > b.name) {
                        return -1;
                    }
                    return 0;
                });
                //links between Rules and QoS
                for (j = 0; j < linksConfigDict.length; j++) {
                    var connectionRuleQos = {
                        source: "rule_" + j,
                        target: "qos_" + linksConfigDict[j].qos
                    }
                    data.links.push(connectionRuleQos)
                }
                //links between Terms and Rules
                for (j = 0; j < delqos.length; j++) {
                    var keys = Object.keys(delqos[j]);
                    var values = Object.values(delqos[j]);
                    for (i = 0; i < keys.length; i++) {
                        var connectionTermRule = {
                            source: keys[i] + "_" + values[j, i],
                            target: "rule_" + j
                        }
                        data.links.push(connectionTermRule)
                    }
                }
                // console.log(data)
                //write all data in Rules.json file
                fs.writeFileSync("./clean-rules/Rules.json", JSON.stringify(data, null, ' '), function (err) {
                    if (err) throw err;
                    console.log('complete');
                }
                );

                console.log(newArrayOfObjects.length);
                console.log('The file has been cleaned!');
                res.download(__dirname + '/clean-rules/Rules.json', 'Rules.json');
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
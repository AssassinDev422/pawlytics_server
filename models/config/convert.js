var pets = require ('./dog_breeds.json')
var output = {}
console.log('pets',pets)
newlist = pets.map ( (obj, i) => { return { name: Object.keys(pets[i])[0] } })

var fs = require('fs');
fs.writeFileSync("dogs.json", JSON.stringify(newlist, null, 2), function(err) {
    if(err) {
        return console.log(err);
    }
})

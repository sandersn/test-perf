const fs = require('fs')
var recording = 0
var conformance = new Set()
var compiler = new Set()
var other = new Set()
for (const line of fs.readFileSync('../../ts/output.txt', 'utf8').split('\n')) {
    // TODO: Might want to just look at compiler, conformance, etc
    if (/^[0-9.]+$/.test(line)) {
        (recording === 0 ? conformance : recording === 1 ? compiler : other).add(line)
    }
    if (/compiler tests/.test(line)) {
        recording = 1
    }
    if (/projects tests/.test(line)) {
        recording = 2
    }
}
console.log('compiler', compiler.size, '/ 9940')
console.log('conformance', conformance.size, '/ 8936')
console.log('other', other.size, '/ ???')

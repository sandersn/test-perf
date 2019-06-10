const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const outputPath = "./dumpHistogram.json"
const { collectCommits } = require('./common')
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
const git = require('simple-git/promise')(tsPath)

async function main() {
    /** @type {SimpleHistogram} */
    const map = Object.create(null)
    // const commits = await git.log({ from: "f617d1641b00366ff9c5684fec06cec7f1c26d2e", to: "master" })
    await collectCommits(git, "release-3.1", "master", files => fillMap(files, map))
    console.log()
    console.log('Writing JSON:', outputPath)
    write(map, outputPath)
}

/**
 * @param {string[]} files
 * @param {SimpleHistogram} map
 */
function fillMap(files, map) {
    // TODO: unit tests too?
    const tests = files.filter(f => f.startsWith('tests/cases/fourslash') || f.startsWith('tests/baselines/reference/'))
    for (const test of tests) {
        map[test] = (map[test] || 0) + 1
    }
}

/**
 * @param {SimpleHistogram} map
 * @param {string} path
 */
function write(map, path) {
    fs.writeFileSync(path, JSON.stringify(map), 'utf8')
}

main().catch(e => { console.log(e); process.exit(1) })

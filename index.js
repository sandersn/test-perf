const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
// 1. find all merge commits in the last X time span from present: git log --merges
//   2. find all commits for each merge commit: git log c^..c (+something to only return commit shas)
//   3. concatMap all the files from each commit: git log --stat
// 2. find all merge-squash commits in the last X time span: git log | egrep '\(\#[0-9]+\)$'
//   1. find all the files from each commit
// 3. create mapping from src/compiler/* to various test suites
for (const d of fs.readdirSync(tsPath)) {
    console.log('Running prettier on', d)
    // Actually run prettier
    // Add to list if prettier caused a diff and if there is no open PR that covers this directory
    // Stop when the list has 10 elements
    // Then create a PR
    break
}

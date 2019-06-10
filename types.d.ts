type Edits = Map<string, EditHistogram>
type EditHistogram = { count: number, testEdits: Map<string, number> }
type SimpleHistogram = { [s: string]: number }

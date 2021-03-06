const CellState = {
    UNKNOWN: 1,
    EMPTY: 2,
    FILLED: 3
};

const ActionType = {
    ANALYZE_ROW: 1,
    ANALYZE_COLUMN: 2
};

class NonogramBuilder {

    constructor() {
        this._numRows = -1;
        this._numCols = -1;
        this._rowBlocks = [];
        this._colBlocks = [];
    }

    setSize(numRows, numColumns) {
        
        this._numRows = numRows;
        this._numCols = numColumns;
        
        this._rowBlocks = [];
        for (let r = 0; r < this._numRows; r++) {
            this._rowBlocks.push([]);
        }

        this._colBlocks = [];
        for (let c = 0; c < this._numCols; c++) {
            this._colBlocks.push([]);
        }
        
        return this;
    }

    setRowBlocks(row, blocks) {
        this._rowBlocks[row] = blocks;
    }

    setColumnBlocks(col, blocks) {
        this._colBlocks[col] = blocks;
    }

    setFromConfig(configText) {

        const lines = configText.split('\n');
        const sectionPattern = /\[([^\]]+)]/;

        this._numRows = -1;
        this._numCols = -1;
        this._rowBlocks = [];
        this._colBlocks = [];

        let curSection = '';
        let numSectionLines = 0;

        for (let line of lines) {
            
            line = line.trim();
            
            if (line.length === 0) {
                continue;
            }

            if (numSectionLines === 0) { 

                const match = sectionPattern.exec(line);
                if (match) {
                    curSection = match[1];
                    if (curSection === 'size') {
                        numSectionLines = 1;
                    } else if (curSection  === 'rows') {
                        numSectionLines = this._numRows;
                    } else if (curSection === 'columns') {
                        numSectionLines  = this._numCols;
                    }
                    continue;
                }

            } else {

                if (curSection === 'size') {
                    [this._numRows, this._numCols] = this._parseNumbers(line);
                } else if (curSection  === 'rows') {
                    this._rowBlocks.push(this._parseNumbers(line));
                } else if (curSection  === 'columns') {
                    this._colBlocks.push(this._parseNumbers(line));
                }

                numSectionLines--;

            }

        }

        return this;

    }

    _parseNumbers(line) {
        return line.split(' ')
            .map(el => parseInt(el.trim()))
            .filter(el => el > 0);
    }

    build() {

        return new Nonogram(
            this._numRows, 
            this._numCols,
            this._rowBlocks,
            this._colBlocks);

    }

}

class Nonogram {

    constructor(numRows, numCols, rowBlocks, colBlocks) {
        
        this._numRows = numRows;
        this._numCols = numCols;
        this._rowBlocks = rowBlocks;
        this._colBlocks = colBlocks;

        this._cells = this._createCells(this._numRows, this._numCols);

    }

    getNumRows() {
        return this._numRows;
    }

    getNumColumns() {
        return this._numCols;
    }

    getCellState(row, col) {
        return this._cells[row][col];
    }

    solve() {
        
        this._solveWithOverlapAnalysis();

        if (!this._isSolved()) {
            this._solveWithBacktracking();
        }

    }

    _isSolved() {
        for (let r = 0; r < this._numRows; r++) {
            for (let c = 0; c < this._numCols; c++) {
                if (this._cells[r][c] === CellState.UNKNOWN) {
                    return false;
                }
            }
        }
        return true;
    }

    _solveWithOverlapAnalysis() {

        const actions = [];
        
        for (let row = 0; row < this._numRows; row++) {
            actions.push(this._createRowAction(row));
        }

        for (let col = 0; col < this._numCols; col++) {
            actions.push(this._createColumnAction(col));
        }

        while (actions.length > 0) {
            const action = actions.shift();
            action.execute(actions);
        }

    }

    _solveWithBacktracking() {

        const cells = this._createCells(this._numRows, this._numCols);
        
        const allPlacements = [];

        for (let row = 0; row < this._numRows; row++) {
            const expectedStates = this._getCellStatesOfRow(row);
            const placements = this.findPlacements(this._numCols, this._rowBlocks[row], expectedStates);
            allPlacements.push(placements);
        }

        const placed = [];
        let nextRow = 0;
        let nextIdx = 0;
        
        while (placed.length  < this._numRows) {

            const nextPlacements = allPlacements[nextRow];

            if (nextPlacements.length === 0) {
                this._setRowEmpty(nextRow, cells);
                placed.unshift(-1);
                nextRow++;
                nextIdx = 0;
                continue;
            }

            if (nextIdx < nextPlacements.length) {
                
                const placement = nextPlacements[nextIdx];
                
                this._placeBlocks(nextRow, this._rowBlocks[nextRow], placement, cells);
                
                if (this._isConsistent(cells, this._colBlocks)) {
                    placed.unshift(nextIdx);
                    nextRow++;
                    nextIdx = 0;
                } else {
                    this._setRowEmpty(nextRow, cells);
                    nextIdx++;
                }

            } else {

                if (placed.length > 0) {

                    nextIdx = placed.unshift() + 1;
                    nextRow = placed.length;

                } else {
                    break; // error
                }

            }

        }

        if (placed.length === this._numRows) {
            this._cells = cells;
        } 

    }

    _isConsistent(cells, colBlocks) {

        const nCols = cells[0].length;

        for (let col = 0; col < nCols; col++) {

            const columnCells = cells.map(row => row[col]);

            const actualBlocks = this._getBlocks(columnCells);
            const expectedBlocks = colBlocks[col];

            if (!this._blocksConsistent(actualBlocks, expectedBlocks)) {
                return false;
            }

        }

        return true;
    }

    _blocksConsistent(actual, expected) {

        if (actual.length === 0) {
            return true;
        }

        if (actual.length > expected.length) {
            return false;
        }

        for (let i = 0; i < actual.length - 1; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }

        return actual[actual.length - 1] <= expected[actual.length - 1];
    }

    _getBlocks(cellLine) {

        const result = [];
        let size = 0;
        
        for (let cell of cellLine) {

            if (cell !== CellState.FILLED) {
                if (size > 0) {
                    result.push(size)
                    size = 0;
                }
            } else {
                size++;
            }

        }

        if (size > 0) {
            result.push(size);
        }

        return result;

    }

    _setRowEmpty(row, cells) {
        
        for (let col = 0; col < cells[row].length; col++) {
            cells[row][col] = CellState.EMPTY;
        }

    }

    _placeBlocks(row, blocks, placement, cells) {
        
        this._setRowEmpty(row, cells);

        placement.forEach((offset, idx) => {
            const blockLen = blocks[idx];
            for (let col = offset; col < offset + blockLen; col++) {
                cells[row][col] = CellState.FILLED;
            }
        })

    }

    _createCells(numRows, numCols) {
        
        const result = [];

        for (let row = 0; row < numRows; row++) {
            const line = [];
            for (let col = 0; col < numCols; col++) {
                line.push(CellState.UNKNOWN);
            }
            result.push(line);
        }

        return result;
    }

    _createRowAction(row) {
        const nonogram = this;
        return {
            actionType: ActionType.ANALYZE_ROW,
            row,
            execute: (actions) => {
                nonogram._analyzeRow(row, actions);
            }
        };
    }

    _createColumnAction(col) {
        const nonogram = this;
        return {
            actionType: ActionType.ANALYZE_COLUMN,
            col,
            execute: (actions) => {
                nonogram._analyzeColumn(col, actions);
            }
        };
    }

    _analyzeRow(row, actions) {
        
        const stateConstraints = this._getCellStatesOfRow(row);
        const states = this.determineCellStates(this._numCols, this._rowBlocks[row], stateConstraints);
        
        for (let col = 0; col < this._numCols; col++) {
            if (states[col] === CellState.UNKNOWN) {
                continue;
            }
            if (this._cells[row][col] === CellState.UNKNOWN) {
                this._cells[row][col] = states[col];
                let found = false;
                for (let action of actions) {
                    if (action.actionType === ActionType.ANALYZE_COLUMN && action.col === col) {
                        found = true;
                        break;
                    } 
                }
                if (!found) {
                    actions.push(this._createColumnAction(col));
                }
            } else if (this._cells[row][col] !== states[col]) {
                return false; // Error!
            }
        }

        return true;
    }

    _analyzeColumn(col, actions) {

        const stateConstraints = this._getCellStatesOfColumn(col);
        const states = this.determineCellStates(this._numRows, this._colBlocks[col], stateConstraints);
        
        for (let row = 0; row < this._numRows; row++) {
            if (states[row] === CellState.UNKNOWN) {
                continue;
            }
            if (this._cells[row][col] === CellState.UNKNOWN) {
                this._cells[row][col] = states[row];
                let found = false;
                for (let action of actions) {
                    if (action.actionType === ActionType.ANALYZE_ROW && action.row === row) {
                        found = true;
                        break;
                    } 
                }
                if (!found) {
                    actions.push(this._createRowAction(row));
                }
            } else if (this._cells[row][col] !== states[row]) {
                return false; // Error!
            }
        }

        return true;
    }

    _getCellStatesOfRow(row) {
        return this._cells[row];
    }

    _getCellStatesOfColumn(col) {
        return this._cells.map(row => row[col]);
    }

    _isValid(size, blocks, placement, expectedStates) {

        const actualStates = this._determineCellStates(size, blocks, [placement]);

        for (let i = 0; i < size; i++) {
            if (expectedStates[i] != CellState.UNKNOWN &&
                expectedStates[i] != actualStates[i]) {
                return false;
            }
        }

        return true;
    }
    
    determineCellStates(size, blocks, expectedStates) {
        return this._determineCellStates(size, blocks, this.findPlacements(size, blocks, expectedStates));
    }

    _determineCellStates(size, blocks, placements) {

        const counters = [];
        for (let i = 0; i < size; ++i) {
            counters.push(0);
        }

        placements.forEach( p => {
            p.forEach((offset, blockIdx) => {
                const blockLen = blocks[blockIdx];
                for (let cellIdx = offset; cellIdx < offset + blockLen; ++cellIdx) {
                    counters[cellIdx]++;
                }
            });
        });

        const result = [];
        const numPlacements = placements.length;

        for (let cnt of counters) {
            if (cnt === 0) {
                result.push(CellState.EMPTY);
            } else if (cnt === numPlacements) {
                result.push(CellState.FILLED);
            } else {
                result.push(CellState.UNKNOWN);
            }
        }

        return result;
    }
    
    findPlacements(size, blocks, expectedStates) {
        
        let result = [];

        if (blocks.length === 0) {
            return result;
        }

        this._findPlacements(size, blocks, expectedStates, [], result);

        return result;
    }
    
    _findPlacements(size, blocks, expectedStates, offsets, result) {
    
        if (offsets.length === blocks.length) {
            if (this._isValid(size, blocks, offsets, expectedStates)) {
                result.push(offsets);
            }
            return;
        }

        let startOffset = 0;
        let currBlockIdx = 0;

        if (offsets.length > 0) {
            const lastOffset = offsets[offsets.length - 1];
            const lastBlockIdx = offsets.length - 1;
            startOffset = lastOffset + blocks[lastBlockIdx] + 1;
            currBlockIdx = lastBlockIdx + 1;
        }

        const remaining = blocks.slice(currBlockIdx, blocks.length);
        const remainingSum = remaining.reduce((a, b) => a + b);
        const remainingLen = remaining.length - 1 + remainingSum;
        const endOffset = size - remainingLen;

        for (let offset=startOffset; offset <= endOffset; offset++) {
            this._findPlacements(size, blocks, expectedStates, offsets.concat([offset]), result);
        }

    }

}

export {
    NonogramBuilder,
    CellState
};

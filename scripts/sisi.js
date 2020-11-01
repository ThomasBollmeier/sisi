const CellState = {
    UNKNOWN: 1,
    EMPTY: 2,
    FILLED: 3
};

const ActionType = {
    ANALYZE_ROW: 1,
    ANALYZE_COLUMN: 2
};

class Nonogram {

    constructor(numRows, numCols) {
        
        this._numRows = numRows;
        this._numCols = numCols;

        this._cells = [];
        for (let r = 0; r < this._numRows; r++) {
            const row = [];
            for (let c = 0; c < this._numCols; c++) {
                row.push(CellState.UNKNOWN);
            }
            this._cells.push(row);
        }

        this._rowBlocks = [];
        for (let r = 0; r < this._numRows; r++) {
            this._rowBlocks.push([]);
        }

        this._colBlocks = [];
        for (let c = 0; c < this._numCols; c++) {
            this._colBlocks.push([]);
        }

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

    setRowBlocks(row, blocks) {
        this._rowBlocks[row] = blocks;
    }

    setColumnBlocks(col, blocks) {
        this._colBlocks[col] = blocks;
    }

    solve() {

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
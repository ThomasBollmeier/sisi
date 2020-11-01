const CellState = {
    UNKNOWN: 1,
    EMPTY: 2,
    FILLED: 3
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

    getCellStatesOfRow(row) {
        return this._cells[row];
    }

    getCellStatesOfColumn(col) {
        return this._cells.map(row => row[col]);
    }

    _isValid(size, placement, expectedStates) {

        const actualStates = this._determineCellStates(size, [placement]);

        for (let i = 0; i < size; i++) {
            if (expectedStates[i] != CellState.UNKNOWN &&
                expectedStates[i] != actualStates[i]) {
                return false;
            }
        }

        return true;
    }
    
    determineCellStates(size, blocks, expectedStates) {
        return this._determineCellStates(size, this.findPlacements(size, blocks, expectedStates));
    }

    _determineCellStates(size, placements) {

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
            if (this._isValid(size, offsets, expectedStates)) {
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
const CellState = {
    UNKNOWN: 1,
    EMPTY: 2,
    FILLED: 3
};

class Nonogram {

    constructor(numRows, numCols) {
        this.numRows = numRows;
        this.numCols = numCols;
    }
    
    determineCellStates(size, blocks) {

        const counters = [];
        for (let i = 0; i < size; ++i) {
            counters.push(0);
        }

        const placements = this.findPlacements(size, blocks);

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
    
    findPlacements(size, blocks) {
        
        let result = [];

        if (blocks.length === 0) {
            return result;
        }

        this._findPlacements(size, blocks, [], result);

        return result;
    }
    
    _findPlacements(size, blocks, offsets, result) {
    
        if (offsets.length === blocks.length) {
            result.push(offsets);
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
            this._findPlacements(size, blocks, offsets.concat([offset]), result);
        }

    }

}
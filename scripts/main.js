import * as Sisi from './sisi.js';

function printNonogram(nono) {
    const nRows = nono.getNumRows();
    const nCols = nono.getNumColumns();
    let data = '';
    for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
            switch(nono.getCellState(r, c)) {
                case Sisi.CellState.UNKNOWN:
                    data += '? ';
                    break;
                case Sisi.CellState.EMPTY:
                    data += '- ';
                    break;
                case Sisi.CellState.FILLED:
                    data += '# ';
                    break;
            }    
        }
        data += '\n';
    }
    console.log(data);
}

const nono = new Sisi.NonogramBuilder()
    .setFromConfig(`
        [size]
        10 20

        [rows]
        6
        4 2 6
        6 1 6
        2 3 5
        1 11 1
        3 2 2 1
        1 2 2 1 1
        1 1 3 2
        2 2 4
        5

        [columns]
        3
        3
        2
        2
        3
        3
        3
        2 5
        2 2 2
        1 1 2 1
        1 1 1 1
        2 1 1
        2 1 2
        3 5
        2 4
        4 2
        3 2 1
        2 1 1
        2 2
        5`)
    .build();

printNonogram(nono);

console.log('\n\n');

nono.solve();

printNonogram(nono);


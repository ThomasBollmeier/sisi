import * as Sisi from './sisi.js';

function displayNonogram(nono) {

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
        data += '<br>';
    }
    
    const $output = document.querySelector('#output');
    $output.innerHTML = data;
}

function uploadNonogram(nonoFile) {

    return nonoFile.text().then(content => {
        return new Sisi.NonogramBuilder().setFromConfig(content).build();
    });

}

document.addEventListener('DOMContentLoaded', () => {

    const $file = document.querySelector('#file');
    const $upload = document.querySelector('#upload');

    $upload.addEventListener('click', () => {

        if ($file.files.length > 0) {

            uploadNonogram($file.files[0]).then(nono => {
                nono.solve();
                displayNonogram(nono);
            });

        }

    });

});
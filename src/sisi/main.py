import placements as plcmt

size = 10
blocks = [2, 7]

cell_states = plcmt.determine_cell_states(size, blocks)

for cell_state in cell_states:
    print({
        plcmt.CellState.FILLED: 'X',
        plcmt.CellState.EMPTY: 'O',
        plcmt.CellState.UNKNOWN: '_'
    }[cell_state], end=' ')
print()
class CellState:
    UNKNOWN = 1
    EMPTY = 2
    FILLED = 3
    
def determine_cell_states(size, blocks):
    
    placements = find_placements(size, blocks)
    counters = [0 for _ in range(size)]
    for plcmt in placements:
        for block_idx, offset in enumerate(plcmt):
            block_len = blocks[block_idx]
            for cell_idx in range(offset, offset + block_len):
                counters[cell_idx] += 1
    
    result = []
    num_plcmts = len(placements)
    
    for cnt in counters:
        if cnt == 0:
            result.append(CellState.EMPTY)
        elif cnt == num_plcmts:
            result.append(CellState.FILLED)
        else:
            result.append(CellState.UNKNOWN)
    
    return result


def find_placements(size, blocks):
    
    result = []
    if not blocks:
        return result
    
    _find_placements(size, blocks, [], result)
    
    return result

def _find_placements(size, blocks, offsets, result):
    
    if len(offsets) == len(blocks):
        result.append(offsets)
        return
    
    if offsets:
        last_offset = offsets[-1]
        last_block_idx = len(offsets) - 1
        start_offset = last_offset + blocks[last_block_idx] + 1
        curr_block_idx = last_block_idx + 1
    else:
        start_offset = 0
        curr_block_idx = 0
        
    remaining = blocks[curr_block_idx:]
    remaining_len = len(remaining) - 1 + sum(remaining)
    end_offset = size - remaining_len
    
    for offset in range(start_offset, end_offset+1):
        _find_placements(size, blocks, offsets + [offset], result)

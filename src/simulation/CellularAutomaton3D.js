export class CellularAutomaton3D {
    constructor(shape) {
        this.shape = shape;
        this.count = 1;
        this.shape.forEach(n => this.count *= n); 

        this.xyz_to_i_coefficients = [this.shape[0], this.shape[1]*this.shape[0]];
        this.cells = new Uint8Array(this.count);
        this.buffer = new Uint8Array(this.count);

        this.should_update = new Array(this.count);
        this.should_update.fill(false, 0, -1);

        this.listeners = new Set();
    }

    listen_step(listener) {
        return this.listeners.add(listener);
    }

    unlisten_step(listener) {
        return this.listeners.delete(listener);
    }

    clear() {
        this.cells.fill(0, 0, -1);
        this.buffer.fill(0, 0, -1);
        this.should_update.fill(false, 0, -1);

        for (let listener of this.listeners) 
            listener(this);
    }

    // O(n^3)
    refresh_updates(rule) {
        for (let x = 0; x < this.shape[0]; x++) {
            for (let y = 0; y < this.shape[1]; y++) {
                for (let z = 0; z < this.shape[2]; z++) {
                    let i = this.xyz_to_i(x, y, z);
                    if (this.cells[i] == rule.alive_state) {
                        this.update_neighbours(x, y, z);
                    }
                }
            }
        }
    }

    update_neighbours(x, y, z) {
        for (let xoff = -1; xoff <= 1; xoff++) {
            for (let yoff = -1; yoff <= 1; yoff++) {
                for (let zoff = -1; zoff <= 1; zoff++) {
                    const xn = this.pos_mod(x+xoff, this.shape[0]);
                    const yn = this.pos_mod(y+yoff, this.shape[1]);
                    const zn = this.pos_mod(z+zoff, this.shape[2]);
                    const i = this.xyz_to_i(xn, yn, zn);
                    this.should_update[i] = true;
                }
            }
        }
    }

    step(rule) {
        this.refresh_updates(rule);

        for (let x = 0; x < this.shape[0]; x++) {
            for (let y = 0; y < this.shape[1]; y++) {
                for (let z = 0; z < this.shape[2]; z++) {
                    let i = this.xyz_to_i(x, y, z);
                    let state = this.cells[i];
                    let neighbours = this.should_update[i] ? this.get_neighbours(x, y, z, rule) : 0;
                    let next_state = rule.get_next_state(state, neighbours);
                    this.buffer[i] = next_state; 
                    this.should_update[i] = false;
                }
            }
        }

        let tmp = this.cells;
        this.cells = this.buffer;
        this.buffer = tmp;

        for (let listener of this.listeners) {
            listener(this);
        }
    }

    get_neighbours(x, y, z, rule) {
        let total_neighbours = 0;

        for (let xoff = -1; xoff <= 1; xoff++) {
            for (let yoff = -1; yoff <= 1; yoff++) {
                for (let zoff = -1; zoff <= 1; zoff++) {
                    if (xoff === 0 && yoff === 0 && zoff === 0) 
                        continue;

                    const xn = this.pos_mod(x+xoff, this.shape[0]);
                    const yn = this.pos_mod(y+yoff, this.shape[1]);
                    const zn = this.pos_mod(z+zoff, this.shape[2]);
                    const i = this.xyz_to_i(xn, yn, zn);

                    const state = this.cells[i];

                    if (rule.is_neighbour(state)) {
                        total_neighbours += 1;
                    }
                }
            }
        }
    
        return total_neighbours;
    }

    xyz_to_i(x, y, z) {
        return x + y*this.xyz_to_i_coefficients[0] + z*this.xyz_to_i_coefficients[1];
    }

    pos_mod(n, m) {
        return ((n % m) + m) % m;
    }
};
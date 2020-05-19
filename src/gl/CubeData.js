function vertex_data(left, right, front, back, top, bottom) {
  return new Float32Array([
    left, bottom, front, 0, -1, 0,
    right, bottom, front, 0, -1, 0,
    left, top, front, 0, -1, 0,
    right, top, front, 0, -1, 0,

    left, top, front, 0, 1, 0,
    left, top, back, 0, 1, 0,
    right, top, back, 0, 1, 0,
    right, top, front, 0, 1, 0,

    right, top, front, 1, 0, 0,
    right, bottom, front, 1, 0, 0,
    right, bottom, back, 1, 0, 0,
    right, top, back, 1, 0, 0,

    left, top, front, -1, 0, 0,
    left, top, back, -1, 0, 0,
    left, bottom, front, -1, 0, 0,
    left, bottom, back, -1, 0, 0,

    left, bottom, front, 0, -1, 0,
    left, bottom, back, 0, -1, 0,
    right, bottom, back, 0, -1, 0,
    right, bottom, front, 0, -1, 0,

    left, top, back, 0, 0, -1,
    right, top, back, 0, 0, -1,
    left, bottom, back, 0, 0, -1,
    right, bottom, back, 0, 0, -1,
  ]);
}

// wind triangles counter clockwise for culling
const index_data = new Uint32Array([
    0, 3, 2,
    0, 1, 3,

    4, 6, 5,
    4, 7, 6,

    8, 9, 11,
    9, 10, 11,

    13, 14, 12,
    13, 15, 14,

    16, 18, 19,
    16, 17, 18,

    20, 21, 22,
    21, 23, 22,
]);


export const cube = {
    vertex_data: vertex_data,
    index_data: index_data
};
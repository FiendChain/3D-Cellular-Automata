import { Shader } from '../gl/Shader';
import { VertexBufferObject, VertexArrayObject, VertexBufferLayout } from '../gl/VertexBuffer';
import { IndexBuffer } from '../gl/IndexBuffer';
import { UniformMat4f, UniformVec3f, UniformVec4f } from '../gl/Uniform';

import { vec3, vec4 } from 'gl-matrix';

import border_shader from '../shaders/border';
import { BoundingBox } from './BoundingBox';

export class Border {
  constructor(gl, size, renderer, camera) {
    this.gl = gl;
    this.renderer = renderer;
    this.camera = camera;

    let thickness = 0.2;
    let offset = 0.5;
    let adjusted_size = vec3.create();
    vec3.add(adjusted_size, size, vec3.fromValues(2*offset, 2*offset, 2*offset));
    let offset_vec = vec3.fromValues(-offset, -offset, -offset);

    this.border = new BoundingBox(adjusted_size, thickness);

    this.shader = new Shader(gl, border_shader.vertex, border_shader.frag);
    this.vbo = new VertexBufferObject(gl, this.border.vertex_data, gl.STATIC_DRAW);
    this.index_buffer = new IndexBuffer(gl, this.border.index_data);

    let layout = new VertexBufferLayout(gl);
    layout.push_attribute(0, 3, gl.FLOAT, false);
    layout.push_attribute(1, 3, gl.FLOAT, false);

    this.vao = new VertexArrayObject(gl);
    this.vao.add_vertex_buffer(this.vbo, layout);

    this.shader.add_uniform("uModel", new UniformMat4f(gl, this.camera.model));
    this.shader.add_uniform("uView", new UniformMat4f(gl, this.camera.view));
    this.shader.add_uniform("uProjection", new UniformMat4f(gl, this.camera.projection));
    // this.shader.add_uniform("uColour", new UniformVec4f(gl, vec4.fromValues(0, 0, 0, 1)));
    this.shader.add_uniform("uColour", new UniformVec4f(gl, vec4.fromValues(0, 0, 0, 1)));
    this.shader.add_uniform("uOffset", new UniformVec3f(gl, offset_vec));
  }

  on_render() {
    this.renderer.draw(this.vao, this.index_buffer, this.shader);
  }
}
import { Shader } from '../../gl/Shader';
import { VertexBufferObject, VertexArrayObject, VertexBufferLayout } from '../../gl/VertexBuffer';
import { IndexBuffer } from '../../gl/IndexBuffer';
import { UniformMat4f, UniformVec3f, Uniform } from '../../gl/Uniform';

import { vec3 } from 'gl-matrix';

import border_shader from './shaders/border';
import { BoundingBox } from './BoundingBox';
import { Color } from '../../ui/util/AdjustableValues';

export class Border {
  constructor(gl, size, camera) {
    this.gl = gl;

    this.camera = camera;
    this.colour = new Color([0,0,0], "Border Colour");
    this.shader = new Shader(gl, border_shader.vertex, border_shader.frag);
    this.bind_uniforms(); 

    this.size = size;
    this.set_size(this.size.value);
    this.size.listen(size => this.set_size(size.value));

  }

  set_size(size) {
    const gl = this.gl;

    let thickness = 0.2;
    let offset = 0.5;

    let adjusted_size = vec3.create();
    vec3.add(adjusted_size, size, vec3.fromValues(2*offset, 2*offset, 2*offset));
    this.offset_vec = vec3.fromValues(-offset, -offset, -offset);

    this.border = new BoundingBox(adjusted_size, thickness);

    this.vbo = new VertexBufferObject(gl, this.border.vertex_data, gl.STATIC_DRAW);
    this.index_buffer = new IndexBuffer(gl, this.border.index_data);

    let layout = new VertexBufferLayout(gl);
    layout.push_attribute(0, 3, gl.FLOAT, false);
    layout.push_attribute(1, 3, gl.FLOAT, false);

    this.vao = new VertexArrayObject(gl);
    this.vao.add_vertex_buffer(this.vbo, layout);
    this.shader.add_uniform("uOffset", new UniformVec3f(gl, this.offset_vec));
  }

  bind_uniforms() {
    let gl = this.gl;

    this.shader.add_uniform("uModel", new UniformMat4f(gl, this.camera.model));
    this.shader.add_uniform("uView", new UniformMat4f(gl, this.camera.view));
    this.shader.add_uniform("uProjection", new UniformMat4f(gl, this.camera.projection));
    // this.shader.add_uniform("uColour", new UniformVec4f(gl, vec4.fromValues(0, 0, 0, 1)));
    // this.shader.add_uniform("uColour", new UniformVec4f(gl, vec4.fromValues(0, 0, 0, 1)));
    this.shader.add_uniform("uColour", new Uniform(loc => {
      let c = this.colour.value;
      gl.uniform4f(loc, c[0]/255, c[1]/255, c[2]/255, 1.0);
    }));
  }

  on_render() {
    let gl = this.gl;
    this.shader.bind();
    this.vao.bind();
    this.index_buffer.bind();

    gl.drawElements(gl.TRIANGLES, this.index_buffer.count, gl.UNSIGNED_INT, 0);
  }
}
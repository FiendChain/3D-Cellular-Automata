import { Renderer } from "./Renderer";

import { VertexBufferObject, VertexArrayObject, VertexBufferLayout } from '../../../gl/VertexBuffer';
import { Shader } from "../../../gl/Shader";
import { UniformVec3f, Uniform } from "../../../gl/Uniform";
import { IndexBuffer } from "../../../gl/IndexBuffer";
import { cube } from "../../../gl/CubeData";

import { Toggle, Slider, Dropdown, Color } from "../../../ui/util/AdjustableValues";
import { fragment_shader_src } from "../shaders/fragment_shader";
import { vertex_shader_src } from "../shaders/vertex_shader";

import { vec3 } from "gl-matrix";


export class VoxelRenderer extends Renderer {
    constructor(gl, props, params) {
        super(gl, props, {});
        this.shading_params = {
            ambient_strength: new Slider(0, 1, 0.4, "Amount of global lighting"),
            diffuse_strength: new Slider(0, 1, 0.95, "Amount of light scattering"),
            specular_strength: new Slider(0, 1, 0.6, "Amount of light reflection"),
            specular_power_factor: new Slider(0, 128.0, 4.0, "Strength of the light reflection"),
            scaling_enabled: new Toggle(0, "Change size of cell depending on its value (state or total neighbours)"),
            fog_near: new Slider(0, 1, 0, "Minimum distance of fog"),
            fog_far: new Slider(0, 1, 0, "Maximum distance of fog"),
            sun_strength: new Slider(0, 1, 0.95, "Strength of the sun"),
            sky_strength: new Slider(0, 1, 0.25, "Strength of sky lighting"),
            brightness: new Slider(0, 1, 1.0, "Amount of global lighting"),
            occlusion: new Slider(0, 1, 0.0, "Amount nearby cells darken the center cell"),
            light_colour: new Color(vec3.fromValues(255, 255, 255), "Colour of sun"),
        };

        this.global_params = {
            ...params,
            shading: new Dropdown(Object.keys(fragment_shader_src), 0, "Different methods of rendering"),
        };

        this.shading_keys = {
          basic: ['occlusion', 'sun_strength', 'sky_strength', 'fog_near', 'fog_far', 'light_colour', 'scaling_enabled'],
          basic_alternate: ['occlusion', 'ambient_strength', 'diffuse_strength', 'specular_strength', 'specular_power_factor', 'light_colour', 'scaling_enabled'],
          no_shading: ['occlusion', 'brightness', 'scaling_enabled']
        };

        this.update_props({
            light_position: vec3.create()
        });
        [this.vao, this.ibo, this.index_data] = create_cube_data(gl);
        this.create_shader();
        this.params.colouring.listen(() => this.create_shader());
        this.params.shading.listen(() => this.create_shader());
    }

    create_shader() {
        this.load_params();
        let colour = this.global_params.colouring.current_option;
        let shading = this.global_params.shading.current_option;
        let vert_src = vertex_shader_src[colour](false);
        let frag_src = fragment_shader_src[shading](false);
        this.shader = new Shader(this.gl, vert_src, frag_src);
        this.add_uniforms(this.shader);
    }

    // depending on shading type, we get different parameters to configure
    load_params() {
        let params = {};
        let shading = this.global_params.shading.current_option;
        let keys = this.shading_keys[shading];
        for (let key of keys) {
            params[key] = this.shading_params[key];
        }
        this.params = {...this.global_params, ...params};
    }

    add_uniforms(shader) {
        super.add_uniforms(shader);
        let gl = this.gl;
        // lighting
        shader.add_uniform('light.position', new UniformVec3f(gl, this.props.light_position));
        shader.add_uniform('light.colour', new Uniform(loc => {
            let c = this.shading_params.light_colour.value;
            gl.uniform3f(loc, c[0]/255, c[1]/255, c[2]/255);
        }));
        shader.add_uniform('uSunColour', new Uniform(loc => {
            let c = this.shading_params.light_colour.value;
            gl.uniform3f(loc, c[0]/255, c[1]/255, c[2]/255);
        }))
        // // lighting params
        shader.add_uniform("uAmbientStrength", new Uniform(loc => gl.uniform1f(loc, this.params.ambient_strength.value)));
        shader.add_uniform("uDiffuseStrength", new Uniform(loc => gl.uniform1f(loc, this.params.diffuse_strength.value)));
        shader.add_uniform("uSpecularStrength", new Uniform(loc => gl.uniform1f(loc, this.params.specular_strength.value)));
        shader.add_uniform("uSpecularPowerFactor", new Uniform(loc => gl.uniform1f(loc, this.params.specular_power_factor.value)));
        shader.add_uniform("uBrightness", new Uniform(loc => gl.uniform1f(loc, this.params.brightness.value)));
        shader.add_uniform("uOcclusion", new Uniform(loc => gl.uniform1f(loc, this.params.occlusion.value)));
        // post processing
        shader.add_uniform("uScalingEnabled", new Uniform(loc => gl.uniform1i(loc, this.params.scaling_enabled.value)));
        shader.add_uniform("uFogNear", new Uniform(loc => gl.uniform1f(loc, this.params.fog_near.value)));
        shader.add_uniform("uFogFar", new Uniform(loc => gl.uniform1f(loc, this.params.fog_far.value)));
        shader.add_uniform("uSunStrength", new Uniform(loc => gl.uniform1f(loc, this.params.sun_strength.value)));
        shader.add_uniform("uSkyStrength", new Uniform(loc => gl.uniform1f(loc, this.params.sky_strength.value)));
    }

    bind() {
        this.shader.bind();
        this.vao.bind();
        this.ibo.bind();
    }

    on_render() {
        let gl = this.gl;
        let [x, y, z] = this.props.size.value;
        let total_cells = x*y*z;
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.drawElementsInstanced(gl.TRIANGLES, this.ibo.count, gl.UNSIGNED_INT, this.index_data, total_cells); 
    }
}

const create_cube_data = (gl) => {
  let layout = new VertexBufferLayout(gl);
  layout.push_attribute(0, 3, gl.FLOAT, false);
  layout.push_attribute(1, 3, gl.FLOAT, false);

  let vertex_data = cube.vertex_data(0, 1, 1, 0, 1, 0);
  let index_data = cube.index_data;

  let vbo = new VertexBufferObject(gl, vertex_data, gl.STATIC_DRAW);
  let ibo = new IndexBuffer(gl, index_data);

  let vao = new VertexArrayObject(gl);
  vao.add_vertex_buffer(vbo, layout);

  return [vao, ibo, index_data];
}
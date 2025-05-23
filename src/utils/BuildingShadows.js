import SunCalc from "suncalc";

export default class BuildingShadows {
  constructor(date) {
    this.date = date;
    this.id = "building-shadows";
    this.type = "custom";
  }

  setDate(date) {
    this.date = date;
  }

  onAdd(map, gl) {
    this.map = map;
    const vertexSource = `
        uniform mat4 u_matrix;
        uniform float u_height_factor;
        uniform float u_altitude;
        uniform float u_azimuth;
        attribute vec4 a_pos_normal_ed;
        attribute lowp vec2 a_base;
        attribute lowp vec2 a_height;
        void main() {
            float base = max(0.0, a_base.x);
            float height = max(0.0, a_height.x);
            vec4 pos_nx = floor(a_pos_normal_ed * 0.5);
            vec4 top_up_ny_start = a_pos_normal_ed - 2.0 * pos_nx;
            vec3 top_up_ny = top_up_ny_start.xyz;
            float t = top_up_ny.x;
            vec4 pos = vec4(pos_nx.xy, t > 0.0 ? height : base, 1);
            float len = pos.z * u_height_factor / tan(u_altitude);
            pos.x += cos(u_azimuth) * len;
            pos.y += sin(u_azimuth) * len;
            pos.z = 0.0;
            gl_Position = u_matrix * pos;
        }
        `;
    const fragmentSource = `
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        `;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    gl.validateProgram(this.program);
    this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");
    this.uHeightFactor = gl.getUniformLocation(this.program, "u_height_factor");
    this.uAltitude = gl.getUniformLocation(this.program, "u_altitude");
    this.uAzimuth = gl.getUniformLocation(this.program, "u_azimuth");
    this.aPosNormalEd = gl.getAttribLocation(this.program, "a_pos_normal_ed");
    this.aBase = gl.getAttribLocation(this.program, "a_base");
    this.aHeight = gl.getAttribLocation(this.program, "a_height");
    this.compileOpacityProgram(map, gl);
  }

  compileOpacityProgram(map, gl) {
    const vertexSource = `
        attribute vec2 a_pos;
        varying vec2 v_pos;
        void main() {
            // texture vector position, range 0.0 - 1.0
            v_pos = a_pos * 0.5 + 0.5;
            gl_Position = vec4(a_pos, 0, 1);
        }
        `;
    const fragmentSource = `
        precision mediump float;
        uniform sampler2D u_tex;
        uniform float u_alt;
        uniform vec4 u_shadeColor;
        varying vec2 v_pos;
        void main() {
            if (u_alt < 0.0) {
                gl_FragColor = u_shadeColor;
            } else {
                vec4 color = texture2D(u_tex, v_pos);
                if (color == vec4(0, 0, 0, 0)) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                } else {
                    gl_FragColor = u_shadeColor;
                }
            }
        }
        `;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    this.opacityProgram = gl.createProgram();
    gl.attachShader(this.opacityProgram, vertexShader);
    gl.attachShader(this.opacityProgram, fragmentShader);
    gl.linkProgram(this.opacityProgram);
    gl.validateProgram(this.opacityProgram);
    // if (!gl.getProgramParameter(this.opacityProgram, gl.LINK_STATUS)) {
    //     console.error('Link failed: ' + gl.getProgramInfoLog(this.opacityProgram));
    //     console.error('vs info-log: ' + gl.getShaderInfoLog(vertexShader));
    //     console.error('fs info-log: ' + gl.getShaderInfoLog(fragmentShader));
    // }
    this.aPos = gl.getAttribLocation(this.opacityProgram, "a_pos");
    this.uTex = gl.getUniformLocation(this.opacityProgram, "u_tex");
    this.uAlt = gl.getUniformLocation(this.opacityProgram, "u_alt");
    this.uMatrix2 = gl.getUniformLocation(this.opacityProgram, "u_matrix");
    this.shadeColor = gl.getUniformLocation(
      this.opacityProgram,
      "u_shadeColor"
    );
    const [x, y, vWidth, vHeight] = gl.getParameter(gl.VIEWPORT);

    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const screen = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, screen, gl.STATIC_DRAW);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      vWidth,
      vHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.fb = gl.createFramebuffer();
    this.attachmentPoint = gl.COLOR_ATTACHMENT0;
  }

  render(gl, matrix) {
    // first pass: render opaque shadows to render buffer
    // can't make shadows transparent in first pass because they
    // stack on top of each other
    gl.useProgram(this.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.activeTexture(gl.TEXTURE_0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      this.attachmentPoint,
      gl.TEXTURE_2D,
      this.tex,
      0
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    const source = this.map.style._sourceCaches["other:composite"];
    const coords = source.getVisibleCoordinates().reverse();
    const buildingsLayer = this.map.getLayer("3d-buildings");
    const context = this.map.painter.context;
    const { lng, lat } = this.map.getCenter();
    const pos = SunCalc.getPosition(this.date, lat, lng);
    gl.uniform1f(this.uAltitude, pos.altitude);
    gl.uniform1f(this.uAzimuth, pos.azimuth + (3 * Math.PI) / 2);
    this.map.setLights([
      {
        id: "sunlight",
        anchor: "map",
        type: "flat",
        properties: {
          color: pos.altitude < 0 ? "#999" : "#fdb",
          position: [
            1.5,
            180 + (pos.azimuth * 180) / Math.PI,
            90 - (pos.altitude * 180) / Math.PI,
          ],
        },
      },
    ]);
    this.opacity = Math.sin(Math.max(pos.altitude, 0)) * 0.9;
    for (const coord of coords) {
      const tile = source.getTile(coord);
      const bucket = tile.getBucket(buildingsLayer);
      if (!bucket) continue;
      const [heightBuffer, baseBuffer] =
        bucket.programConfigurations.programConfigurations["3d-buildings"]
          ._buffers;
      gl.uniformMatrix4fv(this.uMatrix, false, coord.projMatrix);
      gl.uniformMatrix4fv(this.uMatrix2, false, coord.projMatrix);
      gl.uniform1f(
        this.uHeightFactor,
        Math.pow(2, coord.overscaledZ) / tile.tileSize / 8
      );
      for (const segment of bucket.segments.get()) {
        const numPrevAttrib = context.currentNumAttributes || 0;
        const numNextAttrib = 2;
        for (let i = numNextAttrib; i < numPrevAttrib; i++)
          gl.disableVertexAttribArray(i);
        const vertexOffset = segment.vertexOffset || 0;
        gl.enableVertexAttribArray(this.aPosNormalEd);
        gl.enableVertexAttribArray(this.aHeight);
        gl.enableVertexAttribArray(this.aBase);
        bucket.layoutVertexBuffer.bind();
        gl.vertexAttribPointer(
          this.aPosNormalEd,
          4,
          gl.SHORT,
          false,
          8,
          8 * vertexOffset
        );
        heightBuffer.bind();
        gl.vertexAttribPointer(
          this.aHeight,
          1,
          gl.FLOAT,
          false,
          4,
          4 * vertexOffset
        );
        baseBuffer.bind();
        gl.vertexAttribPointer(
          this.aBase,
          1,
          gl.FLOAT,
          false,
          4,
          4 * vertexOffset
        );
        bucket.indexBuffer.bind();
        context.currentNumAttributes = numNextAttrib;
        gl.drawElements(
          gl.TRIANGLES,
          segment.primitiveLength * 3,
          gl.UNSIGNED_SHORT,
          segment.primitiveOffset * 3 * 2
        );
      }
    }

    // second pass
    // take initial rendering from framebuffer and re-render with custom color and transparency
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.opacityProgram);
    gl.uniform1f(this.uAlt, pos.altitude);
    gl.uniform4fv(this.shadeColor, new Float32Array([0, 0, 0, 0.6]));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

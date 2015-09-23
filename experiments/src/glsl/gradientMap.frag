            varying vec2 vUv;

            uniform sampler2D tOne;
            uniform sampler2D tGrade;

            void main() {
                vec4 texOne = texture2D(tOne, vUv);
                vec4 texTwo = texture2D(tGrade, vUv);

                float maxLength  = length(vec3(1.0));
                vec2 uv          = vec2(length(texOne.rgb) / maxLength, .5);
                vec3 color   = texture2D(tGrade, uv).rgb;
                vec3 mixx = mix(texOne.rgb, color, .5);
                gl_FragColor = vec4(mixx.rgb, 1.0);
            }
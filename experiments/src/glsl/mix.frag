            varying vec2 vUv;

            uniform float uThreshold;
            uniform float uMixRatio;

            uniform sampler2D tOne;
            uniform sampler2D tTwo;
            uniform sampler2D tMix;

            void main() {
                vec4 texOne = texture2D(tOne, vUv);
                vec4 texTwo = texture2D(tTwo, vUv);
                vec4 texMix = texture2D(tMix, vUv);

                vec4 transitionTexel = texture2D( tMix, vUv );
                float r = uMixRatio * (1.0 + uThreshold * 2.0) - uThreshold;
                float mixf=clamp((transitionTexel.r - r)*(1.0/uThreshold), 0.0, 1.0);
                gl_FragColor = mix( texOne, texTwo, mixf );
               // gl_FragColor = texOne;
            }
			/*
			** Hue, saturation, luminance
			*/
			
			vec3 RGBToHSL(vec3 color)
			{
				vec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)
				
				float fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB
				float fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB
				float delta = fmax - fmin;             //Delta RGB value
			
				hsl.z = (fmax + fmin) / 2.0; // Luminance
			
				if (delta == 0.0)		//This is a gray, no chroma...
				{
					hsl.x = 0.0;	// Hue
					hsl.y = 0.0;	// Saturation
				}
				else                                    //Chromatic data...
				{
					if (hsl.z < 0.5)
						hsl.y = delta / (fmax + fmin); // Saturation
					else
						hsl.y = delta / (2.0 - fmax - fmin); // Saturation
					
					float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
					float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
					float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;
			
					if (color.r == fmax )
						hsl.x = deltaB - deltaG; // Hue
					else if (color.g == fmax)
						hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
					else if (color.b == fmax)
						hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue
			
					if (hsl.x < 0.0)
						hsl.x += 1.0; // Hue
					else if (hsl.x > 1.0)
						hsl.x -= 1.0; // Hue
				}
			
				return hsl;
			}

			vec3 rgb2hsv(vec3 rgb)
			{
				float Cmax = max(rgb.r, max(rgb.g, rgb.b));
				float Cmin = min(rgb.r, min(rgb.g, rgb.b));
			    float delta = Cmax - Cmin;

				vec3 hsv = vec3(0., 0., Cmax);
				
				if (Cmax > Cmin)
				{
					hsv.y = delta / Cmax;

					if (rgb.r == Cmax)
						hsv.x = (rgb.g - rgb.b) / delta;
					else
					{
						if (rgb.g == Cmax)
							hsv.x = 2. + (rgb.b - rgb.r) / delta;
						else
							hsv.x = 4. + (rgb.r - rgb.g) / delta;
					}
					hsv.x = fract(hsv.x / 6.);
				}
				return hsv;
			}

			float chromaVal(vec3 color, vec3 keyColor, float tolerance, float slope)
			{
				float d = abs(length(abs(keyColor - color)));
				float edge0 = tolerance * (1.0 - slope);
				float alpha = smoothstep(edge0, tolerance, d);
				return 1. - alpha;
			}
			
			

			vec3 changeSaturation(vec3 color, float saturation)
			{
				float luma = dot(vec3(0.2125, 0.7154, 0.0721) * color, vec3(1.));
				return mix(vec3(luma), color, saturation);
			}
			
			vec3 Desaturate(vec3 color, float Desaturation)
			{
				vec3 grayXfer = vec3(0.3, 0.59, 0.11);
				vec3 gray = vec3(dot(grayXfer, color));
				return vec3(mix(color, gray, Desaturation));
			}
			
			
			// define our varying texture coordinates
			varying vec2 texcoord0;
			uniform sampler2DRect tex0;		
			uniform float saturation;
			uniform float contrast;
			uniform float desaturate;
			uniform float brightness;
			
			uniform float iWidth;
			uniform float iHeight;
			
			//luma threshold
			//uniform vec2 lum;
			//uniform texture2DRect tex1;

			//const float3 lumCoeff = float3(0.2125, 0.7154, 0.0721);

			void main (void)
			{
				
				vec2 iRes = vec2(iWidth, iHeight);
				vec2 uv = texcoord0.xy / iRes.xy;
				vec3 color = texture2DRect(tex0, texcoord0).rgb;	
				color = changeSaturation(color, saturation);
				color = Desaturate(color, desaturate);
				//float ff = chromaKeyAlphaTwoFloat(color, vec3(color_r,color_g,color_b), clampTol,slope);
				
		       	color = (color - 0.5) *(contrast + 1.0) + 0.5;  
		        color = color + brightness;      
				
				gl_FragColor = vec4(color, 1.);
		
			}
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

class Bundestag {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  // Define the base configuration as a static property or method
  static baseConfig = {
    seed: 1,
    steps: 20,
    width: 1024,
    height: 1024,
    cfgScale: 7,
    samplerName: "Euler a",
  };

  // Static method to adapt baseConfig for image generation
  static getImageConfig() {
    const { seed, steps, width, height, cfgScale, samplerName } = this.baseConfig;
    return {
      seed,
      steps,
      width: width,
      height: height,
      cfg_scale: cfgScale,
      sampler_name: samplerName,
    };
  }

  // Static method to adapt baseConfig for video generation
  static getVideoConfig() {
    const { seed, steps, width, height, cfgScale, samplerName } = this.baseConfig;
    return {
      seed,
      steps,
      W: width,
      H: height,
      cfg_scale_schedule: "0: (" + cfgScale + ")",
      sampler: samplerName, // Adjust the key name as per your API's requirement
    };
  }

  async getLastImagePathFromPreviousBatch(nextBatchNumber) {
    if (nextBatchNumber <= 1) {
        console.log("No previous batch exists for BT_0001.");
        return null; // Early return as there's no previous batch for BT_0001
    }

    const prevBatchNumber = nextBatchNumber - 1;
    const prevBatchFolderName = `BT_${String(prevBatchNumber).padStart(4, '0')}`;
    const prevBatchFolderPath = path.join(this.outputDir, prevBatchFolderName);

    try {
        const files = await fs.promises.readdir(prevBatchFolderPath);
        const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i)).sort();
        if (imageFiles.length === 0) {
            console.log(`No image files found in ${prevBatchFolderPath}.`);
            return null;
        }
        const lastImageFile = imageFiles[imageFiles.length - 1];
        return path.join(prevBatchFolderPath, lastImageFile);
    } catch (error) {
        console.error(`Error accessing previous batch folder: ${prevBatchFolderPath}`, error);
        return null;
    }
  }

  async getNextBatchNumber() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.outputDir, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        const batchNumbers = files
          .map(file => file.match(/^BT_(\d+)$/))
          .filter(result => result !== null)
          .map(result => parseInt(result[1], 10))
          .sort((a, b) => a - b);

        const nextBatchNumber = batchNumbers.length > 0 ? Math.max(...batchNumbers) + 1 : 1;
        resolve(nextBatchNumber);
      });
    });
  }

  async readSecondLastPrompt(nextBatchNumber) {
    if (nextBatchNumber <= 1) {
        // If this is the first batch, there's no previous batch to read from.
        console.log("Generating BT_0001: No previous prompts to fetch because this is the first batch.");
        return false;
    }

    // Calculate the target folder name based on the current batch number.
    const targetBatchNumber = nextBatchNumber - 1;
    const targetFolderName = `BT_${String(targetBatchNumber).padStart(4, '0')}`;
    console.log(`Attempting to read prompts from: ${targetFolderName}`);

    // Construct the path to the target folder.
    const targetFolderPath = path.join(this.outputDir, targetFolderName);
    const txtFiles = fs.readdirSync(targetFolderPath)
        .filter(file => path.extname(file).toLowerCase() === '.txt');

    if (txtFiles.length === 0) {
        console.log(`No .txt file found in ${targetFolderName}.`);
        return false;
    }

    // Assume the first txt file is the correct one to read from.
    const promptsFilePath = path.join(targetFolderPath, txtFiles[0]);
    try {
        const promptsContent = fs.readFileSync(promptsFilePath, 'utf-8');
        const promptsJson = JSON.parse(promptsContent);

        if (promptsJson.prompts) {
            // Assuming the structure contains a "prompts" key.
            const keys = Object.keys(promptsJson.prompts);
            if (keys.length < 2) {
                console.log(`Not enough prompts in ${targetFolderName} to fetch the second one.`);
                return false;
            }
            // Fetch the second prompt.
            const secondPromptKey = keys[1]; // Use the second key in the list.
            const secondPrompt = promptsJson.prompts[secondPromptKey];
            console.log(`In ${targetFolderName}, the second prompt is "${secondPrompt}"`);
            return secondPrompt;
        } else {
            console.log(`Prompts object not found in ${targetFolderName}.`);
            return false;
      }
    } catch (error) {
      console.error(`Error reading or parsing the prompts file in ${targetFolderName}:`, error);
      return false;
    }
  }

  async generateBundestag(parameters) {
    try {
      const nextBatchNumber = await this.getNextBatchNumber();
      let useInit = false; // Default to false, will be updated for batches after BT_0001
      let initImagePath = null; // Default to null, will be updated for batches after BT_0001
      let prompts = parameters.deforum_settings?.prompts || {};
  
      // Handle prompts for BT_0001 specifically
      if (nextBatchNumber === 1) {
        // Find the second prompt's key assuming the keyframe or any prompt is the one to duplicate
        const secondPromptKey = Object.keys(prompts).sort((a, b) => parseInt(a) - parseInt(b))[1] || "0"; // Fallback to "0" if not found
        const secondPromptValue = prompts[secondPromptKey];
        prompts["0"] = secondPromptValue; // Ensure the first prompt has the value of the second prompt
        // Update any other key to have the same value as the second prompt
        for (const key in prompts) {
          prompts[key] = secondPromptValue;
        }
      } else {
        // Logic for batches after BT_0001
        if (await this.getLastImagePathFromPreviousBatch(nextBatchNumber)) {
          useInit = true;
          initImagePath = await this.getLastImagePathFromPreviousBatch(nextBatchNumber);
        }
        const secondLastPrompt = await this.readSecondLastPrompt(nextBatchNumber);
        if (secondLastPrompt !== false) {
          prompts["0"] = secondLastPrompt;
        }
      }
  
      const batchName = `BT_${String(nextBatchNumber).padStart(4, '0')}`;
      console.log(`Processing for batch: ${batchName}`);
  
      const videoConfig = Bundestag.getVideoConfig();

      const modifiedParameters = {
        ...parameters,
        deforum_settings: {
          ...parameters.deforum_settings,
          ...videoConfig,
          prompts,
          batch_name: batchName,
          use_init: useInit,
          init_image: initImagePath,
          // Changed
          "color_coherence": "LAB",
          "strength": 0.7, // Init IMAGE strength, but it also influences the general strength
          "strength_schedule": "0: (0.7)", // General strength
          "diffusion_cadence": 3,
          "optical_flow_cadence": "RAFT",
          "animation_mode": "3D",
          "translation_x": "0: (0)",
          "translation_y": "0: (0)",
          "translation_z": "0: (0.5)",
          "transform_center_x": "0: (0.5)",
          "transform_center_y": "0: (0.5)",
          "rotation_3d_x": "0: (0)",
          "rotation_3d_y": "0: (0)",
          "rotation_3d_z": "0: (0)",
          "fov_schedule": "0: (70)",
          "fps": 15,
          // from here on unchanged
          "show_info_on_ui": true,
          "tiling": false,
          "restore_faces": false,
          "seed_resize_from_w": 0,
          "seed_resize_from_h": 0,
          "seed_behavior": "iter",
          "seed_iter_N": 1,
          "strength_0_no_init": true,
          "use_mask": false,
          "use_alpha_as_mask": false,
          "mask_file": "https://deforum.github.io/a1/M1.jpg",
          "invert_mask": false,
          "mask_contrast_adjust": 1.0,
          "mask_brightness_adjust": 1.0,
          "overlay_mask": true,
          "mask_overlay_blur": 4,
          "fill": 1,
          "full_res_mask": true,
          "full_res_mask_padding": 4,
          "reroll_blank_frames": "ignore",
          "reroll_patience": 10.0,
          "motion_preview_mode": false,
          "positive_prompts": "",
          "negative_prompts": "",
          "border": "replicate",
          "angle": "0: (0)",
          "zoom": "0: (1.0025+0.002*sin(1.25*3.14*t/30))",
          "enable_perspective_flip": false,
          "perspective_flip_theta": "0: (0)",
          "perspective_flip_phi": "0: (0)",
          "perspective_flip_gamma": "0: (0)",
          "perspective_flip_fv": "0: (53)",
          "noise_schedule": "0: (0.065)",
          "contrast_schedule": "0: (1.0)",
          "enable_steps_scheduling": false,
          "steps_schedule": "0: (25)",
          "aspect_ratio_schedule": "0: (1)",
          "aspect_ratio_use_old_formula": false,
          "near_schedule": "0: (200)",
          "far_schedule": "0: (10000)",
          "seed_schedule": "0:(s), 1:(-1), \"max_f-2\":(-1), \"max_f-1\":(s)",
          "pix2pix_img_cfg_scale_schedule": "0:(1.5)",
          "enable_subseed_scheduling": false,
          "subseed_schedule": "0: (1)",
          "subseed_strength_schedule": "0: (0)",
          "enable_sampler_scheduling": false,
          "sampler_schedule": "0: (\"Euler a\")",
          "use_noise_mask": false,
          "mask_schedule": "0: (\"{video_mask}\")",
          "noise_mask_schedule": "0: (\"{video_mask}\")",
          "enable_checkpoint_scheduling": false,
          "checkpoint_schedule": "0: (\"model1.ckpt\"), 100: (\"model2.safetensors\")",
          "enable_clipskip_scheduling": false,
          "clipskip_schedule": "0: (2)",
          "enable_noise_multiplier_scheduling": true,
          "noise_multiplier_schedule": "0: (1.05)",
          "resume_from_timestring": false,
          "resume_timestring": "20230129210106",
          "enable_ddim_eta_scheduling": false,
          "ddim_eta_schedule": "0: (0)",
          "enable_ancestral_eta_scheduling": false,
          "ancestral_eta_schedule": "0: (1)",
          "amount_schedule": "0: (0.1)",
          "kernel_schedule": "0: (5)",
          "sigma_schedule": "0: (1)",
          "threshold_schedule": "0: (0)",
          "color_coherence_image_path": "",
          "color_coherence_video_every_N_frames": 1,
          "color_force_grayscale": false,
          "legacy_colormatch": false,
          "cadence_flow_factor_schedule": "0: (1)",
          "optical_flow_redo_generation": "None",
          "redo_flow_factor_schedule": "0: (1)",
          "diffusion_redo": "0",
          "noise_type": "perlin",
          "perlin_octaves": 4,
          "perlin_persistence": 0.5,
          "use_depth_warping": true,
          "depth_algorithm": "Midas-3-Hybrid",
          "midas_weight": 0.2,
          "padding_mode": "border",
          "sampling_mode": "bicubic",
          "save_depth_maps": false,
          "video_init_path": "https://deforum.github.io/a1/V1.mp4",
          "extract_nth_frame": 1,
          "extract_from_frame": 0,
          "extract_to_frame": -1,
          "overwrite_extracted_frames": false,
          "use_mask_video": false,
          "video_mask_path": "https://deforum.github.io/a1/VM1.mp4",
          "hybrid_comp_alpha_schedule": "0:(0.5)",
          "hybrid_comp_mask_blend_alpha_schedule": "0:(0.5)",
          "hybrid_comp_mask_contrast_schedule": "0:(1)",
          "hybrid_comp_mask_auto_contrast_cutoff_high_schedule": "0:(100)",
          "hybrid_comp_mask_auto_contrast_cutoff_low_schedule": "0:(0)",
          "hybrid_flow_factor_schedule": "0:(1)",
          "hybrid_generate_inputframes": false,
          "hybrid_generate_human_masks": "None",
          "hybrid_use_first_frame_as_init_image": true,
          "hybrid_motion": "None",
          "hybrid_motion_use_prev_img": false,
          "hybrid_flow_consistency": false,
          "hybrid_consistency_blur": 2,
          "hybrid_flow_method": "RAFT",
          "hybrid_composite": "None",
          "hybrid_use_init_image": false,
          "hybrid_comp_mask_type": "None",
          "hybrid_comp_mask_inverse": false,
          "hybrid_comp_mask_equalize": "None",
          "hybrid_comp_mask_auto_contrast": false,
          "hybrid_comp_save_extra_frames": false,
          "parseq_manifest": "",
          "parseq_use_deltas": true,
          "parseq_non_schedule_overrides": true,
          "use_looper": false,
          "init_images": "{\n    \"0\": \"https://deforum.github.io/a1/Gi1.png\",\n    \"max_f/4-5\": \"https://deforum.github.io/a1/Gi2.png\",\n    \"max_f/2-10\": \"https://deforum.github.io/a1/Gi3.png\",\n    \"3*max_f/4-15\": \"https://deforum.github.io/a1/Gi4.jpg\",\n    \"max_f-20\": \"https://deforum.github.io/a1/Gi1.png\"\n}",
          "image_strength_schedule": "0:(0.75)",
          "blendFactorMax": "0:(0.35)",
          "blendFactorSlope": "0:(0.25)",
          "tweening_frames_schedule": "0:(20)",
          "color_correction_factor": "0:(0.075)",
          "cn_1_overwrite_frames": true,
          "cn_1_vid_path": "",
          "cn_1_mask_vid_path": "",
          "cn_1_enabled": false,
          "cn_1_low_vram": false,
          "cn_1_pixel_perfect": false,
          "cn_1_module": "none",
          "cn_1_model": "None",
          "cn_1_weight": "0:(1)",
          "cn_1_guidance_start": "0:(0.0)",
          "cn_1_guidance_end": "0:(1.0)",
          "cn_1_processor_res": 64,
          "cn_1_threshold_a": 64,
          "cn_1_threshold_b": 64,
          "cn_1_resize_mode": "Inner Fit (Scale to Fit)",
          "cn_1_control_mode": "Balanced",
          "cn_1_loopback_mode": false,
          "cn_2_overwrite_frames": true,
          "cn_2_vid_path": "",
          "cn_2_mask_vid_path": "",
          "cn_2_enabled": false,
          "cn_2_low_vram": false,
          "cn_2_pixel_perfect": false,
          "cn_2_module": "none",
          "cn_2_model": "None",
          "cn_2_weight": "0:(1)",
          "cn_2_guidance_start": "0:(0.0)",
          "cn_2_guidance_end": "0:(1.0)",
          "cn_2_processor_res": 64,
          "cn_2_threshold_a": 64,
          "cn_2_threshold_b": 64,
          "cn_2_resize_mode": "Inner Fit (Scale to Fit)",
          "cn_2_control_mode": "Balanced",
          "cn_2_loopback_mode": false,
          "cn_3_overwrite_frames": true,
          "cn_3_vid_path": "",
          "cn_3_mask_vid_path": "",
          "cn_3_enabled": false,
          "cn_3_low_vram": false,
          "cn_3_pixel_perfect": false,
          "cn_3_module": "none",
          "cn_3_model": "None",
          "cn_3_weight": "0:(1)",
          "cn_3_guidance_start": "0:(0.0)",
          "cn_3_guidance_end": "0:(1.0)",
          "cn_3_processor_res": 64,
          "cn_3_threshold_a": 64,
          "cn_3_threshold_b": 64,
          "cn_3_resize_mode": "Inner Fit (Scale to Fit)",
          "cn_3_control_mode": "Balanced",
          "cn_3_loopback_mode": false,
          "cn_4_overwrite_frames": true,
          "cn_4_vid_path": "",
          "cn_4_mask_vid_path": "",
          "cn_4_enabled": false,
          "cn_4_low_vram": false,
          "cn_4_pixel_perfect": false,
          "cn_4_module": "none",
          "cn_4_model": "None",
          "cn_4_weight": "0:(1)",
          "cn_4_guidance_start": "0:(0.0)",
          "cn_4_guidance_end": "0:(1.0)",
          "cn_4_processor_res": 64,
          "cn_4_threshold_a": 64,
          "cn_4_threshold_b": 64,
          "cn_4_resize_mode": "Inner Fit (Scale to Fit)",
          "cn_4_control_mode": "Balanced",
          "cn_4_loopback_mode": false,
          "cn_5_overwrite_frames": true,
          "cn_5_vid_path": "",
          "cn_5_mask_vid_path": "",
          "cn_5_enabled": false,
          "cn_5_low_vram": false,
          "cn_5_pixel_perfect": false,
          "cn_5_module": "none",
          "cn_5_model": "None",
          "cn_5_weight": "0:(1)",
          "cn_5_guidance_start": "0:(0.0)",
          "cn_5_guidance_end": "0:(1.0)",
          "cn_5_processor_res": 64,
          "cn_5_threshold_a": 64,
          "cn_5_threshold_b": 64,
          "cn_5_resize_mode": "Inner Fit (Scale to Fit)",
          "cn_5_control_mode": "Balanced",
          "cn_5_loopback_mode": false,
          "skip_video_creation": false,
          "make_gif": false,
          "delete_imgs": false,
          "delete_input_frames": false,
          "add_soundtrack": "None",
          "soundtrack_path": "https://deforum.github.io/a1/A1.mp3",
          "r_upscale_video": false,
          "r_upscale_factor": "x2",
          "r_upscale_model": "realesr-animevideov3",
          "r_upscale_keep_imgs": true,
          "store_frames_in_ram": false,
          "frame_interpolation_engine": "None",
          "frame_interpolation_x_amount": 2,
          "frame_interpolation_slow_mo_enabled": false,
          "frame_interpolation_slow_mo_amount": 2,
          "frame_interpolation_keep_imgs": true,
          "frame_interpolation_use_upscaled": false,
          "sd_model_name": "juggernautXL_v9Rundiffusionphoto2.safetensors",
          "sd_model_hash": "799b5005",
          "deforum_git_commit_id": "32242685"
          // The rest of your settings remain unchanged
        },
      };

      // Proceed with the fetch call to generate the batch
      const response = await fetch("http://127.0.0.1:7860/deforum_api/batches", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifiedParameters)
      });

      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      return {
        message: "Batch generation initiated. Check console for response details.",
        info: "Operation completed successfully!"
      };
    } catch (error) {
      console.error('Error in Bundestag:', error);
      throw error;
    }
  }

  async generateImage(dynamicParameters) {

    const imageConfig = Bundestag.getImageConfig();

    const staticParameters = {
      // n_iter: 1,
      // batch_size: 1,
    };

    // Merge dynamic and static parameters
    const parameters = {
      ...dynamicParameters,
      ...staticParameters,
      ...imageConfig,
    };

    try {
      const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parameters, // Spread the parameters object here
        })
      });

      const jsonResponse = await response.json();
      const base64ImageData = jsonResponse.images[0];
      const imageData = Buffer.from(base64ImageData, 'base64');
      const timestamp = Date.now();
      const imageName = `image_${timestamp}.png`;
      const outputPath = path.join(this.outputDir, imageName);

      fs.writeFileSync(outputPath, imageData);
      console.log(`Image saved at: ${outputPath}`);
      const imageUrl = `/output/txt2img/${imageName}`;
      
      return {
        imageUrl,
        info: "Image generated and saved successfully!"
      };
    } catch (error) {
      console.error('Error in ImageGenerator:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }
}


export default Bundestag;

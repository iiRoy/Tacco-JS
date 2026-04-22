/*
 * StackBlur.js - A fast, almost Gaussian blur for HTML Canvas.
 *
 * This file implements the StackBlur algorithm, optimized for performance
 * on canvas elements. It supports blurring both RGBA and RGB image data.
 *
 * Version: 0.5
 * Author:  Mario Klingemann
 * Contact: mario@quasimondo.com
 * Website: http://www.quasimondo.com/StackBlurForCanvas
 * Twitter: @quasimondo
 *
 * Support the author by donating via PayPal (mario@quasimondo.de)
 * or Flattr (https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript).
 *
 * Copyright (c) 2010 Mario Klingemann. All rights reserved.
 *
 * License (MIT License):
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Pre-calculated multiplication table for blur radius values.
// This table helps optimize the blurring process by providing
// precomputed multipliers based on the blur radius.
var mul_table = [
	512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
	454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
	482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
	437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
	497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
	320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
	446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
	329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
	505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
	399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
	324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
	268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
	451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
	385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
	332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
	289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
];

// Pre-calculated shift table for blur radius values.
// This table provides shift amounts for optimized division operations.
var shg_table = [
	9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
	17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
	19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
	20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
	21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
	21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
	22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
	22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
	23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
	23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
	23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
	23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
	24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
	24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
	24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
	24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
];

/**
 * Applies a stack blur effect to an image element and renders it on a canvas.
 *
 * @param {string} imageID         The ID of the image element to blur.
 * @param {string} canvasID        The ID of the canvas element to draw on.
 * @param {number} radius          The blur radius (non-negative integer).
 * @param {boolean} blurAlphaChannel If true, the alpha channel will also be blurred.
 */
function stackBlurImage(imageID, canvasID, radius, blurAlphaChannel) {
	// Get the source image element by its ID.
	var img = document.getElementById(imageID);

	// Retrieve natural dimensions of the image.
	var w = img.naturalWidth;
	var h = img.naturalHeight;

	// Get the target canvas element by its ID.
	var canvas = document.getElementById(canvasID);

	// Set canvas dimensions to match the image.
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;

	// Get the 2D rendering context for the canvas.
	var context = canvas.getContext("2d");

	// Clear the canvas before drawing.
	context.clearRect(0, 0, w, h);

	// Draw the original image onto the canvas.
	context.drawImage(img, 0, 0);

	// If radius is not a number or is less than 1, no blur is applied.
	if (isNaN(radius) || radius < 1) {
		return;
	}

	// Determine which blur function to call based on `blurAlphaChannel`.
	if (blurAlphaChannel) {
		// Blur with alpha channel consideration.
		stackBlurCanvasRGBA(canvasID, 0, 0, w, h, radius);
	} else {
		// Blur without alpha channel (only RGB).
		stackBlurCanvasRGB(canvasID, 0, 0, w, h, radius);
	}
}

/**
 * Applies a stack blur effect to RGBA image data on a canvas.
 *
 * @param {string} id      The ID of the canvas element.
 * @param {number} top_x   The X coordinate of the top-left corner of the blur area.
 * @param {number} top_y   The Y coordinate of the top-left corner of the blur area.
 * @param {number} width   The width of the blur area.
 * @param {number} height  The height of the blur area.
 * @param {number} radius  The blur radius (non-negative integer).
 */
function stackBlurCanvasRGBA(id, top_x, top_y, width, height, radius) {
	// Validate the blur radius. If invalid, exit.
	if (isNaN(radius) || radius < 1) {
		return;
	}

	// Ensure radius is an integer.
	radius |= 0;

	// Obtain the canvas element and its 2D rendering context.
	var canvas = document.getElementById(id);
	var context = canvas.getContext("2d");
	var imageData; // Variable to store image data.

	// Attempt to get image data. This block handles potential security errors
	// when trying to read pixel data from a canvas that contains images
	// from different origins (cross-origin security restrictions).
	try {
		try {
			// Standard way to get image data.
			imageData = context.getImageData(top_x, top_y, width, height);
		} catch (e) {
			// This catch block attempts to handle security errors,
			// particularly for local files in some browser environments
			// (e.g., Firefox with specific privileges).
			//
			// NOTE: This part is primarily relevant for working with local files.
			// For web-hosted images, cross-origin security headers (CORS) are
			// typically managed on the server side. If you're certain you won't
			// deal with local files or cross-origin issues without CORS,
			// this inner try/catch block could potentially be removed.
			try {
				// Attempt to enable UniversalBrowserRead privilege (Firefox specific).
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {
				// If local access still fails, alert the user and throw an error.
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return; // Exit the function.
			}
		}
	} catch (e) {
		// General error handler for image data access.
		alert("Cannot access image");
		throw new Error("unable to access image data: " + e);
	}

	// Extract the pixel data array (Uint8ClampedArray).
	var pixels = imageData.data;

	// Declare various loop and calculation variables.
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
		r_out_sum, g_out_sum, b_out_sum, a_out_sum,
		r_in_sum, g_in_sum, b_in_sum, a_in_sum,
		pr, pg, pb, pa, rbs;

	// Pre-calculate constants for efficiency.
	var div = radius + radius + 1; // Divisor for averaging.
	var w4 = width << 2; // Width multiplied by 4 (for RGBA).
	var widthMinus1 = width - 1; // Width minus one for boundary checks.
	var heightMinus1 = height - 1; // Height minus one for boundary checks.
	var radiusPlus1 = radius + 1; // Radius plus one.
	// Sum factor used in initial sum calculation.
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	// Initialize the blur stack structure.
	// This creates a circular linked list of BlurStack objects.
	var stackStart = new BlurStack();
	var stack = stackStart;

	// Populate the blur stack with `div` elements.
	for (i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i == radiusPlus1) {
			var stackEnd = stack; // Mark the end of the initial radius section.
		}
	}

	stack.next = stackStart; // Complete the circular link.
	var stackIn = null;
	var stackOut = null;

	// Initialize pixel index offsets.
	yw = yi = 0;

	// Retrieve pre-calculated multipliers for the current radius.
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	// --- Horizontal Pass ---
	// Iterate over each row of the image.
	for (y = 0; y < height; y++) {
		// Reset sums for each row.
		r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

		// Initialize out-sums and current pixel values for the first pixel in the row.
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
		a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

		// Initialize total sums with the first pixel, weighted by sumFactor.
		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;
		a_sum += sumFactor * pa;

		stack = stackStart; // Reset stack pointer.

		// Fill the blur stack with the initial pixel's values.
		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack.a = pa;
			stack = stack.next;
		}

		// Pre-calculate sums for the initial blur window.
		for (i = 1; i < radiusPlus1; i++) {
			// Determine pixel index, clamping to width-1.
			p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);

			// Add weighted pixel values to total sums and store in stack.
			r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
			b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
			a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;

			// Add pixel values to in-sums.
			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;
			a_in_sum += pa;

			stack = stack.next; // Move to the next stack element.
		}

		stackIn = stackStart; // Pointer to the element entering the window.
		stackOut = stackEnd; // Pointer to the element leaving the window.

		// Iterate through each pixel in the row to apply the blur.
		for (x = 0; x < width; x++) {
			// Calculate blurred alpha component and write to pixel data.
			pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;

			// If alpha is not zero, calculate and write RGB values.
			if (pa != 0) {
				pa = 255 / pa; // Pre-calculate for alpha blending.
				pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
				pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
				pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
			} else {
				// If alpha is zero, set RGB to zero.
				pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
			}

			// Subtract the 'out' sums from the total sums.
			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;
			a_sum -= a_out_sum;

			// Subtract the 'out' stack element's values from out-sums.
			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;
			a_out_sum -= stackIn.a;

			// Calculate the index of the new pixel entering the blur window.
			// Clamps to widthMinus1 to handle edges.
			p = (yw + (((p = x + radius + 1) < widthMinus1 ? p : widthMinus1))) << 2;

			// Add the new pixel's values to in-sums and store them in the stack.
			r_in_sum += (stackIn.r = pixels[p]);
			g_in_sum += (stackIn.g = pixels[p + 1]);
			b_in_sum += (stackIn.b = pixels[p + 2]);
			a_in_sum += (stackIn.a = pixels[p + 3]);

			// Add the 'in' sums to the total sums.
			r_sum += r_in_sum;
			g_sum += g_in_sum;
			b_sum += b_in_sum;
			a_sum += a_in_sum;

			stackIn = stackIn.next; // Move stackIn pointer.

			// Add the 'out' stack element's values to out-sums.
			r_out_sum += (pr = stackOut.r);
			g_out_sum += (pg = stackOut.g);
			b_out_sum += (pb = stackOut.b);
			a_out_sum += (pa = stackOut.a);

			// Subtract the 'out' element's values from in-sums.
			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;
			a_in_sum -= pa;

			stackOut = stackOut.next; // Move stackOut pointer.

			yi += 4; // Move to the next pixel in the current row.
		}
		yw += width; // Move to the start of the next row.
	}

	// --- Vertical Pass ---
	// Iterate over each column of the image.
	for (x = 0; x < width; x++) {
		// Reset sums for each column.
		g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

		yi = x << 2; // Initial pixel index for the column.

		// Initialize out-sums and current pixel values for the first pixel in the column.
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
		a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

		// Initialize total sums with the first pixel, weighted by sumFactor.
		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;
		a_sum += sumFactor * pa;

		stack = stackStart; // Reset stack pointer.

		// Fill the blur stack with the initial pixel's values.
		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack.a = pa;
			stack = stack.next;
		}

		yp = width; // Offset for the next row.

		// Pre-calculate sums for the initial blur window in the column.
		for (i = 1; i <= radius; i++) {
			yi = (yp + x) << 2; // Calculate pixel index.

			// Add weighted pixel values to total sums and store in stack.
			r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
			b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
			a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;

			// Add pixel values to in-sums.
			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;
			a_in_sum += pa;

			stack = stack.next; // Move to the next stack element.

			// Update row offset for the next iteration, if not at the bottom edge.
			if (i < heightMinus1) {
				yp += width;
			}
		}

		yi = x; // Reset yi for vertical pass.
		stackIn = stackStart; // Pointer to the element entering the window.
		stackOut = stackEnd; // Pointer to the element leaving the window.

		// Iterate through each pixel in the column to apply the blur.
		for (y = 0; y < height; y++) {
			p = yi << 2; // Calculate actual pixel index in the data array.

			// Calculate blurred alpha component and write to pixel data.
			pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;

			// If alpha is greater than zero, calculate and write RGB values.
			if (pa > 0) {
				pa = 255 / pa; // Pre-calculate for alpha blending.
				pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
				pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
				pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
			} else {
				// If alpha is zero, set RGB to zero.
				pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
			}

			// Subtract the 'out' sums from the total sums.
			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;
			a_sum -= a_out_sum;

			// Subtract the 'out' stack element's values from out-sums.
			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;
			a_out_sum -= stackIn.a;

			// Calculate the index of the new pixel entering the blur window.
			// Clamps to heightMinus1 for boundary checks.
			p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

			// Add the new pixel's values to in-sums and store them in the stack.
			r_sum += (r_in_sum += (stackIn.r = pixels[p]));
			g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
			b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
			a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));

			stackIn = stackIn.next; // Move stackIn pointer.

			// Add the 'out' stack element's values to out-sums.
			r_out_sum += (pr = stackOut.r);
			g_out_sum += (pg = stackOut.g);
			b_out_sum += (pb = stackOut.b);
			a_out_sum += (pa = stackOut.a);

			// Subtract the 'out' element's values from in-sums.
			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;
			a_in_sum -= pa;

			stackOut = stackOut.next; // Move stackOut pointer.

			yi += width; // Move to the next row in the current column.
		}
	}

	// Put the modified image data back onto the canvas.
	context.putImageData(imageData, top_x, top_y);
}

/**
 * Applies a stack blur effect to RGB (no alpha) image data on a canvas.
 * This function is similar to `stackBlurCanvasRGBA` but ignores the alpha channel.
 *
 * @param {string} id      The ID of the canvas element.
 * @param {number} top_x   The X coordinate of the top-left corner of the blur area.
 * @param {number} top_y   The Y coordinate of the top-left corner of the blur area.
 * @param {number} width   The width of the blur area.
 * @param {number} height  The height of the blur area.
 * @param {number} radius  The blur radius (non-negative integer).
 */
function stackBlurCanvasRGB(id, top_x, top_y, width, height, radius) {
	// Validate the blur radius. If invalid, exit.
	if (isNaN(radius) || radius < 1) {
		return;
	}

	// Ensure radius is an integer.
	radius |= 0;

	// Obtain the canvas element and its 2D rendering context.
	var canvas = document.getElementById(id);
	var context = canvas.getContext("2d");
	var imageData; // Variable to store image data.

	// Attempt to get image data, handling potential security errors.
	try {
		try {
			// Standard way to get image data.
			imageData = context.getImageData(top_x, top_y, width, height);
		} catch (e) {
			// This block handles potential errors when working with local files.
			// Similar to the RGBA function, this part might be optional
			// depending on the deployment environment and security policies.
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		}
	} catch (e) {
		alert("Cannot access image");
		throw new Error("unable to access image data: " + e);
	}

	// Extract the pixel data array.
	var pixels = imageData.data;

	// Declare various loop and calculation variables (no alpha channels here).
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
		r_out_sum, g_out_sum, b_out_sum,
		r_in_sum, g_in_sum, b_in_sum,
		pr, pg, pb, rbs;

	// Pre-calculate constants for efficiency.
	var div = radius + radius + 1; // Divisor for averaging.
	var w4 = width << 2; // Width multiplied by 4 (for RGBA, even though we ignore alpha,
	// the data structure is still RGBA).
	var widthMinus1 = width - 1; // Width minus one for boundary checks.
	var heightMinus1 = height - 1; // Height minus one for boundary checks.
	var radiusPlus1 = radius + 1; // Radius plus one.
	// Sum factor used in initial sum calculation.
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	// Initialize the blur stack structure.
	var stackStart = new BlurStack();
	var stack = stackStart;

	// Populate the blur stack.
	for (i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i == radiusPlus1) {
			var stackEnd = stack;
		}
	}
	stack.next = stackStart; // Complete circular link.
	var stackIn = null;
	var stackOut = null;

	// Initialize pixel index offsets.
	yw = yi = 0;

	// Retrieve pre-calculated multipliers for the current radius.
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	// --- Horizontal Pass (RGB only) ---
	// Iterate over each row.
	for (y = 0; y < height; y++) {
		// Reset sums for each row.
		r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

		// Initialize out-sums and current pixel values for the first pixel.
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

		// Initialize total sums.
		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;

		stack = stackStart; // Reset stack pointer.

		// Fill the blur stack with initial pixel values.
		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack = stack.next;
		}

		// Pre-calculate sums for the initial blur window.
		for (i = 1; i < radiusPlus1; i++) {
			// Determine pixel index, clamping to width-1.
			p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);

			// Add weighted pixel values to total sums and store in stack.
			r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
			b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;

			// Add pixel values to in-sums.
			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;

			stack = stack.next; // Move to the next stack element.
		}

		stackIn = stackStart; // Pointer to the element entering the window.
		stackOut = stackEnd; // Pointer to the element leaving the window.

		// Iterate through each pixel in the row to apply the blur.
		for (x = 0; x < width; x++) {
			// Calculate blurred RGB values and write to pixel data.
			pixels[yi] = (r_sum * mul_sum) >> shg_sum;
			pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
			pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;

			// Subtract the 'out' sums from the total sums.
			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;

			// Subtract the 'out' stack element's values from out-sums.
			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;

			// Calculate the index of the new pixel entering the blur window.
			p = (yw + (((p = x + radius + 1) < widthMinus1 ? p : widthMinus1))) << 2;

			// Add the new pixel's values to in-sums and store them in the stack.
			r_in_sum += (stackIn.r = pixels[p]);
			g_in_sum += (stackIn.g = pixels[p + 1]);
			b_in_sum += (stackIn.b = pixels[p + 2]);

			// Add the 'in' sums to the total sums.
			r_sum += r_in_sum;
			g_sum += g_in_sum;
			b_sum += b_in_sum;

			stackIn = stackIn.next; // Move stackIn pointer.

			// Add the 'out' stack element's values to out-sums.
			r_out_sum += (pr = stackOut.r);
			g_out_sum += (pg = stackOut.g);
			// The original code was cut off here. Assuming it continues similarly to RGBA version.
			// It should correctly update b_out_sum and then in_sum and out_sum for b.
			// Reconstructing the likely missing part based on the RGBA function:
			b_out_sum += (pb = stackOut.b);

			// Subtract the 'out' element's values from in-sums.
			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb; // Corrected: This line was missing in the original snippet.

			stackOut = stackOut.next; // Move stackOut pointer.

			yi += 4; // Move to the next pixel in the current row.
		}
		yw += width; // Move to the start of the next row.
	}

	// --- Vertical Pass (RGB only) ---
	// Iterate over each column.
	for (x = 0; x < width; x++) {
		// Reset sums for each column.
		g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

		yi = x << 2; // Initial pixel index for the column.

		// Initialize out-sums and current pixel values for the first pixel.
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

		// Initialize total sums.
		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;

		stack = stackStart; // Reset stack pointer.

		// Fill the blur stack with initial pixel values.
		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack = stack.next;
		}

		yp = width; // Offset for the next row.

		// Pre-calculate sums for the initial blur window in the column.
		for (i = 1; i <= radius; i++) {
			yi = (yp + x) << 2; // Calculate pixel index.

			// Add weighted pixel values to total sums and store in stack.
			r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
			b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;

			// Add pixel values to in-sums.
			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;

			stack = stack.next; // Move to the next stack element.

			// Update row offset for the next iteration, if not at the bottom edge.
			if (i < heightMinus1) {
				yp += width;
			}
		}

		yi = x; // Reset yi for vertical pass.
		stackIn = stackStart; // Pointer to the element entering the window.
		stackOut = stackEnd; // Pointer to the element leaving the window.

		// Iterate through each pixel in the column to apply the blur.
		for (y = 0; y < height; y++) {
			p = yi << 2; // Calculate actual pixel index.

			// Calculate blurred RGB values and write to pixel data.
			pixels[p] = (r_sum * mul_sum) >> shg_sum;
			pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
			pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;

			// Subtract the 'out' sums from the total sums.
			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;

			// Subtract the 'out' stack element's values from out-sums.
			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;

			// Calculate the index of the new pixel entering the blur window.
			p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

			// Add the new pixel's values to in-sums and store them in the stack.
			r_sum += (r_in_sum += (stackIn.r = pixels[p]));
			g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
			b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));

			stackIn = stackIn.next; // Move stackIn pointer.

			// Add the 'out' stack element's values to out-sums.
			r_out_sum += (pr = stackOut.r);
			g_out_sum += (pg = stackOut.g);
			b_out_sum += (pb = stackOut.b);

			// Subtract the 'out' element's values from in-sums.
			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;

			stackOut = stackOut.next; // Move stackOut pointer.

			yi += width; // Move to the next row in the current column.
		}
	}

	// Put the modified image data back onto the canvas.
	context.putImageData(imageData, top_x, top_y);
}

/**
 * A helper class representing a single element in the blur stack.
 * Each element stores the R, G, B, and A values of a pixel
 * and a reference to the next element in the circular linked list.
 */
function BlurStack() {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null; // Pointer to the next BlurStack object.
}
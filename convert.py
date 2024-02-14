from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
import sys

def adjust_curves(image):
    # This is a simplified version. For more precise control, consider using numpy or OpenCV.
    # Convert to RGB if not already
    image = image.convert("RGB")
    # Enhance the image by reducing the contrast (simulate the fade)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(0.8)
    return image

def dull_highlights(image):
    # This step is a bit more complex and might require direct pixel manipulation
    # For simplicity, we'll just apply a slight overall brightness reduction
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(0.9)
    return image

def add_grain(image, intensity=0.25, monochromatic=True):
    # Generate noise
    np_image = np.array(image)
    if monochromatic:
        noise = np.random.normal(0, intensity * 255, np_image.shape[:2])
        noise = np.repeat(noise[:, :, np.newaxis], 3, axis=2)
    else:
        noise = np.random.normal(0, intensity * 255, np_image.shape)
    noisy_image = np.clip(np_image + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(noisy_image)

def apply_blur(image, radius=2):
    """
    Applies a Gaussian blur to the image.
    :param image: PIL Image object.
    :param radius: The radius of the Gaussian blur. Higher means blurrier.
    :return: Blurred PIL Image object.
    """
    return image.filter(ImageFilter.GaussianBlur(radius))


# # Load the image
# image_path = "your_image_path_here.jpg"  # Update this with your image path
# image = Image.open(image_path)

# # Apply the effects
# image = adjust_curves(image)
# image = dull_highlights(image)
# image = add_grain(image)

# # Save the processed image
# image.save("polaroid_effect_image.jpg")


# Function definitions for adjust_curves, dull_highlights, and add_grain go here

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py source_image_path destination_image_path")
        sys.exit(1)

    source_path = sys.argv[1]
    destination_path = sys.argv[2]

    # Load the image
    image = Image.open(source_path)

    # Apply blur
    image = apply_blur(image, radius=1)  # Feel free to adjust the radius

    # Apply the other effects
    image = adjust_curves(image)
    image = dull_highlights(image)
    image = add_grain(image)

    # Save the processed image
    image.save(destination_path)

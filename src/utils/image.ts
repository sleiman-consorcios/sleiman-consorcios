/**
 * Image processing utilities for resizing and compressing images before upload.
 */

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/jpeg" | "image/webp" | "image/png";
}

/**
 * Resizes and compresses an image file.
 * Returns a dataURL of the optimized image.
 */
export async function resizeImageFile(file: File, options: ResizeOptions = {}): Promise<string> {
  // Se for um arquivo SVG ou GIF, não tentamos redimensionar via canvas para manter animação/vetor
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo original."));
      reader.readAsDataURL(file);
    });
  }


  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    // SVG e GIF já saíram acima; todo o resto é convertido para WebP.
    format = "image/webp"
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to dataURL
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Gets appropriate constraints based on image context (folder)
 */
export function getImageConstraints(folder: string): { maxWidth: number; maxHeight: number } {
  switch (folder) {
    case "logos":
    case "partners":
    case "brand":
      return { maxWidth: 800, maxHeight: 800 };
    case "testimonials":
    case "about":
    case "cardapio":
      return { maxWidth: 1200, maxHeight: 1200 };
    default:
      return { maxWidth: 1920, maxHeight: 1920 };
  }
}

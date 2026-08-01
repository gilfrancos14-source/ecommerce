export const parseImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const parseProductImages = (product) => {
  if (!product) return product;
  return {
    ...product,
    images: parseImages(product.images),
  };
};
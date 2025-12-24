'use client';

import React, { useState } from 'react';

const ProductImage = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 rounded-lg shadow-2xl"
            onError={() => setImgSrc('https://via.placeholder.com/800x600?text=No+Image')}
        />
    );
};

export default ProductImage;

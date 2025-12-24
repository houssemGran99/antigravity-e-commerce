'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminProductForm from '../../../../components/AdminProductForm';

export default function EditProductPage() {
    const params = useParams();
    const { id } = params;

    return <AdminProductForm productId={id} />;
}

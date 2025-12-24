import React, { Suspense } from 'react';
import ShopClient from '../../components/ShopClient';

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading Shop...</div>}>
            <ShopClient />
        </Suspense>
    );
}

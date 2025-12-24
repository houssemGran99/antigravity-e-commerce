require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camera_shop');
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await Product.deleteMany({});
        await Brand.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleared existing data');

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Cameras' },
            { name: 'Lenses' },
            { name: 'Drones' },
            { name: 'Accessories' }
        ]);

        const catMap = categories.reduce((acc, cat) => {
            acc[cat.name] = cat._id;
            return acc;
        }, {});

        // Create Brands
        const brands = await Brand.insertMany([
            { name: 'Panasonic', logoUrl: '' },
            { name: 'Canon', logoUrl: '' },
            { name: 'Sony', logoUrl: '' },
            { name: 'Fujifilm', logoUrl: '' },
            { name: 'Nikon', logoUrl: '' },
            { name: 'DJI', logoUrl: '' },
            { name: 'GoPro', logoUrl: '' },
            { name: 'Sigma', logoUrl: '' }
        ]);

        const brandMap = brands.reduce((acc, brand) => {
            acc[brand.name] = brand._id;
            return acc;
        }, {});

        // Create Products
        const products = [
            // Cameras
            {
                name: "Lumix S5IIX",
                brand: brandMap['Panasonic'],
                category: catMap['Cameras'],
                price: 2199,
                description: "A hybrid powerhouse featuring Phase Hybrid AF, advanced video specs, and unlimited 4K 60p recording. Perfect for content creators.",
                imageUrl: "https://m.media-amazon.com/images/I/714e7vyoWGL.jpg",
                specs: { resolution: "24.2MP", video: "6K 30p / 4K 60p", sensor: "Full-Frame CMOS" },
                inStock: 15
            },
            {
                name: "EOS R6 Mark II",
                brand: brandMap['Canon'],
                category: catMap['Cameras'],
                price: 2499,
                description: "Versatile mirrorless camera with high-speed shooting up to 40fps and impressive low-light performance.",
                imageUrl: "https://m.media-amazon.com/images/I/61s5kI0U4cL._AC_UF894,1000_QL80_.jpg",
                specs: { resolution: "24.2MP", video: "4K 60p", sensor: "Full-Frame CMOS" },
                inStock: 8
            },
            {
                name: "Alpha 7 IV",
                brand: brandMap['Sony'],
                category: catMap['Cameras'],
                price: 2498,
                description: "The new baseline for full-frame mirrorless, offering excellent image quality and AI-based real-time autofocus.",
                imageUrl: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2071&auto=format&fit=crop",
                specs: { resolution: "33MP", video: "4K 60p", sensor: "Full-Frame Exmor R" },
                inStock: 10
            },
            {
                name: "X-T5",
                brand: brandMap['Fujifilm'],
                category: catMap['Cameras'],
                price: 1699,
                description: "Classic dial-based design meets cutting-edge technology with valid 40MP APS-C sensor.",
                imageUrl: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=2070&auto=format&fit=crop",
                specs: { resolution: "40MP", video: "6.2K 30p", sensor: "APS-C X-Trans" },
                inStock: 20
            },
            {
                name: "Z f",
                brand: brandMap['Nikon'],
                category: catMap['Cameras'],
                price: 1999,
                description: "Iconic retro design paired with advanced full-frame performance and EXPEED 7 processing.",
                imageUrl: "https://m.media-amazon.com/images/I/71UyMxdXNgL.jpg",
                specs: { resolution: "24.5MP", video: "4K 60p", sensor: "Full-Frame CMOS" },
                inStock: 12
            },
            // Drones
            {
                name: "Mavic 3 Pro",
                brand: brandMap['DJI'],
                category: catMap['Drones'],
                price: 2199,
                description: "Triple-camera system with Hasselblad main camera for cinematic aerial photography.",
                imageUrl: "https://m.media-amazon.com/images/I/6189PdK3wKL._AC_UF350,350_QL80_.jpg",
                specs: { resolution: "20MP", video: "5.1K 50p", sensor: "4/3 CMOS" },
                inStock: 5
            },
            // Action Cameras
            {
                name: "HERO12 Black",
                brand: brandMap['GoPro'],
                category: catMap['Cameras'],
                price: 399,
                description: "Unbelievable image quality, even better HyperSmooth video stabilization and a huge boost in battery life.",
                imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1000&auto=format&fit=crop",
                specs: { resolution: "27MP", video: "5.3K 60p", sensor: "1/1.9 CMOS" },
                inStock: 25
            },
            // Lenses
            {
                name: "24-70mm f/2.8 DG DN Art",
                brand: brandMap['Sigma'],
                category: catMap['Lenses'],
                price: 1099,
                description: "Flagship standard zoom lens designed for unmatched expressive performance.",
                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3d0KdaKLyyE8deSYrsnA3-Ajs9SH1I4u9LA&s",
                specs: { resolution: "N/A", video: "N/A", sensor: "Full-Frame" },
                inStock: 8
            },
            {
                name: "FE 50mm f/1.2 GM",
                brand: brandMap['Sony'],
                category: catMap['Lenses'],
                price: 1998,
                description: "Compact F1.2 prime lens with breathtaking G Master resolution and bokeh.",
                imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1000&auto=format&fit=crop",
                specs: { resolution: "N/A", video: "N/A", sensor: "Full-Frame" },
                inStock: 6
            }
        ];

        await Product.insertMany(products);
        console.log('Seed Data Imported Successfully!');

        process.exit();
    } catch (error) {
        console.error('Error with seeding:', error);
        process.exit(1);
    }
};

seedData();

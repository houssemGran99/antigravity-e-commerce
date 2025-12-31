async function test() {
    try {
        const [catRes, brandRes] = await Promise.all([
            fetch('http://localhost:5000/api/categories'),
            fetch('http://localhost:5000/api/brands')
        ]);

        console.log('Categories Status:', catRes.status);
        console.log('Categories Body:', (await catRes.text()).substring(0, 50));

        console.log('Brands Status:', brandRes.status);
        console.log('Brands Body:', (await brandRes.text()).substring(0, 50));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();

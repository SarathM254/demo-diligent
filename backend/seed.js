import mongoose from 'mongoose';
import Brand from './src/models/Brand.js';
import Category from './src/models/Category.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/demo';

const mockCategories = [
    { 
      id: "cat_1", 
      name: "Gold Flake Family", 
      brands: [
        { id: "b_1", name: "Gold Flake Kings", price: 152.50 }, 
        { id: "b_2", name: "Gold Flake Lights", price: 152.50 }, 
        { id: "b_3", name: "Gold Flake Super Star", price: 110.00 },
        { id: "b_4", name: "Gold Flake Honeydew", price: 112.00 },
        { id: "b_5", name: "Gold Flake Indie Mint", price: 120.00 }
      ] 
    },
    { 
      id: "cat_2", 
      name: "Classic Premium Segment", 
      brands: [
        { id: "b_6", name: "Classic Regular", price: 185.00 }, 
        { id: "b_7", name: "Classic Milds", price: 185.00 },
        { id: "b_8", name: "Classic Ultra Milds", price: 190.00 },
        { id: "b_9", name: "Classic Connect", price: 165.00 },
        { id: "b_10", name: "Classic Ice Burst", price: 175.00 }
      ] 
    },
    {
      id: "cat_3",
      name: "Capstan & Bristol Value Lines",
      brands: [
        { id: "b_11", name: "Capstan Filter", price: 85.00 },
        { id: "b_12", name: "Capstan Standard", price: 80.00 },
        { id: "b_13", name: "Bristol Filter", price: 75.00 },
        { id: "b_14", name: "Scissors Filter", price: 70.00 },
        { id: "b_15", name: "Wave Cool Mint", price: 72.50 }
      ]
    },
    {
      id: "cat_4",
      name: "Flake Core Distribution",
      brands: [
        { id: "b_16", name: "Flake Excel", price: 95.00 },
        { id: "b_17", name: "Flake Liberty", price: 92.00 },
        { id: "b_18", name: "Flake Premium", price: 95.00 },
        { id: "b_19", name: "Flake Special", price: 90.00 },
        { id: "b_20", name: "Flake Blue Mint", price: 98.00 }
      ]
    },
    {
      id: "cat_5",
      name: "International & Specialized Imports",
      brands: [
        { id: "b_21", name: "Benson & Hedges Lights", price: 220.00 },
        { id: "b_22", name: "Benson & Hedges Special Filter", price: 230.00 },
        { id: "b_23", name: "State Express 555 Kings", price: 250.00 },
        { id: "b_24", name: "Silk Cut Blue", price: 210.00 },
        { id: "b_25", name: "Dunhill Switch", price: 260.00 }
      ]
    }
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    await Category.deleteMany({});
    await Brand.deleteMany({});

    for (const catData of mockCategories) {
        const category = await Category.create({ _id: catData.id, name: catData.name });
        console.log(`Created category: ${category.name}`);

        for (const brandData of catData.brands) {
            await Brand.create({
                _id: brandData.id,
                name: brandData.name,
                code: brandData.id.toUpperCase(), // Generate mock code
                categoryId: category._id,
                wholesalePrice: brandData.price * 0.9, // Generate mock wholesale
                retailPrice: brandData.price,
                inventoryCount: 100 // Seed with some inventory
            });
            console.log(`Created brand: ${brandData.name}`);
        }
    }

    console.log("Seeding complete.");
    mongoose.disconnect();
}

seed().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './src/models/Brand.js';
import { upsertBrand } from './src/controllers/brandController.js';

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/demo');
    console.log('Connected to DB');

    let brand = await Brand.findOne({});
    if (!brand) {
      console.log('No brand found');
      process.exit(1);
    }

    const req = {
      body: {
        id: brand._id.toString(),
        inventoryCount: 88
      }
    };

    const res = {
      status: (code) => ({
        json: (data) => {
          console.log('Status:', code);
          console.log('Response:', data);
          if (data.error) console.error('ERROR JSON:', data.error);
          process.exit(code === 200 ? 0 : 1);
        }
      })
    };

    console.log('Calling upsertBrand with:', req.body);
    await upsertBrand(req, res);
    
  } catch (err) {
    console.error('Test script crashed:', err);
    process.exit(1);
  }
};

runTest();

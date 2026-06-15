import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './src/models/Brand.js';
import Bill from './src/models/Bill.js';
import User from './src/models/User.js';
import AppSettings from './src/models/AppSettings.js';
import { updateBillStatusByOwner } from './src/controllers/billController.js';

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/demo');
    console.log('Connected to DB');

    // 1. Get a brand and set its inventory to 100
    let brand = await Brand.findOne({});
    if (!brand) {
      console.log('No brand found');
      process.exit(1);
    }
    await Brand.findByIdAndUpdate(brand._id, { inventoryCount: 100 });
    console.log(`Brand ${brand.name} initialized with 100 stock.`);

    // 2. Create a dummy bill with 5 quantity of this brand
    let salesman = await User.findOne({ role: 'salesman' });
    let bill = new Bill({
      salesmanId: salesman._id,
      billingDate: '2099-01-01',
      status: 'submitted',
      items: [{
        brandId: brand._id,
        brandName: brand.name,
        quantity: 5,
        rateSnapShot: brand.retailPrice
      }],
      totalBillValue: 5 * brand.retailPrice
    });
    await bill.save();
    console.log(`Created dummy bill ${bill._id} with 5 stock.`);

    // 3. Mock Express Request for updateBillStatusByOwner
    const req = {
      params: { id: bill._id.toString() },
      body: {
        status: 'delivered',
        items: bill.items // Sending identical items
      }
    };

    const res = {
      status: (code) => ({
        json: async (data) => {
          console.log('Status:', code);
          if (data.error) console.log('Error:', data.error);
          
          // 4. Verify inventory
          const updatedBrand = await Brand.findById(brand._id);
          console.log(`Updated inventory count for ${brand.name}: ${updatedBrand.inventoryCount}`);
          if (updatedBrand.inventoryCount === 95) {
             console.log('SUCCESS: Inventory synced correctly!');
          } else {
             console.log('FAIL: Inventory is not 95.');
          }
          
          process.exit(0);
        }
      })
    };

    console.log('Calling updateBillStatusByOwner...');
    await updateBillStatusByOwner(req, res);
    
  } catch (err) {
    console.error('Test script crashed:', err);
    process.exit(1);
  }
};

runTest();

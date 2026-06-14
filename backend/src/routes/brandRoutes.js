import express from 'express';
import multer from 'multer';
import { getBrands, upsertBrand, bulkAddInventory, parseInvoiceWithAI } from '../controllers/brandController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getBrands);
router.post('/upsert', upsertBrand);
router.post('/bulk-add', bulkAddInventory);
router.post('/parse-invoice', upload.single('invoice'), parseInvoiceWithAI);

export default router;

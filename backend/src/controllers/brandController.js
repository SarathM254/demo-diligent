import Brand from '../models/Brand.js';
import { GoogleGenAI } from '@google/genai';

export const getBrands = async (req, res) => {
  try {
    // Populates the category details automatically so we can see the category name
    const brands = await Brand.find({}).populate('categoryId', 'name').sort({ createdAt: 1 });
    return res.status(200).json(brands);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const upsertBrand = async (req, res) => {
  try {
    const { id, name, code, categoryId, wholesalePrice, retailPrice, inventoryCount } = req.body;
    
    const updateData = { 
      name, 
      code: code ? code.toUpperCase().trim() : undefined, 
      categoryId, 
      wholesalePrice: wholesalePrice !== undefined ? Number(wholesalePrice) : undefined, 
      retailPrice: retailPrice !== undefined ? Number(retailPrice) : undefined,
      inventoryCount: inventoryCount !== undefined ? Number(inventoryCount) : undefined
    };

    // Remove undefined properties so we don't accidentally blank out inventory on basic edits
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (id) {
      const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      return res.status(200).json(brand);
    } else {
      // Generate a string _id from the name to satisfy the schema requirements
      updateData._id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const newBrand = new Brand(updateData);
      await newBrand.save();
      return res.status(201).json(newBrand);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const bulkAddInventory = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array required for bulk add." });
    }

    const updatedBrands = [];
    for (const item of items) {
      if (!item.brandId || !item.quantity) continue;
      const brand = await Brand.findByIdAndUpdate(
        item.brandId,
        { $inc: { inventoryCount: Number(item.quantity) } },
        { new: true }
      );
      if (brand) updatedBrands.push(brand);
    }

    return res.status(200).json({ message: "Inventory successfully updated", updatedBrands });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const parseInvoiceWithAI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No invoice file uploaded." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const brands = await Brand.find({}).select('_id name');

    const brandListStr = brands.map(b => `{ "id": "${b._id}", "name": "${b.name}" }`).join(',\n');

    const promptText = `
You are an expert data extraction AI. Read the attached invoice document and extract all product items and their received quantities.
We have a specific database of active brands. Your job is to match the item names on the invoice to the closest existing brand in our database.

Here are the VALID database brands:
[
${brandListStr}
]

CRITICAL RULES:
1. ONLY return a raw JSON array. DO NOT wrap it in markdown \`\`\`json blocks. Just the array.
2. For each extracted item, try to find the closest matching name from the VALID database brands list.
3. If you find a good match, return an object like: { "brandId": "the-valid-id", "brandName": "the-valid-name", "quantity": number }
4. If an item on the invoice absolutely does not match anything in our valid list, ignore it.
5. "quantity" must be a number representing the amount delivered.

Example Output:
[
  { "brandId": "60d5ec...", "brandName": "Gold Flake King", "quantity": 10 },
  { "brandId": "60d5ed...", "brandName": "Classic Milds", "quantity": 5 }
]
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: req.file.buffer.toString("base64"),
                            mimeType: req.file.mimetype
                        }
                    },
                    {
                        text: promptText
                    }
                ]
            }
        ]
    });

    let jsonString = response.text || "[]";
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData = [];
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("AI returned invalid JSON:", jsonString);
      return res.status(500).json({ error: "AI failed to format output as JSON." });
    }

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process invoice via AI." });
  }
};

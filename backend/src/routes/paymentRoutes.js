import express from "express";
import { submitDailyPayment, verifyPaymentByOwner, getPendingPaymentsForAdmin } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", submitDailyPayment);
router.patch("/:id/verify", verifyPaymentByOwner);
router.get("/pending", getPendingPaymentsForAdmin);

export default router;

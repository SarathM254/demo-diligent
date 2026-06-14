import Payment from "../models/Payment.js";
import User from "../models/User.js";
import LedgerTransaction from "../models/LedgerTransaction.js";
import AppSettings from "../models/AppSettings.js";

export const submitDailyPayment = async (req, res) => {
  try {
    let { cashBreakdown, phonePeAmount, salesmanId } = req.body;

    const config = await AppSettings.findOne({ key: "global_config" });
    const paymentDate = config ? config.operationalDate : new Date().toISOString().split('T')[0];

    const existingPayment = await Payment.findOne({ salesmanId, paymentDate });
    if (existingPayment && existingPayment.status === "verified") {
      return res.status(400).json({ error: "Payment configurations locked for active tracking date index." });
    }

    let payment = await Payment.findOne({ salesmanId, paymentDate });
    if (!payment) payment = new Payment({ salesmanId, paymentDate });

    payment.cashBreakdown = cashBreakdown || { 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0 };
    payment.phonePeAmount = Number(phonePeAmount || 0);
    payment.status = "unverified";

    await payment.save();
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPaymentByOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment verification profile missing." });
    if (payment.status === "verified") return res.status(400).json({ error: "Target settlement profile verified." });

    payment.status = "verified";
    await payment.save();

    const salesman = await User.findById(payment.salesmanId);
    if (salesman) {
      const oldBF = salesman.broughtForwardDebt;
      salesman.broughtForwardDebt -= payment.totalPayment;
      await salesman.save();

      await LedgerTransaction.create({
        salesmanId: salesman._id,
        type: "cash_payment_clearance",
        amount: payment.totalPayment,
        description: `Cash handover verification finalized for collection date: ${payment.paymentDate}`,
        previousBF: oldBF,
        newBF: salesman.broughtForwardDebt
      });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPendingPaymentsForAdmin = async (req, res) => {
  try {
    const sheets = await Payment.find({ status: 'unverified' }).populate("salesmanId", "name");
    return res.status(200).json(sheets.map(p => ({
      _id: p._id,
      salesmanName: p.salesmanId ? p.salesmanId.name : 'Unknown Profile',
      totalPayment: p.totalPayment,
      status: p.status,
      totalHandCash: p.totalHandCash,
      phonePeAmount: p.phonePeAmount,
      cashBreakdown: p.cashBreakdown
    })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

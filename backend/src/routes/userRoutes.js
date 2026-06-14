import express from "express";
import { getAllSalesmen, adjustLedgerBalance, getAllOperators, registerUser, getSalesmanStatementHistory, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/salesmen", getAllSalesmen);
router.get("/operators", getAllOperators);
router.get("/statement/:salesmanId", getSalesmanStatementHistory);
router.post("/register", registerUser);
router.patch("/adjust-balance", adjustLedgerBalance); 
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

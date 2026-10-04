import { Router } from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./admin.controller.js";

import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.use(verifyToken);
router.use(allowRoles("admin"));

router.get("/users", getUsers);
router.get("/users/:id", getUser);

router.post("/users", createUser);

router.patch("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

export default router;
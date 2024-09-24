import { Router } from "express";
import { loginController, registerController } from "~/controllers/user.controllers";

const usersRouter = Router();

usersRouter.post("/register", registerController);

usersRouter.post("/login", loginController);

export default usersRouter;
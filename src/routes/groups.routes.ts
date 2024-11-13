import { Router } from "express";
import { createGroupController } from "~/controllers/group.controller";
import { createGroupValidation } from "~/middlewares/groups.middleware";
import { accessTokenValidation } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const groupsRouter = Router();

/*
Description: This route is used to create a new group
Path: /group
Method: POST
Body: { group_name: String, members: [String], creator: String }
*/
groupsRouter.post('/', accessTokenValidation, createGroupValidation, wrapRequestHandler(createGroupController));

export default groupsRouter;